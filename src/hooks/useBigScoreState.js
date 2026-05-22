import { useState, useCallback } from 'react';

const STORAGE_KEY = 'sob:big_score_state';

const DEFAULT_STATE = {
  active: false,            // modifier enabled for next adventure
  phase: 'idle',            // 'idle' | 'setup' | 'adventure' | 'cashout'
  drawnRoleIds: [],         // role IDs drawn for this adventure
  assignedRoles: {},        // heroId → roleId
  scoreTokens: {},          // heroId → number
  activeComplications: [],  // array of { roll, name, effect }
  insideJobCancelUsed: false,
  getawayRerollUsed: false,
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

export function useBigScoreState() {
  const [state, setState] = useState(load);

  const update = useCallback((patch) => {
    setState(prev => {
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
      save(next);
      return next;
    });
  }, []);

  const toggleActive = () => update(s => ({ ...s, active: !s.active }));

  const drawRoles = (count, allRoles) => {
    const shuffled = [...allRoles].sort(() => Math.random() - 0.5);
    const drawn = shuffled.slice(0, count).map(r => r.id);
    update(s => ({
      ...s,
      phase: 'setup',
      drawnRoleIds: drawn,
      assignedRoles: {},
      scoreTokens: {},
      activeComplications: [],
      insideJobCancelUsed: false,
      getawayRerollUsed: false,
    }));
  };

  const assignRole = (heroId, roleId) =>
    update(s => ({ ...s, assignedRoles: { ...s.assignedRoles, [heroId]: roleId } }));

  const beginAdventure = () => update(s => ({ ...s, phase: 'adventure' }));

  const adjustTokens = (heroId, delta) =>
    update(s => ({
      ...s,
      scoreTokens: {
        ...s.scoreTokens,
        [heroId]: Math.max(0, (s.scoreTokens[heroId] ?? 0) + delta),
      },
    }));

  const addComplication = (complication) =>
    update(s => ({
      ...s,
      activeComplications: [...s.activeComplications, complication],
    }));

  const removeComplication = (roll) =>
    update(s => ({
      ...s,
      activeComplications: s.activeComplications.filter(c => c.roll !== roll),
    }));

  const useInsideJobCancel = () => update(s => ({ ...s, insideJobCancelUsed: true }));
  const useGetawayReroll   = () => update(s => ({ ...s, getawayRerollUsed: true }));

  const beginCashout = () => update(s => ({ ...s, phase: 'cashout' }));

  const reset = () => update(s => ({ ...DEFAULT_STATE, active: s.active }));

  return {
    state,
    toggleActive,
    drawRoles,
    assignRole,
    beginAdventure,
    adjustTokens,
    addComplication,
    removeComplication,
    useInsideJobCancel,
    useGetawayReroll,
    beginCashout,
    reset,
  };
}
