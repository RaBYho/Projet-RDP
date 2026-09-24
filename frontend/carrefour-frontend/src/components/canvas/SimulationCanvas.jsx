import { useMemo } from 'react';
import Icon from '../atoms/Icon.jsx';
import RoadBase from './intersection/RoadBase.jsx';
import TrafficLight from './intersection/TrafficLight.jsx';
import Vehicle from './intersection/Vehicle.jsx';
import SensorLoop from './intersection/SensorLoop.jsx';
import Pedestrian from './intersection/Pedestrian.jsx';
import EmergencyVehicle from './intersection/EmergencyVehicle.jsx';
import Hospital from './intersection/Hospital.jsx';
import { usePanZoom } from '../../hooks/usePanZoom.js';
import { useVehicleFlow, getVehicleRenderProps } from '../../hooks/useVehicleFlow.js';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { useUi } from '../../context/UiContext.jsx';
import {
  VIEWBOX,
  CENTER,
  INTERSECTION_HALF,
  TRAFFIC_LIGHTS,
  SENSORS,
  PEDESTRIAN_POSITIONS,
  EMERGENCY_PATHS,
  COLORS,
} from '../../layouts/intersectionLayout.js';

/* ------------------------------------------------------------------ */
/* Dérivations depuis le marquage                                      */
/* ------------------------------------------------------------------ */

function nsLightState(marking) {
  if ((marking.P1 ?? 0) > 0) return 'green';
  if ((marking.P2 ?? 0) > 0) return 'amber';
  return 'red';
}

function eoLightState(marking) {
  if ((marking.P4 ?? 0) > 0) return 'green';
  if ((marking.P5 ?? 0) > 0) return 'amber';
  return 'red';
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                 */
/* ------------------------------------------------------------------ */

export default function SimulationCanvas() {
  const { network, loading, lastEmergency } = useNetwork();
  const { viewMode } = useUi();

  const panZoom = usePanZoom({
    viewBoxWidth: VIEWBOX.width,
    viewBoxHeight: VIEWBOX.height,
    minScale: 0.4,
    maxScale: 4,
  });
  const { containerRef, transform, isPanning, handlers, actions } = panZoom;

  const marking = network?.marking_vector ?? {};

  /* Simulation de circulation côté client */
  const flowVehicles = useVehicleFlow({ marking });

  /* Piétons : apparition quand P10 > 0 */
  const pedestrians = useMemo(() => {
    if ((marking.P10 ?? 0) === 0) return [];
    return PEDESTRIAN_POSITIONS.map((pos, i) => ({
      key: `ped-${i}`,
      x: pos.x,
      y: pos.y,
    }));
  }, [marking.P10]);

  /* États dérivés */
  const nsState = nsLightState(marking);
  const eoState = eoLightState(marking);

  const emergencyNS = (marking.P13_NS ?? 0) > 0 || (marking.P14_NS ?? 0) > 0;
  const emergencyEO = (marking.P13_EO ?? 0) > 0 || (marking.P14_EO ?? 0) > 0;
  const isEmergencyActive = emergencyNS || emergencyEO;

  const pedestrianWaiting = (marking.P9 ?? 0) > 0;
  const showTechnicalLabels = viewMode === 'formal';

  const PATH_MAP = {
    urgence_n: EMERGENCY_PATHS.n,
    urgence_s: EMERGENCY_PATHS.s,
    urgence_w: EMERGENCY_PATHS.w,
    urgence_e: EMERGENCY_PATHS.e,
  };

  const activeEmergencyPath = useMemo(() => {
    if (!isEmergencyActive) return null;
    if (!lastEmergency?.event) return EMERGENCY_PATHS.n;
    return PATH_MAP[lastEmergency.event] ?? EMERGENCY_PATHS.n;
  }, [isEmergencyActive, lastEmergency]);

  const emergencyKey = lastEmergency?.seq ?? 0;

  /* ------------------------------------------------------------------ */
  /* Chargement                                                          */
  /* ------------------------------------------------------------------ */
  if (loading && !network) {
    return (
      <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-space-md">
          <svg
            width="48"
            height="48"
            viewBox="0 0 50 50"
            className="animate-[spin_1s_linear_infinite]"
            aria-hidden="true"
          >
            <circle cx="25" cy="25" r="20" fill="none" stroke="#E2E8F0" strokeWidth="4" />
            <circle cx="25" cy="25" r="20" fill="none" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" strokeDasharray="90 200" />
          </svg>
          <div className="flex flex-col items-center gap-space-xs">
            <span className="text-label-md text-ink font-medium">Initialisation du carrefour</span>
            <span className="font-mono text-code-sm text-ink-caption">Chargement du modèle Petri…</span>
          </div>
        </div>
      </div>
    );
  }

  if (!network) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-ink-muted">
        <span className="font-mono text-code-sm">Aucune donnée réseau.</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[400px] flex flex-col gap-space-sm">

      {/* ================= Canvas ================= */}
      <div
        ref={containerRef}
        {...handlers}
        className={[
          'relative w-full flex-1 rounded-lg overflow-hidden',
          'bg-slate-900 shadow-inner',
          'select-none',
          isPanning ? 'cursor-grabbing' : 'cursor-grab',
        ].join(' ')}
        style={{ touchAction: 'none' }}
      >
        <svg
          className="relative w-full h-full block"
          viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform={`translate(${transform.tx} ${transform.ty}) scale(${transform.scale})`}>
            <RoadBase />
            <Hospital />

            {/* Capteurs */}
            <SensorLoop sensor={SENSORS.nsNorth} isActive={(marking.P7 ?? 0) > 0} showLabel={showTechnicalLabels} />
            <SensorLoop sensor={SENSORS.nsSud}   isActive={(marking.P16 ?? 0) > 0} showLabel={showTechnicalLabels} />
            <SensorLoop sensor={SENSORS.eoWest}  isActive={(marking.P8 ?? 0) > 0} showLabel={showTechnicalLabels} />
            <SensorLoop sensor={SENSORS.eoEst}   isActive={(marking.P17 ?? 0) > 0} showLabel={showTechnicalLabels} />

            {/* Voitures animées (simulation continue) */}
            {flowVehicles.map((v) => {
              const props = getVehicleRenderProps(v);
              if (!props) return null;
              return (
                <Vehicle
                  key={v.id}
                  type={props.type}
                  x={props.x}
                  y={props.y}
                  orientation={props.orientation}
                  color={props.color}
                />
              );
            })}

            {/* Piétons */}
            {pedestrians.map((p) => (
              <Pedestrian
                key={p.key}
                x={p.x}
                y={p.y}
                direction="south"
                state="crossing"
              />
            ))}

            {/* Ambulance animée */}
            {activeEmergencyPath && (
              <EmergencyVehicle
                key={`emergency-${emergencyKey}`}
                pathD={activeEmergencyPath}
              />
            )}

            {/* Feux */}
            <TrafficLight state={nsState} x={TRAFFIC_LIGHTS.nsNorth.x} y={TRAFFIC_LIGHTS.nsNorth.y} rotation={TRAFFIC_LIGHTS.nsNorth.rotation} />
            <TrafficLight state={nsState} x={TRAFFIC_LIGHTS.nsSouth.x} y={TRAFFIC_LIGHTS.nsSouth.y} rotation={TRAFFIC_LIGHTS.nsSouth.rotation} />
            <TrafficLight state={eoState} x={TRAFFIC_LIGHTS.eoEast.x}  y={TRAFFIC_LIGHTS.eoEast.y}  rotation={TRAFFIC_LIGHTS.eoEast.rotation} />
            <TrafficLight state={eoState} x={TRAFFIC_LIGHTS.eoWest.x}  y={TRAFFIC_LIGHTS.eoWest.y}  rotation={TRAFFIC_LIGHTS.eoWest.rotation} />

            {/* Halo urgence */}
            {isEmergencyActive && (
              <circle
                cx={CENTER.x}
                cy={CENTER.y}
                r={INTERSECTION_HALF + 40}
                fill="none"
                stroke={COLORS.lightRed}
                strokeWidth="3"
                opacity="0.5"
                className="animate-pulse"
                style={{ animationDuration: '1.2s' }}
              />
            )}
          </g>
        </svg>

        {/* Overlay haut-gauche : statut global */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
          <StatusPill
            tone={isEmergencyActive ? 'danger' : 'success'}
            label={
              emergencyNS
                ? 'URGENCE NS ACTIVE'
                : emergencyEO
                  ? 'URGENCE EO ACTIVE'
                  : 'FLUX NOMINAL'
            }
            live
          />
          {pedestrianWaiting && <StatusPill tone="pedestrian" label="APPEL PIÉTON" />}
        </div>

        {/* Overlay bas-gauche : fin d'urgence */}
        {isEmergencyActive && (
          <div className="absolute bottom-20 left-3 z-20">
            <button
              type="button"
              onClick={() => {
                const tid = emergencyNS ? 'T14_NS' : 'T14_EO';
                import('../../api/client.js').then(({ fireTransition }) => {
                  fireTransition(tid).catch(() => {});
                });
              }}
              className="
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                bg-danger text-white font-label-md font-semibold
                shadow-l2 transition-all duration-200 ease-out
                hover:bg-danger-hover active:scale-[0.97]
                focus:outline-none focus-visible:ring-2 focus-visible:ring-danger/40
              "
            >
              <Icon name="e911_emergency" size={16} />
              Fin d'urgence
            </button>
          </div>
        )}

        {/* Overlay bas-gauche standard */}
        <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-panel/90 backdrop-blur-sm border border-border">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="font-mono text-badge-mono text-ink">CAPTEURS ACTIFS</span>
          </div>
        </div>

        {/* Contrôles zoom */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 p-1 rounded-lg bg-surface-panel/95 backdrop-blur-sm border border-border shadow-l1">
          <button type="button" onClick={actions.zoomOut} title="Zoom arrière" className="w-7 h-7 rounded-md flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors duration-150">
            <Icon name="zoom_out" size={16} />
          </button>
          <span className="min-w-[42px] text-center font-mono text-code-sm text-ink font-semibold tabular-nums">
            {Math.round(transform.scale * 100)}%
          </span>
          <button type="button" onClick={actions.zoomIn} title="Zoom avant" className="w-7 h-7 rounded-md flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors duration-150">
            <Icon name="zoom_in" size={16} />
          </button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button type="button" onClick={actions.reset} title="Réinitialiser la vue" className="w-7 h-7 rounded-md flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors duration-150">
            <Icon name="fit_screen" size={16} />
          </button>
        </div>
      </div>

      {/* ================= Légende ================= */}
      <div className="flex flex-wrap items-center justify-between gap-space-md bg-surface-muted px-space-lg py-space-sm rounded-lg shrink-0">
        <div className="flex items-center gap-space-md flex-wrap">
          <LegendDot color={COLORS.carNormal} label="Voitures NS (↕)" />
          <LegendDot color={COLORS.carEO} label="Voitures EO (↔)" />
          <LegendDot color={COLORS.lightRed} label="Ambulance" />
        </div>
        <div className="flex items-center gap-space-md font-mono text-code-sm text-ink-muted">
          <span>Ortho 1:100</span>
          <span className="w-px h-3 bg-border" />
          <span>Couplage Petri synchronisé</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sous-composants                                                     */
/* ------------------------------------------------------------------ */
function StatusPill({ tone = 'success', label, live = false }) {
  const TONES = {
    success:    { bg: 'bg-secondary-soft',  text: 'text-secondary',  dot: 'bg-secondary' },
    warning:    { bg: 'bg-tertiary-soft',   text: 'text-tertiary',   dot: 'bg-tertiary' },
    danger:     { bg: 'bg-danger-soft',     text: 'text-danger',     dot: 'bg-danger' },
    pedestrian: { bg: 'bg-pedestrian-soft', text: 'text-pedestrian', dot: 'bg-pedestrian' },
  };
  const t = TONES[tone] ?? TONES.success;

  return (
    <div className={['flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-current/20', t.bg, t.text].join(' ')}>
      <span className="relative flex w-2 h-2">
        {live && <span className={['absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping', t.dot].join(' ')} />}
        <span className={['relative inline-flex w-2 h-2 rounded-full', t.dot].join(' ')} />
      </span>
      <span className="font-mono text-badge-mono uppercase tracking-wider font-semibold">{label}</span>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: color }} />
      <span className="text-body-sm text-ink">{label}</span>
    </div>
  );
}