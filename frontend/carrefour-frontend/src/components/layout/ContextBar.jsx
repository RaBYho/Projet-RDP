/**
 * ContextBar — conteneur de barre contextuelle (2 slots).
 *
 * Chaque page compose son contenu :
 *  - /schema     → filtres de catégories + badges de marquage
 *  - /simulation → phase en cours + débit + charge + toggles
 *
 * @param {React.ReactNode} left  - zone gauche (flex-wrap, peut contenir plusieurs items)
 * @param {React.ReactNode} right - zone droite (shrink-0, alignée à droite)
 * @param {boolean} divider       - affiche un séparateur vertical entre left et right
 * @param {string}  className
 */
export default function ContextBar({
  left,
  right,
  divider = false,
  className = '',
}) {
  return (
    <div
      className={[
        'w-full',
        'rounded-lg bg-surface-panel border border-border shadow-l1',
        'px-space-md py-space-xs',
        'flex items-center justify-between gap-space-md',
        // Animation d'entrée douce (fade-up)
        'opacity-0 translate-y-1',
        'animate-[fadeUp_300ms_ease-out_forwards]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* -------- Slot gauche : informations contextuelles -------- */}
      <div className="flex items-center gap-space-sm flex-wrap min-w-0">
        {left}
      </div>

      {/* -------- Séparateur optionnel -------- */}
      {divider && (
        <div className="hidden md:block w-px h-5 bg-border shrink-0" />
      )}

      {/* -------- Slot droit : actions + télémétrie -------- */}
      <div className="flex items-center gap-space-sm shrink-0">
        {right}
      </div>
    </div>
  );
}