"""Router GET /timer."""

from __future__ import annotations

from fastapi import APIRouter

from config import CYCLE_DURATION_S
from core.phase import current_phase
from schemas.responses import TimerResponse
from state import net

router = APIRouter(tags=["timer"])


@router.get("/timer", response_model=TimerResponse)
def get_timer() -> TimerResponse:
    """Renvoie l'état temporel du carrefour.

    - `ticks_elapsed` : secondes écoulées depuis le dernier reset.
    - `seconds_before_forced_change` : compte à rebours dans le cycle.
    - `current_phase` : dérivé du marquage (voir core/phase.py).
    """
    elapsed = net.ticks_elapsed
    seconds = CYCLE_DURATION_S - int(elapsed) % CYCLE_DURATION_S
    return TimerResponse(
        ticks_elapsed=elapsed,
        seconds_before_forced_change=seconds,
        current_phase=current_phase(net),
    )