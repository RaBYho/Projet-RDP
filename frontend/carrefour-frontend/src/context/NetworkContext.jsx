import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as api from '../api/client.js';

/* Buffer maximal du journal des tirs côté client. */
const JOURNAL_MAX = 50;

/* Durée d'affichage d'un toast avant auto-dismiss (ms). */
const TOAST_DURATION = 4000;

/* Paramètres du polling de santé backend. */
const POLL_INTERVAL_HEALTHY = 10_000;   // connecté  → 10 s
const POLL_INTERVAL_ERROR   = 3_000;    // déconnecté → 3 s
const POLL_INITIAL_DELAY    = 2_000;    // délai avant le 1er ping après mount

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
};

export function NetworkProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE);

  const toastTimerRef = useRef(null);

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

  /* ------------------------------------------------------------------ */
  /* ΔM helper                                                           */
  /* ------------------------------------------------------------------ */
  const computeDelta = (beforeVector, afterVector) => {
    if (!beforeVector || !afterVector) return null;
    const sum = (v) => Object.values(v).reduce((acc, n) => acc + (n || 0), 0);
    return sum(afterVector) - sum(beforeVector);
  };

  /* ------------------------------------------------------------------ */
  /* Chargement initial complet                                          */
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

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  /* ------------------------------------------------------------------ */
  /* Refresh léger (utilisé après fire/inject/reset)                     */
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
  /* POLLING DE SANTÉ BACKEND                                            */
  /*                                                                     */
  /* - Ping léger via /timer                                             */
  /* - Intervalle adaptatif : 10s si OK, 3s si erreur                    */
  /* - Pause automatique quand l'onglet n'est pas visible                */
  /* - Sur reprise (erreur → OK) : reload complet                        */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    let cancelled = false;
    let intervalId = null;
    let timeoutId = null;

    const isHealthy = !state.error;

    /* Un ping unitaire — très léger. */
    const ping = async () => {
      if (cancelled) return;
      try {
        const timer = await api.getTimer();

        /* Succès : si on était en erreur, on resynchronise tout. */
        if (state.error) {
          await reload();
        } else {
          /* Sinon, mise à jour silencieuse du timer. */
          patch({ timer, lastUpdated: Date.now() });
        }
      } catch {
        /* Échec : on marque l'erreur sans toucher au reste de l'état. */
        if (!state.error) {
          patch({
            error: 'Backend injoignable. Reconnexion automatique…',
          });
        }
      }
    };

    const startInterval = () => {
      if (intervalId) clearInterval(intervalId);
      const delay = isHealthy ? POLL_INTERVAL_HEALTHY : POLL_INTERVAL_ERROR;
      intervalId = setInterval(ping, delay);
    };

    const stopInterval = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    /* Gestion de la visibilité de l'onglet. */
    const handleVisibility = () => {
      if (document.hidden) {
        stopInterval();
      } else {
        ping();           // ping immédiat au retour sur l'onglet
        startInterval();
      }
    };

    /* Premier ping après un court délai (laisse le temps au boot initial). */
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
    /* Deps : on relance l'effet quand l'état de santé change,
       pour basculer automatiquement 10s ↔ 3s. */
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
    [state.network, refreshNetwork, showToast]
  );

  const inject = useCallback(
    async (event) => {
      const beforeVector = state.network?.marking_vector;
      try {
        const res = await api.injectEvent(event);
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
      patch({
        network,
        enabled: enabledRes?.enabled ?? [],
        journal: [],
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

  const value = {
    ...state,
    fire,
    inject,
    reset,
    reload,
    refreshNetwork,
    showToast,
    dismissToast,
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