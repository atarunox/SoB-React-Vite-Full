// src/components/DM/DMActiveEnemiesPanel.jsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import EnemyGroupCard from "./EnemyGroupCard";

function useSwipe({ onLeft, onRight }) {
  const startX = useRef(null);
  const startY = useRef(null);

  const onTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (startX.current == null || startY.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      dx > 0 ? onRight() : onLeft();
    }
    startX.current = null;
    startY.current = null;
  }, [onLeft, onRight]);

  return { onTouchStart, onTouchEnd };
}

export default function DMActiveEnemiesPanel({
  combatGroups = [],
  globalModifiers = [],
  setCombatGroups,
  eliteCount = 0,
  isBrutal = false,
  posse = [],
}) {
  const [focusIndex, setFocusIndex] = useState(0);
  const [viewMode, setViewMode] = useState("cycle");
  const prevTotal = useRef(0);

  const total = combatGroups.length;
  const safeFocus = Math.min(focusIndex, Math.max(0, total - 1));

  useEffect(() => {
    if (total > prevTotal.current && prevTotal.current > 0) {
      setFocusIndex(total - 1);
    }
    prevTotal.current = total;
  }, [total]);

  const goPrev = useCallback(() => setFocusIndex(i => i > 0 ? i - 1 : total - 1), [total]);
  const goNext = useCallback(() => setFocusIndex(i => i < total - 1 ? i + 1 : 0), [total]);
  const swipeHandlers = useSwipe({ onLeft: goNext, onRight: goPrev });

  const groupsToShow = viewMode === "cycle" && total > 0
    ? [{ group: combatGroups[safeFocus], idx: safeFocus }]
    : combatGroups.map((group, idx) => ({ group, idx }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-bold text-lg">Active Enemies ({total} group{total !== 1 ? 's' : ''})</h2>
        {total > 1 && (
          <div className="flex items-center gap-1">
            <button
              className={`px-3 py-1 rounded text-xs font-semibold border ${viewMode === 'cycle' ? 'bg-[#5C3A21] text-white border-[#5C3A21]' : 'bg-white text-stone-700 border-stone-300'}`}
              onClick={() => setViewMode('cycle')}
            >
              Cycle
            </button>
            <button
              className={`px-3 py-1 rounded text-xs font-semibold border ${viewMode === 'all' ? 'bg-[#5C3A21] text-white border-[#5C3A21]' : 'bg-white text-stone-700 border-stone-300'}`}
              onClick={() => setViewMode('all')}
            >
              Show All
            </button>
          </div>
        )}
      </div>

      {/* Cycling navigation */}
      {viewMode === "cycle" && total > 1 && (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-stone-100 border border-stone-300 p-2">
          <button
            onClick={goPrev}
            className="px-3 py-2 rounded-md bg-[#5C3A21] text-white font-bold text-sm active:bg-[#4a2f1a] min-w-[70px]"
          >
            &larr; Prev
          </button>
          <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <div className="text-xs font-semibold text-stone-500">
              {safeFocus + 1} / {total}
            </div>
            <div className="flex gap-1 flex-wrap justify-center">
              {combatGroups.map((g, i) => (
                <button
                  key={g.id || i}
                  onClick={() => setFocusIndex(i)}
                  className={`px-2 py-1 rounded text-xs font-bold border transition-colors ${
                    i === safeFocus
                      ? 'bg-red-700 border-red-500 text-white ring-2 ring-amber-400'
                      : 'bg-stone-200 border-stone-400 text-stone-700 hover:bg-stone-300'
                  }`}
                  title={g.name}
                >
                  {g.name} x{g.count}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={goNext}
            className="px-3 py-2 rounded-md bg-[#5C3A21] text-white font-bold text-sm active:bg-[#4a2f1a] min-w-[70px]"
          >
            Next &rarr;
          </button>
        </div>
      )}

      {total === 0 && (
        <div className="italic text-gray-400">No active enemy groups. Draw a threat to begin.</div>
      )}

      <div
        {...(viewMode === "cycle" && total > 1 ? swipeHandlers : {})}
        style={viewMode === "cycle" && total > 1 ? { touchAction: "pan-y" } : undefined}
        className="space-y-4"
      >
        {groupsToShow.map(({ group, idx }) => (
          <EnemyGroupCard
            key={group.id || idx}
            group={group}
            groupIdx={idx}
            allGroups={combatGroups}
            setCombatGroups={setCombatGroups}
            posse={posse}
            globalModifiers={globalModifiers}
          />
        ))}
      </div>
    </div>
  );
}
