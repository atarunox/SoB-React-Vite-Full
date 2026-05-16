import { useState, useCallback } from 'react';

const STORAGE_KEY = 'sob:hexcrawl_settings';

const DEFAULTS = {
  injuryChart:      true,
  madnessChart:     true,
  mutationChart:    true,
  townTraits:       true,
  persistentHealth: false,
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

function save(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

export function useHexCrawlSettings() {
  const [settings, setSettings] = useState(load);

  const toggle = useCallback((key) => {
    setSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      save(next);
      return next;
    });
  }, []);

  const setAll = useCallback((value) => {
    setSettings(prev => {
      const next = Object.fromEntries(Object.keys(prev).map(k => [k, !!value]));
      save(next);
      return next;
    });
  }, []);

  return { settings, toggle, setAll };
}

export default useHexCrawlSettings;
