import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const WorldContext = createContext();

const STORAGE_KEY = 'sob_world';
const DEFAULT_WORLD = 'City of the Ancients';

function loadSavedWorld() {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_WORLD;
  } catch {
    return DEFAULT_WORLD;
  }
}

export function WorldProvider({ children }) {
  const [world, setWorld] = useState(loadSavedWorld);
  const skipNextWrite = useRef(false);
  const worldRef_ = useRef(world);
  worldRef_.current = world;

  // Firestore listener
  useEffect(() => {
    if (!db?.localMode) {
      const worldDocRef = doc(db, 'shared', 'world');
      return onSnapshot(worldDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data?.name && data.name !== worldRef_.current) {
            skipNextWrite.current = true;
            setWorld(data.name);
          }
        }
      });
    }
  }, []);

  // Save to localStorage + Firestore when world changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, world);
    } catch { /* quota or private mode */ }

    if (!db?.localMode && !skipNextWrite.current) {
      const worldRef = doc(db, 'shared', 'world');
      setDoc(worldRef, { name: world }).catch((e) =>
        console.error('Error updating world in Firestore:', e)
      );
    }
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
    }
  }, [world]);

  return (
    <WorldContext.Provider value={{ world, setWorld }}>
      {children}
    </WorldContext.Provider>
  );
}

export function useWorld() {
  return useContext(WorldContext);
}
