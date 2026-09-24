"""Agrégat PetriNet : état mutable global du réseau.

Ce module ne contient AUCUNE logique de tir (déléguée à `core/engine.py`)
ni de contraintes (déléguées à `core/constraints.py`). Il expose
uniquement :

- le marquage courant (17 places, toujours présentes),
- les compteurs annexes (`step_count`, temps écoulé, timers orange),
- les opérations atomiques (`reset`, `add_tokens`, `remove_tokens`).

La synchronisation concurrente (asyncio.Lock) est gérée dans `state.py`,
pas ici : cette classe est volontairement non-thread-safe.
"""

from __future__ import annotations

import time
from typing import Final, Literal

from config import INITIAL_MARKING
from models.place import PLACE_IDS

#: Axes possibles pour la temporisation orange (contrainte C12).
Axis = Literal["NS", "EO"]


class PetriNet:
    """État complet du réseau de Petri.

    Invariants garantis :
    - `marking` contient TOUJOURS les 17 places (même à 0).
    - L'ordre des clés de `marking` suit `PLACE_IDS` (stable entre appels).
    - `step_count >= 0`.
    - `ticks_elapsed >= 0`.
    """

    def __init__(self) -> None:
        self._marking: dict[str, int] = {}
        self.step_count: int = 0
        self._started_at: float = 0.0
        self._orange_started_at: dict[Axis, float] = {}
        self.reset()

    # ------------------------------------------------------------------
    # Cycle de vie
    # ------------------------------------------------------------------

    def reset(self) -> None:
        """Remet le réseau à M₀. Reset COMPLET (contrat v3.1, réponse F4).

        Remet à zéro :
        - le marquage (toutes les 17 places, ordre stable),
        - `step_count`,
        - `ticks_elapsed` (via `_started_at`),
        - les timers de temporisation orange (C12).
        """
        self._marking = {pid: INITIAL_MARKING.get(pid, 0) for pid in PLACE_IDS}
        self.step_count = 0
        self._started_at = time.monotonic()
        self._orange_started_at.clear()

    # ------------------------------------------------------------------
    # Lecture
    # ------------------------------------------------------------------

    @property
    def marking(self) -> dict[str, int]:
        """Vue directe du marquage (lecture seule par convention)."""
        return self._marking

    def tokens(self, place_id: str) -> int:
        """Nombre de jetons dans une place (0 si inconnue, par sûreté)."""
        return self._marking.get(place_id, 0)

    def marking_vector(self) -> dict[str, int]:
        """Copie défensive du marquage, ordre stable garanti."""
        return dict(self._marking)

    @property
    def ticks_elapsed(self) -> float:
        """Secondes écoulées depuis le dernier reset (résolution 0.01 s)."""
        return round(time.monotonic() - self._started_at, 2)

    # ------------------------------------------------------------------
    # Mutation atomique (utilisée par engine.py uniquement)
    # ------------------------------------------------------------------

    def set_tokens(self, place_id: str, value: int) -> None:
        """Force le nombre de jetons d'une place (usage interne)."""
        self._marking[place_id] = value

    def add_tokens(self, place_id: str, count: int = 1) -> None:
        """Ajoute des jetons. Ne vérifie PAS la capacité (engine le fait)."""
        self._marking[place_id] = self._marking.get(place_id, 0) + count

    def remove_tokens(self, place_id: str, count: int = 1) -> None:
        """Retire des jetons. Ne vérifie PAS la disponibilité (engine le fait)."""
        self._marking[place_id] = self._marking.get(place_id, 0) - count

    # ------------------------------------------------------------------
    # Temporisation orange (contrainte C12)
    # ------------------------------------------------------------------

    def mark_orange_start(self, axis: Axis) -> None:
        """Enregistre le début d'un orange sur un axe (appelé par engine)."""
        self._orange_started_at[axis] = time.monotonic()

    def orange_elapsed(self, axis: Axis) -> float | None:
        """Secondes écoulées depuis le début de l'orange sur cet axe.

        Renvoie None si aucun orange n'a été déclenché sur cet axe
        depuis le dernier reset.
        """
        started = self._orange_started_at.get(axis)
        if started is None:
            return None
        return time.monotonic() - started

    def clear_orange(self, axis: Axis) -> None:
        """Efface l'état de temporisation orange pour cet axe."""
        self._orange_started_at.pop(axis, None)

    # ------------------------------------------------------------------
    # Helpers de contrôle d'intégrité (utilisés par les tests)
    # ------------------------------------------------------------------

    def total_tokens(self) -> int:
        """Somme des jetons (pour tests de conservation, non exposé à l'API)."""
        return sum(self._marking.values())

    def assert_well_formed(self) -> None:
        """Vérifie les invariants structurels. Lève AssertionError si KO."""
        expected = set(PLACE_IDS)
        actual = set(self._marking.keys())
        assert actual == expected, (
            f"Marquage incohérent : attendu {expected}, obtenu {actual}"
        )
        assert self.step_count >= 0, "step_count négatif"
        for pid, tokens in self._marking.items():
            assert tokens >= 0, f"{pid} a un marquage négatif : {tokens}"
    def reset_timer(self) -> None:
        """Réinitialise le compteur temporel (contrat v3.2, réponse D3).

        Appelé après `T14_NS` / `T14_EO` (fin de préemption) : l'UI
        affiche `ticks_elapsed = 0` et un cycle complet devant soi.
        """
        self._started_at = time.monotonic()