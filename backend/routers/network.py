"""Router GET /network et POST /reset."""

from __future__ import annotations

from fastapi import APIRouter

from core.engine import is_enabled
from models.place import PLACES_DEF
from models.transition import TRANSITIONS_DEF
from schemas.responses import (
    ArcOut,
    InhibitorOut,
    NetworkResponse,
    PlaceOut,
    TransitionOut,
)
from state import lock, net, now_iso

router = APIRouter(tags=["network"])


def _build_payload() -> NetworkResponse:
    """Construit le payload complet `GET /network`.

    `enabled` est recalculé à CHAQUE appel (contrat). L'ordre des places
    et des transitions suit `PLACES_DEF` / `TRANSITIONS_DEF` (stable).
    """
    places = [
        PlaceOut(
            id=p.id,
            label=p.label,
            category=p.category,
            capacity=p.capacity,
            tokens=net.tokens(p.id),
        )
        for p in PLACES_DEF
    ]

    transitions = [
        TransitionOut(
            id=t.id,
            label=t.label,
            category=t.category,
            inputs=[ArcOut(place_id=a.place_id, weight=a.weight) for a in t.inputs],
            outputs=[ArcOut(place_id=a.place_id, weight=a.weight) for a in t.outputs],
            inhibitors=[InhibitorOut(place_id=a.place_id) for a in t.inhibitors],
            enabled=is_enabled(t.id, net),
        )
        for t in TRANSITIONS_DEF
    ]

    return NetworkResponse(
        places=places,
        transitions=transitions,
        marking_vector=net.marking_vector(),
        step_count=net.step_count,
        timestamp=now_iso(),
    )


@router.get("/network", response_model=NetworkResponse)
def get_network() -> NetworkResponse:
    return _build_payload()


@router.post("/reset", response_model=NetworkResponse)
async def reset() -> NetworkResponse:
    async with lock:
        net.reset()
    return _build_payload()