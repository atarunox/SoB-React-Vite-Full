import { useState, useCallback } from 'react';

const STORAGE_KEY = 'sob:warrants_state';

const DEFAULT_STATE = {
  active: false,
  phase: 'idle',              // 'idle' | 'adventure'
  drawnWarrantId: null,       // id of the active Warrant card
  sanctionMarkers: 0,         // tracker for Search and Seizure
  warrantTargetDefeated: false, // tracker for Wanted in 3 Worlds
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE };
  } catch { return { ...DEFAULT_STATE }; }
}

function save(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

export function useWarrantsState() {
  const [state, setState] = useState(load);

  const update = useCallback((patch) => {
    setState(prev => {
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
      save(next);
      return next;
    });
  }, []);

  const toggleActive = () => update(s => ({ ...s, active: !s.active }));

  const drawWarrant = (allWarrants) => {
    const idx = Math.floor(Math.random() * allWarrants.length);
    update(s => ({
      ...s,
      phase: 'adventure',
      drawnWarrantId: allWarrants[idx].id,
      sanctionMarkers: 0,
      warrantTargetDefeated: false,
    }));
  };

  const setWarrant = (id) =>
    update(s => ({
      ...s,
      phase: 'adventure',
      drawnWarrantId: id,
      sanctionMarkers: 0,
      warrantTargetDefeated: false,
    }));

  const adjustMarkers = (delta) =>
    update(s => ({ ...s, sanctionMarkers: Math.max(0, s.sanctionMarkers + delta) }));

  const markTargetDefeated = () => update(s => ({ ...s, warrantTargetDefeated: true }));

  const reset = () => update(s => ({ ...DEFAULT_STATE, active: s.active }));

  return {
    state,
    toggleActive,
    drawWarrant,
    setWarrant,
    adjustMarkers,
    markTargetDefeated,
    reset,
  };
}
