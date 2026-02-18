// src/components/HeroSelector.jsx
import React, { useEffect, useMemo, useState } from "react";
import { usePosse } from "../context/PosseContext";
import CreateHero from "./CreateHero";

export default function HeroSelector({
  // Optional callbacks (both supported)
  onChangeActiveHero,
  setActiveHeroId: legacySetActive,   // legacy prop name
  // Optional controlled value
  activeHeroId,
  placeholder = "Select a hero…",
  autoSelectFirst = true,
}) {
  const { posse, activeHeroId: ctxActiveId, setActiveHeroId: ctxSetActive, addHero } = usePosse();

  // If parent doesn’t control the value, keep our own local selection
  const [localActiveId, setLocalActiveId] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  // List of heroes (id + display name)
  const heroes = useMemo(
    () =>
      Array.isArray(posse)
        ? posse
            .map((h) => ({
              id: h.id || h.localId || "",
              name: h.name || "Unknown Hero",
            }))
            .filter((h) => h.id)
        : [],
    [posse]
  );

  // Current selected id in this component
  const currentId = activeHeroId ?? localActiveId ?? ctxActiveId ?? "";

  // Single notifier — writes to context first, then notifies parent/legacy, else local state
  const notifyChange = (id) => {
    if (typeof ctxSetActive === "function") ctxSetActive(id);     // <— always set context
    if (typeof onChangeActiveHero === "function") onChangeActiveHero(id);
    else if (typeof legacySetActive === "function") legacySetActive(id);
    else setLocalActiveId(id);
  };

  // Keep selection valid if heroes list changes
  useEffect(() => {
    if (!heroes.length) {
      if (!activeHeroId) setLocalActiveId("");
      return;
    }
    const stillExists = heroes.some((h) => h.id === currentId);
    if (!stillExists) {
      if (autoSelectFirst) notifyChange(heroes[0].id);
      else if (!activeHeroId) setLocalActiveId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroes.map((h) => h.id).join("|")]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <select
          className="flex-1 px-4 py-3 bg-parchment-dark border-2 border-leather rounded-lg shadow-horror text-leather-dark font-semibold focus:outline-none focus:ring-2 focus:ring-brass focus:border-brass transition-all"
          value={currentId || ""}
          onChange={(e) => notifyChange(e.target.value)}
        >
          <option value="">{placeholder}</option>
          {heroes.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>

        <button
          className="px-4 py-3 bg-leather text-parchment-light font-bold rounded-lg hover:bg-leather-light transition-all shadow-horror border-2 border-brass hover:shadow-horror-lg transform hover:scale-105"
          type="button"
          onClick={() => setShowCreate((v) => !v)}
        >
          {showCreate ? "✕ Close" : "⊕ New Hero"}
        </button>
      </div>

      {showCreate && (
        <div className="border-2 border-leather rounded-lg p-4 bg-gradient-to-br from-parchment-light to-parchment-dark shadow-horror animate-slideup">
          <CreateHero
            onCreate={async (hero) => {
              // 1) Add to posse (and Firestore via PosseContext)
              await addHero(hero);
              // 2) Make it the active hero everywhere
              const newId = hero.id || hero.localId;
              if (newId) notifyChange(newId);
              setShowCreate(false);
            }}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}
    </div>
  );
}
