// src/utils/upgradeSlots.js

/**
 * Count how many upgrade slots remain on an item.
 * Expects:
 *   - item.upgradeSlots: number of total slots (0+)
 *   - item.upgrades: array of applied upgrades
 */
export function slotsRemaining(item = {}) {
  const total = Number(item.upgradeSlots ?? 0);
  const used  = Array.isArray(item.upgrades) ? item.upgrades.length : 0;
  return Math.max(0, total - used);
}

/** Quick predicate: can this item accept another upgrade right now? */
export function canAcceptUpgrade(item) {
  return slotsRemaining(item) > 0;
}

/**
 * Apply a blacksmith upgrade to an item.
 * Returns a NEW item with the upgrade appended to `upgrades[]`.
 *
 * The `upgrade` object can include:
 *   { id?, name, description?, mods? }
 * where `mods` is merged by your stat pipeline (e.g., calculateCurrentStats).
 */
export function applyUpgrade(item, upgrade) {
  const nextUpgrades = [
    ...(item.upgrades ?? []),
    {
      id: upgrade.id
        ?? upgrade.key
        ?? upgrade.name
        ?? (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)),
      name: upgrade.name ?? 'Upgrade',
      description: upgrade.description ?? '',
      mods: upgrade.mods ?? null,
    }
  ];

  return { ...item, upgrades: nextUpgrades };
}

/**
 * Helper: merge an item's own mods + any upgrade mods into one object.
 * Use this in your stat aggregation if you want upgrades to affect stats.
 */
export function collectModsFromItem(item = {}) {
  const out = { ...(item.mods ?? {}) };
  const ups = Array.isArray(item.upgrades) ? item.upgrades : [];
  for (const u of ups) {
    if (!u?.mods || typeof u.mods !== 'object') continue;
    for (const [k, v] of Object.entries(u.mods)) {
      if (typeof v !== 'number') continue;
      out[k] = (out[k] ?? 0) + v;
    }
  }
  return out;
}
