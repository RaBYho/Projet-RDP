# Briefing technique — Contrat JSON de l'API "Carrefour Intelligent"

## Contexte du projet

Il s'agit d'un projet scolaire de simulation de **réseau de Petri** appliqué à un carrefour urbain intelligent (feux tricolores NS/EO, piétons, bus prioritaire, véhicule d'urgence, capteurs de présence, timer de cycle).

- **Backend** : Python + FastAPI — gère la logique du réseau de Petri, la validation des tirs, la résolution des conflits de priorité, et expose une API REST.
- **Frontend** : React — consomme cette API pour afficher un schéma Petri interactif (places/transitions/jetons animés) et une simulation 2D du carrefour.

Ce document définit le **contrat JSON exact** que le backend doit produire, afin qu'une IA (ou un développeur) puisse générer le code backend en garantissant la compatibilité avec le frontend déjà conçu.

---

## Modèle conceptuel

Le réseau comporte :
- **15 places** (P1 à P15), représentant des états (feux, files d'attente, capteurs, compteurs)
- **16 transitions** (T1 à T16), représentant des événements (changements de feu, arrivées de véhicules, déclenchements de priorité)
- **4 catégories** de transitions/places, utilisées pour le code couleur et les filtres côté frontend :
  - `normal` — cycle standard des feux NS/EO
  - `bus` — priorité bus (RFID)
  - `urgence` — préemption véhicule d'urgence (SAMU/police)
  - `pieton` — passage piéton sécurisé

**Nomenclature obligatoire** : les identifiants `P1`...`P15` et `T1`...`T16` doivent être conservés tels quels (ne pas les renommer), car le frontend React s'y réfère directement pour le rendu SVG et les animations.

---

## Endpoint 1 : `GET /network`

Retourne l'état complet du réseau au moment de l'appel.

```json
{
  "places": [
    { "id": "P1",  "label": "Feu NS vert",       "tokens": 1, "capacity": 1 },
    { "id": "P2",  "label": "Feu NS orange",      "tokens": 0, "capacity": 1 },
    { "id": "P3",  "label": "Feu NS rouge",       "tokens": 0, "capacity": 1 },
    { "id": "P4",  "label": "Feu EO vert",        "tokens": 0, "capacity": 1 },
    { "id": "P5",  "label": "Feu EO orange",      "tokens": 0, "capacity": 1 },
    { "id": "P6",  "label": "Feu EO rouge",       "tokens": 1, "capacity": 1 },
    { "id": "P7",  "label": "File NS (capteur)",  "tokens": 3, "capacity": 12 },
    { "id": "P8",  "label": "File EO (capteur)",  "tokens": 2, "capacity": 12 },
    { "id": "P9",  "label": "Bouton piéton",      "tokens": 0, "capacity": 1 },
    { "id": "P10", "label": "Feu piéton vert",    "tokens": 0, "capacity": 1 },
    { "id": "P11", "label": "Urgence détectée",   "tokens": 0, "capacity": 1 },
    { "id": "P12", "label": "Mode urgence actif", "tokens": 0, "capacity": 1 },
    { "id": "P13", "label": "Bus détecté",        "tokens": 0, "capacity": 1 },
    { "id": "P14", "label": "Mode bus actif",     "tokens": 0, "capacity": 1 },
    { "id": "P15", "label": "Compteur cycles",    "tokens": 0, "capacity": null }
  ],
  "transitions": [
    {
      "id": "T1",
      "label": "NS vert → orange",
      "category": "normal",
      "inputs":  [{ "place_id": "P1", "weight": 1 }],
      "outputs": [{ "place_id": "P2", "weight": 1 }],
      "enabled": true
    },
    {
      "id": "T3",
      "label": "EO rouge → vert",
      "category": "normal",
      "inputs": [
        { "place_id": "P3", "weight": 1 },
        { "place_id": "P6", "weight": 1 },
        { "place_id": "P8", "weight": 1 }
      ],
      "outputs": [{ "place_id": "P4", "weight": 1 }],
      "enabled": false
    },
    {
      "id": "T10",
      "label": "Urgence détectée",
      "category": "urgence",
      "inputs":  [{ "place_id": "P11", "weight": 1 }],
      "outputs": [{ "place_id": "P12", "weight": 1 }],
      "enabled": false
    }
    // ... et ainsi de suite pour T2, T4 à T9, T11 à T16
  ],
  "marking_vector": {
    "P1": 1, "P2": 0, "P3": 0, "P4": 0, "P5": 0, "P6": 1,
    "P7": 3, "P8": 2, "P9": 0, "P10": 0, "P11": 0, "P12": 0,
    "P13": 0, "P14": 0, "P15": 0
  },
  "step_count": 1840,
  "timestamp": "2026-09-23T14:32:05.420Z"
}
```

### Règles de champs

| Champ | Type | Règle |
|---|---|---|
| `places[].capacity` | int \| null | `null` = place non bornée (seule P15 dans ce projet) |
| `transitions[].category` | string | une des 4 valeurs : `normal`, `bus`, `urgence`, `pieton` |
| `transitions[].enabled` | bool | calculé côté backend par le résolveur de conflits — le frontend ne fait AUCUN calcul de validité, il affiche juste ce booléen |
| `marking_vector` | objet plat | redondant avec `places[].tokens`, mais fourni séparément pour simplifier l'affichage du panneau "vecteur d'état" côté frontend sans reparcourir tout le tableau `places` |

---

## Endpoint 2 : `GET /enabled-transitions`

Retourne uniquement la liste des IDs de transitions actuellement franchissables, déjà filtrée par le résolveur de conflits (priorité : urgence > bus > présence normale > timer).

```json
{
  "enabled": ["T1", "T7", "T15"]
}
```

---

## Endpoint 3 : `POST /fire/{transition_id}`

Déclenche le tir d'une transition. Réponse en cas de succès :

```json
{
  "fired_transition": "T1",
  "marking_vector": {
    "P1": 0, "P2": 1, "P3": 0, "P4": 0, "P5": 0, "P6": 1,
    "P7": 3, "P8": 2, "P9": 0, "P10": 0, "P11": 0, "P12": 0,
    "P13": 0, "P14": 0, "P15": 0
  },
  "timestamp": "2026-09-23T14:32:06.100Z"
}
```

**Codes d'erreur attendus :**
- `409 Conflict` si la transition n'est pas activable ou bloquée par priorité :
  ```json
  { "error": "conflict", "reason": "Transition bloquée : mode urgence actif (P12=1)" }
  ```
- `422 Unprocessable Entity` si `transition_id` n'existe pas dans le réseau

---

## Endpoint 4 : `GET /properties`

Retourne l'état des 7 contraintes formelles à afficher dans le panneau latéral.

```json
{
  "constraints": [
    {
      "id": "C1",
      "name": "Exclusion mutuelle",
      "satisfied": true,
      "formal_notation": "M(P1) + M(P4) ≤ 1",
      "explanation": "Feux NS et EO jamais verts en même temps."
    },
    {
      "id": "C2",
      "name": "Bornage files d'attente",
      "satisfied": true,
      "formal_notation": "M(P7) ≤ 12 ∧ M(P8) ≤ 12",
      "explanation": "Capacité maximale des files respectée."
    }
    // ... 5 autres contraintes suivant le même schéma
  ]
}
```

---

## Endpoint 5 : `POST /reset`

Remet le marquage initial M0. Retourne le même format que `/network`.

---

## Endpoint 6 : `GET /timer`

État du scheduler (timer indépendant, pas une transition classique) :

```json
{
  "ticks_elapsed": 42,
  "seconds_before_forced_change": 8,
  "current_phase": "NS"
}
```

---

## Contraintes techniques à respecter impérativement

1. **Ne jamais renommer** les identifiants `P1`-`P15` / `T1`-`T16` — le frontend s'y réfère en dur dans le code SVG.
2. **`category`** doit toujours être une des 4 valeurs listées — sert au filtre couleur côté React.
3. **`enabled`** est calculé côté backend uniquement — jamais côté frontend.
4. Tous les timestamps sont au format **ISO 8601** avec millisecondes.
5. Les réponses de `/fire` doivent toujours renvoyer le **marquage complet** (pas un diff), pour simplifier la synchronisation côté frontend.

---

## Ce qui est demandé à l'IA qui recevra ce briefing

Générer le code backend Python (FastAPI) qui implémente ces 6 endpoints en respectant strictement les structures JSON ci-dessus, avec :
- Le modèle de données du réseau de Petri (classes `Place`, `Transition`, `Arc`)
- Le résolveur de conflits (priorité urgence > bus > présence > timer)
- La validation avant tir (bornage + activabilité)
- Le scheduler séparé pour le timer

En cas d'ambiguïté sur une règle métier non précisée dans ce document, préférer poser une question plutôt que de supposer.
