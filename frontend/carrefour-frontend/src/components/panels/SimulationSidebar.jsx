import { useState } from 'react';
import Icon from '../atoms/Icon.jsx';
import Badge from '../atoms/Badge.jsx';
import SegmentedControl from '../atoms/SegmentedControl.jsx';
import Pill from '../atoms/Pill.jsx';
import JournalCard from './JournalCard.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';

const TAB_OPTIONS = [
  { value: 'diagnostic', label: 'Diagnostic', icon: 'health_and_safety' },
  { value: 'traffic',    label: 'Trafic',     icon: 'commute' },
  { value: 'journal',    label: 'Journal',    icon: 'history' },
];

/* ------------------------------------------------------------------ */
/* Sidebar                                                             */
/* ------------------------------------------------------------------ */
export default function SimulationSidebar({ className = '' }) {
  const { error, network } = useNetwork();
  const [activeTab, setActiveTab] = useState('diagnostic');

  if (error && !network) {
    return (
      <aside className={['w-full h-full flex', className].filter(Boolean).join(' ')}>
        <div className="bg-danger-soft rounded-lg border border-danger/30 shadow-l1 p-space-lg flex flex-col items-center justify-center gap-space-sm text-center flex-1">
          <Icon name="cloud_off" size={28} className="text-danger" />
          <div>
            <p className="text-label-md text-ink font-semibold">
              Backend injoignable
            </p>
            <p className="text-body-sm text-ink-muted mt-space-xs">{error}</p>
            <p className="text-body-sm text-ink-caption mt-space-xs font-mono">
              Reconnexion automatique en cours…
            </p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className={['w-full h-full min-h-0 flex flex-col', className].filter(Boolean).join(' ')}>
      <div className="flex flex-col h-full min-h-0 gap-space-md">

        {/* Phase actuelle — toujours visible */}
        <div className="shrink-0">
          <PhaseCard />
        </div>

        {/* Onglets + contenu */}
        <div className="flex-1 min-h-0 flex flex-col gap-space-md">
          <div className="shrink-0">
            <SegmentedControl
              fullWidth
              size="sm"
              value={activeTab}
              onChange={setActiveTab}
              ariaLabel="Panneau d'inspection"
              options={TAB_OPTIONS}
            />
          </div>

          <div className="flex-1 min-h-0">
            {activeTab === 'diagnostic' && <DiagnosticCard fillHeight />}
            {activeTab === 'traffic'    && <TrafficCard fillHeight />}
            {activeTab === 'journal'    && <JournalCard fillHeight />}
          </div>
        </div>

      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* PhaseCard — état de la phase en cours                               */
/* ------------------------------------------------------------------ */
function PhaseCard() {
  const { network, timer } = useNetwork();
  const marking = network?.marking_vector ?? {};

  const emergencyNS = (marking.P14_NS ?? 0) > 0;
  const emergencyEO = (marking.P14_EO ?? 0) > 0;
  const isEmergency = emergencyNS || emergencyEO;
  const isPedestrian = (marking.P10 ?? 0) > 0;
  const nsGreen = (marking.P1 ?? 0) > 0;
  const eoGreen = (marking.P4 ?? 0) > 0;

  let phaseLabel = 'Intermédiaire';
  let phaseTone = 'neutral';
  let phaseIcon = 'schedule';
  let pillLabel = 'EN COURS';

  if (emergencyNS) {
    phaseLabel = 'Préemption urgence NS';
    phaseTone = 'danger';
    phaseIcon = 'e911_emergency';
    pillLabel = 'URGENCE NS';
  } else if (emergencyEO) {
    phaseLabel = 'Préemption urgence EO';
    phaseTone = 'danger';
    phaseIcon = 'e911_emergency';
    pillLabel = 'URGENCE EO';
  } else if (isPedestrian) {
    phaseLabel = 'Traversée piéton';
    phaseTone = 'pedestrian';
    phaseIcon = 'directions_walk';
  } else if (nsGreen) {
    phaseLabel = 'Phase NS prioritaire';
    phaseTone = 'primary';
    phaseIcon = 'south';
  } else if (eoGreen) {
    phaseLabel = 'Phase EO prioritaire';
    phaseTone = 'primary';
    phaseIcon = 'east';
  }

  const countdown = timer?.seconds_before_forced_change;

  return (
    <div className="bg-surface-panel rounded-lg border border-border shadow-l1 p-space-lg flex flex-col gap-space-md">
      <div className="flex items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm">
          <Icon
            name={phaseIcon}
            size={18}
            className={
              phaseTone === 'danger' ? 'text-danger'
              : phaseTone === 'warning' ? 'text-tertiary'
              : phaseTone === 'pedestrian' ? 'text-pedestrian'
              : 'text-primary'
            }
          />
          <span className="text-headline-sm text-ink">Phase actuelle</span>
        </div>
        <Pill tone={phaseTone} live={isEmergency}>
          {pillLabel}
        </Pill>
      </div>

      <div className="flex items-baseline justify-between gap-space-sm">
        <span className="text-body-md text-ink font-semibold truncate">
          {phaseLabel}
        </span>
        {countdown != null && !isEmergency && (
          <span className="font-mono text-code-md text-ink-muted tabular-nums shrink-0">
            <span className="text-ink font-bold">{countdown}</span>s
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* DiagnosticCard — état de santé du carrefour                         */
/* ------------------------------------------------------------------ */
function DiagnosticCard({ fillHeight = false }) {
  const { constraints, network } = useNetwork();
  const marking = network?.marking_vector ?? {};

  const satisfied = (constraints ?? []).filter((c) => c.satisfied).length;
  const total = constraints?.length ?? 0;
  const allOk = total > 0 && satisfied === total;

  const nsCars = marking.P7 ?? 0;
  const eoCars = marking.P8 ?? 0;
  const avgWait = Math.max(5, Math.round((nsCars + eoCars) * 2.5)); // dérivé
  const co2 = allOk ? '−15%' : '+8%';

  const cardClass = fillHeight
    ? 'bg-surface-panel rounded-lg border border-border shadow-l1 p-space-lg flex flex-col gap-space-md h-full min-h-0'
    : 'bg-surface-panel rounded-lg border border-border shadow-l1 p-space-lg flex flex-col gap-space-md';

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between gap-space-sm shrink-0">
        <div className="flex items-center gap-space-sm">
          <Icon
            name={allOk ? 'health_and_safety' : 'warning'}
            size={18}
            className={allOk ? 'text-secondary' : 'text-danger'}
          />
          <span className="text-headline-sm text-ink">Diagnostic</span>
        </div>
        <Badge
          tone={allOk ? 'success' : 'danger'}
          variant="soft"
          shape="tag"
        >
          {allOk ? 'NOMINAL' : `${satisfied}/${total}`}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-space-sm">
        <DiagnosticTile
          label="Sécurité garantie"
          value={`${satisfied}/${total}`}
          tone={allOk ? 'success' : 'danger'}
        />
        <DiagnosticTile
          label="Conflit de flux"
          value={allOk ? 'Aucun' : 'Détecté'}
          tone={allOk ? 'success' : 'danger'}
          icon={allOk ? 'check_circle' : 'error'}
        />
        <DiagnosticTile
          label="Attente moyenne"
          value={`~${avgWait}s`}
          tone="primary"
        />
        <DiagnosticTile
          label="Émission CO₂"
          value={co2}
          tone={allOk ? 'success' : 'warning'}
        />
      </div>
    </div>
  );
}

function DiagnosticTile({ label, value, tone = 'neutral', icon }) {
  const TONES = {
    success: 'text-secondary',
    danger:  'text-danger',
    warning: 'text-tertiary',
    primary: 'text-primary',
    neutral: 'text-ink',
  };
  const toneClass = TONES[tone] ?? TONES.neutral;

  return (
    <div className="p-space-sm rounded-md bg-surface-muted flex flex-col gap-1">
      <span className="text-body-sm text-ink-muted leading-tight">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <span className={`font-mono text-code-lg font-bold tabular-nums ${toneClass}`}>
          {value}
        </span>
        {icon && <Icon name={icon} size={14} className={toneClass} />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TrafficCard — compteurs d'usagers                                   */
/* ------------------------------------------------------------------ */
function TrafficCard({ fillHeight = false }) {
  const { network } = useNetwork();
  const marking = network?.marking_vector ?? {};

  const emergencyNS = (marking.P14_NS ?? 0) > 0;
  const emergencyEO = (marking.P14_EO ?? 0) > 0;
  const anyEmergency = emergencyNS || emergencyEO;

  const users = [
    {
      key: 'ns',
      icon: 'directions_car',
      label: 'Voitures Nord-Sud',
      value: (marking.P7 ?? 0) + (marking.P16 ?? 0),
      hint: (marking.P1 ?? 0) > 0 ? 'Voie prioritaire (Vert)' : 'En attente',
      tone: (marking.P1 ?? 0) > 0 ? 'success' : 'neutral',
    },
    {
      key: 'eo',
      icon: 'traffic',
      label: 'Voitures Est-Ouest',
      value: (marking.P8 ?? 0) + (marking.P17 ?? 0),
      hint: (marking.P4 ?? 0) > 0 ? 'Voie prioritaire (Vert)' : 'À l\'arrêt (Rouge)',
      tone: (marking.P4 ?? 0) > 0 ? 'success' : 'danger',
    },
    {
      key: 'emergency',
      icon: 'e911_emergency',
      label: 'Ambulance',
      value: anyEmergency ? 1 : 0,
      hint: emergencyNS
        ? 'Axe NS en préemption'
        : emergencyEO
          ? 'Axe EO en préemption'
          : 'Aucune urgence active',
      tone: 'danger',
    },
    {
      key: 'ped',
      icon: 'directions_walk',
      label: 'Piétons',
      value: marking.P9 ?? 0,
      hint: (marking.P10 ?? 0) > 0 ? 'Traversée en cours' : 'Appel enregistré',
      tone: 'pedestrian',
    },
  ];

  const total = users.reduce((sum, u) => sum + u.value, 0);

  const cardClass = fillHeight
    ? 'bg-surface-panel rounded-lg border border-border shadow-l1 p-space-lg flex flex-col gap-space-md h-full min-h-0'
    : 'bg-surface-panel rounded-lg border border-border shadow-l1 p-space-lg flex flex-col gap-space-md';

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between gap-space-sm shrink-0">
        <div className="flex items-center gap-space-sm">
          <Icon name="commute" size={18} className="text-primary" />
          <span className="text-headline-sm text-ink">Trafic &amp; Usagers</span>
        </div>
        <Badge tone="primary" variant="soft" shape="tag">
          Total : {total}
        </Badge>
      </div>

      <div className="flex flex-col gap-space-sm flex-1 min-h-0 overflow-y-auto scrollbar-thin pr-2 -mr-2">
        {users.map((u) => (
          <UserRow key={u.key} {...u} />
        ))}
      </div>
    </div>
  );
}

function UserRow({ icon, label, value, hint, tone = 'neutral' }) {
  const TONES = {
    success:    { bg: 'bg-secondary-soft', text: 'text-secondary',  badge: 'text-secondary' },
    danger:     { bg: 'bg-danger-soft',    text: 'text-danger',     badge: 'text-danger' },
    warning:    { bg: 'bg-tertiary-soft',  text: 'text-tertiary',   badge: 'text-tertiary' },
    pedestrian: { bg: 'bg-pedestrian-soft', text: 'text-pedestrian', badge: 'text-pedestrian' },
    neutral:    { bg: 'bg-surface-muted',  text: 'text-ink',        badge: 'text-ink-muted' },
  };
  const t = TONES[tone] ?? TONES.neutral;

  return (
    <div className="p-space-sm rounded-md bg-surface-muted flex items-center justify-between gap-space-sm">
      <div className="flex items-center gap-space-sm min-w-0">
        <div className={`w-8 h-8 rounded-md ${t.bg} ${t.text} flex items-center justify-center shrink-0`}>
          <Icon name={icon} size={16} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-label-md font-semibold text-ink truncate">
            {label}
          </span>
          <span className={`text-body-sm ${t.badge} truncate`}>
            {hint}
          </span>
        </div>
      </div>
      <span className={`font-mono text-headline-sm font-bold tabular-nums px-2 ${t.text}`}>
        {value}
      </span>
    </div>
  );
}