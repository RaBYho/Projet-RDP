"""Modèles Pydantic de SORTIE pour les 7 endpoints du contrat API v3.1.

Ces modèles garantissent qu'aucun champ superflu ne fuite dans le JSON :
chaque modèle est déclaré avec `extra="forbid"`, et FastAPI les utilise
en `response_model=` sur chaque router. Toute déviation (champ en trop,
type incorrect) sera détectée à la sérialisation.

Les types `Literal` reproduisent exactement les énumérations du contrat :
  - catégories : "normal" | "pieton" | "urgence"
  - phases     : "NS" | "EO" | "PIETON" | "URGENCE_NS" | "URGENCE_EO"
                 | "transition" | "URGENCE"
  - erreurs    : "conflict" | "validation"
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# Sous-modèles
# ---------------------------------------------------------------------------

class ArcOut(BaseModel):
    """Arc Pre/Post exposé dans la réponse (avec poids)."""

    model_config = ConfigDict(extra="forbid")

    place_id: str = Field(..., description="ID de la place source/cible")
    weight: int = Field(..., ge=1, description="Poids de l'arc")


class InhibitorOut(BaseModel):
    """Arc inhibiteur exposé dans la réponse (sans poids, cf. contrat)."""

    model_config = ConfigDict(extra="forbid")

    place_id: str = Field(..., description="ID de la place inhibitrice")


class PlaceOut(BaseModel):
    """Place avec son marquage courant."""

    model_config = ConfigDict(extra="forbid")

    id: str
    label: str
    category: Literal["normal", "pieton", "urgence"]
    capacity: int
    tokens: int


class TransitionOut(BaseModel):
    """Transition avec son état `enabled` recalculé."""

    model_config = ConfigDict(extra="forbid")

    id: str
    label: str
    category: Literal["normal", "pieton", "urgence"]
    inputs: list[ArcOut]
    outputs: list[ArcOut]
    inhibitors: list[InhibitorOut]
    enabled: bool


class ConstraintOut(BaseModel):
    """Une des 12 contraintes C1–C12."""

    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    formal_notation: str
    explanation: str
    satisfied: bool


# ---------------------------------------------------------------------------
# Réponses par endpoint
# ---------------------------------------------------------------------------

class NetworkResponse(BaseModel):
    """GET /network  et  POST /reset  (même format)."""

    model_config = ConfigDict(extra="forbid")

    places: list[PlaceOut]
    transitions: list[TransitionOut]
    marking_vector: dict[str, int]
    step_count: int
    timestamp: str


class EnabledTransitionsResponse(BaseModel):
    """GET /enabled-transitions."""

    model_config = ConfigDict(extra="forbid")

    enabled: list[str]


class FireResponse(BaseModel):
    """POST /fire/{transition_id}  et  POST /inject/{event}  (même format)."""

    model_config = ConfigDict(extra="forbid")

    fired_transition: str
    marking_vector: dict[str, int]
    timestamp: str


class PropertiesResponse(BaseModel):
    """GET /properties."""

    model_config = ConfigDict(extra="forbid")

    constraints: list[ConstraintOut]


class TimerResponse(BaseModel):
    """GET /timer."""

    model_config = ConfigDict(extra="forbid")

    ticks_elapsed: float = Field(..., ge=0)
    seconds_before_forced_change: int = Field(..., ge=0)
    current_phase: Literal[
        "NS",
        "EO",
        "PIETON",
        "URGENCE_NS",
        "URGENCE_EO",
        "transition",
        "URGENCE",
    ]


class ErrorResponse(BaseModel):
    """Corps des réponses 409 (Conflict) et 422 (Unprocessable Entity)."""

    model_config = ConfigDict(extra="forbid")

    error: Literal["conflict", "validation"]
    reason: str