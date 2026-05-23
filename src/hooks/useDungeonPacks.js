import { useState, useCallback } from 'react';

const STORAGE_KEY = 'sob:dungeon_packs';

const DEFAULT = {
  voidSpiders:    false,
  ancientSpiders: false,
  trenchSpiders:  false,
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
  } catch { return { ...DEFAULT }; }
}

function save(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

export function useDungeonPacks() {
  const [packs, setPacks] = useState(load);

  const toggle = useCallback((id) => {
    setPacks(prev => {
      const next = { ...prev, [id]: !prev[id] };
      save(next);
      return next;
    });
  }, []);

  const setAll = useCallback((value) => {
    setPacks(() => {
      const next = Object.fromEntries(Object.keys(DEFAULT).map(k => [k, value]));
      save(next);
      return next;
    });
  }, []);

  return { packs, toggle, setAll };
}
