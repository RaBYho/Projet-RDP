/**
 * Catégories du réseau de Petri — source de vérité unique.
 *
 * Règle stricte du briefing : 4 catégories, couleurs fixes,
 * jamais renommées. Mapping direct avec les 4 domaines fonctionnels :
 *   normal   → trafic standard NS/EO (bleu)
 *   bus      → priorité bus RFID (orange)
 *   urgence  → préemption SAMU (rouge)
 *   pieton   → passage piéton sécurisé (violet)
 *
 * Les clés correspondent exactement au champ `category` renvoyé
 * par l'API pour les transitions et (à terme) les places.
 */

/**
 * Configuration complète d'une catégorie.
 *
 * @typedef {Object} CategoryConfig
 * @property {string} key        - identifiant (clé de l'API)
 * @property {string} label      - libellé court (badges, filtres)
 * @property {string} longLabel  - libellé long (légende du canvas)
 * @property {string} stroke     - couleur principale (contours SVG, arcs)
 * @property {string} fill       - couleur de remplissage (nœuds actifs)
 * @property {string} soft       - fond pastel (badges soft, backgrounds)
 * @property {string} text       - couleur de texte (labels sur fond clair)
 * @property {string} hex        - code hex brut (pour SVG inline)
 * @property {string} icon       - nom Material Symbols associé
 */

/** @type {Record<string, CategoryConfig>} */
export const CATEGORIES = {
  normal: {
    key: "normal",
    label: "Normal",
    longLabel: "Trafic standard (NS / EO)",
    stroke: "text-primary",
    fill: "fill-primary",
    soft: "bg-primary-soft",
    text: "text-primary",
    hex: "#2563EB",
    icon: "traffic",
  },
  bus: {
    key: "bus",
    label: "Bus",
    longLabel: "Priorité Bus (RFID)",
    stroke: "text-tertiary",
    fill: "fill-tertiary",
    soft: "bg-tertiary-soft",
    text: "text-tertiary",
    hex: "#D97706",
    icon: "directions_bus",
  },
  urgence: {
    key: "urgence",
    label: "Urgence",
    longLabel: "Préemption Urgence (SAMU)",
    stroke: "text-danger",
    fill: "fill-danger",
    soft: "bg-danger-soft",
    text: "text-danger",
    hex: "#DC2626",
    icon: "e911_emergency",
  },
  pieton: {
    key: "pieton",
    label: "Piéton",
    longLabel: "Sécurité Flux Piétons",
    stroke: "text-pedestrian",
    fill: "fill-pedestrian",
    soft: "bg-pedestrian-soft",
    text: "text-pedestrian",
    hex: "#7C3AED",
    icon: "directions_walk",
  },
};

/**
 * Ordre canonique d'affichage (filtres, légendes).
 * Ne pas modifier sans mettre à jour les composants consommateurs.
 */
export const CATEGORY_ORDER = ["normal", "bus", "urgence", "pieton"];

/**
 * Récupère la configuration d'une catégorie avec fallback sûr.
 * Si la catégorie est inconnue, retourne `normal` (défaut du briefing).
 *
 * @param {string} key
 * @returns {CategoryConfig}
 */
export function getCategory(key) {
  return CATEGORIES[key] ?? CATEGORIES.normal;
}

/**
 * Liste prête à l'emploi pour un filtre "Tout + 4 catégories".
 * Format compatible avec les options de SegmentedControl.
 */
export const CATEGORY_FILTER_OPTIONS = [
  { value: "all", label: "Tout" },
  ...CATEGORY_ORDER.map((key) => ({
    value: key,
    label: CATEGORIES[key].label,
    icon: CATEGORIES[key].icon,
  })),
];
