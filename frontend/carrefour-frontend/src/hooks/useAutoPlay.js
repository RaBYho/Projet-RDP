import { useEffect, useRef } from "react";
/** * Auto-play du Carrefour Intelligent. * * Le backend reste la source de vérité : * - `enabled` = transitions réellement franchissables * - `fire()` = tentative réelle de tir côté backend * * Cycle normal : * T7 → passage NS Nord * T17 → passage NS Sud * T1 → NS vert → orange * T2 → NS orange → rouge + EO vert * T8 → passage EO Ouest * T18 → passage EO Est * T4 → EO vert → orange * T5 → EO orange → rouge + NS vert * * T3 et T6 sont volontairement absentes du cycle normal. */ export const CYCLE =
  ["T7", "T17", "T1", "T2", "T8", "T18", "T4", "T5"];
const BASE_INTERVAL_MS = 1200;
const INITIAL_DELAY_MS = 300;
const IDLE_INTERVAL_MS = 500;
/** * Sélectionne la prochaine transition du cycle actuellement activée. * * @param {string[]} enabled * @param {string|null} lastFired * @returns {string|null} */ function selectNextTransition(
  enabled,
  lastFired,
) {
  if (!Array.isArray(enabled) || enabled.length === 0) {
    return null;
  }
  const enabledSet = new Set(enabled);
  let startIndex = 0;
  if (lastFired) {
    const previousIndex = CYCLE.indexOf(lastFired);
    if (previousIndex >= 0) {
      startIndex = (previousIndex + 1) % CYCLE.length;
    }
  }
  for (let i = 0; i < CYCLE.length; i += 1) {
    const index = (startIndex + i) % CYCLE.length;
    const transitionId = CYCLE[index];
    if (enabledSet.has(transitionId)) {
      return transitionId;
    }
  }
  return null;
}
/** * Calcule l'intervalle entre deux tentatives. */ function getInterval(
  rate,
  idle = false,
) {
  if (idle) {
    return IDLE_INTERVAL_MS;
  }
  const numericRate = Number(rate);
  if (!Number.isFinite(numericRate) || numericRate <= 0) {
    return BASE_INTERVAL_MS;
  }
  return Math.max(100, BASE_INTERVAL_MS / numericRate);
}
export function useAutoPlay({ isPlaying, enabled, fire, rate, lastFiredRef }) {
  const enabledRef = useRef(enabled);
  const fireRef = useRef(fire);
  const rateRef = useRef(rate);
  useEffect(() => {
    enabledRef.current = Array.isArray(enabled) ? enabled : [];
  }, [enabled]);
  useEffect(() => {
    fireRef.current = fire;
  }, [fire]);
  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);
  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }
    let cancelled = false;
    let timeoutId = null;
    /** * Boucle principale. * * Fonction déclarée avant `scheduleNext` afin d'éviter * l'erreur "tick was used before it was declared". */ async function tick() {
      if (cancelled) {
        return;
      }
      const currentEnabled = enabledRef.current ?? [];
      const lastFired = lastFiredRef.current ?? null;
      const nextTransition = selectNextTransition(currentEnabled, lastFired);
      /** * Aucune transition du cycle n'est actuellement disponible. * * Exemple normal : * T1 vient de mettre NS en orange, * donc T2 reste bloquée pendant la durée minimale de l'orange. */ if (
        !nextTransition
      ) {
        scheduleNext(getInterval(rateRef.current, true));
        return;
      }
      let result;
      try {
        result = await fireRef.current(nextTransition, { silent: true });
      } catch {
        result = { ok: false };
      }
      if (cancelled) {
        return;
      }
      /** * On mémorise uniquement une transition réellement tirée. */ if (
        result?.ok === true
      ) {
        lastFiredRef.current = nextTransition;
      }
      /** * En cas d'échec, on attend plus longtemps pour éviter * une rafale de requêtes HTTP. */ scheduleNext(
        getInterval(rateRef.current, result?.ok !== true),
      );
    }
    /** * Programme le prochain appel de `tick`. * * `tick` est maintenant déjà déclaré lorsque cette fonction * peut réellement être exécutée. */ function scheduleNext(
      delay,
    ) {
      if (cancelled) {
        return;
      }
      timeoutId = window.setTimeout(tick, delay);
    }
    /** * Premier tick après un court délai. */ timeoutId = window.setTimeout(
      tick,
      INITIAL_DELAY_MS,
    );
    return () => {
      cancelled = true;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
  }, [isPlaying, lastFiredRef]);
}
export { selectNextTransition };
