// src/context/UIScaleContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'sob:uiScale';
const MIN_SCALE = 0.5;
const MAX_SCALE = 1.5;

function clampScale(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return 1;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, n));
}

const UIScaleContext = createContext({ scale: 1, setScale: () => {} });

export function UIScaleProvider({ children }) {
  const [scale, setScaleRaw] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? clampScale(saved) : 1;
    } catch {
      return 1;
    }
  });

  const setScale = React.useCallback((v) => setScaleRaw(clampScale(v)), []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(scale)); } catch {}
  }, [scale]);

  return (
    <UIScaleContext.Provider value={{ scale, setScale }}>
      {children}
    </UIScaleContext.Provider>
  );
}

export function useUIScale() {
  return useContext(UIScaleContext);
}
