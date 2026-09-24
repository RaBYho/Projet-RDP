import {
  VIEWBOX,
  CENTER,
  INTERSECTION_HALF,
  ROAD_NS,
  ROAD_EO,
  INTERSECTION_CENTER,
  CROSSWALKS,
  COLORS,
} from '../../../layouts/intersectionLayout.js';

/**
 * RoadBase — chaussée statique du carrefour (v3).
 *
 * Contient :
 *   - Grille de fond (CAD)
 *   - Voies NS (nord + sud) et EO (ouest + est)
 *   - Carrefour central
 *   - Marquages centraux (lignes jaunes)
 *   - Passages piétons
 *
 * Le couloir bus a été RETIRÉ en v3.
 */
export default function RoadBase() {
  return (
    <g className="road-base">

      {/* Défs : grille CAD */}
      <defs>
        <pattern id="cad-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke={COLORS.gridLine} strokeOpacity="0.3" strokeWidth="0.75" />
        </pattern>
      </defs>

      {/* Fond */}
      <rect x="0" y="0" width={VIEWBOX.width} height={VIEWBOX.height} fill={COLORS.canvasBg} />
      <rect x="0" y="0" width={VIEWBOX.width} height={VIEWBOX.height} fill="url(#cad-grid)" />

      {/* Blocs urbains */}
      <CornerBlocks />

      {/* Voies */}
      <g>
        <rect x={ROAD_NS.north.x} y={ROAD_NS.north.y} width={ROAD_NS.north.width} height={ROAD_NS.north.height} fill={COLORS.road} />
        <rect x={ROAD_NS.south.x} y={ROAD_NS.south.y} width={ROAD_NS.south.width} height={ROAD_NS.south.height} fill={COLORS.road} />
        <rect x={ROAD_EO.west.x}  y={ROAD_EO.west.y}  width={ROAD_EO.west.width}  height={ROAD_EO.west.height}  fill={COLORS.road} />
        <rect x={ROAD_EO.east.x}  y={ROAD_EO.east.y}  width={ROAD_EO.east.width}  height={ROAD_EO.east.height}  fill={COLORS.road} />
        <rect
          x={INTERSECTION_CENTER.x}
          y={INTERSECTION_CENTER.y}
          width={INTERSECTION_CENTER.width}
          height={INTERSECTION_CENTER.height}
          fill={COLORS.road}
        />
      </g>

      {/* Marquages centraux — NS */}
      <g stroke="#F59E0B" strokeWidth="2">
        <line x1={CENTER.x - 2} y1={0} x2={CENTER.x - 2} y2={CENTER.y - INTERSECTION_HALF} />
        <line x1={CENTER.x + 2} y1={0} x2={CENTER.x + 2} y2={CENTER.y - INTERSECTION_HALF} />
        <line x1={CENTER.x - 2} y1={CENTER.y + INTERSECTION_HALF} x2={CENTER.x - 2} y2={VIEWBOX.height} />
        <line x1={CENTER.x + 2} y1={CENTER.y + INTERSECTION_HALF} x2={CENTER.x + 2} y2={VIEWBOX.height} />
      </g>

      {/* Marquages centraux — EO */}
      <g stroke="#F59E0B" strokeWidth="2">
        <line x1={0} y1={CENTER.y - 2} x2={CENTER.x - INTERSECTION_HALF} y2={CENTER.y - 2} />
        <line x1={0} y1={CENTER.y + 2} x2={CENTER.x - INTERSECTION_HALF} y2={CENTER.y + 2} />
        <line x1={CENTER.x + INTERSECTION_HALF} y1={CENTER.y - 2} x2={VIEWBOX.width} y2={CENTER.y - 2} />
        <line x1={CENTER.x + INTERSECTION_HALF} y1={CENTER.y + 2} x2={VIEWBOX.width} y2={CENTER.y + 2} />
      </g>

      {/* Bords de voie */}
      <g stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="12,12" opacity="0.7">
        <line x1={CENTER.x - INTERSECTION_HALF - 20} y1={0} x2={CENTER.x - INTERSECTION_HALF - 20} y2={CENTER.y - INTERSECTION_HALF} />
        <line x1={CENTER.x + INTERSECTION_HALF + 20} y1={0} x2={CENTER.x + INTERSECTION_HALF + 20} y2={CENTER.y - INTERSECTION_HALF} />
        <line x1={CENTER.x - INTERSECTION_HALF - 20} y1={CENTER.y + INTERSECTION_HALF} x2={CENTER.x - INTERSECTION_HALF - 20} y2={VIEWBOX.height} />
        <line x1={CENTER.x + INTERSECTION_HALF + 20} y1={CENTER.y + INTERSECTION_HALF} x2={CENTER.x + INTERSECTION_HALF + 20} y2={VIEWBOX.height} />
        <line x1={0} y1={CENTER.y - INTERSECTION_HALF - 20} x2={CENTER.x - INTERSECTION_HALF} y2={CENTER.y - INTERSECTION_HALF - 20} />
        <line x1={0} y1={CENTER.y + INTERSECTION_HALF + 20} x2={CENTER.x - INTERSECTION_HALF} y2={CENTER.y + INTERSECTION_HALF + 20} />
        <line x1={CENTER.x + INTERSECTION_HALF} y1={CENTER.y - INTERSECTION_HALF - 20} x2={VIEWBOX.width} y2={CENTER.y - INTERSECTION_HALF - 20} />
        <line x1={CENTER.x + INTERSECTION_HALF} y1={CENTER.y + INTERSECTION_HALF + 20} x2={VIEWBOX.width} y2={CENTER.y + INTERSECTION_HALF + 20} />
      </g>

      {/* Lignes de stop */}
      <g fill={COLORS.laneMark}>
        <rect x={CENTER.x - INTERSECTION_HALF} y={CENTER.y - INTERSECTION_HALF - 4} width={INTERSECTION_HALF - 4} height="4" />
        <rect x={CENTER.x + 4} y={CENTER.y + INTERSECTION_HALF} width={INTERSECTION_HALF - 4} height="4" />
        <rect x={CENTER.x - INTERSECTION_HALF - 4} y={CENTER.y + 4} width="4" height={INTERSECTION_HALF - 4} />
        <rect x={CENTER.x + INTERSECTION_HALF} y={CENTER.y - INTERSECTION_HALF} width="4" height={INTERSECTION_HALF - 4} />
      </g>

      {/* Passages piétons */}
      <Crosswalks />

    </g>
  );
}

function CornerBlocks() {
  const OFFSET = 20;
  return (
    <g>
      <rect x={0} y={0} width={CENTER.x - INTERSECTION_HALF - OFFSET} height={CENTER.y - INTERSECTION_HALF - OFFSET} rx="16" fill="#334155" />
      <rect x={CENTER.x + INTERSECTION_HALF + OFFSET} y={0} width={CENTER.x - INTERSECTION_HALF - OFFSET} height={CENTER.y - INTERSECTION_HALF - OFFSET} rx="16" fill="#334155" />
      <rect x={0} y={CENTER.y + INTERSECTION_HALF + OFFSET} width={CENTER.x - INTERSECTION_HALF - OFFSET} height={CENTER.y - INTERSECTION_HALF - OFFSET} rx="16" fill="#334155" />
      <rect x={CENTER.x + INTERSECTION_HALF + OFFSET} y={CENTER.y + INTERSECTION_HALF + OFFSET} width={CENTER.x - INTERSECTION_HALF - OFFSET} height={CENTER.y - INTERSECTION_HALF - OFFSET} rx="16" fill="#334155" />
    </g>
  );
}

function Crosswalks() {
  return (
    <g>
      {CROSSWALKS.map((cw, i) => (
        <Crosswalk key={i} {...cw} />
      ))}
    </g>
  );
}

function Crosswalk({ orientation, x, y, width, height, stripes }) {
  const isHorizontal = orientation === 'horizontal';
  const gap = isHorizontal
    ? (width - stripes * 16) / (stripes - 1)
    : (height - stripes * 16) / (stripes - 1);

  return (
    <g>
      {Array.from({ length: stripes }).map((_, i) => {
        const pos = i * (16 + gap);
        return (
          <rect
            key={i}
            x={isHorizontal ? x + pos : x}
            y={isHorizontal ? y : y + pos}
            width={isHorizontal ? 16 : width}
            height={isHorizontal ? height : 16}
            fill={COLORS.crosswalk}
            opacity="0.85"
          />
        );
      })}
    </g>
  );
}