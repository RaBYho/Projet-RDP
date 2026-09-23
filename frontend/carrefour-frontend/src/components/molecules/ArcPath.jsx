/**
 * ArcPath — arc orienté entre deux nœuds du réseau Petri.
 *
 * Géométrie :
 *   - Reçoit `from` et `to` (centres des nœuds)
 *   - Reçoit `fromRadius` et `toRadius` (rayon effectif de chaque nœud)
 *   - Calcule les points sur les bords, dans la direction from → to
 *   - Trace une ligne droite (les arcs courbes seront pour plus tard)
 *
 * Rendu :
 *   - kind = "normal"    → trait plein + flèche à la cible
 *   - kind = "inhibitor" → trait pointillé + cercle vide à la cible
 *
 * Composant 100% présentationnel : aucune logique métier.
 *
 * @param {{x:number,y:number}} from
 * @param {{x:number,y:number}} to
 * @param {number}  fromRadius    - rayon effectif du nœud source
 * @param {number}  toRadius      - rayon effectif du nœud cible
 * @param {string}  color         - couleur hex de l'arc
 * @param {string}  markerId      - ID du <marker> défini dans le parent
 * @param {'normal'|'inhibitor'} kind
 * @param {boolean} isDimmed      - réduit l'opacité (filtre catégorie)
 * @param {boolean} isActive      - arc "actif" (surbrillance légère)
 */
export default function ArcPath({
  from,
  to,
  fromRadius = 18,
  toRadius = 15,
  color = '#94A3B8',
  markerId,
  kind = 'normal',
  isDimmed = false,
  isActive = false,
}) {
  if (!from || !to) return null;

  /* ---- Calcul vectoriel : point de départ / arrivée sur les bords ---- */
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy);

  /* Sécurité : si les deux nœuds sont superposés, on ne dessine rien. */
  if (dist < 1) return null;

  const ux = dx / dist;
  const uy = dy / dist;

  const startX = from.x + ux * fromRadius;
  const startY = from.y + uy * fromRadius;
  const endX = to.x - ux * toRadius;
  const endY = to.y - uy * toRadius;

  /* ---- Style selon le type d'arc ---- */
  const isInhibitor = kind === 'inhibitor';
  const strokeDasharray = isInhibitor ? '4 3' : undefined;
  const strokeWidth = isActive ? 2 : 1.5;

  /* ---- Opacités ---- */
  const baseOpacity = isDimmed ? 0.15 : isActive ? 1 : 0.7;

  return (
    <line
      x1={startX}
      y1={startY}
      x2={endX}
      y2={endY}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      opacity={baseOpacity}
      markerEnd={markerId ? `url(#${markerId})` : undefined}
      style={{
        transition: 'opacity 250ms ease-out, stroke-width 250ms ease-out',
        pointerEvents: 'none',
      }}
    />
  );
}