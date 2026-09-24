"""
Tests API pour le backend FastAPI du Carrefour Intelligent.
Basés sur le contrat JSON défini dans le briefing (P1-P15 / T1-T16).

Utilise TestClient : aucun serveur réel n'est lancé, tout tourne en mémoire.
Placer ce fichier dans backend/tests/test_api.py
"""

import pytest
from fastapi.testclient import TestClient
from main import app  # adapter l'import selon le nom réel du module FastAPI

client = TestClient(app)

PLACE_IDS = [f"P{i}" for i in range(1, 16)]
TRANSITION_IDS = [f"T{i}" for i in range(1, 17)]
VALID_CATEGORIES = {"normal", "bus", "urgence", "pieton"}


# ---------------------------------------------------------------------------
# GET /network
# ---------------------------------------------------------------------------

def test_get_network_status_ok():
    response = client.get("/network")
    assert response.status_code == 200


def test_get_network_has_15_places():
    data = client.get("/network").json()
    ids = [p["id"] for p in data["places"]]
    assert sorted(ids) == sorted(PLACE_IDS)


def test_get_network_has_16_transitions():
    data = client.get("/network").json()
    ids = [t["id"] for t in data["transitions"]]
    assert sorted(ids) == sorted(TRANSITION_IDS)


def test_transitions_have_valid_category():
    data = client.get("/network").json()
    for t in data["transitions"]:
        assert t["category"] in VALID_CATEGORIES, f"{t['id']} a une catégorie invalide: {t['category']}"


def test_transitions_have_enabled_field():
    data = client.get("/network").json()
    for t in data["transitions"]:
        assert isinstance(t["enabled"], bool)


def test_marking_vector_matches_places():
    data = client.get("/network").json()
    tokens_from_places = {p["id"]: p["tokens"] for p in data["places"]}
    assert data["marking_vector"] == tokens_from_places


def test_places_have_required_fields():
    data = client.get("/network").json()
    for p in data["places"]:
        assert "id" in p
        assert "label" in p
        assert "tokens" in p
        assert "capacity" in p  # peut être null (P15)


# ---------------------------------------------------------------------------
# GET /enabled-transitions
# ---------------------------------------------------------------------------

def test_enabled_transitions_status_ok():
    response = client.get("/enabled-transitions")
    assert response.status_code == 200


def test_enabled_transitions_are_valid_ids():
    data = client.get("/enabled-transitions").json()
    for t_id in data["enabled"]:
        assert t_id in TRANSITION_IDS


def test_enabled_transitions_subset_of_network():
    """Les transitions marquées enabled=true dans /network doivent
    correspondre exactement à /enabled-transitions."""
    network = client.get("/network").json()
    enabled_in_network = {t["id"] for t in network["transitions"] if t["enabled"]}
    enabled_endpoint = set(client.get("/enabled-transitions").json()["enabled"])
    assert enabled_in_network == enabled_endpoint


# ---------------------------------------------------------------------------
# POST /fire/{transition_id}
# ---------------------------------------------------------------------------

def test_fire_enabled_transition_succeeds():
    client.post("/reset")
    enabled = client.get("/enabled-transitions").json()["enabled"]
    assert len(enabled) > 0, "Aucune transition franchissable après reset, impossible de tester"

    response = client.post(f"/fire/{enabled[0]}")
    assert response.status_code == 200
    data = response.json()
    assert data["fired_transition"] == enabled[0]
    assert "marking_vector" in data
    assert "timestamp" in data


def test_fire_disabled_transition_returns_409():
    client.post("/reset")
    network = client.get("/network").json()
    disabled = [t["id"] for t in network["transitions"] if not t["enabled"]]
    assert len(disabled) > 0, "Aucune transition désactivée trouvée, impossible de tester"

    response = client.post(f"/fire/{disabled[0]}")
    assert response.status_code == 409
    assert "reason" in response.json()


def test_fire_unknown_transition_returns_422():
    response = client.post("/fire/T999")
    assert response.status_code == 422


def test_fire_updates_marking_vector():
    client.post("/reset")
    before = client.get("/network").json()["marking_vector"]
    enabled = client.get("/enabled-transitions").json()["enabled"]
    client.post(f"/fire/{enabled[0]}")
    after = client.get("/network").json()["marking_vector"]
    assert before != after, "Le marquage n'a pas changé après un tir réussi"


# ---------------------------------------------------------------------------
# GET /properties
# ---------------------------------------------------------------------------

def test_properties_returns_7_constraints():
    data = client.get("/properties").json()
    assert len(data["constraints"]) == 7


def test_properties_constraints_have_required_fields():
    data = client.get("/properties").json()
    for c in data["constraints"]:
        assert "id" in c
        assert "name" in c
        assert "satisfied" in c
        assert isinstance(c["satisfied"], bool)
        assert "formal_notation" in c
        assert "explanation" in c


# ---------------------------------------------------------------------------
# POST /reset
# ---------------------------------------------------------------------------

def test_reset_restores_initial_marking():
    client.post("/reset")
    initial = client.get("/network").json()["marking_vector"]

    enabled = client.get("/enabled-transitions").json()["enabled"]
    if enabled:
        client.post(f"/fire/{enabled[0]}")

    response = client.post("/reset")
    assert response.status_code == 200
    after_reset = client.get("/network").json()["marking_vector"]
    assert after_reset == initial


# ---------------------------------------------------------------------------
# GET /timer
# ---------------------------------------------------------------------------

def test_timer_status_ok():
    response = client.get("/timer")
    assert response.status_code == 200
    data = response.json()
    assert "ticks_elapsed" in data
    assert "seconds_before_forced_change" in data
    assert "current_phase" in data


# ---------------------------------------------------------------------------
# POST /inject/{event}
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("event", ["voiture_ns", "voiture_eo", "pieton", "urgence", "bus"])
def test_inject_valid_events(event):
    response = client.post(f"/inject/{event}")
    assert response.status_code == 200
    data = response.json()
    assert "marking_vector" in data


def test_inject_unknown_event_returns_error():
    response = client.post("/inject/inexistant")
    assert response.status_code in (404, 422)


# ---------------------------------------------------------------------------
# Scénario d'intégration : urgence force tout au rouge (contrainte C3)
# ---------------------------------------------------------------------------

def test_urgence_forces_priority():
    client.post("/reset")
    client.post("/inject/urgence")
    network = client.get("/network").json()
    marking = network["marking_vector"]

    # P12 = mode urgence actif doit être à 1
    assert marking["P12"] == 1

    # Aucune transition hors catégorie "urgence" ne doit être franchissable
    non_urgence_enabled = [
        t["id"] for t in network["transitions"]
        if t["enabled"] and t["category"] != "urgence"
    ]
    assert non_urgence_enabled == [], f"Transitions non-urgence encore actives: {non_urgence_enabled}"