// src/components/DM/DMTab.jsx
import React, { useState, useEffect, useMemo } from 'react';
import DMDarknessDrawer from './DMDarknessDrawer';
import WorldDrawer from './WorldDrawer';
import DMEnemyPanel from './DMEnemyPanel';
import DMMapDrawer from './DMMapDrawer';
import DMEncounterDrawer from './DMEncounterDrawer';
import DMGrowingDreadDrawer from './DMGrowingDreadDrawer';
import DMChartPanel from './DMChartPanel';
import DMPlayerList from './DMPlayerList';
import TownPhaseTab from './TownPhaseTab';
import DMLootPoolPanel from './DMLootPoolPanel';
import DMTradePanel from './DMTradePanel';
import DMItemGenerator from './DMItemGenerator';
import DMHandPanel from './DMHandPanel';
import DMScanCards from './DMScanCards';
import DMTurnTracker from './DMTurnTracker';

import { usePosse } from '../../context/PosseContext';
import { useCombatState } from '../../hooks/useCombatState';
import { useWorld } from '../../context/WorldContext';

import { ENEMY_CARDS } from '../../data/enemyCards';
import { WORLD_CARDS_BY_CAMPAIGN } from '../../data/worldCards';
import { getActiveModifiers } from '../../utils/dynamicModifiers';

// --- Small wrappers to embed drawers and respect current world -------------
function MapWithWorld(props) {
  const { world } = useWorld();
  return (
    <div className="space-y-4">
      {/* Compact world control inline for convenience */}
      <WorldDrawer value={world} compact onChange={props.setWorld} />
      <DMMapDrawer {...props} world={world} />
    </div>
  );
}

function EncounterWithWorld(props) {
  const { world } = useWorld();
  return <DMEncounterDrawer {...props} world={world} />;
}

function PlayersWithConditions(props) {
  return (
    <div className="space-y-4">
      <DMPlayerList {...props} />
      <DMChartPanel {...props} />
    </div>
  );
}

// ------------------------ Options Panel ------------------------------------
function OptionsPanel({
  selectedCampaigns,
  setSelectedCampaigns,
  mergedWorldsCount,
}) {
  const ALL_KEYS = Object.keys(WORLD_CARDS_BY_CAMPAIGN);

  const isChecked = (k) => selectedCampaigns.includes(k);
  const toggle = (k) => {
    const next = isChecked(k)
      ? selectedCampaigns.filter(x => x !== k)
      : [...selectedCampaigns, k];
    setSelectedCampaigns(next);
  };

  const selectAll = () => setSelectedCampaigns([...ALL_KEYS]);
  const selectNone = () => setSelectedCampaigns([]);

  const nicename = (k) => ({
    cityOfTheAncients: 'City of the Ancients',
    forbiddenFortress: 'Forbidden Fortress',
    adventures: 'Adventures',
  }[k] || k);

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Options</h3>

      <div className="rounded-md border p-3 bg-white/80">
        <div className="font-semibold mb-2">World Sources (Campaigns)</div>
        <div className="flex flex-col gap-2">
          {ALL_KEYS.map((k) => {
            const count = (WORLD_CARDS_BY_CAMPAIGN[k] || []).length;
            return (
              <label key={k} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={isChecked(k)}
                  onChange={() => toggle(k)}
                />
                <span className="font-medium">{nicename(k)}</span>
                <span className="text-xs text-gray-600">({count} worlds)</span>
              </label>
            );
          })}
        </div>
        <div className="mt-3 flex gap-2">
          <button className="btn btn-sm" onClick={selectAll}>Select All</button>
          <button className="btn btn-sm btn-ghost" onClick={selectNone}>Clear</button>
        </div>

        <div className="mt-3 text-sm text-gray-700">
          Using <b>{mergedWorldsCount}</b> world{mergedWorldsCount === 1 ? '' : 's'} from selected campaigns.
        </div>
        <p className="mt-2 text-xs text-gray-500">
          These selections are saved locally and can be used by World/Encounter drawers to restrict what shows up.
        </p>
      </div>
    </div>
  );
}

// ---------------------------- Tabs list ------------------------------------
const TABS = [
  { id: 'players',      label: 'Players',          component: PlayersWithConditions },
  { id: 'initiative',   label: 'Initiative',       component: DMTurnTracker },
  { id: 'enemies',      label: 'Enemies',          component: DMEnemyPanel },
  { id: 'darkness',     label: 'Darkness',         component: DMDarknessDrawer },
  { id: 'growingDread', label: 'Growing Dread',    component: DMGrowingDreadDrawer },
  { id: 'map',          label: 'Map',              component: MapWithWorld },
  { id: 'encounters',   label: 'Encounters',       component: EncounterWithWorld },
  { id: 'loot',         label: 'Loot Pool',        component: DMLootPoolPanel },
  { id: 'trade',        label: 'Trade Items',      component: DMTradePanel },
  { id: 'itemGen',      label: 'Item Generator',   component: DMItemGenerator },
  { id: 'charts',       label: 'Charts',           component: DMChartPanel },
  { id: 'townPhase',    label: 'Town Phase',       component: TownPhaseTab },
  { id: 'scan',         label: 'Scan Cards',       component: DMScanCards },
  { id: 'options',      label: 'Options',          component: OptionsPanel },
];

function StableDrawer({ component: Component, ...props }) {
  if (!Component) {
    return <div className="text-center text-gray-600">No drawer selected.</div>;
  }
  return <Component {...props} />;
}

// ------------------------- Helpers -----------------------------------------
function calculateEliteAbilities(posse, modifiers = {}) {
  const highestLevel = Math.max(...(posse.map(h => Number(h.level || h.Level || 1) || 1)), 1);
  let baseElite = 0;
  if (highestLevel >= 7) baseElite = 3;
  else if (highestLevel >= 5) baseElite = 2;
  else if (highestLevel >= 3) baseElite = 1;

  // Drifter present?
  if (posse.some(h => /drifter/i.test(h?.class || h?.heroClass || ''))) baseElite++;

  // Party/global modifiers (e.g., from Darkness/Growing Dread that affect elite count)
  const modifierBonus = Object.values(modifiers?.partyModifiers || {}).reduce(
    (sum, mod) => sum + (Number(mod?.eliteModifier) || 0),
    0
  );
  return baseElite + modifierBonus;
}

// ------------------------- Main Component ----------------------------------
export default function DMTab({ showEndOfDayButton = false }) {
  // Persist current tab
  const [currentDrawer, setCurrentDrawer] = useState(
    () => localStorage.getItem('dm_current_drawer') || 'players'
  );
  useEffect(() => {
    const valid = new Set(TABS.map(t => t.id));
    if (!valid.has(currentDrawer)) {
      setCurrentDrawer('players');
      localStorage.setItem('dm_current_drawer', 'players');
    }
  }, [currentDrawer]);
  useEffect(() => {
    localStorage.setItem('dm_current_drawer', currentDrawer);
  }, [currentDrawer]);

  // Keep visited tabs mounted so state persists across tab switches
  const [mountedTabs, setMountedTabs] = useState(() => new Set([currentDrawer]));
  useEffect(() => {
    setMountedTabs(prev => {
      if (prev.has(currentDrawer)) return prev;
      const next = new Set(prev);
      next.add(currentDrawer);
      return next;
    });
  }, [currentDrawer]);

  // World context (single source of truth)
  const { world, setWorld } = useWorld();

  // Campaign selection (persisted)
  const [selectedCampaigns, setSelectedCampaigns] = useState(() => {
    try {
      const raw = localStorage.getItem('dm_campaigns');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) return arr;
      }
    } catch {}
    return ['cityOfTheAncients'];
  });
  useEffect(() => {
    localStorage.setItem('dm_campaigns', JSON.stringify(selectedCampaigns));
  }, [selectedCampaigns]);

  // Merged worlds for the selected campaigns (handy to pass to drawers)
  const mergedWorlds = useMemo(() => {
    const lists = selectedCampaigns.map(k => WORLD_CARDS_BY_CAMPAIGN[k] || []);
    return lists.flat();
  }, [selectedCampaigns]);

  // Persist auto-loot toggle (used by Loot Pool)
  const [autoLootEnabledState, setAutoLootEnabledState] = useState(
    () => localStorage.getItem('dm_auto_loot') === '1'
  );
  useEffect(() => {
    localStorage.setItem('dm_auto_loot', autoLootEnabledState ? '1' : '0');
  }, [autoLootEnabledState]);

  const { posse, updateHero } = usePosse();

  // Derived seeds (memoized; avoids re-renders + keeps hook order stable)
  const posseCount = posse.length;
  const highestHeroLevel = useMemo(() => {
    if (!posseCount) return 1;
    return Math.max(...posse.map(h => Number(h?.level || h?.Level || 1) || 1));
  }, [posseCount, posse]);

  const drifterInPosse = useMemo(
    () => posse.some(h => /drifter/i.test(h?.class || h?.heroClass || '')),
    [posse]
  );

  // Combat state
  const combat = useCombatState();
  const {
    combatGroups, setCombatGroups, addGroup, removeGroup, clearCombat,
    darkness, setDarkness, addDarkness, removeDarkness,
    growingDread, setGrowingDread, addGrowingDread, removeGrowingDread
  } = combat;

  // Load saved combat groups (legacy shim)
  useEffect(() => {
    const saved = localStorage.getItem('combatGroups');
    if (saved) {
      try {
        setCombatGroups(JSON.parse(saved));
      } catch {
        console.warn('Failed to parse combatGroups from localStorage');
      }
    }
  }, [setCombatGroups]);

  // Elite ability count reflects combat modifiers; use proper signature
  const [eliteAbilities, setEliteAbilities] = useState(0);
  useEffect(() => {
    // getActiveModifiers expects combat state; returns synchronous/array in our utils
    const modifiers = getActiveModifiers(combat) || {};
    const elite = calculateEliteAbilities(posse, modifiers);
    setEliteAbilities(elite);
  }, [posse, world, combat]);

  // Start Next Day: clear per-day hero flags; townState rollover is handled in TownPhase
  const startNextDay = () => {
    const roster = posse.map(h => h.id || h.localId).filter(Boolean);
    roster.forEach(id => {
      updateHero({
        id,
        lodging: '',
        chosenLocation: '',
        isDone: false,
      });
    });
  };

  // ---- Render --------------------------------------------------------------
  return (
    <div className="p-4 max-w-screen-lg mx-auto bg-parchment min-h-screen relative">
      {/* Header / Summary */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Dungeon Master</h1>
          <span className="text-xs px-2 py-1 rounded-full border bg-slate-50">
            Posse: {posseCount} • Highest Lvl: {highestHeroLevel}{' '}
            {drifterInPosse ? '• Drifter present' : ''}
          </span>
        </div>

        {/* World selector bound to WorldContext */}
        <div className="flex items-center gap-2">
          <WorldDrawer value={world} onChange={setWorld} compact />
          <button
            className="btn btn-sm btn-warning"
            onClick={startNextDay}
            title="Clear lodging/choice so Town resets for everyone"
          >
            Start Next Day
          </button>
        </div>
      </div>

      {/* Active Modifiers overview */}
      <div className="p-3 border rounded bg-white/60 mb-3">
        <div className="text-sm font-medium mb-2">Active Modifiers</div>
        {(() => {
          const list = (getActiveModifiers(combat)?.list || getActiveModifiers(combat) || []);
          return Array.isArray(list) && list.length ? (
            <ul className="list-disc ml-5 space-y-1 text-sm">
              {list.map((m, i) => (
                <li key={i}>
                  {m?.name || 'Modifier'} {m?.summary ? `— ${m.summary}` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-slate-600">None</div>
          );
        })()}
      </div>

      {/* DM Hand - always visible when cards are held */}
      <DMHandPanel globalModifiers={getActiveModifiers(combat)?.list || []} />

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 justify-center mb-4 border-b pb-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentDrawer(tab.id)}
            className={`btn btn-sm ${currentDrawer === tab.id ? 'btn-primary' : 'btn-outline'}`}
          >
            {tab.label || tab.id}
          </button>
        ))}
      </div>

      {/* Panels (keep mounted) */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        {TABS.map(tab => {
          if (!mountedTabs.has(tab.id)) return null; // not visited yet
          const Comp = tab.component;

          // Shared props available to all drawers; ignoring extras is harmless
          const sharedCampaignProps = {
            selectedCampaigns,
            mergedWorlds,
            setSelectedCampaigns,
            autoLootEnabled: autoLootEnabledState,
          };

          return (
            <div
              key={tab.id}
              style={{ display: currentDrawer === tab.id ? 'block' : 'none' }}
            >
              <StableDrawer
                component={Comp}
                // Posse / heroes
                posse={posse}
                updateHero={updateHero}
                // World
                world={world}
                setWorld={setWorld}
                // Combat state
                combatGroups={combatGroups}
                setCombatGroups={setCombatGroups}
                addGroup={addGroup}
                removeGroup={removeGroup}
                clearCombat={clearCombat}
                darkness={darkness}
                setDarkness={setDarkness}
                addDarkness={addDarkness}
                removeDarkness={removeDarkness}
                growingDread={growingDread}
                setGrowingDread={setGrowingDread}
                addGrowingDread={addGrowingDread}
                removeGrowingDread={removeGrowingDread}
                // Drawer niceties
                showStatsButton={currentDrawer === 'enemies'}
                // Options / campaigns
                {...sharedCampaignProps}
                mergedWorldsCount={mergedWorlds.length}
                // FYI (some panels may want to show this):
                eliteAbilities={eliteAbilities}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
