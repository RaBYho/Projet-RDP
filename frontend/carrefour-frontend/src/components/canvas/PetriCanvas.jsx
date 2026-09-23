import { useMemo } from 'react';
import Icon from '../atoms/Icon.jsx';
import PlaceNode from '../molecules/PlaceNode.jsx';
import TransitionNode from '../molecules/TransitionNode.jsx';
import ArcPath from '../molecules/ArcPath.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { useUi } from '../../context/UiContext.jsx';
import { CATEGORY_ORDER, getCategory } from '../../theme/categories.js';
import {
  VIEWBOX,
  PLACE_POSITIONS,
  TRANSITION_POSITIONS,
  getPlaceRadius,
} from '../../layouts/petriLayout.js';

/* Approximation du "rayon" d'une transition (rectangle 8×30).
   Utilisé pour arrêter les arcs au bord du rectangle. */
const TRANSITION_RADIUS_APPROX = 15;

/**
 * Déduit la catégorie d'une place.
 * Priorité : place.category (fourni par le backend de test).
 * Fallback : catégorie de la 1re transition connectée.
 */
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
  const { network, enabled, fire, loading } = useNetwork();
  const { filter, viewMode } = useUi();

  /* Set des transitions enabled → lookup O(1) au render. */
  const enabledSet = useMemo(() => new Set(enabled ?? []), [enabled]);

  /* -------- Construction des arcs à partir des transitions -------- */
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

  /* -------- Compteurs pour l'overlay -------- */
  const totals = useMemo(() => {
    if (!network) return { tokens: 0, enabled: 0 };
    const tokens = Object.values(network.marking_vector ?? {}).reduce(
      (a, b) => a + (b || 0),
      0
    );
    return { tokens, enabled: enabled.length };
  }, [network, enabled]);

  /* -------- Helper filtrage -------- */
  const isDimmed = (cat) => filter !== 'all' && cat !== filter;

  /* -------- État de chargement -------- */
  if (loading && !network) {
    return (
      <div className="flex flex-col items-center justify-center h-[580px] gap-space-sm text-ink-muted">
        <Icon name="progress_activity" size={28} animate="spin" className="text-primary" />
        <span className="font-mono text-code-sm">Chargement du réseau…</span>
      </div>
    );
  }

  if (!network) {
    return (
      <div className="flex items-center justify-center h-[580px] text-ink-muted">
        <span className="font-mono text-code-sm">Aucune donnée réseau.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-space-sm">

      {/* ================= Canvas SVG ================= */}
      <div className="relative w-full h-[580px] bg-surface-bright rounded-lg overflow-hidden shadow-inner">

        {/* Grille de points en fond */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.75" fill="#CBD5E1" fillOpacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />
        </svg>

        {/* Overlay : compteurs en haut à gauche */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded bg-surface-panel/90 backdrop-blur-sm border border-border font-mono text-code-sm text-ink tabular-nums">
            M₀ : {totals.tokens} jeton{totals.tokens > 1 ? 's' : ''}
          </span>
          <span className="px-2 py-0.5 rounded bg-secondary-soft/90 backdrop-blur-sm border border-secondary/20 font-mono text-code-sm text-secondary font-semibold tabular-nums">
            {totals.enabled} franchissable{totals.enabled > 1 ? 's' : ''}
          </span>
        </div>

        {/* Overlay : mode en haut à droite */}
        <div className="absolute top-3 right-3 z-20">
          <span className="px-2 py-0.5 rounded bg-surface-panel/90 backdrop-blur-sm border border-border font-mono text-badge-mono uppercase tracking-wider text-ink-muted">
            {viewMode === 'formal' ? 'Formel M(P)' : 'Simplifié'}
          </span>
        </div>

        {/* Canvas principal */}
        <svg
          className="w-full h-full relative z-10 p-2"
          viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* -------- Markers -------- */}
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

          {/* -------- Couche 1 : arcs (sous les nœuds) -------- */}
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

          {/* -------- Couche 2 : places -------- */}
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

          {/* -------- Couche 3 : transitions -------- */}
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
                  onClick={fire}
                  viewMode={viewMode}
                />
              );
            })}
          </g>
        </svg>
      </div>

      {/* ================= Légende ================= */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-muted px-space-md py-space-xs rounded-lg">
        <div className="flex items-center gap-space-md flex-wrap">
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
        <div className="font-mono text-code-sm text-ink-muted">
          Pondération W(Pre)=1, W(Post)=1
        </div>
      </div>

    </div>
  );
}