import { useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { getHero, updateHero as updateLocalHero } from '../utils/townState';

export function useHeroFirestoreSync(heroId, setHero) {
  const skipNextWrite = useRef(false);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!heroId || db.localMode) {
      const local = getHero(heroId);
      setHero(local || {});
      return;
    }

    const heroRef = doc(db, 'heroes', heroId);

    // Subscribe to Firestore changes
    unsubRef.current = onSnapshot(heroRef, (docSnap) => {
      if (!docSnap.exists()) return;

      const firestoreHero = docSnap.data();

      if (skipNextWrite.current) {
        skipNextWrite.current = false;
        return;
      }

      setHero(firestoreHero);
      updateLocalHero(heroId, firestoreHero); // Also mirror into localStorage
    });

    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, [heroId, setHero]);
}
