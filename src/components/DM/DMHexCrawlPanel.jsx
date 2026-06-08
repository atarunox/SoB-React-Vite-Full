import React, { useState, useCallback } from 'react';
import { useHexCrawlSettings } from '../../hooks/useHexCrawlSettings';
import {
  TOWN_SIZE_TABLE,
  TOWN_SIZE_TABLE_NO_FT,
  TOWN_TYPE_TABLE,
  TOWN_KEYWORD_TABLE,
  TOWN_LOCATION_TABLE_FT,
  TOWN_LOCATION_TABLE_NO_FT,
  TOWN_TRAITS_CHART,
} from '../../data/hexcrawl/townSetup';

// ─── helpers ────────────────────────────────────────────────────────────────

function rollD(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function roll2D6() {
  return rollD(6) + rollD(6);
}

function rollD36() {
  const d1 = rollD(6);
  const d2 = rollD(6);
  return d1 * 10 + d2;
}

function lookupTownSize(roll, hasFT) {
  const table = hasFT ? TOWN_SIZE_TABLE : TOWN_SIZE_TABLE_NO_FT;
  return table.find(r => roll >= r.min && roll <= r.max) || table[0];
}

function lookupTownType(roll) {
  return TOWN_TYPE_TABLE.find(r => r.roll === roll) ||
         TOWN_TYPE_TABLE.find(r => r.roll <= roll) ||
         TOWN_TYPE_TABLE[0];
}

function lookupTownKeyword(roll) {
  return TOWN_KEYWORD_TABLE.find(r => r.roll === roll) || TOWN_KEYWORD_TABLE[0];
}

function lookupTownTrait(roll) {
  return TOWN_TRAITS_CHART.find(r => r.roll === roll);
}

function rollLocations(count, hasFT) {
  const table = hasFT ? TOWN_LOCATION_TABLE_FT : TOWN_LOCATION_TABLE_NO_FT;
  const sides = hasFT ? 12 : 6;
  const picked = new Set();
  const results = [];
  let attempts = 0;
  while (results.length < count && attempts < 50) {
    attempts++;
    const roll = rollD(sides);
    const entry = table.find(r => r.roll === roll);
    if (entry && !picked.has(entry.location)) {
      picked.add(entry.location);
      results.push(entry.location);
    }
  }
  return results;
}

// ─── Town Setup Wizard ──────────────────────────────────────────────────────

function TownSetupWizard() {
  const [hasFT, setHasFT] = useState(true);
  const [result, setResult] = useState(null);

  const generate = useCallback(() => {
    const sizeDie = hasFT ? rollD(8) : rollD(6);
    const sizeEntry = lookupTownSize(sizeDie, hasFT);
    const numLocations = hasFT
      ? sizeEntry.size === 4 ? rollD(4) : sizeEntry.size === 6 ? 4 + rollD(2) : 6 + rollD(2)
      : rollD(sizeEntry.size);

    let typeRoll = null;
    let typeEntry = null;
    let kwRoll = null;
    let kwEntry = null;

    if (hasFT) {
      typeRoll = roll2D6();
      typeEntry = lookupTownType(typeRoll);
    } else {
      kwRoll = rollD(8);
      kwEntry = lookupTownKeyword(kwRoll);
    }

    const traitCount = hasFT ? 1 : 2;
    const traits = [];
    for (let i = 0; i < traitCount; i++) {
      let roll = rollD36();
      let trait = lookupTownTrait(roll);
      let attempts = 0;
      while ((!trait || traits.find(t => t.roll === trait.roll)) && attempts < 20) {
        roll = rollD36();
        trait = lookupTownTrait(roll);
        attempts++;
      }
      if (trait) traits.push(trait);
    }

    const defaultLoc = hasFT ? null : kwEntry?.defaultLocation;
    const locationCount = Math.max(1, numLocations - (defaultLoc ? 1 : 0));
    const locations = rollLocations(locationCount, hasFT);
    if (defaultLoc && !locations.includes(defaultLoc)) {
      locations.unshift(defaultLoc);
    }

    setResult({
      sizeDie,
      sizeEntry,
      numLocations,
      typeRoll,
      typeEntry,
      kwRoll,
      kwEntry,
      traits,
      locations,
    });
  }, [hasFT]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="checkbox"
            checked={hasFT}
            onChange={e => setHasFT(e.target.checked)}
          />
          <span className="text-sm font-medium text-[#3b2f1d]">Using Frontier Town Expansion</span>
        </label>
      </div>

      <button
        className="btn btn-sm bg-[#3d2c1a] text-amber-200 border-[#8b6b46] hover:bg-[#5c3a1e]"
        onClick={generate}
      >
        Generate New Town
      </button>

      {result && (
        <div className="space-y-3 mt-2">
          {/* Size */}
          <div className="rounded border border-[#8b6b46]/40 p-3 bg-white/80 space-y-1">
            <div className="font-semibold text-[#3b2f1d] text-sm">
              Town Size — rolled {result.sizeDie} ({hasFT ? 'D8' : 'D6'})
            </div>
            <div className="text-sm text-[#3b2f1d]">
              <span className="font-bold">{result.sizeEntry.label}</span>
              {' '}· {result.numLocations} Location{result.numLocations !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Type or Keyword */}
          {hasFT ? (
            <div className="rounded border border-[#8b6b46]/40 p-3 bg-white/80 space-y-1">
              <div className="font-semibold text-[#3b2f1d] text-sm">
                Town Type — rolled {result.typeRoll} (2D6)
              </div>
              <div className="text-sm font-bold text-[#3b2f1d]">{result.typeEntry?.type}</div>
            </div>
          ) : (
            <div className="rounded border border-[#8b6b46]/40 p-3 bg-white/80 space-y-1">
              <div className="font-semibold text-[#3b2f1d] text-sm">
                Town Keyword — rolled {result.kwRoll} (D8)
              </div>
              <div className="text-sm font-bold text-[#3b2f1d]">{result.kwEntry?.keyword}</div>
              {result.kwEntry?.defaultLocation && (
                <div className="text-xs text-gray-600">Default location: {result.kwEntry.defaultLocation}</div>
              )}
            </div>
          )}

          {/* Traits */}
          {result.traits.length > 0 && (
            <div className="rounded border border-[#8b6b46]/40 p-3 bg-white/80 space-y-2">
              <div className="font-semibold text-[#3b2f1d] text-sm">
                Town Trait{result.traits.length > 1 ? 's' : ''} (D36)
              </div>
              {result.traits.map(t => (
                <div key={t.roll} className="space-y-0.5">
                  <div className="text-sm font-bold text-[#3b2f1d]">
                    <span className="text-gray-500 mr-1">{t.roll}</span> {t.name}
                  </div>
                  <div className="text-xs text-gray-600 leading-relaxed">{t.effect}</div>
                </div>
              ))}
            </div>
          )}

          {/* Locations */}
          <div className="rounded border border-[#8b6b46]/40 p-3 bg-white/80 space-y-1">
            <div className="font-semibold text-[#3b2f1d] text-sm">
              Town Locations ({hasFT ? 'D12' : 'D6'})
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {result.locations.map((loc, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-xs text-[#3b2f1d] font-medium">
                  {loc}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Town Traits Browser ─────────────────────────────────────────────────────

function TownTraitsBrowser() {
  const [search, setSearch] = useState('');
  const filtered = TOWN_TRAITS_CHART.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.effect.toLowerCase().includes(search.toLowerCase())
  );

  const [roll, setRoll] = useState(null);

  const rollTrait = () => {
    const r = rollD36();
    const trait = lookupTownTrait(r);
    setRoll({ r, trait });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          className="btn btn-sm bg-[#3d2c1a] text-amber-200 border-[#8b6b46] hover:bg-[#5c3a1e]"
          onClick={rollTrait}
        >
          Roll D36 Trait
        </button>
        <input
          type="text"
          placeholder="Search traits..."
          className="input input-sm input-bordered flex-1 bg-white/80 text-[#3b2f1d]"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {roll && (
        <div className="rounded border-2 border-amber-400 p-3 bg-amber-50 space-y-1">
          <div className="font-bold text-[#3b2f1d]">
            Rolled {roll.r} — {roll.trait ? roll.trait.name : 'Unknown'}
          </div>
          {roll.trait && <div className="text-sm text-gray-700">{roll.trait.effect}</div>}
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {filtered.map(t => (
          <div key={t.roll} className="rounded border border-[#8b6b46]/30 p-2 bg-white/70">
            <div className="text-sm font-semibold text-[#3b2f1d]">
              <span className="text-gray-500 mr-1">{t.roll}</span>{t.name}
            </div>
            <div className="text-xs text-gray-600 mt-0.5 leading-relaxed">{t.effect}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Placeholder panels for jobs/encounters (populated when agent data arrives) ──

function PlaceholderPanel({ label, settingKey }) {
  return (
    <div className="rounded border border-[#8b6b46]/30 p-4 bg-white/60 text-center text-sm text-gray-500">
      {label} data is loading from source books. This panel will be available soon.
    </div>
  );
}

// ─── Main Panel ─────────────────────────────────────────────────────────────

const HC_TABS = [
  { id: 'townSetup',   label: 'Town Setup' },
  { id: 'townTraits',  label: 'Town Traits' },
  { id: 'jobsBoard',   label: 'Jobs Board' },
  { id: 'terrainEnc',  label: 'Terrain Enc.' },
  { id: 'wildernessEnc', label: 'Wilderness' },
];

export default function DMHexCrawlPanel() {
  const { settings } = useHexCrawlSettings();
  const [tab, setTab] = useState(() => {
    try { return localStorage.getItem('dm_hexcrawl_tab') || 'townSetup'; } catch { return 'townSetup'; }
  });

  const switchTab = (id) => {
    setTab(id);
    try { localStorage.setItem('dm_hexcrawl_tab', id); } catch {}
  };

  return (
    <div className="space-y-3">
      {/* Sub-tab bar */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#8b6b46]/30 pb-2">
        {HC_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
              tab === t.id
                ? 'bg-[#3d2c1a] text-amber-200 border-[#8b6b46]'
                : 'bg-transparent text-[#5c3a1e] border-[#8b6b46]/40 hover:bg-[#f5ebd8]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'townSetup' && (
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-[#3b2f1d]">Town Setup Wizard</h3>
          <p className="text-xs text-gray-500">
            Generate a new Frontier Town for your HexCrawl campaign by rolling Town Size, Type/Keyword, Traits, and Locations.
          </p>
          {settings.townSetup ? (
            <TownSetupWizard />
          ) : (
            <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              Town Setup is disabled in HexCrawl Settings. Enable it in DM Options → Settings → HexCrawl Mode.
            </div>
          )}
        </div>
      )}

      {tab === 'townTraits' && (
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-[#3b2f1d]">Town Traits (D36)</h3>
          <p className="text-xs text-gray-500">
            Roll a D36 or browse all 36 Town Trait entries from the HexCrawl rules.
          </p>
          <TownTraitsBrowser />
        </div>
      )}

      {tab === 'jobsBoard' && (
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-[#3b2f1d]">Jobs Board (D100)</h3>
          <p className="text-xs text-gray-500">
            Roll D100 (2D10) and pick a Job from the rolled number ±1. Jobs are short-duration side-quests.
          </p>
          {settings.jobsBoard ? (
            <PlaceholderPanel label="Jobs Board" settingKey="jobsBoard" />
          ) : (
            <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              Jobs Board is disabled in HexCrawl Settings.
            </div>
          )}
        </div>
      )}

      {tab === 'terrainEnc' && (
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-[#3b2f1d]">Terrain Encounters (D20)</h3>
          <p className="text-xs text-gray-500">
            When an Encounter result is revealed while Searching, roll D20 on the matching terrain type chart.
          </p>
          {settings.terrainEncounters ? (
            <PlaceholderPanel label="Terrain Encounters" settingKey="terrainEncounters" />
          ) : (
            <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              Terrain Encounters is disabled in HexCrawl Settings.
            </div>
          )}
        </div>
      )}

      {tab === 'wildernessEnc' && (
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-[#3b2f1d]">Wilderness Encounters (D100)</h3>
          <p className="text-xs text-gray-500">
            At the start of each day, roll D8 (or D6 on foot) — on a 1 or 2, a Wilderness Encounter occurs. Roll D100 on this chart.
          </p>
          {settings.wildernessEncounters ? (
            <PlaceholderPanel label="Wilderness Encounters" settingKey="wildernessEncounters" />
          ) : (
            <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              Wilderness Encounters is disabled in HexCrawl Settings.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
