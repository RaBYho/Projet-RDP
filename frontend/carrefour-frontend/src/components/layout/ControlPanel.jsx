import Icon from '../atoms/Icon.jsx';
import { useUi } from '../../context/UiContext.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';

const INJECTIONS = [
  { event: 'voiture_ns',     label: 'NS ↓',    icon: 'south',           accent: 'text-primary',    tooltip: 'Voiture NS (Nord → Sud)' },
  { event: 'voiture_ns_sud', label: 'NS ↑',    icon: 'north',           accent: 'text-primary',    tooltip: 'Voiture NS (Sud → Nord)' },
  { event: 'voiture_eo',     label: 'EO →',    icon: 'east',            accent: 'text-primary',    tooltip: 'Voiture EO (Ouest → Est)' },
  { event: 'voiture_eo_est', label: 'EO ←',    icon: 'west',            accent: 'text-primary',    tooltip: 'Voiture EO (Est → Ouest)' },
  { event: 'pieton',         label: 'Piéton',  icon: 'directions_walk', accent: 'text-pedestrian', tooltip: 'Déclencher le bouton piéton' },
];

const EMERGENCIES = [
  { event: 'urgence_n', label: 'N', icon: 'south', tooltip: 'Urgence venant du Nord' },
  { event: 'urgence_s', label: 'S', icon: 'north', tooltip: 'Urgence venant du Sud' },
  { event: 'urgence_w', label: 'W', icon: 'east',  tooltip: 'Urgence venant de l\'Ouest' },
  { event: 'urgence_e', label: 'E', icon: 'west',  tooltip: 'Urgence sortant de l\'hôpital' },
];

export default function ControlPanel() {
  const { rate, setRate } = useUi();
  const { inject, reset, loading, error, isPlaying, play, pause, step } = useNetwork();

  const isDisabled = loading || Boolean(error);

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-16 z-40 bg-surface-panel border-t border-border shadow-[0_-1px_3px_0_rgba(0,0,0,0.04)]">
      <div className="h-full px-margin flex items-center justify-between gap-space-md">

        {/* ============================================================ */}
        {/* Zone gauche : injections + urgences + reset                   */}
        {/* ============================================================ */}
        <div className="flex items-center gap-space-sm min-w-0">

          <span className="hidden 2xl:inline font-mono text-badge-mono uppercase tracking-wider text-ink-caption pr-space-xs shrink-0">
            Injection
          </span>

          {/* Boutons véhicules normaux */}
          <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-lg overflow-x-auto">
            {INJECTIONS.map((btn) => {
              const base = 'group flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-label-md font-medium whitespace-nowrap transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';
              const styles = isDisabled
                ? 'opacity-50 cursor-not-allowed bg-surface-panel text-ink'
                : 'bg-surface-panel text-ink hover:bg-surface hover:shadow-sm active:scale-[0.97]';
              return (
                <button
                  key={btn.event}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => inject(btn.event)}
                  title={btn.tooltip}
                  className={`${base} ${styles}`}
                >
                  <Icon
                    name={btn.icon}
                    size={16}
                    className={['transition-transform duration-200 ease-out', !isDisabled && 'group-hover:scale-110', btn.accent].filter(Boolean).join(' ')}
                  />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>

          {/* Boutons urgence directionnels */}
          <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-lg shrink-0">
            <span className="hidden 2xl:inline font-mono text-badge-mono uppercase tracking-wider text-danger px-1 shrink-0">
              Urgence
            </span>
            {EMERGENCIES.map((btn) => (
              <button
                key={btn.event}
                type="button"
                disabled={isDisabled}
                onClick={() => inject(btn.event)}
                title={btn.tooltip}
                className={[
                  'group flex items-center gap-1 px-2 py-1.5 rounded-md text-label-md font-semibold whitespace-nowrap',
                  'transition-all duration-200 ease-out',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-danger/40',
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed bg-danger text-white'
                    : 'bg-danger text-white hover:bg-danger-hover shadow-sm active:scale-[0.97]',
                ].join(' ')}
              >
                <Icon
                  name={btn.icon}
                  size={14}
                  className="transition-transform duration-200 ease-out group-hover:scale-110"
                />
                <span>{btn.label}</span>
              </button>
            ))}
          </div>

          {/* Reset */}
          <button
            type="button"
            disabled={isDisabled}
            onClick={reset}
            title="Réinitialiser au marquage M₀"
            className={[
              'group flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-md',
              'bg-surface-muted text-ink-muted text-label-md font-medium whitespace-nowrap',
              'transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.97]',
              isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface hover:text-ink hover:shadow-sm',
            ].join(' ')}
          >
            <Icon
              name="restart_alt"
              size={16}
              className={['transition-transform duration-300 ease-out', !isDisabled && 'group-hover:-rotate-180'].filter(Boolean).join(' ')}
            />
            <span className="hidden lg:inline">Reset</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* Zone droite : lecture + cadence                               */}
        {/* ============================================================ */}
        <div className="flex items-center gap-space-md shrink-0">

          <div className="flex items-center gap-0.5 bg-surface-muted p-1 rounded-lg">
            <button
              type="button"
              disabled
              title="Pas arrière (non supporté)"
              className="flex items-center justify-center w-7 h-7 rounded-md text-ink-muted opacity-40 cursor-not-allowed"
            >
              <Icon name="skip_previous" size={18} />
            </button>

            <button
              type="button"
              disabled={isDisabled || isPlaying}
              onClick={play}
              title="Lancer la simulation automatique"
              className={[
                'flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ease-out',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                isDisabled || isPlaying
                  ? 'bg-primary text-white opacity-50 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-hover hover:shadow-md hover:scale-105 active:scale-95',
              ].join(' ')}
            >
              <Icon name="play_arrow" size={20} />
            </button>

            <button
              type="button"
              disabled={isDisabled || !isPlaying}
              onClick={pause}
              title="Pause"
              className={[
                'flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200 ease-out',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                isDisabled || !isPlaying
                  ? 'text-ink-muted opacity-40 cursor-not-allowed'
                  : 'text-danger bg-danger-soft hover:bg-danger hover:text-white active:scale-90',
              ].join(' ')}
            >
              <Icon name="pause" size={18} />
            </button>

            <button
              type="button"
              disabled={isDisabled || isPlaying}
              onClick={step}
              title="Avancer d'une transition"
              className={[
                'flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200 ease-out',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                isDisabled || isPlaying
                  ? 'text-ink-muted opacity-40 cursor-not-allowed'
                  : 'text-ink-muted hover:text-ink hover:bg-surface-panel active:scale-90',
              ].join(' ')}
            >
              <Icon name="skip_next" size={18} />
            </button>
          </div>

          <div className={['flex items-center gap-2 px-space-sm py-1 bg-surface-muted rounded-lg', isDisabled ? 'opacity-50' : ''].join(' ')}>
            <Icon name="speed" size={16} className="text-ink-caption" />
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              disabled={isDisabled}
              className="w-20 h-1.5 rounded-full appearance-none cursor-pointer bg-border-strong accent-primary transition-all duration-200 hover:h-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed"
              aria-label="Cadence de simulation"
            />
            <span className="font-mono text-code-sm text-ink font-semibold tabular-nums w-9 text-right">
              {rate.toFixed(1)}×
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}