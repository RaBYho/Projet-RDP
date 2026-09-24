"""Configuration centralisée du backend Carrefour Intelligent.

Toutes les valeurs « magiques » du système sont ici. Aucune constante
ne doit être dupliquée dans les autres modules.
"""

from __future__ import annotations

from typing import Final

# ---------------------------------------------------------------------------
# Réseau de Petri
# ---------------------------------------------------------------------------

#: Capacités par place (les places absentes de ce dict sont de capacité 1).
PLACE_CAPACITIES: Final[dict[str, int]] = {
    "P7": 12,
    "P8": 12,
    "P15": 12,
    "P16": 12,
    "P17": 12,
}

#: Marquage initial M₀ (total : 8 jetons).
#: Toute place absente de ce dict a un marquage initial de 0.
INITIAL_MARKING: Final[dict[str, int]] = {
    "P1": 1,
    "P6": 1,
    "P7": 3,
    "P8": 2,
    "P15": 1,
}

# ---------------------------------------------------------------------------
# Temporisations
# ---------------------------------------------------------------------------

#: Durée minimale d'un orange (contrainte C12, en secondes).
ORANGE_MIN_DURATION_S: Final[float] = 3.0

#: Période du tick automatique de T15 (secondes).
AUTO_TICK_PERIOD_S: Final[float] = 1.0

#: Durée d'un cycle complet avant changement forcé (secondes).
CYCLE_DURATION_S: Final[int] = 12

# ---------------------------------------------------------------------------
# Comportements optionnels (v1 : désactivés par défaut)
# ---------------------------------------------------------------------------

#: Active l'arrivée aléatoire de voitures (processus de Poisson).
ENABLE_POISSON_ARRIVALS: Final[bool] = False

#: Taux d'arrivée (voitures / seconde) si Poisson activé.
POISSON_RATE: Final[float] = 0.2

#: Active l'auto-tick du timer (T15).
ENABLE_AUTO_TICK: Final[bool] = True
#: Durée d'une traversée piéton (secondes). Aligné sur la durée d'orange.
PEDESTRIAN_CROSSING_DURATION_S: Final[float] = 3.0