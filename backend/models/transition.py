"""Modèle Transition et définitions figées des 18 transitions du réseau.

Version v3.2 — intègre les correctifs validés avec le frontend :

Correctif S1 (les passages obéissent aux feux) :
  - T7, T17 : inhibiteurs P2, P3 (bloqués si NS pas vert)
  - T8, T18 : inhibiteurs P5, P6 (bloqués si EO pas vert)

Correctif S2 (couplage NS ↔ EO, Option A — Petri pur) :
  - T2 : Pre = P2 + P6, Post = P3 + P4 (NS → rouge ET EO → vert)
  - T5 : Pre = P5 + P3, Post = P6 + P1 (EO → rouge ET NS → vert)
  - T3 : inhibiteur P4 ajouté (empêche C1 si EO déjà vert)
  - T6 : inhibiteur P1 ajouté (empêche C1 si NS déjà vert)
  - T2, T5 : inhibiteur P10 ajouté (sécurité piéton C2)

Correctifs v3.1 conservés :
  - T1–T3 : inhibiteur P14_NS
  - T4–T6 : inhibiteurs P14_NS + P14_EO
  - T3, T6 : inhibiteur P10
  - T9 : inhibiteurs P1, P4, P14_NS, P14_EO
  - T7, T8, T17, T18 : Post = ∅
  - T10 : Post = ∅
  - T16 : inhibiteur P4, poids 12 sur P15

Effets collatéraux urgence (T13_NS, T13_EO) : appliqués dans core/engine.py.
"""

from __future__ import annotations

from typing import Final, Literal

from pydantic import BaseModel, ConfigDict, Field

TransitionCategory = Literal["normal", "pieton", "urgence"]


class Arc(BaseModel):
    """Arc orienté entre une place et une transition."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    place_id: str = Field(..., description="ID de la place source ou cible")
    weight: int = Field(1, ge=1, description="Poids de l'arc")


class TransitionDefinition(BaseModel):
    """Définition immuable d'une transition du réseau de Petri."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    id: str
    label: str
    category: TransitionCategory
    inputs: tuple[Arc, ...] = Field(default=())
    outputs: tuple[Arc, ...] = Field(default=())
    inhibitors: tuple[Arc, ...] = Field(default=())


class TransitionState(TransitionDefinition):
    """Transition avec son état `enabled` (modèle de sortie API)."""

    enabled: bool = Field(..., description="Franchissable dans le marquage courant")


def _arc(place_id: str, weight: int = 1) -> Arc:
    return Arc(place_id=place_id, weight=weight)


def _inhib(place_id: str) -> Arc:
    return Arc(place_id=place_id, weight=1)


# ---------------------------------------------------------------------------
# Table des 18 transitions (ordre stable, contrat API)
# ---------------------------------------------------------------------------

TRANSITIONS_DEF: Final[tuple[TransitionDefinition, ...]] = (
    # ---------------------------------------------------------- Cycle NS
    TransitionDefinition(
        id="T1", label="NS vert → orange", category="normal",
        inputs=(_arc("P1"),), outputs=(_arc("P2"),),
        inhibitors=(_inhib("P14_NS"),),
    ),
    TransitionDefinition(
        id="T2", label="NS orange → rouge (EO → vert)", category="normal",
        inputs=(_arc("P2"), _arc("P6")),
        outputs=(_arc("P3"), _arc("P4")),
        inhibitors=(_inhib("P14_NS"), _inhib("P10")),
    ),
    TransitionDefinition(
        id="T3", label="NS rouge → vert (secours)", category="normal",
        inputs=(_arc("P3"),), outputs=(_arc("P1"),),
        inhibitors=(_inhib("P14_NS"), _inhib("P10"), _inhib("P4"), _inhib("P5")),
    ),
    # ---------------------------------------------------------- Cycle EO
    TransitionDefinition(
        id="T4", label="EO vert → orange", category="normal",
        inputs=(_arc("P4"),), outputs=(_arc("P5"),),
        inhibitors=(_inhib("P14_NS"), _inhib("P14_EO")),
    ),
    TransitionDefinition(
        id="T5", label="EO orange → rouge (NS → vert)", category="normal",
        inputs=(_arc("P5"), _arc("P3")),
        outputs=(_arc("P6"), _arc("P1")),
        inhibitors=(_inhib("P14_NS"), _inhib("P14_EO"), _inhib("P10")),
    ),
    TransitionDefinition(
        id="T6", label="EO rouge → vert (secours)", category="normal",
        inputs=(_arc("P6"),), outputs=(_arc("P4"),),
        inhibitors=(
            _inhib("P14_NS"), _inhib("P14_EO"),
            _inhib("P10"), _inhib("P1"), _inhib("P2"),
        ),
    ),
    # -------------------------------------- Files → sortie (S1 : feux requis)
    TransitionDefinition(
        id="T7", label="File NS Nord → passage", category="normal",
        inputs=(_arc("P7"),), outputs=(),
        inhibitors=(_inhib("P2"), _inhib("P3")),
    ),
    TransitionDefinition(
        id="T8", label="File EO Ouest → passage", category="normal",
        inputs=(_arc("P8"),), outputs=(),
        inhibitors=(_inhib("P5"), _inhib("P6")),
    ),
    TransitionDefinition(
        id="T17", label="File NS Sud → passage", category="normal",
        inputs=(_arc("P16"),), outputs=(),
        inhibitors=(_inhib("P2"), _inhib("P3")),
    ),
    TransitionDefinition(
        id="T18", label="File EO Est → passage", category="normal",
        inputs=(_arc("P17"),), outputs=(),
        inhibitors=(_inhib("P5"), _inhib("P6")),
    ),
    # ------------------------------------------------------------- Piéton
    TransitionDefinition(
        id="T9", label="Appel piéton", category="pieton",
        inputs=(_arc("P9"),), outputs=(_arc("P10"),),
        inhibitors=(
            _inhib("P1"), _inhib("P4"),
            _inhib("P14_NS"), _inhib("P14_EO"),
        ),
    ),
    TransitionDefinition(
        id="T10", label="Fin traversée", category="pieton",
        inputs=(_arc("P10"),), outputs=(),
    ),
    # -------------------------------------------------------- Urgence NS
    TransitionDefinition(
        id="T13_NS", label="Urgence NS détectée", category="urgence",
        inputs=(_arc("P13_NS"),), outputs=(_arc("P14_NS"),),
        inhibitors=(_inhib("P14_EO"), _inhib("P10")),
    ),
    TransitionDefinition(
        id="T14_NS", label="Fin préemption NS", category="urgence",
        inputs=(_arc("P14_NS"),), outputs=(),
    ),
    # -------------------------------------------------------- Urgence EO
    TransitionDefinition(
        id="T13_EO", label="Urgence EO détectée", category="urgence",
        inputs=(_arc("P13_EO"),), outputs=(_arc("P14_EO"),),
        inhibitors=(_inhib("P14_NS"), _inhib("P10")),
    ),
    TransitionDefinition(
        id="T14_EO", label="Fin préemption EO", category="urgence",
        inputs=(_arc("P14_EO"),), outputs=(),
    ),
    # ------------------------------------------------------------- Timer
    TransitionDefinition(
        id="T15", label="Tick timer", category="normal",
        inputs=(),                                    # avant : (P15,)
        outputs=(_arc("P15", weight=1),),             # inchangé
    ),
    TransitionDefinition(
        id="T16", label="Reset cycle", category="normal",
        inputs=(_arc("P15", weight=12),),
        outputs=(_arc("P1"), _arc("P6")),
        inhibitors=(_inhib("P4"),),
    ),
)

TRANSITIONS_BY_ID: Final[dict[str, TransitionDefinition]] = {
    t.id: t for t in TRANSITIONS_DEF
}

TRANSITION_IDS: Final[tuple[str, ...]] = tuple(t.id for t in TRANSITIONS_DEF)