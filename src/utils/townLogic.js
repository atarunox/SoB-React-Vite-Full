// // // import { doc, updateDoc } // Removed Firestore for local mode;
// import { townDailyEvents } from '../data/townDailyEvents';
// // import { db } // Removed Firebase for local mode;
// 
// export async function drawDailyEventForTown(heroes, setDailyEvent, setCampResults, lodging) {
//   const card = townDailyEvents[Math.floor(Math.random() * townDailyEvents.length)];
//   setDailyEvent(card);
// 
//   for (const h of heroes) {
//     const ref = doc(db, 'heroes', h.id);
//     const updates = {};
// 
//     if (lodging[h.id] === 'Hotel') {
//       updates.gold = Math.max(0, h.gold - 10);
//     }

    const extraMarkers = (h.mutations?.length || 0) > 3 ? (h.mutations.length - 3) : 0;
    if (extraMarkers > 0) {
      updates.unwantedAttention = (h.unwantedAttention || 0) + extraMarkers;
    }

    if (Object.keys(updates).length) {
      await updateDoc(ref, updates);
    }
  }
}

export function endTownDay() {
}

export default function Placeholder() { return null; }
