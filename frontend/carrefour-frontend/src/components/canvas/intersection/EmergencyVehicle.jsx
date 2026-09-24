import { useEffect, useRef } from 'react';
import { COLORS, EMERGENCY_DURATION_MS } from '../../../layouts/intersectionLayout.js';

export default function EmergencyVehicle({
  pathD,
  duration = EMERGENCY_DURATION_MS,
}) {
  const motionRef = useRef(null);
  const fadeRef = useRef(null);
  const sonarRefs = useRef([]);

  useEffect(() => {
    /* ⚠️ SMIL utilise le timeline du document. Sans beginElement(),
       une animation montée après le chargement reste figée à sa
       position finale (car elle a "déjà tourné" à t=0s du document). */
    try {
      motionRef.current?.beginElement();
    } catch { /* silencieux si non supporté */ }

    /* Le fade et le sonar démarrent 5.5s après le motion */
    const fadeTimer = setTimeout(() => {
      try { fadeRef.current?.beginElement(); } catch { /* noop */ }
    }, duration - 500);

    /* Les ondes sonar sont en boucle infinie, elles démarrent immédiatement */
    sonarRefs.current.forEach((el) => {
      try { el?.beginElement(); } catch { /* noop */ }
    });

    return () => clearTimeout(fadeTimer);
  }, [duration]);

  if (!pathD) return null;

  const durationSec = (duration / 1000).toFixed(1);

  return (
    <g style={{ pointerEvents: 'none' }}>

      {/* MOUVEMENT — begin="indefinite" + déclenchement manuel */}
      <animateMotion
        ref={motionRef}
        path={pathD}
        dur={`${durationSec}s`}
        repeatCount="1"
        rotate="auto"
        fill="freeze"
        begin="indefinite"
        keyPoints="0;0.35;0.65;1"
        keyTimes="0;0.25;0.75;1"
        calcMode="linear"
      />

      {/* FONDU SORTANT */}
      <animate
        ref={fadeRef}
        attributeName="opacity"
        from="1"
        to="0"
        dur="0.5s"
        fill="freeze"
        begin="indefinite"
      />

      {/* SIRÈNE — ondes concentriques */}
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx="0" cy="0" r="8"
          fill="none"
          stroke={COLORS.lightRed}
          strokeWidth="1.5"
        >
          <animate
            ref={(el) => (sonarRefs.current[i] = el)}
            attributeName="r"
            from="8" to="28"
            dur="1.2s"
            begin="indefinite"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="0.7" to="0"
            dur="1.2s"
            begin="indefinite"
            repeatCount="indefinite"
          />
        </circle>
      ))}

      {/* HALO */}
      <circle cx="0" cy="0" r="20" fill={COLORS.lightRed}>
        <animate
          attributeName="opacity"
          values="0.12;0.32;0.12"
          dur="1.4s"
          repeatCount="indefinite"
          begin="indefinite"
        />
      </circle>

      {/* Ombre */}
      <rect x="-18" y="-9" width="36" height="20" rx="4" fill="#000" opacity="0.35" />

      {/* Corps */}
      <rect
        x="-18" y="-10" width="36" height="20" rx="4"
        fill={COLORS.carEmergency}
        stroke={COLORS.lightRed}
        strokeWidth="1.2"
      />

      {/* Croix rouge */}
      <rect x="-2.5" y="-7" width="5" height="14" rx="0.5" fill={COLORS.lightRed} />
      <rect x="-7" y="-2.5" width="14" height="5" rx="0.5" fill={COLORS.lightRed} />

      {/* Gyrophares */}
      <circle cx="-13" cy="-7" r="2.2" fill="#2563EB" />
      <circle cx="13" cy="-7" r="2.2" fill={COLORS.lightRed} />

      {/* Phares */}
      <circle cx="16" cy="-5" r="1.4" fill={COLORS.headlight} />
      <circle cx="16" cy="5" r="1.4" fill={COLORS.headlight} />

    </g>
  );
}