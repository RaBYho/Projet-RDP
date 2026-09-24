/**
 * SensorLoop — capteur inductif (boucle magnétique) posé sur la chaussée.
 *
 * Représentation classique dans une interface de régulation :
 *   - Un rectangle pointillé qui matérialise la boucle physique
 *   - Un léger fond coloré selon le domaine (NS / EO / Bus)
 *   - Un label mono optionnel (P7, P8, P_BUS) — uniquement en vue formelle
 *
 * Le capteur est "actif" (marqué) quand il détecte un véhicule.
 *
 * @param {Object}   sensor   - { id, label, x, y, width, height, color }
 * @param {boolean}  isActive - état détecté (dérivé du marquage par le parent)
 * @param {boolean}  showLabel - affiche le label technique (vue formelle)
 */
export default function SensorLoop({ sensor, isActive = false, showLabel = true }) {
  if (!sensor) return null;

  const { label, x, y, width, height, color } = sensor;

  return (
    <g>
      {/* Halo extérieur quand actif */}
      {isActive && (
        <rect
          x={x - 4}
          y={y - 4}
          width={width + 8}
          height={height + 8}
          rx="3"
          fill={color}
          opacity="0.15"
          className="animate-pulse"
          style={{ animationDuration: '1.8s' }}
        />
      )}

      {/* Boucle physique : rectangle pointillé */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="2"
        fill="none"
        stroke={color}
        strokeWidth={isActive ? 2 : 1.5}
        strokeDasharray="4,2"
        style={{
          transition: 'stroke-width 250ms ease-out, stroke 250ms ease-out',
        }}
      />

      {/* Fond translucide */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="2"
        fill={color}
        fillOpacity={isActive ? 0.35 : 0.18}
        style={{ transition: 'fill-opacity 250ms ease-out' }}
      />

      {/* Label technique (P7, P8, P_BUS) */}
      {showLabel && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 3}
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize="9"
          fontWeight="700"
          fill="#FFFFFF"
          letterSpacing="0.5"
          style={{ pointerEvents: 'none' }}
        >
          {label}
        </text>
      )}
    </g>
  );
}