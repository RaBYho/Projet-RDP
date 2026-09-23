import { createContext, useCallback, useContext, useMemo, useState } from 'react';

/* Valeurs par défaut — exposées pour reset et tests. */
const INITIAL_STATE = {
  /* Mode d'affichage formel vs simplifié — pilote l'affichage
     des notations mathématiques et le niveau de détail des panneaux. */
  viewMode: 'formal',

  /* Filtre de catégories sur le canvas Petri.
     'all' ou une des 4 catégories du briefing. */
  filter: 'all',

  /* Cadence de simulation (multiplicateur). 1.0 par défaut. */
  rate: 1.0,

  /* Overlays de la simulation 2D. */
  showSensors: true,
  showTrajectories: false,
};

const UiContext = createContext(null);

export function UiProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE);

  const patch = useCallback((partial) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  /* ---------------- Actions individuelles ---------------- */

  const setViewMode = useCallback(
    (viewMode) => patch({ viewMode }),
    [patch]
  );

  const toggleViewMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      viewMode: prev.viewMode === 'formal' ? 'simplified' : 'formal',
    }));
  }, []);

  const setFilter = useCallback(
    (filter) => patch({ filter }),
    [patch]
  );

  const setRate = useCallback(
    (rate) => patch({ rate: clampRate(rate) }),
    [patch]
  );

  const setShowSensors = useCallback(
    (showSensors) => patch({ showSensors }),
    [patch]
  );

  const toggleSensors = useCallback(() => {
    setState((prev) => ({ ...prev, showSensors: !prev.showSensors }));
  }, []);

  const setShowTrajectories = useCallback(
    (showTrajectories) => patch({ showTrajectories }),
    [patch]
  );

  const toggleTrajectories = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showTrajectories: !prev.showTrajectories,
    }));
  }, []);

  /* Remet tous les paramètres UI à leurs valeurs par défaut. */
  const resetUi = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  /* ---------------- Valeur du context ---------------- */

  /* Mémoïsé : les setters sont stables (useCallback), donc `value`
     ne change que quand `state` change réellement. */
  const value = useMemo(
    () => ({
      // État
      ...state,
      // Setters directs
      setViewMode,
      setFilter,
      setRate,
      setShowSensors,
      setShowTrajectories,
      // Toggles booléens
      toggleViewMode,
      toggleSensors,
      toggleTrajectories,
      // Reset global
      resetUi,
    }),
    [
      state,
      setViewMode,
      setFilter,
      setRate,
      setShowSensors,
      setShowTrajectories,
      toggleViewMode,
      toggleSensors,
      toggleTrajectories,
      resetUi,
    ]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

/* Borne la cadence entre 0.1× et 5× — mêmes bornes que les sliders. */
function clampRate(rate) {
  const n = Number(rate);
  if (Number.isNaN(n)) return 1.0;
  return Math.min(5.0, Math.max(0.1, n));
}

/**
 * Hook d'accès au UiContext.
 */
export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) {
    throw new Error('useUi doit être utilisé dans <UiProvider>.');
  }
  return ctx;
}