// -------- Gear (supports .mods and legacy .effects) --------
const seen = new Set();

// if hero.gear is an object keyed by slots, keep the slot in hand
Object.entries(hero.gear || {}).forEach(([slot, item]) => {
  if (!item) return;

  // Deduplicate even if item.id is missing
  const dedupeKey = item.id ?? `${slot}|${item.name ?? 'unknown'}`;
  if (seen.has(dedupeKey)) return;
  seen.add(dedupeKey);

  // (1) numeric mods at top level: { meleeToHit: 1, spiritArmor: 2, agility: 1, ... }
  if (item.mods && typeof item.mods === 'object') {
    const eff = {};
    Object.entries(item.mods).forEach(([k, v]) => {
      if (typeof v !== 'number') return;
      eff[canonKey(k)] = v;
    });
    addEffect(eff, 'gear');
  }

  // (1b) nested mods under effects.mods
  if (item.effects?.mods && typeof item.effects.mods === 'object') {
    const eff = {};
    Object.entries(item.effects.mods).forEach(([k, v]) => {
      if (typeof v !== 'number') return;
      eff[canonKey(k)] = v;
    });
    addEffect(eff, 'gear');
  }

  // (2) legacy effects:
  //  - array like ["+1 Strength", ...]
  //  - plain object (excluding a nested 'mods' we already processed)
  if (Array.isArray(item.effects)) {
    addEffect(parseGearEffects(item.effects), 'gear');
  } else if (item.effects && typeof item.effects === 'object') {
    const eff = {};
    Object.entries(item.effects).forEach(([k, v]) => {
      if (k === 'mods') return; // already handled above
      eff[canonKey(k)] = v;
    });
    addEffect(eff, 'gear');
  }

  // (3) attachments (support both .mods and .effects on each attachment)
  if (Array.isArray(item.attachments)) {
    item.attachments.forEach(att => {
      if (att?.mods && typeof att.mods === 'object') {
        const eff = {};
        Object.entries(att.mods).forEach(([k, v]) => {
          if (typeof v !== 'number') return;
          eff[canonKey(k)] = v;
        });
        addEffect(eff, 'gear');
      }
      if (Array.isArray(att?.effects)) {
        addEffect(parseGearEffects(att.effects), 'gear');
      } else if (att?.effects && typeof att.effects === 'object') {
        const eff = {};
        Object.entries(att.effects).forEach(([k, v]) => {
          if (k === 'mods') return;
          eff[canonKey(k)] = v;
        });
        addEffect(eff, 'gear');
      }
    });
  }
});
