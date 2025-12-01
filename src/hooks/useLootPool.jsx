// src/hooks/useLootPool.jsx
// import { useEffect, useState } from 'react';
// // import { db } // Removed Firebase for local mode;
// // // // import {
//   collection,
//   onSnapshot,
//   updateDoc,
//   doc
// } // Removed Firestore for local mode;

export function useLootPool(gameId) {
  const [lootPool, setLootPool] = useState([]);

  useEffect(() => {
    const lootRef = collection(db, 'games', gameId, 'lootPool');

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(lootRef, snapshot => {
      const updatedLoot = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLootPool(updatedLoot);
    });

    return () => unsubscribe();
  }, [gameId]);

  const claimLoot = async (itemId, heroName) => {
    const itemRef = doc(db, 'games', gameId, 'lootPool', itemId);
    await updateDoc(itemRef, { claimedBy: heroName });
  };

  return { lootPool, claimLoot };
}

export default function Placeholder() { return null; }
