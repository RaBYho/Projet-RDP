import Icon from '../atoms/Icon.jsx';
import { useUi } from '../../context/UiContext.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';

/* Boutons d'injection avec accent de couleur par catégorie.
   `event` correspond exactement aux endpoints POST /inject/{event}. */
const INJECTIONS = [
  { event: 'voiture_ns', label: 'Voiture NS', icon: 'south',           accent: 'text-primary' },
  { event: 'voiture_eo', label: 'Voiture EO', icon: 'east',            accent: 'text-primary' },
  { event: 'pieton',     label: 'Piéton',     icon: 'directions_walk', accent: 'text-pedestrian' },
  { event: 'bus',        label: 'Bus',        icon: 'directions_bus',  accent: 'text-tertiary' },
  { event: 'urgence',    label: 'Urgence',    icon: 'warning',         accent: 'text-danger', emphasis: 'danger' },
];

export default function ControlPanel() {
  const { rate, setRate } = useUi();
  const { inject, reset, loading, error } = useNetwork();

  /* Désactive les contrôles tant que le backend n'est pas prêt. */
  const isDisabled = loading || Boolean(error);

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-16 z-40 bg-surface-panel border-t border-border shadow-[0_-1px_3px_0_rgba(0,0,0,0.04)]">
      <div className="h-full px-margin flex items-center justify-between gap-space-md">

        {/* ---------- Zone gauche : injections ---------- */}
        <div className="flex items-center gap-space-sm">
          <span className="hidden xl:inline font-mono text-badge-mono uppercase tracking-wider text-ink-caption pr-space-xs">
            Injection
          </span>

          {/* Conteneur muted groupé */}
          <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-lg">
            {INJECTIONS.map((btn) => (
              <button
                key={btn.event}
                type="button"
                disabled={isDisabled}
                onClick={() => inject(btn.event)}
                title={`Injecter : ${btn.label}`}
                className={[
                  'group flex items-center gap-1.5',
                  'px-space-sm py-1.5 rounded-md',
                  'text-label-md font-medium',
                  'transition-all duration-200 ease-out',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  'active:scale-[0.97]',
                  isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : btn.emphasis === 'danger'
                      ? 'bg-danger text-white hover:bg-danger-hover shadow-sm'
                      : 'bg-surface-panel text-ink hover:bg-surface hover:shadow-sm',
                ].join(' ')}
              >
                <Icon
                  name={btn.icon}
                  size={16}
                  className={[
                    'transition-transform duration-200 ease-out',
                    !isDisabled && 'group-hover:scale-110',
                    btn.emphasis === 'danger' ? 'text-white' : btn.accent,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
                <span>{btn.label}</span>
              </button>
            ))}
          </div>

          {/* Reset M₀ */}
          <button
            type="button"
            disabled={isDisabled}
            onClick={reset}
            title="Réinitialiser au marquage M₀"
            className={[
              'group flex items-center gap-1.5',
              'px-space-sm py-1.5 rounded-md',
              'bg-surface-muted text-ink-muted',
              'text-label-md font-medium',
              'transition-all duration-200 ease-out',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              'active:scale-[0.97]',
              isDisabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-surface hover:text-ink hover:shadow-sm',
            ].join(' ')}
          >
            <Icon
              name="restart_alt"
              size={16}
              className={[
                'transition-transform duration-300 ease-out',
                !isDisabled && 'group-hover:-rotate-180',
              ]
                .filter(Boolean)
                .join(' ')}
            />
            <span>Reset M₀</span>
          </button>
        </div>

        {/* ---------- Zone droite : contrôles simulation ---------- */}
        <div className="flex items-center gap-space-md">

          {/* Groupe lecture — purement visuel pour l'instant.
              Les endpoints Play/Pause/Step n'existent pas dans le contrat. */}
          <div className="flex items-center gap-0.5 bg-surface-muted p-1 rounded-lg">
            <button
              type="button"
              disabled
              title="Endpoint backend non défini"
              className="
                flex items-center justify-center w-7 h-7 rounded-md
                text-ink-muted opacity-50 cursor-not-allowed
              "
            >
              <Icon name="skip_previous" size={18} />
            </button>

            <button
              type="button"
              disabled
              title="Endpoint backend non défini"
              className="
                flex items-center justify-center w-8 h-8 rounded-md
                bg-primary text-white opacity-50 cursor-not-allowed
              "
            >
              <Icon name="play_arrow" size={20} />
            </button>

            <button
              type="button"
              disabled
              title="Endpoint backend non défini"
              className="
                flex items-center justify-center w-7 h-7 rounded-md
                text-ink-muted opacity-50 cursor-not-allowed
              "
            >
              <Icon name="pause" size={18} />
            </button>

            <button
              type="button"
              disabled
              title="Endpoint backend non défini"
              className="
                flex items-center justify-center w-7 h-7 rounded-md
                text-ink-muted opacity-50 cursor-not-allowed
              "
            >
              <Icon name="skip_next" size={18} />
            </button>
          </div>

          {/* Slider de cadence — lit/écrit dans UiContext */}
          <div
            className={[
              'flex items-center gap-2 px-space-sm py-1 bg-surface-muted rounded-lg',
              isDisabled ? 'opacity-50' : '',
            ].join(' ')}
          >
            <Icon name="speed" size={16} className="text-ink-caption" />
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              disabled={isDisabled}
              className="
                w-20 h-1.5 rounded-full appearance-none cursor-pointer
                bg-border-strong
                accent-primary
                transition-all duration-200
                hover:h-2
                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                disabled:cursor-not-allowed
              "
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