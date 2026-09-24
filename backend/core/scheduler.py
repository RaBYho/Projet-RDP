"""Tâches asyncio de fond pour le carrefour (v3.3.1).

Boucles actives :
  1. `_auto_tick_loop` — auto-tick T15 + piéton auto (T9, T10).
     ⚠️  T16 (reset cycle) N'EST PLUS firée automatiquement depuis v3.3.1
     (décision Q6 frontend : incompatible avec le cycle auto-play de 14.4 s).

  2. `_poisson_loop` — arrivées aléatoires (désactivé par défaut).

Règles :
  - Chaque boucle acquiert `state.lock` avant toute mutation.
  - Les événements internes (T15, T9, T10) n'incrémentent PAS `step_count`.
    Seules les actions utilisateur (`/fire`, `/inject`) le font.
"""

from __future__ import annotations

import asyncio
import logging
import random
import time

from config import (
    AUTO_TICK_PERIOD_S,
    ENABLE_AUTO_TICK,
    ENABLE_POISSON_ARRIVALS,
    PEDESTRIAN_CROSSING_DURATION_S,
    POISSON_RATE,
)
from core.engine import TransitionNotEnabled, fire
from models.place import PLACES_BY_ID
from state import lock, net

logger = logging.getLogger(__name__)

#: Places alimentées par les arrivées aléatoires (une par sens).
_POISSON_TARGETS: tuple[str, ...] = ("P7", "P8", "P16", "P17")


# ---------------------------------------------------------------------------
# Utilitaires
# ---------------------------------------------------------------------------

async def _sleep_or_stop(stop_event: asyncio.Event, delay: float) -> bool:
    """Attend `delay` secondes OU jusqu'à ce que `stop_event` soit set.

    Retourne True si arrêt demandé, False si délai écoulé normalement.
    """
    try:
        await asyncio.wait_for(stop_event.wait(), timeout=delay)
        return True
    except asyncio.TimeoutError:
        return False


# ---------------------------------------------------------------------------
# Boucle principale (auto-tick + piéton)
# ---------------------------------------------------------------------------

async def _auto_tick_loop(stop_event: asyncio.Event) -> None:
    """Boucle système principale, un tick par seconde.

    À chaque tick :
      1. Fire T15 (incrémente P15) si enabled.
      2. Fire T9 (début de traversée piéton) si P9 = 1 et conditions OK.
      3. Fire T10 (fin de traversée) après PEDESTRIAN_CROSSING_DURATION_S.

    T16 (reset cycle) n'est PLUS firée ici (v3.3.1). Voir docstring module.
    """
    p10_since: float | None = None

    while not stop_event.is_set():
        if await _sleep_or_stop(stop_event, AUTO_TICK_PERIOD_S):
            return

        async with lock:
            # 1) Tick timer — incrémente P15 (plafonne à 12 par capacité)
            try:
                fire("T15", net)
            except TransitionNotEnabled:
                pass  # P15 saturé à 12

            # 2) Piéton : tentative de démarrage de traversée
            try:
                fire("T9", net)
            except TransitionNotEnabled:
                pass  # Feu vert en cours, préemption, ou pas de piéton

            # 3) Fin de traversée piéton après délai
            now = time.monotonic()
            if net.tokens("P10") > 0:
                if p10_since is None:
                    p10_since = now
                elif now - p10_since >= PEDESTRIAN_CROSSING_DURATION_S:
                    try:
                        fire("T10", net)
                    except TransitionNotEnabled:
                        pass
                    p10_since = None
            else:
                p10_since = None


# ---------------------------------------------------------------------------
# Boucle Poisson (optionnelle)
# ---------------------------------------------------------------------------

async def _poisson_loop(stop_event: asyncio.Event) -> None:
    """Injecte des voitures aléatoirement selon un processus de Poisson."""
    if POISSON_RATE <= 0:
        logger.warning(
            "ENABLE_POISSON_ARRIVALS=True mais POISSON_RATE=%.2f → boucle inactive.",
            POISSON_RATE,
        )
        return

    while not stop_event.is_set():
        delay = random.expovariate(POISSON_RATE)
        if await _sleep_or_stop(stop_event, delay):
            return

        target = random.choice(_POISSON_TARGETS)
        capacity = PLACES_BY_ID[target].capacity

        async with lock:
            if net.tokens(target) >= capacity:
                continue
            net.add_tokens(target, 1)


# ---------------------------------------------------------------------------
# Point d'entrée appelé par le lifespan
# ---------------------------------------------------------------------------

async def run(stop_event: asyncio.Event) -> None:
    """Démarre les boucles activées et attend leur terminaison."""
    tasks: list[asyncio.Task[None]] = []

    if ENABLE_AUTO_TICK:
        tasks.append(
            asyncio.create_task(_auto_tick_loop(stop_event), name="auto_tick")
        )
        logger.info(
            "Scheduler : auto-tick + piéton activés (période %.2fs)",
            AUTO_TICK_PERIOD_S,
        )

    if ENABLE_POISSON_ARRIVALS:
        tasks.append(asyncio.create_task(_poisson_loop(stop_event), name="poisson"))
        logger.info("Scheduler : Poisson activé (taux %.2f/s)", POISSON_RATE)

    if not tasks:
        logger.info("Scheduler : aucune boucle activée.")
        return

    try:
        await asyncio.gather(*tasks, return_exceptions=True)
    finally:
        logger.info("Scheduler : arrêté.")