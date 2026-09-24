import SimulationCanvas from '../components/canvas/SimulationCanvas.jsx';
import ContextBar from '../components/layout/ContextBar.jsx';
import SimulationSidebar from '../components/panels/SimulationSidebar.jsx';
import Toast from '../components/feedback/Toast.jsx';
import Badge from '../components/atoms/Badge.jsx';
import ValueChip from '../components/atoms/ValueChip.jsx';
import Toggle from '../components/atoms/Toggle.jsx';
import Icon from '../components/atoms/Icon.jsx';
import { useNetwork } from '../context/NetworkContext.jsx';
import { useUi } from '../context/UiContext.jsx';

export default function Simulation2DPage() {
  const { network } = useNetwork();
  const {
    showSensors,
    setShowSensors,
    showTrajectories,
    setShowTrajectories,
    viewMode,
  } = useUi();

  const marking = network?.marking_vector ?? {};
  const totalUsers =
    (marking.P7 ?? 0) +
    (marking.P8 ?? 0) +
    (marking.P16 ?? 0) +
    (marking.P17 ?? 0) +
    (marking.P9 ?? 0);

  return (
    <div className="px-margin py-space-lg h-[calc(100dvh-128px)] flex flex-col gap-space-lg overflow-hidden">

      {/* ContextBar */}
      <div className="shrink-0">
        <ContextBar
          divider
          left={
            <>
              <ValueChip
                icon="group"
                label="Usagers :"
                value={totalUsers}
                tone="primary"
              />
              <Badge tone="success" icon="sensors" variant="soft">
                Capteurs actifs
              </Badge>
            </>
          }
          right={
            <>
              <span className="hidden xl:inline font-mono text-badge-mono uppercase tracking-wider text-ink-caption pr-space-xs">
                Affichage
              </span>
              <Toggle
                size="sm"
                checked={showSensors}
                onChange={setShowSensors}
                label="Capteurs"
              />
              <Toggle
                size="sm"
                checked={showTrajectories}
                onChange={setShowTrajectories}
                label="Trajectoires"
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
                <Icon name="traffic" size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-space-sm">
                  <span className="text-headline-sm text-ink truncate">
                    Carrefour 4 Voies
                  </span>
                  <Badge
                    tone="primary"
                    variant="soft"
                    shape="tag"
                    className="hidden sm:inline-flex"
                  >
                    {viewMode === 'formal' ? 'Formel' : 'Simplifié'}
                  </Badge>
                </div>
                <p className="text-body-sm text-ink-caption truncate mt-0.5">
                  Vue de dessus · Couplage Petri synchronisé
                </p>
              </div>
            </div>

            <span className="font-mono text-code-sm text-ink-caption tabular-nums whitespace-nowrap hidden md:inline">
              Ortho 1:100
            </span>
          </header>

          <div className="flex-1 min-h-0">
            <SimulationCanvas />
          </div>
        </section>

        {/* Sidebar */}
        <SimulationSidebar className="xl:col-span-4 min-h-0" />

      </div>

      <Toast />
    </div>
  );
}