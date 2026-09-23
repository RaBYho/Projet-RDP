/**
 * Layout du graphe Petri — positions fixes sur le canvas SVG.
 *
 * IMPORTANT : ce fichier est PRÉSENTATIONNEL, pas métier.
 * L'API /network ne fournit pas de coordonnées. On les fixe ici,
 * extraites du mockup initial (Schema Petri, vue formelle).
 *
 * Convention :
 *   - Origine en haut à gauche (0, 0)
 *   - Axe x vers la droite
 *   - Axe y vers le bas
 *   - Canvas logique : 980 × 560 (scalé par preserveAspectRatio)
 *
 * Les positions sont centrées sur l'élément (pas son coin).
 *
 * Topologie spatiale :
 *   ┌──────────────────────────────────────────────────────┐
 *   │ File NS → ○─T1─○─T2─○─T3⤴  Bus: ○─T11─○─T12⤴        │
 *   │  P7       P1   P2  P3  P11   P12                     │
 *   │                                                       │
 *   │         [T7]─→ P15 (Timer) ←─[T8]                    │
 *   │                  ↑↓ T15/T16                          │
 *   │                                                       │
 *   │ File EO → ○─T4─○─T5─○─T6⤴  Piéton: ○─T9─○─T10⤴      │
 *   │  P8       P4   P5  P6     P9   P10                   │
 *   │                                                       │
 *   │              Urgence: ○─T13─○─T14⤴                    │
 *   │                        P13  P14                       │
 *   └──────────────────────────────────────────────────────┘
 */

/* ------------------------------------------------------------------ */
/* Dimensions du canvas logique                                        */
/* ------------------------------------------------------------------ */
export const VIEWBOX = {
  width: 980,
  height: 560,
};

/* ------------------------------------------------------------------ */
/* Rayons et dimensions des éléments                                   */
/* ------------------------------------------------------------------ */
export const PLACE_RADIUS = 18; // rayon standard d'une place
export const PLACE_RADIUS_HUB = 22; // place "hub" (P15 = timer central)
export const TOKEN_RADIUS = 3; // rayon d'un jeton individuel

export const TRANSITION_WIDTH = 8; // largeur d'un rectangle de transition
export const TRANSITION_HEIGHT = 30; // hauteur d'un rectangle de transition

/* Décalage vertical du label sous la place (en px) */
export const PLACE_LABEL_OFFSET = 28;

/* ------------------------------------------------------------------ */
/* Positions des PLACES (P1 → P15)                                     */
/* ------------------------------------------------------------------ */
export const PLACE_POSITIONS = {
  // Cycle NS (haut, gauche → droite)
  P1: { x: 110, y: 120 }, // Feu NS vert
  P2: { x: 270, y: 120 }, // Feu NS orange
  P3: { x: 430, y: 120 }, // Feu NS rouge

  // Cycle EO (bas, gauche → droite)
  P4: { x: 110, y: 400 }, // Feu EO vert
  P5: { x: 270, y: 400 }, // Feu EO orange
  P6: { x: 430, y: 400 }, // Feu EO rouge

  // Files d'attente (bord gauche)
  P7: { x: 100, y: 220 }, // File NS
  P8: { x: 100, y: 310 }, // File EO

  // Circuit piéton (milieu droit)
  P9: { x: 630, y: 280 }, // Appel piéton
  P10: { x: 790, y: 280 }, // Traversée piéton

  // Circuit bus (haut droit)
  P11: { x: 630, y: 140 }, // RFID bus
  P12: { x: 790, y: 140 }, // Priorité bus active

  // Circuit urgence (bas droit)
  P13: { x: 630, y: 420 }, // Balise urgence
  P14: { x: 790, y: 420 }, // Verrou urgence

  // Hub central (timer)
  P15: { x: 460, y: 260 }, // Timer cycle
};

/* ------------------------------------------------------------------ */
/* Positions des TRANSITIONS (T1 → T16)                                */
/* ------------------------------------------------------------------ */
export const TRANSITION_POSITIONS = {
  // Cycle NS
  T1: { x: 190, y: 120 }, // NS vert → orange
  T2: { x: 350, y: 120 }, // NS orange → rouge
  T3: { x: 510, y: 120 }, // NS rouge → vert (boucle retour)

  // Cycle EO
  T4: { x: 190, y: 400 }, // EO vert → orange
  T5: { x: 350, y: 400 }, // EO orange → rouge
  T6: { x: 510, y: 400 }, // EO rouge → vert (boucle retour)

  // Files d'attente → hub timer
  T7: { x: 240, y: 200 }, // File NS → timer
  T8: { x: 240, y: 320 }, // File EO → timer

  // Circuit piéton
  T9: { x: 710, y: 280 }, // Appel piéton → traversée
  T10: { x: 870, y: 280 }, // Fin traversée (retour)

  // Circuit bus
  T11: { x: 710, y: 140 }, // Bus détecté → priorité active
  T12: { x: 870, y: 140 }, // Fin priorité (retour)

  // Circuit urgence
  T13: { x: 710, y: 420 }, // Balise → verrou urgence
  T14: { x: 870, y: 420 }, // Fin urgence (retour)

  // Hub central (timer)
  T15: { x: 460, y: 200 }, // Tick timer (au-dessus de P15)
  T16: { x: 460, y: 320 }, // Reset cycle NS (en dessous de P15)
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Retourne la position d'une place, ou `null` si inconnue.
 * @param {string} placeId
 * @returns {{x: number, y: number} | null}
 */
export function getPlacePosition(placeId) {
  return PLACE_POSITIONS[placeId] ?? null;
}

/**
 * Retourne la position d'une transition, ou `null` si inconnue.
 * @param {string} transitionId
 * @returns {{x: number, y: number} | null}
 */
export function getTransitionPosition(transitionId) {
  return TRANSITION_POSITIONS[transitionId] ?? null;
}

/**
 * Rayon applicable à une place donnée.
 * P15 (hub central) a un rayon plus grand pour signaler son rôle.
 * @param {string} placeId
 * @returns {number}
 */
export function getPlaceRadius(placeId) {
  return placeId === "P15" ? PLACE_RADIUS_HUB : PLACE_RADIUS;
}
