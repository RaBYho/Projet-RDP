import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as api from '../api/client.js';
import { useUi } from './UiContext.jsx';
import { useAutoPlay } from '../hooks/useAutoPlay.js';

const JOURNAL_MAX = 50;
const TOAST_DURATION = 4000;

const POLL_INTERVAL_HEALTHY = 10_000;
const POLL_INTERVAL_ERROR   = 3_000;
const POLL_INITIAL_DELAY    = 2_000;

const NetworkContext = createContext(null);

const INITIAL_STATE = {
  network: null,
  enabled: [],
  constraints: [],
  timer: null,
  journal: [],
  loading: true,
  error: null,
  toast: null,
  lastUpdated: null,
  tokenAnimations: [],   // jetons en voyage
};

/* Durée d'une animation de jeton (ms) */
const TOKEN_TRAVEL_MS = 450;

export function NetworkProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastEmergency, setLastEmergency] = useState({ event: null, seq: 0 });

  const toastTimerRef = useRef(null);
  const lastFiredRef = useRef(null);   // pour l'auto-play

  /* Rate depuis UiContext (utilisé pour l'auto-play) */
  const { rate } = useUi();

  const patch = useCallback((partial) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  /* ------------------------------------------------------------------ */
  /* Toasts                                                              */
  /* ------------------------------------------------------------------ */
  const showToast = useCallback((toast) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    patch({ toast });
    toastTimerRef.current = setTimeout(() => {
      setState((s) => (s.toast === toast ? { ...s, toast: null } : s));
      toastTimerRef.current = null;
    }, TOAST_DURATION);
  }, [patch]);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    patch({ toast: null });
  }, [patch]);

  const computeDelta = (beforeVector, afterVector) => {
    if (!beforeVector || !afterVector) return null;
    const sum = (v) => Object.values(v).reduce((acc, n) => acc + (n || 0), 0);
    return sum(afterVector) - sum(beforeVector);
  };
    /* Construit la liste des jetons à animer après un fire.
     Pour chaque sortie de la transition, on anime un jeton qui va
     du premier input vers cette sortie. */
  const buildTokenAnimations = (transitionId, currentNetwork) => {
    if (!currentNetwork?.transitions) return [];

    const t = currentNetwork.transitions.find((x) => x.id === transitionId);
    if (!t) return [];

    const primaryInput = t.inputs?.[0];
    if (!primaryInput) return [];

    const fromPlace = primaryInput.place_id;
    const anims = [];
    const now = Date.now();

    for (let i = 0; i < (t.outputs?.length ?? 0); i++) {
      const out = t.outputs[i];
      /* Skip self-loop (T15 : P15 → P15) */
      if (out.place_id === fromPlace) continue;

      anims.push({
        id: `anim-${now}-${transitionId}-${i}`,
        transitionId,
        from: fromPlace,
        to: out.place_id,
        duration: TOKEN_TRAVEL_MS,
      });
    }

    return anims;
  };

  /* Push puis auto-cleanup après la durée de l'animation */
  const pushTokenAnimations = useCallback((anims) => {
    if (!anims.length) return;

    setState((s) => ({
      ...s,
      tokenAnimations: [...s.tokenAnimations, ...anims],
    }));

    const ids = new Set(anims.map((a) => a.id));
    window.setTimeout(() => {
      setState((s) => ({
        ...s,
        tokenAnimations: s.tokenAnimations.filter((a) => !ids.has(a.id)),
      }));
    }, TOKEN_TRAVEL_MS + 100);
  }, []);
  /* ------------------------------------------------------------------ */
  /* Chargement initial                                                  */
  /* ------------------------------------------------------------------ */
  const reload = useCallback(async () => {
    patch({ loading: true, error: null });
    try {
      const [network, enabledRes, propertiesRes, timer] = await Promise.all([
        api.getNetwork(),
        api.getEnabledTransitions(),
        api.getProperties(),
        api.getTimer(),
      ]);
      patch({
        network,
        enabled: enabledRes?.enabled ?? [],
        constraints: propertiesRes?.constraints ?? [],
        timer,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      });
    } catch (err) {
      patch({
        loading: false,
        error: err?.message ?? 'Erreur de chargement du réseau.',
      });
    }
  }, [patch]);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  /* ------------------------------------------------------------------ */
  /* Refresh léger                                                       */
  /* ------------------------------------------------------------------ */
  const refreshNetwork = useCallback(async () => {
    const [network, enabledRes] = await Promise.all([
      api.getNetwork(),
      api.getEnabledTransitions(),
    ]);
    patch({
      network,
      enabled: enabledRes?.enabled ?? [],
      lastUpdated: Date.now(),
    });
  }, [patch]);

  /* ------------------------------------------------------------------ */
  /* POLLING DE SANTÉ                                                    */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    let cancelled = false;
    let intervalId = null;
    let timeoutId = null;

    const isHealthy = !state.error;

    const ping = async () => {
      if (cancelled) return;
      try {
        const timer = await api.getTimer();
        if (state.error) {
          await reload();
        } else {
          patch({ timer, lastUpdated: Date.now() });
        }
      } catch {
        if (!state.error) {
          patch({ error: 'Backend injoignable. Reconnexion automatique…' });
        }
      }
    };

    const startInterval = () => {
      if (intervalId) clearInterval(intervalId);
      const delay = isHealthy ? POLL_INTERVAL_HEALTHY : POLL_INTERVAL_ERROR;
      intervalId = setInterval(ping, delay);
    };

    const stopInterval = () => {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopInterval();
      } else {
        ping();
        startInterval();
      }
    };

    timeoutId = setTimeout(() => {
      ping();
      startInterval();
    }, POLL_INITIAL_DELAY);

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      stopInterval();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [state.error, reload, patch]);

  /* ------------------------------------------------------------------ */
  /* Actions métier                                                      */
  /* ------------------------------------------------------------------ */
  const fire = useCallback(
    async (transitionId) => {
      const beforeVector = state.network?.marking_vector;
      try {
        const res = await api.fireTransition(transitionId);
        const delta = computeDelta(beforeVector, res?.marking_vector);

        const entry = {
          key: `fire-${Date.now()}-${transitionId}`,
          kind: 'fire',
          transition: transitionId,
          timestamp: res?.timestamp ?? new Date().toISOString(),
          delta,
        };
        setState((s) => ({
          ...s,
          journal: [entry, ...s.journal].slice(0, JOURNAL_MAX),
        }));


        /* Animation du jeton : input → output */
        const anims = buildTokenAnimations(transitionId, state.network);
        pushTokenAnimations(anims);

        await refreshNetwork();
        return { ok: true };
      } catch (err) {
        showToast({
          kind: 'error',
          message: err?.message ?? `Échec du tir ${transitionId}`,
        });
        return { ok: false, error: err };
      }
    },
    [state.network, refreshNetwork, showToast, pushTokenAnimations]
  );

  const inject = useCallback(
    async (event) => {
      const beforeVector = state.network?.marking_vector;
      try {
        const res = await api.injectEvent(event);

        if (event.startsWith('urgence_')) {
          setLastEmergency((prev) => ({ event, seq: prev.seq + 1 }));
        }

        const delta = computeDelta(beforeVector, res?.marking_vector);

        const entry = {
          key: `inject-${Date.now()}-${event}`,
          kind: 'inject',
          transition: `inject:${event}`,
          timestamp: res?.timestamp ?? new Date().toISOString(),
          delta,
        };
        setState((s) => ({
          ...s,
          journal: [entry, ...s.journal].slice(0, JOURNAL_MAX),
        }));

        await refreshNetwork();
        return { ok: true };
      } catch (err) {
        showToast({
          kind: 'error',
          message: err?.message ?? `Échec de l'injection ${event}`,
        });
        return { ok: false, error: err };
      }
    },
    [state.network, refreshNetwork, showToast]
  );

  const reset = useCallback(async () => {
    try {
      const network = await api.resetNetwork();
      const enabledRes = await api.getEnabledTransitions();
      setLastEmergency({ event: null, seq: 0 });
      lastFiredRef.current = null;
      patch({
        network,
        enabled: enabledRes?.enabled ?? [],
        journal: [],
        tokenAnimations: [],
        error: null,
        lastUpdated: Date.now(),
      });
      return { ok: true };
    } catch (err) {
      showToast({
        kind: 'error',
        message: err?.message ?? 'Échec de la réinitialisation.',
      });
      return { ok: false, error: err };
    }
  }, [patch, showToast]);

  /* ------------------------------------------------------------------ */
  /* Auto-play — moteur d'exécution automatique                          */
  /* ------------------------------------------------------------------ */
  useAutoPlay({
    isPlaying,
    enabled: state.enabled,
    fire,
    rate,
    lastFiredRef,
  });

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);

  /* Step : avance d'une seule transition (hors boucle) */
  const step = useCallback(async () => {
    const { CYCLE } = await import('../hooks/useAutoPlay.js');
    const startIdx = lastFiredRef.current
      ? CYCLE.indexOf(lastFiredRef.current) + 1
      : 0;
    for (let i = 0; i < CYCLE.length; i++) {
      const idx = (startIdx + i) % CYCLE.length;
      const tid = CYCLE[idx];
      if ((state.enabled ?? []).includes(tid)) {
        lastFiredRef.current = tid;
        await fire(tid);
        return;
      }
    }
  }, [state.enabled, fire]);

  /* ------------------------------------------------------------------ */
  /* API publique                                                        */
  /* ------------------------------------------------------------------ */
  const value = {
    ...state,
    fire,
    inject,
    reset,
    reload,
    refreshNetwork,
    showToast,
    dismissToast,
    lastEmergency,
    /* Auto-play */
    isPlaying,
    play,
    pause,
    step,
  };

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) {
    throw new Error('useNetwork doit être utilisé dans <NetworkProvider>.');
  }
  return ctx;
}