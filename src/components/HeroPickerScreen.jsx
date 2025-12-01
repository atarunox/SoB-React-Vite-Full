import React from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useHero } from "../context/HeroContext";
import HeroSelector from "./HeroSelector";

export default function HeroPickerScreen() {
  const { setHero } = useHero();

  async function loadHeroById(id) {
    if (!id) return;

    // Try Firestore first (if enabled)
    if (db && !db.localMode) {
      try {
        const snap = await getDoc(doc(db, "heroes", id));
        if (snap.exists()) {
          setHero(snap.data());
          return;
        }
      } catch (e) {
        console.warn("Firestore load failed, falling back to localStorage:", e);
      }
    }

    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(id);
      if (raw) setHero(JSON.parse(raw));
    } catch (e) {
      console.warn("LocalStorage read failed:", e);
    }
  }

  return (
    <div className="space-y-2">
      <HeroSelector
        onChangeActiveHero={loadHeroById} // loads immediately on selection
        placeholder="Select a hero…"
      />
    </div>
  );
}
