import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const WorldContext = createContext();

export function WorldProvider({ children }) {
  const [world, setWorld] = useState('City of the Ancients');
  const skipNextWrite = useRef(false);

  // Firestore listener
  useEffect(() => {
    if (!db?.localMode) {
      const worldRef = doc(db, 'shared', 'world');
      return onSnapshot(worldRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data?.name && data.name !== world) {
            skipNextWrite.current = true;
            setWorld(data.name);
          }
        }
      });
    }
  }, []);

  // Save to Firestore when world changes
  useEffect(() => {
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
