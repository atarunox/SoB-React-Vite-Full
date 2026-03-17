// src/components/DM/TownStayManager.jsx
//
// DM panel for managing the town stay lifecycle:
// - Day counter & advancement
// - Darkness tracker (D6 roll, 3+ advances)
// - End Day flow (lodging, daily event reset)
// - End Town Stay / Leave Town
// - Debug mode for testing locations

import React, { useState, useEffect, useCallback } from 'react';
import {
  loadTownState,
  saveTownState,
  startNewDay,
  rollDarknessAdvance,
  advanceDarkness,
  resetDarkness,
  isDarknessFull,
  endTownStay,
  startNewTownStay,
  isTownStayActive,
  setDebugMode,
  isDebugMode,
  resetLocationEvent,
  resetAllLocationEvents,
  resetVisitsForToday,
  clearVisitsForToday,
  setLodgingForTomorrow,
  onTownStateChange,
} from '../../utils/townState';

import {
  clearEvent as clearEngineEvent,
  resetAllEvents as resetAllEngineEvents,
} from '../../utils/locationEventsEngine';

// Registered location IDs for the debug reset panel
const LOCATION_IDS = [
  { id: 'blacksmith', label: 'Blacksmith' },
  { id: 'church', label: 'Church' },
  { id: 'saloon', label: 'Saloon' },
  { id: 'generalStore', label: 'General Store' },
  { id: 'docsOffice', label: "Doc's Office" },
  { id: 'sheriffsOffice', label: "Sheriff's Office" },
  { id: 'indianTradingPost', label: 'Indian Trading Post' },
  { id: 'streetMarket', label: 'Street Market' },
  { id: 'smugglersDen', label: "Smuggler's Den" },
  { id: 'mutantQuarter', label: 'Mutant Quarter' },
  { id: 'frontierOutpost', label: 'Frontier Outpost' },
  { id: 'gamblingHall', label: 'Gambling Hall' },
  { id: 'campSite', label: 'Camp Site' },
];

export default function TownStayManager({ posse = [], updateHero }) {
  const [ts, setTs] = useState(loadTownState);
  const [lastDarknessRoll, setLastDarknessRoll] = useState(null);
  const [showLodging, setShowLodging] = useState(false);
  const [lodgingChoices, setLodgingChoices] = useState({});
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showNewStayConfirm, setShowNewStayConfirm] = useState(false);

  // Refresh from localStorage on external changes
  const refresh = useCallback(() => setTs(loadTownState()), []);
  useEffect(() => {
    const unsub = onTownStateChange(refresh);
    return unsub;
  }, [refresh]);

  const active = isTownStayActive(ts);
  const debug = isDebugMode(ts);
  const darknessFull = isDarknessFull(ts);

  // ---- Day Management ----

  const handleEndDay = () => {
    setShowLodging(true);
    // Pre-fill lodging choices with Hotel
    const choices = {};
    posse.forEach(h => {
      const id = h.id || h.localId;
      if (id) choices[id] = 'Hotel';
    });
    setLodgingChoices(choices);
  };

  const confirmEndDay = () => {
    let state = loadTownState();

    // Record lodging for each hero
    Object.entries(lodgingChoices).forEach(([heroId, choice]) => {
      state = setLodgingForTomorrow(state, heroId, choice);
    });

    // Start new day (increments counter, clears per-day state)
    state = startNewDay(state);

    // Clear hero per-day flags
    posse.forEach(h => {
      const id = h.id || h.localId;
      if (id && updateHero) {
        updateHero({
          id,
          lodging: '',
          chosenLocation: '',
          isDone: false,
        });
      }
    });

    setShowLodging(false);
    setLodgingChoices({});
    setLastDarknessRoll(null);
    refresh();
  };

  const handleRollDarkness = () => {
    const state = loadTownState();
    const result = rollDarknessAdvance(state);
    setLastDarknessRoll(result);
    refresh();
  };

  const handleAdvanceDarkness = () => {
    const state = loadTownState();
    advanceDarkness(state, 1, 'dm_manual');
    refresh();
  };

  const handleReduceDarkness = () => {
    const state = loadTownState();
    state.darknessTrack = Math.max(0, (state.darknessTrack || 0) - 1);
    saveTownState(state);
    refresh();
  };

  // ---- Town Stay Lifecycle ----

  const handleEndTownStay = () => {
    const state = loadTownState();
    endTownStay(state);
    setShowEndConfirm(false);
    refresh();
  };

  const handleStartNewStay = () => {
    startNewTownStay();
    resetAllEngineEvents();
    setShowNewStayConfirm(false);
    setLastDarknessRoll(null);
    refresh();
  };

  // ---- Debug Mode ----

  const toggleDebug = () => {
    const state = loadTownState();
    setDebugMode(state, !debug);
    refresh();
  };

  const handleResetLocation = (shopId) => {
    resetLocationEvent(shopId);
    clearEngineEvent(shopId);
    refresh();
  };

  const handleResetAllLocations = () => {
    resetAllLocationEvents();
    resetAllEngineEvents();
    refresh();
  };

  const handleResetVisits = () => {
    resetVisitsForToday();
    // Also clear hero chosenLocation flags
    posse.forEach(h => {
      const id = h.id || h.localId;
      if (id && updateHero) {
        updateHero({ id, chosenLocation: '', isDone: false });
      }
    });
    refresh();
  };

  const handleResetDay = () => {
    const state = loadTownState();
    // Reset visits + daily event without advancing the day
    const day = state.day || 1;
    state.visitByDay[day] = {};
    state.dailyEventByDay[day] = { drawn: false, card: null, drawerId: null, at: null };
    state.dayMods = {};
    saveTownState(state);
    // Clear hero per-day flags
    posse.forEach(h => {
      const id = h.id || h.localId;
      if (id && updateHero) {
        updateHero({ id, chosenLocation: '', isDone: false, lodging: '' });
      }
    });
    refresh();
  };

  // ---- Darkness Track Visual ----
  const darknessBoxes = [];
  const max = ts.darknessMax || 6;
  for (let i = 1; i <= max; i++) {
    const filled = i <= (ts.darknessTrack || 0);
    darknessBoxes.push(
      <div
        key={i}
        className={`w-8 h-8 rounded border-2 flex items-center justify-center text-sm font-bold transition-colors ${
          filled
            ? 'bg-purple-800 border-purple-900 text-white'
            : 'bg-gray-100 border-gray-300 text-gray-400'
        }`}
      >
        {i}
      </div>
    );
  }

  // Location events that have been rolled
  const rolledEvents = Object.keys(ts.locationEvents || {}).filter(
    k => ts.locationEvents[k]?.rolled
  );

  return (
    <div className="space-y-4">
      {/* ====== STATUS HEADER ====== */}
      <div className={`p-3 rounded border-2 ${
        !active ? 'bg-red-50 border-red-300' :
        darknessFull ? 'bg-yellow-50 border-yellow-400' :
        'bg-green-50 border-green-300'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="font-bold text-lg">
              {!active ? 'Town Stay Ended' :
               darknessFull ? 'Darkness Full — Heroes Must Leave!' :
               `Day ${ts.day || 1}`}
            </span>
            <span className="ml-3 text-sm text-gray-600">
              Started {new Date(ts.startedAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {active && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-800 font-medium">
                Town Stay Active
              </span>
            )}
            {!active && (
              <span className="text-xs px-2 py-1 rounded-full bg-red-200 text-red-800 font-medium">
                Left Town
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ====== DARKNESS TRACKER ====== */}
      <div className="p-3 rounded border bg-white/80">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-base">Darkness Track</h3>
          <span className="text-sm text-gray-600">
            {ts.darknessTrack || 0} / {max}
          </span>
        </div>

        <div className="flex gap-1 mb-3">
          {darknessBoxes}
        </div>

        {active && (
          <div className="flex gap-2 flex-wrap items-center">
            <button
              className="btn btn-sm btn-primary"
              onClick={handleRollDarkness}
              title="Roll D6 — on 3+, darkness advances"
            >
              Roll Darkness (D6)
            </button>
            <button
              className="btn btn-sm btn-outline"
              onClick={handleAdvanceDarkness}
              title="Manually advance darkness by 1"
            >
              +1 Darkness
            </button>
            <button
              className="btn btn-sm btn-outline"
              onClick={handleReduceDarkness}
              title="Reduce darkness by 1"
              disabled={(ts.darknessTrack || 0) === 0}
            >
              -1 Darkness
            </button>
          </div>
        )}

        {lastDarknessRoll && (
          <div className={`mt-2 p-2 rounded text-sm ${
            lastDarknessRoll.advanced ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'
          }`}>
            Rolled <strong>[{lastDarknessRoll.roll}]</strong> —{' '}
            {lastDarknessRoll.advanced
              ? `Darkness advances to ${lastDarknessRoll.newLevel}!`
              : 'No advance (needed 3+).'}
          </div>
        )}

        {darknessFull && active && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-800 font-medium">
            The Darkness has consumed the town! Heroes are forced to leave.
          </div>
        )}
      </div>

      {/* ====== DAY CONTROLS ====== */}
      {active && (
        <div className="p-3 rounded border bg-white/80">
          <h3 className="font-bold text-base mb-2">Day Management</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              className="btn btn-sm btn-accent"
              onClick={handleEndDay}
            >
              End Day {ts.day || 1}
            </button>
            <button
              className="btn btn-sm btn-error btn-outline"
              onClick={() => setShowEndConfirm(true)}
            >
              Leave Town
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            End Day: choose lodging (Hotel/Camp), advance to next day, roll for darkness.
            Leave Town: ends the town stay entirely.
          </p>
        </div>
      )}

      {/* ====== TOWN STAY OVER — START NEW ====== */}
      {!active && (
        <div className="p-3 rounded border bg-white/80">
          <button
            className="btn btn-sm btn-success"
            onClick={() => setShowNewStayConfirm(true)}
          >
            Start New Town Stay
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Resets day counter, darkness track, all location events, visits, and modifiers.
          </p>
        </div>
      )}

      {/* ====== HERO VISIT STATUS ====== */}
      {active && posse.length > 0 && (
        <div className="p-3 rounded border bg-white/80">
          <h3 className="font-bold text-base mb-2">Hero Status — Day {ts.day || 1}</h3>
          <div className="space-y-1">
            {posse.map(h => {
              const hid = h.id || h.localId;
              const visit = ts.visitByDay?.[ts.day]?.[hid];
              const lodging = ts.lodgingByDay?.[ts.day]?.[hid];
              const ejected = ts.ejectedHeroes?.[hid];
              return (
                <div key={hid} className="flex items-center gap-2 text-sm">
                  <span className="font-medium w-28 truncate">{h.name}</span>
                  {ejected ? (
                    <span className="text-red-600 text-xs">Ejected from town</span>
                  ) : (
                    <>
                      <span className="text-gray-500">
                        {visit ? `Visiting: ${visit.shopId}` : 'No visit yet'}
                      </span>
                      {lodging && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                          {lodging}
                        </span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ====== DARKNESS LOG ====== */}
      {(ts.darknessLog || []).length > 0 && (
        <details className="p-3 rounded border bg-white/80">
          <summary className="font-bold text-sm cursor-pointer">
            Darkness Log ({ts.darknessLog.length} entries)
          </summary>
          <div className="mt-2 space-y-1 text-xs max-h-40 overflow-y-auto">
            {[...ts.darknessLog].reverse().map((entry, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-gray-400">Day {entry.day}</span>
                {entry.roll != null && (
                  <span>
                    Rolled [{entry.roll}] —{' '}
                    {entry.advanced ? 'Advanced' : 'No advance'}
                  </span>
                )}
                {entry.amount != null && (
                  <span>+{entry.amount} ({entry.reason})</span>
                )}
              </div>
            ))}
          </div>
        </details>
      )}

      {/* ====== DEBUG MODE ====== */}
      <div className={`p-3 rounded border-2 ${debug ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-white/80'}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-base">
            Debug Mode {debug && <span className="text-orange-600 text-sm">(Active)</span>}
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="toggle toggle-warning"
              checked={debug}
              onChange={toggleDebug}
            />
            <span className="text-sm">{debug ? 'ON' : 'OFF'}</span>
          </label>
        </div>

        {debug && (
          <div className="space-y-3">
            <p className="text-xs text-orange-700">
              Debug mode lets you reset location events and visits for testing without ending the day.
            </p>

            {/* Quick actions */}
            <div className="flex gap-2 flex-wrap">
              <button
                className="btn btn-xs btn-warning"
                onClick={handleResetVisits}
              >
                Reset Today's Visits
              </button>
              <button
                className="btn btn-xs btn-warning"
                onClick={handleResetDay}
              >
                Reset Entire Day
              </button>
              <button
                className="btn btn-xs btn-error"
                onClick={handleResetAllLocations}
              >
                Reset All Location Events
              </button>
            </div>

            {/* Per-location reset */}
            <div>
              <h4 className="text-sm font-semibold mb-1">Reset Individual Locations</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                {LOCATION_IDS.map(loc => {
                  const hasEvent = ts.locationEvents?.[loc.id]?.rolled;
                  return (
                    <button
                      key={loc.id}
                      className={`btn btn-xs ${hasEvent ? 'btn-warning' : 'btn-ghost'}`}
                      onClick={() => handleResetLocation(loc.id)}
                      disabled={!hasEvent}
                      title={hasEvent ? `Reset ${loc.label} event` : `${loc.label} — no event rolled`}
                    >
                      {loc.label}
                      {hasEvent && ' ✕'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rolled events summary */}
            {rolledEvents.length > 0 && (
              <div className="text-xs text-gray-600">
                <strong>Rolled events:</strong>{' '}
                {rolledEvents.map(k => {
                  const ev = ts.locationEvents[k];
                  const label = LOCATION_IDS.find(l => l.id === k)?.label || k;
                  return `${label} (roll: ${ev.result?.roll ?? '?'})`;
                }).join(', ')}
              </div>
            )}

            {/* Manual darkness reset */}
            <div className="flex gap-2 items-center">
              <button
                className="btn btn-xs btn-outline"
                onClick={() => {
                  const state = loadTownState();
                  resetDarkness(state);
                  refresh();
                }}
              >
                Reset Darkness Track
              </button>
              <span className="text-xs text-gray-500">Sets darkness back to 0</span>
            </div>
          </div>
        )}
      </div>

      {/* ====== LODGING MODAL ====== */}
      {showLodging && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-5 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-lg mb-3">
              End of Day {ts.day || 1} — Choose Lodging
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Hotel costs $25 per hero (heal 1 Wound and 1 Sanity).
              Camp is free but heroes risk camp events.
            </p>
            <div className="space-y-2">
              {posse.map(h => {
                const hid = h.id || h.localId;
                const ejected = ts.ejectedHeroes?.[hid];
                if (ejected) return null;
                return (
                  <div key={hid} className="flex items-center justify-between">
                    <span className="font-medium">{h.name}</span>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name={`lodging-${hid}`}
                          value="Hotel"
                          checked={(lodgingChoices[hid] || 'Hotel') === 'Hotel'}
                          onChange={() => setLodgingChoices(p => ({ ...p, [hid]: 'Hotel' }))}
                        />
                        <span className="text-sm">Hotel ($25)</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name={`lodging-${hid}`}
                          value="Camp"
                          checked={lodgingChoices[hid] === 'Camp'}
                          onChange={() => setLodgingChoices(p => ({ ...p, [hid]: 'Camp' }))}
                        />
                        <span className="text-sm">Camp (Free)</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 mt-4">
              <button className="btn btn-sm btn-success" onClick={confirmEndDay}>
                Confirm & Start Day {(ts.day || 1) + 1}
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => setShowLodging(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== END TOWN STAY CONFIRMATION ====== */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-5 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-lg mb-2">Leave Town?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will end the current town stay. Heroes will leave town
              and the town stay state will be marked as inactive.
            </p>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-error" onClick={handleEndTownStay}>
                Leave Town
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => setShowEndConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== NEW TOWN STAY CONFIRMATION ====== */}
      {showNewStayConfirm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-5 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-lg mb-2">Start New Town Stay?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will reset everything: day counter, darkness track,
              all location events, visits, and modifiers.
            </p>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-success" onClick={handleStartNewStay}>
                Start Fresh
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => setShowNewStayConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
