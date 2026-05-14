import React, { useState, useCallback } from 'react';

export default function DMTurnTracker({ posse = [], combatGroups = [] }) {
  const [round, setRound] = useState(1);
  const [activated, setActivated] = useState(new Set());

  const markActivated = useCallback((id) => {
    setActivated(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const nextRound = useCallback(() => {
    setRound(r => r + 1);
    setActivated(new Set());
  }, []);

  const resetCombat = useCallback(() => {
    setRound(1);
    setActivated(new Set());
  }, []);

  const allIds = [
    ...posse.map(h => ({ id: `hero-${h.id || h.localId}`, label: h.name || h.heroClass || 'Hero', type: 'hero' })),
    ...combatGroups.map(g => ({ id: `group-${g.id}`, label: g.name || g.enemyType || 'Enemy Group', type: 'enemy' })),
  ];

  const activatedCount = allIds.filter(e => activated.has(e.id)).length;
  const allActivated = allIds.length > 0 && activatedCount === allIds.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Turn Tracker — Round {round}</h2>
        <div className="flex gap-2">
          <button
            className="btn btn-sm btn-primary"
            onClick={nextRound}
            disabled={allIds.length === 0}
          >
            Next Round
          </button>
          <button className="btn btn-sm btn-ghost" onClick={resetCombat}>
            Reset
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        {activatedCount} / {allIds.length} activated
        {allActivated && <span className="ml-2 text-green-600 font-medium">— Round complete!</span>}
      </div>

      {allIds.length === 0 && (
        <div className="text-gray-500 italic text-sm">
          No heroes or enemy groups to track. Add enemies in the Enemies tab.
        </div>
      )}

      <div className="space-y-2">
        {posse.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase text-gray-500 mb-1">Heroes</div>
            <div className="flex flex-wrap gap-2">
              {posse.map(h => {
                const id = `hero-${h.id || h.localId}`;
                const done = activated.has(id);
                return (
                  <button
                    key={id}
                    onClick={() => markActivated(id)}
                    className={`px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${
                      done
                        ? 'bg-green-600 text-white border-green-700'
                        : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {done ? '✓ ' : ''}{h.name || h.heroClass || 'Hero'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {combatGroups.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase text-gray-500 mb-1">Enemy Groups</div>
            <div className="flex flex-wrap gap-2">
              {combatGroups.map(g => {
                const id = `group-${g.id}`;
                const done = activated.has(id);
                return (
                  <button
                    key={id}
                    onClick={() => markActivated(id)}
                    className={`px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${
                      done
                        ? 'bg-red-700 text-white border-red-800'
                        : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {done ? '✓ ' : ''}{g.name || g.enemyType || 'Enemy Group'}
                    {g.count > 1 ? ` ×${g.count}` : ''}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
