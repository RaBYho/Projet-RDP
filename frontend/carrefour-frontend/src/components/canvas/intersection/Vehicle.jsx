import { COLORS } from '../../../layouts/intersectionLayout.js';

/* Mapping orientation → rotation en degrés.
   Le véhicule est dessiné "face est" par défaut (long axe horizontal). */
const ORIENTATION_ROTATION = {
  east:  0,
  south: 90,
  west:  180,
  north: -90,
};

/**
 * Vehicle — véhicule vu du dessus.
 *
 * @param {'car'|'bus'|'emergency'} type
 * @param {number} x             - centre du véhicule (canvas)
 * @param {number} y
 * @param {'north'|'south'|'east'|'west'} orientation
 * @param {string} color         - override optionnel (défaut selon type)
 * @param {string} label         - texte optionnel (ex: "LINEA 04" pour bus)
 * @param {boolean} isDimmed
 */
export default function Vehicle({
  type = 'car',
  x,
  y,
  orientation = 'east',
  color,
  label,
  isDimmed = false,
}) {
  const rotation = ORIENTATION_ROTATION[orientation] ?? 0;

  const renderShape = () => {
    switch (type) {
      case 'bus':
        return <BusShape color={color} label={label} />;
      case 'emergency':
        return <EmergencyShape color={color} />;
      case 'car':
      default:
        return <CarShape color={color} />;
    }
  };

  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rotation})`}
      opacity={isDimmed ? 0.25 : 1}
      style={{ transition: 'opacity 250ms ease-out' }}
    >
      {renderShape()}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Voiture                                                             */
/* ------------------------------------------------------------------ */
function CarShape({ color = COLORS.carNormal }) {
  const L = 30;   // longueur (axe est-ouest)
  const W = 18;   // largeur (axe nord-sud)
  const roofColor = shade(color, -0.25);

  return (
    <g>
      {/* Ombre */}
      <rect
        x={-L / 2 + 1}
        y={-W / 2 + 1.5}
        width={L}
        height={W}
        rx="4"
        fill="#000"
        opacity="0.3"
      />
      {/* Corps */}
      <rect
        x={-L / 2}
        y={-W / 2}
        width={L}
        height={W}
        rx="4"
        fill={color}
      />
      {/* Toit */}
      <rect
        x={-L / 5}
        y={-W / 2 + 3}
        width={L / 2.5}
        height={W - 6}
        rx="2"
        fill={roofColor}
      />
      {/* Pare-brise avant (côté est) */}
      <rect
        x={L / 2 - 7}
        y={-W / 2 + 3.5}
        width="3"
        height={W - 7}
        rx="1"
        fill={COLORS.carWindow}
        opacity="0.9"
      />
      {/* Pare-brise arrière (côté ouest) */}
      <rect
        x={-L / 2 + 4}
        y={-W / 2 + 3.5}
        width="3"
        height={W - 7}
        rx="1"
        fill={COLORS.carWindow}
        opacity="0.9"
      />
      {/* Phares avant */}
      <circle cx={L / 2 - 1.5} cy={-W / 2 + 3} r="1.4" fill={COLORS.headlight} />
      <circle cx={L / 2 - 1.5} cy={W / 2 - 3} r="1.4" fill={COLORS.headlight} />
      {/* Feux arrière */}
      <circle
        cx={-L / 2 + 1.5}
        cy={-W / 2 + 3}
        r="1.2"
        fill={COLORS.lightRed}
        opacity="0.85"
      />
      <circle
        cx={-L / 2 + 1.5}
        cy={W / 2 - 3}
        r="1.2"
        fill={COLORS.lightRed}
        opacity="0.85"
      />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Bus                                                                 */
/* ------------------------------------------------------------------ */
function BusShape({ color = COLORS.carBus, label }) {
  const L = 52;
  const W = 22;

  return (
    <g>
      {/* Ombre */}
      <rect
        x={-L / 2 + 1}
        y={-W / 2 + 1.5}
        width={L}
        height={W}
        rx="5"
        fill="#000"
        opacity="0.35"
      />
      {/* Corps */}
      <rect
        x={-L / 2}
        y={-W / 2}
        width={L}
        height={W}
        rx="5"
        fill={color}
      />
      {/* Bandeau supérieur (toit) */}
      <rect
        x={-L / 2 + 4}
        y={-W / 2 + 2}
        width={L - 8}
        height={W - 4}
        rx="3"
        fill={shade(color, 0.15)}
        opacity="0.6"
      />
      {/* Fenêtres latérales (petites barres) */}
      {[-1, 0, 1].map((i) => (
        <g key={i}>
          <rect
            x={i * 12 - 4}
            y={-W / 2 + 2}
            width="6"
            height="2"
            rx="1"
            fill={COLORS.carDetail}
            opacity="0.9"
          />
          <rect
            x={i * 12 - 4}
            y={W / 2 - 4}
            width="6"
            height="2"
            rx="1"
            fill={COLORS.carDetail}
            opacity="0.9"
          />
        </g>
      ))}
      {/* Pare-brise avant */}
      <rect
        x={L / 2 - 6}
        y={-W / 2 + 4}
        width="3"
        height={W - 8}
        rx="1"
        fill={COLORS.carWindow}
      />
      {/* Phares */}
      <circle cx={L / 2 - 1.5} cy={-W / 2 + 3.5} r="1.6" fill={COLORS.headlight} />
      <circle cx={L / 2 - 1.5} cy={W / 2 - 3.5} r="1.6" fill={COLORS.headlight} />
      {/* Label (ex: LINEA 04) */}
      {label && (
        <text
          x="0"
          y="-2"
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize="6"
          fontWeight="700"
          fill="#FEF08A"
          letterSpacing="0.5"
        >
          {label}
        </text>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Ambulance / Urgence                                                 */
/* ------------------------------------------------------------------ */
function EmergencyShape({ color = COLORS.carEmergency }) {
  const L = 36;
  const W = 20;

  return (
    <g>
      {/* Ombre */}
      <rect
        x={-L / 2 + 1}
        y={-W / 2 + 1.5}
        width={L}
        height={W}
        rx="4"
        fill="#000"
        opacity="0.3"
      />
      {/* Corps blanc */}
      <rect
        x={-L / 2}
        y={-W / 2}
        width={L}
        height={W}
        rx="4"
        fill={color}
        stroke={COLORS.lightRed}
        strokeWidth="1"
      />
      {/* Croix rouge */}
      <rect
        x="-2"
        y="-6"
        width="4"
        height="12"
        rx="0.5"
        fill={COLORS.lightRed}
      />
      <rect
        x="-6"
        y="-2"
        width="12"
        height="4"
        rx="0.5"
        fill={COLORS.lightRed}
      />
      {/* Gyrophares (bleu + rouge de chaque côté) */}
      <circle
        cx={-L / 2 + 5}
        cy={-W / 2 + 3}
        r="2.2"
        fill={COLORS.carNormal}
        opacity="0.9"
        className="animate-pulse"
        style={{ animationDuration: '0.9s' }}
      />
      <circle
        cx={L / 2 - 5}
        cy={-W / 2 + 3}
        r="2.2"
        fill={COLORS.lightRed}
        opacity="0.9"
        className="animate-pulse"
        style={{ animationDuration: '0.9s', animationDelay: '0.45s' }}
      />
      {/* Phares */}
      <circle cx={L / 2 - 1.5} cy={-W / 2 + 4} r="1.4" fill={COLORS.headlight} />
      <circle cx={L / 2 - 1.5} cy={W / 2 - 4} r="1.4" fill={COLORS.headlight} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Utilitaire : assombrit ou éclaircit une couleur hex                 */
/* ------------------------------------------------------------------ */
function shade(hex, amount) {
  /* amount > 0 → éclaircit, amount < 0 → assombrit */
  const n = parseInt(hex.replace('#', ''), 16);
  let r = (n >> 16) & 0xff;
  let g = (n >> 8) & 0xff;
  let b = n & 0xff;

  if (amount > 0) {
    r = Math.round(r + (255 - r) * amount);
    g = Math.round(g + (255 - g) * amount);
    b = Math.round(b + (255 - b) * amount);
  } else {
    r = Math.round(r * (1 + amount));
    g = Math.round(g * (1 + amount));
    b = Math.round(b * (1 + amount));
  }

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}