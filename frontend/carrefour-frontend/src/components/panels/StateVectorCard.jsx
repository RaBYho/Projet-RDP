import Icon from '../atoms/Icon.jsx';
import Badge from '../atoms/Badge.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { getCategory } from '../../theme/categories.js';

/* Ordre canonique P1 → P15 — toujours le même, indépendamment
   de l'ordre des clés dans le marking_vector renvoyé par l'API. */
const PLACE_IDS = Array.from({ length: 15 }, (_, i) => `P${i + 1}`);

/**
 * Déduit la catégorie d'une place :
 *  1. Si `place.category` existe (backend de test), on l'utilise
 *  2. Sinon, catégorie de la 1re transition connectée
 *  3. Fallback : 'normal'
 */
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

  /* -------- État de chargement -------- */
  if (loading && !network) {
    return (
      <div className="bg-surface-panel rounded-lg border border-border shadow-l1 p-space-md">
        <div className="flex items-center gap-2 text-ink-muted">
          <Icon name="progress_activity" size={16} animate="spin" />
          <span className="text-label-md">Chargement du vecteur…</span>
        </div>
      </div>
    );
  }

  if (!network) return null;

  const vector = network.marking_vector ?? {};
  const totalTokens = PLACE_IDS.reduce((sum, id) => sum + (vector[id] ?? 0), 0);

  /* -------- Ligne de formule brute -------- */
  const formula = `M = [${PLACE_IDS.map(
    (id) => `${id}:${vector[id] ?? 0}`
  ).join(', ')}]`;

  return (
    <div className="bg-surface-panel rounded-lg border border-border shadow-l1 p-space-md flex flex-col gap-space-sm">

      {/* ---- En-tête ---- */}
      <div className="flex items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-xs">
          <Icon name="functions" size={18} className="text-primary" />
          <span className="text-headline-sm text-ink">
            Vecteur Dynamique M(t)
          </span>
        </div>
        <Badge tone="primary" variant="soft" shape="tag">
          dim = {PLACE_IDS.length}
        </Badge>
      </div>

      {/* ---- Formule brute en mono ---- */}
      <div className="rounded bg-surface-muted px-space-sm py-space-xs overflow-x-auto">
        <code className="font-mono text-code-sm text-ink-muted whitespace-nowrap">
          {formula}
        </code>
      </div>

      {/* ---- Grille 5×3 ---- */}
      <div className="grid grid-cols-5 gap-1.5 tabular-nums">
        {PLACE_IDS.map((id) => {
          const tokens = vector[id] ?? 0;
          const isActive = tokens > 0;
          const cat = getCategory(categoryOfPlace(id, network));

          return (
            <div
              key={id}
              className={[
                'flex flex-col items-center justify-center',
                'py-1.5 px-1 rounded',
                'border',
                'transition-all duration-250 ease-out',
                isActive
                  ? 'border-transparent'
                  : 'bg-surface-muted border-transparent text-ink-muted',
              ].join(' ')}
              style={
                isActive
                  ? {
                      backgroundColor: cat.hex,
                      color: '#FFFFFF',
                    }
                  : undefined
              }
            >
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider opacity-90">
                {id}
              </span>
              <span className="font-mono text-[15px] font-bold leading-tight">
                {tokens}
              </span>
            </div>
          );
        })}
      </div>

      {/* ---- Pied : somme + conservation ---- */}
      <div className="flex items-center justify-between pt-space-xs border-t border-border">
        <span className="font-mono text-code-sm text-ink-muted">
          Σ M = <span className="text-ink font-bold tabular-nums">{totalTokens}</span>
        </span>
        <span className="font-mono text-code-sm text-ink-caption">
          15 places · {PLACE_IDS.filter((id) => (vector[id] ?? 0) > 0).length} actives
        </span>
      </div>

    </div>
  );
}