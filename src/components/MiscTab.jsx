// src/components/MiscTab.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useHero } from '../context/HeroContext';
import { usePosse } from '../context/PosseContext';
import { useCombatState } from '../hooks/useCombatState';
import ReferenceLibrary from './ReferenceLibrary';
import CreateHero from './CreateHero';
import { useUIScale, BUTTON_SIZES } from '../context/UIScaleContext';

// ---------- helpers ----------
const storageKeyFromId = (id) => `hero_${id}`;
const idFromStorageKey = (key) => (key?.startsWith('hero_') ? key.slice(5) : key);
const normalizeId = (raw) => {
  if (!raw) return '';
  const s = String(raw);
  return s.startsWith('hero_') ? s.slice(5) : s;
};
const getId = (h) => normalizeId(h?.id || h?.localId || '');

// duplicate grouping helpers
function normalKey(h) {
  const name = (h.name || h.heroName || '').trim().toLowerCase();
  const klass = (h.heroClass || '').trim().toLowerCase();
  return `${name}|${klass}`;
}
function timestampOf(h) {
  return Number(h.updatedAt || h.createdAt || h.timestamp || 0);
}

// --- Firestore delete (best-effort; safe if Firebase isn't present) ---
import { db, localMode } from '../firebase/firebaseConfig';
import { doc as fsDoc, deleteDoc } from 'firebase/firestore';

async function deleteHeroFromCloud(id) {
  if (!id || localMode || !db) return false;

  try {
    await deleteDoc(fsDoc(db, 'heroes', id));
    return true;
  } catch {
    return false;
  }
}

// --- NEW (keys): strictly-unique, stable key factory ---
function makeKeyFactory() {
  const seen = new Map(); // base -> count
  return (base, idx) => {
    const keyBase = base ?? 'noid';
    const n = seen.get(keyBase) ?? 0;
    seen.set(keyBase, n + 1);
    return `hero:${keyBase}:${n}`; // hero:abc:0, hero:abc:1, ...
  };
}
const uniqueKeyForHero = makeKeyFactory();

export default function MiscTab() {
  const { hero, setHero } = useHero();
  const { posse, addHero, removeHero } = usePosse();
  const { darkness, growingDread } = useCombatState();
  const { scale, setScale, buttonSize, setButtonSize } = useUIScale();

  // UI state
  const [heroList, setHeroList] = useState([]);            // [{...hero, _lsKey}]
  const [selectedKey, setSelectedKey] = useState('');      // actual LS key 'hero_<id>'
  const [showLibrary, setShowLibrary] = useState(false);
  const [posseAddId, setPosseAddId] = useState('');        // normalized id
  const [showCreateHero, setShowCreateHero] = useState(false);

  const [showHeroMgmt, setShowHeroMgmt] = useState(false);
  const [showPosse, setShowPosse] = useState(false);
  const [showActiveEffects, setShowActiveEffects] = useState(false);

  // -------- load / normalize existing heroes from localStorage --------
  const refreshHeroList = () => {
    const out = [];
    const keys = Object.keys(localStorage);
    let heroKeyCount = 0;

    for (const lsKey of keys) {
      if (!lsKey.startsWith('hero_')) continue;
      heroKeyCount++;

      const raw = localStorage.getItem(lsKey);
      if (!raw) continue;

      try {
        const h = JSON.parse(raw);
        if (!h) continue;

        const storedId = idFromStorageKey(lsKey);
        const objIdRaw = (h.id ?? h.localId ?? '').toString();
        const normId = objIdRaw ? normalizeId(objIdRaw) : storedId;

        if (normId !== objIdRaw || !h.id || !h.localId) {
          const patched = { ...h, id: normId, localId: normId };
          localStorage.setItem(lsKey, JSON.stringify(patched));
          out.push({ ...patched, _lsKey: lsKey });
        } else {
          out.push({ ...h, _lsKey: lsKey });
        }
      } catch (e) {
        console.warn('[MiscTab] bad JSON in', lsKey, e);
      }
    }

    // If nothing found under hero_* keys, try to migrate from PosseContext and cache
    if (heroKeyCount === 0 && out.length === 0) {
      const toSeed = [];
      if (Array.isArray(posse) && posse.length) {
        toSeed.push(...posse);
      }
      try {
        const cacheRaw = localStorage.getItem('posse.heroes.v1');
        const cached = cacheRaw ? JSON.parse(cacheRaw) : [];
        if (Array.isArray(cached) && cached.length) {
          toSeed.push(...cached);
        }
      } catch {}

      if (toSeed.length) {
        const seen = new Set();
        for (const h of toSeed) {
          const id = normalizeId(h?.id || h?.localId);
          if (!id || seen.has(id)) continue;
          seen.add(id);
          const key = storageKeyFromId(id);
          const obj = { ...h, id, localId: id, updatedAt: Date.now() };
          try {
            localStorage.setItem(key, JSON.stringify(obj));
            out.push({ ...obj, _lsKey: key });
          } catch (e) {
            console.warn('[MiscTab] seed write failed for', key, e);
          }
        }
      }
    }

    out.sort((a, b) => (a.name || a.heroName || '').localeCompare(b.name || b.heroName || ''));
    setHeroList(out);
  };

  useEffect(() => {
    refreshHeroList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- per-hero actions ----------
  const handleDelete = async (e) => {
    // prevent form submit swallowing the click
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (!selectedKey) return;
    const id = idFromStorageKey(selectedKey);
    if (!window.confirm('Delete this hero from local storage and cloud?')) return;

    // NEW: best-effort cloud delete (silent if firebase not present)
    try { await deleteHeroFromCloud(id); } catch {}

    // Remove from localStorage
    localStorage.removeItem(selectedKey);

    // clear active/posse if needed
    if (hero && getId(hero) === id) setHero(null);
    if (posse?.some((h) => getId(h) === id)) removeHero(id);

    setSelectedKey('');
    refreshHeroList();
  };

  const handleExport = () => {
    if (!selectedKey) return;
    const raw = localStorage.getItem(selectedKey);
    if (!raw) return;

    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedKey}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const incomingId = normalizeId(data?.id || data?.localId);
        if (!incomingId) {
          alert('Invalid hero file: missing id.');
          return;
        }
        const exists = heroList.some((h) => getId(h) === incomingId);
        if (exists) {
          alert('A hero with this ID already exists.');
          return;
        }
        const key = storageKeyFromId(incomingId);
        const toSave = { ...data, id: incomingId, localId: incomingId, updatedAt: Date.now() };
        localStorage.setItem(key, JSON.stringify(toSave));
        refreshHeroList();
        setSelectedKey(key);
        alert('Hero imported successfully.');
      } catch {
        alert('Failed to import hero.');
      }
    };
    reader.readAsText(file);
  };

  // ---------- backup / restore all ----------
  const exportAllHeroes = () => {
    const items = [];
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith('hero_')) continue;
      try {
        const h = JSON.parse(localStorage.getItem(key));
        if (h && (h.id || h.localId)) items.push(h);
      } catch {}
    }
    const payload = { type: 'sos-heroes-backup', version: 1, exportedAt: Date.now(), heroes: items };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const a = document.createElement('a');
    a.href = url;
    a.download = `heroes-backup-${ts}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const payload = JSON.parse(ev.target.result);
        const arr = Array.isArray(payload) ? payload : (Array.isArray(payload.heroes) ? payload.heroes : []);
        if (!arr.length) {
          alert('No heroes found in backup.');
          return;
        }
        let added = 0, skipped = 0;
        const existingIds = new Set(heroList.map((h) => getId(h)).filter(Boolean));

        for (const h of arr) {
          const id = normalizeId(h?.id || h?.localId);
          if (!id || existingIds.has(id)) { skipped++; continue; }
          const toSave = { ...h, id, localId: id };
          localStorage.setItem(storageKeyFromId(id), JSON.stringify(toSave));
          existingIds.add(id);
          added++;
        }
        refreshHeroList();
        alert(`Import complete. Added ${added}, skipped ${skipped}.`);
      } catch {
        alert('Failed to import backup.');
      }
    };
    reader.readAsText(file);
  };

  // ---------- purge duplicates (keep newest by name/class) ----------
  const purgeDuplicateLocalHeroes = () => {
    const groups = new Map(); // groupKey -> [{lsKey, hero}]
    for (const lsKey of Object.keys(localStorage)) {
      if (!lsKey.startsWith('hero_')) continue;
      try {
        const h = JSON.parse(localStorage.getItem(lsKey));
        if (!h) continue;
        const k = normalKey(h);
        const groupKey = k === '|' ? (getId(h) || idFromStorageKey(lsKey)) : k; // fallback
        if (!groups.has(groupKey)) groups.set(groupKey, []);
        groups.get(groupKey).push({ lsKey, hero: h });
      } catch {}
    }

    const toDelete = [];
    for (const [, arr] of groups) {
      if (arr.length <= 1) continue;
      arr.sort((a, b) => timestampOf(b.hero) - timestampOf(a.hero));
      for (let i = 1; i < arr.length; i++) toDelete.push(arr[i].lsKey);
    }

    if (!toDelete.length) {
      alert('No duplicates found (by name/class).');
      return;
    }
    if (!window.confirm(`Delete ${toDelete.length} duplicate entr${toDelete.length === 1 ? 'y' : 'ies'}?`)) return;

    const deletedIds = new Set();
    for (const k of toDelete) {
      try {
        const h = JSON.parse(localStorage.getItem(k));
        const id = getId(h);
        if (id) deletedIds.add(id);
      } catch {}
    }

    for (const k of toDelete) localStorage.removeItem(k);

    if (hero && deletedIds.has(getId(hero))) setHero(null);
    if (Array.isArray(posse)) {
      posse.forEach((h) => {
        const id = getId(h);
        if (deletedIds.has(id)) removeHero(id);
      });
    }

    setSelectedKey('');
    refreshHeroList();
    alert('Duplicates purged.');
  };

  // ---------- derived lists ----------
  const availableForPosse = useMemo(() => {
    const posseIds = new Set((posse || []).map(getId).filter(Boolean));
    return heroList.filter((h) => !posseIds.has(getId(h)));
  }, [heroList, posse]);

  // --- keys: dedupe posse rendering to avoid accidental duplicates ---
  const posseDedupe = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const h of (posse || [])) {
      const id = getId(h) ?? 'noid';
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(h);
    }
    return out;
  }, [posse]);

  // ---------- other handlers ----------
  const handleSetActive = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (!selectedKey) return;
    const raw = localStorage.getItem(selectedKey);
    if (!raw) return;
    try {
      const obj = JSON.parse(raw);
      const id = normalizeId(obj.id || obj.localId);
      setHero({ ...obj, id, localId: id });
    } catch {
      alert('Failed to load hero.');
    }
  };

  // ---------- render ----------
  return (
    <div className="p-4 space-y-6">
      {/* UI Scale & Button Size */}
      <div className="border rounded-xl p-4 bg-white/80 space-y-4">
        {/* --- UI Scale --- */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm">UI Scale</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(scale * 100)}%</span>
          </div>

          {/* Preset buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: '75%', value: 0.75 },
              { label: '90%', value: 0.9 },
              { label: '100%', value: 1 },
              { label: '110%', value: 1.1 },
              { label: '125%', value: 1.25 },
            ].map((preset) => (
              <button
                key={preset.value}
                className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
                  Math.round(scale * 100) === Math.round(preset.value * 100)
                    ? 'bg-[#5c3a1e] text-white border-[#5c3a1e]'
                    : 'bg-[#f5f0da] text-[#5c3a1e] border-[#5c3a1e]/40 hover:bg-[#f6e7c1]'
                }`}
                onClick={() => setScale(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Slider with - / + buttons */}
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-md border border-[#5c3a1e]/40 bg-[#f5f0da] text-[#5c3a1e] font-bold text-lg hover:bg-[#f6e7c1]"
              onClick={() => setScale(Math.round((scale - 0.05) * 100) / 100)}
              disabled={scale <= 0.5}
            >
              &minus;
            </button>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="flex-1 accent-[#5c3a1e]"
            />
            <button
              className="w-8 h-8 flex items-center justify-center rounded-md border border-[#5c3a1e]/40 bg-[#f5f0da] text-[#5c3a1e] font-bold text-lg hover:bg-[#f6e7c1]"
              onClick={() => setScale(Math.round((scale + 0.05) * 100) / 100)}
              disabled={scale >= 1.5}
            >
              +
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#5c3a1e]/20" />

        {/* --- Button Size --- */}
        <div className="space-y-2">
          <span className="font-bold text-sm">Button Size</span>
          <div className="flex items-center gap-2">
            {BUTTON_SIZES.map((size) => (
              <button
                key={size}
                className={`px-4 py-1.5 rounded-md border text-sm font-medium transition-colors ${
                  buttonSize === size
                    ? 'bg-[#5c3a1e] text-white border-[#5c3a1e]'
                    : 'bg-[#f5f0da] text-[#5c3a1e] border-[#5c3a1e]/40 hover:bg-[#f6e7c1]'
                }`}
                onClick={() => setButtonSize(size)}
              >
                {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">Changes the size of all buttons throughout the app.</p>
        </div>
      </div>

      {/* tiny diagnostics */}
      <div className="text-xs text-gray-300">
        Heroes found: {heroList.length}&nbsp;
        <button
          className="btn btn-xs"
          onClick={() => {
            console.log('[MiscTab] keys', Object.keys(localStorage));
            const sampleKey = Object.keys(localStorage).find(k => k.startsWith('hero_'));
            if (sampleKey) {
              try {
                console.log('[MiscTab] sample hero', sampleKey, JSON.parse(localStorage.getItem(sampleKey)));
              } catch {}
            } else {
              const cache = localStorage.getItem('posse.heroes.v1');
              console.log('[MiscTab] posse cache', cache ? JSON.parse(cache) : cache);
            }
            refreshHeroList();
          }}
        >
          Rescan & Log
        </button>
      </div>

      {/* --- Hero Management toggle --- */}
      <button
        className="btn bg-gray-700 text-white"
        onClick={() => setShowHeroMgmt((v) => !v)}
      >
        {showHeroMgmt ? 'Hide' : 'Show'} Hero Management
      </button>

      {showHeroMgmt && (
        <div className="space-y-3 border rounded-xl p-3 bg-white/80">
          <h2 className="text-xl font-bold">Hero Management</h2>

          <button
            className="btn bg-[#5C3A21] text-white"
            onClick={() => setShowCreateHero(true)}
          >
            Create a New Hero
          </button>

          {showCreateHero && (
            <CreateHero
              onCreate={(newHero) => {
                const baseId = normalizeId(getId(newHero) || (crypto?.randomUUID?.() || `h_${Date.now()}`));
                const saved = {
                  ...newHero,
                  id: baseId,
                  localId: baseId,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                };
                const savedKey = storageKeyFromId(baseId);
                localStorage.setItem(savedKey, JSON.stringify(saved));
                refreshHeroList();
                addHero(saved);
                setShowCreateHero(false);
                setSelectedKey(savedKey);
              }}
              onCancel={() => setShowCreateHero(false)}
            />
          )}

          {/* Select + set active */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="select"
            >
              <option value="">Select a hero to manage</option>
              {heroList.map((h) => {
                const id = getId(h);
                return (
                  <option key={h._lsKey || id} value={h._lsKey || storageKeyFromId(id)}>
                    {h.name || h.heroName || h.heroClass || id}
                  </option>
                );
              })}
            </select>

            <button type="button" onClick={handleSetActive} disabled={!selectedKey} className="btn">
              Set Active
            </button>
          </div>

          {/* Per-hero actions */}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleDelete} disabled={!selectedKey} className="btn bg-red-600 text-white">
              Delete
            </button>
            <button type="button" onClick={handleExport} disabled={!selectedKey} className="btn bg-blue-600 text-white">
              Export
            </button>
            <label className="btn bg-green-600 text-white cursor-pointer">
              Import
              <input type="file" accept=".json" onChange={handleImport} hidden />
            </label>
          </div>

          {/* Backup/restore all + purge dups */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <button className="btn bg-blue-700 text-white" onClick={exportAllHeroes}>
              Export All (Backup)
            </button>
            <label className="btn bg-green-700 text-white cursor-pointer">
              Import Backup
              <input type="file" accept=".json" onChange={importBackup} hidden />
            </label>
            <button className="btn bg-amber-600 text-white" onClick={purgeDuplicateLocalHeroes}>
              Purge Duplicates (by name/class)
            </button>
          </div>
        </div>
      )}

      {/* --- Current Posse toggle --- */}
      <button
        className="btn bg-gray-700 text-white"
        onClick={() => setShowPosse((v) => !v)}
      >
        {showPosse ? 'Hide' : 'Show'} Current Posse
      </button>

      {showPosse && (
        <div className="space-y-3 border rounded-xl p-3 bg-white/80">
          <h2 className="text-lg font-semibold">Current Posse</h2>
          <ul>
            {(!posse || posse.length === 0) && <li className="text-gray-500">No heroes in posse.</li>}
            {posseDedupe.map((h, i) => {
              const id = getId(h);
              const displayName = h.name || h.heroName || h.heroClass || id || `Hero ${i + 1}`;
              return (
                <li key={uniqueKeyForHero(id, i)} className="flex items-center gap-2 py-1">
                  <span>{displayName}</span>
                  <button
                    type="button"
                    className="btn btn-xs bg-red-500 text-white"
                    onClick={(e) => {
                      e?.preventDefault?.();
                      e?.stopPropagation?.();
                      const ok = window.confirm(`Remove ${displayName} from the posse?`);
                      if (ok) removeHero(id);
                    }}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <select
              className="select"
              value={posseAddId}
              onChange={(e) => setPosseAddId(e.target.value)}
            >
              <option value="">Add hero to posse</option>
              {availableForPosse.map((h) => {
                const id = getId(h);
                return (
                  <option key={h._lsKey || id} value={id}>
                    {h.name || h.heroName || h.heroClass || id}
                  </option>
                );
              })}
            </select>
            <button
              className="btn btn-xs bg-green-600 text-white"
              onClick={() => {
                const h = heroList.find((hh) => getId(hh) === posseAddId);
                if (!h) return;
                const already = (posse || []).some((p) => getId(p) === getId(h));
                if (!already) addHero(h); // prevent duplicate entries
                setPosseAddId('');
              }}
              disabled={!posseAddId}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* --- Active Effects toggle --- */}
      <button
        className="btn bg-gray-700 text-white"
        onClick={() => setShowActiveEffects((v) => !v)}
      >
        {showActiveEffects ? 'Hide' : 'Show'} Active Effects
      </button>

      {showActiveEffects && (
        <div className="space-y-3 border rounded-xl p-3 bg-white/80">
          <h2 className="text-lg font-semibold">Active Effects</h2>

          <div className="grid gap-2">
            <div className="rounded border p-2">
              <div className="font-semibold">Darkness</div>
              <div className="text-sm text-gray-800">
                {typeof darkness === 'number' ? darkness : <pre className="text-xs">{JSON.stringify(darkness, null, 2)}</pre>}
              </div>
            </div>

            <div className="rounded border p-2">
              <div className="font-semibold">Growing Dread</div>
              <div className="text-sm text-gray-800">
                {Array.isArray(growingDread) ? (
                  <>
                    <div>Count: {growingDread.length}</div>
                    <ul className="list-disc list-inside mt-1 text-xs">
                      {growingDread.map((x, i) => (
                        <li key={i}>{x?.name || x?.title || x?.id || 'Card'}</li>
                      ))}
                    </ul>
                  </>
                ) : typeof growingDread === 'number' ? (
                  <div>Count: {growingDread}</div>
                ) : (
                  <pre className="text-xs">{JSON.stringify(growingDread, null, 2)}</pre>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Read-only snapshot from the DM panel. Adjust values in Darkness / Growing Dread tabs.
          </p>
        </div>
      )}

      {/* --- Reference Library toggle --- */}
      <div>
        <button
          onClick={() => setShowLibrary(!showLibrary)}
          className="btn bg-gray-700 text-white"
        >
          {showLibrary ? 'Hide' : 'Show'} Reference Library
        </button>

        {showLibrary && (
          <div className="mt-4">
            <ReferenceLibrary />
          </div>
        )}
      </div>
    </div>
  );
}
