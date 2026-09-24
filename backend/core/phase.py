"""Calcul de la phase courante du carrefour.

Utilisé par `GET /timer` (et plus tard par le scheduler). La phase est
dérivée UNIQUEMENT du marquage — aucune variable cachée.

Ordre de priorité (validé frontend, v3.1) :
    URGENCE_NS > URGENCE_EO > PIETON > transition > NS / EO > URGENCE
"""

from __future__ import annotations

from typing import Literal

from models.network import PetriNet

Phase = Literal[
    "NS", "EO", "PIETON", "URGENCE_NS", "URGENCE_EO", "transition", "URGENCE"
]


def current_phase(net: PetriNet) -> Phase:
    """Retourne la phase la plus spécifique possible.

    Le fallback générique `URGENCE` n'est atteint qu'en cas d'état
    incohérent (aucun feu actif, aucune préemption) — c'est un garde-fou.
    """
    if net.tokens("P14_NS") > 0:
        return "URGENCE_NS"
    if net.tokens("P14_EO") > 0:
        return "URGENCE_EO"
    if net.tokens("P10") > 0:
        return "PIETON"
    # Orange en cours sur l'un des deux axes → phase « transition »
    if net.tokens("P2") > 0 or net.tokens("P5") > 0:
        return "transition"
    if net.tokens("P1") > 0:
        return "NS"
    if net.tokens("P4") > 0:
        return "EO"
    return "URGENCE"