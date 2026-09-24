import Icon from '../atoms/Icon.jsx';
import Badge from '../atoms/Badge.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { useUi } from '../../context/UiContext.jsx';
import { getCategory } from '../../theme/categories.js';

const PLACE_IDS = Array.from({ length: 17 }, (_, i) => `P${i + 1}`);
const TOTAL_CELLS = 18; // 6×3

function categoryOfPlace(placeId, network) {
  const place = network?.places?.find((p) => p.id === placeId);
  if (place?.category) return place.category;
  const t = network?.transitions?.find(
    (tr) =>
      tr.inputs?.some((i) => i.place_id === placeId) ||
      tr.outputs?.some((o) => o.place_id === placeId)
  );
  return t?.category ?? 'normal';
}

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

  const vector = network.marking_vector ?? {};
  const totalTokens = PLACE_IDS.reduce((sum, id) => sum + (vector[id] ?? 0), 0);
  const activePlaces = PLACE_IDS.filter((id) => (vector[id] ?? 0) > 0).length;

  const formula = `M = [${PLACE_IDS.map(
    (id) => `${id}:${vector[id] ?? 0}`
  ).join(', ')}]`;

  const emptyCells = TOTAL_CELLS - PLACE_IDS.length;

  /* Adaptations selon le mode d'affichage */
  const isFormal = viewMode === 'formal';
  const title = isFormal ? 'Vecteur Dynamique M(t)' : 'État des places';
  const badge = isFormal ? `dim = ${PLACE_IDS.length}` : `${activePlaces} actives`;

  return (
    <div className="bg-surface-panel rounded-lg border border-border shadow-l1 p-space-lg flex flex-col gap-space-md">

      {/* En-tête */}
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

      {/* Formule brute — uniquement en vue formelle */}
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

      {/* Grille 6×3 */}
      <div className="grid grid-cols-6 gap-1.5 tabular-nums">
        {PLACE_IDS.map((id) => {
          const tokens = vector[id] ?? 0;
          const isActive = tokens > 0;
          const cat = getCategory(categoryOfPlace(id, network));

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

      {/* Pied */}
      <div className="flex items-center justify-between pt-space-md border-t border-border">
        <span className="font-mono text-code-sm text-ink-muted">
          Σ = <span className="text-ink font-bold tabular-nums">{totalTokens}</span>
          {isFormal && <span className="ml-1">jetons</span>}
        </span>
        <span className="font-mono text-code-sm text-ink-caption">
          {PLACE_IDS.length} places
        </span>
      </div>

    </div>
  );
}