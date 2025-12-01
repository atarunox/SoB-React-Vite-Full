import React, { useState, createContext, useContext, useEffect } from "react";
import { GROWING_DREAD_CARDS } from "../data/growingDreadCards";
import { DARKNESS_CARDS } from "../data/darknessCards";

const CombatContext = createContext();
const LS_KEY = "sob_combat_state_v4";

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

export function CombatProvider({ children }) {
  // --- Standard state ---
  const [combatGroups, setCombatGroups] = useState(() => {
    try { const data = localStorage.getItem(LS_KEY); return data ? JSON.parse(data).combatGroups : []; } catch { return []; }
  });
  const [darkness, setDarkness] = useState(() => {
    try { const data = localStorage.getItem(LS_KEY); return data ? JSON.parse(data).darkness : []; } catch { return []; }
  });
  const [growingDread, setGrowingDread] = useState(() => {
    try { const data = localStorage.getItem(LS_KEY); return data ? JSON.parse(data).growingDread : []; } catch { return []; }
  });

  // --- Growing Dread persistent state ---
  const [growingDreadDeck, setGrowingDreadDeck] = useState(() => {
    try {
      const data = localStorage.getItem(LS_KEY);
      return data ? JSON.parse(data).growingDreadDeck : shuffle([...GROWING_DREAD_CARDS]);
    } catch { return shuffle([...GROWING_DREAD_CARDS]); }
  });
  const [growingDreadHand, setGrowingDreadHand] = useState(() => {
    try { const data = localStorage.getItem(LS_KEY); return data ? JSON.parse(data).growingDreadHand : []; } catch { return []; }
  });
  const [growingDreadActive, setGrowingDreadActive] = useState(() => {
    try { const data = localStorage.getItem(LS_KEY); return data ? JSON.parse(data).growingDreadActive : []; } catch { return []; }
  });

  // --- Darkness persistent state ---
  const [darknessDeck, setDarknessDeck] = useState(() => {
    try {
      const data = localStorage.getItem(LS_KEY);
      return data ? JSON.parse(data).darknessDeck : shuffle([...DARKNESS_CARDS]);
    } catch { return shuffle([...DARKNESS_CARDS]); }
  });
  const [darknessHeld, setDarknessHeld] = useState(() => {
    try { const data = localStorage.getItem(LS_KEY); return data ? JSON.parse(data).darknessHeld : []; } catch { return []; }
  });
  const [darknessActive, setDarknessActive] = useState(() => {
    try { const data = localStorage.getItem(LS_KEY); return data ? JSON.parse(data).darknessActive : []; } catch { return []; }
  });

  // --- Persist all relevant state ---
  useEffect(() => {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        combatGroups,
        darkness,
        growingDread,
        growingDreadDeck,
        growingDreadHand,
        growingDreadActive,
        darknessDeck,
        darknessHeld,
        darknessActive
      })
    );
  }, [
    combatGroups, darkness, growingDread,
    growingDreadDeck, growingDreadHand, growingDreadActive,
    darknessDeck, darknessHeld, darknessActive
  ]);

  // --- Utilities for groups, modifiers, etc. (as before) ---
  const addGroup = (group) => setCombatGroups((prev) => [
    ...prev, { ...group, id: Date.now().toString(), modifiers: [], manualExtraElite: 0 }
  ]);
  const removeGroup = (id) => setCombatGroups((prev) => prev.filter((g) => g.id !== id));
  const clearCombat = () => setCombatGroups([]);

  return (
    <CombatContext.Provider value={{
      // old state (still available)
      combatGroups, setCombatGroups, addGroup, removeGroup, clearCombat,
      darkness, setDarkness, growingDread, setGrowingDread,
      // New: Growing Dread full persistent state
      growingDreadDeck, setGrowingDreadDeck,
      growingDreadHand, setGrowingDreadHand,
      growingDreadActive, setGrowingDreadActive,
      // New: Darkness full persistent state
      darknessDeck, setDarknessDeck,
      darknessHeld, setDarknessHeld,
      darknessActive, setDarknessActive,
    }}>
      {children}
    </CombatContext.Provider>
  );
}

export function useCombatState() {
  return useContext(CombatContext);
}
