import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getDepthEvent, getHBtDThreshold } from '../data/depthEvents/depthEventLookup';
import { useWorld } from './WorldContext';

const AdventureContext = createContext(null);

const LS_KEY = 'sob_adventure_state';
const FIRESTORE_DOC = 'gameState';
const FIRESTORE_ID = 'adventure';

// v3: darkness now counts UP from 0 (entry) → matches physical space numbers
const SCHEMA_VERSION = 3;

const DEFAULT_STATE = {
  schemaVersion: SCHEMA_VERSION,
  depth: 0,      // posse steps from entry: 0=at entry, 1=space 15, ..., 15=space 1
  darkness: 0,   // darkness position: 0=at entry(right), 1=space 1, ..., 15=space 15
  turn: 1,
  lanternBearerId: null,
  trackLength: 15,
  growingDreadSpaces: [6, 11, 15],   // physical space numbers
  bloodSpatterSpaces: [2, 4, 8, 10, 13], // physical space numbers
  lastRoll: null,
  active: false,
};

function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    // If saved state is from an older schema, discard it
    if (parsed.schemaVersion !== SCHEMA_VERSION) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...parsed };
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
        const remote = snap.data();
        // Ignore stale remote data from an older schema
        const data = remote.schemaVersion === SCHEMA_VERSION
          ? { ...DEFAULT_STATE, ...remote }
          : { ...DEFAULT_STATE };
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
      darkness: prev.darkness + spaces,  // darkness advances (higher = further left)
    }));
  }, [updateAdventure]);

  const retreatDarkness = useCallback((spaces = 1) => {
    updateAdventure(prev => ({
      ...prev,
      darkness: Math.max(0, prev.darkness - spaces),
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

      const depthEvent = isDoubles ? getDepthEvent(world, die1) : null;

      // On doubles, darkness does NOT advance — Depth Event fires instead
      const nextDarkness = (success || isDoubles)
        ? prev.darkness
        : prev.darkness + 1;
      // landedSpace = physical space number darkness just moved to
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
      darkness: 0, // always starts at entry (right side)
      depth: 0,
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
