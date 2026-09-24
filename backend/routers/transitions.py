"""Router GET /enabled-transitions et POST /fire/{transition_id}."""

from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from core.engine import (
    TransitionNotEnabled,
    TransitionNotFound,
    enabled_transitions,
    fire,
)
from schemas.responses import EnabledTransitionsResponse, FireResponse
from state import lock, net, now_iso

router = APIRouter(tags=["transitions"])


@router.get(
    "/enabled-transitions",
    response_model=EnabledTransitionsResponse,
)
def get_enabled() -> EnabledTransitionsResponse:
    return EnabledTransitionsResponse(enabled=enabled_transitions(net))


@router.post("/fire/{transition_id}")
async def fire_transition(transition_id: str):
    """Franchit une transition.

    Codes retour :
      - 200 : succès (FireResponse)
      - 409 : transition bloquée (ErrorResponse, error="conflict")
      - 422 : ID inconnu (ErrorResponse, error="validation")
    """
    async with lock:
        try:
            fire(transition_id, net)
        except TransitionNotFound as exc:
            return JSONResponse(
                status_code=422,
                content={"error": "validation", "reason": str(exc)},
            )
        except TransitionNotEnabled as exc:
            return JSONResponse(
                status_code=409,
                content={"error": "conflict", "reason": exc.reason},
            )

        # Incrément du compteur d'événements (contrat v3.1, F5).
        net.step_count += 1

        return FireResponse(
            fired_transition=transition_id,
            marking_vector=net.marking_vector(),
            timestamp=now_iso(),
        )