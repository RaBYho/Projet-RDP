/**
 * AnimatedToken — jeton qui voyage d'une place à une autre.
 *
 * Utilise <animate> SVG natif (pas de JS d'animation).
 *   - cx/cy : interpolation linéaire de la position source à la cible
 *   - r     : léger grossissement au milieu du trajet
 *   - opacity : fade-out dans les 15% finaux
 *
 * @param {Object} from     - { x, y } position source
 * @param {Object} to       - { x, y } position cible
 * @param {number} duration - durée de l'animation en ms
 * @param {string} color    - couleur hex du jeton
 */
export default function AnimatedToken({ from, to, duration = 450, color = '#2563EB' }) {
  if (!from || !to) return null;

  return (
    <g style={{ pointerEvents: 'none' }}>
      <circle
        cx={from.x}
        cy={from.y}
        r="4"
        fill={color}
        opacity="0.95"
      >
        {/* Déplacement horizontal */}
        <animate
          attributeName="cx"
          from={from.x}
          to={to.x}
          dur={`${duration}ms`}
          fill="freeze"
        />
        {/* Déplacement vertical */}
        <animate
          attributeName="cy"
          from={from.y}
          to={to.y}
          dur={`${duration}ms`}
          fill="freeze"
        />
        {/* Grossissement léger au milieu */}
        <animate
          attributeName="r"
          values="4;5.5;4"
          keyTimes="0;0.5;1"
          dur={`${duration}ms`}
          fill="freeze"
        />
        {/* Fondu sortant dans les 15% finaux */}
        <animate
          attributeName="opacity"
          values="0.95;0.95;0"
          keyTimes="0;0.85;1"
          dur={`${duration}ms`}
          fill="freeze"
        />
      </circle>
    </g>
  );
}