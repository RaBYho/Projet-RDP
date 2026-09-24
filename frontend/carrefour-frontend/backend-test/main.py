"""
Backend de test — Carrefour Intelligent (v3)
=============================================

Contrat v3 :
  - 17 places (P1–P17, avec P13_NS/P13_EO/P14_NS/P14_EO)
  - 18 transitions (T1–T18, avec T13_NS/T13_EO/T14_NS/T14_EO)
  - 12 contraintes
  - 9 événements d'injection
  - Arcs inhibiteurs

Changements vs v2 :
  - Retrait du bus (P11, P12, T11, T12, C6)
  - Urgence scindée en 2 axes (NS / EO)
  - Fin d'urgence manuelle via fire T14_NS ou T14_EO
  - Forçage du feu de l'axe urgence au vert

Lancement :
    uvicorn main:app --reload --port 8000
"""

from datetime import datetime, timezone
from typing import Dict, List
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse


app = FastAPI(
    title="Carrefour Intelligent — Backend de test",
    description="Mock API v3 — 17 places, 18 transitions, 12 contraintes",
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

SERVER_START = time.time()


# ============================================================
# Places (17)
# ============================================================

PLACES_DEF: List[Dict] = [
    # Cycle feux NS
    {"id": "P1",  "label": "Feu NS vert",         "category": "normal",  "capacity": 1},
    {"id": "P2",  "label": "Feu NS orange",       "category": "normal",  "capacity": 1},
    {"id": "P3",  "label": "Feu NS rouge",        "category": "normal",  "capacity": 1},
    # Cycle feux EO
    {"id": "P4",  "label": "Feu EO vert",         "category": "normal",  "capacity": 1},
    {"id": "P5",  "label": "Feu EO orange",       "category": "normal",  "capacity": 1},
    {"id": "P6",  "label": "Feu EO rouge",        "category": "normal",  "capacity": 1},
    # Files d'attente
    {"id": "P7",  "label": "File NS Nord",        "category": "normal",  "capacity": 12},
    {"id": "P8",  "label": "File EO Ouest",       "category": "normal",  "capacity": 12},
    {"id": "P16", "label": "File NS Sud",         "category": "normal",  "capacity": 12},
    {"id": "P17", "label": "File EO Est",         "category": "normal",  "capacity": 12},
    # Piéton
    {"id": "P9",  "label": "Appel piéton",        "category": "pieton",  "capacity": 1},
    {"id": "P10", "label": "Traversée piéton",    "category": "pieton",  "capacity": 1},
    # Urgence NS
    {"id": "P13_NS", "label": "Balise urgence NS",     "category": "urgence", "capacity": 1},
    {"id": "P14_NS", "label": "Préemption NS active",  "category": "urgence", "capacity": 1},
    # Urgence EO
    {"id": "P13_EO", "label": "Balise urgence EO",     "category": "urgence", "capacity": 1},
    {"id": "P14_EO", "label": "Préemption EO active",  "category": "urgence", "capacity": 1},
    # Timer
    {"id": "P15", "label": "Timer cycle",         "category": "normal",  "capacity": 12},
]

PLACE_BY_ID = {p["id"]: p for p in PLACES_DEF}


# ============================================================
# Transitions (18)
# ============================================================
# Champs :
#   - inputs      : dict {place_id: weight}
#   - outputs     : dict {place_id: weight}  (peut être vide pour T14_NS/T14_EO)
#   - inhibitors  : list[place_id] (arcs inhibiteurs, désactivent la transition si M > 0)
#   - special     : optionnel, comportement spécifique au tir

TRANSITIONS_DEF: Dict[str, Dict] = {
    # ---- Cycle NS ----
    "T1": {"label": "NS vert → orange",  "category": "normal",
           "inputs": {"P1": 1}, "outputs": {"P2": 1}, "inhibitors": []},
    "T2": {"label": "NS orange → rouge", "category": "normal",
           "inputs": {"P2": 1}, "outputs": {"P3": 1}, "inhibitors": []},
    "T3": {"label": "NS rouge → vert",   "category": "normal",
           "inputs": {"P3": 1}, "outputs": {"P1": 1}, "inhibitors": []},
    # ---- Cycle EO ----
    "T4": {"label": "EO vert → orange",  "category": "normal",
           "inputs": {"P4": 1}, "outputs": {"P5": 1}, "inhibitors": ["P14_NS"]},
    "T5": {"label": "EO orange → rouge", "category": "normal",
           "inputs": {"P5": 1}, "outputs": {"P6": 1}, "inhibitors": ["P14_NS"]},
    "T6": {"label": "EO rouge → vert",   "category": "normal",
           "inputs": {"P6": 1}, "outputs": {"P4": 1}, "inhibitors": ["P14_NS"]},
    # ---- Files → timer ----
    "T7":  {"label": "File NS Nord → passage",  "category": "normal",
            "inputs": {"P7": 1},  "outputs": {"P15": 1}, "inhibitors": []},
    "T8":  {"label": "File EO Ouest → passage", "category": "normal",
            "inputs": {"P8": 1},  "outputs": {"P15": 1}, "inhibitors": []},
    "T17": {"label": "File NS Sud → passage",   "category": "normal",
            "inputs": {"P16": 1}, "outputs": {"P15": 1}, "inhibitors": []},
    "T18": {"label": "File EO Est → passage",   "category": "normal",
            "inputs": {"P17": 1}, "outputs": {"P15": 1}, "inhibitors": []},
    # ---- Piéton ----
    "T9":  {"label": "Appel piéton",   "category": "pieton",
            "inputs": {"P9": 1},  "outputs": {"P10": 1}, "inhibitors": []},
    "T10": {"label": "Fin traversée",  "category": "pieton",
            "inputs": {"P10": 1}, "outputs": {"P9": 1},  "inhibitors": []},
    # ---- Urgence NS ----
    "T13_NS": {"label": "Urgence NS détectée", "category": "urgence",
               "inputs": {"P13_NS": 1}, "outputs": {"P14_NS": 1},
               "inhibitors": ["P14_EO", "P10"],
               "special": "force_ns_green"},
    "T14_NS": {"label": "Fin préemption NS",   "category": "urgence",
               "inputs": {"P14_NS": 1}, "outputs": {}, "inhibitors": []},
    # ---- Urgence EO ----
    "T13_EO": {"label": "Urgence EO détectée", "category": "urgence",
               "inputs": {"P13_EO": 1}, "outputs": {"P14_EO": 1},
               "inhibitors": ["P14_NS", "P10"],
               "special": "force_eo_green"},
    "T14_EO": {"label": "Fin préemption EO",   "category": "urgence",
               "inputs": {"P14_EO": 1}, "outputs": {}, "inhibitors": []},
    # ---- Timer ----
    "T15": {"label": "Tick timer",       "category": "normal",
            "inputs": {"P15": 1}, "outputs": {"P15": 1}, "inhibitors": []},
    "T16": {"label": "Reset cycle",      "category": "normal",
            "inputs": {"P15": 1}, "outputs": {"P1": 1, "P6": 1}, "inhibitors": []},
}


# Marquage initial — 8 jetons
M0: Dict[str, int] = {
    "P1": 1, "P2": 0, "P3": 0,
    "P4": 0, "P5": 0, "P6": 1,
    "P7": 3, "P8": 2, "P16": 0, "P17": 0,
    "P9": 0, "P10": 0,
    "P13_NS": 0, "P14_NS": 0,
    "P13_EO": 0, "P14_EO": 0,
    "P15": 1,
}


# ============================================================
# État
# ============================================================

state = {
    "marking": dict(M0),
    "step_count": 0,
}


# ============================================================
# Helpers — logique de tir
# ============================================================

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def is_enabled(trans_id: str) -> bool:
    t = TRANSITIONS_DEF[trans_id]
    # Vérifie les entrées (Pre)
    for place, weight in t["inputs"].items():
        if state["marking"].get(place, 0) < weight:
            return False
    # Vérifie les arcs inhibiteurs (bloque si M > 0)
    for place in t.get("inhibitors", []):
        if state["marking"].get(place, 0) > 0:
            return False
    return True


def enabled_transitions() -> List[str]:
    return [tid for tid in TRANSITIONS_DEF if is_enabled(tid)]


def fire_in_place(trans_id: str) -> None:
    t = TRANSITIONS_DEF[trans_id]

    # Consomme les entrées
    for place, weight in t["inputs"].items():
        state["marking"][place] = state["marking"].get(place, 0) - weight

    # Ajoute les sorties
    for place, weight in t["outputs"].items():
        state["marking"][place] = state["marking"].get(place, 0) + weight

    # Comportement spécial : forçage de l'axe au vert
    special = t.get("special")
    if special == "force_ns_green":
        state["marking"]["P1"] = 1
        state["marking"]["P2"] = 0
        state["marking"]["P3"] = 0
        # EO reste au rouge
        state["marking"]["P4"] = 0
        state["marking"]["P5"] = 0
        state["marking"]["P6"] = 1
    elif special == "force_eo_green":
        state["marking"]["P4"] = 1
        state["marking"]["P5"] = 0
        state["marking"]["P6"] = 0
        # NS reste au rouge
        state["marking"]["P1"] = 0
        state["marking"]["P2"] = 0
        state["marking"]["P3"] = 1


def current_phase() -> str:
    if state["marking"].get("P14_NS", 0) > 0:
        return "URGENCE_NS"
    if state["marking"].get("P14_EO", 0) > 0:
        return "URGENCE_EO"
    if state["marking"].get("P10", 0) > 0:
        return "PIETON"
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
            "inhibitors": [
                {"place_id": pid}
                for pid in TRANSITIONS_DEF[tid].get("inhibitors", [])
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
            "name": "Exclusion mutuelle feux",
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
            "name": "Exclusion mutuelle urgences",
            "formal_notation": "M(P14_NS) + M(P14_EO) ≤ 1",
            "explanation": "Une seule préemption urgence active à la fois.",
            "satisfied": (m.get("P14_NS", 0) + m.get("P14_EO", 0)) <= 1,
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
            "name": "Bornage file NS Nord",
            "formal_notation": "M(P7) ≤ 12",
            "explanation": "Capacité géométrique de la file NS Nord.",
            "satisfied": m.get("P7", 0) <= 12,
        },
        {
            "id": "C6",
            "name": "Préemption NS → feu NS vert",
            "formal_notation": "M(P14_NS) = 1 ⇒ M(P1) = 1",
            "explanation": "Urgence NS force le feu NS au vert.",
            "satisfied": not (m.get("P14_NS", 0) > 0) or m.get("P1", 0) > 0,
        },
        {
            "id": "C7",
            "name": "Préemption EO → feu EO vert",
            "formal_notation": "M(P14_EO) = 1 ⇒ M(P4) = 1",
            "explanation": "Urgence EO force le feu EO au vert.",
            "satisfied": not (m.get("P14_EO", 0) > 0) or m.get("P4", 0) > 0,
        },
        {
            "id": "C8",
            "name": "Capacité NS globale",
            "formal_notation": "M(P7) + M(P16) ≤ 24",
            "explanation": "Capacité combinée des files NS (Nord + Sud).",
            "satisfied": (m.get("P7", 0) + m.get("P16", 0)) <= 24,
        },
        {
            "id": "C9",
            "name": "Capacité EO globale",
            "formal_notation": "M(P8) + M(P17) ≤ 24",
            "explanation": "Capacité combinée des files EO (Ouest + Est).",
            "satisfied": (m.get("P8", 0) + m.get("P17", 0)) <= 24,
        },
        {
            "id": "C10",
            "name": "Piéton bloque urgence",
            "formal_notation": "M(P10) = 1 ⇒ M(P14_NS) + M(P14_EO) = 0",
            "explanation": "Aucune préemption tant qu'un piéton traverse.",
            "satisfied": not (m.get("P10", 0) > 0) or (
                m.get("P14_NS", 0) + m.get("P14_EO", 0) == 0
            ),
        },
        {
            "id": "C11",
            "name": "Bornage file EO Ouest",
            "formal_notation": "M(P8) ≤ 12",
            "explanation": "Capacité géométrique de la file EO Ouest.",
            "satisfied": m.get("P8", 0) <= 12,
        },
        {
            "id": "C12",
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
        "service": "Carrefour Intelligent — Backend de test v3",
        "status": "ok",
        "schema": {"places": 17, "transitions": 18, "constraints": 12},
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
                    f"conditions d'entrée ou inhibiteurs non satisfaits."
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


# Mapping événement → place cible
INJECT_TARGET = {
    "voiture_ns":     "P7",
    "voiture_eo":     "P8",
    "voiture_ns_sud": "P16",
    "voiture_eo_est": "P17",
    "pieton":         "P9",
    "urgence_n":      "P13_NS",
    "urgence_s":      "P13_NS",
    "urgence_w":      "P13_EO",
    "urgence_e":      "P13_EO",
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