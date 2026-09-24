import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import * as api from "../api/client.js";
import { useUi } from "./UiContext.jsx";
import { useAutoPlay } from "../hooks/useAutoPlay.js";

const JOURNAL_MAX = 50;
const TOAST_DURATION = 4000;
const TOKEN_TRAVEL_MS = 450;

const POLL_INTERVAL_HEALTHY = 1000;
const POLL_INTERVAL_ERROR = 3000;
const POLL_INITIAL_DELAY = 500;

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
  tokenAnimations: [],
};

export function NetworkProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE);
  const [isPlaying, setIsPlaying] = useState(false);

  const [lastEmergency, setLastEmergency] = useState({
    event: null,
    seq: 0,
  });

  const toastTimerRef = useRef(null);
  const lastFiredRef = useRef(null);

  const { rate } = useUi();

  const patch = useCallback((partial) => {
    setState((prev) => ({
      ...prev,
      ...partial,
    }));
  }, []);

  // ---------------------------------------------------------------------------
  // Toasts
  // ---------------------------------------------------------------------------

  const showToast = useCallback(
    (toast) => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }

      patch({ toast });

      toastTimerRef.current = window.setTimeout(() => {
        setState((current) =>
          current.toast === toast
            ? { ...current, toast: null }
            : current
        );

        toastTimerRef.current = null;
      }, TOAST_DURATION);
    },
    [patch]
  );

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }

    patch({ toast: null });
  }, [patch]);

  // ---------------------------------------------------------------------------
  // Utilitaires
  // ---------------------------------------------------------------------------

  const computeDelta = useCallback((beforeVector, afterVector) => {
    if (!beforeVector || !afterVector) {
      return null;
    }

    const sum = (vector) =>
      Object.values(vector).reduce(
        (total, value) => total + (value || 0),
        0
      );

    return sum(afterVector) - sum(beforeVector);
  }, []);

  // ---------------------------------------------------------------------------
  // Animations de jetons
  // ---------------------------------------------------------------------------

  const buildTokenAnimations = useCallback(
    (transitionId, currentNetwork) => {
      if (!currentNetwork?.transitions) {
        return [];
      }

      const transition = currentNetwork.transitions.find(
        (item) => item.id === transitionId
      );

      if (!transition) {
        return [];
      }

      const primaryInput = transition.inputs?.[0];

      if (!primaryInput) {
        return [];
      }

      const fromPlace = primaryInput.place_id;
      const animations = [];
      const now = Date.now();

      for (
        let index = 0;
        index < (transition.outputs?.length ?? 0);
        index += 1
      ) {
        const output = transition.outputs[index];

        if (output.place_id === fromPlace) {
          continue;
        }

        animations.push({
          id: `anim-${now}-${transitionId}-${index}`,
          transitionId,
          from: fromPlace,
          to: output.place_id,
          duration: TOKEN_TRAVEL_MS,
        });
      }

      return animations;
    },
    []
  );

  const pushTokenAnimations = useCallback((animations) => {
    if (!animations.length) {
      return;
    }

    setState((current) => ({
      ...current,
      tokenAnimations: [
        ...current.tokenAnimations,
        ...animations,
      ],
    }));

    const ids = new Set(
      animations.map((animation) => animation.id)
    );

    window.setTimeout(() => {
      setState((current) => ({
        ...current,
        tokenAnimations: current.tokenAnimations.filter(
          (animation) => !ids.has(animation.id)
        ),
      }));
    }, TOKEN_TRAVEL_MS + 100);
  }, []);

  // ---------------------------------------------------------------------------
  // Synchronisation complète du backend
  //
  // Important :
  // Le scheduler backend peut modifier le réseau sans aucune action
  // du frontend. On doit donc resynchroniser :
  //   - network
  //   - enabled
  //   - constraints
  //   - timer
  // ---------------------------------------------------------------------------

  const syncBackend = useCallback(async () => {
    const [network, enabledRes, propertiesRes, timer] =
      await Promise.all([
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
      lastUpdated: Date.now(),
      error: null,
    });

    return {
      network,
      enabled: enabledRes?.enabled ?? [],
      constraints: propertiesRes?.constraints ?? [],
      timer,
    };
  }, [patch]);

  // ---------------------------------------------------------------------------
  // Chargement initial
  // ---------------------------------------------------------------------------

  const reload = useCallback(async () => {
    patch({
      loading: true,
      error: null,
    });

    try {
      await syncBackend();

      patch({
        loading: false,
        error: null,
      });

      return {
        ok: true,
      };
    } catch (error) {
      patch({
        loading: false,
        error:
          error?.message ??
          "Erreur de chargement du réseau.",
      });

      return {
        ok: false,
        error,
      };
    }
  }, [patch, syncBackend]);

  useEffect(() => {
    reload();
  }, [reload]);

  // ---------------------------------------------------------------------------
  // Nettoyage
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Synchronisation légère
  // ---------------------------------------------------------------------------

  const refreshNetwork = useCallback(async () => {
    return syncBackend();
  }, [syncBackend]);

  // ---------------------------------------------------------------------------
  // Polling
  //
  // IMPORTANT :
  // On ne récupère plus uniquement /timer.
  // Le backend peut faire évoluer le réseau via le scheduler.
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;
    let timeoutId = null;

    const poll = async () => {
      if (cancelled) {
        return;
      }

      try {
        await syncBackend();
      } catch (error) {
        if (!cancelled) {
          patch({
            error:
              error?.message ??
              "Backend injoignable. Reconnexion automatique…",
          });
        }
      }

      if (cancelled) {
        return;
      }

      const delay = state.error
        ? POLL_INTERVAL_ERROR
        : POLL_INTERVAL_HEALTHY;

      timeoutId = window.setTimeout(poll, delay);
    };

    const initialTimeout = window.setTimeout(
      poll,
      POLL_INITIAL_DELAY
    );

    const handleVisibility = () => {
      if (document.hidden) {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
          timeoutId = null;
        }
        return;
      }

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      poll();
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      cancelled = true;

      window.clearTimeout(initialTimeout);

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [state.error, patch, syncBackend]);

  // ---------------------------------------------------------------------------
  // Action : fire
  // ---------------------------------------------------------------------------

  const fire = useCallback(
    async (transitionId, options = {}) => {
      const { silent = false } = options;

      const beforeVector =
        state.network?.marking_vector;

      try {
        /**
         * 1. Le tir est l'opération principale.
         *
         * Si POST /fire réussit, la transition a réellement été
         * tirée côté backend.
         */
        const response = await api.fireTransition(
          transitionId
        );

        const delta = computeDelta(
          beforeVector,
          response?.marking_vector
        );

        if (!silent) {
          const entry = {
            key: `fire-${Date.now()}-${transitionId}`,
            kind: "fire",
            transition: transitionId,
            timestamp:
              response?.timestamp ??
              new Date().toISOString(),
            delta,
          };

          setState((current) => ({
            ...current,
            journal: [
              entry,
              ...current.journal,
            ].slice(0, JOURNAL_MAX),
          }));
        }

        const animations = buildTokenAnimations(
          transitionId,
          state.network
        );

        pushTokenAnimations(animations);

        /**
         * 2. Le refresh est secondaire.
         *
         * Une erreur de refresh ne doit PAS transformer un tir
         * réussi en "ok: false".
         *
         * C'est important pour lastFiredRef dans useAutoPlay.
         */
        try {
          await refreshNetwork();
        } catch (refreshError) {
          patch({
            error:
              refreshError?.message ??
              "Tir réussi, mais synchronisation du réseau échouée.",
          });
        }

        return {
          ok: true,
          response,
        };
      } catch (error) {
        /**
         * Même en cas d'échec, on tente une resynchronisation.
         * Cela est particulièrement utile après un 409.
         */
        refreshNetwork().catch(() => {});

        if (!silent) {
          showToast({
            kind: "error",
            message:
              error?.message ??
              `Échec du tir ${transitionId}`,
          });
        }

        return {
          ok: false,
          error,
        };
      }
    },
    [
      state.network,
      computeDelta,
      buildTokenAnimations,
      pushTokenAnimations,
      refreshNetwork,
      patch,
      showToast,
    ]
  );

  // ---------------------------------------------------------------------------
  // Injection d'événement
  // ---------------------------------------------------------------------------

  const inject = useCallback(
    async (event) => {
      const beforeVector =
        state.network?.marking_vector;

      try {
        const response = await api.injectEvent(event);

        if (event.startsWith("urgence_")) {
          setLastEmergency((previous) => ({
            event,
            seq: previous.seq + 1,
          }));
        }

        const delta = computeDelta(
          beforeVector,
          response?.marking_vector
        );

        const entry = {
          key: `inject-${Date.now()}-${event}`,
          kind: "inject",
          transition: `inject:${event}`,
          timestamp:
            response?.timestamp ??
            new Date().toISOString(),
          delta,
        };

        setState((current) => ({
          ...current,
          journal: [
            entry,
            ...current.journal,
          ].slice(0, JOURNAL_MAX),
        }));

        try {
          await refreshNetwork();
        } catch (refreshError) {
          patch({
            error:
              refreshError?.message ??
              "Injection réussie, mais synchronisation échouée.",
          });
        }

        return {
          ok: true,
          response,
        };
      } catch (error) {
        showToast({
          kind: "error",
          message:
            error?.message ??
            `Échec de l'injection ${event}`,
        });

        return {
          ok: false,
          error,
        };
      }
    },
    [
      state.network,
      computeDelta,
      refreshNetwork,
      patch,
      showToast,
    ]
  );

  // ---------------------------------------------------------------------------
  // Reset
  // ---------------------------------------------------------------------------

  const reset = useCallback(async () => {
    try {
      const network = await api.resetNetwork();

      const [enabledRes, propertiesRes, timer] =
        await Promise.all([
          api.getEnabledTransitions(),
          api.getProperties(),
          api.getTimer(),
        ]);

      setLastEmergency({
        event: null,
        seq: 0,
      });

      lastFiredRef.current = null;

      patch({
        network,
        enabled: enabledRes?.enabled ?? [],
        constraints:
          propertiesRes?.constraints ?? [],
        timer,
        journal: [],
        tokenAnimations: [],
        error: null,
        lastUpdated: Date.now(),
      });

      return {
        ok: true,
        network,
      };
    } catch (error) {
      showToast({
        kind: "error",
        message:
          error?.message ??
          "Échec de la réinitialisation.",
      });

      return {
        ok: false,
        error,
      };
    }
  }, [patch, showToast]);

  // ---------------------------------------------------------------------------
  // Auto-play
  // ---------------------------------------------------------------------------

  const autoPlayFire = useCallback(
    (transitionId) =>
      fire(transitionId, {
        silent: true,
      }),
    [fire]
  );

  useAutoPlay({
    isPlaying,
    enabled: state.enabled,
    fire: autoPlayFire,
    rate,
    lastFiredRef,
  });

  // ---------------------------------------------------------------------------
  // Contrôles Play / Pause / Step
  // ---------------------------------------------------------------------------

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const step = useCallback(async () => {
    const { CYCLE } = await import(
      "../hooks/useAutoPlay.js"
    );

    const startIndex = lastFiredRef.current
      ? CYCLE.indexOf(lastFiredRef.current) + 1
      : 0;

    for (let i = 0; i < CYCLE.length; i += 1) {
      const index =
        (startIndex + i) % CYCLE.length;

      const transitionId = CYCLE[index];

      if (
        (state.enabled ?? []).includes(
          transitionId
        )
      ) {
        await fire(transitionId);
        return;
      }
    }

    /**
     * Aucun élément du cycle n'est actuellement activé.
     * On force une synchronisation afin que le frontend
     * ne reste pas sur une liste périmée.
     */
    try {
      await refreshNetwork();
    } catch {
      // L'erreur éventuelle est déjà gérée dans refreshNetwork().
    }
  }, [state.enabled, fire, refreshNetwork]);

  // ---------------------------------------------------------------------------
  // API publique du contexte
  // ---------------------------------------------------------------------------

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

    isPlaying,
    play,
    pause,
    step,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);

  if (!context) {
    throw new Error(
      "useNetwork doit être utilisé dans <NetworkProvider>."
    );
  }

  return context;
}
