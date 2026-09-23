export default function Simulation2DPage() {
  return (
    <div className="px-margin py-space-xl max-w-3xl">

      {/* En-tête avec fade-in */}
      <div className="opacity-0 translate-y-2 animate-[fadeUp_400ms_ease-out_forwards]">
        <span
          className="
            inline-flex items-center gap-1.5
            px-space-sm py-1 rounded-full
            bg-secondary-soft text-secondary
            font-mono text-badge-mono uppercase tracking-wider
          "
        >
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          Phase 0 · Coquille
        </span>

        <h1 className="mt-space-md text-display text-ink">
          Simulation 2D
        </h1>

        <p className="mt-space-sm text-body-lg text-ink-muted">
          Vue du carrefour urbain vue du dessus : feux, véhicules, capteurs.
          Le canvas SVG interactif arrive en Phase 6.
        </p>
      </div>

      {/* Carte info — aperçu géométrique simplifié */}
      <div
        className="
          mt-space-xl p-space-lg rounded-lg
          bg-surface-panel border border-border shadow-l1
          opacity-0 translate-y-2
          animate-[fadeUp_400ms_ease-out_150ms_forwards]
        "
      >
        <div className="flex items-start gap-space-md">
          <div
            className="
              w-10 h-10 rounded-lg bg-secondary-soft text-secondary
              flex items-center justify-center shrink-0
            "
          >
            <span className="material-symbols-outlined text-[22px]">traffic</span>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-headline-sm text-ink">
              Topologie Carrefour 4 Voies
            </h2>
            <p className="text-body-md text-ink-muted">
              <span className="font-mono text-code-sm text-ink">
                Couplage Petri synchronisé · Ortho 1:100
              </span>
              <br />
              Flux NS / EO, couloir bus RFID, passages piétons sécurisés.
            </p>
          </div>
        </div>

        {/* Mini-aperçu schématique du carrefour */}
        <div className="mt-space-lg rounded-lg bg-surface p-space-md border border-border">
          <div className="relative w-full aspect-square max-w-[260px] mx-auto">

            {/* Fond quadrillé discret */}
            <div
              className="absolute inset-0 rounded-md"
              style={{
                backgroundImage:
                  'radial-gradient(#CBD5E1 1px, transparent 1px)',
                backgroundSize: '16px 16px',
                opacity: 0.5,
              }}
            />

            {/* Voie verticale (NS) */}
            <div
              className="
                absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2
                bg-surface-muted rounded-sm
                opacity-0
                animate-[fadeIn_500ms_ease-out_450ms_forwards]
              "
            />

            {/* Voie horizontale (EO) */}
            <div
              className="
                absolute top-1/2 left-0 right-0 h-8 -translate-y-1/2
                bg-surface-muted rounded-sm
                opacity-0
                animate-[fadeIn_500ms_ease-out_600ms_forwards]
              "
            />

            {/* Feu NS — vert */}
            <div
              className="
                absolute left-1/2 top-[calc(50%-56px)] -translate-x-1/2
                w-3 h-3 rounded-full bg-secondary
                opacity-0
                animate-[fadeIn_400ms_ease-out_750ms_forwards]
              "
              style={{ boxShadow: '0 0 0 3px rgba(5,150,105,0.15)' }}
            />

            {/* Feu EO — rouge */}
            <div
              className="
                absolute top-1/2 right-[calc(50%-56px)] -translate-y-1/2
                w-3 h-3 rounded-full bg-danger
                opacity-0
                animate-[fadeIn_400ms_ease-out_850ms_forwards]
              "
            />

            {/* Point central (zone carrefour) */}
            <div
              className="
                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                w-3 h-3 rounded-full bg-primary
                opacity-0
                animate-[fadeIn_400ms_ease-out_950ms_forwards]
              "
            />
          </div>
        </div>

        {/* Statut de connexion */}
        <div className="mt-space-lg pt-space-md border-t border-border flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="font-mono text-code-sm text-ink-muted">
            Connexion à l'API backend : en attente (Phase 3)
          </span>
        </div>
      </div>

      {/* Note dev */}
      <p
        className="
          mt-space-xl text-body-sm text-ink-caption
          opacity-0
          animate-[fadeUp_400ms_ease-out_300ms_forwards]
        "
      >
        🚧 Cette page sera remplacée par la simulation 2D complète en Phase 6.
      </p>

    </div>
  );
}