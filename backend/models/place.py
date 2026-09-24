"""Modèle Place et définitions figées des 17 places du réseau.

Les IDs et libellés sont FIGÉS par contrat v3.1 : toute modification
casse le frontend. La catégorie `bus` a été retirée en v3.
"""

from __future__ import annotations

from typing import Final, Literal

from pydantic import BaseModel, ConfigDict, Field

#: Catégories valides pour une place.
PlaceCategory = Literal["normal", "pieton", "urgence"]


class PlaceDefinition(BaseModel):
    """Définition immuable d'une place du réseau de Petri."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    id: str = Field(..., description="Identifiant unique (ex : P1, P13_NS)")
    label: str = Field(..., description="Libellé lisible par l'humain")
    category: PlaceCategory = Field(..., description="Catégorie fonctionnelle")
    capacity: int = Field(..., ge=1, description="Capacité maximale de jetons")


class PlaceState(PlaceDefinition):
    """Place avec son marquage courant (modèle de sortie API)."""

    tokens: int = Field(..., ge=0, description="Jetons présents")


# ---------------------------------------------------------------------------
# Définitions figées — ordre stable garanti (contrat API)
# ---------------------------------------------------------------------------

PLACES_DEF: Final[tuple[PlaceDefinition, ...]] = (
    # Cycle feux NS
    PlaceDefinition(id="P1",     label="Feu NS vert",           category="normal",  capacity=1),
    PlaceDefinition(id="P2",     label="Feu NS orange",         category="normal",  capacity=1),
    PlaceDefinition(id="P3",     label="Feu NS rouge",          category="normal",  capacity=1),
    # Cycle feux EO
    PlaceDefinition(id="P4",     label="Feu EO vert",           category="normal",  capacity=1),
    PlaceDefinition(id="P5",     label="Feu EO orange",         category="normal",  capacity=1),
    PlaceDefinition(id="P6",     label="Feu EO rouge",          category="normal",  capacity=1),
    # Files d'attente
    PlaceDefinition(id="P7",     label="File NS Nord (↓)",      category="normal",  capacity=12),
    PlaceDefinition(id="P8",     label="File EO Ouest (→)",     category="normal",  capacity=12),
    PlaceDefinition(id="P16",    label="File NS Sud (↑)",       category="normal",  capacity=12),
    PlaceDefinition(id="P17",    label="File EO Est (←)",       category="normal",  capacity=12),
    # Piéton
    PlaceDefinition(id="P9",     label="Appel piéton",          category="pieton",  capacity=1),
    PlaceDefinition(id="P10",    label="Traversée piéton",      category="pieton",  capacity=1),
    # Urgence NS
    PlaceDefinition(id="P13_NS", label="Balise urgence NS",     category="urgence", capacity=1),
    PlaceDefinition(id="P14_NS", label="Préemption NS active",  category="urgence", capacity=1),
    # Urgence EO
    PlaceDefinition(id="P13_EO", label="Balise urgence EO",     category="urgence", capacity=1),
    PlaceDefinition(id="P14_EO", label="Préemption EO active",  category="urgence", capacity=1),
    # Timer
    PlaceDefinition(id="P15",    label="Timer cycle",           category="normal",  capacity=12),
)

#: Index par ID, pour lookup O(1).
PLACES_BY_ID: Final[dict[str, PlaceDefinition]] = {p.id: p for p in PLACES_DEF}

#: Liste stable des IDs, dans l'ordre du contrat.
PLACE_IDS: Final[tuple[str, ...]] = tuple(p.id for p in PLACES_DEF)