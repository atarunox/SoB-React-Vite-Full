// src/utils/upgradeSlots.js

export function slotsRemaining(item = {}) {
  const total = Number(item.upgradeSlots ?? 0);
  const used  = Array.isArray(item.upgrades) ? item.upgrades.length : 0;
  return Math.max(0, total - used);
}

export function canAcceptUpgrade(item) {
  return slotsRemaining(item) > 0;
}

/**
 * Normalise the various "what can this attach to" fields into a single
 * lowercase string array. Handles:
 *   attachTo: ['Gun', 'Hand Weapon']   (blacksmith)
 *   attachTo: 'Any item (limit 1)'     (indian trading post)
 *   attachTo: ['Any']                  (general)
 *   requires: 'Hand Weapon'            (wasteland workshop)
 *   requires: 'Any Item'
 *   requires: 'Wasteland Scrap Armor'
 */
export function getAttachTargets(upgrade = {}) {
  const raw = upgrade.attachTo ?? upgrade.requires ?? null;
  if (!raw) return null; // null = no restriction declared

  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map(s => String(s).toLowerCase().trim());
}

const ANY_PATTERN = /^any\b/i;

/**
 * Returns true if the upgrade can be attached to the given gear item.
 * itemTags should be a lowercase string array of the item's tags + slot + type.
 */
export function isCompatible(upgrade, itemTags = []) {
  const targets = getAttachTargets(upgrade);
  if (!targets) return true; // no restriction → universal
  return targets.some(t => {
    if (ANY_PATTERN.test(t)) return true;
    return itemTags.some(tag => tag.includes(t) || t.includes(tag));
  });
}

/**
 * Normalise mods: some location files use `modifiers`, others use `mods`.
 * Returns a plain {stat: number} object for use in the stat pipeline.
 */
export function normaliseMods(upgrade = {}) {
  const src = upgrade.mods ?? upgrade.modifiers ?? null;
  if (!src || typeof src !== 'object') return null;
  const out = {};
  for (const [k, v] of Object.entries(src)) {
    if (typeof v === 'number') out[k] = v;
  }
  return Object.keys(out).length ? out : null;
}

/**
 * Apply an upgrade to a gear item.
 * Returns a NEW item object with the upgrade appended to `upgrades[]`.
 * Normalises mods/modifiers → mods so the stat pipeline always sees `mods`.
 */
export function applyUpgrade(item, upgrade) {
  const nextUpgrades = [
    ...(item.upgrades ?? []),
    {
      id: upgrade.id ?? upgrade.key ?? upgrade.name
        ?? (typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2)),
      name:        upgrade.name        ?? 'Upgrade',
      description: upgrade.description ?? (Array.isArray(upgrade.effects) ? upgrade.effects.join(' ') : ''),
      effects:     upgrade.effects     ?? [],
      mods:        normaliseMods(upgrade),
    },
  ];

  return { ...item, upgrades: nextUpgrades };
}

/**
 * Merge an item's own mods + all applied upgrade mods.
 */
export function collectModsFromItem(item = {}) {
  const out = { ...(item.mods ?? {}) };
  for (const u of (item.upgrades ?? [])) {
    const m = u?.mods;
    if (!m || typeof m !== 'object') continue;
    for (const [k, v] of Object.entries(m)) {
      if (typeof v === 'number') out[k] = (out[k] ?? 0) + v;
    }
  }
  return out;
}
