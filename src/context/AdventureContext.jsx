import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getDepthEvent, getHBtDThreshold } from '../data/depthEvents/depthEventLookup';
import { useWorld } from './WorldContext';

const AdventureContext = createContext(null);

const LS_KEY = 'sob_adventure_state';
const FIRESTORE_DOC = 'gameState';
const FIRESTORE_ID = 'adventure';

const DEFAULT_STATE = {
  depth: 0,
  darkness: 12,
  turn: 1,
  lanternBearerId: null,
  trackLength: 12,
  growingDreadSpaces: [3, 6, 9],
  bloodSpatterSpaces: [2, 5, 8, 11],
  lastRoll: null,
  active: false,
};

function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function saveLocal(state) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
}

export function AdventureProvider({ children }) {
  const [state, setState] = useState(loadLocal);
  const writeTimerRef = useRef(null);
  const lastSavedRef = useRef(null);
  const isLocal = !db || db.localMode;
  const { world } = useWorld();

  // Firebase real-time listener
  useEffect(() => {
    if (isLocal) return;
    const ref = doc(db, FIRESTORE_DOC, FIRESTORE_ID);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = { ...DEFAULT_STATE, ...snap.data() };
        setState(data);
        saveLocal(data);
        lastSavedRef.current = JSON.stringify(data);
      }
    }, (err) => {
      console.warn('[Adventure] Firestore listener error:', err.message);
    });
    return unsub;
  }, [isLocal]);

  // Debounced write to Firestore
  const syncToFirebase = useCallback((next) => {
    saveLocal(next);
    if (isLocal) return;
    const json = JSON.stringify(next);
    if (json === lastSavedRef.current) return;
    lastSavedRef.current = json;
    if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
    writeTimerRef.current = setTimeout(() => {
      const ref = doc(db, FIRESTORE_DOC, FIRESTORE_ID);
      setDoc(ref, next, { merge: true }).catch(err =>
        console.warn('[Adventure] Firestore write error:', err.message)
      );
    }, 200);
  }, [isLocal]);

  const updateAdventure = useCallback((patch) => {
    setState(prev => {
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
      syncToFirebase(next);
      return next;
    });
  }, [syncToFirebase]);

  const advanceDepth = useCallback(() => {
    updateAdventure(prev => ({
      ...prev,
      depth: Math.min(prev.trackLength, prev.depth + 1),
    }));
  }, [updateAdventure]);

  const retreatDepth = useCallback(() => {
    updateAdventure(prev => ({
      ...prev,
      depth: Math.max(0, prev.depth - 1),
    }));
  }, [updateAdventure]);

  const advanceDarkness = useCallback((spaces = 1) => {
    updateAdventure(prev => ({
      ...prev,
      darkness: Math.max(0, prev.darkness - spaces),
    }));
  }, [updateAdventure]);

  const retreatDarkness = useCallback((spaces = 1) => {
    updateAdventure(prev => ({
      ...prev,
      darkness: Math.min(prev.trackLength, prev.darkness + spaces),
    }));
  }, [updateAdventure]);

  const rollHBtD = useCallback((rolledBy = 'DM', diceOverride = null) => {
    const d6 = () => Math.floor(Math.random() * 6) + 1;

    let die1, die2;
    if (diceOverride === 'peril') {
      const perilTable = [3, 3, 4, 4, 5, 6];
      die1 = perilTable[Math.floor(Math.random() * 6)];
      die2 = perilTable[Math.floor(Math.random() * 6)];
    } else {
      die1 = d6();
      die2 = d6();
    }
    const roll = die1 + die2;
    const isDoubles = die1 === die2;

    setState(prev => {
      const threshold = getHBtDThreshold(prev.depth);
      const success = roll >= threshold;
      const isDoublesEvent = isDoubles && !success;

      let depthEvent = null;
      if (isDoubles) {
        depthEvent = getDepthEvent(world, die1);
      }

      // On doubles, darkness does NOT advance even on failure — Depth Event fires instead
      const nextDarkness = (success || isDoubles)
        ? prev.darkness
        : Math.max(0, prev.darkness - 1);
      const landedSpace = nextDarkness;

      const next = {
        ...prev,
        darkness: nextDarkness,
        turn: prev.turn + 1,
        lastRoll: {
          die1,
          die2,
          roll,
          threshold,
          success,
          isDoubles,
          depthEvent: isDoubles ? depthEvent : null,
          rolledBy,
          diceType: diceOverride || '2d6',
          timestamp: Date.now(),
          landedOnGD: !success && !isDoubles && prev.growingDreadSpaces.includes(landedSpace),
          landedOnBS: !success && !isDoubles && prev.bloodSpatterSpaces.includes(landedSpace),
        },
      };
      syncToFirebase(next);
      return next;
    });

    return roll;
  }, [syncToFirebase, world]);

  const resetAdventure = useCallback((config = {}) => {
    const next = {
      ...DEFAULT_STATE,
      trackLength: config.trackLength ?? DEFAULT_STATE.trackLength,
      growingDreadSpaces: config.growingDreadSpaces ?? DEFAULT_STATE.growingDreadSpaces,
      bloodSpatterSpaces: config.bloodSpatterSpaces ?? DEFAULT_STATE.bloodSpatterSpaces,
      darkness: config.trackLength ?? DEFAULT_STATE.trackLength,
      active: true,
    };
    syncToFirebase(next);
    setState(next);
  }, [syncToFirebase]);

  const endAdventure = useCallback(() => {
    updateAdventure({ active: false });
  }, [updateAdventure]);

  return (
    <AdventureContext.Provider value={{
      state,
      updateAdventure,
      advanceDepth,
      retreatDepth,
      advanceDarkness,
      retreatDarkness,
      rollHBtD,
      resetAdventure,
      endAdventure,
    }}>
      {children}
    </AdventureContext.Provider>
  );
}

export function useAdventure() {
  return useContext(AdventureContext);
}
