import { useEffect, useRef } from "react";

/* Cycle complet incluant les files et les feux.
   Les transitions non-enabled sont automatiquement sautées
   (voir selectNextTransition). */
const CYCLE = [
  "T1", // NS vert → orange
  "T7", // File NS Nord traverse
  "T2", // NS orange → rouge
  "T17", // File NS Sud traverse
  "T6", // EO rouge → vert
  "T8", // File EO Ouest traverse
  "T4", // EO vert → orange
  "T18", // File EO Est traverse
  "T5", // EO orange → rouge
  "T3", // NS rouge → vert
];

/* Intervalle de base en ms (modulé par le rate). */
const BASE_INTERVAL_MS = 1200;

/**
 * Sélectionne la prochaine transition à tirer dans le cycle.
 * Cherche, à partir de la position de `lastFired`, la première
 * transition enabled dans l'ordre du cycle.
 */
function selectNextTransition(enabled, lastFired) {
  const startIdx = lastFired ? CYCLE.indexOf(lastFired) + 1 : 0;

  for (let i = 0; i < CYCLE.length; i++) {
    const idx = (startIdx + i) % CYCLE.length;
    const tid = CYCLE[idx];
    if (enabled.includes(tid)) return tid;
  }
  return null;
}

/**
 * useAutoPlay — moteur d'exécution automatique du cycle des feux.
 *
 * @param {boolean}  isPlaying
 * @param {string[]} enabled   - transitions franchissables actuelles
 * @param {Function} fire      - fonction (tid) => Promise
 * @param {number}   rate      - multiplicateur de vitesse (0.1 à 5)
 * @param {Object}   ref       - { current: lastFiredId } pour persister entre ticks
 */
export function useAutoPlay({ isPlaying, enabled, fire, rate, lastFiredRef }) {
  /* On garde `enabled`, `fire` et `rate` dans des refs pour que
     l'intervalle n'ait pas besoin d'être recréé à chaque changement. */
  const enabledRef = useRef(enabled);
  const fireRef = useRef(fire);
  const rateRef = useRef(rate);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);
  useEffect(() => {
    fireRef.current = fire;
  }, [fire]);
  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    if (!isPlaying) return;

    let cancelled = false;
    let timeoutId = null;

    const tick = async () => {
      if (cancelled) return;

      const list = enabledRef.current ?? [];
      const last = lastFiredRef.current;
      const next = selectNextTransition(list, last);

      if (next) {
        lastFiredRef.current = next;
        try {
          await fireRef.current(next);
        } catch {
          /* Silencieux : la boucle continue, l'erreur est déjà toastée */
        }
      }

      if (cancelled) return;

      const interval = BASE_INTERVAL_MS / (rateRef.current || 1);
      timeoutId = setTimeout(tick, interval);
    };

    /* Premier tick après un court délai (pour laisser le temps au refresh) */
    timeoutId = setTimeout(tick, 300);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isPlaying, lastFiredRef]);
}

export { CYCLE };
