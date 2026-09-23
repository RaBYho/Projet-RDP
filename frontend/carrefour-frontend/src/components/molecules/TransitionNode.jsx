import { getCategory } from '../../theme/categories.js';
import {
  TRANSITION_WIDTH,
  TRANSITION_HEIGHT,
} from '../../layouts/petriLayout.js';

/**
 * TransitionNode — une transition du réseau de Petri.
 *
 * États :
 *   - enabled  → couleur catégorie + halo pulsant + curseur pointer
 *   - disabled → gris neutre + curseur not-allowed
 *
 * @param {Object}   transition   - objet transition depuis /network
 * @param {Object}   position     - { x, y } sur le canvas
 * @param {boolean}  isEnabled    - présent dans /enabled-transitions
 * @param {boolean}  isDimmed     - réduit l'opacité (filtre catégorie)
 * @param {boolean}  isFiring     - animation de tir en cours
 * @param {Function} onClick      - callback(transitionId) au clic
 * @param {'formal'|'simplified'} viewMode
 */
export default function TransitionNode({
  transition,
  position,
  isEnabled = false,
  isDimmed = false,
  isFiring = false,
  onClick,
  viewMode = 'formal',
}) {
  if (!transition || !position) return null;

  const { id, label, category = 'normal' } = transition;
  const cat = getCategory(category);

  /* Géométrie : le rectangle est centré sur (0,0) */
  const halfW = TRANSITION_WIDTH / 2;
  const halfH = TRANSITION_HEIGHT / 2;

  /* Couleurs selon l'état */
  const fillColor = isEnabled ? cat.hex : '#94A3B8';
  const strokeColor = isEnabled ? cat.hex : 'transparent';

  /* Curseur */
  const cursor = isEnabled && onClick ? 'pointer' : 'not-allowed';

  /* Label : formel = id uniquement, simplifié = label court */
  const displayLabel = viewMode === 'formal' ? id : label;

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      opacity={isDimmed ? 0.25 : 1}
      style={{
        transition: 'opacity 250ms ease-out',
        cursor,
      }}
      onClick={
        isEnabled && onClick ? () => onClick(transition.id) : undefined
      }
    >
      {/* Halo pulsant quand enabled (signal "franchissable") */}
      {isEnabled && (
        <rect
          x={-halfW - 4}
          y={-halfH - 4}
          width={TRANSITION_WIDTH + 8}
          height={TRANSITION_HEIGHT + 8}
          rx="4"
          fill={cat.hex}
          opacity="0.15"
          className="animate-pulse"
        />
      )}

      {/* Rectangle principal */}
      <rect
        x={-halfW}
        y={-halfH}
        width={TRANSITION_WIDTH}
        height={TRANSITION_HEIGHT}
        rx="2"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={isEnabled ? 1.5 : 0}
        style={{
          transition: 'fill 250ms ease-out, stroke 250ms ease-out',
          transform: isFiring ? 'scale(1.15)' : 'scale(1)',
          transformOrigin: 'center',
        }}
      />

      {/* Label au-dessus de la transition (uniquement si pas trop serré) */}
      <text
        x="0"
        y={-halfH - 6}
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize={viewMode === 'formal' ? 10 : 9}
        fontWeight="600"
        fill={isEnabled ? cat.hex : '#64748B'}
        style={{
          transition: 'fill 250ms ease-out',
          pointerEvents: 'none',
        }}
      >
        {displayLabel}
      </text>

      {/* Badge "ACTIF" sous la transition quand enabled en mode formel */}
      {isEnabled && viewMode === 'formal' && (
        <g style={{ pointerEvents: 'none' }}>
          <rect
            x={-20}
            y={halfH + 4}
            width="40"
            height="12"
            rx="3"
            fill={cat.hex}
            opacity="0.9"
          />
          <text
            x="0"
            y={halfH + 13}
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize="8"
            fontWeight="700"
            fill="#FFFFFF"
            letterSpacing="0.5"
          >
            ACTIF
          </text>
        </g>
      )}
    </g>
  );
}