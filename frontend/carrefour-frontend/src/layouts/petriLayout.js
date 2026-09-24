/**
 * Layout du graphe Petri — positions fixes sur le canvas SVG (v3).
 *
 * Canvas logique : 1080 × 680
 *
 * Organisation en 5 zones :
 *   ┌────────────┬──────────────────────┬──────────────┐
 *   │  FILES     │   CYCLE DES FEUX     │   URGENCE    │
 *   │  (gauche)  │      (centre)        │   (droite)   │
 *   │            │                      │              │
 *   │  P7   P8   │  P1→T1→P2→T2→P3→T3  │  P13_NS      │
 *   │  P16  P17  │  P4→T4→P5→T5→P6→T6  │  P13_EO      │
 *   │            │                      │              │
 *   │            │   P15 (timer, hub)   │              │
 *   ├────────────┴──────────────────────┴──────────────┤
 *   │                PIÉTON (bas)                       │
 *   │                P9 → T9 → P10 → T10                │
 *   └───────────────────────────────────────────────────┘
 */

/* ------------------------------------------------------------------ */
/* Dimensions du canvas                                                */
/* ------------------------------------------------------------------ */
export const VIEWBOX = {
  width: 1080,
  height: 680,
};

/* ------------------------------------------------------------------ */
/* Dimensions des éléments                                             */
/* ------------------------------------------------------------------ */
export const PLACE_RADIUS = 18;
export const PLACE_RADIUS_HUB = 22;
export const TOKEN_RADIUS = 3;

export const TRANSITION_WIDTH = 8;
export const TRANSITION_HEIGHT = 30;

export const PLACE_LABEL_OFFSET = 28;

/* ------------------------------------------------------------------ */
/* POSITIONS DES PLACES                                                */
/* ------------------------------------------------------------------ */
export const PLACE_POSITIONS = {
  /* ---- CYCLE DES FEUX NS (ligne haute, x croissant) ---- */
  P1: { x: 360, y: 100 }, // Feu NS vert
  P2: { x: 540, y: 100 }, // Feu NS orange
  P3: { x: 720, y: 100 }, // Feu NS rouge

  /* ---- CYCLE DES FEUX EO (ligne basse) ---- */
  P4: { x: 360, y: 340 }, // Feu EO vert
  P5: { x: 540, y: 340 }, // Feu EO orange
  P6: { x: 720, y: 340 }, // Feu EO rouge

  /* ---- HUB central (timer) ---- */
  P15: { x: 540, y: 220 }, // Timer cycle

  /* ---- FILES D'ATTENTE (colonne gauche) ---- */
  P7: { x: 100, y: 100 }, // File NS Nord  (↓)
  P8: { x: 100, y: 220 }, // File EO Ouest (→)
  P16: { x: 100, y: 340 }, // File NS Sud   (↑)
  P17: { x: 100, y: 460 }, // File EO Est   (←)

  /* ---- PIÉTON (bas, sous le cycle) ---- */
  P9: { x: 360, y: 540 }, // Appel piéton
  P10: { x: 540, y: 540 }, // Traversée piéton

  /* ---- URGENCE (colonne droite) ---- */
  P13_NS: { x: 900, y: 160 }, // Balise urgence NS
  P14_NS: { x: 900, y: 260 }, // Préemption NS active
  P13_EO: { x: 900, y: 400 }, // Balise urgence EO
  P14_EO: { x: 900, y: 500 }, // Préemption EO active
};

/* ------------------------------------------------------------------ */
/* POSITIONS DES TRANSITIONS                                           */
/* ------------------------------------------------------------------ */
export const TRANSITION_POSITIONS = {
  /* ---- Cycle NS : T1 (P1→P2), T2 (P2→P3), T3 (P3→P1) ---- */
  T1: { x: 450, y: 100 },
  T2: { x: 630, y: 100 },
  T3: { x: 810, y: 100 }, // boucle retour P3 → P1

  /* ---- Cycle EO : T4 (P4→P5), T5 (P5→P6), T6 (P6→P4) ---- */
  T4: { x: 450, y: 340 },
  T5: { x: 630, y: 340 },
  T6: { x: 810, y: 340 }, // boucle retour P6 → P4

  /* ---- Timer (P15 hub) ---- */
  T15: { x: 540, y: 150 }, // tick (au-dessus de P15)
  T16: { x: 540, y: 290 }, // reset (en dessous de P15)

  /* ---- Files → timer ---- */
  T7: { x: 220, y: 130 }, // File NS Nord → P15
  T8: { x: 220, y: 220 }, // File EO Ouest → P15
  T17: { x: 220, y: 340 }, // File NS Sud → P15
  T18: { x: 220, y: 460 }, // File EO Est → P15

  /* ---- Piéton ---- */
  T9: { x: 450, y: 540 }, // Appel → Traversée
  T10: { x: 630, y: 540 }, // Fin traversée

  /* ---- Urgence NS ---- */
  T13_NS: { x: 900, y: 210 }, // Balise NS → Préemption NS
  T14_NS: { x: 1000, y: 210 }, // Fin préemption NS

  /* ---- Urgence EO ---- */
  T13_EO: { x: 900, y: 450 }, // Balise EO → Préemption EO
  T14_EO: { x: 1000, y: 450 }, // Fin préemption EO
};

/* ------------------------------------------------------------------ */
/* HELPERS                                                             */
/* ------------------------------------------------------------------ */
export function getPlacePosition(placeId) {
  return PLACE_POSITIONS[placeId] ?? null;
}

export function getTransitionPosition(transitionId) {
  return TRANSITION_POSITIONS[transitionId] ?? null;
}

export function getPlaceRadius(placeId) {
  return placeId === "P15" ? PLACE_RADIUS_HUB : PLACE_RADIUS;
}
