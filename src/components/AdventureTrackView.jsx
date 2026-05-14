import React, { useMemo } from 'react';
import { useAdventure } from '../context/AdventureContext';
import { useHero } from '../context/HeroContext';
import { usePosse } from '../context/PosseContext';

function getLanternInfo(hero) {
  if (!hero?.gear) return null;
  for (const item of Object.values(hero.gear)) {
    if (item?.slot === 'Light Source' && item.id && !item.id.startsWith('empty-')) {
      return item;
    }
  }
  return null;
}

function TrackSpaceMini({ index, depth, darkness, trackLength, gdSpaces, bsSpaces }) {
  const isParty = index === depth;
  const isDarkness = index === darkness;
  const isGD = gdSpaces.includes(index);
  const isBS = bsSpaces.includes(index);
  const pastDarkness = index > darkness;

  let bg = 'bg-gray-100';
  if (isGD) bg = 'bg-purple-100';
  else if (isBS) bg = 'bg-red-50';
  if (pastDarkness) bg = 'bg-gray-700';

  return (
    <div className={`relative flex items-center justify-center w-7 h-9 rounded border text-[9px] font-mono shrink-0 ${bg}`}>
      <span className={pastDarkness ? 'text-gray-500' : 'text-gray-400'}>{index}</span>
      {isParty && (
        <div className="absolute -top-1.5 w-4 h-4 rounded-full bg-blue-500 border border-blue-700 flex items-center justify-center text-white text-[7px] font-bold">P</div>
      )}
      {isDarkness && (
        <div className="absolute -bottom-1.5 w-4 h-4 rounded-full bg-red-600 border border-red-800 flex items-center justify-center text-white text-[7px] font-bold">D</div>
      )}
    </div>
  );
}

export default function AdventureTrackView() {
  const adventure = useAdventure();
  if (!adventure) return null;
  const { state, rollHBtD } = adventure;
  const { activeHeroId } = useHero();
  const { posse } = usePosse();

  const activeHero = useMemo(() => {
    return posse.find(h => (h.id || h.localId) === activeHeroId) || null;
  }, [posse, activeHeroId]);

  const isLanternBearer = useMemo(() => {
    if (!activeHero || !state.lanternBearerId) return false;
    const heroId = activeHero.id || activeHero.localId;
    return heroId === state.lanternBearerId;
  }, [activeHero, state.lanternBearerId]);

  const hasLantern = useMemo(() => {
    return activeHero ? !!getLanternInfo(activeHero) : false;
  }, [activeHero]);

  const lanternItem = useMemo(() => {
    return activeHero ? getLanternInfo(activeHero) : null;
  }, [activeHero]);

  const lanternBearerName = useMemo(() => {
    if (!state.lanternBearerId) return null;
    const hero = posse.find(h => (h.id || h.localId) === state.lanternBearerId);
    return hero?.name || null;
  }, [state.lanternBearerId, posse]);

  const usesPerilDie = lanternItem?.id === 'mine_void_lantern';

  if (!state.active) return null;

  const missionFailed = state.darkness <= 0;
  const lastRoll = state.lastRoll;
  const rollRecent = lastRoll && (Date.now() - (lastRoll.timestamp || 0)) < 60000;

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50/60 p-3 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-amber-900">Depth Track</h3>
        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Turn {state.turn}</span>
      </div>

      {missionFailed && (
        <div className="bg-red-600 text-white font-bold text-center py-1.5 rounded text-sm">
          MISSION FAILED
        </div>
      )}

      {/* Compact track */}
      <div className="overflow-x-auto">
        <div className="flex gap-0.5 py-2 min-w-max">
          {Array.from({ length: state.trackLength + 1 }, (_, i) => (
            <TrackSpaceMini
              key={i}
              index={i}
              depth={state.depth}
              darkness={state.darkness}
              trackLength={state.trackLength}
              gdSpaces={state.growingDreadSpaces}
              bsSpaces={state.bloodSpatterSpaces}
            />
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span>Depth: <strong>{state.depth}</strong></span>
        <span>Darkness: <strong>{state.darkness}</strong></span>
        <span>Threshold: <strong>{state.hbtdThreshold}+</strong></span>
        {lanternBearerName && <span>Lantern: <strong>{lanternBearerName}</strong></span>}
      </div>

      {/* Last roll */}
      {rollRecent && lastRoll && (
        <div className={`text-xs rounded px-2 py-1 ${lastRoll.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {lastRoll.rolledBy} rolled <strong>{lastRoll.roll}</strong> vs {lastRoll.threshold}+
          — {lastRoll.success ? 'Held!' : 'Darkness advances!'}
        </div>
      )}

      {/* Lantern bearer roll button */}
      {(isLanternBearer || (hasLantern && !state.lanternBearerId)) && !missionFailed && (
        <button
          className="btn btn-sm btn-warning w-full font-semibold min-h-[44px]"
          onClick={() => rollHBtD(activeHero?.name || 'Hero', usesPerilDie ? 'peril' : null)}
        >
          Roll Hold Back the Darkness
          {usesPerilDie && ' (Peril Die)'}
        </button>
      )}
    </div>
  );
}
