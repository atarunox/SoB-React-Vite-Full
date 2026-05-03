// src/components/DM/DMScanCards.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { runOcr, scanWithClaudeVision, scanMultiCardImage } from '../../utils/cardOcr';

// ── Deck type definitions ────────────────────────────────────────────────────

const DECK_TYPES = [
  { id: 'darkness',     label: 'Darkness Card' },
  { id: 'growingDread', label: 'Growing Dread Card' },
  { id: 'encounter',    label: 'Encounter' },
  { id: 'map',          label: 'Map Card' },
  { id: 'loot',         label: 'Loot' },
  { id: 'gear',         label: 'Gear Card' },
  { id: 'artifact',     label: 'Artifact' },
  { id: 'depthEvent',   label: 'Depth Event' },
  { id: 'enemy',        label: 'Enemy Sheet' },
];

const WORLDS = [
  'Mines',
  'Blasted Wastes',
  'Targa Plateau',
  'Caverns of Cynder',
  'Jargono',
  'Trederra',
  'Derelict Ship',
  'The Canyons',
  'Belly of the Beast',
  'Forest of the Dead',
  'Cursed Mountain',
  'Valley of the Serpent Kings',
  'Forbidden Fortress',
];

const DARKNESS_TAGS = ['Darkness', 'Ritual', 'Dread', 'Boost', 'Soldier', 'Construct', 'Undead', 'Demon', 'Void'];
const ENCOUNTER_TAGS = ['Encounter', 'Active', 'Environment', 'Stranger', 'Demon', 'Undead', 'Trap', 'Void', 'Water', 'Fire'];
const ARTIFACT_TAGS = ['Artifact', 'Scroll', 'Magik', 'Void', 'Tribal', 'Charm', 'Weapon', 'Armor', 'Dark Stone'];
const GEAR_SLOTS = ['Gun', 'Hand Weapon', 'Light Source', 'Tonic', 'Coat', 'Hat', 'Boots', 'Gloves', 'Charm', 'None'];
const ARTIFACT_SLOTS = ['None', 'Charm', 'Hand Weapon', 'Gun', 'Coat', 'Hat', 'Boots', 'Gloves'];
const ENEMY_KEYWORDS = ['Beast', 'Cursed', 'Undead', 'Demon', 'Void', 'Soldier', 'Construct', 'Robot', 'Swarm', 'Spirit', 'Nature', 'Corrupted', 'Werewolf', 'Vampire', 'Tribal', 'Outlaw', 'Targa'];
const ENEMY_SIZES = ['Small', 'Medium', 'Large', 'XL'];
const THREAT_TIERS = ['low', 'medium', 'high', 'epic'];

const LS_KEY = 'sob:scannedCards';
const LS_API_KEY = 'sob:claudeApiKey';
const SS_DECK_KEY = 'sob:scanDeckType';
const SS_WORLD_KEY = 'sob:scanWorld';
const SS_SIDE_KEY = 'sob:scanEnemySide';

const NEEDS_WORLD = new Set(['encounter', 'map', 'loot', 'artifact', 'depthEvent', 'enemy']);

const hasSecureCamera = typeof navigator !== 'undefined'
  && !!navigator.mediaDevices?.getUserMedia;

// ── Helpers ──────────────────────────────────────────────────────────────────

function toId(name = '') {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function loadPending() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
}
function savePending(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
}

// ── Merge Claude/OCR response into deck-specific form shape ──────────────────

function applyToSchema(raw, deckType, enemySide = 'normal') {
  const name = raw.name || '';
  const effect = raw.effect || '';
  const tags = Array.isArray(raw.tags) ? raw.tags : [];

  switch (deckType) {
    case 'darkness':
      return {
        name,
        flavorText: raw.flavorText || '',
        effect,
        tags: tags.length ? tags : ['Darkness'],
        remainsInPlay: raw.remainsInPlay ?? false,
      };
    case 'growingDread':
      return {
        id: toId(name),
        name,
        flavorText: raw.flavorText || '',
        effect,
        promoId: raw.promoId || '',
      };
    case 'encounter':
      return {
        name,
        flavorText: raw.flavorText || '',
        tags: tags.length ? tags : ['Encounter'],
        test: raw.test || '',
        effect,
        remainsInPlay: raw.remainsInPlay ?? false,
      };
    case 'map':
      return {
        id: toId(name),
        name,
        image: `/assets/images/maps/${name.replace(/\s+/g, '_')}.png`,
      };
    case 'loot':
      return { name, description: raw.description || effect };
    case 'gear':
      return {
        id: toId(name),
        name,
        slot: raw.slot || '',
        hands: raw.hands ?? (raw.twoHanded ? 2 : 1),
        effects: Array.isArray(raw.effects) ? raw.effects : [effect].filter(Boolean),
        value: raw.value ?? 0,
        darkStone: raw.darkStone ?? false,
        upgradeSlots: raw.upgradeSlots ?? 0,
        restrictions: raw.restrictions ?? [],
      };
    case 'artifact':
      return {
        id: toId(name),
        name,
        type: raw.type || 'Artifact',
        slot: raw.slot || 'None',
        hands: raw.hands ?? 1,
        value: raw.value ?? 0,
        weight: raw.weight ?? 1,
        upgradeSlots: raw.upgradeSlots ?? 0,
        effects: Array.isArray(raw.effects) ? raw.effects : [effect].filter(Boolean),
        requires: raw.requires || '',
        tags: tags.length ? tags : ['Artifact'],
      };
    case 'depthEvent':
      return {
        id: toId(name),
        name,
        flavorText: raw.flavorText || '',
        effect,
        depth: raw.depth || '',
      };
    case 'enemy': {
      const move = raw.move != null ? String(raw.move) : '0';
      const combat = raw.combat != null ? raw.combat : 0;
      const damage = raw.damage ?? 0;
      const defense = raw.defense ?? 0;
      const health = raw.health ?? 0;
      const xp = raw.xp || '0';
      const abilities = Array.isArray(raw.abilities) ? raw.abilities : [];
      const elites = Array.isArray(raw.eliteAbilities) ? raw.eliteAbilities : [];
      // Auto-detect brutal: use isBrutal from Claude, or name starting with "Brutal", or manual toggle
      const detectedBrutal = raw.isBrutal === true || /^brutal\s+/i.test(name);
      const side = detectedBrutal ? 'brutal' : enemySide;
      // Strip "Brutal" prefix from name if present
      const cleanName = name.replace(/^brutal\s+/i, '').trim();
      const prefix = side === 'brutal' ? 'brutal' : 'normal';
      const base = {
        name: cleanName,
        keywords: (raw.keywords || tags || []),
        Size: raw.Size || 'Medium',
        initiative: raw.initiative ?? 0,
        move,
        escape: raw.escape || '4+',
        meleeToHit: raw.meleeToHit || '4+',
        rangedToHit: raw.rangedToHit || null,
        normalCombat: 0, normalDamage: 0, normalDefense: 0, normalHealth: 0, normalXp: '0',
        brutalCombat: 0, brutalDamage: 0, brutalDefense: 0, brutalHealth: 0, brutalXp: '0',
        abilities,
        eliteAbilities: side === 'normal' ? elites : [],
        brutalEliteAbilities: side === 'brutal' ? elites : [],
        threatTier: raw.threatTier || 'medium',
        _scannedSide: side,
      };
      base[`${prefix}Combat`] = combat;
      base[`${prefix}Damage`] = damage;
      base[`${prefix}Defense`] = defense;
      base[`${prefix}Health`] = health;
      base[`${prefix}Xp`] = xp;
      return base;
    }
    default:
      return { name, effect };
  }
}

// ── Heuristic parser for Tesseract raw text ──────────────────────────────────

function parseOcrText(raw, deckType) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const fullText = lines.join(' ');

  const name = lines[0] || '';
  const flavorLine = lines.find((l, i) => i > 0 && l.length < 100 && /[.!]$/.test(l) && !/[:+\-\d]/.test(l));
  const effectStart = flavorLine ? lines.indexOf(flavorLine) + 1 : 1;
  const effect = lines.slice(effectStart).join(' ').trim();

  const valueMatch = fullText.match(/\$\s*(\d+)/);
  const value = valueMatch ? Number(valueMatch[1]) : 0;
  const weightMatch = fullText.match(/\bWt\.?\s*(\d+)/i);
  const weight = weightMatch ? Number(weightMatch[1]) : 1;
  const upgradeMatch = fullText.match(/(\d+)\s+upgrade\s+slot/i);
  const upgradeSlots = upgradeMatch ? Number(upgradeMatch[1]) : 0;
  const testMatch = fullText.match(/\b(Strength|Agility|Cunning|Spirit|Lore|Luck|Initiative)\s+(\d+\+)/i);
  const test = testMatch ? `${testMatch[1]} ${testMatch[2]}` : '';
  const promoMatch = fullText.match(/Promo-?\s*(\d+)/i);
  const promoId = promoMatch ? `Promo-${promoMatch[1]}` : '';

  return applyToSchema({ name, effect, flavorText: flavorLine || '', value, weight, upgradeSlots, test, promoId }, deckType);
}

// ── Field renderer per deck type ─────────────────────────────────────────────

function TagCheckboxes({ allTags, selected, onChange }) {
  const sel = Array.isArray(selected) ? selected : [];
  return (
    <div className="flex flex-wrap gap-2">
      {allTags.map(t => (
        <label key={t} className="flex items-center gap-1 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={sel.includes(t)}
            onChange={e => {
              if (e.target.checked) onChange([...sel, t]);
              else onChange(sel.filter(x => x !== t));
            }}
          />
          {t}
        </label>
      ))}
    </div>
  );
}

function EffectsEditor({ value, onChange }) {
  const lines = Array.isArray(value) ? value : [value || ''];
  return (
    <div className="space-y-1">
      {lines.map((line, i) => (
        <div key={i} className="flex gap-1">
          <input
            className="input input-sm flex-1"
            value={line}
            onChange={e => { const next = [...lines]; next[i] = e.target.value; onChange(next); }}
            placeholder={`Effect line ${i + 1}`}
          />
          {lines.length > 1 && (
            <button className="btn btn-xs btn-ghost" onClick={() => onChange(lines.filter((_, j) => j !== i))}>✕</button>
          )}
        </div>
      ))}
      <button className="btn btn-xs btn-outline" onClick={() => onChange([...lines, ''])}>+ Line</button>
    </div>
  );
}

function FormFields({ deckType, data, onChange }) {
  const set = (field, val) => onChange({ ...data, [field]: val });

  const field = (label, fieldName, type = 'text', placeholder = '') => (
    <div>
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <input
        type={type}
        className="input input-sm w-full mt-0.5"
        value={data[fieldName] ?? ''}
        placeholder={placeholder}
        onChange={e => set(fieldName, type === 'number' ? Number(e.target.value) : e.target.value)}
      />
    </div>
  );

  const textarea = (label, fieldName, placeholder = '') => (
    <div>
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <textarea
        className="textarea textarea-sm w-full mt-0.5"
        rows={3}
        value={data[fieldName] ?? ''}
        placeholder={placeholder}
        onChange={e => set(fieldName, e.target.value)}
      />
    </div>
  );

  const toggle = (label, fieldName) => (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <input type="checkbox" checked={!!data[fieldName]} onChange={e => set(fieldName, e.target.checked)} />
      {label}
    </label>
  );

  switch (deckType) {
    case 'darkness':
      return (
        <div className="space-y-3">
          {field('Name', 'name')}
          {textarea('Flavor / Lore Text (italic)', 'flavorText')}
          {textarea('Effect', 'effect')}
          <div>
            <label className="text-xs font-semibold text-gray-600">Tags</label>
            <TagCheckboxes allTags={DARKNESS_TAGS} selected={data.tags} onChange={v => set('tags', v)} />
          </div>
          {toggle('Remains in Play', 'remainsInPlay')}
        </div>
      );

    case 'growingDread':
      return (
        <div className="space-y-3">
          {field('Name', 'name')}
          {field('ID (auto)', 'id')}
          {textarea('Flavor / Lore Text (italic)', 'flavorText')}
          {textarea('Effect', 'effect')}
          {field('Promo ID', 'promoId', 'text', 'e.g. Promo-147')}
        </div>
      );

    case 'encounter':
      return (
        <div className="space-y-3">
          {field('Name', 'name')}
          {textarea('Flavor / Lore Text (italic)', 'flavorText')}
          {textarea('Effect', 'effect')}
          <div>
            <label className="text-xs font-semibold text-gray-600">Tags</label>
            <TagCheckboxes allTags={ENCOUNTER_TAGS} selected={data.tags} onChange={v => set('tags', v)} />
          </div>
          {field('Test (e.g. Cunning 5+, or leave blank)', 'test', 'text', 'Cunning 5+')}
          {toggle('Remains in Play', 'remainsInPlay')}
        </div>
      );

    case 'map':
      return (
        <div className="space-y-3">
          {field('Name', 'name')}
          {field('ID (auto)', 'id')}
          {field('Image path', 'image', 'text', '/assets/images/maps/Name.png')}
        </div>
      );

    case 'loot':
      return (
        <div className="space-y-3">
          {field('Name', 'name')}
          {textarea('Description', 'description')}
        </div>
      );

    case 'gear':
      return (
        <div className="space-y-3">
          {field('Name', 'name')}
          {field('ID (auto)', 'id')}
          <div>
            <label className="text-xs font-semibold text-gray-600">Slot</label>
            <select className="select select-sm w-full mt-0.5" value={data.slot || ''} onChange={e => set('slot', e.target.value)}>
              <option value="">— select —</option>
              {GEAR_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Effects</label>
            <EffectsEditor value={data.effects} onChange={v => set('effects', v)} />
          </div>
          {field('Value ($)', 'value', 'number')}
          {field('Upgrade Slots', 'upgradeSlots', 'number')}
          <div>
            <label className="text-xs font-semibold text-gray-600">Hands</label>
            <select className="select select-sm w-full mt-0.5" value={data.hands ?? 1} onChange={e => set('hands', Number(e.target.value))}>
              <option value={1}>1 Hand</option>
              <option value={2}>2 Hands</option>
              <option value={3}>3 Hands</option>
            </select>
          </div>
          {toggle('Dark Stone', 'darkStone')}
          <div>
            <label className="text-xs font-semibold text-gray-600">Restrictions (one per line)</label>
            <textarea
              className="textarea textarea-sm w-full mt-0.5"
              rows={2}
              value={(data.restrictions || []).join('\n')}
              onChange={e => set('restrictions', e.target.value.split('\n').filter(Boolean))}
            />
          </div>
        </div>
      );

    case 'artifact':
      return (
        <div className="space-y-3">
          {field('Name', 'name')}
          {field('ID (auto)', 'id')}
          {field('Type', 'type', 'text', 'e.g. Artifact - Scroll - Magik')}
          <div>
            <label className="text-xs font-semibold text-gray-600">Slot</label>
            <select className="select select-sm w-full mt-0.5" value={data.slot || 'None'} onChange={e => set('slot', e.target.value)}>
              {ARTIFACT_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Hands</label>
            <select className="select select-sm w-full mt-0.5" value={data.hands ?? 1} onChange={e => set('hands', Number(e.target.value))}>
              <option value={1}>1 Hand</option>
              <option value={2}>2 Hands</option>
              <option value={3}>3 Hands</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Effects</label>
            <EffectsEditor value={data.effects} onChange={v => set('effects', v)} />
          </div>
          {field('Value ($)', 'value', 'number')}
          {field('Weight', 'weight', 'number')}
          {field('Upgrade Slots', 'upgradeSlots', 'number')}
          {field('Requires', 'requires', 'text', 'e.g. Spirit 3 or higher to use')}
          <div>
            <label className="text-xs font-semibold text-gray-600">Tags</label>
            <TagCheckboxes allTags={ARTIFACT_TAGS} selected={data.tags} onChange={v => set('tags', v)} />
          </div>
        </div>
      );

    case 'depthEvent':
      return (
        <div className="space-y-3">
          {field('Name', 'name')}
          {field('ID (auto)', 'id')}
          {textarea('Flavor / Lore Text (italic)', 'flavorText')}
          {textarea('Effect', 'effect')}
          {field('Depth (e.g. 1, 2, 3, or "any")', 'depth', 'text', 'any')}
        </div>
      );

    case 'enemy':
      return (
        <div className="space-y-3">
          {field('Name', 'name')}
          <div>
            <label className="text-xs font-semibold text-gray-600">Keywords</label>
            <TagCheckboxes allTags={ENEMY_KEYWORDS} selected={data.keywords} onChange={v => set('keywords', v)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-gray-600">Size</label>
              <select className="select select-sm w-full mt-0.5" value={data.Size || 'Medium'} onChange={e => set('Size', e.target.value)}>
                {ENEMY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Threat Tier</label>
              <select className="select select-sm w-full mt-0.5" value={data.threatTier || 'medium'} onChange={e => set('threatTier', e.target.value)}>
                {THREAT_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {field('Initiative', 'initiative', 'number')}
            {field('Move', 'move', 'number')}
            {field('Escape', 'escape', 'text', '4+')}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {field('Melee To-Hit', 'meleeToHit', 'text', '4+')}
            {field('Ranged To-Hit (blank if none)', 'rangedToHit', 'text', '')}
          </div>

          <div className="border border-gray-300 rounded p-3 space-y-2">
            <h4 className="text-sm font-bold text-gray-700">Normal Stats</h4>
            <div className="grid grid-cols-5 gap-2">
              {field('Combat', 'normalCombat', 'number')}
              {field('Damage', 'normalDamage', 'number')}
              {field('Defense', 'normalDefense', 'number')}
              {field('Health', 'normalHealth', 'number')}
              {field('XP', 'normalXp', 'text', '10+5')}
            </div>
          </div>

          <div className="border border-red-300 rounded p-3 space-y-2">
            <h4 className="text-sm font-bold text-red-700">Brutal Stats</h4>
            <div className="grid grid-cols-5 gap-2">
              {field('Combat', 'brutalCombat', 'number')}
              {field('Damage', 'brutalDamage', 'number')}
              {field('Defense', 'brutalDefense', 'number')}
              {field('Health', 'brutalHealth', 'number')}
              {field('XP', 'brutalXp', 'text', '15+10')}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">Abilities</label>
            <EffectsEditor value={data.abilities} onChange={v => set('abilities', v)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Elite Abilities (Normal chart)</label>
            <EffectsEditor value={data.eliteAbilities} onChange={v => set('eliteAbilities', v)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Elite Abilities (Brutal chart — leave empty if same as Normal)</label>
            <EffectsEditor value={data.brutalEliteAbilities} onChange={v => set('brutalEliteAbilities', v)} />
          </div>
        </div>
      );

    default:
      return null;
  }
}

// ── Export ───────────────────────────────────────────────────────────────────

function formatEnemyForExport(card) {
  const mv = card.move;
  const moveVal = /^\*+$/.test(String(mv)) ? String(mv) : (Number(mv) || 0);
  const normCombat = card.normalCombat;
  const brutCombat = card.brutalCombat;
  return {
    name: card.name,
    keywords: card.keywords || [],
    Size: card.Size || 'Medium',
    initiative: Number(card.initiative) || 0,
    move: moveVal,
    escape: card.escape || '4+',
    toHit: { melee: card.meleeToHit || '4+', ranged: card.rangedToHit || null },
    stats: {
      normal: {
        combat: /^\*+$/.test(String(normCombat)) ? String(normCombat) : (Number(normCombat) || 0),
        damage: Number(card.normalDamage) || 0,
        defense: Number(card.normalDefense) || 0,
        health: Number(card.normalHealth) || 0,
        xp: String(card.normalXp || '0'),
      },
      brutal: {
        combat: /^\*+$/.test(String(brutCombat)) ? String(brutCombat) : (Number(brutCombat) || 0),
        damage: Number(card.brutalDamage) || 0,
        defense: Number(card.brutalDefense) || 0,
        health: Number(card.brutalHealth) || 0,
        xp: String(card.brutalXp || '0'),
      },
    },
    abilities: card.abilities || [],
    eliteAbilities: card.eliteAbilities || [],
    ...(card.brutalEliteAbilities?.length ? { brutalEliteAbilities: card.brutalEliteAbilities } : {}),
  };
}

function exportCards(deckType, cards) {
  const label = DECK_TYPES.find(d => d.id === deckType)?.label || deckType;
  const date = new Date().toISOString().slice(0, 10);
  const exportData = deckType === 'enemy' ? cards.map(formatEnemyForExport) : cards;
  const json = JSON.stringify(exportData, null, 2);
  const content = `// Scanned cards — ${label} — ${date}\n// Paste / merge into the appropriate data file\nexport default ${json};\n`;

  const blob = new Blob([content], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `scanned_${deckType}_${date}.js`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DMScanCards() {
  const [deckType, setDeckType] = useState(() => {
    try { return sessionStorage.getItem(SS_DECK_KEY) || 'darkness'; } catch { return 'darkness'; }
  });
  const [world, setWorld] = useState(() => {
    try { return sessionStorage.getItem(SS_WORLD_KEY) || 'Mines'; } catch { return 'Mines'; }
  });
  const [enemySide, setEnemySide] = useState(() => {
    try { return sessionStorage.getItem(SS_SIDE_KEY) || 'normal'; } catch { return 'normal'; }
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanEngine, setScanEngine] = useState('');
  const [rawText, setRawText] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [formData, setFormData] = useState({});
  const [hasScanned, setHasScanned] = useState(false);
  const [pending, setPending] = useState(() => loadPending());
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(LS_API_KEY) || '');
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState(() => localStorage.getItem(LS_API_KEY) || '');

  // Batch scan state
  const [batchQueue, setBatchQueue] = useState([]);
  const [batchIndex, setBatchIndex] = useState(-1);
  const [batchResults, setBatchResults] = useState([]);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchErrors, setBatchErrors] = useState([]);
  const batchAbortRef = useRef(false);
  const batchInputRef = useRef(null);
  const batchMultiRef = useRef(null);

  // Inline camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [liveMode, setLiveMode] = useState(false);
  const [inFlight, setInFlight] = useState(0);
  const [liveScanned, setLiveScanned] = useState(0);
  const [flashActive, setFlashActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const pendingKey = NEEDS_WORLD.has(deckType) ? `${deckType}:${world}` : deckType;
  const currentPending = pending[pendingKey] || [];
  const useClaudeVision = !!apiKey;

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Persist selections so they survive page reloads from native camera
  useEffect(() => {
    try { sessionStorage.setItem(SS_DECK_KEY, deckType); } catch {}
  }, [deckType]);
  useEffect(() => {
    try { sessionStorage.setItem(SS_WORLD_KEY, world); } catch {}
  }, [world]);
  useEffect(() => {
    try { sessionStorage.setItem(SS_SIDE_KEY, enemySide); } catch {}
  }, [enemySide]);

  const startCamera = useCallback(async () => {
    // On HTTP, getUserMedia is unavailable — fall back to native camera input
    if (!hasSecureCamera) {
      cameraInputRef.current?.click();
      return;
    }
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      setCameraActive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
    } catch (err) {
      setCameraError(err.name === 'NotAllowedError'
        ? 'Camera permission denied. Allow camera access in your browser settings.'
        : `Camera error: ${err.message}`);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setLiveMode(false);
  }, []);

  // Fire-and-forget background scan — used in live mode to keep camera open
  const processInBackground = useCallback(async (file) => {
    setInFlight(n => n + 1);
    try {
      const label = NEEDS_WORLD.has(deckType) ? `${world} ${deckType}` : deckType;
      const extra = deckType === 'enemy' ? { isEnemy: true, enemySide } : {};
      const result = await scanWithClaudeVision(file, label, apiKey, extra);
      const cardData = applyToSchema(result, deckType, enemySide);
      const key = NEEDS_WORLD.has(deckType) ? `${deckType}:${world}` : deckType;

      setPending(prev => {
        const existing = prev[key] || [];
        let updatedList;
        if (deckType === 'enemy' && cardData.name) {
          const matchIdx = existing.findIndex(c => c.name?.toLowerCase() === cardData.name.toLowerCase());
          if (matchIdx >= 0) {
            const merged = { ...existing[matchIdx] };
            if (cardData._scannedSide === 'brutal') {
              merged.brutalCombat = cardData.brutalCombat;
              merged.brutalDamage = cardData.brutalDamage;
              merged.brutalDefense = cardData.brutalDefense;
              merged.brutalHealth = cardData.brutalHealth;
              merged.brutalXp = cardData.brutalXp;
              if (cardData.brutalEliteAbilities?.length) merged.brutalEliteAbilities = cardData.brutalEliteAbilities;
            } else {
              merged.normalCombat = cardData.normalCombat;
              merged.normalDamage = cardData.normalDamage;
              merged.normalDefense = cardData.normalDefense;
              merged.normalHealth = cardData.normalHealth;
              merged.normalXp = cardData.normalXp;
              merged.abilities = cardData.abilities;
              merged.eliteAbilities = cardData.eliteAbilities;
              merged.keywords = cardData.keywords;
              merged.Size = cardData.Size;
              merged.initiative = cardData.initiative;
              merged.move = cardData.move;
              merged.escape = cardData.escape;
              merged.meleeToHit = cardData.meleeToHit;
              merged.rangedToHit = cardData.rangedToHit;
            }
            updatedList = [...existing];
            updatedList[matchIdx] = merged;
          } else {
            updatedList = [...existing, { ...cardData }];
          }
        } else {
          updatedList = [...existing, { ...cardData }];
        }
        const updated = { ...prev, [key]: updatedList };
        savePending(updated);
        return updated;
      });
      setLiveScanned(n => n + 1);
    } catch (err) {
      console.warn('Background scan failed:', err.message);
    } finally {
      setInFlight(n => n - 1);
    }
  }, [deckType, world, apiKey, enemySide]);

  const startLiveCamera = useCallback(async () => {
    setLiveMode(true);
    setLiveScanned(0);
    setInFlight(0);
    await startCamera();
  }, [startCamera]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], `card_${Date.now()}.jpg`, { type: 'image/jpeg' });
      if (liveMode) {
        // Flash feedback — camera stays open
        setFlashActive(true);
        setTimeout(() => setFlashActive(false), 250);
        processInBackground(file);
      } else {
        setImageFile(file);
        setImageUrl(URL.createObjectURL(blob));
        setRawText('');
        setFormData({});
        setHasScanned(false);
        setScanEngine('');
        stopCamera();
      }
    }, 'image/jpeg', 0.92);
  }, [liveMode, stopCamera, processInBackground]);

  const saveApiKey = () => {
    const trimmed = apiKeyDraft.replace(/[^\x20-\x7E]/g, '').trim();
    setApiKey(trimmed);
    if (trimmed) localStorage.setItem(LS_API_KEY, trimmed);
    else localStorage.removeItem(LS_API_KEY);
    setShowSettings(false);
  };

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setRawText('');
    setFormData({});
    setHasScanned(false);
    setProgress(0);
    setScanEngine('');
  }, []);

  const handleScan = useCallback(async () => {
    if (!imageFile) return;
    setScanning(true);
    setProgress(10);
    try {
      if (useClaudeVision) {
        setProgress(30);
        const label = NEEDS_WORLD.has(deckType) ? `${world} ${deckType}` : deckType;
        const extra = deckType === 'enemy' ? { isEnemy: true, enemySide } : {};
        const result = await scanWithClaudeVision(imageFile, label, apiKey, extra);
        setProgress(100);
        setScanEngine('claude');
        setRawText('');
        setFormData(applyToSchema(result, deckType, enemySide));
      } else {
        const text = await runOcr(imageFile, setProgress);
        setScanEngine('tesseract');
        setRawText(text);
        setFormData(parseOcrText(text, deckType));
      }
      setHasScanned(true);
    } catch (err) {
      alert(`Scan failed: ${err.message}`);
    } finally {
      setScanning(false);
      setProgress(0);
    }
  }, [imageFile, deckType, useClaudeVision, apiKey, world]);

  const handleScanGroup = useCallback(async () => {
    if (!imageFile || !useClaudeVision) return;
    setScanning(true);
    setProgress(20);
    try {
      const label = NEEDS_WORLD.has(deckType) ? `${world} ${deckType}` : deckType;
      const extra = deckType === 'enemy' ? { isEnemy: true, enemySide } : {};
      setProgress(40);
      const cards = await scanMultiCardImage(imageFile, label, apiKey, extra);
      setProgress(100);

      const key = pendingKey;
      setPending(prev => {
        let local = { ...prev };
        let existing = local[key] || [];
        for (const raw of cards) {
          const cardData = applyToSchema(raw, deckType, enemySide);
          if (deckType === 'enemy' && cardData.name) {
            const matchIdx = existing.findIndex(c => c.name?.toLowerCase() === cardData.name.toLowerCase());
            if (matchIdx >= 0) {
              const merged = { ...existing[matchIdx] };
              if (cardData._scannedSide === 'brutal') {
                merged.brutalCombat = cardData.brutalCombat;
                merged.brutalDamage = cardData.brutalDamage;
                merged.brutalDefense = cardData.brutalDefense;
                merged.brutalHealth = cardData.brutalHealth;
                merged.brutalXp = cardData.brutalXp;
                if (cardData.brutalEliteAbilities?.length) merged.brutalEliteAbilities = cardData.brutalEliteAbilities;
              } else {
                merged.normalCombat = cardData.normalCombat;
                merged.normalDamage = cardData.normalDamage;
                merged.normalDefense = cardData.normalDefense;
                merged.normalHealth = cardData.normalHealth;
                merged.normalXp = cardData.normalXp;
                merged.abilities = cardData.abilities;
                merged.eliteAbilities = cardData.eliteAbilities;
                merged.keywords = cardData.keywords;
                merged.Size = cardData.Size;
                merged.initiative = cardData.initiative;
                merged.move = cardData.move;
                merged.escape = cardData.escape;
                merged.meleeToHit = cardData.meleeToHit;
                merged.rangedToHit = cardData.rangedToHit;
              }
              existing = [...existing];
              existing[matchIdx] = merged;
            } else {
              existing = [...existing, { ...cardData }];
            }
          } else {
            existing = [...existing, { ...cardData }];
          }
        }
        local[key] = existing;
        savePending(local);
        return local;
      });

      alert(`Found ${cards.length} card(s) — added to queue.`);
      setImageFile(null);
      setImageUrl('');
      setHasScanned(false);
    } catch (err) {
      alert(`Group scan failed: ${err.message}`);
    } finally {
      setScanning(false);
      setProgress(0);
    }
  }, [imageFile, deckType, useClaudeVision, apiKey, world, enemySide, pendingKey]);

  const handleFormChange = useCallback((next) => {
    if (next.name !== formData.name && next.id !== undefined) {
      next.id = toId(next.name);
    }
    setFormData(next);
  }, [formData.name]);

  const handleAddCard = useCallback(() => {
    if (!formData.name && !formData.id) { alert('Add at least a name before confirming.'); return; }
    const existing = pending[pendingKey] || [];
    let updatedList;
    if (deckType === 'enemy' && formData.name) {
      const matchIdx = existing.findIndex(c => c.name && c.name.toLowerCase() === formData.name.toLowerCase());
      if (matchIdx >= 0) {
        const merged = { ...existing[matchIdx] };
        const side = formData._scannedSide || enemySide;
        if (side === 'brutal') {
          merged.brutalCombat = formData.brutalCombat;
          merged.brutalDamage = formData.brutalDamage;
          merged.brutalDefense = formData.brutalDefense;
          merged.brutalHealth = formData.brutalHealth;
          merged.brutalXp = formData.brutalXp;
          if (formData.brutalEliteAbilities?.length) merged.brutalEliteAbilities = formData.brutalEliteAbilities;
        } else {
          merged.normalCombat = formData.normalCombat;
          merged.normalDamage = formData.normalDamage;
          merged.normalDefense = formData.normalDefense;
          merged.normalHealth = formData.normalHealth;
          merged.normalXp = formData.normalXp;
          merged.abilities = formData.abilities;
          merged.eliteAbilities = formData.eliteAbilities;
          merged.keywords = formData.keywords;
          merged.Size = formData.Size;
          merged.initiative = formData.initiative;
          merged.move = formData.move;
          merged.escape = formData.escape;
          merged.meleeToHit = formData.meleeToHit;
          merged.rangedToHit = formData.rangedToHit;
        }
        updatedList = [...existing];
        updatedList[matchIdx] = merged;
      } else {
        updatedList = [...existing, { ...formData }];
      }
    } else {
      updatedList = [...existing, { ...formData }];
    }
    const updated = { ...pending, [pendingKey]: updatedList };
    setPending(updated);
    savePending(updated);
    setFormData({});
    setImageFile(null);
    setImageUrl('');
    setRawText('');
    setHasScanned(false);
    setScanEngine('');
  }, [formData, pendingKey, pending]);

  const handleRemoveCard = useCallback((idx) => {
    const updated = {
      ...pending,
      [pendingKey]: (pending[pendingKey] || []).filter((_, i) => i !== idx),
    };
    setPending(updated);
    savePending(updated);
  }, [pending, pendingKey]);

  const handleExport = useCallback(() => {
    if (!currentPending.length) { alert('No cards to export yet.'); return; }
    exportCards(pendingKey, currentPending);
  }, [pendingKey, currentPending]);

  const handleClearAll = useCallback(() => {
    if (!window.confirm(`Discard all ${currentPending.length} scanned card(s)?`)) return;
    const updated = { ...pending, [pendingKey]: [] };
    setPending(updated);
    savePending(updated);
  }, [pending, pendingKey, currentPending.length]);

  const handleBatchFiles = useCallback((e) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    files.sort((a, b) => a.name.localeCompare(b.name));
    setBatchQueue(files);
    setBatchIndex(-1);
    setBatchResults([]);
    setBatchErrors([]);
    batchAbortRef.current = false;
    if (batchInputRef.current) batchInputRef.current.value = '';
    if (batchMultiRef.current) batchMultiRef.current.value = '';
  }, []);

  const runBatch = useCallback(async () => {
    if (!batchQueue.length) return;
    setBatchRunning(true);
    setBatchResults([]);
    setBatchErrors([]);
    batchAbortRef.current = false;
    const results = [];
    const errors = [];
    let localPending = { ...pending };

    for (let i = 0; i < batchQueue.length; i++) {
      if (batchAbortRef.current) break;
      setBatchIndex(i);
      const file = batchQueue[i];
      try {
        let cardData;
        if (useClaudeVision) {
          const label = NEEDS_WORLD.has(deckType) ? `${world} ${deckType}` : deckType;
          const extra = deckType === 'enemy' ? { isEnemy: true, enemySide } : {};
          const result = await scanWithClaudeVision(file, label, apiKey, extra);
          cardData = applyToSchema(result, deckType, enemySide);
        } else {
          const text = await runOcr(file, () => {});
          cardData = parseOcrText(text, deckType);
        }
        results.push({ file: file.name, card: cardData });
        const key = NEEDS_WORLD.has(deckType) ? `${deckType}:${world}` : deckType;
        const existing = (localPending[key] || []);
        if (deckType === 'enemy' && cardData.name) {
          const matchIdx = existing.findIndex(c => c.name && c.name.toLowerCase() === cardData.name.toLowerCase());
          if (matchIdx >= 0) {
            const merged = { ...existing[matchIdx] };
            if (cardData._scannedSide === 'brutal') {
              merged.brutalCombat = cardData.brutalCombat;
              merged.brutalDamage = cardData.brutalDamage;
              merged.brutalDefense = cardData.brutalDefense;
              merged.brutalHealth = cardData.brutalHealth;
              merged.brutalXp = cardData.brutalXp;
              if (cardData.brutalEliteAbilities?.length) {
                merged.brutalEliteAbilities = cardData.brutalEliteAbilities;
              }
            } else {
              merged.normalCombat = cardData.normalCombat;
              merged.normalDamage = cardData.normalDamage;
              merged.normalDefense = cardData.normalDefense;
              merged.normalHealth = cardData.normalHealth;
              merged.normalXp = cardData.normalXp;
              merged.abilities = cardData.abilities;
              merged.eliteAbilities = cardData.eliteAbilities;
              merged.keywords = cardData.keywords;
              merged.Size = cardData.Size;
              merged.initiative = cardData.initiative;
              merged.move = cardData.move;
              merged.escape = cardData.escape;
              merged.meleeToHit = cardData.meleeToHit;
              merged.rangedToHit = cardData.rangedToHit;
            }
            const updated = [...existing];
            updated[matchIdx] = merged;
            localPending = { ...localPending, [key]: updated };
          } else {
            localPending = { ...localPending, [key]: [...existing, { ...cardData }] };
          }
        } else {
          localPending = { ...localPending, [key]: [...existing, { ...cardData }] };
        }
        setPending({ ...localPending });
        savePending(localPending);
        setBatchResults([...results]);
      } catch (err) {
        errors.push({ file: file.name, error: err.message });
        setBatchErrors([...errors]);
      }
    }

    setBatchIndex(-1);
    setBatchRunning(false);
    setBatchQueue([]);
  }, [batchQueue, pending, deckType, world, useClaudeVision, apiKey]);

  const cancelBatch = useCallback(() => {
    batchAbortRef.current = true;
  }, []);

  return (
    <div className="p-4 space-y-5 max-w-2xl mx-auto">

      {/* Header + settings toggle */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold">Scan Cards</h2>
          <p className="text-sm text-gray-600 mt-0.5">
            Select a deck, photograph a card, then confirm the extracted fields.
          </p>
        </div>
        <button
          className="btn btn-sm btn-ghost shrink-0"
          onClick={() => setShowSettings(v => !v)}
        >
          ⚙ AI Settings
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="rounded-xl border border-blue-300 bg-blue-50 p-4 space-y-3">
          <div className="font-semibold text-sm">Claude Vision API (optional)</div>
          <p className="text-xs text-gray-600">
            Claude Vision is dramatically more accurate than Tesseract on dark, stylised cards.
            ~$0.001 per scan using Haiku.{' '}
            <a
              href="https://console.anthropic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-700"
            >
              Get a key at console.anthropic.com
            </a>
          </p>
          <div>
            <label className="text-xs font-semibold text-gray-600">API Key</label>
            <input
              type="password"
              className="input input-sm w-full mt-0.5 font-mono"
              placeholder="sk-ant-…"
              value={apiKeyDraft}
              onChange={e => setApiKeyDraft(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-sm btn-primary" onClick={saveApiKey}>Save</button>
            <button className="btn btn-sm btn-ghost" onClick={() => setShowSettings(false)}>Cancel</button>
            {apiKey && (
              <button
                className="btn btn-sm btn-ghost text-red-600 ml-auto"
                onClick={() => { setApiKeyDraft(''); setApiKey(''); localStorage.removeItem(LS_API_KEY); setShowSettings(false); }}
              >
                Remove Key
              </button>
            )}
          </div>
        </div>
      )}

      {/* Engine indicator */}
      <div className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 font-medium
        ${useClaudeVision ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
        {useClaudeVision ? '✦ Claude Vision (high accuracy)' : '◈ Tesseract OCR (local)'}
      </div>

      {deckType === 'enemy' && !useClaudeVision && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          Enemy sheets require <strong>Claude Vision</strong> — Tesseract cannot read the complex layout with stat boxes and decorative fonts. Add an API key in AI Settings above.
        </div>
      )}

      {/* Deck + World selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600">Deck Type</label>
          <select
            className="select select-bordered w-full mt-1"
            value={deckType}
            onChange={e => { setDeckType(e.target.value); setFormData({}); setHasScanned(false); }}
          >
            {DECK_TYPES.map(d => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>
        {NEEDS_WORLD.has(deckType) && (
          <div>
            <label className="text-xs font-semibold text-gray-600">World</label>
            <select
              className="select select-bordered w-full mt-1"
              value={world}
              onChange={e => { setWorld(e.target.value); setFormData({}); setHasScanned(false); }}
            >
              {WORLDS.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {deckType === 'enemy' && (
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Difficulty Side</label>
          <div className="flex gap-0 rounded-lg overflow-hidden border border-gray-400">
            <button
              className={`flex-1 py-2 px-4 text-sm font-semibold transition-colors ${enemySide === 'normal' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setEnemySide('normal')}
            >
              Normal
            </button>
            <button
              className={`flex-1 py-2 px-4 text-sm font-semibold transition-colors ${enemySide === 'brutal' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setEnemySide('brutal')}
            >
              Brutal
            </button>
          </div>
        </div>
      )}

      {/* Image capture */}
      <div className="rounded-xl border border-gray-300 p-4 space-y-3">

        {/* Inline camera viewfinder */}
        {cameraActive && (
          <div className="space-y-2">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="rounded-lg w-full max-h-80 object-contain bg-black"
              />
              {/* Capture flash */}
              {flashActive && (
                <div className="absolute inset-0 bg-white/60 rounded-lg pointer-events-none" />
              )}
              {/* Live mode status overlay */}
              {liveMode && (
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center gap-2">
                  <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {inFlight > 0 ? `🔄 ${inFlight} scanning…` : 'Ready'}
                  </span>
                  <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {liveScanned > 0 ? `✓ ${liveScanned} queued` : 'Tap Scan Card'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary flex-1" onClick={capturePhoto}>
                {liveMode ? '📸 Scan Card' : '📸 Capture'}
              </button>
              <button className="btn btn-ghost" onClick={stopCamera}>
                {liveMode ? 'Stop' : 'Cancel'}
              </button>
            </div>
            {liveMode && (
              <p className="text-xs text-gray-500 text-center">
                Cards auto-queue in background — keep scanning without stopping
              </p>
            )}
          </div>
        )}

        {/* Buttons — hidden while camera is live */}
        {!cameraActive && (
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-outline" onClick={startCamera}>
              📷 Open Camera
            </button>
            {useClaudeVision && (
              <button className="btn btn-outline btn-primary" onClick={startLiveCamera}>
                🎥 Live Scan
              </button>
            )}
            <button
              className="btn btn-outline"
              onClick={() => fileInputRef.current?.click()}
            >
              🖼 Choose from Gallery
            </button>
            {/* Gallery picker (no capture — won't open native camera) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {/* Native camera fallback for HTTP (no getUserMedia) */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            {imageFile && !scanning && (
              <>
                <button className="btn btn-primary" onClick={handleScan}>
                  🔍 Scan
                </button>
                {useClaudeVision && (
                  <button className="btn btn-secondary" onClick={handleScanGroup}>
                    🔍 Scan Group
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {cameraError && (
          <div className="text-sm text-red-600 bg-red-50 rounded p-2">{cameraError}</div>
        )}

        {imageUrl && !cameraActive && (
          <img
            src={imageUrl}
            alt="Card to scan"
            className="rounded-lg max-h-64 object-contain border border-gray-200 w-full"
          />
        )}

        {scanning && (
          <div className="space-y-1">
            <div className="text-sm text-gray-600">
              {useClaudeVision ? 'Asking Claude…' : 'Running OCR…'} {progress}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-amber-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Batch scan */}
      <div className="rounded-xl border border-gray-300 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">Batch Scan</h3>
            <p className="text-xs text-gray-500">Select a folder of card images to auto-scan all at once</p>
          </div>
          {!batchRunning && (
            <div className="flex gap-1">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => batchInputRef.current?.click()}
              >
                Folder
              </button>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => batchMultiRef.current?.click()}
              >
                Files
              </button>
            </div>
          )}
        </div>
        <input
          ref={batchInputRef}
          type="file"
          accept="image/*"
          multiple
          webkitdirectory=""
          className="hidden"
          onChange={handleBatchFiles}
        />
        <input
          ref={batchMultiRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleBatchFiles}
        />

        {batchQueue.length > 0 && !batchRunning && (
          <div className="space-y-2">
            <p className="text-sm">{batchQueue.length} image(s) ready to scan</p>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-primary" onClick={runBatch}>
                Start Batch Scan
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => setBatchQueue([])}>
                Clear
              </button>
            </div>
          </div>
        )}

        {batchRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Scanning {batchIndex + 1} of {batchQueue.length}: {batchQueue[batchIndex]?.name}
              </span>
              <button className="btn btn-xs btn-ghost text-red-600" onClick={cancelBatch}>
                Stop
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((batchIndex + 1) / batchQueue.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {batchResults.length} scanned, {batchErrors.length} errors
            </p>
          </div>
        )}

        {!batchRunning && batchResults.length > 0 && (
          <div className="text-sm text-green-700 bg-green-50 rounded p-2">
            Batch complete: {batchResults.length} card(s) added to queue.
            {batchErrors.length > 0 && (
              <span className="text-red-600 ml-1">{batchErrors.length} failed.</span>
            )}
          </div>
        )}

        {!batchRunning && batchErrors.length > 0 && (
          <details className="text-xs">
            <summary className="text-red-600 cursor-pointer font-semibold">
              {batchErrors.length} error(s)
            </summary>
            <ul className="mt-1 space-y-0.5">
              {batchErrors.map((e, i) => (
                <li key={i}><strong>{e.file}:</strong> {e.error}</li>
              ))}
            </ul>
          </details>
        )}
      </div>

      {/* Verification form */}
      {hasScanned && (
        <div className="rounded-xl border border-amber-400 bg-amber-50 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Verify & Edit Fields</h3>
              <span className="text-xs text-gray-500">
                {scanEngine === 'claude' ? '✦ Extracted by Claude Vision' : '◈ Extracted by Tesseract OCR'}
              </span>
            </div>
            {scanEngine === 'tesseract' && rawText && (
              <button
                className="btn btn-xs btn-ghost"
                onClick={() => setShowRaw(v => !v)}
              >
                {showRaw ? 'Hide' : 'Show'} raw OCR text
              </button>
            )}
          </div>

          {showRaw && rawText && (
            <pre className="text-xs bg-white border border-gray-200 rounded p-2 max-h-40 overflow-y-auto whitespace-pre-wrap">
              {rawText}
            </pre>
          )}

          <FormFields deckType={deckType} data={formData} onChange={handleFormChange} />

          <button className="btn btn-success w-full" onClick={handleAddCard}>
            ✓ Add to Queue ({currentPending.length + 1} total)
          </button>
        </div>
      )}

      {/* Pending queue */}
      {currentPending.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              Queued — {NEEDS_WORLD.has(deckType) ? `${world} ` : ''}{DECK_TYPES.find(d => d.id === deckType)?.label} ({currentPending.length})
            </h3>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-accent" onClick={handleExport}>
                ⬇ Export JSON
              </button>
              <button className="btn btn-sm btn-ghost text-red-600" onClick={handleClearAll}>
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {currentPending.map((card, idx) => (
              <div key={idx} className="rounded-lg border border-gray-200 bg-white p-3 flex justify-between gap-2">
                <div className="text-sm min-w-0">
                  <div className="font-semibold truncate">{card.name || card.id || '(unnamed)'}</div>
                  {deckType === 'enemy' ? (
                    <div className="flex gap-1 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${card.normalHealth ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        N{card.normalHealth ? ` ${card.normalHealth}hp` : ''}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${card.brutalHealth ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-400'}`}>
                        B{card.brutalHealth ? ` ${card.brutalHealth}hp` : ''}
                      </span>
                    </div>
                  ) : (card.effect || card.description) ? (
                    <div className="text-xs text-gray-600 truncate">{card.effect || card.description}</div>
                  ) : null}
                </div>
                <button
                  className="btn btn-xs btn-ghost text-red-600 shrink-0"
                  onClick={() => handleRemoveCard(idx)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="text-xs text-gray-500 space-y-1 border-t pt-3">
        <p><strong>Remote use:</strong> Install <a href="https://tailscale.com" target="_blank" rel="noopener noreferrer" className="underline">Tailscale</a> on your phone and visit your PC's Tailscale IP (e.g. <code>http://100.x.x.x:5173</code> — shown in the Vite console) to scan from anywhere.</p>
        <p className="mt-2"><strong>Tips for better scans:</strong></p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>{hasSecureCamera
            ? useClaudeVision
              ? '🎥 Live Scan keeps camera open — tap Scan Card for each card, results auto-queue in background'
              : 'Inline camera active (HTTPS) — page stays open while you photograph'
            : 'On HTTP, "Open Camera" uses the native camera — your deck selection is saved if the page reloads'}</li>
          <li>Flat, even lighting — avoid shadows across the card</li>
          <li>Card straight and fully in frame</li>
          {!useClaudeVision && <li>Add a Claude API key (⚙ AI Settings) for much higher accuracy on dark cards</li>}
        </ul>
      </div>
    </div>
  );
}
