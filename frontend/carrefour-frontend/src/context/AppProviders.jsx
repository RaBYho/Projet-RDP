import { NetworkProvider } from './NetworkContext.jsx';
import { UiProvider } from './UiContext.jsx';

/**
 * AppProviders — composition des providers.
 *
 * Ordre (v3) :
 *   1. UiProvider      (outer, expose rate/isPlaying)
 *   2. NetworkProvider (inner, peut lire useUi())
 *
 * Nécessaire car NetworkProvider utilise le rate pour l'auto-play.
 */
export default function AppProviders({ children }) {
  return (
    <UiProvider>
      <NetworkProvider>{children}</NetworkProvider>
    </UiProvider>
  );
}