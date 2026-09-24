import { useCallback, useEffect, useRef, useState } from "react";

/**
 * usePanZoom — pan & zoom type "Google Maps" pour un contenu SVG.
 *
 * Retourne :
 *   - containerRef : ref à attacher au conteneur (là où on mesure et écoute les events)
 *   - transform    : { scale, tx, ty } à appliquer au <g transform>
 *   - isPanning    : bool pour changer le curseur (grab → grabbing)
 *   - didPanRef    : ref bool à checker avant de traiter un clic (pour ignorer
 *                    les clics qui suivent un drag)
 *   - handlers     : { onMouseDown } à étaler sur le conteneur
 *   - actions      : { reset, zoomIn, zoomOut }
 */
export function usePanZoom({
  viewBoxWidth,
  viewBoxHeight,
  minScale = 0.5,
  maxScale = 3,
  zoomFactor = 1.15,
}) {
  const containerRef = useRef(null);
  const [transform, setTransform] = useState({ scale: 1, tx: 0, ty: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const dragRef = useRef(null);

  /* didPanRef : true si le dernier mousedown a engendré un drag.
     Consommé par les clics de nœuds pour éviter les faux tirs. */
  const didPanRef = useRef(false);

  /* ------------------------------------------------------------------ */
  /* Mesure : conversion viewBox ↔ pixels (avec letterboxing)           */
  /* ------------------------------------------------------------------ */
  const getMetrics = useCallback(() => {
    const el = containerRef.current;
    if (!el) return { scale: 1, offsetX: 0, offsetY: 0, rect: null };

    const rect = el.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;
    const scale = Math.min(cw / viewBoxWidth, ch / viewBoxHeight);
    const renderedW = viewBoxWidth * scale;
    const renderedH = viewBoxHeight * scale;
    const offsetX = (cw - renderedW) / 2;
    const offsetY = (ch - renderedH) / 2;

    return { scale, offsetX, offsetY, rect };
  }, [viewBoxWidth, viewBoxHeight]);

  /* ------------------------------------------------------------------ */
  /* Pan : drag à la souris (avec seuil pour ignorer les micro-mouvements) */
  /* ------------------------------------------------------------------ */
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    didPanRef.current = false;
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      pending: true,
    };
  }, []);

  useEffect(() => {
    const handleMove = (e) => {
      const d = dragRef.current;
      if (!d) return;

      /* Seuil de 4px avant de considérer qu'il y a drag */
      if (d.pending) {
        const dist = Math.hypot(e.clientX - d.startX, e.clientY - d.startY);
        if (dist < 4) return;
        d.pending = false;
        didPanRef.current = true;
        setIsPanning(true);
      }

      const dxPx = e.clientX - d.x;
      const dyPx = e.clientY - d.y;
      d.x = e.clientX;
      d.y = e.clientY;

      const m = getMetrics();
      const dxSvg = dxPx / m.scale;
      const dySvg = dyPx / m.scale;

      setTransform((t) => ({
        ...t,
        tx: t.tx + dxSvg,
        ty: t.ty + dySvg,
      }));
    };

    const handleUp = () => {
      dragRef.current = null;
      setIsPanning(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [getMetrics]);

  /* ------------------------------------------------------------------ */
  /* Zoom : molette centrée sur le curseur                               */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      e.preventDefault();

      const m = getMetrics();
      if (!m.rect) return;

      const cx = e.clientX - m.rect.left;
      const cy = e.clientY - m.rect.top;
      const svgX = (cx - m.offsetX) / m.scale;
      const svgY = (cy - m.offsetY) / m.scale;

      setTransform((t) => {
        const factor = e.deltaY > 0 ? 1 / zoomFactor : zoomFactor;
        const newScale = clamp(t.scale * factor, minScale, maxScale);
        if (newScale === t.scale) return t;

        const gx = (svgX - t.tx) / t.scale;
        const gy = (svgY - t.ty) / t.scale;

        return {
          scale: newScale,
          tx: svgX - gx * newScale,
          ty: svgY - gy * newScale,
        };
      });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [getMetrics, minScale, maxScale, zoomFactor]);

  /* ------------------------------------------------------------------ */
  /* Actions externes                                                    */
  /* ------------------------------------------------------------------ */
  const reset = useCallback(() => {
    setTransform({ scale: 1, tx: 0, ty: 0 });
  }, []);

  const zoomBy = useCallback(
    (factor) => {
      const svgX = viewBoxWidth / 2;
      const svgY = viewBoxHeight / 2;

      setTransform((t) => {
        const newScale = clamp(t.scale * factor, minScale, maxScale);
        if (newScale === t.scale) return t;

        const gx = (svgX - t.tx) / t.scale;
        const gy = (svgY - t.ty) / t.scale;

        return {
          scale: newScale,
          tx: svgX - gx * newScale,
          ty: svgY - gy * newScale,
        };
      });
    },
    [viewBoxWidth, viewBoxHeight, minScale, maxScale],
  );

  const zoomIn = useCallback(() => zoomBy(zoomFactor), [zoomBy, zoomFactor]);
  const zoomOut = useCallback(
    () => zoomBy(1 / zoomFactor),
    [zoomBy, zoomFactor],
  );

  return {
    containerRef,
    transform,
    isPanning,
    didPanRef,
    handlers: { onMouseDown: handleMouseDown },
    actions: { reset, zoomIn, zoomOut },
  };
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}
