// src/components/BlacksmithUpgradeReward.jsx
import React, { useMemo, useState } from 'react';
import { useHero } from '../context/HeroContext';
import { usePosse } from '../context/PosseContext';
import { canAcceptUpgrade, applyUpgrade, slotsRemaining } from '../utils/upgradeSlots';

/**
 * Props:
 *  - listedUpgrade: { name, description?, mods? }
 *  - onDone?: () => void
 *
 * Behavior:
 *  - Lists all owned items (equipped + inventory) with an empty upgrade slot
 *  - Applies the given upgrade to the selected item
 *  - Persists via updateHero from contexts
 */
export default function BlacksmithUpgradeReward({ listedUpgrade, onDone }) {
  const { hero, updateHero } = useHero();
  const posseCtx = usePosse();

  const [itemId, setItemId] = useState('');

  // Build a flat list of owned items and where they live (gear/inventory)
  const eligibleItems = useMemo(() => {
    if (!hero) return [];
    const equip = Object.entries(hero?.gear ?? {})
      .map(([slot, it]) => (it ? { ...it, _where: 'gear', _slot: slot, _key: `gear_${slot}` } : null))
      .filter(Boolean);

    const inv = (hero?.inventory ?? [])
      .map((it, idx) => (it ? { ...it, _where: 'inventory', _key: `inv_${idx}_${it.id || idx}` } : null))
      .filter(Boolean);

    return [...equip, ...inv].filter(canAcceptUpgrade);
  }, [hero]);

  const applyToSelected = () => {
    if (!itemId || !hero) return;

    const all = [
      ...Object.entries(hero?.gear ?? {}).map(([slot, it]) => (it ? { ...it, _where: 'gear', _slot: slot, _key: `gear_${slot}` } : null)).filter(Boolean),
      ...(hero?.inventory ?? []).map((it, idx) => (it ? { ...it, _where: 'inventory', _key: `inv_${idx}_${it.id || idx}` } : null)).filter(Boolean),
    ];
    const target = all.find(i => i._key === itemId);
    if (!target) return;

    const nextHero = {
      ...hero,
      gear: { ...(hero?.gear ?? {}) },
      inventory: [ ...(hero?.inventory ?? []) ],
      updatedAt: Date.now(),
    };

    if (target._where === 'gear') {
      const cur = nextHero.gear[target._slot];
      nextHero.gear[target._slot] = applyUpgrade(cur, listedUpgrade);
    } else {
      const invIdx = parseInt(target._key.split('_')[1], 10);
      if (invIdx >= 0 && invIdx < nextHero.inventory.length) nextHero.inventory[invIdx] = applyUpgrade(nextHero.inventory[invIdx], listedUpgrade);
    }

    // Persist using both (harmless if same function underneath)
    updateHero(nextHero);
    posseCtx?.updateHero?.(nextHero);

    const left = Math.max(0, slotsRemaining(target) - 1);
    alert(`Applied "${listedUpgrade.name}" to "${target.name}". (${left} slot${left === 1 ? '' : 's'} remain)`);

    onDone?.();
  };

  if (!hero) {
    return (
      <div className="rounded-xl border p-3 bg-white/80">
        <div className="font-semibold">Blacksmith (12)</div>
        <div className="text-sm text-gray-700 mt-1">No active hero.</div>
        <div className="mt-2">
          <button className="btn btn-sm" onClick={() => onDone?.()}>OK</button>
        </div>
      </div>
    );
  }

  if (!eligibleItems.length) {
    return (
      <div className="rounded-xl border p-3 bg-white/80">
        <div className="font-semibold">Blacksmith (12)</div>
        <div className="text-sm text-gray-700 mt-1">
          You have no items with empty upgrade slots.
        </div>
        <div className="mt-2">
          <button className="btn btn-sm" onClick={() => onDone?.()}>OK</button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-3 bg-white/80">
      <div className="font-semibold">Blacksmith (12)</div>
      <div className="text-sm text-gray-700 mt-1">
        Choose an item with an empty upgrade slot to receive: <b>{listedUpgrade.name}</b>
      </div>

      {!!listedUpgrade?.description && (
        <div className="text-xs text-gray-600 mt-1 italic">{listedUpgrade.description}</div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <select
          className="border rounded px-2 py-1"
          value={itemId}
          onChange={e => setItemId(e.target.value)}
        >
          <option value="">Select item…</option>
          {eligibleItems.map(it => (
            <option key={it._key} value={it._key}>
              {it.name} {it._where === 'gear' ? `(Equipped: ${it._slot})` : '(Inventory)'} · slots left {slotsRemaining(it)}
            </option>
          ))}
        </select>

        <button className="btn btn-primary btn-sm" onClick={applyToSelected} disabled={!itemId}>
          Apply Upgrade
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => onDone?.()}>Cancel</button>
      </div>
    </div>
  );
}
