import { COLORS, EMERGENCY_DURATION_MS } from '../../../layouts/intersectionLayout.js';

/**
 * EmergencyVehicle — ambulance animée avec effets visuels renforcés.
 *
 * Améliorations v2 :
 *   Axe 1 — Visuel
 *     - Ondes concentriques (sirène radar) qui s'expandent
 *     - Halo rouge pulsant
 *     - Croix rouge agrandie
 *     - Gyrophares avec halo + alternance
 *   Axe 2 — Comportement
 *     - Ralentissement dans le carrefour (keyPoints/keyTimes)
 *     - Fondu sortant propre
 */
export default function EmergencyVehicle({
  pathD,
  duration = EMERGENCY_DURATION_MS,
}) {
  if (!pathD) return null;

  const durationSec = (duration / 1000).toFixed(1);
  const fadeStartSec = ((duration - 500) / 1000).toFixed(2);

  return (
    <g style={{ pointerEvents: 'none' }}>

      {/* ============================================================ */}
      {/* MOUVEMENT — avec ralentissement dans le carrefour             */}
      {/* ============================================================ */}
      {/* keyPoints/keyTimes : la portion 0.35 → 0.65 du chemin         */}
      {/* (le carrefour) est parcourue en 50% du temps → elle ralentit. */}
      <animateMotion
        path={pathD}
        dur={`${durationSec}s`}
        repeatCount="1"
        rotate="auto"
        fill="freeze"
        keyPoints="0;0.35;0.65;1"
        keyTimes="0;0.25;0.75;1"
        calcMode="linear"
      />

      {/* Fondu sortant dans les 500 dernières ms */}
      <animate
        attributeName="opacity"
        from="1"
        to="0"
        begin={`${fadeStartSec}s`}
        dur="0.5s"
        fill="freeze"
      />

      {/* ============================================================ */}
      {/* SIRÈNE — ondes concentriques (radar)                         */}
      {/* ============================================================ */}
      {[0, 0.4, 0.8].map((delay, i) => (
        <circle
          key={i}
          cx="0"
          cy="0"
          r="8"
          fill="none"
          stroke={COLORS.lightRed}
          strokeWidth="1.5"
        >
          <animate
            attributeName="r"
            from="8"
            to="28"
            dur="1.2s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="0.7"
            to="0"
            dur="1.2s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}

      {/* ============================================================ */}
      {/* HALO ROUGE — ambiance urgence                                 */}
      {/* ============================================================ */}
      <circle cx="0" cy="0" r="20" fill={COLORS.lightRed}>
        <animate
          attributeName="opacity"
          values="0.12;0.32;0.12"
          dur="1.4s"
          repeatCount="indefinite"
        />
      </circle>

      {/* ============================================================ */}
      {/* CARROSSERIE                                                   */}
      {/* ============================================================ */}
      {/* Ombre */}
      <rect
        x="-18"
        y="-9"
        width="36"
        height="20"
        rx="4"
        fill="#000"
        opacity="0.35"
      />

      {/* Corps blanc */}
      <rect
        x="-18"
        y="-10"
        width="36"
        height="20"
        rx="4"
        fill={COLORS.carEmergency}
        stroke={COLORS.lightRed}
        strokeWidth="1.2"
      />

      {/* Croix rouge — agrandie */}
      <rect x="-2.5" y="-7" width="5" height="14" rx="0.5" fill={COLORS.lightRed} />
      <rect x="-7" y="-2.5" width="14" height="5" rx="0.5" fill={COLORS.lightRed} />

      {/* ============================================================ */}
      {/* GYROPHARES — halo + point, alternance bleu/rouge             */}
      {/* ============================================================ */}
      {/* Gyrophare bleu (gauche) */}
      <g>
        <circle cx="-13" cy="-7" r="3.5" fill="#2563EB" opacity="0.5">
          <animate
            attributeName="opacity"
            values="0.6;0.1;0.6"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="-13" cy="-7" r="2.2" fill="#2563EB">
          <animate
            attributeName="opacity"
            values="1;0.3;1"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </circle>
      </g>

      {/* Gyrophare rouge (droite) — en opposition de phase */}
      <g>
        <circle cx="13" cy="-7" r="3.5" fill={COLORS.lightRed} opacity="0.5">
          <animate
            attributeName="opacity"
            values="0.1;0.6;0.1"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="13" cy="-7" r="2.2" fill={COLORS.lightRed}>
          <animate
            attributeName="opacity"
            values="0.3;1;0.3"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </circle>
      </g>

      {/* Phares avant */}
      <circle cx="16" cy="-5" r="1.4" fill={COLORS.headlight} />
      <circle cx="16" cy="5" r="1.4" fill={COLORS.headlight} />

    </g>
  );
}