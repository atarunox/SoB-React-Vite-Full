// src/components/TownTab/LodgingPrompt.jsx
import React from 'react';

export default function LodgingPrompt({ show, hero, onChoose }) {
  if (!show) return null;
  return (
    <div className="bg-yellow-100 border border-yellow-400 p-3 rounded shadow-md">
      <p className="font-semibold mb-2">Choose your lodging for the new day:</p>
      <div className="flex gap-4">
        <button className="btn btn-sm btn-primary" onClick={() => onChoose('Hotel')} disabled={(hero.gold ?? 0) < 10}>
          Stay at Hotel ($10)
        </button>
        <button className="btn btn-sm btn-secondary" onClick={() => onChoose('Camp')}>Camp</button>
      </div>
      {(hero.gold ?? 0) < 10 && <div className="text-red-500 mt-2">Not enough gold for Hotel.</div>}
    </div>
  );
}
