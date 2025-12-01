// scripts/seedDraggableDefaults.js
// Run once (node / bundler) to seed Firestore with the default draggable-stat positions.
// Adjust import to match your project's firebaseConfig export.

import { db } from "../src/firebase/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import positions from "../data/defaultStatPositions.json" assert { type: "json" };

async function main() {
  if (!db || db.localMode) {
    console.warn("[seed] No Firestore db configured (localMode). Skipping.");
    return;
  }
  await setDoc(
    doc(db, "config", "draggableStatsDefault"),
    { type: "statPositions", version: 1, positions, updatedAt: serverTimestamp() },
    { merge: true }
  );
  console.log("[seed] Wrote config/draggableStatsDefault");
}

main().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exitCode = 1;
});
