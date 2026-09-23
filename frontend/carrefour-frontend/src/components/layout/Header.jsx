import { NavLink } from 'react-router-dom';
import Icon from '../atoms/Icon.jsx';
import Badge from '../atoms/Badge.jsx';
import Pill from '../atoms/Pill.jsx';
import SegmentedControl from '../atoms/SegmentedControl.jsx';
import { useUi } from '../../context/UiContext.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';

/* Version applicative — constante d'affichage. */
const APP_VERSION = 'v2.4 LTS';

const NAV_ITEMS = [
  { to: '/schema',     label: 'Schéma Petri',  icon: 'account_tree' },
  { to: '/simulation', label: 'Simulation 2D', icon: 'traffic' },
];

const VIEW_OPTIONS = [
  { value: 'formal',     label: 'Formelle',   icon: 'account_tree' },
  { value: 'simplified', label: 'Simplifiée', icon: 'visibility' },
];

export default function Header() {
  const { viewMode, setViewMode } = useUi();
  const { loading, error } = useNetwork();

  /* Indicateur de connexion backend — 3 états : en cours, connecté, déconnecté. */
  const connectionPill = (() => {
    if (loading) {
      return (
        <Pill tone="primary" live>
          Connexion…
        </Pill>
      );
    }
    if (error) {
      return (
        <Pill tone="danger" live>
          Déconnecté
        </Pill>
      );
    }
    return (
      <Pill tone="success" live>
        Connecté
      </Pill>
    );
  })();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-surface-panel border-b border-border shadow-l1">
      <div className="h-full px-margin flex items-center justify-between gap-space-md">

        {/* ============================================================ */}
        {/* Zone gauche : identité                                       */}
        {/* ============================================================ */}
        <div className="flex items-center gap-space-md shrink-0 min-w-0">
          <div
            className="
              w-9 h-9 rounded-lg bg-primary-soft text-primary
              flex items-center justify-center shrink-0
              transition-transform duration-300 ease-out
              hover:scale-105 hover:rotate-3
            "
          >
            <Icon name="traffic" size={20} />
          </div>

          <div className="flex flex-col leading-tight min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-headline-sm text-ink tracking-tight truncate">
                Carrefour Intelligent
              </span>
              <Badge
                tone="primary"
                variant="soft"
                shape="pill"
                className="hidden sm:inline-flex"
              >
                {APP_VERSION}
              </Badge>
            </div>
            <span className="text-body-sm text-ink-caption truncate">
              Simulateur Réseau de Petri
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Zone centrale : navigation                                   */}
        {/* ============================================================ */}
        <nav className="flex items-center gap-1 p-1 rounded-lg bg-surface-muted">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'relative flex items-center gap-1.5',
                  'px-space-lg py-1.5 rounded-md',
                  'text-label-md font-medium',
                  'transition-all duration-200 ease-out',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-panel',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    name={item.icon}
                    size={16}
                    className={isActive ? 'scale-110' : ''}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ============================================================ */}
        {/* Zone droite : mode + connexion + avatar                      */}
        {/* ============================================================ */}
        <div className="flex items-center gap-space-sm shrink-0">

          {/* Toggle Formelle / Simplifiée */}
          <div className="hidden lg:block">
            <SegmentedControl
              size="sm"
              value={viewMode}
              onChange={setViewMode}
              ariaLabel="Mode d'affichage"
              options={VIEW_OPTIONS}
            />
          </div>

          {/* Indicateur de connexion backend */}
          <div className="hidden sm:block">{connectionPill}</div>

          {/* Avatar utilisateur */}
          <button
            type="button"
            title="Compte"
            className="
              w-9 h-9 rounded-full bg-primary text-white
              flex items-center justify-center shrink-0
              transition-all duration-200 ease-out
              hover:bg-primary-hover hover:scale-105
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
              active:scale-95
            "
          >
            <Icon name="person" size={18} />
          </button>

        </div>

      </div>
    </header>
  );
}