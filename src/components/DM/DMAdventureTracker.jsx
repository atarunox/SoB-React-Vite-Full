import React, { useState, useMemo, useCallback } from 'react';
import { useAdventure } from '../../context/AdventureContext';
import { usePosse } from '../../context/PosseContext';
import { useCombatState } from '../../hooks/useCombatState';
import { getHBtDThreshold } from '../../data/depthEvents/depthEventLookup';

function getLanternInfo(hero) {
  if (!hero?.gear) return null;
  for (const item of Object.values(hero.gear)) {
    if (item?.slot === 'Light Source' && item.id && !item.id.startsWith('empty-')) {
      return item;
    }
  }
  return null;
}

const LANTERN_ABILITIES = {
  mining_lantern: { label: 'Mining Lantern', desc: 'Once/turn: spend 2 Grit to reroll HBtD', reroll: true, gritCost: 2 },
  explorers_lantern: { label: "Explorer's Lantern", desc: 'Once/turn: 1 Grit + D6 Horror to re-draw exploration token', reroll: false },
  lantern_of_shadows: { label: 'Lantern of Shadows', desc: 'Once/adventure: prevent Darkness card draw on failed HBtD; enemies -1 Init on your tile', blockDraw: true },
  mine_void_lantern: { label: 'Void Lantern', desc: 'Use Peril Die for HBtD; doubles = D6 Horror Hits to bearer + 1 to others', perilDie: true },
};

function TrackSpace({ index, depth, darkness, trackLength, gdSpaces, bsSpaces }) {
  const isParty = index === depth;
  const isDarkness = index === darkness;
  const isGD = gdSpaces.includes(index);
  const isBS = bsSpaces.includes(index);
  const pastDarkness = index > darkness;

  let bg = 'bg-gray-100';
  if (isGD) bg = 'bg-green-100 border-green-300';
  else if (isBS) bg = 'bg-red-50 border-red-200';
  if (pastDarkness) bg = 'bg-gray-800';

  return (
    <div className={`relative flex flex-col items-center justify-center w-10 h-14 rounded border text-xs font-mono shrink-0 ${bg}`}>
      <span className={`text-[10px] ${pastDarkness ? 'text-gray-500' : 'text-gray-400'}`}>{index}</span>
      {isGD && <span className="text-[8px] text-green-600">GD</span>}
      {isBS && <span className="text-[8px] text-red-500">BS</span>}
      {isParty && (
        <div className="absolute -top-2 w-5 h-5 rounded-full bg-blue-500 border-2 border-blue-700 flex items-center justify-center text-white text-[9px] font-bold shadow">P</div>
      )}
      {isDarkness && (
        <div className="absolute -bottom-2 w-5 h-5 rounded-full bg-red-600 border-2 border-red-800 flex items-center justify-center text-white text-[9px] font-bold shadow">D</div>
      )}
    </div>
  );
}

function RollResult({ lastRoll }) {
  if (!lastRoll) return null;
  const age = Date.now() - (lastRoll.timestamp || 0);
  if (age > 60000) return null;

  const isDoubles = lastRoll.isDoubles;
  const bgClass = isDoubles
    ? 'bg-green-100 border border-green-300 text-green-900'
    : lastRoll.success
      ? 'bg-green-100 border border-green-300 text-green-800'
      : 'bg-red-100 border border-red-300 text-red-800';

  return (
    <div className={`rounded-lg p-3 text-sm font-medium space-y-1 ${bgClass}`}>
      <div className="flex items-center justify-between">
        <span>
          {isDoubles
            ? 'DOUBLES — Depth Event!'
            : lastRoll.success ? 'Darkness held!' : 'Darkness advances!'}
          {' '}Rolled <strong>[{lastRoll.die1}+{lastRoll.die2}]={lastRoll.roll}</strong> vs {lastRoll.threshold}+
          {lastRoll.diceType === 'peril' && ' (Peril Die)'}
        </span>
        <span className="text-xs opacity-70">by {lastRoll.rolledBy}</span>
      </div>
      {isDoubles && lastRoll.depthEvent && (
        <div className="mt-2 p-2 bg-green-50 rounded border border-green-300">
          <div className="font-bold">{lastRoll.depthEvent.name}</div>
          <div className="italic text-xs text-green-700 mt-0.5">{lastRoll.depthEvent.flavor}</div>
          <div className="mt-1 text-xs leading-snug">{lastRoll.depthEvent.effect}</div>
        </div>
      )}
      {!isDoubles && lastRoll.landedOnGD && (
        <div className="text-green-700 font-semibold">Darkness landed on Growing Dread space — draw a Growing Dread card!</div>
      )}
      {!isDoubles && lastRoll.landedOnBS && (
        <div className="text-red-700 font-semibold">Darkness landed on Blood Spatter space — draw a Darkness card!</div>
      )}
    </div>
  );
}

export default function DMAdventureTracker({ posse: posseProp = [] }) {
  const adventure = useAdventure();
  if (!adventure) return null;
  const { state, updateAdventure, advanceDepth, retreatDepth, advanceDarkness, retreatDarkness, rollHBtD, resetAdventure, endAdventure } = adventure;
  const { updateHero } = usePosse();
  const [showConfig, setShowConfig] = useState(false);
  const [configDraft, setConfigDraft] = useState({});
  const [lanternUsedThisTurn, setLanternUsedThisTurn] = useState(false);

  const posse = posseProp;

  const lanternBearers = useMemo(() => {
    return posse.map(hero => {
      const lantern = getLanternInfo(hero);
      return lantern ? { heroId: hero.id || hero.localId, heroName: hero.name, lantern } : null;
    }).filter(Boolean);
  }, [posse]);

  const currentBearer = useMemo(() => {
    if (!state.lanternBearerId) return lanternBearers[0] || null;
    return lanternBearers.find(b => b.heroId === state.lanternBearerId) || lanternBearers[0] || null;
  }, [state.lanternBearerId, lanternBearers]);

  const lanternAbility = currentBearer?.lantern?.id ? LANTERN_ABILITIES[currentBearer.lantern.id] : null;
  const usesPerilDie = lanternAbility?.perilDie || false;

  const handleRoll = useCallback(() => {
    const bearerName = currentBearer?.heroName || 'DM';
    rollHBtD(bearerName, usesPerilDie ? 'peril' : null);
  }, [rollHBtD, currentBearer, usesPerilDie]);

  const handleStartAdventure = useCallback(() => {
    const config = {
      trackLength: configDraft.trackLength || state.trackLength,
      growingDreadSpaces: state.growingDreadSpaces,
      bloodSpatterSpaces: state.bloodSpatterSpaces,
    };
    resetAdventure(config);
    setLanternUsedThisTurn(false);
  }, [resetAdventure, configDraft, state]);

  // Reset lantern ability when turn advances
  const lastTurn = React.useRef(state.turn);
  React.useEffect(() => {
    if (state.turn !== lastTurn.current) {
      setLanternUsedThisTurn(false);
      lastTurn.current = state.turn;
    }
  }, [state.turn]);

  const handleRerollHBtD = useCallback(() => {
    if (!currentBearer || !lanternAbility?.reroll) return;
    const heroId = currentBearer.heroId;
    const hero = posse.find(h => (h.id || h.localId) === heroId);
    if (!hero) return;

    const currentGrit = Number(hero.currentGrit ?? hero.Grit ?? 0);
    const gritCost = lanternAbility.gritCost || 1;

    if (currentGrit < gritCost) {
      alert(`Not enough Grit! Need ${gritCost}, have ${currentGrit}.`);
      return;
    }

    // Deduct Grit
    updateHero(heroId, (h) => ({
      ...h,
      currentGrit: Math.max(0, (Number(h.currentGrit ?? h.Grit ?? 0)) - gritCost),
    }));

    setLanternUsedThisTurn(true);

    // Reroll
    const bearerName = currentBearer.heroName || 'DM';
    rollHBtD(bearerName, usesPerilDie ? 'peril' : null);
  }, [currentBearer, lanternAbility, posse, updateHero, rollHBtD, usesPerilDie]);

  const missionFailed = state.darkness <= 0 && state.active;
  const dangerZone = state.darkness <= 2 && state.darkness > 0 && state.active;

  // Not active — show setup screen
  if (!state.active) {
    return (
      <div className="p-4 bg-white rounded shadow space-y-4">
        <h2 className="text-xl font-bold">Adventure Tracker</h2>
        <p className="text-sm text-gray-600">Configure and start a new adventure. The Depth Track, Hold Back the Darkness, and lantern are managed here.</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">Track Length</label>
            <input
              type="number"
              className="input input-sm w-full"
              value={configDraft.trackLength ?? state.trackLength}
              onChange={e => setConfigDraft(p => ({ ...p, trackLength: Number(e.target.value) || 15 }))}
              min={6} max={20}
            />
          </div>
          <div className="flex flex-col justify-end">
            <label className="text-xs font-semibold text-gray-600">HBtD Target</label>
            <p className="text-xs text-gray-500 mt-1">Auto: 7+ (depths 1–4) · 8+ (5–9) · 9+ (10+)</p>
          </div>
        </div>

        {lanternBearers.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-gray-600">Lantern Bearer</label>
            <select
              className="select select-sm w-full"
              value={state.lanternBearerId || ''}
              onChange={e => updateAdventure({ lanternBearerId: e.target.value || null })}
            >
              <option value="">Auto-detect</option>
              {lanternBearers.map(b => (
                <option key={b.heroId} value={b.heroId}>{b.heroName} — {b.lantern.name}</option>
              ))}
            </select>
          </div>
        )}

        <button className="btn btn-primary w-full" onClick={handleStartAdventure}>
          Start Adventure
        </button>

        {state.lastRoll && (
          <p className="text-xs text-gray-400 text-center">Previous adventure: Turn {state.turn}, Depth {state.depth}</p>
        )}
      </div>
    );
  }

  // Active adventure
  return (
    <div className="p-4 bg-white rounded shadow space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold">Adventure Tracker</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold bg-gray-100 px-3 py-1 rounded">Turn {state.turn}</span>
          <button className="btn btn-xs btn-ghost text-red-500" onClick={endAdventure}>End Adventure</button>
        </div>
      </div>

      {/* Mission Failed */}
      {missionFailed && (
        <div className="bg-red-600 text-white font-bold text-center py-3 rounded-lg text-lg animate-pulse">
          MISSION FAILED — Darkness has reached the entrance!
        </div>
      )}

      {/* Danger warning */}
      {dangerZone && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 text-sm font-medium text-center py-2 rounded">
          Darkness is {state.darkness} space{state.darkness !== 1 ? 's' : ''} from the entrance!
        </div>
      )}

      {/* Summary bar */}
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="bg-blue-50 px-2 py-1 rounded border border-blue-200">
          Depth: <strong>{state.depth}</strong>
        </span>
        <span className="bg-red-50 px-2 py-1 rounded border border-red-200">
          Darkness: <strong>{state.darkness}</strong>/{state.trackLength}
        </span>
        <span className="bg-gray-50 px-2 py-1 rounded border border-gray-200">
          HBtD Target: <strong>{getHBtDThreshold(state.depth)}+</strong>
        </span>
        {currentBearer && (
          <span className="bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
            Lantern: <strong>{currentBearer.heroName}</strong> ({currentBearer.lantern.name})
          </span>
        )}
      </div>

      {/* Track visualization */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 py-3 min-w-max">
          {Array.from({ length: state.trackLength + 1 }, (_, i) => (
            <TrackSpace
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
        <div className="flex justify-between text-[10px] text-gray-400 px-1">
          <span>Entrance</span>
          <span>Deep</span>
        </div>
      </div>

      {/* Last roll result */}
      <RollResult lastRoll={state.lastRoll} />

      {/* Hold Back the Darkness */}
      <div className="border-2 border-amber-400 rounded-lg p-3 bg-amber-50 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-amber-900">Hold Back the Darkness</h3>
          <span className="text-xs text-amber-700">
            {usesPerilDie ? 'Peril Die' : '2D6'} ≥ {getHBtDThreshold(state.depth)}+
          </span>
        </div>
        {lanternAbility && (
          <p className="text-xs text-amber-700">{lanternAbility.desc}</p>
        )}
        <button
          className="btn btn-warning w-full font-bold text-base min-h-[48px]"
          onClick={handleRoll}
          disabled={missionFailed}
        >
          Roll Hold Back the Darkness
        </button>
        {lanternAbility?.reroll && state.lastRoll && !lanternUsedThisTurn && (
          <button
            className="btn btn-sm btn-outline btn-warning w-full min-h-[44px]"
            onClick={handleRerollHBtD}
            disabled={missionFailed}
          >
            ⚡ Use {lanternAbility.label} (Reroll) — Cost: {lanternAbility.gritCost} Grit
            {currentBearer && (() => {
              const hero = posse.find(h => (h.id || h.localId) === currentBearer.heroId);
              const grit = Number(hero?.currentGrit ?? hero?.Grit ?? 0);
              return ` (Have: ${grit})`;
            })()}
          </button>
        )}
      </div>

      {/* Depth controls */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-gray-600">Party Depth</span>
          <div className="flex gap-1">
            <button className="btn btn-sm btn-outline flex-1 min-h-[44px]" onClick={retreatDepth} disabled={state.depth <= 0}>
              ← Retreat
            </button>
            <button className="btn btn-sm btn-primary flex-1 min-h-[44px]" onClick={advanceDepth} disabled={state.depth >= state.trackLength}>
              Explore →
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-xs font-semibold text-gray-600">Darkness (manual)</span>
          <div className="flex gap-1">
            <button className="btn btn-sm btn-outline flex-1 min-h-[44px]" onClick={() => advanceDarkness(1)}>
              Advance ←
            </button>
            <button className="btn btn-sm btn-outline flex-1 min-h-[44px]" onClick={() => retreatDarkness(1)}>
              Retreat →
            </button>
          </div>
        </div>
      </div>

      {/* Lantern bearer */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600">Lantern Bearer</label>
        <select
          className="select select-sm w-full"
          value={state.lanternBearerId || ''}
          onChange={e => updateAdventure({ lanternBearerId: e.target.value || null })}
        >
          <option value="">Auto-detect</option>
          {lanternBearers.map(b => (
            <option key={b.heroId} value={b.heroId}>{b.heroName} — {b.lantern.name}</option>
          ))}
          {posse.filter(h => !lanternBearers.find(b => b.heroId === (h.id || h.localId))).map(h => (
            <option key={h.id || h.localId} value={h.id || h.localId}>{h.name} (no lantern)</option>
          ))}
        </select>
        {!currentBearer && (
          <p className="text-xs text-red-500">No hero has a Light Source equipped!</p>
        )}
      </div>

      {/* Config toggle */}
      <button className="btn btn-xs btn-ghost text-gray-500" onClick={() => setShowConfig(v => !v)}>
        {showConfig ? 'Hide' : 'Track'} Settings
      </button>
      {showConfig && (
        <div className="bg-gray-50 rounded p-3 space-y-2 border text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-gray-600">Track Length</label>
              <input
                type="number"
                className="input input-sm w-full"
                value={state.trackLength}
                onChange={e => updateAdventure({ trackLength: Number(e.target.value) || 15 })}
                min={6} max={20}
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="text-xs font-semibold text-gray-600">HBtD Target</label>
              <p className="text-xs text-gray-500 mt-1">7+ · 8+ · 9+ (auto by depth)</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            GD spaces: {state.growingDreadSpaces.join(', ')} | BS spaces: {state.bloodSpatterSpaces.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
