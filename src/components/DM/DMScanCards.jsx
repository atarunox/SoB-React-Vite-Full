// src/components/DM/DMScanCards.jsx
import React, { useState, useRef, useCallback } from 'react';
import { runOcr } from '../../utils/cardOcr';

// ── Deck type definitions ────────────────────────────────────────────────────

const DECK_TYPES = [
  { id: 'darkness',        label: 'Darkness Card' },
  { id: 'growingDread',    label: 'Growing Dread Card' },
  { id: 'mineEncounter',   label: 'Mine Encounter' },
  { id: 'wastesEncounter', label: 'Wastes Encounter' },
  { id: 'mineMap',         label: 'Mine Map Card' },
  { id: 'wastesMap',       label: 'Wastes Map Card' },
  { id: 'mineLoot',        label: 'Mine Loot' },
  { id: 'wastesLoot',      label: 'Wastes Loot' },
  { id: 'gear',            label: 'Gear Card' },
  { id: 'mineArtifact',    label: 'Mine Artifact' },
];

const DARKNESS_TAGS = ['Darkness', 'Ritual', 'Dread', 'Boost', 'Soldier', 'Construct', 'Undead', 'Demon', 'Void'];
const ENCOUNTER_TAGS = ['Encounter', 'Active', 'Environment', 'Stranger', 'Demon', 'Undead', 'Trap', 'Void', 'Water', 'Fire'];
const ARTIFACT_TAGS = ['Artifact', 'Scroll', 'Magik', 'Void', 'Tribal', 'Charm', 'Weapon', 'Armor', 'Dark Stone'];
const GEAR_SLOTS = ['Gun', 'Hand Weapon', 'Light Source', 'Tonic', 'Coat', 'Hat', 'Boots', 'Gloves', 'Charm', 'None'];
const ARTIFACT_SLOTS = ['None', 'Charm', 'Hand Weapon', 'Gun', 'Coat', 'Hat', 'Boots', 'Gloves'];

const LS_KEY = 'sob:scannedCards';

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

// ── OCR text → field guesses ─────────────────────────────────────────────────

function parseOcrText(raw, deckType) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const fullText = lines.join(' ');

  const name = lines[0] || '';

  // Flavor text heuristic: shorter italicised-looking lines between name and effect
  // Often they end with ! or ... and are shorter than 80 chars
  const flavorLine = lines.find((l, i) => i > 0 && l.length < 100 && /[.!]$/.test(l) && !/[:+\-\d]/.test(l));

  // Effect: everything after name (and flavorText if found)
  const effectStart = flavorLine ? lines.indexOf(flavorLine) + 1 : 1;
  const effectLines = lines.slice(effectStart);

  // Try to parse value ($NNN pattern)
  const valueMatch = fullText.match(/\$\s*(\d+)/);
  const value = valueMatch ? Number(valueMatch[1]) : 0;

  // Weight (Wt N)
  const weightMatch = fullText.match(/\bWt\.?\s*(\d+)/i);
  const weight = weightMatch ? Number(weightMatch[1]) : 1;

  // Upgrade slots (N upgrade slot)
  const upgradeMatch = fullText.match(/(\d+)\s+upgrade\s+slot/i);
  const upgradeSlots = upgradeMatch ? Number(upgradeMatch[1]) : 0;

  // Test for encounters: "Cunning 5+" style
  const testMatch = fullText.match(/\b(Strength|Agility|Cunning|Spirit|Lore|Luck|Initiative)\s+(\d+\+)/i);
  const test = testMatch ? `${testMatch[1]} ${testMatch[2]}` : '';

  // Promo ID for growing dread
  const promoMatch = fullText.match(/Promo-?\s*(\d+)/i);
  const promoId = promoMatch ? `Promo-${promoMatch[1]}` : '';

  const effect = effectLines.join(' ').trim();

  switch (deckType) {
    case 'darkness':
      return { name, effect, tags: ['Darkness'], remainsInPlay: false };
    case 'growingDread':
      return { id: toId(name), name, flavorText: flavorLine || '', effect, promoId };
    case 'mineEncounter':
    case 'wastesEncounter':
      return { name, tags: ['Encounter'], test, effect, remainsInPlay: false };
    case 'mineMap':
    case 'wastesMap':
      return { id: toId(name), name, image: `/assets/images/maps/${name.replace(/\s+/g, '_')}.png` };
    case 'mineLoot':
      return { name: fullText.slice(0, 120) };
    case 'wastesLoot':
      return { name, description: effect };
    case 'gear':
      return { id: toId(name), name, slot: '', effects: [effect], value, twoHanded: false, darkStone: false, upgradeSlots, restrictions: [] };
    case 'mineArtifact':
      return { id: toId(name), name, type: 'Artifact', slot: 'None', value, weight, upgradeSlots, effects: [effect], requires: '', tags: ['Artifact'] };
    default:
      return { name, effect };
  }
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
          {field('ID (auto)', 'id', 'text')}
          {textarea('Flavor Text', 'flavorText')}
          {textarea('Effect', 'effect')}
          {field('Promo ID', 'promoId', 'text', 'e.g. Promo-147')}
        </div>
      );

    case 'mineEncounter':
    case 'wastesEncounter':
      return (
        <div className="space-y-3">
          {field('Name', 'name')}
          {textarea('Effect', 'effect')}
          <div>
            <label className="text-xs font-semibold text-gray-600">Tags</label>
            <TagCheckboxes allTags={ENCOUNTER_TAGS} selected={data.tags} onChange={v => set('tags', v)} />
          </div>
          {field('Test (e.g. Cunning 5+, or leave blank)', 'test', 'text', 'Cunning 5+')}
          {toggle('Remains in Play', 'remainsInPlay')}
        </div>
      );

    case 'mineMap':
    case 'wastesMap':
      return (
        <div className="space-y-3">
          {field('Name', 'name')}
          {field('ID (auto)', 'id')}
          {field('Image path', 'image', 'text', '/assets/images/maps/Name.png')}
        </div>
      );

    case 'mineLoot':
      return (
        <div className="space-y-3">
          {field('Loot text (full)', 'name', 'text', 'e.g. Gain D6 x 50 Gold.')}
        </div>
      );

    case 'wastesLoot':
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
          {toggle('Two-Handed', 'twoHanded')}
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

    case 'mineArtifact':
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

    default:
      return null;
  }
}

// ── Export ───────────────────────────────────────────────────────────────────

function exportCards(deckType, cards) {
  const label = DECK_TYPES.find(d => d.id === deckType)?.label || deckType;
  const date = new Date().toISOString().slice(0, 10);
  const json = JSON.stringify(cards, null, 2);
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
  const [deckType, setDeckType] = useState('darkness');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rawText, setRawText] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [formData, setFormData] = useState({});
  const [hasScanned, setHasScanned] = useState(false);
  const [pending, setPending] = useState(() => loadPending());
  const fileInputRef = useRef(null);

  const currentPending = pending[deckType] || [];

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setRawText('');
    setFormData({});
    setHasScanned(false);
    setProgress(0);
  }, []);

  const handleScan = useCallback(async () => {
    if (!imageFile) return;
    setScanning(true);
    setProgress(5);
    try {
      const text = await runOcr(imageFile, setProgress);
      setRawText(text);
      const parsed = parseOcrText(text, deckType);
      setFormData(parsed);
      setHasScanned(true);
    } catch (err) {
      alert(`OCR failed: ${err.message}`);
    } finally {
      setScanning(false);
      setProgress(0);
    }
  }, [imageFile, deckType]);

  // Auto-update id when name changes
  const handleFormChange = useCallback((next) => {
    if (next.name !== formData.name && next.id !== undefined) {
      next.id = toId(next.name);
    }
    setFormData(next);
  }, [formData.name]);

  const handleAddCard = useCallback(() => {
    if (!formData.name && !formData.id) { alert('Add at least a name before confirming.'); return; }
    const updated = {
      ...pending,
      [deckType]: [...(pending[deckType] || []), { ...formData }],
    };
    setPending(updated);
    savePending(updated);
    setFormData({});
    setImageFile(null);
    setImageUrl('');
    setRawText('');
    setHasScanned(false);
  }, [formData, deckType, pending]);

  const handleRemoveCard = useCallback((idx) => {
    const updated = {
      ...pending,
      [deckType]: (pending[deckType] || []).filter((_, i) => i !== idx),
    };
    setPending(updated);
    savePending(updated);
  }, [pending, deckType]);

  const handleExport = useCallback(() => {
    if (!currentPending.length) { alert('No cards to export yet.'); return; }
    exportCards(deckType, currentPending);
  }, [deckType, currentPending]);

  const handleClearAll = useCallback(() => {
    if (!window.confirm(`Discard all ${currentPending.length} scanned ${deckType} card(s)?`)) return;
    const updated = { ...pending, [deckType]: [] };
    setPending(updated);
    savePending(updated);
  }, [pending, deckType, currentPending.length]);

  return (
    <div className="p-4 space-y-5 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold">Scan Cards</h2>
      <p className="text-sm text-gray-600">
        Select a deck, photograph a card, then correct the OCR output and confirm.
        Cards are queued locally until you export the JSON.
      </p>

      {/* Deck selector */}
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

      {/* Image capture */}
      <div className="rounded-xl border border-gray-300 p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-outline"
            onClick={() => fileInputRef.current?.click()}
          >
            📷 Take Photo / Choose Image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          {imageFile && !scanning && (
            <button className="btn btn-primary" onClick={handleScan}>
              🔍 Scan
            </button>
          )}
        </div>

        {imageUrl && (
          <img
            src={imageUrl}
            alt="Card to scan"
            className="rounded-lg max-h-64 object-contain border border-gray-200 w-full"
          />
        )}

        {scanning && (
          <div className="space-y-1">
            <div className="text-sm text-gray-600">Running OCR… {progress}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-amber-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Verification form */}
      {hasScanned && (
        <div className="rounded-xl border border-amber-400 bg-amber-50 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Verify & Edit Fields</h3>
            <button
              className="btn btn-xs btn-ghost"
              onClick={() => setShowRaw(v => !v)}
            >
              {showRaw ? 'Hide' : 'Show'} raw OCR text
            </button>
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
              Queued — {DECK_TYPES.find(d => d.id === deckType)?.label} ({currentPending.length})
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
                  {(card.effect || card.description) && (
                    <div className="text-xs text-gray-600 truncate">{card.effect || card.description}</div>
                  )}
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
        <p><strong>Tips for better OCR:</strong></p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>Flat lighting — avoid shadows across the card</li>
          <li>Keep the card straight and fully in frame</li>
          <li>Bright, even light gives the best contrast</li>
          <li>The "Show raw OCR text" panel lets you copy-paste any missed text</li>
        </ul>
      </div>
    </div>
  );
}
