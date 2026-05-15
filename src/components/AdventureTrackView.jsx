import React, { useMemo } from 'react';
import { useAdventure } from '../context/AdventureContext';
import { useHero } from '../context/HeroContext';
import { usePosse } from '../context/PosseContext';
import { getHBtDThreshold } from '../data/depthEvents/depthEventLookup';

function getLanternInfo(hero) {
  if (!hero?.gear) return null;
  for (const item of Object.values(hero.gear)) {
    if (item?.slot === 'Light Source' && item.id && !item.id.startsWith('empty-')) {
      return item;
    }
  }
  return null;
}

// Builds the slot array for the track visual.
// Layout: [Posse Entry] [Space 15] [Space 14] … [Space 1] [Darkness Entry]
// depth   = steps taken by posse (0=entry, 1=space 15, …, 15=space 1)
// darkness = physical space darkness is on (0=entry right, 1=space 1, …)
function buildSlots(trackLength) {
  const slots = [];
  slots.push({ type: 'entry', side: 'posse' });
  for (let i = 1; i <= trackLength; i++) {
    slots.push({ type: 'space', spaceNum: trackLength + 1 - i });
  }
  slots.push({ type: 'entry', side: 'darkness' });
  return slots;
}

function TrackSlotMini({ slot, slotIdx, trackLength, depth, darkness, gdSpaces, bsSpaces }) {
  const posseSlot    = depth;                           // posse at slot=depth
  const darknessSlot = (trackLength + 1) - darkness;   // 0→slot 16, 1→slot 15…

  const isParty   = slotIdx === posseSlot;
  const isDark    = slotIdx === darknessSlot;
  // consumed = to the right of darkness marker (higher slot index)
  const consumed  = slotIdx > darknessSlot;

  if (slot.type === 'entry') {
    const isPosse = slot.side === 'posse';
    return (
      <div className={`relative flex items-center justify-center w-8 h-9 rounded border-2 border-dashed text-[8px] font-bold shrink-0 ${
        isPosse ? 'border-blue-400 text-blue-400' : 'border-red-500 text-red-400'
      } bg-gray-50`}>
        {isPosse ? 'P' : 'D'}
        {isParty && (
          <div className="absolute -top-1.5 w-4 h-4 rounded-full bg-blue-500 border border-blue-700 flex items-center justify-center text-white text-[7px] font-bold">P</div>
        )}
        {isDark && (
          <div className="absolute -bottom-1.5 w-4 h-4 rounded-full bg-red-600 border border-red-800 flex items-center justify-center text-white text-[7px] font-bold">D</div>
        )}
      </div>
    );
  }

  const { spaceNum } = slot;
  const isGD = gdSpaces.includes(spaceNum);
  const isBS = bsSpaces.includes(spaceNum);

  let bg = 'bg-gray-100';
  if (consumed) bg = 'bg-gray-700';
  else if (isGD) bg = 'bg-green-100';
  else if (isBS) bg = 'bg-red-50';

  return (
    <div className={`relative flex items-center justify-center w-7 h-9 rounded border text-[9px] font-mono shrink-0 ${bg}`}>
      <span className={consumed ? 'text-gray-500' : 'text-gray-400'}>{spaceNum}</span>
      {isParty && (
        <div className="absolute -top-1.5 w-4 h-4 rounded-full bg-blue-500 border border-blue-700 flex items-center justify-center text-white text-[7px] font-bold">P</div>
      )}
      {isDark && (
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
    return (activeHero.id || activeHero.localId) === state.lanternBearerId;
  }, [activeHero, state.lanternBearerId]);

  const lanternItem = useMemo(() => getLanternInfo(activeHero), [activeHero]);
  const hasLantern  = !!lanternItem;
  const usesPerilDie = lanternItem?.id === 'mine_void_lantern';

  const lanternBearerName = useMemo(() => {
    if (!state.lanternBearerId) return null;
    return posse.find(h => (h.id || h.localId) === state.lanternBearerId)?.name || null;
  }, [state.lanternBearerId, posse]);

  const slots = useMemo(() => buildSlots(state.trackLength), [state.trackLength]);

  if (!state.active) return null;

  const missionFailed = state.darkness > state.trackLength;
  const lastRoll = state.lastRoll;
  const rollRecent = lastRoll && (Date.now() - (lastRoll.timestamp || 0)) < 60000;

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50/60 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-amber-900">Depth Track</h3>
        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Turn {state.turn}</span>
      </div>

      {missionFailed && (
        <div className="bg-red-600 text-white font-bold text-center py-1.5 rounded text-sm">
          MISSION FAILED
        </div>
      )}

      {/* Track: [P-Entry] [15]…[1] [D-Entry] */}
      <div className="overflow-x-auto">
        <div className="flex gap-0.5 py-2 min-w-max">
          {slots.map((slot, i) => (
            <TrackSlotMini
              key={i}
              slot={slot}
              slotIdx={i}
              trackLength={state.trackLength}
              depth={state.depth}
              darkness={state.darkness}
              gdSpaces={state.growingDreadSpaces}
              bsSpaces={state.bloodSpatterSpaces}
            />
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span>Depth: <strong>{state.depth}</strong></span>
        <span>Darkness: <strong>{state.darkness > 0 ? `Space ${state.darkness}` : 'Entry'}</strong></span>
        <span>HBtD Target: <strong>{getHBtDThreshold(state.depth)}+</strong></span>
        {lanternBearerName && <span>Lantern: <strong>{lanternBearerName}</strong></span>}
      </div>

      {/* Last roll */}
      {rollRecent && lastRoll && (
        <div className={`text-xs rounded px-2 py-1 space-y-1 ${
          lastRoll.isDoubles ? 'bg-yellow-100 text-yellow-900'
          : lastRoll.success ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
        }`}>
          <div>
            {lastRoll.rolledBy} rolled <strong>[{lastRoll.die1}+{lastRoll.die2}]={lastRoll.roll}</strong> vs {lastRoll.threshold}+
            {' — '}
            {lastRoll.isDoubles ? 'DOUBLES — Depth Event!'
              : lastRoll.success ? 'Held!' : 'Darkness advances!'}
          </div>
          {lastRoll.isDoubles && lastRoll.depthEvent && (
            <div className="mt-1 p-2 bg-yellow-50 rounded border border-yellow-300">
              <div className="font-bold text-sm">{lastRoll.depthEvent.name}</div>
              <div className="italic text-[10px] text-yellow-700 mt-0.5">{lastRoll.depthEvent.flavor}</div>
              <div className="mt-1 text-[11px] leading-tight">{lastRoll.depthEvent.effect}</div>
            </div>
          )}
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
