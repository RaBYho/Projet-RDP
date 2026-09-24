import PetriCanvas from '../components/canvas/PetriCanvas.jsx';
import ContextBar from '../components/layout/ContextBar.jsx';
import Sidebar from '../components/panels/Sidebar.jsx';
import Toast from '../components/feedback/Toast.jsx';
import Badge from '../components/atoms/Badge.jsx';
import SegmentedControl from '../components/atoms/SegmentedControl.jsx';
import Icon from '../components/atoms/Icon.jsx';
import { useNetwork } from '../context/NetworkContext.jsx';
import { useUi } from '../context/UiContext.jsx';
import { CATEGORY_FILTER_OPTIONS } from '../theme/categories.js';

export default function SchemaPetriPage() {
  const { network } = useNetwork();
  const { filter, setFilter, viewMode } = useUi();

  return (
    <div className="px-margin py-space-lg h-[calc(100dvh-128px)] flex flex-col gap-space-lg overflow-hidden">

      {/* ContextBar */}
      <div className="shrink-0">
        <ContextBar
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
        />
      </div>

      {/* Workbench */}
      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-stretch">

        {/* Canvas */}
        <section className="xl:col-span-8 flex flex-col min-h-0 bg-surface-panel rounded-lg border border-border shadow-l1 p-space-lg">
          <header className="flex items-center justify-between gap-space-sm pb-space-md shrink-0">
            <div className="flex items-center gap-space-md min-w-0">
              <div className="w-8 h-8 rounded-md bg-primary-soft text-primary flex items-center justify-center shrink-0">
                <Icon name="account_tree" size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-space-sm">
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
                <p className="text-body-sm text-ink-caption truncate mt-0.5">
                  Topologie 1-sûre · Graphe bipartite PN(P, T, Pre, Post)
                </p>
              </div>
            </div>

            <span className="font-mono text-code-sm text-ink-caption tabular-nums whitespace-nowrap hidden md:inline">
              |P| = {network?.places?.length ?? '—'} · |T| = {network?.transitions?.length ?? '—'}
            </span>
          </header>

          <div className="relative flex-1 min-h-0">
            <PetriCanvas />
          </div>
        </section>

        {/* Sidebar */}
        <Sidebar className="xl:col-span-4 min-h-0" />

      </div>

      <Toast />
    </div>
  );
}