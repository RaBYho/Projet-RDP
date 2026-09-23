import { NetworkProvider } from './NetworkContext.jsx';
import { UiProvider } from './UiContext.jsx';

/**
 * AppProviders — composition des providers de l'application.
 *
 * Ordre de montage :
 *   1. NetworkProvider  (état serveur — chargé au boot via useEffect)
 *   2. UiProvider       (état client — préférences UI)
 *
 * Aucun des deux ne dépend de l'autre, mais on garde Network
 * en outer pour qu'un futur composant puisse lire le réseau ET
 * piloter l'UI sans ordre imposé.
 *
 * Usage dans App.jsx :
 *   <AppProviders>
 *     <Header />
 *     <main>…</main>
 *     <ControlPanel />
 *   </AppProviders>
 */
export default function AppProviders({ children }) {
  return (
    <NetworkProvider>
      <UiProvider>{children}</UiProvider>
    </NetworkProvider>
  );
}