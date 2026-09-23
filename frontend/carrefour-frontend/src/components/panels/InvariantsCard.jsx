import Icon from '../atoms/Icon.jsx';
import Badge from '../atoms/Badge.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { useUi } from '../../context/UiContext.jsx';

/**
 * InvariantsCard — état des 7 contraintes formelles du réseau.
 *
 * Rendu :
 *   - Vue formelle   : name + formal_notation + explanation
 *   - Vue simplifiée : name + explanation (formal_notation masquée)
 *
 * La liste des contraintes est scrollable (l'en-tête reste fixe).
 */
export default function InvariantsCard() {
  const { constraints, loading } = useNetwork();
  const { viewMode } = useUi();

  /* -------- État de chargement -------- */
  if (loading && (!constraints || constraints.length === 0)) {
    return (
      <div className="bg-surface-panel rounded-lg border border-border shadow-l1 p-space-md">
        <div className="flex items-center gap-2 text-ink-muted">
          <Icon name="progress_activity" size={16} animate="spin" />
          <span className="text-label-md">Chargement des invariants…</span>
        </div>
      </div>
    );
  }

  if (!constraints || constraints.length === 0) {
    return (
      <div className="bg-surface-panel rounded-lg border border-border shadow-l1 p-space-md">
        <div className="flex items-center gap-space-xs">
          <Icon name="verified_user" size={18} className="text-ink-muted" />
          <span className="text-headline-sm text-ink-muted">
            Invariants &amp; Règles Formelles
          </span>
        </div>
        <p className="text-body-sm text-ink-caption mt-space-xs">
          Aucune contrainte reçue du backend.
        </p>
      </div>
    );
  }

  /* -------- Compteurs -------- */
  const satisfiedCount = constraints.filter((c) => c.satisfied).length;
  const total = constraints.length;
  const allSatisfied = satisfiedCount === total;

  const summaryTone = allSatisfied ? 'success' : 'danger';
  const summaryLabel = `${satisfiedCount}/${total} VALIDÉS`;

  return (
    <div className="bg-surface-panel rounded-lg border border-border shadow-l1 p-space-md flex flex-col gap-space-sm">

      {/* ---- En-tête (fixe) ---- */}
      <div className="flex items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-xs">
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

      {/* ---- Liste scrollable ---- */}
      <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1 -mr-1">
        {constraints.map((c) => (
          <ConstraintRow
            key={c.id}
            constraint={c}
            viewMode={viewMode}
          />
        ))}
      </div>

    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sous-composant : une ligne de contrainte                            */
/* ------------------------------------------------------------------ */
function ConstraintRow({ constraint, viewMode }) {
  const { id, name, satisfied, formal_notation, explanation } = constraint;

  const accentBorder = satisfied ? 'border-l-secondary' : 'border-l-danger';
  const rowBg = satisfied ? 'bg-surface-muted' : 'bg-danger-soft/40';

  return (
    <div
      className={[
        'flex flex-col gap-1',
        'p-2.5 rounded-md border-l-4',
        'transition-colors duration-250 ease-out',
        accentBorder,
        rowBg,
      ].join(' ')}
    >
      {/* ---- Ligne 1 : nom + statut ---- */}
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex items-center gap-space-xs min-w-0">
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

      {/* ---- Ligne 2 : notation formelle (vue formelle uniquement) ---- */}
      {viewMode === 'formal' && formal_notation && (
        <code className="font-mono text-code-sm text-ink-muted block break-words">
          {formal_notation}
        </code>
      )}

      {/* ---- Ligne 3 : explication en langage naturel ---- */}
      {explanation && (
        <span className="text-body-sm text-ink-caption leading-snug">
          {explanation}
        </span>
      )}
    </div>
  );
}