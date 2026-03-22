import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const WorldContext = createContext();

export function WorldProvider({ children }) {
  const [world, setWorld] = useState('City of the Ancients');
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
