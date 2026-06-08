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
import { JOBS_BOARD } from '../../data/hexcrawl/jobsBoard';
import { WILDERNESS_ENCOUNTERS } from '../../data/hexcrawl/wildernessEncounters';
import { mountainEncounters } from '../../data/encounters/mountainEncounters';
import { plainsEncounters } from '../../data/encounters/plainsEncounters';
import { railroadEncounters } from '../../data/encounters/railroadEncounters';
import { forestEncounters } from '../../data/encounters/forestEncounters';
import { desertEncounters } from '../../data/encounters/desertEncounters';
import { mineTerrainEncounters } from '../../data/encounters/mineTerrainEncounters';
import { riverEncounters } from '../../data/encounters/riverEncounters';
import { roadEncounters } from '../../data/encounters/roadEncounters';
import { swampEncounters } from '../../data/encounters/swampEncounters';
import { townEncounters } from '../../data/encounters/townEncounters';
import { townRuinsEncounters } from '../../data/encounters/townRuinsEncounters';
import { growingDreadEncounters } from '../../data/encounters/growingDreadEncounters';

const TERRAIN_TABLES = [
  { id: 'desert',       label: 'Desert',          data: desertEncounters },
  { id: 'forest',       label: 'Forest',           data: forestEncounters },
  { id: 'growingDread', label: 'Growing Dread',    data: growingDreadEncounters },
  { id: 'mine',         label: 'Mine',             data: mineTerrainEncounters },
  { id: 'mountain',     label: 'Mountain',         data: mountainEncounters },
  { id: 'plains',       label: 'Plains',           data: plainsEncounters },
  { id: 'railroad',     label: 'Railroad',         data: railroadEncounters },
  { id: 'river',        label: 'River',            data: riverEncounters },
  { id: 'road',         label: 'Road',             data: roadEncounters },
  { id: 'swamp',        label: 'Swamp',            data: swampEncounters },
  { id: 'town',         label: 'Town',             data: townEncounters },
  { id: 'townRuins',    label: 'Town Ruins',       data: townRuinsEncounters },
];

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

// ─── Encounter Entry Display ─────────────────────────────────────────────────

function EncounterEntry({ entry, rollLabel }) {
  if (!entry) return null;
  return (
    <div className="rounded border-2 border-amber-400 p-3 bg-amber-50 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs text-gray-500 font-mono mr-1">{rollLabel ?? entry.roll}</span>
          <span className="font-bold text-[#3b2f1d]">{entry.name}</span>
        </div>
        <div className="flex flex-wrap gap-1 justify-end">
          {(entry.tags ?? []).map(t => (
            <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-[#3d2c1a]/10 text-[#3d2c1a] font-medium">{t}</span>
          ))}
        </div>
      </div>
      {entry.flavor && (
        <p className="text-xs text-gray-600 italic leading-relaxed">{entry.flavor}</p>
      )}
      {entry.test && (
        <div className="rounded bg-yellow-100 border border-yellow-300 p-2 text-xs space-y-1">
          <div className="font-semibold text-[#3b2f1d]">
            {entry.test.stat} {entry.test.target}
            {entry.test.alt && ` or ${entry.test.alt.stat} ${entry.test.alt.target}`}
          </div>
          {entry.test.success?.map((s, i) => (
            <div key={i} className="text-green-800">✓ {s}</div>
          ))}
          {entry.test.fail?.map((f, i) => (
            <div key={i} className="text-red-800">✗ {f}</div>
          ))}
        </div>
      )}
      {entry.effect && (
        <p className="text-xs text-gray-700 leading-relaxed">{entry.effect}</p>
      )}
      {entry.table && (
        <div className="rounded bg-white/80 border border-[#8b6b46]/30 p-2 text-xs space-y-0.5">
          {entry.table.map((row, i) => (
            <div key={i}><span className="font-mono text-gray-500 mr-1">{row.roll}</span>{row.text}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Jobs Board Panel ────────────────────────────────────────────────────────

function JobsBoardPanel() {
  const [results, setResults] = useState(null);
  const [search, setSearch] = useState('');

  const roll = useCallback(() => {
    const idx = Math.floor(Math.random() * 100);
    const prev = (idx - 1 + 100) % 100;
    const next = (idx + 1) % 100;
    const get = i => JOBS_BOARD.find(j => parseInt(j.roll, 10) === i) || JOBS_BOARD[i];
    setResults({ main: get(idx), prev: get(prev), next: get(next), rolled: idx });
  }, []);

  const filtered = search
    ? JOBS_BOARD.filter(j =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.keywords.some(k => k.toLowerCase().includes(search.toLowerCase())) ||
        (j.location ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : null;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <button
          className="btn btn-sm bg-[#3d2c1a] text-amber-200 border-[#8b6b46] hover:bg-[#5c3a1e]"
          onClick={roll}
        >
          Roll D100 (3 Jobs)
        </button>
        <input
          type="text"
          placeholder="Search jobs..."
          className="input input-sm input-bordered flex-1 bg-white/80 text-[#3b2f1d] min-w-0"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {results && !search && (
        <div className="space-y-2">
          <div className="text-xs text-gray-500">Rolled {String(results.rolled).padStart(2, '0')} — showing ±1 range</div>
          {[results.prev, results.main, results.next].map((job, i) => (
            <div key={i} className={`rounded border p-3 space-y-1.5 text-xs ${i === 1 ? 'border-2 border-amber-500 bg-amber-50' : 'border-[#8b6b46]/40 bg-white/80'}`}>
              <div className="flex flex-wrap items-start justify-between gap-1">
                <div>
                  <span className="font-mono text-gray-500 mr-1">{job.roll}</span>
                  <span className="font-bold text-[#3b2f1d] text-sm">{job.title}</span>
                  {job.mandatory && <span className="ml-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">MANDATORY</span>}
                </div>
                <div className="flex flex-wrap gap-1">
                  {job.keywords.map(k => (
                    <span key={k} className="px-1.5 py-0.5 rounded bg-[#3d2c1a]/10 text-[#3d2c1a] text-[10px] font-medium">{k}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 text-gray-600">
                <span><strong>Location:</strong> {job.location}</span>
                <span><strong>Time:</strong> {job.timeLimit}</span>
              </div>
              <p className="text-gray-700 leading-relaxed">{job.description}</p>
              <div className="rounded bg-green-50 border border-green-200 p-1.5 text-green-800">
                <strong>Reward:</strong> {job.reward}
              </div>
              {job.failure && (
                <div className="rounded bg-red-50 border border-red-200 p-1.5 text-red-800">
                  <strong>Failure:</strong> {job.failure}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {filtered && (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {filtered.length === 0 && <div className="text-sm text-gray-500">No jobs match.</div>}
          {filtered.map(job => (
            <div key={job.roll} className="rounded border border-[#8b6b46]/30 p-2 bg-white/70 text-xs space-y-1">
              <div className="flex flex-wrap items-start justify-between gap-1">
                <div>
                  <span className="font-mono text-gray-500 mr-1">{job.roll}</span>
                  <span className="font-semibold text-[#3b2f1d]">{job.title}</span>
                  {job.mandatory && <span className="ml-2 px-1 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">MANDATORY</span>}
                </div>
                <div className="flex flex-wrap gap-1">
                  {job.keywords.map(k => (
                    <span key={k} className="px-1 py-0.5 rounded bg-[#3d2c1a]/10 text-[#3d2c1a] text-[10px]">{k}</span>
                  ))}
                </div>
              </div>
              <div className="text-gray-500">{job.location} · {job.timeLimit}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Terrain Encounters Panel ────────────────────────────────────────────────

function TerrainEncountersPanel() {
  const [terrain, setTerrain] = useState('mountain');
  const [result, setResult] = useState(null);
  const [search, setSearch] = useState('');

  const table = TERRAIN_TABLES.find(t => t.id === terrain);

  const roll = useCallback(() => {
    if (!table) return;
    const idx = Math.floor(Math.random() * table.data.length);
    const entry = table.data[idx];
    setResult({ entry, rolled: entry.roll });
    setSearch('');
  }, [table]);

  const filtered = search && table
    ? table.data.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.flavor ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (e.effect ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : null;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <select
          className="select select-sm select-bordered bg-white/80 text-[#3b2f1d]"
          value={terrain}
          onChange={e => { setTerrain(e.target.value); setResult(null); setSearch(''); }}
        >
          {TERRAIN_TABLES.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
        <button
          className="btn btn-sm bg-[#3d2c1a] text-amber-200 border-[#8b6b46] hover:bg-[#5c3a1e]"
          onClick={roll}
        >
          Roll D20
        </button>
        <input
          type="text"
          placeholder="Search encounters..."
          className="input input-sm input-bordered flex-1 bg-white/80 text-[#3b2f1d] min-w-0"
          value={search}
          onChange={e => { setSearch(e.target.value); setResult(null); }}
        />
      </div>

      {result && !search && (
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Rolled {result.rolled} on {table?.label} table</div>
          <EncounterEntry entry={result.entry} />
        </div>
      )}

      {filtered && (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {filtered.length === 0 && <div className="text-sm text-gray-500">No encounters match.</div>}
          {filtered.map(e => (
            <div key={e.roll} className="rounded border border-[#8b6b46]/30 p-2 bg-white/70 text-xs">
              <span className="font-mono text-gray-500 mr-1">{e.roll}</span>
              <span className="font-semibold text-[#3b2f1d]">{e.name}</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {(e.tags ?? []).map(t => (
                  <span key={t} className="px-1 py-0.5 rounded bg-[#3d2c1a]/10 text-[#3d2c1a] text-[10px]">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!result && !filtered && table && (
        <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
          {table.data.map(e => (
            <div key={e.roll} className="rounded border border-[#8b6b46]/30 p-2 bg-white/70 text-xs">
              <span className="font-mono text-gray-500 mr-1">{e.roll}</span>
              <span className="font-semibold text-[#3b2f1d]">{e.name}</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {(e.tags ?? []).map(t => (
                  <span key={t} className="px-1 py-0.5 rounded bg-[#3d2c1a]/10 text-[#3d2c1a] text-[10px]">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Wilderness Encounters Panel ─────────────────────────────────────────────

function WildernessEncountersPanel() {
  const [result, setResult] = useState(null);
  const [search, setSearch] = useState('');

  const roll = useCallback(() => {
    const idx = Math.floor(Math.random() * 100);
    const entry = WILDERNESS_ENCOUNTERS[idx];
    setResult({ entry, rolled: String(idx).padStart(2, '0') });
    setSearch('');
  }, []);

  const filtered = search
    ? WILDERNESS_ENCOUNTERS.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.flavor ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (e.tags ?? []).some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : null;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <button
          className="btn btn-sm bg-[#3d2c1a] text-amber-200 border-[#8b6b46] hover:bg-[#5c3a1e]"
          onClick={roll}
        >
          Roll D100
        </button>
        <input
          type="text"
          placeholder="Search wilderness encounters..."
          className="input input-sm input-bordered flex-1 bg-white/80 text-[#3b2f1d] min-w-0"
          value={search}
          onChange={e => { setSearch(e.target.value); setResult(null); }}
        />
      </div>

      {result && !search && (
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Rolled {result.rolled}</div>
          <EncounterEntry entry={result.entry} />
        </div>
      )}

      {filtered && (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {filtered.length === 0 && <div className="text-sm text-gray-500">No encounters match.</div>}
          {filtered.map(e => (
            <div key={e.roll} className="rounded border border-[#8b6b46]/30 p-2 bg-white/70 text-xs">
              <span className="font-mono text-gray-500 mr-1">{e.roll}</span>
              <span className="font-semibold text-[#3b2f1d]">{e.name}</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {(e.tags ?? []).map(t => (
                  <span key={t} className="px-1 py-0.5 rounded bg-[#3d2c1a]/10 text-[#3d2c1a] text-[10px]">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
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
            <JobsBoardPanel />
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
            <TerrainEncountersPanel />
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
            <WildernessEncountersPanel />
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
