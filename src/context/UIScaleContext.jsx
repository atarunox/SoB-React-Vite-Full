// src/context/UIScaleContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'sob:uiScale';

const UIScaleContext = createContext({ scale: 1, setScale: () => {} });

export function UIScaleProvider({ children }) {
  const [scale, setScale] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? Number(saved) : 1;
    } catch {
      return 1;
    }
  });

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
