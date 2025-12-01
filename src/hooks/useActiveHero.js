// src/hooks/useActiveHero.js
import { useState } from 'react';

let lastActiveId = null; // Optional: persist across reloads

export function useActiveHero(posse) {
  const [activeId, setActiveId] = useState(lastActiveId || (posse[0]?.id ?? null));
  const activeHero = posse.find(h => h.id === activeId) || posse[0] || null;

  const selectHero = (id) => {
    setActiveId(id);
    lastActiveId = id;
  };

  return [activeHero, selectHero];
}
