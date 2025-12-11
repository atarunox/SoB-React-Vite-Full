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
    <div className="space-y-3 p-4 bg-gradient-to-br from-shadow-light to-shadow rounded-lg border-2 border-corruption shadow-horror">
      <h3 className="text-xl font-bold text-parchment text-shadow-lg flex items-center gap-2">
        <span className="text-corruption-light">☠</span> Corruption <span className="text-corruption-light">☠</span>
      </h3>
      <div className="flex items-center gap-3 bg-shadow/50 p-3 rounded-md">
        <button
          onClick={() => adjust(-1)}
          className="px-3 py-2 bg-leather text-parchment font-bold rounded hover:bg-leather-light disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-horror border border-brass"
          disabled={current <= 0}
        >
          −
        </button>
        <div className="flex gap-2 flex-1 justify-center">
          {Array.from({ length: maxCorruption }).map((_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                i < current
                  ? 'bg-corruption border-corruption-light shadow-glow-red animate-blood-drip'
                  : 'bg-parchment border-leather-light'
              }`}
              title={`Corruption ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={() => adjust(1)}
          className="px-3 py-2 bg-leather text-parchment font-bold rounded hover:bg-leather-light disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-horror border border-brass"
          disabled={current >= maxCorruption}
        >
          +
        </button>
      </div>
      <div className="text-center text-parchment-dark text-sm italic">
        {current} / {maxCorruption} Corruption
      </div>
    </div>
  );
}
