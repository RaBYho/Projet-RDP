"""Point d'entrée FastAPI — Carrefour Intelligent (backend v3.1).

Lancement en dev :
    uvicorn main:app --reload --port 8000

Lancement en prod (exemple) :
    uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1

⚠️  Un seul worker est requis : l'état (PetriNet + lock) est en mémoire
    et n'est PAS partagé entre processus.
"""

from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core import scheduler
from routers import (
    inject as inject_router,
    network as network_router,
    properties as properties_router,
    timer as timer_router,
    transitions as transitions_router,
)

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("carrefour")


# ---------------------------------------------------------------------------
# Lifespan — démarrage / arrêt du scheduler
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gère le cycle de vie de l'application.

    Au démarrage : lance les boucles asyncio du scheduler en tâche de fond.
    À l'arrêt : set le `stop_event` et attend la fin propre des boucles.
    """
    stop_event = asyncio.Event()
    scheduler_task = asyncio.create_task(
        scheduler.run(stop_event), name="scheduler"
    )
    logger.info("Backend Carrefour Intelligent démarré (v3.1).")
    try:
        yield
    finally:
        logger.info("Arrêt du backend, terminaison du scheduler…")
        stop_event.set()
        await scheduler_task


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Carrefour Intelligent — Backend",
    description=(
        "Backend FastAPI pour la simulation de carrefour intelligent "
        "basée sur un réseau de Petri (v3.1)."
    ),
    version="3.3.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — le frontend Vite tourne sur http://localhost:5173
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers — 7 endpoints au total, aucun de plus (contrat strict)
# ---------------------------------------------------------------------------

app.include_router(network_router.router)      # GET /network, POST /reset
app.include_router(transitions_router.router)  # GET /enabled-transitions, POST /fire/{id}
app.include_router(properties_router.router)   # GET /properties
app.include_router(timer_router.router)        # GET /timer
app.include_router(inject_router.router)       # POST /inject/{event}