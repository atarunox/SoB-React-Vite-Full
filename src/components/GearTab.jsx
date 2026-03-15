// src/components/GearTab.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePosse } from '../context/PosseContext';
import { useHero } from '../context/HeroContext';
import { flattenTokens } from '../data/SidebagLibrary';
import { calculateCurrentStats } from '../utils/calculateStats';
import { getConditionRules } from '../utils/conditionRules';
import { ASSETS } from './TownTab/townTabHelpers';
import churchBlessedAuras from '../data/townLocations/FrontierTown/Church/churchBlessedAuras.js';

// --------------------------------- helpers ---------------------------------
const baseGearSlots = [
  'Main Hand', 'Off Hand', 'Head', 'Torso', 'Coat', 'Gloves', 'Hands',
  'Pants', 'Feet', 'Shoulders', 'Face', 'Necklace', 'Belt', 'Ring',
  'Light Source', 'Container', 'Ally', 'Misc', 'Mark', 'Charm',
  'Book', 'Injection', 'Blessed Aura', 'Ammo', 'Transport', 'Badge', 'Glyph', 'Arrow', 'Extra 1', 'Extra 2',
];

const PAGE1_SLOTS = [
  'Main Hand', 'Off Hand',
  'Head', 'Torso', 'Coat',
  'Ring', 'Belt', 'Necklace',
  'Gloves', 'Hands', 'Pants', 'Feet',
  'Shoulders', 'Face'
];

const CELLS_PAGE1 = 14; // 7 x 2
const CELLS_PAGE2 = 12; // 6 x 2

function ensureItemId(item) {
  if (!item) return item;
  if (item.id) return item;
  const genId = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${item.name || 'item'}_${Math.random().toString(36).slice(2)}`;
  return { ...item, id: genId };
}

function uid() {
  return (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);
}

// Ensure uniqueness by id (first one wins)
function uniqueById(arr = []) {
  const seen = new Set();
  const out = [];
  for (const it of arr) {
    const key = String(it?.id ?? '');
    if (!key) { out.push(it); continue; }
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

function aggregateGearMods(gearObj = {}) {
  const totals = {};
  const seen = new Set();
  for (const it of Object.values(gearObj)) {
    const key = String(it?.id ?? '');
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    if (!it || !it.mods) continue;
    for (const [k, v] of Object.entries(it.mods)) {
      // Handle threshold strings like '5+' (Armor, Spirit Armor, etc.)
      if (typeof v === 'string' && /^\d+\+$/.test(v.trim())) {
        const newThresh = parseInt(v, 10);
        const cur = totals[k];
        if (typeof cur === 'string' && /^\d+\+$/.test(cur)) {
          const curNum = parseInt(cur, 10);
          if (newThresh < curNum) totals[k] = v.trim();
        } else if (cur == null) {
          totals[k] = v.trim();
        }
        continue;
      }
      if (typeof v !== 'number') continue;
      totals[k] = (totals[k] || 0) + v;
    }
  }
  return totals;
}

function toNumberLoose(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v === 'string') {
    const m = v.replace(/[, ]/g, '').match(/-?\d+(\.\d+)?/);
    return m ? Number(m[0]) : 0;
  }
  if (v && typeof v === 'object') {
    return toNumberLoose(v.amount ?? v.value ?? v.val ?? 0);
  }
  return 0;
}

function extractGold(it = {}) {
  if (it.cost && typeof it.cost === 'object' && Number(it.cost.gold) > 0) {
    return Number(it.cost.gold);
  }
  const cand = [
    it.value?.gold, it.value?.cost, it.value?.price,
    it.gold, it.goldValue, it.costGold,
    it.cost, it.price, it.value, it.buy, it.sell, it.worth,
  ];
  for (const c of cand) {
    const n = toNumberLoose(c);
    if (n > 0) return n;
  }
  return 0;
}

function extractDarkStone(it = {}) {
  if (it.cost && typeof it.cost === 'object' && Number(it.cost.darkStone) > 0) {
    return Number(it.cost.darkStone);
  }
  const cand = [
    it.value?.darkStone, it.value?.darkstone,
    it.darkStone, it.darkstone, it.ds, it.dsValue, it.darkStoneValue, it.darkStoneCost,
  ];
  for (const c of cand) {
    const n = toNumberLoose(c);
    if (n > 0) return n;
  }
  return 0;
}

function getItemWeight(it) {
  if (!it || it.noWeight) return 0;
  if (String(it.name || '').toLowerCase() === 'empty slot') return 0;
  const w = toNumberLoose(
    it.value?.weight ?? it.weightIcons ?? it.weight ?? it.w ?? 0
  );
  return Number.isFinite(w) ? w : 0;
}

function hasDarkStoneIcon(it) {
  if (!it) return false;
  return !!(it.darkStoneIcon || it.hasDarkStone || it.darkstone || it.dsIcon);
}

function hasTag(it, tag) {
  if (!it || !Array.isArray(it.tags)) return false;
  const target = String(tag).toLowerCase();
  return it.tags.map(String).some(t => t.toLowerCase() === target);
}

function countDarkStoneCarried(heroLike) {
  const dsBase =
    Number(heroLike?.darkStone) ||
    Number(heroLike?.ds) ||
    Number(heroLike?.resources?.darkStone) ||
    0;

  const seen = new Set();
  const allItems = [
    ...Object.values(heroLike?.gear || {}),
    ...(heroLike?.inventory || [])
  ].filter(Boolean);

  let dsFromIcons = 0;
  for (const it of allItems) {
    const id = String(it.id ?? `${it.name}-${Math.random()}`);
    if (seen.has(id)) continue;
    seen.add(id);
    if (hasDarkStoneIcon(it)) dsFromIcons += 1;
  }

  return dsBase + dsFromIcons;
}

function totalWeight(heroLike) {
  const equipped = Object.values(heroLike?.gear || {}).filter(Boolean);
  const inv = (heroLike?.inventory || []).filter(i => i && i.name !== 'Empty Slot');

  const uniqById = (arr) => {
    const m = new Map();
    for (const it of arr) {
      const id = String(it?.id ?? `${it?.name}-${Math.random()}`);
      m.set(id, it);
    }
    return [...m.values()];
  };

  const eqUniq = uniqById(equipped);
  const invUniq = uniqById(inv);

  const eqW = eqUniq.reduce((a, it) => a + getItemWeight(it), 0);
  const invW = invUniq.reduce((a, it) => a + getItemWeight(it), 0);

  const dsWeight = 0;
  return { eqW, invW, dsWeight, total: eqW + invW + dsWeight };
}

function carryCapacity(heroLike, rules) {
  const { stats = {} } = calculateCurrentStats(heroLike || {});
  const str = Number(stats['Strength']) || 0;
  const base = str + 5;
  const delta = Number(rules?.carryCapacityDelta || 0);
  return Math.max(0, base + delta);
}

function handsInUse(gearObj = {}) {
  let used = 0;
  const main = gearObj['Main Hand'];
  const off  = gearObj['Off Hand'];
  if (main && off && main?.id === off?.id) return 2;
  if (main && main.name !== 'Empty Slot') used += 1;
  if (off && off.name !== 'Empty Slot')  used += 1;
  return used;
}
function totalHandsAvailable(heroLike, rules) {
  const base = 2;
  return Math.max(0, base + Number(rules?.handsAvailableDelta || 0));
}

const isGun = (it) => !!it && (it.slot === 'Gun' || it.type === 'Gun' || it.category === 'Gun');
const isArtifact = (it) =>
  !!it && (it.isArtifact || it.artifact || it.rarity === 'Artifact' || hasTag(it, 'Artifact'));

// ---------------- Sidebag presets ----------------
const PRESETS_ALL = Array.isArray(flattenTokens?.()) ? flattenTokens() : [];

export default function GearTab({ hero: heroProp, updateHero: updateHeroProp }) {
  const posseCtx = usePosse();
  const posse = posseCtx.posse || [];
  const cloudUpdateHero = updateHeroProp || posseCtx.updateHero;

  const { hero: activeHero, updateHero: updateActiveHero } = useHero();

  const heroId = heroProp?.id || heroProp?.localId || null;
  const liveHero = useMemo(() => {
    if (!heroId) return heroProp || null;
    return posse.find(h => (h.id || h.localId) === heroId) || heroProp || null;
  }, [posse, heroId, heroProp]);

  const [viewHero, setViewHero] = useState(liveHero);
  useEffect(() => { setViewHero(liveHero); }, [liveHero]);

  const optimisticUntilRef = useRef(0);
  const bumpOptimisticWindow = () => { optimisticUntilRef.current = Date.now() + 4000; };

  useEffect(() => {
    if (!liveHero) { setViewHero(liveHero); return; }
    const now = Date.now();
    const localHasGear = Object.keys(viewHero?.gear || {}).length > 0;
    const serverHasGear = Object.keys(liveHero?.gear || {}).length > 0;

    setViewHero(prev => {
      if (serverHasGear && !localHasGear) return liveHero;
      if (now < optimisticUntilRef.current) return prev || liveHero;
      const same = (a = {}, b = {}) => {
        const aGear = a.gear || {};
        const bGear = b.gear || {};
        const aSlots = Object.keys(aGear).sort();
        const bSlots = Object.keys(bGear).sort();
        if (aSlots.length !== bSlots.length) return false;
        for (let i = 0; i < aSlots.length; i++) {
          if (aSlots[i] !== bSlots[i]) return false;
          const aId = aGear[aSlots[i]]?.id ?? null;
          const bId = bGear[bSlots[i]]?.id ?? null;
          if (String(aId) !== String(bId)) return false;
        }
        const aInvIds = (a.inventory || []).map(i => String(i?.id)).sort().join('|');
        const bInvIds = (b.inventory || []).map(i => String(i?.id)).sort().join('|');
        if (aInvIds !== bInvIds) return false;
        const aExtras = JSON.stringify(a.extraGearSlots || []);
        const bExtras = JSON.stringify(b.extraGearSlots || []);
        return aExtras === bExtras;
      };
      return (!prev || !same(prev, liveHero)) ? liveHero : prev;
    });
  }, [
    liveHero?.id,
    liveHero?.localId,
    (liveHero?.inventory || []).length,
    (liveHero?.extraGearSlots || []).length,
    Object.keys(liveHero?.gear || {}).map(s => `${s}:${liveHero?.gear?.[s]?.id ?? ''}`).join('|'),
    liveHero?.sidebags?.capacity,
    (liveHero?.sidebags?.items || []).map(i => `${i?.name}:${i?.qty}`).join('|'),
    JSON.stringify(liveHero?.sideBag || liveHero?.sideBagTokens || null),
  ]);

  // Local UI state
  const [extraSlots, setExtraSlots] = useState([]);
  const [activeTab, setActiveTab] = useState('Equipped'); // Equipped | Inventory | Sidebags | Buffs
  const [equipPage, setEquipPage] = useState(1);
  const [showStatMods, setShowStatMods] = useState(false);

  // Inventory filter
  const [inventoryQuery, setInventoryQuery] = useState('');

  // De-duped Sidebag Presets
  const PRESETS = useMemo(() => {
    const m = new Map();
    for (const p of PRESETS_ALL) {
      const key = String(p?.name || '').toLowerCase();
      if (!key) continue;
      if (!m.has(key)) m.set(key, { name: p.name, description: p.description || '' });
    }
    return Array.from(m.values());
  }, []);

  const [presetQuery, setPresetQuery] = useState('');
  const chosenPreset = useMemo(() => {
    const q = presetQuery.trim().toLowerCase();
    if (!q) return null;
    return (
      PRESETS.find(p => p.name.toLowerCase() === q) ||
      PRESETS.find(p => p.name.toLowerCase().startsWith(q)) ||
      PRESETS.find(p => p.name.toLowerCase().includes(q)) ||
      null
    );
  }, [presetQuery, PRESETS]);

  useEffect(() => {
    setExtraSlots(Array.isArray(viewHero?.extraGearSlots) ? viewHero.extraGearSlots : []);
    setEquipPage(1);
  }, [viewHero?.id, viewHero?.localId]);

  const saveHero = (nextHero) => {
    bumpOptimisticWindow();
    const nextId = nextHero?.id || nextHero?.localId;
    const currentId = viewHero?.id || viewHero?.localId;
    const activeId = activeHero?.id || activeHero?.localId;

    if (nextId && currentId && String(nextId) === String(currentId)) {
      setViewHero(nextHero);
    }
    if (typeof cloudUpdateHero === 'function') {
      cloudUpdateHero({ ...nextHero });
    }
    if (nextId && activeId && String(nextId) === String(activeId) && typeof updateActiveHero === 'function') {
      updateActiveHero({ ...nextHero });
    }
  };

  // Ensure IDs for inventory items
  useEffect(() => {
    const inv = Array.isArray(viewHero?.inventory) ? viewHero.inventory : [];
    if (inv.some(i => i && !i.id) && (viewHero?.id || viewHero?.localId)) {
      const patched = inv.map(ensureItemId);
      const nextHero = { ...viewHero, inventory: patched, updatedAt: Date.now() };
      saveHero(nextHero);
      try { setViewHero && setViewHero(nextHero); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewHero?.id, viewHero?.localId, viewHero?.inventory?.length]);

  if (!viewHero) return <p className="p-4 text-lg">No hero selected.</p>;

  // Render from optimistic view
  const inventoryRaw = (viewHero.inventory || [])
    .filter(i => i?.name !== 'Empty Slot')
    .map(ensureItemId);

  const inventoryUnique = useMemo(() => uniqueById(inventoryRaw), [
    (viewHero?.inventory || []).length,
    (viewHero?.inventory || []).map(i => `${i?.id || ''}:${i?.name || ''}`).join('|'),
  ]);

  // Filtered inventory
  const invFiltered = useMemo(() => {
    const q = inventoryQuery.trim().toLowerCase();
    if (!q) return inventoryUnique;
    return inventoryUnique.filter(i => {
      const name = String(i.name || '').toLowerCase();
      const slot = String(i.slot || '').toLowerCase();
      return name.includes(q) || slot.includes(q);
    });
  }, [inventoryQuery, inventoryUnique]);

  const gear = viewHero.gear || {};
  const sidebags = (function ensureSidebags(hero) {
    const sb = hero?.sidebags;
    const base = (sb && typeof sb === 'object') ? sb : { capacity: 6, items: [] };
    const capacity = Number.isFinite(base.capacity) ? base.capacity : 6;
    const items = Array.isArray(base.items)
      ? base.items.map(i => {
          const id = i?.id || uid();
          const name = i?.name || 'Token';
          const qty = Math.max(1, Number(i?.qty) || 1);
          const preset = PRESETS.find(p => p.name.toLowerCase() === String(name).toLowerCase());
          const description = i?.description || preset?.description || '';
          return { id, name, qty, description };
        })
      : [];

    // Merge tokens from legacy flat sideBag format (e.g. { Whiskey: 2, 'Fine Cigar': 1 })
    const legacy = hero?.sideBag || hero?.sideBagTokens;
    if (legacy && typeof legacy === 'object' && !Array.isArray(legacy)) {
      for (const [tokenName, count] of Object.entries(legacy)) {
        const qty = Math.max(0, Number(count) || 0);
        if (qty <= 0 || !tokenName) continue;
        const existing = items.find(i => i.name.toLowerCase() === tokenName.toLowerCase());
        if (existing) {
          existing.qty += qty;
        } else {
          const preset = PRESETS.find(p => p.name.toLowerCase() === tokenName.toLowerCase());
          items.push({ id: uid(), name: tokenName, qty, description: preset?.description || '' });
        }
      }
    }

    return { capacity, items };
  })(viewHero);

  const sbUsed = sidebags.items.reduce((a, i) => a + (i.qty ?? 1), 0);
  const sbFree = Math.max(0, sidebags.capacity - sbUsed);

  const condRules = getConditionRules(viewHero);

  const equipGear = useMemo(
    () => equipGearFactory(viewHero, saveHero, condRules, setViewHero),
    [
      viewHero?.id,
      viewHero?.localId,
      Object.keys(viewHero?.gear || {}).map(s => `${s}:${viewHero?.gear?.[s]?.id ?? ''}`).join('|'),
      (viewHero?.inventory || []).map(i => String(i?.id || '')).sort().join('|'),
      JSON.stringify(condRules),
    ]
  );

  const allSlots = useMemo(() => {
    const extras = [...(extraSlots || [])];
    return [...baseGearSlots, ...extras.filter(s => !baseGearSlots.includes(s))];
  }, [extraSlots]);

  const page1 = useMemo(() => PAGE1_SLOTS.filter(s => allSlots.includes(s)), [allSlots]);
  const page2 = useMemo(() => {
    const s1 = new Set(page1);
    return allSlots.filter(s => !s1.has(s));
  }, [allSlots, page1]);

  const rawSlots = (equipPage === 1 ? page1 : page2);

  const cellsForThisPage = equipPage === 1 ? CELLS_PAGE1 : CELLS_PAGE2;
  const overflowCount = Math.max(0, rawSlots.length - cellsForThisPage);
  const visibleSlots = rawSlots.slice(0, cellsForThisPage);
  const paddedSlots = [
    ...visibleSlots,
    ...Array.from({ length: Math.max(0, cellsForThisPage - visibleSlots.length) }, () => null)
  ];

  const _gearSig = useMemo(
    () => Object.keys(gear).map(s => `${s}:${gear[s]?.id ?? ''}`).join('|'),
    [gear]
  );
  const _invSig = useMemo(
    () => inventoryUnique.map(i => String(i?.id)).sort().join('|'),
    [inventoryUnique]
  );

  const lastAutoUnequippedRef = useRef(new Set());
  useEffect(() => {
    const newlyIllegal = [];
    for (const slotName of Object.keys(gear)) {
      const eq = gear[slotName];
      if (!eq || eq.name === 'Empty Slot') continue;

      const typeOk =
        eq.slot === slotName ||
        (['Main Hand', 'Off Hand'].includes(slotName) && ['Gun', 'Hand Weapon'].includes(eq.slot)) ||
        (slotName === 'Blessed Aura' && hasTag(eq, 'Blessed Aura'));

      let allowed = typeOk;
      if (allowed) {
        if (condRules.forbidSlots.has(slotName)) allowed = false;
        if (allowed && eq.slot === 'Gun') {
          if (condRules.noGuns) allowed = false;
          if (condRules.noGunsUnlessArtifact && !(
            eq.isArtifact || eq.artifact || eq.rarity === 'Artifact' || hasTag(eq, 'Artifact')
          )) allowed = false;
        }
      }

      if (!allowed) {
        if (!lastAutoUnequippedRef.current.has(slotName)) {
          newlyIllegal.push(slotName);
        }
      } else {
        lastAutoUnequippedRef.current.delete(slotName);
      }
    }

    for (const slotName of newlyIllegal) {
      lastAutoUnequippedRef.current.add(slotName);
      equipGear(slotName, '');
    }
  }, [equipGear, _gearSig, _invSig, JSON.stringify(condRules)]);

  // Buffs (once-per-adventure) ---------------------------------------------
  const buffs = Array.isArray(viewHero.oncePerAdventure)
    ? viewHero.oncePerAdventure.map(b => ({ id: b.id || uid(), name: b.name || 'Buff', used: !!b.used, notes: b.notes || '' }))
    : [];

  const persistBuffs = (next) => {
    const nextHero = { ...viewHero, oncePerAdventure: next, updatedAt: Date.now() };
    saveHero(nextHero);
    try { setViewHero && setViewHero(nextHero); } catch {}
  };

  const addBuff = () => {
    const name = prompt('Buff name (e.g., “Prophetic Blessing”, “Once per Fight” item):');
    if (!name) return;
    const notes = prompt('Optional note (effect, rolls, etc.):') || '';
    const next = [...buffs, { id: uid(), name, used: false, notes }];
    persistBuffs(next);
  };

  const toggleBuff = (id) => {
    const next = buffs.map(b => b.id === id ? { ...b, used: !b.used } : b);
    persistBuffs(next);
  };

  const removeBuff = (id) => {
    if (!confirm('Remove this buff?')) return;
    persistBuffs(buffs.filter(b => b.id !== id));
  };

  const resetBuffs = () => {
    if (!confirm('Reset all buffs to unused?')) return;
    persistBuffs(buffs.map(b => ({ ...b, used: false })));
  };

  // Actions (inventory / gear)
  const dropItem = (id) => {
    if (!window.confirm('Drop this item?')) return;
    const inv = (viewHero.inventory || []).filter(i => String(i.id) !== String(id));
    const nextHero = { ...viewHero, inventory: inv, updatedAt: Date.now() };
    saveHero(nextHero);
    try { setViewHero && setViewHero(nextHero); } catch {}
  };

  const isItemAllowedForSlot = (slot, it) => {
    if (!it) return true;
    if (condRules.forbidSlots.has(slot)) return false;
    if (isGun(it)) {
      if (condRules.noGuns) return false;
      if (condRules.noGunsUnlessArtifact && !isArtifact(it)) return false;
    }
    return true;
  };

  const optionsForSlot = (slot) =>
    inventoryUnique.filter(i => {
      let typeOk =
        i.slot === slot ||
        (['Main Hand', 'Off Hand'].includes(slot) && ['Gun', 'Hand Weapon'].includes(i.slot));
      if (!typeOk && slot === 'Blessed Aura' && hasTag(i, 'Blessed Aura')) typeOk = true;
      if (!typeOk || !isItemAllowedForSlot(slot, i)) return false;

      if (!['Main Hand', 'Off Hand'].includes(slot)) return true;
      const available = totalHandsAvailable(viewHero, condRules);
      const used = handsInUse(gear);
      const free = available - used + (gear[slot] ? (gear[slot].name === 'Empty Slot' ? 0 : 1) : 0);
      const requiresTwoHands = !!i.twoHanded;
      const alreadyMirrored = gear['Main Hand'] && gear['Off Hand'] && gear['Main Hand'].id === gear['Off Hand'].id;
      const sameIdInOtherHand =
        ['Main Hand','Off Hand'].includes(slot) &&
        gear[(slot === 'Main Hand') ? 'Off Hand' : 'Main Hand'] &&
        String(gear[(slot === 'Main Hand') ? 'Off Hand' : 'Main Hand'].id) === String(i.id);
      return requiresTwoHands ? (free >= 2 || alreadyMirrored) : (free >= 1 || sameIdInOtherHand);
    });

  const aggregated = aggregateGearMods(gear);

  const persistSidebags = (nextSB) => {
    const nextHero = { ...viewHero, sidebags: nextSB, updatedAt: Date.now() };
    saveHero(nextHero);
    try { setViewHero && setViewHero(nextHero); } catch {}
  };

  const addPresetToSidebags = (preset, qty = 1) => {
    if (!preset) return;
    const q = Math.max(1, Number(qty) || 1);
    const sbUsedNow = sidebags.items.reduce((a, i) => a + (i.qty ?? 1), 0);
    const sbFreeNow = Math.max(0, sidebags.capacity - sbUsedNow);
    if (q > sbFreeNow) { alert('Not enough space in sidebags.'); return; }
    const items = [...sidebags.items];
    const idx = items.findIndex(i => (i.name || '').toLowerCase() === preset.name.toLowerCase());
    if (idx >= 0) {
      items[idx] = {
        ...items[idx],
        qty: (items[idx].qty ?? 1) + q,
        description: items[idx].description || preset.description || ''
      };
    } else {
      items.push({ id: uid(), name: preset.name, qty: q, description: preset.description || '' });
    }
    persistSidebags({ ...sidebags, items });
    setPresetQuery('');
  };

  const changeSidebagQty = (id, delta) => {
    const items = sidebags.items
      .map(i => i.id === id ? { ...i, qty: Math.max(0, (i.qty ?? 1) + delta) } : i)
      .filter(i => (i.qty ?? 1) > 0);
    persistSidebags({ ...sidebags, items });
  };

  const removeSidebagToken = (id) => {
    const items = sidebags.items.filter(i => i.id !== id);
    persistSidebags({ ...sidebags, items });
  };

  const setSidebagCapacity = (cap) => {
    const capacity = Math.max(0, Number(cap) || 0);
    persistSidebags({ ...sidebags, capacity });
  };

  const addSlot = () => {
    const name = prompt('New slot name:');
    if (!name) return;
    const currentSlots = [...baseGearSlots, ...(extraSlots || [])];
    if (currentSlots.includes(name)) return alert('Slot already exists.');
    const next = [...(extraSlots || []), name];
    setExtraSlots(next);
    saveHero({ ...viewHero, extraGearSlots: next, updatedAt: Date.now() });
  };

  // ---------- small helpers for UI bits ----------
  const isTwoHandMirrored = (slot, eq) =>
    (slot === 'Main Hand' || slot === 'Off Hand') &&
    eq?.twoHanded === true &&
    gear['Main Hand']?.id === eq?.id &&
    gear['Off Hand']?.id === eq?.id;

  const statLabel = (k) => k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

  return (
    <div className="p-4 space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 items-center">
        {['Equipped', 'Inventory', 'Sidebags', 'Buffs'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-3 py-1 rounded font-semibold ${activeTab === t ? 'bg-[#5C3A21] text-white' : 'bg-gray-200 text-gray-900'}`}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto">
          <button onClick={addSlot} className="btn btn-sm">+ Add Slot</button>
        </div>
      </div>

      {/* Carrying Weight / Dark Stone tracker */}
      {(() => {
        const cap = carryCapacity(viewHero, condRules);
        const { eqW, invW, total } = totalWeight(viewHero);
        const dsTotal = countDarkStoneCarried(viewHero);
        const over = total > cap;

        return (
          <div
            className={`rounded-xl border p-3 bg-white/80 flex flex-wrap items-center gap-4 ${
              over ? 'border-red-600' : 'border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <img
                src={ASSETS.weight}
                alt="Weight"
                className="inline-block w-5 h-5 rounded border border-gray-300 bg-white"
              />
              <span className="font-bold text-sm">Carry Weight</span>
              <span
                className={`ml-1 px-2 py-1 rounded text-sm ${
                  over ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-900'
                }`}
              >
                {total} / {cap}
              </span>
            </div>

            <div className="text-xs text-gray-700">
              (Equipped {eqW} · Inventory {invW})
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-700">
              <img
                src={ASSETS.ds}
                alt="Dark Stone"
                className="inline-block w-5 h-5 rounded border border-gray-300 bg-white"
              />
              <span>
                Dark Stone carried: <b>{dsTotal}</b> (no weight)
              </span>
            </div>
          </div>
        );
      })()}

      {/* Live hands availability */}
      {(() => {
        const avail = totalHandsAvailable(viewHero, condRules);
        const used  = handsInUse(gear);
        const free  = Math.max(0, avail - used);
        return (
          <div className="text-xs text-gray-600 -mt-2">
            Hands: <b>{used}</b> used / <b>{avail}</b> available (free {free})
          </div>
        );
      })()}

      {/* Equipped stat mods summary */}
      {(() => {
        const entries = Object.entries(aggregated).filter(([, v]) => v !== 0);
        if (!entries.length) return null;
        return (
          <div className="rounded-xl border bg-white/80 p-2">
            <button
              type="button"
              onClick={() => setShowStatMods((s) => !s)}
              className="flex items-center justify-between w-full text-xs font-semibold text-gray-700"
            >
              <span>Equipped stat mods</span>
              <span className="ml-2 text-[10px]">
                {showStatMods ? '▲' : '▼'}
              </span>
            </button>
            {showStatMods && (
              <div className="mt-2 text-xs text-gray-700 flex flex-wrap gap-2">
                {entries
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([k, v]) => (
                    <span key={k} className="badge badge-ghost">
                      {statLabel(k)} {typeof v === 'string' ? v : (v > 0 ? `+${v}` : v)}
                    </span>
                  ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Equipped (paged) */}
      {activeTab === 'Equipped' && (
        <section className="rounded-2xl border bg-white/80 p-3 space-y-4">
          {/* Pager */}
          <div className="flex items-center justify-between">
            <div className="font-bold text-lg flex items-center gap-2">
              {equipPage === 1 ? 'Weapons, Clothes & Accessories' : 'Other Slots'}
              {totalWeight(viewHero).total > carryCapacity(viewHero, condRules) && (
                <span className="badge badge-error">Over capacity</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className={`btn btn-sm ${equipPage === 1 ? 'btn-disabled opacity-50' : ''}`} onClick={() => setEquipPage(1)} disabled={equipPage === 1}>◀ Page 1</button>
              <button className={`btn btn-sm ${equipPage === 2 ? 'btn-disabled opacity-50' : ''}`} onClick={() => setEquipPage(2)} disabled={equipPage === 2}>Page 2 ▶</button>
            </div>
          </div>

          {/* Grid */}
          <div
            className={
              equipPage === 1
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3'
                : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'
            }
          >
            {paddedSlots.map((slot, idx) => {
              if (!slot) {
                return (
                  <div key={`ph-${idx}`} className="rounded-xl border p-3 bg-gray-50 opacity-60 min-h-[120px] flex items-center justify-center">
                    <span className="text-gray-400 text-sm">—</span>
                  </div>
                );
              }

              const eq = gear[slot];
              const eqSafe = (eq && eq.name !== 'Empty Slot') ? eq : null; // ← guard against placeholders
              const opts = optionsForSlot(slot);

              const slotForbidden = condRules.forbidSlots.has(slot);

              return (
                <div key={slot} className="rounded-xl border p-2 bg-white">
                  <div className="text-[10px] uppercase tracking-wide text-gray-600 text-center">{slot}</div>

                  <div className="mt-1 text-base font-bold min-h-[1.5rem] flex items-center gap-2">
                    {eqSafe ? eqSafe.name.replace(/\s*\(Spirit \d\+\+?\)$/, '') : <span className="text-gray-400 italic">Empty</span>}
                    {eqSafe && isTwoHandMirrored(slot, eqSafe) && (
                      <span className="badge badge-outline text-[10px]">2-Handed</span>
                    )}
                  </div>

                  {!!(eqSafe?.description || eqSafe?.effect) && (
                    <div className="mt-1 text-[11px] leading-tight text-gray-700 max-h-20 overflow-auto pr-1 italic">
                      {slot === 'Blessed Aura'
                        ? (churchBlessedAuras.find(a => a.id === eqSafe.id)?.effect || eqSafe.description || eqSafe.effect)
                        : (eqSafe.description || eqSafe.effect)}
                    </div>
                  )}

                  {slot !== 'Blessed Aura' && eqSafe?.mods && typeof eqSafe.mods === 'object' && Object.keys(eqSafe.mods).length > 0 && (
                    <ul className="mt-1 text-[11px] leading-tight list-disc list-inside max-h-24 overflow-auto pr-1">
                      {Object.entries(eqSafe.mods)
                        .filter(([, v]) => (typeof v === 'number' && v !== 0) || (typeof v === 'string' && /^\d+\+$/.test(v.trim())))
                        .map(([k, v]) => (
                          <li key={k}>
                            <span className="font-semibold">{statLabel(k)}</span>{' '}
                            {typeof v === 'string' ? v.trim() : `${v > 0 ? '+' : ''}${v}`}
                          </li>
                        ))}
                    </ul>
                  )}

                  {slot !== 'Blessed Aura' && Array.isArray(eqSafe?.effects) && eqSafe.effects.length > 0 && (
                    <ul className="mt-1 text-[11px] leading-tight list-disc list-inside max-h-24 overflow-auto pr-1">
                      {eqSafe.effects.map((line, i) => (
                        <li key={`eff-${i}`}>{line}</li>
                      ))}
                    </ul>
                  )}

                  {(() => {
                    if (!eqSafe) return null;
                    const goldValue = extractGold(eqSafe);
                    const weightVal = getItemWeight(eqSafe);
                    const dsNumber  = extractDarkStone(eqSafe);
                    const dsHasIcon = hasDarkStoneIcon(eqSafe);
                    if (!(goldValue || weightVal || dsNumber || dsHasIcon)) return null;
                    return (
                      <div className="mt-1 text-[11px] text-gray-600 flex flex-wrap gap-x-2 gap-y-1">
                        {goldValue > 0 && <span>Gold: <b>{goldValue}</b></span>}
                        {weightVal > 0 && <span>Weight: <b>{weightVal}</b></span>}
                        {dsNumber > 0 && <span>Dark Stone: <b>{dsNumber}</b></span>}
                        {dsHasIcon && dsNumber <= 0 && <span>Dark Stone: <b>icon</b></span>}
                      </div>
                    );
                  })()}

                  {slotForbidden && (
                    <div className="mt-1 text-[11px] text-red-700 font-semibold">
                      Cannot equip in this slot due to a condition.
                    </div>
                  )}

                  <div className="mt-2 flex flex-col gap-2">
                    {eqSafe && (
                      <button onClick={() => { equipGear(slot, ''); }} className="btn btn-xs btn-error">
                        Unequip
                      </button>
                    )}
                    <select
                      value={eqSafe ? eqSafe.id : ''} 
                      onChange={e => { if (!condRules.forbidSlots.has(slot)) equipGear(slot, e.target.value); }}
                      className="w-full border px-2 py-1 rounded"
                      disabled={slotForbidden}
                    >
                      <option value="">(Choose item)</option>
                      {eqSafe && (
                        <option value={eqSafe.id} disabled>
                          (Equipped) {eqSafe.name.replace(/\s*\(Spirit \d\+\+?\)$/, '')}
                        </option>
                      )}
                      {opts.length === 0 && <option disabled>No compatible items</option>}
                      {opts.map((it, i) => {
                        const isAura = slot === 'Blessed Aura' && hasTag(it, 'Blessed Aura');
                        const displayName = isAura
                          ? `${it.name.replace(/\s*\(.*\)$/, '')}${it.description ? ' — ' + it.description : ''}`
                          : it.name;
                        return (
                          <option key={`${it.id || it.name || 'opt'}-${i}`} value={it.id}>
                            {displayName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          {overflowCount > 0 && (
            <div className="text-xs text-gray-500">
              +{overflowCount} more slot{overflowCount === 1 ? '' : 's'} not shown on this page.
            </div>
          )}
        </section>
      )}

      {/* Inventory */}
      {activeTab === 'Inventory' && (
        <section className="rounded-2xl border bg-white/80 p-3 space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">Inventory</h3>
            <input
              type="text"
              className="input input-sm flex-1"
              placeholder="Filter by name or type (e.g., 'pistol', 'Gun')"
              value={inventoryQuery}
              onChange={(e) => setInventoryQuery(e.target.value)}
            />
            {inventoryQuery && (
              <button className="btn btn-sm btn-ghost" onClick={() => setInventoryQuery('')}>Clear</button>
            )}
          </div>

          {invFiltered.length === 0 && <div className="text-gray-500 italic">No items.</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {invFiltered.map((item, i) => (
              <div key={`${item.id || item.name || 'inv'}-${i}`} className="rounded-xl border p-3 bg-white">
                <div className="text-base font-semibold flex items-center gap-2">
                  {item.name}
                  {item.twoHanded && <span className="badge badge-outline text-[10px]">2-Handed</span>}
                </div>
                {item.slot && <div className="text-xs text-gray-600">Type: {item.slot}</div>}

                {item.description && (
                  <div className="mt-1 text-xs text-gray-700">{item.description}</div>
                )}
                {Array.isArray(item.effects) && item.effects.length > 0 && (
                  <ul className="mt-1 text-[11px] leading-tight list-disc list-inside">
                    {item.effects.map((line, j) => (
                      <li key={`inv-eff-${j}`}>{line}</li>
                    ))}
                  </ul>
                )}

                {(() => {
                  const g = extractGold(item);
                  const ds = extractDarkStone(item);
                  const w  = getItemWeight(item);
                  const showAny = g > 0 || ds > 0 || w > 0 || typeof item.cost === 'string';
                  return showAny ? (
                    <div className="mt-1 text-[11px] text-gray-600 flex flex-wrap gap-x-2 gap-y-1">
                      {g > 0 && <span>Gold: <b>{g}</b></span>}
                      {w > 0 && <span>Weight: <b>{w}</b></span>}
                      {ds > 0 && <span>Dark Stone: <b>{ds}</b></span>}
                      {typeof item.cost === 'string' && <span>Cost: <b>{item.cost}</b></span>}
                    </div>
                  ) : null;
                })()}

                {item.mods && typeof item.mods === 'object' && (
                  <div className="mt-1 text-xs text-gray-700">
                    {Object.entries(item.mods)
                      .filter(([, v]) => typeof v === 'number' && v !== 0)
                      .slice(0, 8)
                      .map(([k, v]) => (
                        <span key={k} className="mr-2 badge badge-ghost">
                          {statLabel(k)} {v > 0 ? '+' : ''}{v}
                        </span>
                      ))
                    }
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button onClick={() => { dropItem(item.id); }} className="btn btn-xs btn-error">
                    Drop
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sidebags */}
      {activeTab === 'Sidebags' && (
        <section className="rounded-2xl border bg-white/80 p-3 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="font-bold text-lg">Sidebags</div>
            <div className="text-sm">
              Capacity:&nbsp;
              <input
                type="number"
                className="input input-xs w-24"
                value={sidebags.capacity}
                min={0}
                onChange={(e) => setSidebagCapacity(e.target.value)}
              />
            </div>
            <div className="text-xs text-gray-600">
              Used {sbUsed}/{sidebags.capacity} &middot; Free {sbFree}
            </div>
          </div>

          {/* Preset picker */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              list="sidebag-presets"
              className="input"
              placeholder="Search presets (e.g., Bandages, Dynamite, Flash)"
              value={presetQuery}
              onChange={(e) => setPresetQuery(e.target.value)}
            />
            <datalist id="sidebag-presets">
              {PRESETS.map((p, i) => (
                <option key={`${p.name}-${i}`} value={p.name}>Preset</option>
              ))}
            </datalist>
            <button
              className="btn"
              disabled={!chosenPreset}
              onClick={() => addPresetToSidebags(chosenPreset, 1)}
              title={chosenPreset ? chosenPreset.description : 'Pick a preset'}
            >
              Add Preset
            </button>
            {chosenPreset && (
              <span className="text-xs text-gray-600">
                <strong>{chosenPreset.name}</strong> — {chosenPreset.description}
              </span>
            )}
          </div>

          {/* Tokens grid */}
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {sidebags.items.length === 0 && (
              <div className="text-sm text-gray-500">No tokens in sidebags.</div>
            )}
            {sidebags.items.map((it) => (
              <div key={it.id} className="border rounded-xl p-2 flex items-start justify-between bg-white">
                <div className="pr-2">
                  <div className="font-medium">{it.name}</div>
                  {it.description && (
                    <div className="text-xs text-gray-700 mt-0.5">{it.description}</div>
                  )}
                  <div className="text-xs text-gray-600 mt-1">Qty: {it.qty ?? 1}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="btn btn-xs" onClick={() => changeSidebagQty(it.id, -1)}>-</button>
                  <button className="btn btn-xs" onClick={() => changeSidebagQty(it.id, +1)} disabled={sbFree <= 0}>+</button>
                  <button className="btn btn-xs bg-red-600 text-white" onClick={() => removeSidebagToken(it.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500">
            Tip: Adjust capacity for effects/encumbrance; discard tokens to fit if over capacity.
          </p>
        </section>
      )}

      {/* Buffs (once-per-adventure) */}
      {activeTab === 'Buffs' && (
        <section className="rounded-2xl border bg-white/80 p-3 space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">Once-per-adventure buffs</h3>
            <button className="btn btn-sm" onClick={addBuff}>+ Add Buff</button>
            {buffs.length > 0 && (
              <button className="btn btn-sm btn-ghost" onClick={resetBuffs}>Reset All</button>
            )}
          </div>

          {buffs.length === 0 && (
            <div className="text-gray-500 italic">
              No buffs yet. Add entries like “Prophetic Blessing (heal D6 Health/Sanity once)” or item one-shots.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {buffs.map((b) => (
              <div key={b.id} className={`rounded-xl border p-3 ${b.used ? 'bg-gray-100 opacity-80' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{b.name}</div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={b.used}
                        onChange={() => toggleBuff(b.id)}
                      />
                      Used
                    </label>
                    <button className="btn btn-xs btn-ghost" onClick={() => removeBuff(b.id)}>Remove</button>
                  </div>
                </div>
                {b.notes && <div className="mt-1 text-xs text-gray-700">{b.notes}</div>}
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500">
            Tip: Buffs reset when you start a new adventure (use “Reset All”).
          </p>
        </section>
      )}
    </div>
  );
}

// ------------------------------ equip logic -------------------------------
function equipGearFactory(viewHero, saveHero, condRules, setViewHero) {
  return function equipGear(slot, id) {
    const originalInventory = Array.isArray(viewHero.inventory) ? [...viewHero.inventory] : [];
    const copy = {
      gear: { ...(viewHero.gear || {}) },
      inventory: originalInventory.map(ensureItemId)
    };

    if (id && condRules.forbidSlots.has(slot)) {
      alert('Cannot equip in this slot due to an active condition.');
      return;
    }

    // Unequip
    if (id === '') {
      if (copy.gear[slot] && copy.gear[slot].name !== 'Empty Slot') {
        const removed = copy.gear[slot];
        if (!copy.inventory.some(i => String(i.id) === String(removed.id))) {
          copy.inventory.push(removed);
        }
        // replace with explicit placeholder rather than delete
        copy.gear[slot] = { id: `empty-${slot.replace(/\s+/g, '').toLowerCase()}`, name: 'Empty Slot', slot };

        if (slot === 'Main Hand' || slot === 'Off Hand') {
          const other = slot === 'Main Hand' ? 'Off Hand' : 'Main Hand';
          if (copy.gear[other] && String(copy.gear[other].id) === String(removed?.id)) {
            if (!copy.inventory.some(i => String(i.id) === String(copy.gear[other].id))) {
              copy.inventory.push(copy.gear[other]);
            }
            copy.gear[other] = { id: `empty-${other.replace(/\s+/g, '').toLowerCase()}`, name: 'Empty Slot', slot: other };
          }
        }
        const nextHero = { ...viewHero, gear: copy.gear, inventory: copy.inventory, updatedAt: Date.now() };
        saveHero(nextHero);
        try { setViewHero && setViewHero(nextHero); } catch {}
      }
      return;
    }

    // Equip
    const it = copy.inventory.find(i => String(i.id) === String(id));
    if (!it) return;

    if (isGun(it)) {
      if (condRules.noGuns) {
        alert('Cannot equip: Guns are disabled by an active condition.');
        return;
      }
      if (condRules.noGunsUnlessArtifact && !isArtifact(it)) {
        alert('Cannot equip: Non-Artifact Guns are disabled by an active condition.');
        return;
      }
    }

    const isHandSlot = ['Main Hand', 'Off Hand'].includes(slot);
    const isHandCompatible = isHandSlot && ['Gun', 'Hand Weapon'].includes(it.slot);
    const requiresTwoHands = !!it.twoHanded;

    if (isHandSlot && isHandCompatible) {
      const available = totalHandsAvailable(viewHero, condRules);
      const used = handsInUse(copy.gear);
      const free = available - used + ((copy.gear[slot] && copy.gear[slot].name !== 'Empty Slot') ? 1 : 0);

      if (requiresTwoHands) {
        const alreadyMirrored = (copy.gear['Main Hand'] && copy.gear['Off Hand'] && copy.gear['Main Hand']?.id === copy.gear['Off Hand']?.id);
        if (!alreadyMirrored && free < 2) {
          alert('Cannot equip: not enough free hands (a condition reduces available hands).');
          return;
        }
      } else {
        if (free < 1 && (!copy.gear[slot] || copy.gear[slot].name === 'Empty Slot')) {
          alert('Cannot equip: no free hands (a condition reduces available hands).');
          return;
        }
      }
    }

    // Two-handed mirror logic
    if (isHandSlot && isHandCompatible && requiresTwoHands) {
      const main = copy.gear['Main Hand'];
      const off = copy.gear['Off Hand'];

      // return currently equipped items (if real) back to inventory first
      if (main && main.name !== 'Empty Slot' && !copy.inventory.some(i => String(i.id) === String(main.id))) {
        copy.inventory.push(main);
      }
      if (off && off.name !== 'Empty Slot' && String(off?.id) !== String(main?.id) &&
          !copy.inventory.some(i => String(i.id) === String(off.id))) {
        copy.inventory.push(off);
      }

      copy.gear['Main Hand'] = it;
      copy.gear['Off Hand'] = it;
      copy.inventory = copy.inventory.filter(i => String(i.id) !== String(id));

      const nextHero = { ...viewHero, gear: copy.gear, inventory: copy.inventory, updatedAt: Date.now() };
      saveHero(nextHero);
      try { setViewHero && setViewHero(nextHero); } catch {}
      return;
    }

    // Regular equip into chosen slot
    if (copy.gear[slot] && copy.gear[slot].name !== 'Empty Slot') {
      copy.inventory.push(copy.gear[slot]);
    }
    // For Blessed Aura, apply canonical mods/effect so stats update immediately
    let equipItem = it;
    if (slot === 'Blessed Aura') {
      const canonical = churchBlessedAuras.find(a => a.id === it.id);
      if (canonical) {
        const { effects: _drop, ...rest } = it;
        equipItem = { ...rest,
          mods: canonical.mods ? { ...canonical.mods } : {},
          description: canonical.effect || '',
          effect: canonical.effect || '',
          name: canonical.name.replace(/\s*\(.*\)$/, ''),
        };
      }
    }

    copy.gear[slot] = equipItem;
    copy.inventory = copy.inventory.filter(i => String(i.id) !== String(id));

    // Break old 2H mirror if present
    if (isHandSlot) {
      const other = slot === 'Main Hand' ? 'Off Hand' : 'Main Hand';
      if (copy.gear[other] && copy.gear[other].id === equipItem.id && equipItem.twoHanded !== true) {
        copy.gear[other] = { id: `empty-${other.replace(/\s+/g, '').toLowerCase()}`, name: 'Empty Slot', slot: other };
      }
    }

    const nextHero = { ...viewHero, gear: copy.gear, inventory: copy.inventory, updatedAt: Date.now() };
    saveHero(nextHero);
    try { setViewHero && setViewHero(nextHero); } catch {}
  };
}
