import React, { useMemo, useState, useEffect, useRef } from 'react';
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

function DieBox({ value, highlight }) {
  return (
    <div className={`w-14 h-14 rounded-xl border-4 flex items-center justify-center text-3xl font-black shadow-lg ${
      highlight
        ? 'border-yellow-400 bg-yellow-100 text-yellow-900'
        : 'border-gray-400 bg-white text-gray-900'
    }`}>
      {value}
    </div>
  );
}

function HBtDResultModal({ lastRoll, onClose }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(onClose, 12000);
    return () => clearTimeout(timerRef.current);
  }, [onClose]);

  if (!lastRoll) return null;

  const { die1, die2, roll, threshold, success, isDoubles, depthEvent, rolledBy, diceType, landedOnGD, landedOnBS } = lastRoll;

  let bannerBg, bannerText, headline;
  if (isDoubles) {
    bannerBg = 'bg-purple-700';
    bannerText = 'text-white';
    headline = 'DOUBLES — DEPTH EVENT!';
  } else if (success) {
    bannerBg = 'bg-green-600';
    bannerText = 'text-white';
    headline = 'DARKNESS HELD!';
  } else {
    bannerBg = 'bg-red-700';
    bannerText = 'text-white';
    headline = 'DARKNESS ADVANCES!';
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Banner */}
        <div className={`${bannerBg} ${bannerText} text-center py-4 px-4`}>
          <div className="text-2xl font-black tracking-wide">{headline}</div>
          <div className="text-sm opacity-80 mt-0.5">by {rolledBy}{diceType === 'peril' ? ' · Peril Die' : ''}</div>
        </div>

        {/* Dice display */}
        <div className="bg-gray-900 px-6 py-5 flex flex-col items-center gap-3">
          <div className="flex items-center gap-4">
            <DieBox value={die1} highlight={isDoubles} />
            <span className="text-white text-2xl font-bold">+</span>
            <DieBox value={die2} highlight={isDoubles} />
            <span className="text-white text-2xl font-bold">=</span>
            <div className={`w-16 h-16 rounded-xl border-4 flex items-center justify-center text-3xl font-black shadow-lg ${
              isDoubles ? 'border-purple-400 bg-purple-900 text-purple-100'
              : success ? 'border-green-400 bg-green-900 text-green-100'
              : 'border-red-400 bg-red-900 text-red-100'
            }`}>
              {roll}
            </div>
          </div>
          <div className="text-gray-400 text-sm">
            Target: <span className="text-white font-bold">{threshold}+</span>
            {!isDoubles && (
              <span className={`ml-3 font-bold ${success ? 'text-green-400' : 'text-red-400'}`}>
                {success ? '✓ Pass' : '✗ Fail'}
              </span>
            )}
          </div>
        </div>

        {/* Alerts / Depth Event */}
        <div className="bg-gray-800 px-4 pb-4 pt-2 space-y-2">
          {!isDoubles && landedOnGD && (
            <div className="bg-green-900/60 border border-green-500 rounded-lg px-3 py-2 text-green-200 text-sm font-semibold">
              ⚠ Landed on Growing Dread space — draw a Growing Dread card!
            </div>
          )}
          {!isDoubles && landedOnBS && (
            <div className="bg-red-900/60 border border-red-500 rounded-lg px-3 py-2 text-red-200 text-sm font-semibold">
              ⚠ Landed on Blood Spatter space — draw a Darkness card!
            </div>
          )}
          {isDoubles && depthEvent && (
            <div className="bg-purple-900/60 border border-purple-400 rounded-lg px-3 py-2 space-y-1">
              <div className="text-purple-100 font-bold text-sm">{depthEvent.name}</div>
              {depthEvent.flavor && (
                <div className="text-purple-300 text-xs italic">{depthEvent.flavor}</div>
              )}
              <div className="text-purple-100 text-xs leading-snug mt-1">{depthEvent.effect}</div>
            </div>
          )}
          {isDoubles && !depthEvent && (
            <div className="bg-purple-900/40 border border-purple-500 rounded-lg px-3 py-2 text-purple-200 text-sm">
              Darkness does not advance. Resolve Depth Event for this world.
            </div>
          )}

          <button
            className="w-full mt-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-semibold transition-colors min-h-[44px]"
            onClick={onClose}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdventureTrackView() {
  const adventure = useAdventure();
  if (!adventure) return null;
  const { state, rollHBtD } = adventure;
  const { activeHeroId } = useHero();
  const { posse } = usePosse();

  const [showModal, setShowModal] = useState(false);
  const lastRollTimestamp = useRef(null);

  // Show modal when a new roll lands
  useEffect(() => {
    if (state.lastRoll && state.lastRoll.timestamp !== lastRollTimestamp.current) {
      lastRollTimestamp.current = state.lastRoll.timestamp;
      setShowModal(true);
    }
  }, [state.lastRoll]);

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
    <>
      {showModal && lastRoll && (
        <HBtDResultModal
          lastRoll={lastRoll}
          onClose={() => setShowModal(false)}
        />
      )}

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

        {/* Last roll inline summary (recent only) */}
        {rollRecent && lastRoll && !showModal && (
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
              {' '}
              <button
                className="underline opacity-70 hover:opacity-100"
                onClick={() => setShowModal(true)}
              >
                details
              </button>
            </div>
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
    </>
  );
}
