import Icon from '../atoms/Icon.jsx';
import StateVectorCard from './StateVectorCard.jsx';
import InvariantsCard from './InvariantsCard.jsx';
import JournalCard from './JournalCard.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';

/**
 * Sidebar — panneau latéral droit de la page /schema.
 *
 * Comporte 3 cartes empilées :
 *   1. Vecteur Dynamique M(t)
 *   2. Invariants & Règles Formelles
 *   3. Journal des Tirs
 *
 * Si le backend est injoignable (error non null ET pas de network),
 * on affiche un message unifié au lieu des 3 cartes vides.
 */
export default function Sidebar() {
  const { error, network } = useNetwork();

  /* Erreur backend sans données → on affiche un état unifié. */
  const showErrorState = error && !network;

  if (showErrorState) {
    return (
      <aside className="xl:col-span-4 flex flex-col gap-space-md w-full">
        <div className="bg-danger-soft rounded-lg border border-danger/30 shadow-l1 p-space-lg flex flex-col items-center justify-center gap-space-sm text-center min-h-[200px]">
          <Icon name="cloud_off" size={28} className="text-danger" />
          <div>
            <p className="text-label-md text-ink font-semibold">
              Backend injoignable
            </p>
            <p className="text-body-sm text-ink-muted mt-space-xs">
              {error}
            </p>
            <p className="text-body-sm text-ink-caption mt-space-xs font-mono">
              Reconnexion automatique en cours…
            </p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="xl:col-span-4 flex flex-col gap-space-md w-full">
      <StateVectorCard />
      <InvariantsCard />
      <JournalCard />
    </aside>
  );
}