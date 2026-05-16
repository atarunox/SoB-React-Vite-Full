// src/components/DM/DMChartPanel.jsx
import React, { useMemo, useState } from 'react';
import { usePosse } from '../../context/PosseContext';
import { injuryChart } from './charts/injuryChart';
import { madnessChart } from './charts/madnessChart';
import { mutationChart } from './charts/mutationChart';
import { CONDITION_EFFECTS, inferEffectsFromText } from '../../utils/conditionEffects';
import { withConditionAppended } from '../../utils/mergeConditions';
import { useHexCrawlSettings } from '../../hooks/useHexCrawlSettings';

const HEX_CHARTS = { Injury: injuryChart, Madness: madnessChart, Mutation: mutationChart };
const HEX_KEYS   = { Injury: 'injuryChart', Madness: 'madnessChart', Mutation: 'mutationChart' };


const isValidD66 = (n) => {
  if (!Number.isFinite(n)) return false;
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return n >= 11 && n <= 66 && tens >= 1 && tens <= 6 && ones >= 1 && ones <= 6;
};

const toInt = (v) => {
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
};

const expandRolls = (e) => {
  if (!e || typeof e !== 'object') return [];
  if (Array.isArray(e.range)) return e.range.map(toInt).filter(Number.isFinite);
  if (e.min != null && e.max != null) {
    const a = toInt(e.min), b = toInt(e.max);
    if (Number.isFinite(a) && Number.isFinite(b)) {
      const out = [];
      for (let i = a; i <= b; i++) out.push(i);
      return out;
    }
  }
  if (e.start != null && e.end != null) {
    const a = toInt(e.start), b = toInt(e.end);
    if (Number.isFinite(a) && Number.isFinite(b)) {
      const out = [];
      for (let i = a; i <= b; i++) out.push(i);
      return out;
    }
  }
  if (e.roll != null) {
    const n = toInt(e.roll);
    return Number.isFinite(n) ? [n] : [];
  }
  if (e.Roll != null) {
    const n = toInt(e.Roll);
    return Number.isFinite(n) ? [n] : [];
  }
  return [];
};

const bucketKeyForType = (t) => {
  const s = String(t || '').toLowerCase();
  if (s === 'injury') return 'injury';
  if (s === 'mutation') return 'mutation';
  if (s === 'madness') return 'madness';
  return null;
};

const makeId = (type, roll) => {
  const rand = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);
  return `${String(type || 'Cond').toLowerCase()}_${rand}_${roll || 'xx'}`;
};

export default function DMChartPanel() {
  const { posse, updateHero } = usePosse();
  const { settings } = useHexCrawlSettings();

  const [selectedHeroId, setSelectedHeroId] = useState('');
  const [type, setType] = useState('Injury');
  const [rolls, setRolls] = useState(['', '']);
  const [showSecond, setShowSecond] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [inflictedIdx, setInflictedIdx] = useState(null);

  const selectedHero = Array.isArray(posse)
    ? posse.find(h => (h.id || h.localId) === selectedHeroId)
    : null;

  const useHexChart = settings[HEX_KEYS[type]] ?? true;
  const chart = useHexChart ? (HEX_CHARTS[type] || []) : [];

  const lookup = useMemo(() => {
    const m = new Map();
    chart.forEach((entry) => {
      expandRolls(entry).forEach((n) => {
        if (Number.isFinite(n)) m.set(n, entry);
      });
    });
    return m;
  }, [chart]);

  const getEntry = (roll) => {
    const n = toInt(roll);
    if (!isValidD66(n)) return null;
    return lookup.get(n) || null;
  };

  const entries = [getEntry(rolls[0]), getEntry(rolls[1])];

  const handleRollChange = (idx, value) => {
    const sanitized = String(value).replace(/^0+/, '');
    const other = idx === 0 ? 1 : 0;
    if (sanitized && sanitized === rolls[other]) return;
    const next = [...rolls];
    next[idx] = sanitized;
    setRolls(next);
    setResolved(false);
    setInflictedIdx(null);
  };

  const reset = () => {
    setRolls(['', '']);
    setShowSecond(false);
    setResolved(false);
    setInflictedIdx(null);
  };

  const handleInflict = (idx) => {
    if (!selectedHero || !entries[idx]) return;
    const entry = entries[idx];

    const effects =
      CONDITION_EFFECTS[entry.name] ||
      inferEffectsFromText(entry.name, entry.effect) ||
      undefined;

    const rollVal = toInt(rolls[idx]);
    const newCondition = {
      id: makeId(type, rollVal),
      type,                       // "Injury" | "Madness" | "Mutation"
      roll: rollVal,
      name: entry.name,
      flavor: entry.flavor,
      effectText: entry.effect,
      ...(effects ? { effects } : {}),
      addedAt: Date.now(),
    };

    const id = selectedHero.id || selectedHero.localId;
    const bucket = bucketKeyForType(type) || 'injury';

    // MERGE into existing conditions (do not overwrite other buckets like 'temporary')
    const nextConditions = withConditionAppended(selectedHero.conditions, bucket, newCondition);

    updateHero({ id, conditions: nextConditions, updatedAt: Date.now() });

    setResolved(true);
    setInflictedIdx(idx);
  };

  const heroes = Array.isArray(posse)
    ? posse
        .map(h => ({ id: h.id || h.localId, name: h.name || h.heroName || h.heroClass || 'Hero' }))
        .filter(h => h.id)
    : [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Apply Condition</h2>

      {!useHexChart && (
        <div className="rounded-lg border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          📖 <strong>Standard Brimstone chart active</strong> — roll on the physical D66 chart and manually record the result. Enable HexCrawl charts in <em>Options → Settings</em> to use the digital D36 lookup.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <select
          value={selectedHeroId}
          onChange={e => { setSelectedHeroId(e.target.value); reset(); }}
          className="select select-bordered"
        >
          <option value="">Select Hero</option>
          {heroes.map(h => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>

        <select
          value={type}
          onChange={e => { setType(e.target.value); reset(); }}
          className="select select-bordered"
        >
          <option>Injury</option>
          <option>Madness</option>
          <option>Mutation</option>
        </select>

        <input
          type="number"
          min={11}
          max={66}
          value={rolls[0]}
          onChange={e => handleRollChange(0, e.target.value)}
          className="input input-bordered"
          placeholder={useHexChart ? 'Roll (D36 → 11–66)' : 'Roll (D66 → 11–66)'}
          disabled={resolved}
        />

        {!showSecond && isValidD66(toInt(rolls[0])) && entries[0] && (
          <button
            onClick={() => setShowSecond(true)}
            className="btn btn-secondary"
            disabled={resolved}
          >
            Hear 2, Choose 1
          </button>
        )}

        {showSecond && (
          <input
            type="number"
            min={11}
            max={66}
            value={rolls[1]}
            onChange={e => handleRollChange(1, e.target.value)}
            className="input input-bordered"
            placeholder="Second Roll (11–66)"
            disabled={resolved}
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {entries.map((entry, idx) =>
          entry && rolls[idx] ? (
            <div
              key={idx}
              className={`p-3 border rounded bg-base-100
                ${resolved ? 'opacity-50' : ''}
                ${inflictedIdx === idx ? 'border-green-600 ring-2 ring-green-400 opacity-100' : ''}`}
            >
              <h3 className="font-bold">{entry.name}</h3>
              {entry.flavor && (
                <p className="text-xs italic text-gray-600">{entry.flavor}</p>
              )}
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {entry.effect}
              </p>

              {(() => {
                const fromName = CONDITION_EFFECTS[entry.name];
                const inferred = inferEffectsFromText(entry.name, entry.effect);
                const eff = fromName || inferred;
                if (!eff) return null;
                return (
                  <div className="mt-2 text-xs">
                    <div className="font-semibold">Will apply:</div>
                    <ul className="list-disc list-inside">
                      {Object.entries(eff).map(([k, v]) => (
                        <li key={k}>
                          {k}: {v > 0 ? `+${v}` : v}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => handleInflict(idx)}
                  className="btn btn-primary"
                  disabled={resolved || !selectedHero}
                >
                  Inflict This
                </button>
                <span className="text-xs text-gray-500">Roll: {rolls[idx]}</span>
                {resolved && inflictedIdx === idx && (
                  <span className="text-green-700 font-semibold">Inflicted!</span>
                )}
              </div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
