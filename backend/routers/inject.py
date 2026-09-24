"""Router POST /inject/{event}."""

from __future__ import annotations

from typing import Final

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from models.place import PLACES_BY_ID
from schemas.responses import FireResponse
from state import lock, net, now_iso

router = APIRouter(tags=["inject"])

#: Mapping événement → place cible. FIGÉ par contrat v3.1.
#: Les urgences N/S partagent P13_NS, W/E partagent P13_EO (2 états logiques).
INJECT_TARGET: Final[dict[str, str]] = {
    "voiture_ns":     "P7",
    "voiture_ns_sud": "P16",
    "voiture_eo":     "P8",
    "voiture_eo_est": "P17",
    "pieton":         "P9",
    "urgence_n":      "P13_NS",
    "urgence_s":      "P13_NS",
    "urgence_w":      "P13_EO",
    "urgence_e":      "P13_EO",
}


def _pedestrian_refusal_reason() -> str | None:
    """Refus uniquement si un appel est déjà en attente (contrat v3.3, Q1).

    Les vérifications sur l'état des feux sont désormais assurées par les
    inhibiteurs de T9 : le piéton attend en P9 jusqu'au prochain cycle
    orange, puis T9 est firée automatiquement par le scheduler (Q4).
    """
    if net.tokens("P9") >= 1:
        return "Demande piéton refusée : appel déjà en attente."
    return None

def _generic_refusal_reason(place_id: str) -> str:
    capacity = PLACES_BY_ID[place_id].capacity
    return (
        f"Injection refusée : place {place_id} pleine "
        f"({net.tokens(place_id)}/{capacity})."
    )


@router.post("/inject/{event}")
async def inject_event(event: str):
    """Injecte un événement dans le réseau.

    Codes retour :
      - 200 : succès (FireResponse, fired_transition="inject:<event>")
      - 409 : place pleine ou piéton refusé (ErrorResponse, error="conflict")
      - 422 : événement inconnu (ErrorResponse, error="validation")
    """
    place_id = INJECT_TARGET.get(event)
    if place_id is None:
        return JSONResponse(
            status_code=422,
            content={
                "error": "validation",
                "reason": f"Événement inconnu : {event}",
            },
        )

    async with lock:
        # Cas spécial : le piéton a des règles de refus plus riches (contrat v3.1).
        if event == "pieton":
            reason = _pedestrian_refusal_reason()
            if reason is not None:
                return JSONResponse(
                    status_code=409,
                    content={"error": "conflict", "reason": reason},
                )
        else:
            capacity = PLACES_BY_ID[place_id].capacity
            if net.tokens(place_id) >= capacity:
                return JSONResponse(
                    status_code=409,
                    content={
                        "error": "conflict",
                        "reason": _generic_refusal_reason(place_id),
                    },
                )

        net.add_tokens(place_id, 1)
        net.step_count += 1

        return FireResponse(
            fired_transition=f"inject:{event}",
            marking_vector=net.marking_vector(),
            timestamp=now_iso(),
        )