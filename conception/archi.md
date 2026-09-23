## Architecture Technique Corrigée — Carrefour Intelligent (Réseau de Petri)

### Stack

- **Backend** : Python + FastAPI
- **Frontend** : React
- **Communication** : REST API (polling léger, 1 requête/seconde pour le timer)
- **State management frontend** : Context API (suffisant pour la taille du projet, pas besoin de Zustand/Redux)

---

### Modèle de données (backend)

```python
Place:
  id: str
  label: str
  tokens: int
  capacity: int | None      # borne max (contrainte de bornage)
  x, y: float

Transition:
  id: str
  label: str
  inputs: list[Arc]          # places d'entrée + poids
  outputs: list[Arc]         # places de sortie + poids
  category: str              # "urgence" | "bus" | "normal" | "piéton"
  x, y: float

Arc:
  place_id: str
  weight: int

Network:
  places: list[Place]
  transitions: list[Transition]
  history: list[FiredEvent]
```

---

### Correction 1 — Résolveur de conflits (priorité)

Un service dédié `conflict_resolver.py` s'exécute **avant** chaque tir automatique :

```
Ordre d'arbitrage :
1. Urgence (P12)       → force le tir des transitions liées à l'urgence, bloque tout le reste
2. Bus prioritaire (P14) → si pas d'urgence active, priorité au tir des transitions bus
3. Présence normale (P7/P8) → sinon, cycle normal basé sur capteurs
4. Timer (P15)          → en dernier recours, si rien d'autre ne force de changement
```

Le résolveur reçoit la liste des transitions activables, filtre par catégorie selon cet ordre, et ne renvoie que celles autorisées à ce tick.

---

### Correction 2 — Validation avant tir

`POST /fire/{transition_id}` suit ce flux strict :

```
1. Vérifier que la transition est activable (jetons suffisants en entrée)
2. Vérifier que le tir ne violerait aucune contrainte de bornage (capacity)
3. Vérifier via le résolveur de conflits que cette transition a la priorité au tick courant
4. Si tout est validé → exécuter le tir, mettre à jour le marquage, logger dans history
5. Sinon → renvoyer 409 Conflict avec message explicite (ex: "transition bloquée par priorité urgence")
```

---

### Correction 3 — Timer séparé (scheduler)

Le tick n'est plus une transition (`T16` supprimé du modèle `Transition`). C'est un **service backend indépendant** :

```python
# scheduler.py
- tourne en tâche de fond (asyncio background task)
- incrémente le compteur de cycles
- si N ticks écoulés sans tir naturel → déclenche un changement de phase via le résolveur
- expose son état via GET /timer (nombre de ticks, temps avant prochain changement forcé)
```

---

### Endpoints API (mis à jour)

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/network` | structure complète + marquage courant |
| GET | `/enabled-transitions` | transitions activables, déjà filtrées par le résolveur |
| POST | `/fire/{transition_id}` | tire une transition (avec validation complète) |
| GET | `/timer` | état du scheduler (ticks écoulés, temps restant) |
| POST | `/inject/{event}` | injecte un événement externe (voiture NS/EO, piéton, urgence, bus) |
| GET | `/properties` | état des 7 contraintes (booléen + explication) |
| POST | `/reset` | remet le marquage initial |

**Codes de retour** :
- `200` → tir réussi, renvoie le nouveau marquage
- `409 Conflict` → transition non activable ou bloquée par priorité, avec `{ "reason": "..." }`
- `422` → transition_id invalide

---

### Structure des fichiers

```
carrefour-petri/
├── backend/
│   ├── main.py                # FastAPI app + routes
│   ├── petri_net.py           # classes Place, Transition, Arc, Network
│   ├── network_definition.py  # définition du carrefour
│   ├── conflict_resolver.py   # arbitrage des priorités (correction 1)
│   ├── scheduler.py           # timer indépendant (correction 3)
│   ├── properties.py          # vérification des 7 contraintes
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── NetworkContext.jsx   # state management global
│   │   ├── components/
│   │   │   ├── PetriCanvas.jsx
│   │   │   ├── Token.jsx
│   │   │   ├── ConstraintsPanel.jsx
│   │   │   └── ControlPanel.jsx
│   │   ├── api.js
│   │   └── App.jsx
│   └── package.json
└── .gitignore
```

---

### Boucle de fonctionnement (corrigée)

1. Frontend charge `/network` au démarrage → dessine places/transitions/arcs
2. Toutes les secondes → frontend appelle `/timer` (léger) pour savoir si un changement automatique a eu lieu
3. Sur clic utilisateur (injecter voiture/piéton/urgence/bus) → `POST /inject/{event}`
4. Backend résout les conflits, valide, tire si autorisé
5. Frontend récupère le nouveau marquage → anime les jetons
6. Frontend appelle `/properties` → met à jour le panneau de contraintes en clair
