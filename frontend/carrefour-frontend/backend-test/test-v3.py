"""
Test d'intégration — Backend v3 Carrefour Intelligent
======================================================

Vérifie les scénarios critiques :
  1. Urgence NS : injection → fire T13_NS → cycle EO bloqué
  2. Fin d'urgence NS : fire T14_NS → cycle reprend
  3. Piéton bloque urgence : P10 = 1 → fire T13_NS renvoie 409

Prérequis :
  - Backend lancé sur http://localhost:8000
  - pip install requests

Lancement :
  python test_v3.py
"""

import sys
import requests
from typing import Optional

BASE_URL = "http://localhost:8000"

# ---------------------------------------------------------------------
# Couleurs ANSI pour la lisibilité du terminal
# ---------------------------------------------------------------------
class C:
    RESET = "\033[0m"
    BOLD = "\033[1m"
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    DIM = "\033[2m"


# ---------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------
def header(title: str) -> None:
    print()
    print(f"{C.BOLD}{C.BLUE}{'═' * 70}{C.RESET}")
    print(f"{C.BOLD}{C.BLUE}  {title}{C.RESET}")
    print(f"{C.BOLD}{C.BLUE}{'═' * 70}{C.RESET}")


def step(desc: str) -> None:
    print(f"\n{C.BOLD}▶ {desc}{C.RESET}")


def ok(msg: str) -> None:
    print(f"  {C.GREEN}✓{C.RESET} {msg}")


def fail(msg: str) -> None:
    print(f"  {C.RED}✗ {msg}{C.RESET}")


def info(msg: str) -> None:
    print(f"  {C.DIM}{msg}{C.RESET}")


def warn(msg: str) -> None:
    print(f"  {C.YELLOW}⚠ {msg}{C.RESET}")


def call(method: str, path: str) -> dict:
    """Effectue une requête HTTP et retourne {status, data}."""
    url = f"{BASE_URL}{path}"
    try:
        if method == "GET":
            r = requests.get(url, timeout=5)
        elif method == "POST":
            r = requests.post(url, timeout=5)
        else:
            raise ValueError(f"Méthode inconnue : {method}")
    except requests.exceptions.ConnectionError:
        print(f"\n{C.RED}✗ Backend injoignable sur {BASE_URL}{C.RESET}")
        print(f"{C.DIM}  Lance d'abord : uvicorn main:app --reload --port 8000{C.RESET}")
        sys.exit(1)

    try:
        data = r.json()
    except Exception:
        data = {"raw": r.text}

    return {"status": r.status_code, "data": data}


def get_marking() -> dict:
    """Retourne le marking_vector courant."""
    r = call("GET", "/network")
    return r["data"].get("marking_vector", {})


def get_enabled() -> list:
    """Retourne la liste des transitions franchissables."""
    r = call("GET", "/enabled-transitions")
    return r["data"].get("enabled", [])


def assert_marking(expected: dict, label: str = "") -> bool:
    """Vérifie que le marking contient les valeurs attendues."""
    m = get_marking()
    all_ok = True
    for place, expected_val in expected.items():
        actual = m.get(place, 0)
        if actual == expected_val:
            ok(f"{place} = {actual}  {C.DIM}(attendu {expected_val}){C.RESET}")
        else:
            fail(f"{place} = {actual}  {C.DIM}(attendu {expected_val}){C.RESET}")
            all_ok = False
    return all_ok


def assert_disabled(transitions: list, label: str = "") -> bool:
    """Vérifie que les transitions données ne sont PAS dans /enabled."""
    enabled = get_enabled()
    all_ok = True
    for t in transitions:
        if t not in enabled:
            ok(f"{t} bien bloquée  {C.DIM}(inhibiteur actif){C.RESET}")
        else:
            fail(f"{t} est franchissable  {C.DIM}(devrait être bloquée){C.RESET}")
            all_ok = False
    return all_ok


def assert_enabled(transitions: list) -> bool:
    """Vérifie que les transitions données SONT dans /enabled."""
    enabled = get_enabled()
    all_ok = True
    for t in transitions:
        if t in enabled:
            ok(f"{t} franchissable")
        else:
            fail(f"{t} bloquée  {C.DIM}(devrait être franchissable){C.RESET}")
            all_ok = False
    return all_ok


def assert_status(result: dict, expected: int) -> bool:
    """Vérifie le code HTTP."""
    if result["status"] == expected:
        ok(f"HTTP {expected}  {C.DIM}(attendu {expected}){C.RESET}")
        return True
    else:
        fail(f"HTTP {result['status']}  {C.DIM}(attendu {expected}){C.RESET}")
        if "reason" in result["data"]:
            info(f"reason : {result['data']['reason']}")
        return False


# ---------------------------------------------------------------------
# Reset
# ---------------------------------------------------------------------
def reset() -> None:
    call("POST", "/reset")
    info("Réseau réinitialisé à M₀")


# ---------------------------------------------------------------------
# Scénario 1 — Urgence NS
# ---------------------------------------------------------------------
def test_urgence_ns() -> bool:
    header("SCÉNARIO 1 — Urgence NS : préemption et libération")
    reset()
    all_ok = True

    # --- 1. Injection urgence NS ---
    step("1. Injection d'une urgence sur l'axe NS")
    r = call("POST", "/inject/urgence_n")
    all_ok &= assert_status(r, 200)
    all_ok &= assert_marking({"P13_NS": 1}, "P13_NS doit être marqué")

    # --- 2. Fire T13_NS → activation préemption ---
    step("2. Tir de T13_NS (activation de la préemption)")
    r = call("POST", "/fire/T13_NS")
    all_ok &= assert_status(r, 200)
    info(f"Transition tirée : {r['data'].get('fired_transition')}")

    step("   → Vérification du marquage après activation")
    all_ok &= assert_marking({
        "P14_NS": 1,   # préemption active
        "P13_NS": 0,   # balise consommée
        "P1": 1,       # feu NS vert (forcé)
        "P6": 1,       # feu EO rouge (forcé)
    }, "État d'urgence NS")

    # --- 3. Cycle EO bloqué ---
    step("3. Vérification que le cycle EO est bloqué")
    all_ok &= assert_disabled(["T4", "T5", "T6"])
    info("Ces transitions ne peuvent pas être tirées tant que P14_NS = 1")

    # --- 4. Fin d'urgence ---
    step("4. Fin d'urgence : tir de T14_NS")
    r = call("POST", "/fire/T14_NS")
    all_ok &= assert_status(r, 200)

    step("   → Vérification du marquage après libération")
    all_ok &= assert_marking({
        "P14_NS": 0,   # préemption levée
    }, "Fin d'urgence")

    step("5. Vérification que le cycle EO est de nouveau accessible")
    # T4 est franchissable si P4 = 1. Or après urgence, P4 = 0 (feu EO était rouge).
    # Le feu EO reprend son cycle normal via T6 si P6 = 1.
    all_ok &= assert_enabled(["T6"])
    info("T6 permet la reprise du cycle EO (P6 → P4)")

    return all_ok


# ---------------------------------------------------------------------
# Scénario 2 — Piéton bloque urgence
# ---------------------------------------------------------------------
def test_pieton_bloque_urgence() -> bool:
    header("SCÉNARIO 2 — Piéton en traversée bloque l'urgence")
    reset()
    all_ok = True

    # --- 1. Injection piéton ---
    step("1. Injection d'un appel piéton")
    r = call("POST", "/inject/pieton")
    all_ok &= assert_status(r, 200)
    all_ok &= assert_marking({"P9": 1})

    # --- 2. Fire T9 → démarrage traversée ---
    step("2. Tir de T9 (démarrage de la traversée)")
    r = call("POST", "/fire/T9")
    all_ok &= assert_status(r, 200)
    all_ok &= assert_marking({
        "P9": 0,
        "P10": 1,   # traversée en cours
    })

    # --- 3. Injection urgence NS ---
    step("3. Injection d'une urgence NS pendant la traversée")
    r = call("POST", "/inject/urgence_n")
    all_ok &= assert_status(r, 200)
    all_ok &= assert_marking({"P13_NS": 1})

    # --- 4. Tentative de fire T13_NS → doit être bloqué par l'inhibiteur P10 ---
    step("4. Tentative de fire T13_NS → DOIT être bloqué (409)")
    r = call("POST", "/fire/T13_NS")
    all_ok &= assert_status(r, 409)
    if "reason" in r["data"]:
        info(f"Message backend : {r['data']['reason']}")

    step("   → Vérification que la préemption n'a PAS été activée")
    m = get_marking()
    if m.get("P14_NS", 0) == 0:
        ok("P14_NS = 0 (préemption non activée)")
    else:
        fail(f"P14_NS = {m.get('P14_NS')} (devrait être 0)")
        all_ok = False

    if m.get("P13_NS", 0) == 1:
        ok("P13_NS = 1 (balise conservée, non consommée)")
    else:
        fail(f"P13_NS = {m.get('P13_NS')} (devrait être 1)")
        all_ok = False

    # --- 5. Fin de la traversée piétonne ---
    step("5. Fin de traversée (T10) → la balise peut maintenant être traitée")
    r = call("POST", "/fire/T10")
    all_ok &= assert_status(r, 200)
    all_ok &= assert_marking({"P10": 0, "P13_NS": 1})

    step("6. Nouvelle tentative de fire T13_NS → doit maintenant réussir")
    r = call("POST", "/fire/T13_NS")
    all_ok &= assert_status(r, 200)
    all_ok &= assert_marking({
        "P14_NS": 1,
        "P1": 1,
        "P6": 1,
    })

    return all_ok


# ---------------------------------------------------------------------
# Scénario 3 — Exclusion mutuelle des urgences
# ---------------------------------------------------------------------
def test_exclusion_urgences() -> bool:
    header("SCÉNARIO 3 — Exclusion mutuelle des urgences NS / EO")
    reset()
    all_ok = True

    # Activer urgence NS
    step("1. Activation urgence NS")
    call("POST", "/inject/urgence_n")
    r = call("POST", "/fire/T13_NS")
    all_ok &= assert_status(r, 200)
    all_ok &= assert_marking({"P14_NS": 1})

    # Essayer d'activer urgence EO pendant que NS est actif
    step("2. Tentative d'activation urgence EO (doit échouer)")
    r = call("POST", "/inject/urgence_e")
    all_ok &= assert_status(r, 200)
    all_ok &= assert_marking({"P13_EO": 1})

    step("3. Fire T13_EO → DOIT être bloqué (409)")
    r = call("POST", "/fire/T13_EO")
    all_ok &= assert_status(r, 409)

    step("4. Vérification que P14_EO reste à 0")
    m = get_marking()
    if m.get("P14_EO", 0) == 0:
        ok("P14_EO = 0 (exclusion respectée)")
    else:
        fail(f"P14_EO = {m.get('P14_EO')} (devrait être 0)")
        all_ok = False

    return all_ok


# ---------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------
def main() -> int:
    print(f"{C.BOLD}Test d'intégration — Backend v3 Carrefour Intelligent{C.RESET}")
    print(f"{C.DIM}Cible : {BASE_URL}{C.RESET}")

    # Vérification de la connexion
    try:
        r = requests.get(f"{BASE_URL}/", timeout=3)
        info(f"Backend connecté — version : {r.json().get('service', 'unknown')}")
    except Exception:
        print(f"\n{C.RED}✗ Backend injoignable sur {BASE_URL}{C.RESET}")
        print(f"{C.DIM}  Lance d'abord : uvicorn main:app --reload --port 8000{C.RESET}")
        return 1

    results = {
        "Urgence NS":              test_urgence_ns(),
        "Piéton bloque urgence":   test_pieton_bloque_urgence(),
        "Exclusion urgences":      test_exclusion_urgences(),
    }

    # Bilan final
    header("BILAN FINAL")
    total = len(results)
    passed = sum(1 for v in results.values() if v)

    for name, result in results.items():
        symbol = f"{C.GREEN}✓{C.RESET}" if result else f"{C.RED}✗{C.RESET}"
        print(f"  {symbol} {name}")

    print()
    if passed == total:
        print(f"{C.BOLD}{C.GREEN}  ✅ Tous les scénarios réussis ({passed}/{total}){C.RESET}")
        return 0
    else:
        print(f"{C.BOLD}{C.RED}  ❌ {passed}/{total} scénarios réussis{C.RESET}")
        return 1


if __name__ == "__main__":
    sys.exit(main())