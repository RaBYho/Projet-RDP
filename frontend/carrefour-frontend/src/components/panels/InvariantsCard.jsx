import Icon from '../atoms/Icon.jsx';
import Badge from '../atoms/Badge.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { useUi } from '../../context/UiContext.jsx';

/**
 * InvariantsCard
 *
 * @param {boolean} fillHeight - true : la liste prend toute la hauteur (mode onglet)
 *                               false : la liste est limitée à 220px (mode empilé)
 */
export default function InvariantsCard({ fillHeight = false }) {
  const { constraints, loading } = useNetwork();
  const { viewMode } = useUi();

  if (loading && (!constraints || constraints.length === 0)) {
    return (
      <div className="bg-surface-panel rounded-lg border border-border shadow-l1 p-space-lg">
        <div className="flex items-center gap-2 text-ink-muted">
          <Icon name="progress_activity" size={16} animate="spin" />
          <span className="text-label-md">Chargement des invariants…</span>
        </div>
      </div>
    );
  }

  if (!constraints || constraints.length === 0) {
    return (
      <div className="bg-surface-panel rounded-lg border border-border shadow-l1 p-space-lg">
        <div className="flex items-center gap-space-sm">
          <Icon name="verified_user" size={18} className="text-ink-muted" />
          <span className="text-headline-sm text-ink-muted">
            Invariants &amp; Règles Formelles
          </span>
        </div>
        <p className="text-body-sm text-ink-caption mt-space-sm">
          Aucune contrainte reçue du backend.
        </p>
      </div>
    );
  }

  const satisfiedCount = constraints.filter((c) => c.satisfied).length;
  const total = constraints.length;
  const allSatisfied = satisfiedCount === total;
  const summaryTone = allSatisfied ? 'success' : 'danger';
  const summaryLabel = `${satisfiedCount}/${total} VALIDÉS`;

  /* Mode fillHeight → carte qui remplit son parent + liste flex-1
     Mode normal → carte auto + liste max-h-[220px] */
  const cardClass = fillHeight
    ? 'bg-surface-panel rounded-lg border border-border shadow-l1 p-space-lg flex flex-col gap-space-md h-full min-h-0'
    : 'bg-surface-panel rounded-lg border border-border shadow-l1 p-space-lg flex flex-col gap-space-md';

  const listClass = fillHeight
    ? 'flex flex-col gap-space-sm flex-1 min-h-0 overflow-y-auto scrollbar-thin pr-2 -mr-2'
    : 'flex flex-col gap-space-sm max-h-[220px] overflow-y-auto scrollbar-thin pr-2 -mr-2';

  return (
    <div className={cardClass}>
      {/* En-tête */}
      <div className="flex items-center justify-between gap-space-sm shrink-0">
        <div className="flex items-center gap-space-sm">
          <Icon
            name={allSatisfied ? 'verified' : 'error'}
            size={18}
            className={allSatisfied ? 'text-secondary' : 'text-danger'}
          />
          <span className="text-headline-sm text-ink">
            Invariants &amp; Règles Formelles
          </span>
        </div>
        <Badge
          tone={summaryTone}
          variant="soft"
          shape="tag"
          icon={allSatisfied ? 'check_circle' : 'error'}
        >
          {summaryLabel}
        </Badge>
      </div>

      {/* Liste */}
      <div className={listClass}>
        {constraints.map((c) => (
          <ConstraintRow key={c.id} constraint={c} viewMode={viewMode} />
        ))}
      </div>
    </div>
  );
}

function ConstraintRow({ constraint, viewMode }) {
  const { id, name, satisfied, formal_notation, explanation } = constraint;
  const accentBorder = satisfied ? 'border-l-secondary' : 'border-l-danger';
  const rowBg = satisfied ? 'bg-surface-muted' : 'bg-danger-soft/40';

  return (
    <div
      className={[
        'flex flex-col gap-space-xs',
        'p-space-md rounded-md border-l-4',
        'transition-colors duration-250 ease-out',
        accentBorder,
        rowBg,
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm min-w-0">
          <span
            className={[
              'font-mono text-[10px] font-bold uppercase tracking-wider shrink-0',
              satisfied ? 'text-secondary' : 'text-danger',
            ].join(' ')}
          >
            {id}
          </span>
          <span className="text-label-md font-semibold text-ink truncate">
            {name}
          </span>
        </div>
        <Icon
          name={satisfied ? 'check_circle' : 'cancel'}
          size={16}
          className={satisfied ? 'text-secondary' : 'text-danger'}
        />
      </div>

      {viewMode === 'formal' && formal_notation && (
        <code className="font-mono text-code-sm text-ink-muted block break-words">
          {formal_notation}
        </code>
      )}

      {explanation && (
        <span className="text-body-sm text-ink-caption leading-relaxed">
          {explanation}
        </span>
      )}
    </div>
  );
}