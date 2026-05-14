// src/context/UIScaleContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'sob:uiScale';
const BTN_STORAGE_KEY = 'sob:buttonSize';
const STATS_SCALE_KEY = 'sob:statsScale';
const COMPACT_KEY = 'sob:compactMode';
const FONT_SIZE_KEY = 'sob:fontSize';
const FULL_WIDTH_KEY = 'sob:fullWidth';
const MIN_SCALE = 0.5;
const MAX_SCALE = 1.5;

const BUTTON_SIZES = ['sm', 'md', 'lg'];
const FONT_SIZES = ['sm', 'md', 'lg'];

function clampScale(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return 1;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, n));
}

function validButtonSize(v) {
  return BUTTON_SIZES.includes(v) ? v : 'md';
}

function validFontSize(v) {
  return FONT_SIZES.includes(v) ? v : 'md';
}

const LAYOUT_EDIT_KEY = 'sob:layoutEditMode';

const UIScaleContext = createContext({
  scale: 1, setScale: () => {},
  buttonSize: 'md', setButtonSize: () => {},
  statsScale: 1, setStatsScale: () => {},
  layoutEditMode: false, setLayoutEditMode: () => {},
  compactMode: false, setCompactMode: () => {},
  fontSize: 'md', setFontSize: () => {},
  fullWidth: false, setFullWidth: () => {},
});

export { BUTTON_SIZES, FONT_SIZES };

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

  const [compactMode, setCompactModeRaw] = useState(() => {
    try {
      return localStorage.getItem(COMPACT_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [fontSize, setFontSizeRaw] = useState(() => {
    try {
      return validFontSize(localStorage.getItem(FONT_SIZE_KEY));
    } catch {
      return 'md';
    }
  });

  const [fullWidth, setFullWidthRaw] = useState(() => {
    try {
      return localStorage.getItem(FULL_WIDTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const setScale = React.useCallback((v) => setScaleRaw(clampScale(v)), []);
  const setButtonSize = React.useCallback((v) => setButtonSizeRaw(validButtonSize(v)), []);
  const setStatsScale = React.useCallback((v) => setStatsScaleRaw(clampScale(v)), []);
  const setLayoutEditMode = React.useCallback((v) => setLayoutEditModeRaw(!!v), []);
  const setCompactMode = React.useCallback((v) => setCompactModeRaw(!!v), []);
  const setFontSize = React.useCallback((v) => setFontSizeRaw(validFontSize(v)), []);
  const setFullWidth = React.useCallback((v) => setFullWidthRaw(!!v), []);

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

  useEffect(() => {
    try { localStorage.setItem(COMPACT_KEY, String(compactMode)); } catch {}
  }, [compactMode]);

  useEffect(() => {
    try { localStorage.setItem(FONT_SIZE_KEY, fontSize); } catch {}
  }, [fontSize]);

  useEffect(() => {
    try { localStorage.setItem(FULL_WIDTH_KEY, String(fullWidth)); } catch {}
  }, [fullWidth]);

  // Apply data attributes on <html> so CSS can target them
  useEffect(() => {
    document.documentElement.setAttribute('data-btn-size', buttonSize);
  }, [buttonSize]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    if (compactMode) {
      document.documentElement.setAttribute('data-compact', 'true');
    } else {
      document.documentElement.removeAttribute('data-compact');
    }
  }, [compactMode]);

  return (
    <UIScaleContext.Provider value={{
      scale, setScale,
      buttonSize, setButtonSize,
      statsScale, setStatsScale,
      layoutEditMode, setLayoutEditMode,
      compactMode, setCompactMode,
      fontSize, setFontSize,
      fullWidth, setFullWidth,
    }}>
      {children}
    </UIScaleContext.Provider>
  );
}

export function useUIScale() {
  return useContext(UIScaleContext);
}
