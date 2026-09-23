import { useEffect } from 'react';
import PetriCanvas from '../components/canvas/PetriCanvas.jsx';
import ContextBar from '../components/layout/ContextBar.jsx';
import Sidebar from '../components/panels/Sidebar.jsx';
import Badge from '../components/atoms/Badge.jsx';
import ValueChip from '../components/atoms/ValueChip.jsx';
import SegmentedControl from '../components/atoms/SegmentedControl.jsx';
import Icon from '../components/atoms/Icon.jsx';
import { useNetwork } from '../context/NetworkContext.jsx';
import { useUi } from '../context/UiContext.jsx';
import { CATEGORY_FILTER_OPTIONS } from '../theme/categories.js';

export default function SchemaPetriPage() {
  const { network, enabled, toast, dismissToast } = useNetwork();
  const { filter, setFilter, viewMode } = useUi();

  const totalTokens = network
    ? Object.values(network.marking_vector ?? {}).reduce((a, b) => a + (b || 0), 0)
    : 0;
  const enabledCount = enabled?.length ?? 0;

  return (
    <div className="px-margin py-space-lg">
      <div className="flex flex-col gap-space-md">

        {/* ======================= */}
        {/* ContextBar              */}
        {/* ======================= */}
        <ContextBar
          divider
          left={
            <>
              <span className="hidden xl:inline font-mono text-badge-mono uppercase tracking-wider text-ink-caption pr-space-xs">
                Filtres
              </span>
              <SegmentedControl
                size="sm"
                value={filter}
                onChange={setFilter}
                ariaLabel="Filtre par catégorie"
                options={CATEGORY_FILTER_OPTIONS}
              />
            </>
          }
          right={
            <>
              <Badge tone="success" icon="bolt" variant="soft">
                {enabledCount} franchissable{enabledCount > 1 ? 's' : ''}
              </Badge>
              <span className="hidden lg:inline-flex">
                <Badge tone="primary" variant="outline">
                  {viewMode === 'formal' ? 'Sûr & Vivant (L4)' : 'Flux régulé'}
                </Badge>
              </span>
            </>
          }
        />

        {/* ======================= */}
        {/* Layout principal        */}
        {/* ======================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md items-start">

          {/* --------- Canvas (8 cols) --------- */}
          <section className="xl:col-span-8 flex flex-col gap-space-sm bg-surface-panel rounded-lg border border-border shadow-l1 p-space-md">
            <header className="flex items-center justify-between gap-space-sm pb-space-xs">
              <div className="flex items-center gap-space-sm min-w-0">
                <div className="w-7 h-7 rounded-md bg-primary-soft text-primary flex items-center justify-center shrink-0">
                  <Icon name="account_tree" size={16} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-space-xs">
                    <span className="text-headline-sm text-ink truncate">
                      Réseau d'Événements Discrets
                    </span>
                    <Badge
                      tone="primary"
                      variant="soft"
                      shape="tag"
                      className="hidden sm:inline-flex"
                    >
                      {viewMode === 'formal' ? 'Formel M(P)' : 'Simplifié'}
                    </Badge>
                  </div>
                  <p className="text-body-sm text-ink-caption truncate">
                    Topologie 1-sûre · Graphe bipartite PN(P, T, Pre, Post)
                  </p>
                </div>
              </div>

              <span className="font-mono text-code-sm text-ink-caption tabular-nums whitespace-nowrap hidden md:inline">
                |P| = {network?.places?.length ?? '—'} · |T| = {network?.transitions?.length ?? '—'}
              </span>
            </header>

            <PetriCanvas />
          </section>

          {/* --------- Sidebar (4 cols) --------- */}
          <Sidebar />

        </div>
      </div>

      {/* ======================= */}
      {/* Mini-toast              */}
      {/* ======================= */}
      <MiniToast toast={toast} onDismiss={dismissToast} />

    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mini-toast — remplacé par le vrai système en Phase 10               */
/* ------------------------------------------------------------------ */
function MiniToast({ toast, onDismiss }) {
  /* Auto-dismiss visuel côté client : le NetworkContext gère déjà
     le timer de 4s, mais on ajoute un fallback clic-manuel. */
  useEffect(() => {
    if (!toast) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onDismiss?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isError = toast.kind === 'error';

  return (
    <div
      role="alert"
      className="
        fixed bottom-20 left-1/2 -translate-x-1/2 z-50
        animate-[fadeUp_250ms_ease-out]
      "
    >
      <div
        className={[
          'flex items-center gap-space-sm',
          'px-space-md py-space-sm rounded-lg',
          'shadow-l2 border',
          'max-w-md',
          isError
            ? 'bg-danger-soft border-danger/40 text-danger'
            : 'bg-secondary-soft border-secondary/40 text-secondary',
        ].join(' ')}
      >
        <Icon
          name={isError ? 'error' : 'info'}
          size={18}
          className="shrink-0"
        />
        <span className="text-label-md font-medium flex-1 min-w-0">
          {toast.message}
        </span>
        <button
          type="button"
          onClick={onDismiss}
          title="Fermer (Échap)"
          className="
            w-6 h-6 rounded flex items-center justify-center shrink-0
            hover:bg-white/40 transition-colors duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-current/30
          "
        >
          <Icon name="close" size={14} />
        </button>
      </div>
    </div>
  );
}