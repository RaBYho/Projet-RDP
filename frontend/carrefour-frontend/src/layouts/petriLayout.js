/**
 * Layout du graphe Petri — Carrefour Intelligent
 * Version UI/UX v4
 *
 * Philosophie :
 *   - lecture de gauche → droite pour les flux principaux ;
 *   - deux cycles de feux parfaitement alignés ;
 *   - timer comme hub central, mais visuellement secondaire ;
 *   - files à gauche ;
 *   - urgences à droite ;
 *   - piétons isolés dans une zone inférieure ;
 *   - marges suffisantes pour éviter l'effet "graphe comprimé".
 *
 * Canvas logique : 1200 × 760
 *
 * Organisation :
 *
 *   ┌──────────────┬──────────────────────────────────┬────────────────────┐
 *   │    FILES     │          CYCLE DES FEUX          │      URGENCES      │
 *   │              │                                  │                    │
 *   │ P7 → T7      │ P1 → T1 → P2 → T2 → P3          │ P13_NS → T13 → P14 │
 *   │ P8 → T8      │                                  │                    │
 *   │ P16 → T17    │ P4 → T4 → P5 → T5 → P6          │ P13_EO → T13 → P14 │
 *   │ P17 → T18    │                                  │                    │
 *   │              │              P15                 │                    │
 *   ├──────────────┴──────────────────────────────────┴────────────────────┤
 *   │                         PIÉTON / TRAVERSÉE                           │
 *   │                     P9 → T9 → P10 → T10                              │
 *   └──────────────────────────────────────────────────────────────────────┘
 */

// ---------------------------------------------------------------------------
// Dimensions du canvas
// ---------------------------------------------------------------------------

export const VIEWBOX = {
  width: 1200,
  height: 760,
};

// ---------------------------------------------------------------------------
// Marges et zones
// ---------------------------------------------------------------------------

export const GRAPH_PADDING = {
  top: 60,
  right: 50,
  bottom: 50,
  left: 50,
};

export const GRAPH_ZONES = {
  queues: {
    x: 60,
    width: 260,
  },

  lights: {
    x: 340,
    width: 560,
  },

  emergency: {
    x: 920,
    width: 230,
  },

  pedestrian: {
    y: 570,
    height: 140,
  },
};

// ---------------------------------------------------------------------------
// Dimensions des éléments
// ---------------------------------------------------------------------------

export const PLACE_RADIUS = 19;

export const PLACE_RADIUS_HUB = 23;

export const TOKEN_RADIUS = 3.2;

export const TRANSITION_WIDTH = 9;

export const TRANSITION_HEIGHT = 34;

export const PLACE_LABEL_OFFSET = 30;

// ---------------------------------------------------------------------------
// Axes visuels
// ---------------------------------------------------------------------------

export const GRAPH_LANES = {
  NS: 145,
  EO: 405,
  PEDESTRIAN: 650,
};

// ---------------------------------------------------------------------------
// POSITIONS DES PLACES
// ---------------------------------------------------------------------------

export const PLACE_POSITIONS = {
  // -------------------------------------------------------------------------
  // CYCLE NS
  // -------------------------------------------------------------------------

  P1: { x: 420, y: GRAPH_LANES.NS },
  P2: { x: 600, y: GRAPH_LANES.NS },
  P3: { x: 780, y: GRAPH_LANES.NS },

  // -------------------------------------------------------------------------
  // CYCLE EO
  // -------------------------------------------------------------------------

  P4: { x: 420, y: GRAPH_LANES.EO },
  P5: { x: 600, y: GRAPH_LANES.EO },
  P6: { x: 780, y: GRAPH_LANES.EO },

  // -------------------------------------------------------------------------
  // HUB TIMER
  //
  // Placé exactement entre les deux axes pour montrer qu'il
  // coordonne le cycle sans devenir l'élément principal.
  // -------------------------------------------------------------------------

  P15: { x: 600, y: 275 },

  // -------------------------------------------------------------------------
  // FILES D'ATTENTE
  //
  // Alignées sur une colonne dédiée à gauche.
  // -------------------------------------------------------------------------

  P7: { x: 120, y: GRAPH_LANES.NS },

  P8: { x: 120, y: 275 },

  P16: { x: 120, y: GRAPH_LANES.EO },

  P17: { x: 120, y: 535 },

  // -------------------------------------------------------------------------
  // PIÉTON
  // -------------------------------------------------------------------------

  P9: {
    x: 440,
    y: GRAPH_LANES.PEDESTRIAN,
  },

  P10: {
    x: 620,
    y: GRAPH_LANES.PEDESTRIAN,
  },

  // -------------------------------------------------------------------------
  // URGENCE NS
  //
  // Lecture gauche → droite :
  // détection → préemption → fin
  // -------------------------------------------------------------------------

  P13_NS: { x: 955, y: 145 },

  P14_NS: { x: 1080, y: 145 },

  // -------------------------------------------------------------------------
  // URGENCE EO
  // -------------------------------------------------------------------------

  P13_EO: { x: 955, y: 405 },

  P14_EO: { x: 1080, y: 405 },
};

// ---------------------------------------------------------------------------
// POSITIONS DES TRANSITIONS
// ---------------------------------------------------------------------------

export const TRANSITION_POSITIONS = {
  // -------------------------------------------------------------------------
  // CYCLE NS
  // -------------------------------------------------------------------------

  T1: {
    x: 510,
    y: GRAPH_LANES.NS,
  },

  T2: {
    x: 690,
    y: GRAPH_LANES.NS,
  },

  /**
   * Transition de retour P3 → P1.
   *
   * Elle est volontairement placée sous P3 afin que le retour
   * puisse être dessiné avec une courbe plutôt qu'une ligne
   * diagonale qui traverserait tout le graphe.
   */
  T3: {
    x: 780,
    y: 215,
  },

  // -------------------------------------------------------------------------
  // CYCLE EO
  // -------------------------------------------------------------------------

  T4: {
    x: 510,
    y: GRAPH_LANES.EO,
  },

  T5: {
    x: 690,
    y: GRAPH_LANES.EO,
  },

  /**
   * Retour P6 → P4.
   */
  T6: {
    x: 780,
    y: 475,
  },

  // -------------------------------------------------------------------------
  // TIMER
  // -------------------------------------------------------------------------

  /**
   * T15 est placé au-dessus du hub.
   *
   * Visuellement :
   *
   *       T15
   *        ↓
   *       P15
   *        ↓
   *       T16
   */
  T15: {
    x: 600,
    y: 220,
  },

  T16: {
    x: 600,
    y: 330,
  },

  // -------------------------------------------------------------------------
  // FILES NS / EO
  // -------------------------------------------------------------------------

  T7: {
    x: 230,
    y: GRAPH_LANES.NS,
  },

  T8: {
    x: 230,
    y: 275,
  },

  T17: {
    x: 230,
    y: GRAPH_LANES.EO,
  },

  T18: {
    x: 230,
    y: 535,
  },

  // -------------------------------------------------------------------------
  // PIÉTON
  // -------------------------------------------------------------------------

  T9: {
    x: 530,
    y: GRAPH_LANES.PEDESTRIAN,
  },

  T10: {
    x: 710,
    y: GRAPH_LANES.PEDESTRIAN,
  },

  // -------------------------------------------------------------------------
  // URGENCE NS
  // -------------------------------------------------------------------------

  T13_NS: {
    x: 1015,
    y: 145,
  },

  T14_NS: {
    x: 1140,
    y: 145,
  },

  // -------------------------------------------------------------------------
  // URGENCE EO
  // -------------------------------------------------------------------------

  T13_EO: {
    x: 1015,
    y: 405,
  },

  T14_EO: {
    x: 1140,
    y: 405,
  },
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

export function getPlacePosition(placeId) {
  return PLACE_POSITIONS[placeId] ?? null;
}

export function getTransitionPosition(transitionId) {
  return TRANSITION_POSITIONS[transitionId] ?? null;
}

export function getPlaceRadius(placeId) {
  return placeId === "P15" ? PLACE_RADIUS_HUB : PLACE_RADIUS;
}
