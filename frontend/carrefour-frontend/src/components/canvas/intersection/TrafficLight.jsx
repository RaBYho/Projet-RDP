import { COLORS } from '../../../layouts/intersectionLayout.js';

/* Configuration de chaque état : quelle pastille est allumée, avec quelle couleur. */
const STATES = {
  red:   { activeIndex: 0, activeColor: COLORS.lightRed,   label: 'ROUGE'  },
  amber: { activeIndex: 1, activeColor: COLORS.lightAmber, label: 'ORANGE' },
  green: { activeIndex: 2, activeColor: COLORS.lightGreen, label: 'VERT'   },
};

/* Couleurs des pastilles éteintes (ordre haut → bas : rouge, orange, vert). */
const OFF_COLORS = [COLORS.lightOff, COLORS.lightOff, COLORS.lightOff];

/**
 * TrafficLight — feu tricolore orienté.
 *
 * @param {'red'|'amber'|'green'} state - état actuel du feu
 * @param {number} x         - position centre du feu (canvas)
 * @param {number} y
 * @param {number} rotation  - rotation en degrés (0 = tourné vers le bas)
 * @param {boolean} isDimmed - réduit l'opacité (filtre catégorie)
 * @param {boolean} showLabel - affiche le label d'état (debug / formel)
 */
export default function TrafficLight({
  state = 'red',
  x,
  y,
  rotation = 0,
  isDimmed = false,
  showLabel = false,
}) {
  const cfg = STATES[state] ?? STATES.red;

  /* Dimensions du boîtier */
  const W = 22;
  const H = 52;
  const R = 6; // rayon des pastilles
  const SPACING = 14;

  /* Positions des 3 pastilles dans le boîtier (relatives au centre) */
  const positions = [
    { dx: 0, dy: -SPACING },
    { dx: 0, dy: 0 },
    { dx: 0, dy: SPACING },
  ];

  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rotation})`}
      opacity={isDimmed ? 0.25 : 1}
      style={{ transition: 'opacity 250ms ease-out' }}
    >
      {/* Ombre portée légère */}
      <rect
        x={-W / 2 + 1}
        y={-H / 2 + 2}
        width={W}
        height={H}
        rx="4"
        fill="#000000"
        opacity="0.25"
      />

      {/* Boîtier */}
      <rect
        x={-W / 2}
        y={-H / 2}
        width={W}
        height={H}
        rx="4"
        fill={COLORS.lightHousing}
        stroke="#475569"
        strokeWidth="1.2"
      />

      {/* Pastilles (rouge, orange, vert) */}
      {positions.map((p, i) => {
        const isActive = i === cfg.activeIndex;
        const color = isActive ? cfg.activeColor : OFF_COLORS[i];

        return (
          <g key={i}>
            {/* Halo lumineux autour de la pastille active */}
            {isActive && (
              <circle
                cx={p.dx}
                cy={p.dy}
                r={R + 3}
                fill={color}
                opacity="0.35"
                className="animate-pulse"
                style={{ animationDuration: '2.2s' }}
              />
            )}
            {/* Pastille */}
            <circle
              cx={p.dx}
              cy={p.dy}
              r={R}
              fill={color}
              style={{ transition: 'fill 300ms ease-out' }}
            />
          </g>
        );
      })}

      {/* Label d'état optionnel (sous le feu, non tourné) */}
      {showLabel && (
        <g transform={`rotate(${-rotation})`}>
          <text
            x="0"
            y={H / 2 + 12}
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize="9"
            fontWeight="700"
            fill={cfg.activeColor}
            letterSpacing="0.5"
          >
            {cfg.label}
          </text>
        </g>
      )}
    </g>
  );
}