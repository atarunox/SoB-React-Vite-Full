// src/components/DM/LocationEventRollInput.jsx
import React, { useEffect, useState } from 'react';
import {
  ensureEventRolled,
  getEventState,
  setEventRoll,
} from '../../utils/locationEventsEngine';

function clamp2d6(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  return Math.max(2, Math.min(12, v));
}

/**
 * Controlled numeric input for a Location Event roll (2d6 total).
 * - Allows empty/partial typing ('' or '1') without breaking.
 * - Commits only valid values (2..12) on Enter/blur.
 * - Mirrors the saved value back to the input after commit.
 * - Updates if the roll is changed elsewhere (reroll button, resolve, etc.).
 */
export default function LocationEventRollInput({
  shopId,
  className = 'input input-bordered w-24',
  onCommit,            // optional: parent can refresh/broadcast
}) {
  const [rollStr, setRollStr] = useState('');

  // Local helper to read current engine state
  const seedFromEngine = React.useCallback(() => {
    if (!shopId) return '';
    const rec = getEventState(shopId) || ensureEventRolled(shopId);
    return rec?.roll != null ? String(rec.roll) : '';
  }, [shopId]);

  // Seed on mount / shop change
  useEffect(() => {
    setRollStr(seedFromEngine());
  }, [seedFromEngine]);

  // Refresh when town state broadcasts a change (e.g., Resolve/Reroll elsewhere)
  useEffect(() => {
    const onChange = () => setRollStr(seedFromEngine());
    window.addEventListener('sobTownStateChanged', onChange);
    return () => window.removeEventListener('sobTownStateChanged', onChange);
  }, [seedFromEngine]);

  const broadcast = () => {
    try {
      window.dispatchEvent(new Event('sobTownStateChanged'));
    } catch {}
  };
  const commit = () => {
    if (!shopId) return;
    const c = clamp2d6(rollStr);
    if (c == null) return; // ignore empty / NaN
    const next = setEventRoll(shopId, c); // updates engine cache
    setRollStr(next?.roll != null ? String(next.roll) : String(c)); // reflect normalized value
	if (typeof onCommit === 'function') onCommit(Number(next?.roll ?? c));
    broadcast();
  };

  const nudge = (delta) => {
    const cur = clamp2d6(rollStr);
    const base = cur == null ? 7 : cur; // default center if empty
    const next = Math.max(2, Math.min(12, base + delta));
    const rec = setEventRoll(shopId, next);
    setRollStr(rec?.roll != null ? String(rec.roll) : String(next));
	if (typeof onCommit === 'function') onCommit(Number(rec?.roll ?? next));
    broadcast();
  };

  return (
    <input
      type="number"
      inputMode="numeric"
      min={2}
      max={12}
      step={1}
      className={className}
      placeholder="2–12"
      disabled={!shopId}
      value={rollStr}
      onChange={(e) => {
        // allow empty while typing, digits only
        const next = e.target.value.replace(/[^\d]/g, '');
        setRollStr(next);
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commit();
          e.currentTarget.blur();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          nudge(+1);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          nudge(-1);
        }
      }}
      title={!shopId ? 'No shop selected' : 'Enter a 2–12 roll total'}
    />
  );
}
