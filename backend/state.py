"""État global partagé entre tous les routers et le scheduler.

Contient :
  - l'instance UNIQUE de `PetriNet` (aucune autre ne doit exister),
  - le verrou `asyncio.Lock` protégeant toutes les mutations,
  - le helper `now_iso()` pour les timestamps du contrat.

Règles d'usage :
  - Les GET (lecture) ne prennent PAS le lock : les mutations sont
    atomiques sous lock, l'état lu est donc toujours cohérent.
  - Les POST (`/fire`, `/reset`, `/inject`) et le scheduler PRENNENT
    le lock avant toute mutation.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from models.network import PetriNet

#: Instance unique du réseau. Importée par tous les routers.
net = PetriNet()

#: Verrou protégeant les mutations concurrentes.
#: Doit être acquis par tout code qui appelle `engine.fire()`, `net.reset()`,
#: `net.add_tokens()`, `net.remove_tokens()` ou `net.set_tokens()`.
lock = asyncio.Lock()


def now_iso() -> str:
    """Timestamp ISO 8601 UTC, précision milliseconde, suffixé par 'Z'.

    Format garanti : `2026-09-24T12:00:00.000Z` (identique au contrat API).
    """
    return (
        datetime.now(timezone.utc)
        .isoformat(timespec="milliseconds")
        .replace("+00:00", "Z")
    )