import React from "react";
import { useCombatState } from "../hooks/useCombatState";
import { ENEMY_STATS } from "../data/enemyStats";

export default function ActiveEnemyStatsPage() {
  const { combatGroups } = useCombatState();

  if (!combatGroups.length) {
    return <div className="p-4 text-center text-gray-600">No active enemies.</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold text-center mb-4">Active Enemies</h2>
      {combatGroups.map((group) => {
        // You might have stats directly, or use ENEMY_STATS lookup
        const stats = group.stats || ENEMY_STATS[group.name] || {};
        return (
          <div
            key={group.id || group.name}
            className="border rounded p-3 bg-white shadow space-y-1"
          >
            <div className="font-bold text-lg">{group.name} (x{group.count || 1})</div>
            <div className="text-sm">
              <strong>Stats:</strong>
              <ul>
                {Object.entries(stats).map(([key, val]) => (
                  <li key={key}>
                    {key}: {String(val)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
