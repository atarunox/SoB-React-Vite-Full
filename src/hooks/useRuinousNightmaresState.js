// src/hooks/useRuinousNightmaresState.js
import { useState, useCallback } from 'react';
import { NIGHTMARE_CARDS } from '../data/missionModifiers/ruinousNightmares';

const STORAGE_KEY = 'sob:nightmares_state';

const DEFAULT_STATE = {
  active: false,
  level: 1,             // Nightmare Level 1, 2, or 3
  phase: 'idle',        // 'idle' | 'fight'
  activeCardIds: [],    // card ids drawn for the current fight
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

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useRuinousNightmaresState() {
  const [state, setState] = useState(load);

  const update = useCallback((patch) => {
    setState(prev => {
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
      save(next);
      return next;
    });
  }, []);

  const toggleActive = () => update(s => ({ ...s, active: !s.active }));

  const setLevel = (level) => update(s => ({ ...s, level }));

  const drawFightCards = () => {
    const deck = shuffle(NIGHTMARE_CARDS.map(c => c.id));
    const drawn = deck.slice(0, state.level);
    update(s => ({ ...s, phase: 'fight', activeCardIds: drawn }));
  };

  const endFight = () => update(s => ({ ...s, phase: 'idle', activeCardIds: [] }));

  const reset = () => update({ ...DEFAULT_STATE });

  return { state, toggleActive, setLevel, drawFightCards, endFight, reset };
}
