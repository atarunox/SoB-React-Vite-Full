/* FIXME: Unbalanced braces/parens detected: braces=0 parens=-2 brackets=0. Review this file. */
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
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <select
          className="select select-bordered"
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
          className="btn btn-secondary"
          type="button"
          onClick={() => setShowCreate((v) => !v)}
        >
          {showCreate ? "Close" : "New Hero"}
        </button>
      </div>

      {showCreate && (
        <div className="border rounded p-3 bg-white">
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
