import React, { useState } from "react";
import { useCombatState } from "../../hooks/useCombatState";
import EnemyGroupCard from "./EnemyGroupCard"; // Your group card component

export default function EnemyGroupsPanel({ posse = [], globalModifiers = [] }) {
  const {
    combatGroups,
    addGroup,
    removeGroup,
    clearCombat,
    darkness,
    growingDread,
    removeDarkness,
    removeGrowingDread,
  } = useCombatState();
  const [showAdd, setShowAdd] = useState(false);

  // Example group add (replace with real enemy picker/modal)
  function handleAddGroup() {
    const name = prompt("Enemy Group Name?");
    if (!name) return;
    addGroup({
      name,
      baseStats: {}, // TODO: Fill with actual enemy stats
    });
    setShowAdd(false);
  }

  return (
    <div className="flex flex-col gap-4 p-2">
      {/* Darkness & Growing Dread at the top */}
      <div className="flex gap-2 flex-wrap mb-2">
        <div className="bg-black text-white px-2 py-1 rounded shadow flex items-center gap-2">
          <b>Darkness:</b>
          {darkness.length === 0 && <span className="text-gray-400">None</span>}
          {darkness.map((card, i) => (
            <span key={card.id || i} className="bg-gray-800 px-2 py-0.5 rounded flex items-center gap-1">
              {card.name}
              <button className="text-red-400 ml-1" onClick={() => removeDarkness(card.id || i)}>✕</button>
            </span>
          ))}
        </div>
        <div className="bg-purple-700 text-white px-2 py-1 rounded shadow flex items-center gap-2">
          <b>Growing Dread:</b>
          {growingDread.length === 0 && <span className="text-gray-200">None</span>}
          {growingDread.map((card, i) => (
            <span key={card.id || i} className="bg-purple-900 px-2 py-0.5 rounded flex items-center gap-1">
              {card.name}
              <button className="text-red-300 ml-1" onClick={() => removeGrowingDread(card.id || i)}>✕</button>
            </span>
          ))}
        </div>
      </div>

      {/* Enemy Group Cards */}
      <div className="flex flex-col gap-4">
        {combatGroups.map((group, idx) => (
          <div key={group.id} className="relative">
            <EnemyGroupCard
              group={group}
              groupIdx={idx}
              setCombatGroups={() => {}} // Not needed, using context
              allGroups={combatGroups}
              posse={posse}
              globalModifiers={globalModifiers}
            />
            <button
              className="absolute top-1 right-1 text-red-500 font-bold rounded px-1 bg-white bg-opacity-70"
              onClick={() => removeGroup(group.id)}
              title="Remove group"
              style={{ zIndex: 10 }}
            >✕</button>
          </div>
        ))}
        {combatGroups.length === 0 && (
          <div className="text-center text-gray-400 italic">No active enemy groups.</div>
        )}
      </div>

      {/* Floating Add/Clear Buttons */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-6 z-50 pointer-events-none">
        <button
          className="btn btn-success pointer-events-auto"
          style={{ borderRadius: 999, minWidth: 56, minHeight: 56, fontSize: 32 }}
          onClick={handleAddGroup}
        >＋</button>
        <button
          className="btn btn-error pointer-events-auto"
          style={{ borderRadius: 999, minWidth: 56, minHeight: 56, fontSize: 32 }}
          onClick={clearCombat}
        >🗑️</button>
      </div>
    </div>
  );
}
