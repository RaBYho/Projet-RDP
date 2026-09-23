import { getCategory } from '../../theme/categories.js';
import { getPlaceRadius, PLACE_LABEL_OFFSET } from '../../layouts/petriLayout.js';

/* Position des jetons dans le cercle selon leur nombre.
   Grille simple : centre pour 1, horizontal pour 2, triangle pour 3. */
const TOKEN_LAYOUTS = {
  1: [[0, 0]],
  2: [[-5, 0], [5, 0]],
  3: [[-5, -4], [5, -4], [0, 5]],
};

/**
 * PlaceNode — une place du réseau de Petri (cercle + jetons + label).
 *
 * @param {Object}   place        - objet place depuis /network
 * @param {Object}   position     - { x, y } sur le canvas
 * @param {boolean}  isDimmed     - réduit l'opacité (filtre catégorie)
 * @param {Function} onClick      - callback optionnel au clic
 * @param {'formal'|'simplified'} viewMode - mode d'affichage
 */
export default function PlaceNode({
  place,
  position,
  isDimmed = false,
  onClick,
  viewMode = 'formal',
}) {
  if (!place || !position) return null;

  const { id, label, tokens = 0, category = 'normal' } = place;
  const isHub = id === 'P15';
  const radius = getPlaceRadius(id);
  const hasTokens = tokens > 0;

  const cat = getCategory(category);

  /* Couleur du cercle :
     - Vide  → gris outline neutre
     - Actif → couleur de la catégorie */
  const strokeColor = hasTokens ? cat.hex : '#CBD5E1';
  const tokenColor = hasTokens ? cat.hex : '#94A3B8';

  /* Fond intérieur : léger teintage si la place est active */
  const fillColor = hasTokens ? '#FFFFFF' : '#F8FAFC';

  /* Label : version formelle = id + label complet
              version simplifiée = label court uniquement */
  const displayLabel =
    viewMode === 'formal'
      ? `${id} · ${label}`
      : label;

  /* Nombre de jetons à afficher individuellement (max 3) + overflow */
  const shownTokens = Math.min(tokens, 3);
  const overflow = tokens > 3 ? tokens - 3 : 0;
  const layout = TOKEN_LAYOUTS[shownTokens] ?? TOKEN_LAYOUTS[1];

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      opacity={isDimmed ? 0.25 : 1}
      style={{
        transition: 'opacity 250ms ease-out',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick ? () => onClick(place) : undefined}
    >
      {/* Halo pulsant si la place est active et "vivante" (hub) */}
      {isHub && hasTokens && (
        <circle
          cx="0"
          cy="0"
          r={radius + 6}
          fill={cat.hex}
          opacity="0.12"
          className="animate-pulse"
        />
      )}

      {/* Cercle principal */}
      <circle
        cx="0"
        cy="0"
        r={radius}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={hasTokens ? 2.5 : 2}
        strokeDasharray={isHub ? '3 2' : undefined}
        style={{ transition: 'stroke 250ms ease-out, stroke-width 250ms ease-out' }}
      />

      {/* Jetons */}
      {hasTokens && (
        <g>
          {layout.map(([dx, dy], i) => (
            <circle
              key={i}
              cx={dx}
              cy={dy}
              r={3}
              fill={tokenColor}
              style={{ transition: 'fill 250ms ease-out' }}
            />
          ))}

          {/* Overflow "+N" si plus de 3 jetons */}
          {overflow > 0 && (
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="8"
              fontWeight="700"
              fill={tokenColor}
            >
              +{overflow}
            </text>
          )}
        </g>
      )}

      {/* Label sous la place */}
      <text
        x="0"
        y={radius + 12}
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize={viewMode === 'formal' ? 10 : 11}
        fontWeight="600"
        fill={hasTokens ? cat.hex : '#64748B'}
        style={{ transition: 'fill 250ms ease-out' }}
      >
        {displayLabel}
      </text>

      {/* Badge capacité en mode formel (ex: "1/12" pour les files) */}
      {viewMode === 'formal' && place.capacity > 1 && (
        <text
          x="0"
          y={radius + PLACE_LABEL_OFFSET - 4}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize="9"
          fontWeight="500"
          fill="#94A3B8"
        >
          {tokens}/{place.capacity}
        </text>
      )}
    </g>
  );
}