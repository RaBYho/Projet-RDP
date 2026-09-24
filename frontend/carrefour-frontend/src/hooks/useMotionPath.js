import { useEffect, useRef, useState } from "react";

/**
 * useMotionPath — anime un point le long d'un chemin SVG.
 *
 * Principe :
 *   1. Reçoit une `pathD` (string SVG) et une durée
 *   2. Crée un <path> caché en mémoire (via un <svg> hors DOM)
 *   3. Anime un paramètre `progress` de 0 à 1 sur `duration` ms
 *   4. Calcule la position (x, y) + l'angle (rotation) à chaque frame
 *
 * @param {string} pathD           - attribut d="" du chemin
 * @param {boolean} active         - démarre/arrête l'animation
 * @param {number} duration        - durée totale en ms
 * @param {Function} onComplete    - callback à la fin
 *
 * @returns {{ x, y, angle, progress } | null}
 */
export function useMotionPath({ pathD, active, duration = 6000, onComplete }) {
  const [state, setState] = useState({ x: 0, y: 0, angle: 0, progress: 0 });
  const pathRef = useRef(null);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  /* ----- Création du <path> en mémoire ----- */
  useEffect(() => {
    /* On crée un SVG hors DOM pour utiliser getPointAtLength */
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathD);
    svg.appendChild(path);
    pathRef.current = path;
  }, [pathD]);

  /* ----- Animation ----- */
  useEffect(() => {
    if (!active || !pathRef.current) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const path = pathRef.current;
    const totalLength = path.getTotalLength();
    if (totalLength === 0) return;

    startTimeRef.current = null;
    let cancelled = false;

    const step = (timestamp) => {
      if (cancelled) return;

      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      const distance = progress * totalLength;
      const point = path.getPointAtLength(distance);
      const ahead = path.getPointAtLength(Math.min(distance + 1, totalLength));
      const angle =
        (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI;

      setState({ x: point.x, y: point.y, angle, progress });

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        onCompleteRef.current?.();
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, pathD, duration]);

  return active ? state : null;
}
