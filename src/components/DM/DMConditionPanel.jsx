import React, { useState, useMemo } from 'react';
import { injuryChart } from './injuryChart';
import { madnessChart } from './madnessChart';
import { mutationChart } from './mutationChart';

const CONDITION_TYPES = [
  { label: 'Injury', key: 'injury', chart: injuryChart },
  { label: 'Madness', key: 'madness', chart: madnessChart },
  { label: 'Mutation', key: 'mutation', chart: mutationChart },
];

// --- d66 helpers ---
function rollD66() {
  const d1 = Math.floor(Math.random() * 6) + 1; // tens
  const d2 = Math.floor(Math.random() * 6) + 1; // ones
  return d1 * 10 + d2;
}
function sanitizeToD66(v) {
  // Takes any numeric-ish string and coerces to valid d66 (11..66, digits 1..6)
  const num = Math.max(11, Math.min(66, parseInt(String(v).replace(/\D/g, '') || '0', 10)));
  let tens = Math.floor(num / 10);
  let ones = num % 10;
  if (tens < 1) tens = 1;
  if (ones < 1) ones = 1;
  if (tens > 6) tens = 6;
  if (ones > 6) ones = 6;
  return tens * 10 + ones;
}

export default function DMConditionPanel({ posse = [], updateHero }) {
  const [selectedHeroId, setSelectedHeroId] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('injury');
  const [manualRolls, setManualRolls] = useState(['', '']);   // strings to allow empty state
  const [showSecond, setShowSecond] = useState(false);
  const [inflictedIdx, setInflictedIdx] = useState(null);

  const chartsByKey = useMemo(
    () => ({
      injury: injuryChart,
      madness: madnessChart,
      mutation: mutationChart,
    }),
    []
  );

  // Find hero by id OR localId
  const hero = useMemo(() => {
    return (
      posse.find(h => String(h.id) === String(selectedHeroId)) ||
      posse.find(h => String(h.localId) === String(selectedHeroId))
    );
  }, [posse, selectedHeroId]);

  const chart = chartsByKey[selectedCondition] || [];

  const getEntry = (roll) =>
    chart.find(e => Array.isArray(e.range) && e.range.includes(Number(roll)));

  const entries = [getEntry(manualRolls[0]), getEntry(manualRolls[1])];

  // Handle manual input for both rolls (sanitized to d66 and prevents duplicate)
  const handleRollChange = (idx, value) => {
    const clean = value === '' ? '' : String(sanitizeToD66(value));
    const otherIdx = idx === 0 ? 1 : 0;

    // prevent exact duplicate if second is shown
    if (clean && showSecond && clean === manualRolls[otherIdx]) return;

    const next = [...manualRolls];
    next[idx] = clean;
    setManualRolls(next);
    setInflictedIdx(null);
  };

  // Roll buttons (d66) – guarantees non-duplicate when second is active
  const doRoll = (idx) => {
    let r = rollD66();
    if (showSecond) {
      const otherIdx = idx === 0 ? 1 : 0;
      // try a few times to avoid duplicate
      let tries = 5;
      while (manualRolls[otherIdx] && String(r) === manualRolls[otherIdx] && tries-- > 0) {
        r = rollD66();
      }
    }
    handleRollChange(idx, String(r));
  };

  // Reset state on hero or condition type change
  const reset = () => {
    setManualRolls(['', '']);
    setShowSecond(false);
    setInflictedIdx(null);
  };

  const assignCondition = (idx) => {
    if (!hero || !entries[idx]) return;
    const entry = entries[idx];

    const id = hero.id ?? hero.localId;
    if (!id || typeof updateHero !== 'function') return;

    const nextConditions = [...(hero.conditions || [])];
    nextConditions.push({
      type: selectedCondition,
      result: entry.name,
      effect: entry.effect,
      roll: Number(manualRolls[idx]),
    });

    updateHero({ id, conditions: nextConditions });
    setInflictedIdx(idx);
  };

  const canShowSecond = !!manualRolls[0] && !!entries[0];

  return (
    <div className="p-4 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold">Assign Conditions</h2>

      <div className="flex gap-2 flex-wrap items-center">
        <label>Hero:</label>
        <select
          value={selectedHeroId}
          onChange={e => { setSelectedHeroId(e.target.value); reset(); }}
        >
          <option value="">Select Hero</option>
          {posse.map(h => {
            const val = h.id ?? h.localId;
            return (
              <option key={val} value={val}>
                {h.name}
              </option>
            );
          })}
        </select>

        <label>Condition Type:</label>
        <select
          value={selectedCondition}
          onChange={e => { setSelectedCondition(e.target.value); reset(); }}
        >
          {CONDITION_TYPES.map(c => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>

        {/* First roll */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={11}
            max={66}
            value={manualRolls[0]}
            onChange={e => handleRollChange(0, e.target.value)}
            placeholder="First d66 (11–66)"
            className="input input-bordered"
            disabled={inflictedIdx !== null}
          />
          <button
            className="btn btn-secondary"
            onClick={() => doRoll(0)}
            disabled={inflictedIdx !== null}
          >
            Roll
          </button>
        </div>

        {/* Hear 2, Choose 1 */}
        {!showSecond && canShowSecond && (
          <button
            className="btn btn-outline"
            onClick={() => setShowSecond(true)}
            disabled={inflictedIdx !== null}
          >
            Hear 2, Choose 1
          </button>
        )}

        {/* Second roll */}
        {showSecond && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={11}
              max={66}
              value={manualRolls[1]}
              onChange={e => handleRollChange(1, e.target.value)}
              placeholder="Second d66 (11–66)"
              className="input input-bordered"
              disabled={inflictedIdx !== null}
            />
            <button
              className="btn btn-secondary"
              onClick={() => doRoll(1)}
              disabled={inflictedIdx !== null}
            >
              Roll
            </button>
          </div>
        )}

        {/* Reset picks */}
        <button className="btn btn-ghost ml-auto" onClick={reset}>
          Reset
        </button>
      </div>

      {/* Choice cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {entries.map((entry, idx) =>
          entry && manualRolls[idx] ? (
            <div
              key={idx}
              className={
                `border rounded p-3 bg-black text-white transition-colors duration-200 
                ${inflictedIdx === idx ? 'border-green-500 ring-2 ring-green-300' : ''}`
              }
            >
              <div className="flex items-baseline justify-between">
                <strong className="text-base">{entry.name}</strong>
                <span className="text-xs opacity-70">Roll: {manualRolls[idx]}</span>
              </div>
              <div className="text-xs italic mt-1 whitespace-pre-line">{entry.effect}</div>

              <button
                className={`btn btn-success mt-3 ${(!hero || inflictedIdx !== null) ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={() => assignCondition(idx)}
                disabled={!hero || inflictedIdx !== null}
              >
                Assign to {hero ? hero.name : 'Hero'}
              </button>

              {inflictedIdx === idx && (
                <div className="mt-2 text-green-300 font-bold">Inflicted!</div>
              )}
            </div>
          ) : null
        )}
      </div>

      {/* Hero condition list */}
      {hero && Array.isArray(hero.conditions) && hero.conditions.length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold">Current Conditions for {hero.name}:</h4>
          <ul className="list-disc list-inside">
            {hero.conditions.map((c, idx) => (
              <li key={idx}>
                <span className="font-bold">{String(c.type || '').toUpperCase()}:</span>
                <span className="ml-1">{c.result} — </span>
                <span className="italic">{c.effect}</span>
                {c.roll ? <span className="ml-1 text-xs text-gray-400">(roll: {c.roll})</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
