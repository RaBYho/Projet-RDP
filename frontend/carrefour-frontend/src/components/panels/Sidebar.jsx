import { useState } from 'react';
import Icon from '../atoms/Icon.jsx';
import SegmentedControl from '../atoms/SegmentedControl.jsx';
import SidebarSkeleton from './SidebarSkeleton.jsx';
import StateVectorCard from './StateVectorCard.jsx';
import InvariantsCard from './InvariantsCard.jsx';
import JournalCard from './JournalCard.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';

const TAB_OPTIONS = [
  { value: 'invariants', label: 'Invariants', icon: 'verified_user' },
  { value: 'journal',    label: 'Journal',    icon: 'history' },
];

export default function Sidebar({ className = '' }) {
  const { error, network, loading } = useNetwork();
  const [activeTab, setActiveTab] = useState('invariants');

  /* Erreur backend sans données → écran unifié. */
  if (error && !network) {
    return (
      <aside className={['w-full h-full flex', className].filter(Boolean).join(' ')}>
        <div className="bg-danger-soft rounded-lg border border-danger/30 shadow-l1 p-space-lg flex flex-col items-center justify-center gap-space-sm text-center flex-1">
          <Icon name="cloud_off" size={28} className="text-danger" />
          <div>
            <p className="text-label-md text-ink font-semibold">
              Backend injoignable
            </p>
            <p className="text-body-sm text-ink-muted mt-space-xs">{error}</p>
            <p className="text-body-sm text-ink-caption mt-space-xs font-mono">
              Reconnexion automatique en cours…
            </p>
          </div>
        </div>
      </aside>
    );
  }

  /* Chargement initial → squelette. */
  if (loading && !network) {
    return <SidebarSkeleton className={className} />;
  }

  /* État nominal. */
  return (
    <aside
      className={['w-full h-full min-h-0 flex flex-col', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex flex-col h-full min-h-0 gap-space-md">

        {/* Vecteur — toujours visible */}
        <div className="shrink-0">
          <StateVectorCard />
        </div>

        {/* Onglets + contenu */}
        <div className="flex-1 min-h-0 flex flex-col gap-space-md">
          <div className="shrink-0">
            <SegmentedControl
              fullWidth
              value={activeTab}
              onChange={setActiveTab}
              ariaLabel="Panneau d'inspection"
              options={TAB_OPTIONS}
            />
          </div>

          <div className="flex-1 min-h-0">
            {activeTab === 'invariants' && <InvariantsCard fillHeight />}
            {activeTab === 'journal' && <JournalCard fillHeight />}
          </div>
        </div>

      </div>
    </aside>
  );
}