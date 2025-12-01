
import React from 'react';
import { ENEMY_STATS } from '../../data/enemyStats';

export default function DMEnemyStatsPanel({ selected }) {
  if (!selected) return <div className="p-4">No enemy selected.</div>;

  const stats = ENEMY_STATS[selected.id] || {};
  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold">{selected.name} Stats</h2>
      <ul className="list-disc list-inside space-y-1 mt-2">
        {Object.entries(stats).map(([key, val]) => (
          <li key={key}><strong>{key}</strong>: {val}</li>
        ))}
      </ul>
    </div>
  );
}
