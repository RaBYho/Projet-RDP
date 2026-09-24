import { HOSPITAL, COLORS } from '../../../layouts/intersectionLayout.js';

/**
 * Hospital — bloc hôpital avec croix rouge, positionné à l'Est du canvas.
 */
export default function Hospital() {
  const { x, y, width, height, label } = HOSPITAL;

  return (
    <g transform={`translate(${x} ${y})`}>
      {/* Halo discret */}
      <rect
        x="-3"
        y="-3"
        width={width + 6}
        height={height + 6}
        rx="6"
        fill={COLORS.hospitalCross}
        opacity="0.08"
      />

      {/* Bâtiment */}
      <rect
        width={width}
        height={height}
        rx="4"
        fill={COLORS.hospitalBg}
        stroke="#CBD5E1"
        strokeWidth="1.2"
      />

      {/* Croix rouge (centrée) */}
      <rect
        x={width / 2 - 2.5}
        y={height / 2 - 8}
        width="5"
        height="16"
        rx="1"
        fill={COLORS.hospitalCross}
      />
      <rect
        x={width / 2 - 8}
        y={height / 2 - 2.5}
        width="16"
        height="5"
        rx="1"
        fill={COLORS.hospitalCross}
      />

      {/* Label sous le bâtiment */}
      <text
        x={width / 2}
        y={height + 12}
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize="8"
        fontWeight="700"
        fill={COLORS.hospitalLabel}
        letterSpacing="1"
      >
        {label}
      </text>
    </g>
  );
}