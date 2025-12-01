import React from 'react';
import { usePosse } from '../context/PosseContext';
import { calculateCurrentStats } from '../utils/calculateStats';

export default function CorruptionTracker({ hero }) {
  const { updateHero } = usePosse();
  if (!hero) return null;

  // Safely read max corruption regardless of key shape
  const { stats = {} } = calculateCurrentStats(hero);
  const maxCorruption =
    stats.maxCorruption ??
    stats['Max Corruption'] ??
    stats.maxcorruption ??
    5;

  // Use the same field name the rest of the app uses
  const current = hero.currentCorruption ?? 0;
  const id = hero.id || hero.localId;

  const adjust = (delta) => {
    if (!id) return;
    const next = Math.max(0, Math.min(maxCorruption, current + delta));
    // Only send the minimal patch so we don't ship undefineds
    updateHero({ id, currentCorruption: next });
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold">Corruption</h3>
      <div className="flex items-center gap-2">
        <button
          onClick={() => adjust(-1)}
          className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
          disabled={current <= 0}
        >
          −
        </button>
        <div className="flex gap-1">
          {Array.from({ length: maxCorruption }).map((_, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full border ${
                i < current ? 'bg-purple-600' : 'bg-white'
              }`}
              title={`Corruption ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() => adjust(1)}
          className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
          disabled={current >= maxCorruption}
        >
          +
        </button>
      </div>
    </div>
  );
}
