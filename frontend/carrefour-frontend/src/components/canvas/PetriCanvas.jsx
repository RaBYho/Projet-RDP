import { useMemo } from 'react';
import Icon from '../atoms/Icon.jsx';
import PlaceNode from '../molecules/PlaceNode.jsx';
import TransitionNode from '../molecules/TransitionNode.jsx';
import ArcPath from '../molecules/ArcPath.jsx';
import AnimatedToken from '../molecules/AnimatedToken.jsx';
import { usePanZoom } from '../../hooks/usePanZoom.js';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { useUi } from '../../context/UiContext.jsx';
import { CATEGORY_ORDER, getCategory } from '../../theme/categories.js';
import {
  VIEWBOX,
  PLACE_POSITIONS,
  TRANSITION_POSITIONS,
  getPlaceRadius,
} from '../../layouts/petriLayout.js';

const TRANSITION_RADIUS_APPROX = 15;

function categoryOfPlace(place, transitions) {
  if (place.category) return place.category;
  const t = transitions.find(
    (tr) =>
      tr.inputs?.some((i) => i.place_id === place.id) ||
      tr.outputs?.some((o) => o.place_id === place.id)
  );
  return t?.category ?? 'normal';
}

export default function PetriCanvas() {
  const { network, enabled, fire, loading, tokenAnimations } = useNetwork();
  const { filter, viewMode } = useUi();

  const panZoom = usePanZoom({
    viewBoxWidth: VIEWBOX.width,
    viewBoxHeight: VIEWBOX.height,
  });
  const { containerRef, transform, isPanning, didPanRef, handlers, actions } = panZoom;

  const enabledSet = useMemo(() => new Set(enabled ?? []), [enabled]);

  const arcs = useMemo(() => {
    if (!network) return [];
    const result = [];
    for (const t of network.transitions) {
      const tPos = TRANSITION_POSITIONS[t.id];
      if (!tPos) continue;

      for (const inp of t.inputs ?? []) {
        const pPos = PLACE_POSITIONS[inp.place_id];
        if (!pPos) continue;
        result.push({
          key: `in-${inp.place_id}-${t.id}`,
          from: pPos,
          to: tPos,
          fromRadius: getPlaceRadius(inp.place_id),
          toRadius: TRANSITION_RADIUS_APPROX,
          category: t.category,
          kind: inp.type === 'inhibitor' ? 'inhibitor' : 'normal',
        });
      }
      for (const out of t.outputs ?? []) {
        const pPos = PLACE_POSITIONS[out.place_id];
        if (!pPos) continue;
        result.push({
          key: `out-${t.id}-${out.place_id}`,
          from: tPos,
          to: pPos,
          fromRadius: TRANSITION_RADIUS_APPROX,
          toRadius: getPlaceRadius(out.place_id),
          category: t.category,
          kind: out.type === 'inhibitor' ? 'inhibitor' : 'normal',
        });
      }
    }
    return result;
  }, [network]);

  const totals = useMemo(() => {
    if (!network) return { tokens: 0, enabled: 0 };
    const tokens = Object.values(network.marking_vector ?? {}).reduce(
      (a, b) => a + (b || 0),
      0
    );
    return { tokens, enabled: enabled.length };
  }, [network, enabled]);

  const isDimmed = (cat) => filter !== 'all' && cat !== filter;

  const handleFire = (id) => {
    if (didPanRef.current) return;
    fire(id);
  };

  /* ==================================================================== */
  /* ÉTAT DE CHARGEMENT — spinner minimaliste                              */
  /* ==================================================================== */
  if (loading && !network) {
    return (
      <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-space-md">
          <svg
            width="48"
            height="48"
            viewBox="0 0 50 50"
            className="animate-[spin_1s_linear_infinite]"
            aria-hidden="true"
          >
            <circle cx="25" cy="25" r="20" fill="none" stroke="#E2E8F0" strokeWidth="4" />
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="#2563EB"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="90 200"
            />
          </svg>
          <div className="flex flex-col items-center gap-space-xs">
            <span className="text-label-md text-ink font-medium">
              Initialisation du réseau
            </span>
            <span className="font-mono text-code-sm text-ink-caption">
              Chargement du modèle Petri…
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!network) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-ink-muted">
        <span className="font-mono text-code-sm">Aucune donnée réseau.</span>
      </div>
    );
  }

  /* ==================================================================== */
  /* ÉTAT NOMINAL — canvas interactif                                      */
  /* ==================================================================== */
  return (
    <div className="relative w-full h-full min-h-[400px] flex flex-col gap-space-sm">

      {/* ================= Canvas ================= */}
      <div
        ref={containerRef}
        {...handlers}
        className={[
          'relative w-full flex-1 rounded-lg overflow-hidden',
          'bg-surface-bright shadow-inner',
          'select-none',
          isPanning ? 'cursor-grabbing' : 'cursor-grab',
        ].join(' ')}
        style={{ touchAction: 'none' }}
      >
        {/* Fond : grille de points fixe */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        >
          <defs>
            <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.75" fill="#CBD5E1" fillOpacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />
        </svg>

        {/* SVG principal avec pan/zoom */}
        <svg
          className="relative w-full h-full block"
          viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {CATEGORY_ORDER.map((cat) => {
              const c = getCategory(cat);
              return (
                <marker
                  key={`arrow-${cat}`}
                  id={`arrow-${cat}`}
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="4"
                  orient="auto"
                >
                  <path d="M 0 0 L 8 4 L 0 8 z" fill={c.hex} />
                </marker>
              );
            })}
            <marker
              id="inhibitor"
              markerWidth="10"
              markerHeight="10"
              refX="5"
              refY="5"
              orient="auto"
            >
              <circle cx="5" cy="5" r="3.5" fill="#FFFFFF" stroke="#DC2626" strokeWidth="1.5" />
            </marker>
          </defs>

          <g transform={`translate(${transform.tx} ${transform.ty}) scale(${transform.scale})`}>
            {/* Couche 1 : arcs */}
            <g>
              {arcs.map((arc) => {
                const cat = getCategory(arc.category);
                const isInhib = arc.kind === 'inhibitor';
                const markerId = isInhib ? 'inhibitor' : `arrow-${arc.category}`;
                const color = isInhib ? '#DC2626' : cat.hex;
                return (
                  <ArcPath
                    key={arc.key}
                    from={arc.from}
                    to={arc.to}
                    fromRadius={arc.fromRadius}
                    toRadius={arc.toRadius}
                    color={color}
                    markerId={markerId}
                    kind={arc.kind}
                    isDimmed={isDimmed(arc.category)}
                  />
                );
              })}
            </g>

            {/* Couche 2 : places */}
            <g>
              {network.places.map((place) => {
                const pos = PLACE_POSITIONS[place.id];
                if (!pos) return null;
                const cat = categoryOfPlace(place, network.transitions);
                return (
                  <PlaceNode
                    key={place.id}
                    place={{ ...place, category: cat }}
                    position={pos}
                    isDimmed={isDimmed(cat)}
                    viewMode={viewMode}
                  />
                );
              })}
            </g>

            {/* Couche 3 : transitions */}
            <g>
              {network.transitions.map((transition) => {
                const pos = TRANSITION_POSITIONS[transition.id];
                if (!pos) return null;
                const isEnabled =
                  enabledSet.has(transition.id) && !isDimmed(transition.category);
                return (
                  <TransitionNode
                    key={transition.id}
                    transition={transition}
                    position={pos}
                    isEnabled={isEnabled}
                    isDimmed={isDimmed(transition.category)}
                    onClick={handleFire}
                    viewMode={viewMode}
                  />
                );
              })}
            </g>

            {/* Couche 4 : jetons animés (par-dessus tout) */}
            <g>
              {(tokenAnimations ?? []).map((anim) => {
                const fromPos = PLACE_POSITIONS[anim.from];
                const toPos = PLACE_POSITIONS[anim.to];
                if (!fromPos || !toPos) return null;

                const place = network.places.find((p) => p.id === anim.from);
                const cat = place?.category
                  ? getCategory(place.category)
                  : getCategory('normal');

                return (
                  <AnimatedToken
                    key={anim.id}
                    from={fromPos}
                    to={toPos}
                    duration={anim.duration}
                    color={cat.hex}
                  />
                );
              })}
            </g>
          </g>
        </svg>

        {/* Overlay compteurs — adapté selon viewMode */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 pointer-events-none">
          <span className="px-2 py-0.5 rounded bg-surface-panel/90 backdrop-blur-sm border border-border font-mono text-code-sm text-ink tabular-nums">
            {viewMode === 'formal'
              ? `M₀ : ${totals.tokens} jeton${totals.tokens > 1 ? 's' : ''}`
              : `${totals.tokens} véhicule${totals.tokens > 1 ? 's' : ''} en attente`}
          </span>
          <span className="px-2 py-0.5 rounded bg-secondary-soft/90 backdrop-blur-sm border border-secondary/20 font-mono text-code-sm text-secondary font-semibold tabular-nums">
            {viewMode === 'formal'
              ? `${totals.enabled} franchissable${totals.enabled > 1 ? 's' : ''}`
              : `${totals.enabled} action${totals.enabled > 1 ? 's' : ''} possible${totals.enabled > 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Overlay mode */}
        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <span className="px-2 py-0.5 rounded bg-surface-panel/90 backdrop-blur-sm border border-border font-mono text-badge-mono uppercase tracking-wider text-ink-muted">
            {viewMode === 'formal' ? 'Formel M(P)' : 'Simplifié'}
          </span>
        </div>

        {/* Contrôles zoom */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 p-1 rounded-lg bg-surface-panel/95 backdrop-blur-sm border border-border shadow-l1">
          <button
            type="button"
            onClick={actions.zoomOut}
            title="Zoom arrière"
            className="w-7 h-7 rounded-md flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors duration-150"
          >
            <Icon name="zoom_out" size={16} />
          </button>
          <span className="min-w-[42px] text-center font-mono text-code-sm text-ink font-semibold tabular-nums">
            {Math.round(transform.scale * 100)}%
          </span>
          <button
            type="button"
            onClick={actions.zoomIn}
            title="Zoom avant"
            className="w-7 h-7 rounded-md flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors duration-150"
          >
            <Icon name="zoom_in" size={16} />
          </button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button
            type="button"
            onClick={actions.reset}
            title="Réinitialiser la vue"
            className="w-7 h-7 rounded-md flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors duration-150"
          >
            <Icon name="fit_screen" size={16} />
          </button>
        </div>

        {/* Hint */}
        <div className="absolute bottom-3 left-3 z-20 pointer-events-none opacity-70">
          <span className="px-2 py-0.5 rounded bg-surface-panel/80 backdrop-blur-sm font-mono text-badge-mono text-ink-caption flex items-center gap-1">
            <Icon name="pan_tool" size={11} />
            Glisser · Molette pour zoomer
          </span>
        </div>
      </div>

      {/* ================= Légende ================= */}
      <div className="flex flex-wrap items-center gap-space-md bg-surface-muted px-space-lg py-space-sm rounded-lg shrink-0">
        {CATEGORY_ORDER.map((cat) => {
          const c = getCategory(cat);
          return (
            <div key={cat} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: c.hex }}
              />
              <span className="text-body-sm text-ink">{c.longLabel}</span>
            </div>
          );
        })}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-4 rounded-sm bg-secondary inline-block" />
          <span className="text-body-sm text-ink font-semibold">
            Transition franchissable
          </span>
        </div>
      </div>

    </div>
  );
}