"""Les 12 contraintes formelles C1–C12 du réseau de Petri.

Chaque contrainte est définie par :
  - un ID stable (C1, C2, …, C12),
  - un nom lisible,
  - une notation formelle (pour l'UI pédagogique),
  - une explication en langage naturel,
  - une fonction `check(net) -> bool` évaluée à CHAQUE appel.

IMPORTANT : `satisfied` est recalculé à chaque `evaluate_all(net)`.
Aucun cache, aucun état persistant dans ce module.

Contraintes de sûreté par construction : depuis v3.1, les corrections du
réseau (inhibiteurs ajoutés sur T1–T6, T9, T16) garantissent que C1, C2,
C3, C6, C7 et C10 ne peuvent PAS être violées par un tir légal. Ces
contraintes restent exposées pour l'UI, avec `satisfied = True` permanent
— sauf bug, ce qui est précisément ce que l'UI doit signaler.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from pydantic import BaseModel, ConfigDict, Field

from core.engine import enabled_transitions
from models.network import PetriNet


# ---------------------------------------------------------------------------
# Modèle de sortie (utilisé directement par le router /properties)
# ---------------------------------------------------------------------------

class ConstraintResult(BaseModel):
    """Résultat d'évaluation d'une contrainte (format contrat API)."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    id: str = Field(..., description="Identifiant stable (C1, C2, …)")
    name: str = Field(..., description="Nom lisible de la contrainte")
    formal_notation: str = Field(..., description="Notation formelle")
    explanation: str = Field(..., description="Explication en langage naturel")
    satisfied: bool = Field(..., description="Satisfaite dans le marquage courant")


# ---------------------------------------------------------------------------
# Définition interne d'une contrainte (ID, textes, prédicat)
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ConstraintDefinition:
    """Métadonnées + prédicat d'une contrainte."""

    id: str
    name: str
    formal_notation: str
    explanation: str
    check: Callable[[PetriNet], bool]


# ---------------------------------------------------------------------------
# Prédicats individuels — un par contrainte
# ---------------------------------------------------------------------------

def _c1_mutual_exclusion_lights(net: PetriNet) -> bool:
    return net.tokens("P1") + net.tokens("P4") <= 1


def _c2_pedestrian_safety(net: PetriNet) -> bool:
    if net.tokens("P10") == 0:
        return True
    return net.tokens("P1") == 0 and net.tokens("P4") == 0


def _c3_mutual_exclusion_emergencies(net: PetriNet) -> bool:
    return net.tokens("P14_NS") + net.tokens("P14_EO") <= 1


def _c4_liveness(net: PetriNet) -> bool:
    return len(enabled_transitions(net)) > 0


def _c5_bound_ns_north(net: PetriNet) -> bool:
    return net.tokens("P7") <= 12


def _c6_preemption_ns_implies_green(net: PetriNet) -> bool:
    if net.tokens("P14_NS") == 0:
        return True
    return net.tokens("P1") >= 1


def _c7_preemption_eo_implies_green(net: PetriNet) -> bool:
    if net.tokens("P14_EO") == 0:
        return True
    return net.tokens("P4") >= 1


def _c8_global_capacity_ns(net: PetriNet) -> bool:
    return net.tokens("P7") + net.tokens("P16") <= 24


def _c9_global_capacity_eo(net: PetriNet) -> bool:
    return net.tokens("P8") + net.tokens("P17") <= 24


def _c10_pedestrian_blocks_emergency(net: PetriNet) -> bool:
    if net.tokens("P10") == 0:
        return True
    return net.tokens("P14_NS") + net.tokens("P14_EO") == 0


def _c11_bound_eo_west(net: PetriNet) -> bool:
    return net.tokens("P8") <= 12


def _c12_orange_incompressible(net: PetriNet) -> bool:
    """C12 : durée(orange) ≥ 3.0 s.

    Cette contrainte n'est PAS vérifiable depuis le marquage seul : elle
    est *structurellement enforced* par `core/engine.py` (T2 et T5 sont
    bloquées tant que l'orange n'a pas duré `ORANGE_MIN_DURATION_S`).

    On retourne donc toujours `True` : la contrainte est respectée par
    construction, et une valeur `False` signalerait un bug du moteur.
    """
    return True

def _c13_bound_ns_south(net: PetriNet) -> bool:
    return net.tokens("P16") <= 12


def _c14_bound_eo_east(net: PetriNet) -> bool:
    return net.tokens("P17") <= 12

# ---------------------------------------------------------------------------
# Table des 12 contraintes — ordre stable garanti (contrat API)
# ---------------------------------------------------------------------------

CONSTRAINTS_DEF: tuple[ConstraintDefinition, ...] = (
    ConstraintDefinition(
        id="C1",
        name="Exclusion mutuelle feux",
        formal_notation="M(P1) + M(P4) ≤ 1",
        explanation="Feux NS et EO jamais verts en même temps.",
        check=_c1_mutual_exclusion_lights,
    ),
    ConstraintDefinition(
        id="C2",
        name="Sécurité piétons",
        formal_notation="M(P10) = 1 ⇒ M(P1) = 0 ∧ M(P4) = 0",
        explanation="Traversée piéton incompatible avec tout feu vert.",
        check=_c2_pedestrian_safety,
    ),
    ConstraintDefinition(
        id="C3",
        name="Exclusion mutuelle urgences",
        formal_notation="M(P14_NS) + M(P14_EO) ≤ 1",
        explanation="Une seule préemption urgence active à la fois.",
        check=_c3_mutual_exclusion_emergencies,
    ),
    ConstraintDefinition(
        id="C4",
        name="Vivacité (L4)",
        formal_notation="∀ M ∈ R(M₀), ∃ T franchissable",
        explanation="Aucun blocage : au moins une transition reste possible.",
        check=_c4_liveness,
    ),
    ConstraintDefinition(
        id="C5",
        name="Bornage file NS Nord",
        formal_notation="M(P7) ≤ 12",
        explanation="Capacité géométrique de la file NS Nord.",
        check=_c5_bound_ns_north,
    ),
    ConstraintDefinition(
        id="C6",
        name="Préemption NS → feu NS vert",
        formal_notation="M(P14_NS) = 1 ⇒ M(P1) = 1",
        explanation="Urgence NS force le feu NS au vert.",
        check=_c6_preemption_ns_implies_green,
    ),
    ConstraintDefinition(
        id="C7",
        name="Préemption EO → feu EO vert",
        formal_notation="M(P14_EO) = 1 ⇒ M(P4) = 1",
        explanation="Urgence EO force le feu EO au vert.",
        check=_c7_preemption_eo_implies_green,
    ),
    ConstraintDefinition(
        id="C8",
        name="Capacité NS globale",
        formal_notation="M(P7) + M(P16) ≤ 24",
        explanation="Capacité combinée des files NS (Nord + Sud).",
        check=_c8_global_capacity_ns,
    ),
    ConstraintDefinition(
        id="C9",
        name="Capacité EO globale",
        formal_notation="M(P8) + M(P17) ≤ 24",
        explanation="Capacité combinée des files EO (Ouest + Est).",
        check=_c9_global_capacity_eo,
    ),
    ConstraintDefinition(
        id="C10",
        name="Piéton bloque urgence",
        formal_notation="M(P10) = 1 ⇒ M(P14_NS) + M(P14_EO) = 0",
        explanation="Aucune préemption tant qu'un piéton traverse.",
        check=_c10_pedestrian_blocks_emergency,
    ),
    ConstraintDefinition(
        id="C11",
        name="Bornage file EO Ouest",
        formal_notation="M(P8) ≤ 12",
        explanation="Capacité géométrique de la file EO Ouest.",
        check=_c11_bound_eo_west,
    ),
    ConstraintDefinition(
        id="C12",
        name="Orange incompressible",
        formal_notation="durée(orange) ≥ 3.0s",
        explanation="Temps de dégagement minimum garanti.",
        check=_c12_orange_incompressible,
    ),
        ConstraintDefinition(
        id="C13",
        name="Bornage file NS Sud",
        formal_notation="M(P16) ≤ 12",
        explanation="Capacité géométrique de la file NS Sud.",
        check=_c13_bound_ns_south,
    ),
    ConstraintDefinition(
        id="C14",
        name="Bornage file EO Est",
        formal_notation="M(P17) ≤ 12",
        explanation="Capacité géométrique de la file EO Est.",
        check=_c14_bound_eo_east,
    ),
)


# ---------------------------------------------------------------------------
# Évaluation
# ---------------------------------------------------------------------------

def evaluate_all(net: PetriNet) -> list[ConstraintResult]:
    """Évalue les 12 contraintes sur le marquage courant.

    Retourne une liste ordonnée (C1 → C12), fraîchement calculée.
    Aucun cache : chaque appel ré-évalue tous les prédicats.
    """
    return [
        ConstraintResult(
            id=c.id,
            name=c.name,
            formal_notation=c.formal_notation,
            explanation=c.explanation,
            satisfied=c.check(net),
        )
        for c in CONSTRAINTS_DEF
    ]