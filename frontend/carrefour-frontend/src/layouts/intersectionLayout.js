/**
 * Layout du carrefour 2D — Simulation vue du dessus (v3)
 *
 * Changements v3 :
 *   - Couloir bus retiré
 *   - Ambulances directionnelles (4 chemins animés)
 *   - Hôpital à l'Est
 */

/* ------------------------------------------------------------------ */
/* Dimensions                                                          */
/* ------------------------------------------------------------------ */
export const VIEWBOX = { width: 800, height: 800 };
export const ROAD_WIDTH = 240;
export const INTERSECTION_HALF = ROAD_WIDTH / 2;
export const CENTER = { x: VIEWBOX.width / 2, y: VIEWBOX.height / 2 };

/* ------------------------------------------------------------------ */
/* Couleurs                                                            */
/* ------------------------------------------------------------------ */
export const COLORS = {
  canvasBg: "#0F172A",
  gridLine: "#334155",
  road: "#1E293B",
  roadEdge: "#334155",
  laneMark: "#CBD5E1",
  crosswalk: "#E2E8F0",

  lightRed: "#DC2626",
  lightAmber: "#F59E0B",
  lightGreen: "#22C55E",
  lightOff: "#334155",
  lightHousing: "#0F172A",

  carNormal: "#2563EB",
  carEO: "#0284C7",
  carEmergency: "#F8FAFC",
  carDetail: "#BAE6FD",
  carWindow: "#0F172A",
  headlight: "#FEF08A",

  sensorNS: "#3B82F6",
  sensorEO: "#EF4444",

  hospitalBg: "#F8FAFC",
  hospitalCross: "#DC2626",
  hospitalLabel: "#94A3B8",
};

/* ------------------------------------------------------------------ */
/* Voies                                                               */
/* ------------------------------------------------------------------ */
export const ROAD_NS = {
  north: {
    x: CENTER.x - INTERSECTION_HALF,
    y: 0,
    width: ROAD_WIDTH,
    height: CENTER.y - INTERSECTION_HALF,
  },
  south: {
    x: CENTER.x - INTERSECTION_HALF,
    y: CENTER.y + INTERSECTION_HALF,
    width: ROAD_WIDTH,
    height: CENTER.y - INTERSECTION_HALF,
  },
};

export const ROAD_EO = {
  west: {
    x: 0,
    y: CENTER.y - INTERSECTION_HALF,
    width: CENTER.x - INTERSECTION_HALF,
    height: ROAD_WIDTH,
  },
  east: {
    x: CENTER.x + INTERSECTION_HALF,
    y: CENTER.y - INTERSECTION_HALF,
    width: CENTER.x - INTERSECTION_HALF,
    height: ROAD_WIDTH,
  },
};

export const INTERSECTION_CENTER = {
  x: CENTER.x - INTERSECTION_HALF,
  y: CENTER.y - INTERSECTION_HALF,
  width: ROAD_WIDTH,
  height: ROAD_WIDTH,
};

/* ------------------------------------------------------------------ */
/* Passages piétons                                                    */
/* ------------------------------------------------------------------ */
export const CROSSWALKS = [
  {
    orientation: "horizontal",
    x: CENTER.x - INTERSECTION_HALF,
    y: CENTER.y - INTERSECTION_HALF - 24,
    width: ROAD_WIDTH,
    height: 16,
    stripes: 10,
  },
  {
    orientation: "horizontal",
    x: CENTER.x - INTERSECTION_HALF,
    y: CENTER.y + INTERSECTION_HALF + 8,
    width: ROAD_WIDTH,
    height: 16,
    stripes: 10,
  },
  {
    orientation: "vertical",
    x: CENTER.x - INTERSECTION_HALF - 24,
    y: CENTER.y - INTERSECTION_HALF,
    width: 16,
    height: ROAD_WIDTH,
    stripes: 10,
  },
  {
    orientation: "vertical",
    x: CENTER.x + INTERSECTION_HALF + 8,
    y: CENTER.y - INTERSECTION_HALF,
    width: 16,
    height: ROAD_WIDTH,
    stripes: 10,
  },
];

/* ------------------------------------------------------------------ */
/* Feux tricolores                                                     */
/* ------------------------------------------------------------------ */
export const TRAFFIC_LIGHTS = {
  nsNorth: {
    id: "nsNorth",
    controls: "NS",
    x: CENTER.x + INTERSECTION_HALF + 24,
    y: CENTER.y - INTERSECTION_HALF - 24,
    rotation: 180,
  },
  nsSouth: {
    id: "nsSouth",
    controls: "NS",
    x: CENTER.x - INTERSECTION_HALF - 24,
    y: CENTER.y + INTERSECTION_HALF + 24,
    rotation: 0,
  },
  eoEast: {
    id: "eoEast",
    controls: "EO",
    x: CENTER.x + INTERSECTION_HALF + 24,
    y: CENTER.y + INTERSECTION_HALF + 24,
    rotation: 270,
  },
  eoWest: {
    id: "eoWest",
    controls: "EO",
    x: CENTER.x - INTERSECTION_HALF - 24,
    y: CENTER.y - INTERSECTION_HALF - 24,
    rotation: 90,
  },
};

/* ------------------------------------------------------------------ */
/* Slots de véhicules — 4 files directionnelles                        */
/* ------------------------------------------------------------------ */
export const FILE_NS_SLOTS = [
  { x: CENTER.x - 60, y: 60 },
  { x: CENTER.x - 60, y: 130 },
  { x: CENTER.x - 60, y: 200 },
  { x: CENTER.x - 60, y: 270 },
  { x: CENTER.x - 60, y: 340 },
  { x: CENTER.x - 60, y: 410 },
];

export const FILE_NS_SUD_SLOTS = [
  { x: CENTER.x + 60, y: 545 },
  { x: CENTER.x + 60, y: 615 },
  { x: CENTER.x + 60, y: 685 },
  { x: CENTER.x + 60, y: 755 },
];

export const FILE_EO_SLOTS = [
  { x: 60, y: CENTER.y + 60 },
  { x: 130, y: CENTER.y + 60 },
  { x: 200, y: CENTER.y + 60 },
  { x: 270, y: CENTER.y + 60 },
  { x: 340, y: CENTER.y + 60 },
  { x: 410, y: CENTER.y + 60 },
];

export const FILE_EO_EST_SLOTS = [
  { x: 545, y: CENTER.y - 60 },
  { x: 615, y: CENTER.y - 60 },
  { x: 685, y: CENTER.y - 60 },
  { x: 755, y: CENTER.y - 60 },
];

/* ------------------------------------------------------------------ */
/* Piétons                                                             */
/* ------------------------------------------------------------------ */
export const PEDESTRIAN_POSITIONS = [
  { x: CENTER.x - 20, y: CENTER.y - INTERSECTION_HALF - 16 },
  { x: CENTER.x + 20, y: CENTER.y - INTERSECTION_HALF - 16 },
];

/* ------------------------------------------------------------------ */
/* Hôpital (à l'Est)                                                   */
/* ------------------------------------------------------------------ */
export const HOSPITAL = {
  x: 680,
  y: 60,
  width: 44,
  height: 44,
  label: "HÔPITAL",
};

/* ------------------------------------------------------------------ */
/* Chemins d'urgence — 4 trajectoires SVG animées                      */
/* ------------------------------------------------------------------ */
/* Chaque chemin est un <path d="..."> à parcourir.                    */
/* Basé sur la géométrie réelle des voies (voir schéma ci-dessus).     */
export const EMERGENCY_PATHS = {
  /* N → E : descend, tourne à droite, va vers l'hôpital */
  n: `M ${CENTER.x - 60},0
      L ${CENTER.x - 60},${CENTER.y - INTERSECTION_HALF}
      Q ${CENTER.x - 60},${CENTER.y + 60} ${CENTER.x + 60},${CENTER.y + 60}
      L 800,${CENTER.y + 60}`,

  /* S → E : monte, tourne à droite, va vers l'hôpital */
  s: `M ${CENTER.x + 60},800
      L ${CENTER.x + 60},${CENTER.y + INTERSECTION_HALF}
      Q ${CENTER.x + 60},${CENTER.y + 60} ${CENTER.x + 120},${CENTER.y + 60}
      L 800,${CENTER.y + 60}`,

  /* W → E : tout droit */
  w: `M 0,${CENTER.y + 60}
      L 800,${CENTER.y + 60}`,

  /* E → W : part de l'hôpital, va vers l'ouest */
  e: `M 800,${CENTER.y - 60}
      L 0,${CENTER.y - 60}`,
};

/* Durée de l'animation d'une ambulance (ms) */
export const EMERGENCY_DURATION_MS = 6000;

/* ------------------------------------------------------------------ */
/* Capteurs                                                            */
/* ------------------------------------------------------------------ */
export const SENSORS = {
  nsNorth: {
    id: "nsNorth",
    label: "P7 (NS ↓)",
    x: CENTER.x - 60 - 22,
    y: 240,
    width: 44,
    height: 40,
    color: COLORS.sensorNS,
  },
  nsSud: {
    id: "nsSud",
    label: "P16 (NS ↑)",
    x: CENTER.x + 60 - 22,
    y: 500,
    width: 44,
    height: 40,
    color: COLORS.sensorNS,
  },
  eoWest: {
    id: "eoWest",
    label: "P8 (EO →)",
    x: 240,
    y: CENTER.y + 60 - 22,
    width: 40,
    height: 44,
    color: COLORS.sensorEO,
  },
  eoEst: {
    id: "eoEst",
    label: "P17 (EO ←)",
    x: 500,
    y: CENTER.y - 60 - 22,
    width: 40,
    height: 44,
    color: COLORS.sensorEO,
  },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
export function getFileNSSlot(index) {
  return FILE_NS_SLOTS[Math.min(index, FILE_NS_SLOTS.length - 1)];
}
export function getFileNSSudSlot(index) {
  return FILE_NS_SUD_SLOTS[Math.min(index, FILE_NS_SUD_SLOTS.length - 1)];
}
export function getFileEOSlot(index) {
  return FILE_EO_SLOTS[Math.min(index, FILE_EO_SLOTS.length - 1)];
}
export function getFileEOEstSlot(index) {
  return FILE_EO_EST_SLOTS[Math.min(index, FILE_EO_EST_SLOTS.length - 1)];
}

export const FILE_NS_MAX = FILE_NS_SLOTS.length;
export const FILE_NS_SUD_MAX = FILE_NS_SUD_SLOTS.length;
export const FILE_EO_MAX = FILE_EO_SLOTS.length;
export const FILE_EO_EST_MAX = FILE_EO_EST_SLOTS.length;
