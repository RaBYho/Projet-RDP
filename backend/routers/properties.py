"""Router GET /properties."""

from __future__ import annotations

from fastapi import APIRouter

from core.constraints import evaluate_all
from schemas.responses import ConstraintOut, PropertiesResponse
from state import net

router = APIRouter(tags=["properties"])


@router.get("/properties", response_model=PropertiesResponse)
def get_properties() -> PropertiesResponse:
    results = evaluate_all(net)
    return PropertiesResponse(
        constraints=[
            ConstraintOut(
                id=r.id,
                name=r.name,
                formal_notation=r.formal_notation,
                explanation=r.explanation,
                satisfied=r.satisfied,
            )
            for r in results
        ]
    )