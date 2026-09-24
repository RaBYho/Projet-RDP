import SkeletonBlock from '../atoms/SkeletonBlock.jsx';

/**
 * SidebarSkeleton — squelette du panneau latéral droit.
 *
 * Structure calquée sur la Sidebar réelle :
 *   1. Carte Vecteur (fixe en haut)     — grille 6×3 + formule
 *   2. SegmentedControl (onglets)       — 2 blocs
 *   3. Contenu de l'onglet actif        — liste de blocs
 */
export default function SidebarSkeleton({ className = '' }) {
  return (
    <aside
      className={['w-full h-full min-h-0 flex flex-col', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex flex-col h-full min-h-0 gap-space-md">

        {/* ---------- Carte Vecteur (fixe) ---------- */}
        <div className="shrink-0">
          <StateVectorSkeleton />
        </div>

        {/* ---------- Onglets + contenu ---------- */}
        <div className="flex-1 min-h-0 flex flex-col gap-space-md">

          {/* SegmentedControl */}
          <div className="shrink-0 grid grid-cols-2 gap-1 p-0.5 bg-surface-muted rounded-lg">
            <SkeletonBlock height={28} className="rounded-md" />
            <SkeletonBlock height={28} className="rounded-md" />
          </div>

          {/* Contenu de l'onglet */}
          <div className="flex-1 min-h-0">
            <InvariantsSkeleton />
          </div>

        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Squelette : carte Vecteur Dynamique                                 */
/* ------------------------------------------------------------------ */
function StateVectorSkeleton() {
  return (
    <div className="bg-surface-panel rounded-lg border border-border shadow-l1 p-space-lg flex flex-col gap-space-md">

      {/* En-tête */}
      <div className="flex items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm">
          <SkeletonBlock shape="circle" size={18} />
          <SkeletonBlock width={140} height={16} />
        </div>
        <SkeletonBlock width={54} height={18} className="rounded-full" />
      </div>

      {/* Formule brute */}
      <div className="rounded bg-surface-muted px-space-md py-space-sm">
        <SkeletonBlock width="95%" height={14} />
      </div>

      {/* Grille 6×3 (18 cellules) */}
      <div className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: 18 }).map((_, i) => (
          <SkeletonBlock key={i} height={38} className="rounded" />
        ))}
      </div>

      {/* Pied */}
      <div className="flex items-center justify-between pt-space-md border-t border-border">
        <SkeletonBlock width={70} height={12} />
        <SkeletonBlock width={120} height={12} />
      </div>

    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Squelette : carte Invariants                                        */
/* ------------------------------------------------------------------ */
function InvariantsSkeleton() {
  return (
    <div className="bg-surface-panel rounded-lg border border-border shadow-l1 p-space-lg flex flex-col gap-space-md h-full min-h-0">

      {/* En-tête */}
      <div className="flex items-center justify-between gap-space-sm shrink-0">
        <div className="flex items-center gap-space-sm">
          <SkeletonBlock shape="circle" size={18} />
          <SkeletonBlock width={180} height={16} />
        </div>
        <SkeletonBlock width={80} height={18} className="rounded-full" />
      </div>

      {/* Liste de 6 contraintes fantômes */}
      <div className="flex flex-col gap-space-sm flex-1 min-h-0 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-space-md rounded-md bg-surface-muted border-l-4 border-l-border flex flex-col gap-space-xs"
            style={{ animation: `fadeIn 400ms ease-out ${i * 80}ms both` }}
          >
            <div className="flex items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm min-w-0">
                <SkeletonBlock width={24} height={12} />
                <SkeletonBlock width="60%" height={14} />
              </div>
              <SkeletonBlock shape="circle" size={16} />
            </div>
            <SkeletonBlock width="85%" height={11} />
            <SkeletonBlock width="70%" height={11} />
          </div>
        ))}
      </div>

    </div>
  );
}