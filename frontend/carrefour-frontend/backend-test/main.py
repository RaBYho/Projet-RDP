"""
Backend de test — Carrefour Intelligent
========================================

Serveur FastAPI minimaliste qui implémente les 7 endpoints du contrat
frontend. À utiliser UNIQUEMENT pour tester l'intégration pendant le
développement — aucune logique de simulation formelle.

Lancement :
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
"""

from datetime import datetime, timezone
from typing import Dict, List
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse


# ============================================================
# Configuration du serveur
# ============================================================

app = FastAPI(
    title="Carrefour Intelligent — Backend de test",
    description="Mock API pour tester le frontend",
    version="0.1.0",
)

# CORS permissif — utile en dev quand Vite tourne sur 5173.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

SERVER_START = time.time()


# ============================================================
# Modèle statique du réseau
# ============================================================

PLACES_DEF: List[Dict] = [
    {"id": "P1",  "label": "Feu NS vert",         "category": "normal",   "capacity": 1},
    {"id": "P2",  "label": "Feu NS orange",       "category": "normal",   "capacity": 1},
    {"id": "P3",  "label": "Feu NS rouge",        "category": "normal",   "capacity": 1},
    {"id": "P4",  "label": "Feu EO vert",         "category": "normal",   "capacity": 1},
    {"id": "P5",  "label": "Feu EO orange",       "category": "normal",   "capacity": 1},
    {"id": "P6",  "label": "Feu EO rouge",        "category": "normal",   "capacity": 1},
    {"id": "P7",  "label": "File NS",             "category": "normal",   "capacity": 12},
    {"id": "P8",  "label": "File EO",             "category": "normal",   "capacity": 12},
    {"id": "P9",  "label": "Appel piéton",        "category": "pieton",   "capacity": 1},
    {"id": "P10", "label": "Traversée piéton",    "category": "pieton",   "capacity": 1},
    {"id": "P11", "label": "RFID bus",            "category": "bus",      "capacity": 1},
    {"id": "P12", "label": "Priorité bus active", "category": "bus",      "capacity": 1},
    {"id": "P13", "label": "Balise urgence",      "category": "urgence",  "capacity": 1},
    {"id": "P14", "label": "Verrou urgence",      "category": "urgence",  "capacity": 1},
    {"id": "P15", "label": "Timer cycle",         "category": "normal",   "capacity": 1},
]

TRANSITIONS_DEF: Dict[str, Dict] = {
    "T1":  {"label": "NS vert → orange",   "category": "normal",
            "inputs": {"P1": 1},  "outputs": {"P2": 1}},
    "T2":  {"label": "NS orange → rouge",  "category": "normal",
            "inputs": {"P2": 1},  "outputs": {"P3": 1}},
    "T3":  {"label": "NS rouge → vert",    "category": "normal",
            "inputs": {"P3": 1},  "outputs": {"P1": 1}},
    "T4":  {"label": "EO vert → orange",   "category": "normal",
            "inputs": {"P4": 1},  "outputs": {"P5": 1}},
    "T5":  {"label": "EO orange → rouge",  "category": "normal",
            "inputs": {"P5": 1},  "outputs": {"P6": 1}},
    "T6":  {"label": "EO rouge → vert",    "category": "normal",
            "inputs": {"P6": 1},  "outputs": {"P4": 1}},
    "T7":  {"label": "File NS → passage",  "category": "normal",
            "inputs": {"P7": 1},  "outputs": {"P15": 1}},
    "T8":  {"label": "File EO → passage",  "category": "normal",
            "inputs": {"P8": 1},  "outputs": {"P15": 1}},
    "T9":  {"label": "Appel piéton",       "category": "pieton",
            "inputs": {"P9": 1},  "outputs": {"P10": 1}},
    "T10": {"label": "Fin traversée",      "category": "pieton",
            "inputs": {"P10": 1}, "outputs": {"P9": 1}},
    "T11": {"label": "Bus détecté",        "category": "bus",
            "inputs": {"P11": 1}, "outputs": {"P12": 1}},
    "T12": {"label": "Fin priorité bus",   "category": "bus",
            "inputs": {"P12": 1}, "outputs": {"P11": 1}},
    "T13": {"label": "Balise urgence",     "category": "urgence",
            "inputs": {"P13": 1}, "outputs": {"P14": 1}},
    "T14": {"label": "Fin urgence",        "category": "urgence",
            "inputs": {"P14": 1}, "outputs": {"P13": 1}},
    "T15": {"label": "Tick timer",         "category": "normal",
            "inputs": {"P15": 1}, "outputs": {"P15": 1}},
    "T16": {"label": "Reset cycle NS",     "category": "normal",
            "inputs": {"P15": 1}, "outputs": {"P1": 1, "P6": 1}},
}

# Marquage initial — total = 8 jetons (aligné sur le mockup).
M0: Dict[str, int] = {
    "P1": 1, "P2": 0, "P3": 0,
    "P4": 0, "P5": 0, "P6": 1,
    "P7": 3, "P8": 2,
    "P9": 0, "P10": 0,
    "P11": 0, "P12": 0,
    "P13": 0, "P14": 0,
    "P15": 1,
}


# ============================================================
# État mutable du serveur
# ============================================================

state = {
    "marking": dict(M0),
    "step_count": 0,
}


# ============================================================
# Helpers
# ============================================================

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def is_enabled(trans_id: str) -> bool:
    t = TRANSITIONS_DEF[trans_id]
    for place, weight in t["inputs"].items():
        if state["marking"].get(place, 0) < weight:
            return False
    return True


def enabled_transitions() -> List[str]:
    return [tid for tid in TRANSITIONS_DEF if is_enabled(tid)]


def fire_in_place(trans_id: str) -> None:
    t = TRANSITIONS_DEF[trans_id]
    for place, weight in t["inputs"].items():
        state["marking"][place] = state["marking"].get(place, 0) - weight
    for place, weight in t["outputs"].items():
        state["marking"][place] = state["marking"].get(place, 0) + weight


def current_phase() -> str:
    if state["marking"].get("P1", 0) > 0:
        return "NS"
    if state["marking"].get("P4", 0) > 0:
        return "EO"
    return "transition"


def build_network_payload() -> Dict:
    places = [
        {
            "id": p["id"],
            "label": p["label"],
            "category": p["category"],
            "capacity": p["capacity"],
            "tokens": state["marking"].get(p["id"], 0),
        }
        for p in PLACES_DEF
    ]
    transitions = [
        {
            "id": tid,
            "label": TRANSITIONS_DEF[tid]["label"],
            "category": TRANSITIONS_DEF[tid]["category"],
            "inputs": [
                {"place_id": pid, "weight": w}
                for pid, w in TRANSITIONS_DEF[tid]["inputs"].items()
            ],
            "outputs": [
                {"place_id": pid, "weight": w}
                for pid, w in TRANSITIONS_DEF[tid]["outputs"].items()
            ],
            "enabled": is_enabled(tid),
        }
        for tid in TRANSITIONS_DEF
    ]
    return {
        "places": places,
        "transitions": transitions,
        "marking_vector": dict(state["marking"]),
        "step_count": state["step_count"],
        "timestamp": now_iso(),
    }


def build_constraints_payload() -> Dict:
    m = state["marking"]
    constraints = [
        {
            "id": "C1",
            "name": "Exclusion mutuelle",
            "formal_notation": "M(P1) + M(P4) ≤ 1",
            "explanation": "Feux NS et EO jamais verts en même temps.",
            "satisfied": (m.get("P1", 0) + m.get("P4", 0)) <= 1,
        },
        {
            "id": "C2",
            "name": "Sécurité piétons",
            "formal_notation": "M(P10) = 1 ⇒ M(P1) = 0 ∧ M(P4) = 0",
            "explanation": "Traversée piéton incompatible avec tout feu vert.",
            "satisfied": not (
                m.get("P10", 0) > 0 and (m.get("P1", 0) > 0 or m.get("P4", 0) > 0)
            ),
        },
        {
            "id": "C3",
            "name": "Priorité urgence",
            "formal_notation": "M(P14) = 1 ⇒ transitions non-urgence désactivées",
            "explanation": "Véhicule d'urgence préempte tout autre flux.",
            "satisfied": True,
        },
        {
            "id": "C4",
            "name": "Vivacité (L4)",
            "formal_notation": "∀ M ∈ R(M₀), ∃ T franchissable",
            "explanation": "Aucun blocage : au moins une transition reste possible.",
            "satisfied": len(enabled_transitions()) > 0,
        },
        {
            "id": "C5",
            "name": "Bornage files",
            "formal_notation": "M(P7) ≤ 12 ∧ M(P8) ≤ 12",
            "explanation": "Capacité géométrique des files d'attente.",
            "satisfied": m.get("P7", 0) <= 12 and m.get("P8", 0) <= 12,
        },
        {
            "id": "C6",
            "name": "Priorité bus",
            "formal_notation": "M(P11) = 1 ⇒ priorité accordée au bus",
            "explanation": "Bus RFID traité préférentiellement.",
            "satisfied": True,
        },
        {
            "id": "C7",
            "name": "Orange incompressible",
            "formal_notation": "durée(orange) ≥ 3.0s",
            "explanation": "Temps de dégagement minimum garanti.",
            "satisfied": True,
        },
    ]
    return {"constraints": constraints}


# ============================================================
# Endpoints
# ============================================================

@app.get("/")
def root():
    return {
        "service": "Carrefour Intelligent — Backend de test",
        "status": "ok",
        "endpoints": [
            "GET  /network",
            "GET  /enabled-transitions",
            "POST /fire/{transition_id}",
            "GET  /properties",
            "POST /reset",
            "GET  /timer",
            "POST /inject/{event}",
        ],
    }


@app.get("/network")
def get_network():
    return build_network_payload()


@app.get("/enabled-transitions")
def get_enabled():
    return {"enabled": enabled_transitions()}


@app.post("/fire/{transition_id}")
def fire(transition_id: str):
    if transition_id not in TRANSITIONS_DEF:
        return JSONResponse(
            status_code=422,
            content={
                "error": "validation",
                "reason": f"Transition inconnue : {transition_id}",
            },
        )

    if not is_enabled(transition_id):
        return JSONResponse(
            status_code=409,
            content={
                "error": "conflict",
                "reason": (
                    f"Transition {transition_id} bloquée : "
                    f"entrées insuffisantes dans le marquage courant."
                ),
            },
        )

    fire_in_place(transition_id)
    state["step_count"] += 1

    return {
        "fired_transition": transition_id,
        "marking_vector": dict(state["marking"]),
        "timestamp": now_iso(),
    }


@app.get("/properties")
def get_properties():
    return build_constraints_payload()


@app.post("/reset")
def reset():
    state["marking"] = dict(M0)
    state["step_count"] = 0
    return build_network_payload()


@app.get("/timer")
def get_timer():
    elapsed = time.time() - SERVER_START
    seconds = int(10 - (elapsed % 10))
    return {
        "ticks_elapsed": round(elapsed, 2),
        "seconds_before_forced_change": seconds,
        "current_phase": current_phase(),
    }


INJECT_TARGET = {
    "voiture_ns": "P7",
    "voiture_eo": "P8",
    "pieton":     "P9",
    "bus":        "P11",
    "urgence":    "P13",
}


@app.post("/inject/{event}")
def inject(event: str):
    if event not in INJECT_TARGET:
        return JSONResponse(
            status_code=422,
            content={
                "error": "validation",
                "reason": f"Événement inconnu : {event}",
            },
        )

    place = INJECT_TARGET[event]
    state["marking"][place] = state["marking"].get(place, 0) + 1

    return {
        "fired_transition": f"inject:{event}",
        "marking_vector": dict(state["marking"]),
        "timestamp": now_iso(),
    }