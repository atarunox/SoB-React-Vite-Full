// src/context/UIScaleContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'sob:uiScale';
const BTN_STORAGE_KEY = 'sob:buttonSize';
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

const UIScaleContext = createContext({
  scale: 1, setScale: () => {},
  buttonSize: 'md', setButtonSize: () => {},
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

  const setScale = React.useCallback((v) => setScaleRaw(clampScale(v)), []);
  const setButtonSize = React.useCallback((v) => setButtonSizeRaw(validButtonSize(v)), []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(scale)); } catch {}
  }, [scale]);

  useEffect(() => {
    try { localStorage.setItem(BTN_STORAGE_KEY, buttonSize); } catch {}
  }, [buttonSize]);

  // Apply button size as a data attribute on <html> so CSS can target it
  useEffect(() => {
    document.documentElement.setAttribute('data-btn-size', buttonSize);
  }, [buttonSize]);

  return (
    <UIScaleContext.Provider value={{ scale, setScale, buttonSize, setButtonSize }}>
      {children}
    </UIScaleContext.Provider>
  );
}

export function useUIScale() {
  return useContext(UIScaleContext);
}
