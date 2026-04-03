// src/context/UIScaleContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'sob:uiScale';
const BTN_STORAGE_KEY = 'sob:buttonSize';
const STATS_SCALE_KEY = 'sob:statsScale';
const MIN_SCALE = 0.5;
const MAX_SCALE = 1.5;

const BUTTON_SIZES = ['sm', 'md', 'lg'];

function clampScale(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return 1;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, n));
}

function validButtonSize(v) {
  return BUTTON_SIZES.includes(v) ? v : 'md';
}

const LAYOUT_EDIT_KEY = 'sob:layoutEditMode';

const UIScaleContext = createContext({
  scale: 1, setScale: () => {},
  buttonSize: 'md', setButtonSize: () => {},
  statsScale: 1, setStatsScale: () => {},
  layoutEditMode: false, setLayoutEditMode: () => {},
});

export { BUTTON_SIZES };

export function UIScaleProvider({ children }) {
  const [scale, setScaleRaw] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? clampScale(saved) : 1;
    } catch {
      return 1;
    }
  });

  const [buttonSize, setButtonSizeRaw] = useState(() => {
    try {
      return validButtonSize(localStorage.getItem(BTN_STORAGE_KEY));
    } catch {
      return 'md';
    }
  });

  const [statsScale, setStatsScaleRaw] = useState(() => {
    try {
      const saved = localStorage.getItem(STATS_SCALE_KEY);
      return saved ? clampScale(saved) : 1;
    } catch {
      return 1;
    }
  });

  const [layoutEditMode, setLayoutEditModeRaw] = useState(() => {
    try {
      return localStorage.getItem(LAYOUT_EDIT_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const setScale = React.useCallback((v) => setScaleRaw(clampScale(v)), []);
  const setButtonSize = React.useCallback((v) => setButtonSizeRaw(validButtonSize(v)), []);
  const setStatsScale = React.useCallback((v) => setStatsScaleRaw(clampScale(v)), []);
  const setLayoutEditMode = React.useCallback((v) => setLayoutEditModeRaw(!!v), []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(scale)); } catch {}
  }, [scale]);

  useEffect(() => {
    try { localStorage.setItem(BTN_STORAGE_KEY, buttonSize); } catch {}
  }, [buttonSize]);

  useEffect(() => {
    try { localStorage.setItem(STATS_SCALE_KEY, String(statsScale)); } catch {}
  }, [statsScale]);

  useEffect(() => {
    try { localStorage.setItem(LAYOUT_EDIT_KEY, String(layoutEditMode)); } catch {}
  }, [layoutEditMode]);

  // Apply button size as a data attribute on <html> so CSS can target it
  useEffect(() => {
    document.documentElement.setAttribute('data-btn-size', buttonSize);
  }, [buttonSize]);

  return (
    <UIScaleContext.Provider value={{ scale, setScale, buttonSize, setButtonSize, statsScale, setStatsScale, layoutEditMode, setLayoutEditMode }}>
      {children}
    </UIScaleContext.Provider>
  );
}

export function useUIScale() {
  return useContext(UIScaleContext);
}
