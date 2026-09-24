import { COLORS } from '../../../layouts/intersectionLayout.js';

/**
 * Direction → vecteur unitaire (dx, dy).
 * La traînée est dessinée à l'opposé de la direction.
 */
const DIRECTION_VECTORS = {
  north: { dx: 0,  dy: -1 },
  south: { dx: 0,  dy: 1 },
  east:  { dx: 1,  dy: 0 },
  west:  { dx: -1, dy: 0 },
};

/**
 * Pedestrian — piéton vu du dessus.
 *
 * Représentation :
 *   - Un point violet (tête)
 *   - Un halo léger autour
 *   - Une traînée de points derrière (mouvement)
 *   - Un point fantôme devant (destination)
 *
 * @param {number} x
 * @param {number} y
 * @param {'north'|'south'|'east'|'west'} direction - sens de traversée
 * @param {'waiting'|'crossing'} state - en attente ou en traversée
 * @param {boolean} isDimmed
 */
export default function Pedestrian({
  x,
  y,
  direction = 'east',
  state = 'crossing',
  isDimmed = false,
}) {
  const vec = DIRECTION_VECTORS[direction] ?? DIRECTION_VECTORS.east;
  const isWaiting = state === 'waiting';

  const baseColor = isWaiting ? '#A855F7' : COLORS.pedestrian || '#7C3AED';

  return (
    <g
      transform={`translate(${x} ${y})`}
      opacity={isDimmed ? 0.25 : 1}
      style={{ transition: 'opacity 250ms ease-out' }}
    >
      {/* -------- Traînée de points (derrière) -------- */}
      {!isWaiting &&
        [4, 3, 2, 1].map((offset) => {
          const dx = -vec.dx * offset * 4;
          const dy = -vec.dy * offset * 4;
          const r = 1 + (4 - offset) * 0.3;
          const opacity = 0.08 + (4 - offset) * 0.05;
          return (
            <circle
              key={offset}
              cx={dx}
              cy={dy}
              r={r}
              fill={baseColor}
              opacity={opacity}
            />
          );
        })}

      {/* -------- Point fantôme (destination) -------- */}
      {!isWaiting && (
        <circle
          cx={vec.dx * 16}
          cy={vec.dy * 16}
          r="2"
          fill="none"
          stroke={baseColor}
          strokeWidth="1"
          strokeDasharray="2,2"
          opacity="0.5"
        />
      )}

      {/* -------- Halo pulsant (piéton en traversée) -------- */}
      {!isWaiting && (
        <circle
          cx="0"
          cy="0"
          r="7"
          fill={baseColor}
          opacity="0.2"
          className="animate-pulse"
          style={{ animationDuration: '1.6s' }}
        />
      )}

      {/* -------- Corps principal (point) -------- */}
      <circle
        cx="0"
        cy="0"
        r="4"
        fill={baseColor}
        stroke="#F5F3FF"
        strokeWidth="1.2"
      />

      {/* -------- Tête (petit point clair au centre) -------- */}
      <circle cx="0" cy="0" r="1.5" fill="#F5F3FF" />

      {/* -------- Indicateur "en attente" (anneau pointillé clignotant) -------- */}
      {isWaiting && (
        <circle
          cx="0"
          cy="0"
          r="6"
          fill="none"
          stroke={baseColor}
          strokeWidth="1.2"
          strokeDasharray="2,2"
          opacity="0.7"
          className="animate-pulse"
          style={{ animationDuration: '1.4s' }}
        />
      )}
    </g>
  );
}