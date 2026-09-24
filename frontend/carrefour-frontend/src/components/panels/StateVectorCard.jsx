import Icon from '../atoms/Icon.jsx';
import Badge from '../atoms/Badge.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { useUi } from '../../context/UiContext.jsx';
import { getCategory } from '../../theme/categories.js';

export default function StateVectorCard() {
  const { network, loading } = useNetwork();
  const { viewMode } = useUi();

  if (loading && !network) {
    return (
      <div className="bg-surface-panel rounded-lg border border-border shadow-l1 p-space-lg">
        <div className="flex items-center gap-2 text-ink-muted">
          <Icon name="progress_activity" size={16} animate="spin" />
          <span className="text-label-md">Chargement des places…</span>
        </div>
      </div>
    );
  }

  if (!network) return null;

  /* ✅ On itère sur les vraies places renvoyées par le backend,
     pas sur une liste en dur. Compatible v3 (P13_NS, etc.). */
  const placeIds = network.places.map((p) => p.id);
  const vector = network.marking_vector ?? {};

  const totalTokens = placeIds.reduce((sum, id) => sum + (vector[id] ?? 0), 0);
  const activePlaces = placeIds.filter((id) => (vector[id] ?? 0) > 0).length;

  const formula = `M = [${placeIds.map(
    (id) => `${id}:${vector[id] ?? 0}`
  ).join(', ')}]`;

  /* Padding pour compléter une grille 6×N */
  const cols = 6;
  const rows = Math.ceil(placeIds.length / cols);
  const emptyCells = cols * rows - placeIds.length;

  const isFormal = viewMode === 'formal';
  const title = isFormal ? 'Vecteur Dynamique M(t)' : 'État des places';
  const badge = isFormal ? `dim = ${placeIds.length}` : `${activePlaces} actives`;

  return (
    <div className="bg-surface-panel rounded-lg border border-border shadow-l1 p-space-lg flex flex-col gap-space-md">

      <div className="flex items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm">
          <Icon
            name={isFormal ? 'functions' : 'place'}
            size={18}
            className="text-primary"
          />
          <span className="text-headline-sm text-ink">{title}</span>
        </div>
        <Badge tone="primary" variant="soft" shape="tag">
          {badge}
        </Badge>
      </div>

      {isFormal ? (
        <div className="rounded bg-surface-muted px-space-md py-space-sm overflow-x-auto">
          <code className="font-mono text-code-sm text-ink-muted whitespace-nowrap">
            {formula}
          </code>
        </div>
      ) : (
        <p className="text-body-sm text-ink-muted">
          Marquage actuel des places du réseau. Les places colorées contiennent
          au moins un jeton.
        </p>
      )}

      <div className="grid grid-cols-6 gap-1.5 tabular-nums">
        {placeIds.map((id) => {
          const tokens = vector[id] ?? 0;
          const isActive = tokens > 0;
          const place = network.places.find((p) => p.id === id);
          const cat = getCategory(place?.category ?? 'normal');

          return (
            <div
              key={id}
              className={[
                'flex flex-col items-center justify-center',
                'py-2 px-1 rounded',
                'transition-all duration-250 ease-out',
                isActive
                  ? 'border-transparent'
                  : 'bg-surface-muted text-ink-muted',
              ].join(' ')}
              style={
                isActive
                  ? { backgroundColor: cat.hex, color: '#FFFFFF' }
                  : undefined
              }
            >
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider opacity-90">
                {id}
              </span>
              <span className="font-mono text-[14px] font-bold leading-tight">
                {tokens}
              </span>
            </div>
          );
        })}

        {Array.from({ length: emptyCells }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex items-center justify-center py-2 px-1 rounded opacity-30"
          >
            <span className="font-mono text-[14px] text-ink-disabled">—</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-space-md border-t border-border">
        <span className="font-mono text-code-sm text-ink-muted">
          Σ = <span className="text-ink font-bold tabular-nums">{totalTokens}</span>
          {isFormal && <span className="ml-1">jetons</span>}
        </span>
        <span className="font-mono text-code-sm text-ink-caption">
          {placeIds.length} places
        </span>
      </div>

    </div>
  );
}