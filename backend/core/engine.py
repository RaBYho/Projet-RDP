"""Moteur de tir du réseau de Petri (v3.2).

Responsabilité : déterminer si une transition est franchissable et
l'appliquer. Ne connaît NI les contraintes C1–C12 (voir constraints.py)
NI le scheduler (voir scheduler.py).

Messages d'erreur : format pédagogique `<Objet> refusée : <cause>.`
(contrat v3.2, demande frontend §5).
"""

from __future__ import annotations

from config import ORANGE_MIN_DURATION_S
from models.network import Axis, PetriNet
from models.place import PLACES_BY_ID
from models.transition import (
    TRANSITIONS_BY_ID,
    TRANSITIONS_DEF,
    TransitionDefinition,
)


# ---------------------------------------------------------------------------
# Exceptions
# ---------------------------------------------------------------------------

class TransitionNotFound(Exception):
    """ID inconnu → router 422."""

    def __init__(self, transition_id: str) -> None:
        self.transition_id = transition_id
        super().__init__(f"Transition inconnue : {transition_id}")


class TransitionNotEnabled(Exception):
    """Transition non franchissable → router 409."""

    def __init__(self, transition_id: str, reason: str) -> None:
        self.transition_id = transition_id
        self.reason = reason
        super().__init__(reason)


# ---------------------------------------------------------------------------
# Libellés pédagogiques des places (contrat v3.2, §5)
# ---------------------------------------------------------------------------

#: Cause lisible quand un inhibiteur bloque (place marquée).
_INHIBITOR_REASON: dict[str, str] = {
    "P1": "feu NS vert en cours",
    "P2": "feu NS orange en cours",
    "P3": "feu NS rouge",
    "P4": "feu EO vert en cours",
    "P5": "feu EO orange en cours",
    "P6": "feu EO rouge",
    "P9": "appel piéton déjà en attente",
    "P10": "traversée piéton en cours",
    "P14_NS": "préemption NS active",
    "P14_EO": "préemption EO active",
}

#: Cause lisible quand une entrée Pre manque.
_PRE_REASON: dict[str, str] = {
    "P1": "le cycle NS n'est pas au vert",
    "P2": "le cycle NS n'est pas à l'orange",
    "P3": "le cycle NS n'est pas au rouge",
    "P4": "le cycle EO n'est pas au vert",
    "P5": "le cycle EO n'est pas à l'orange",
    "P6": "le cycle EO n'est pas au rouge",
    "P7": "aucun véhicule en file NS Nord",
    "P8": "aucun véhicule en file EO Ouest",
    "P9": "aucun appel piéton en attente",
    "P10": "aucune traversée piéton en cours",
    "P13_NS": "aucune balise urgence NS active",
    "P13_EO": "aucune balise urgence EO active",
    "P14_NS": "aucune préemption NS active",
    "P14_EO": "aucune préemption EO active",
    "P15": "aucun jeton dans le timer",
    "P16": "aucun véhicule en file NS Sud",
    "P17": "aucun véhicule en file EO Est",
}

#: Libellé court pour les messages de capacité.
_PLACE_LABEL: dict[str, str] = {
    "P1": "feu NS vert", "P2": "feu NS orange", "P3": "feu NS rouge",
    "P4": "feu EO vert", "P5": "feu EO orange", "P6": "feu EO rouge",
    "P7": "file NS Nord", "P8": "file EO Ouest",
    "P9": "appel piéton", "P10": "traversée piéton",
    "P13_NS": "balise urgence NS", "P13_EO": "balise urgence EO",
    "P14_NS": "préemption NS", "P14_EO": "préemption EO",
    "P15": "timer cycle", "P16": "file NS Sud", "P17": "file EO Est",
}


# ---------------------------------------------------------------------------
# Vérifications internes (retournent None si OK, une raison sinon)
# ---------------------------------------------------------------------------

def _check_pre(transition: TransitionDefinition, net: PetriNet) -> str | None:
    for arc in transition.inputs:
        if net.tokens(arc.place_id) < arc.weight:
            cause = _PRE_REASON.get(arc.place_id, f"{arc.place_id} indisponible")
            return f"Transition {transition.id} refusée : {cause}."
    return None


def _check_inhibitors(transition: TransitionDefinition, net: PetriNet) -> str | None:
    for arc in transition.inhibitors:
        if net.tokens(arc.place_id) > 0:
            cause = _INHIBITOR_REASON.get(arc.place_id, f"{arc.place_id} actif")
            return f"Transition {transition.id} refusée : {cause}."
    return None


def _simulate_marking(
    transition: TransitionDefinition, net: PetriNet
) -> dict[str, int]:
    new_marking = net.marking_vector()
    for arc in transition.inputs:
        new_marking[arc.place_id] -= arc.weight
    for arc in transition.outputs:
        new_marking[arc.place_id] += arc.weight
    return new_marking


def _check_capacities(
    transition: TransitionDefinition,
    new_marking: dict[str, int],
) -> str | None:
    for place_id, tokens in new_marking.items():
        if tokens < 0:
            return (
                f"Transition {transition.id} refusée : "
                f"marquage négatif simulé sur {place_id}."
            )
        capacity = PLACES_BY_ID[place_id].capacity
        if tokens > capacity:
            label = _PLACE_LABEL.get(place_id, place_id)
            return (
                f"Transition {transition.id} refusée : "
                f"capacité de {label} atteinte."
            )
    return None


def _check_orange_gate(transition_id: str, net: PetriNet) -> str | None:
    if transition_id == "T2":
        axis: Axis = "NS"
    elif transition_id == "T5":
        axis = "EO"
    else:
        return None

    elapsed = net.orange_elapsed(axis)
    if elapsed is None:
        return (
            f"Transition {transition_id} refusée : "
            f"minuterie orange non initialisée (fail-closed)."
        )
    if elapsed < ORANGE_MIN_DURATION_S:
        return (
            f"Transition {transition_id} refusée : orange {axis} incompressible "
            f"(écoulé {elapsed:.1f}s < {ORANGE_MIN_DURATION_S}s)."
        )
    return None

def _first_blocking_reason(transition_id: str, net: PetriNet) -> str | None:
    transition = TRANSITIONS_BY_ID.get(transition_id)
    if transition is None:
        raise TransitionNotFound(transition_id)

    return (
        _check_pre(transition, net)
        or _check_inhibitors(transition, net)
        or _check_capacities(transition, _simulate_marking(transition, net))
        or _check_orange_gate(transition_id, net)
    )


# ---------------------------------------------------------------------------
# Effets collatéraux urgence
# ---------------------------------------------------------------------------

def _apply_urgency_side_effects(transition_id: str, net: PetriNet) -> None:
    if transition_id == "T13_NS":
        net.set_tokens("P1", 1); net.set_tokens("P2", 0); net.set_tokens("P3", 0)
        net.set_tokens("P4", 0); net.set_tokens("P5", 0); net.set_tokens("P6", 1)
    elif transition_id == "T13_EO":
        net.set_tokens("P4", 1); net.set_tokens("P5", 0); net.set_tokens("P6", 0)
        net.set_tokens("P1", 0); net.set_tokens("P2", 0); net.set_tokens("P3", 1)


# ---------------------------------------------------------------------------
# Temporisation orange (C12)
# ---------------------------------------------------------------------------

_ORANGE_START_AXIS: dict[str, Axis] = {"T1": "NS", "T4": "EO"}
_ORANGE_END_AXIS: dict[str, Axis] = {"T2": "NS", "T5": "EO"}

#: Transitions qui remettent le compteur temporel à zéro (contrat v3.2, D3).
_TIMER_RESET_TRANSITIONS: frozenset[str] = frozenset({"T14_NS", "T14_EO"})


# ---------------------------------------------------------------------------
# API publique
# ---------------------------------------------------------------------------

def is_enabled(transition_id: str, net: PetriNet) -> bool:
    return _first_blocking_reason(transition_id, net) is None


def enabled_transitions(net: PetriNet) -> list[str]:
    return [
        t.id for t in TRANSITIONS_DEF
        if _first_blocking_reason(t.id, net) is None
    ]


def fire(transition_id: str, net: PetriNet) -> None:
    """Franchit la transition et mute le marquage.

    Lève `TransitionNotFound` (ID inconnu) ou `TransitionNotEnabled`.
    N'incrémente PAS `step_count` (fait par le router).
    """
    reason = _first_blocking_reason(transition_id, net)
    if reason is not None:
        raise TransitionNotEnabled(transition_id, reason)

    transition = TRANSITIONS_BY_ID[transition_id]

    for arc in transition.inputs:
        net.remove_tokens(arc.place_id, arc.weight)
    for arc in transition.outputs:
        net.add_tokens(arc.place_id, arc.weight)

    _apply_urgency_side_effects(transition_id, net)

    start_axis = _ORANGE_START_AXIS.get(transition_id)
    if start_axis is not None:
        net.mark_orange_start(start_axis)
    end_axis = _ORANGE_END_AXIS.get(transition_id)
    if end_axis is not None:
        net.clear_orange(end_axis)

    if transition_id in _TIMER_RESET_TRANSITIONS:
        net.reset_timer()