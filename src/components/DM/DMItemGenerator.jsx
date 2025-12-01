/* FIXME: Unbalanced braces/parens detected: braces=0 parens=-2 brackets=0. Review this file. */
// src/components/DM/DMItemGenerator.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { usePosse } from '../../context/PosseContext';
// NOTE: townState does not export updateHero; we handle hero updates via PosseContext.
// Optional Firestore writer: replace this stub with your real import if you have one.
// e.g. import { updateHero as fsUpdateHero } from '../../services/firestoreHeroes';
async function fsUpdateHero(/* id, patch */) {
  // no-op by default (remote persistence disabled)
}

const EQUIP_COMPATIBLE_TYPES = [
  'Gun','Hand Weapon',
  'Main Hand','Off Hand',
  'Head','Torso','Coat','Gloves','Hands','Pants','Feet','Shoulders','Face',
  'Light Source','Container','Ally','Misc','Mark','Charm',
  'Belt','Ring','Book','Necklace',
  'Extra 1','Extra 2',
  'Custom…',
];

const STAT_FIELDS = [
  { key: 'agility', label: 'Agility' },
  { key: 'cunning', label: 'Cunning' },
  { key: 'spirit', label: 'Spirit' },
  { key: 'strength', label: 'Strength' },
  { key: 'lore', label: 'Lore' },
  { key: 'luck', label: 'Luck' },
  { key: 'initiative', label: 'Initiative' },
  { key: 'meleeToHit', label: 'Melee To-Hit' },
  { key: 'rangedToHit', label: 'Ranged To-Hit' },
  { key: 'defense', label: 'Defense' },
  { key: 'willpower', label: 'Willpower' },
  { key: 'armor', label: 'Armor' },
  { key: 'spiritArmor', label: 'Spirit Armor' },
  { key: 'health', label: 'Health (Max)' },
  { key: 'sanity', label: 'Sanity (Max)' },
  { key: 'grit', label: 'Grit (Max)' },
  { key: 'maxCorruption', label: 'Max Corruption' },
  { key: 'move', label: 'Move' },
  { key: 'combat', label: 'Combat' },
];

const defaultForm = () => ({
  name: '',
  rarity: '',
  slotType: 'Gun',
  customSlotType: '',
  twoHanded: false,
  weight: '',
  levelReq: '',
  description: '',
  tags: '',
  value: { gold: '', darkStone: '', scrap: '', tech: '' },
  mods: STAT_FIELDS.reduce((acc, f) => { acc[f.key] = ''; return acc; }, {}),
});

function ensureId(item) {
  if (!item) return item;
  if (item.id) return item;
  const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : 'itm_' + Math.random().toString(36).slice(2);
  return { ...item, id };
}

function buildItemFromForm(form) {
  const slot = form.slotType === 'Custom…' ? (form.customSlotType || 'Misc') : form.slotType;

  // numeric mods only
  const mods = {};
  for (const [k, v] of Object.entries(form.mods || {})) {
    const n = Number(v);
    if (Number.isFinite(n)) mods[k] = n;
  }

  const value = {};
  for (const key of ['gold','darkStone','scrap','tech']) {
    const n = Number(form.value?.[key]);
    if (Number.isFinite(n)) value[key] = n;
  }

  const tags = (form.tags || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const item = {
    id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'itm_' + Math.random().toString(36).slice(2),
    name: form.name || 'Unnamed Item',
    slot,
    twoHanded: !!form.twoHanded,
    description: form.description || '',
  };
  if (form.rarity) item.rarity = form.rarity;
  if (form.weight) item.weight = form.weight;
  if (Number.isFinite(Number(form.levelReq))) item.levelReq = Number(form.levelReq);
  if (Object.keys(value).length) item.value = value;
  if (tags.length) item.tags = tags;
  if (Object.keys(mods).length) item.mods = mods;

  return item;
}

function downloadJSON(filename, dataObj) {
  const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const TEMPLATES_KEY = 'dm_item_templates_v1';

export default function DMItemGenerator({ posse: posseFromProps, updateHero: updateHeroFromProps }) {
  const posseCtx = usePosse();
  const posse = useMemo(() => posseFromProps || posseCtx.posse || [], [posseFromProps, posseCtx.posse]);
  const updateHero = useMemo(() => updateHeroFromProps || posseCtx.updateHero, [updateHeroFromProps, posseCtx.updateHero]);

  const [form, setForm] = useState(defaultForm);
  const [targetHeroId, setTargetHeroId] = useState('');
  const [templates, setTemplates] = useState([]);

  const itemPreview = useMemo(() => buildItemFromForm(form), [form]);
  const showTwoHanded = form.slotType === 'Gun' || form.slotType === 'Hand Weapon';

  // Default select first posse member when list loads/changes
  useEffect(() => {
    if (!targetHeroId && posse.length) {
      setTargetHeroId(posse[0].id || posse[0].localId);
    }
  }, [posse, targetHeroId]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]');
      if (Array.isArray(saved)) setTemplates(saved);
    } catch {}
  }, []);

  const onChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const onValueChange = (k, v) => setForm(prev => ({ ...prev, value: { ...prev.value, [k]: v } }));
  const onModChange = (k, v) => setForm(prev => ({ ...prev, mods: { ...prev.mods, [k]: v } }));

  const addToHero = async () => {
    if (!targetHeroId) {
      alert('Choose a hero to receive this item.');
      return;
    }
    const target = posse.find(h => (h.id || h.localId) === targetHeroId);
    if (!target) return;

    const newItem = ensureId(itemPreview);
    const inv = Array.isArray(target.inventory) ? [...target.inventory] : [];
    inv.push(newItem);

    // 1) Persist to Firestore per-hero doc if this hero has a real remote id
    const remoteId = target.id; // prefer remote id; avoid creating docs for local-only heroes
    if (remoteId) {
      try {
        await fsUpdateHero(remoteId, { inventory: inv });
      } catch (e) {
        console.warn('[ItemGen] Firestore write failed; UI will still update locally.', e);
      }
    }

    // 2) Update local posse context so UI reflects immediately
    updateHero({ id: target.id || target.localId, inventory: inv });

    alert(`Added "${newItem.name}" to ${target.name || target.heroName || 'hero'}.`);
  };

  const copyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(itemPreview, null, 2));
      alert('Item JSON copied to clipboard.');
    } catch {
      alert('Copy failed (browser permissions). You can still download.');
    }
  };

  const download = () => {
    const safe = (itemPreview.name || 'item').toLowerCase().replace(/[^a-z0-9-_]+/g, '_').slice(0, 40);
    downloadJSON(`${safe || 'item'}.json`, itemPreview);
  };

  const saveTemplate = () => {
    const tpl = { title: form.name || 'Template', data: form };
    const next = [tpl, ...templates].slice(0, 50);
    setTemplates(next);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next));
  };

  const applyTemplate = (idx) => {
    const tpl = templates[idx];
    if (!tpl) return;
    setForm(tpl.data);
  };

  const deleteTemplate = (idx) => {
    if (!window.confirm('Delete this template?')) return;
    const next = templates.filter((_, i) => i !== idx);
    setTemplates(next);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Item Generator</h2>

      {/* Target hero */}
      <div className="rounded-xl border bg-white/80 p-3 flex flex-wrap items-center gap-2">
        <label className="font-semibold">Give to:</label>
        <select
          className="select"
          value={targetHeroId}
          onChange={e => setTargetHeroId(e.target.value)}
        >
          <option value="">(Choose hero)</option>
          {posse.map(h => {
            const id = h.id || h.localId;
            return <option key={id} value={id}>{h.name || h.heroName || id}</option>;
          })}
        </select>
        <button className="btn btn-primary btn-sm" onClick={addToHero}>Add to Inventory</button>
      </div>

      {/* Basics */}
      <section className="rounded-2xl border bg-white/80 p-3">
        <h3 className="font-bold text-lg mb-2">Basics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              className="input input-bordered w-full"
              value={form.name}
              onChange={e => onChange('name', e.target.value)}
              placeholder="e.g., Widowmaker Carbine"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Rarity</label>
            <input
              className="input input-bordered w-full"
              value={form.rarity}
              onChange={e => onChange('rarity', e.target.value)}
              placeholder="Common / Rare / Artifact..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Slot / Type</label>
            <select
              className="select w-full"
              value={form.slotType}
              onChange={e => onChange('slotType', e.target.value)}
            >
              {EQUIP_COMPATIBLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {form.slotType === 'Custom…' && (
              <input
                className="input input-bordered w-full mt-2"
                value={form.customSlotType}
                onChange={e => onChange('customSlotType', e.target.value)}
                placeholder="Custom slot name"
              />
            )}
            {showTwoHanded && (
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={form.twoHanded}
                  onChange={e => onChange('twoHanded', e.target.checked)}
                />
                <span>Two-Handed</span>
              </label>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <div>
            <label className="block text-sm font-medium">Level Requirement</label>
            <input
              className="input input-bordered w-full"
              type="number"
              min="0"
              value={form.levelReq}
              onChange={e => onChange('levelReq', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Weight</label>
            <input
              className="input input-bordered w-full"
              value={form.weight}
              onChange={e => onChange('weight', e.target.value)}
              placeholder="optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Tags (comma-separated)</label>
            <input
              className="input input-bordered w-full"
              value={form.tags}
              onChange={e => onChange('tags', e.target.value)}
              placeholder="e.g., Rifle, Void, Fire"
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium">Description / Effect</label>
          <textarea
            className="textarea textarea-bordered w-full"
            rows={3}
            value={form.description}
            onChange={e => onChange('description', e.target.value)}
            placeholder="What does it do?"
          />
        </div>
      </section>

      {/* Stat Mods */}
      <section className="rounded-2xl border bg-white/80 p-3">
        <h3 className="font-bold text-lg mb-2">Stat Modifiers</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {STAT_FIELDS.map(f => (
            <div key={f.key}>
              <label className="block text-xs text-gray-600">{f.label}</label>
              <input
                className="input input-bordered w-full"
                type="number"
                value={form.mods[f.key]}
                onChange={e => onModChange(f.key, e.target.value)}
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Value */}
      <section className="rounded-2xl border bg-white/80 p-3">
        <h3 className="font-bold text-lg mb-2">Value (if any)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-600">Gold</label>
            <input
              className="input input-bordered w-full"
              type="number"
              value={form.value.gold}
              onChange={e => onValueChange('gold', e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Dark Stone</label>
            <input
              className="input input-bordered w-full"
              type="number"
              value={form.value.darkStone}
              onChange={e => onValueChange('darkStone', e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Scrap</label>
            <input
              className="input input-bordered w-full"
              type="number"
              value={form.value.scrap}
              onChange={e => onValueChange('scrap', e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Tech</label>
            <input
              className="input input-bordered w-full"
              type="number"
              value={form.value.tech}
              onChange={e => onValueChange('tech', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={addToHero}>Add to Selected Hero</button>
        <button className="btn" onClick={copyJSON}>Copy JSON</button>
        <button className="btn" onClick={download}>Download JSON</button>
        <button className="btn btn-secondary" onClick={saveTemplate}>Save as Template</button>
        <button className="btn btn-ghost" onClick={() => setForm(defaultForm())}>
          Reset Form
        </button>
      </div>

      {/* Templates */}
      <section className="rounded-2xl border bg-white/80 p-3">
        <h3 className="font-bold text-lg mb-2">Templates</h3>
        {templates.length === 0 && (
          <div className="text-sm text-gray-500">No templates saved yet.</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {templates.map((tpl, i) => (
            <div key={i} className="rounded-xl border p-2 bg-white flex items-center justify-between gap-2">
              <div className="truncate">
                <div className="font-semibold truncate">{tpl.title}</div>
                <div className="text-xs text-gray-500 truncate">{tpl.data.slotType}</div>
              </div>
              <div className="flex items-center gap-1">
                <button className="btn btn-xs btn-primary" onClick={() => applyTemplate(i)}>Load</button>
                <button className="btn btn-xs btn-error" onClick={() => deleteTemplate(i)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* JSON Preview */}
      <section className="rounded-2xl border bg-white/80 p-3">
        <h3 className="font-bold text-lg mb-2">JSON Preview</h3>
        <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-72">
{JSON.stringify(itemPreview, null, 2)}
        </pre>
      </section>
    </div>
  );
}
