import React, { useState } from 'react';
import { usePosse } from '../context/PosseContext';
import { computeTravelHazardsForPosse } from '../rules/travelRules';

export default function TravelPhase() {
  const { posse } = usePosse();
  const [results, setResults] = useState([]);

  const rollAll = () => {
    const r = computeTravelHazardsForPosse(posse || []);
    setResults(r);
  };

  return (
    <div className="p-4 border rounded space-y-3">
      <h3 className="font-semibold">Travel to Town</h3>
      <button className="border rounded px-2 py-1" onClick={rollAll}>Roll for All Heroes</button>
      <ul className="list-disc pl-5">
        {results.map(r => (
          <li key={r.id} className={r.hazard ? 'text-red-600' : ''}>
            {r.name} (Roll {r.roll}) — {r.hazard ? 'Hazard!' : 'Safe'}
          </li>
        ))}
      </ul>
      <p className="text-sm opacity-70">On a 1–2, that hero suffers a Travel Hazard (resolve before arriving in town).</p>
    </div>
  );
}
