// Pure helpers only — no React imports here
export const isObj = (v) => v && typeof v === 'object';
export const getItemId = (item, idx = 0) => item?.id || item?.name || `item_${idx}`;
export const isTokenPurchase = (item) => item?.category === 'TokenPurchase' || !!item?.grantsToken;

export const d6 = () => ((Math.random() * 6) | 0) + 1;
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export const getCost = (item) => {
  if (!item) return 0;
  const id = String(item.id || '').toLowerCase();
  const name = String(item.name || '').toLowerCase();
  const looksExorcism = id.includes('exorcism') || name.includes('exorcism of madness');
  const looksResurrection = id.includes('resurrection') || name === 'resurrection';
  if ((item.cost == null || item.cost === 0) && looksExorcism) return 'D6 × $50';
  if ((item.cost == null || item.cost === 0) && looksResurrection) return '$500 × target level';

  const c = item.cost;
  if (typeof c === 'string') return c;
  if (typeof c === 'number') return { gold: c, darkStone: Number(item.darkStone || 0) };
  if (c && typeof c === 'object') return { ...c };

  if (typeof item.value === 'string') return item.value;
  if (typeof item.value === 'number') return { gold: item.value, darkStone: Number(item.darkStone || 0) };
  return 0;
};

export const formatCost = (c) => {
  if (c == null) return '—';
  if (typeof c === 'string') return c;
  if (typeof c === 'number') return `$${c}`;
  if (isObj(c)) {
    const parts = [];
    if (c.gold) parts.push(`$${c.gold}`);
    if (c.darkStone) parts.push(`${c.darkStone} Dark Stone`);
    if (c.scrap) parts.push(`${c.scrap} Scrap`);
    if (c.tech) parts.push(`${c.tech} Tech`);
    return parts.length ? parts.join(', ') : '—';
  }
  return String(c);
};

export const buildMadnessWithSources = (hero) => {
  const out = [];
  if (!hero) return out;
  if (Array.isArray(hero?.conditions?.madness)) hero.conditions.madness.forEach((c, i) => out.push({ cond: c, src:{kind:'nested', path:'conditions.madness', idx:i} }));
  if (Array.isArray(hero?.madness)) hero.madness.forEach((c, i) => out.push({ cond: c, src:{kind:'legacy', path:'madness', idx:i} }));
  if (Array.isArray(hero?.conditions)) hero.conditions.forEach((c, i) => { const t=String(c?.type).toLowerCase(); if (t==='madness') out.push({cond:c, src:{kind:'flat', path:'conditions', idx:i}}); });
  return out;
};

export const getInjuryList = (hero) => {
  if (!hero) return [];
  const out = [];
  if (Array.isArray(hero?.conditions?.injuries)) out.push(...hero.conditions.injuries);
  if (Array.isArray(hero?.injuries)) out.push(...hero.injuries);
  if (Array.isArray(hero?.conditions)) hero.conditions.forEach((c)=>{ const t=String(c?.type||c?.kind||'').toLowerCase(); if(t==='injury') out.push(c); });
  return out;
};
export const setInjuryList = (hero, newList) => {
  const base = isObj(hero?.conditions) ? { ...hero.conditions } : {};
  return { ...base, injuries: Array.isArray(newList) ? newList : [] };
};

export const getMutationList = (hero) => {
  if (!hero) return [];
  const out = [];
  if (Array.isArray(hero?.conditions?.mutations)) out.push(...hero.conditions.mutations);
  if (Array.isArray(hero?.mutations)) out.push(...hero.mutations);
  if (Array.isArray(hero?.conditions)) hero.conditions.forEach((c)=>{ const t=String(c?.type||c?.kind||'').toLowerCase(); if(t==='mutation') out.push(c); });
  return out;
};
export const setMutationList = (hero, newList) => {
  const base = isObj(hero?.conditions) ? { ...hero.conditions } : {};
  return { ...base, mutations: Array.isArray(newList) ? newList : [] };
};

export const labelForCategory = (raw) => {
  if (!raw) return 'Category';
  const map = { items: 'Items', services: 'Services' };
  if (map[raw]) return map[raw];
  return String(raw).replace(/[_-]+/g,' ').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/\s+/g,' ').trim().replace(/^./, s => s.toUpperCase());
};

export const buildCategoriesForShop = (shop, tabsByShop) => {
  if (shop && isObj(shop.categories)) {
    const order = tabsByShop?.[shop.id] && Array.isArray(tabsByShop[shop.id]) ? tabsByShop[shop.id] : Object.keys(shop.categories);
    const cats = [];
    for (const key of order) {
      const entries = shop.categories[key];
      if (Array.isArray(entries) && entries.length) cats.push({ id: key, label: labelForCategory(key), entries });
    }
    return cats.length ? cats : [{ id: '__empty__', label: 'No Entries', entries: [] }];
  }
  const cats = [];
  if (Array.isArray(shop?.items) && shop.items.length) cats.push({ id: '__items__', label: 'Items', entries: shop.items });
  if (shop?.services && typeof shop.services === 'object') {
    for (const [key, arr] of Object.entries(shop.services)) if (Array.isArray(arr) && arr.length) cats.push({ id: key, label: labelForCategory(key), entries: arr });
  }
  return cats.length ? cats : [{ id: '__empty__', label: 'No Entries', entries: [] }];
};

export const firstSubshopIdOf = (shop) =>
  Array.isArray(shop?.shops) && shop.shops.length ? shop.shops[0]?.id || null : null;

export const deriveHandsRequired = (item) => {
  if (item?.rules?.freeAttackPerTurn) return 0;
  if (typeof item?.handsRequired === 'number') return item.handsRequired;
  if (item?.twoHanded) return 2;
  if (item?.slot === 'Gun' || item?.slot === 'Hand Weapon') return 1;
  return 0;
};

// Carry calc (requires calculateCurrentStats/getConditionRules, so pass them in)
export const getCarryCapacityLikeGearTab = (hero, calculateCurrentStats, getConditionRules) => {
  const rules = getConditionRules(hero);
  const { stats = {} } = calculateCurrentStats(hero || {});
  const str = Number(stats['Strength']) || 0;
  const delta = Number(rules?.carryCapacityDelta || 0);
  return Math.max(0, str + 5 + delta);
};
export const getItemWeight = (it) => Number(it?.weight || 0);
export const getCurrentLoad = (h) =>
  Array.isArray(h?.inventory) ? h.inventory.filter((it) => it && it.name !== 'Empty Slot').reduce((sum, it) => sum + getItemWeight(it), 0) : 0;
export const getEquippedLoad = (h) =>
  h?.gear ? Object.values(h.gear).filter(Boolean).reduce((sum, it) => sum + getItemWeight(it), 0) : 0;
export const getTotalLoad = (h) => getEquippedLoad(h) + getCurrentLoad(h);
export const willExceedCarryLikeGearTab = (h, item, calculateCurrentStats, getConditionRules) =>
  getTotalLoad(h) + getItemWeight(item) > getCarryCapacityLikeGearTab(h, calculateCurrentStats, getConditionRules);

// Doc’s Office event mods
export function getDocSurgeryMod(townState) {
  const ev = townState?.locationEvents?.docsOffice || townState?.docOffice || townState?.docs_office || null;
  const mod = ev?.resolved?.effects?.surgeryRollMod ?? 0;
  const clampMin = ev?.resolved?.effects?.surgeryClampMin ?? 1;
  const name = (ev?.resolved?.name || '').toLowerCase();
  if (!ev?.resolved?.effects && name) {
    if (name.includes('expert surgeon')) return { mod: 1, clampMin: 1 };
    if (name.includes('dirty tools')) return { mod: -1, clampMin: 0 };
  }
  return { mod, clampMin };
}
export function getDocsOfficeModsForHero(townState, heroId) {
  const roll =
    townState?.locationEvents?.docsOffice?.byHero?.[heroId]?.roll ??
    townState?.events?.docsOffice?.byHero?.[heroId]?.roll ??
    townState?.locationEvent?.docsOffice?.[heroId]?.roll ?? null;
  const r = Number(roll);
  if (!Number.isFinite(r)) return { costMult: 1, outcomeBonus: 0 };
  return { costMult: (r >= 4 && r <= 5) ? 0.5 : 1, outcomeBonus: (r >= 9 && r <= 10) ? 1 : 0 };
}
