// src/components/TownTab/index.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  loadTownState,
  resetTownState,
  saveTownState,
} from '../../utils/townState';
import { usePosse } from '../../context/PosseContext';
import { shopDataById } from '../../data/shopDataByID';
import { tabsByShop } from '../../data/townLocations/tabsByShop.js';
import { makeLocEventCtx } from '../../utils/locationEventContext';
import { applyChurchRitual } from '../../data/townLocations/churchRituals.js';

import {
  ensureEventRolled as ensureLocEventRolled,
  getEventState as _getLocEventState,
  resolveEvent as resolveLocEvent,
  setEventRoll as setLocEventRoll,
} from '../../utils/locationEventsEngine';

// Doc's Office service executors
import {
  performSurgery,
  performTreatCorruption,
  performInjectionPurchase,
  performDocItemPurchase,
} from '../../utils/locationHandlers/docsOfficeServices';

// UI pieces
import TownEventCard from './TownEventCard';
import RareFindPanel from './RareFindPanel';

// icons / helpers
import {
  labelForCategory,
  buildCategoriesForShop,
  isInjection,
  isRitualService,
  isBanishCorruptionService,
  isBlessedAura,
  isExorcismService,
  isResurrectionService,
  isTokenPurchase,
  willExceedCarryLikeGearTab,
  getCarryCapacityLikeGearTab,
  getTotalLoad,
  getItemWeight,
  getCost,
  normalizeCostObject,
  formatCost,
  deriveHandsRequired,
  ASSETS,
  IconRowComposite,
  IconRowRepeat,
  getInjuryList,
  getMutationList,
  nextSideBag,
} from './townTabHelpers';

// If staying at Camp, only these are available
const CAMP_SHOPS = ['campSiteTents'];

// tiny helpers
const isObj = (v) => v && typeof v === 'object';
const getItemId = (item, idx = 0) => item?.id || item?.name || `item_${idx}`;

// Event read wrapper (engine wants state)
const getLocEventState = (shopId) => _getLocEventState(loadTownState(), shopId);

// Per-hero Doc’s Office modifiers (4–5 : cost×0.5, 9–10 : outcome +1)
function getDocsOfficeModsForHero(townState, heroId) {
  const roll =
    townState?.locationEvents?.docsOffice?.byHero?.[heroId]?.roll ??
    townState?.events?.docsOffice?.byHero?.[heroId]?.roll ??
    townState?.locationEvent?.docsOffice?.[heroId]?.roll ?? null;

  const r = Number(roll);
  if (!Number.isFinite(r)) return { costMult: 1, outcomeBonus: 0 };
  return {
    costMult: r >= 4 && r <= 5 ? 0.5 : 1,
    outcomeBonus: r >= 9 && r <= 10 ? 1 : 0,
  };
}

export default function TownTab({ heroId }) {
  const { posse, activeHeroId, updateHero } = usePosse();
  const resolvedHeroId = heroId ?? activeHeroId;

  const hero = useMemo(
    () => posse.find((h) => (h.id || h.localId) === resolvedHeroId) ?? null,
    [posse, resolvedHeroId]
  );

  // town state snapshot for this component
  const [state, setState] = useState(loadTownState());

  // UI state
  const [openLocationId, setOpenLocationId] = useState(null);
  const [openSubshopId, setOpenSubshopId] = useState(null);
  const [openSubcatId, setOpenSubcatId] = useState(null);
  const [visitPurchases, setVisitPurchases] = useState({}); // per-visit token buys

  // ---------- new-day rollover ----------
  useEffect(() => {
    const today = new Date().toDateString();
    const s = loadTownState();
    if (s.dayStamp !== today) {
      resetTownState(today, posse.map((h) => h.id || h.localId).filter(Boolean));
      posse.forEach((h) => {
        const id = h.id || h.localId;
        if (!id) return;
        updateHero({ id, lodging: null, chosenLocation: null, isDone: false });
      });
      setVisitPurchases({});
    }
    setState(loadTownState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posse.length]);

  // listen for broadcast changes (e.g., event resolved, rare find set, etc.)
  useEffect(() => {
    const onChange = () => setState(loadTownState());
    window.addEventListener('sobTownStateChanged', onChange);
    return () => window.removeEventListener('sobTownStateChanged', onChange);
  }, []);

  if (!hero) return <div className="p-4">Loading hero data…</div>;

  const canVisit = !hero.chosenLocation && !!hero.lodging;

  const handleOpenLocation = (shopId) => {
    setOpenLocationId(shopId);
    setOpenSubcatId(null);
    const shop = shopDataById[shopId];
    const child = Array.isArray(shop?.shops) && shop.shops.length ? shop.shops[0]?.id || null : null;
    setOpenSubshopId(child);
    ensureLocEventRolled(shopId);
    setState(loadTownState());
  };

  const handleCloseLocation = () => {
    setOpenLocationId(null);
    setOpenSubcatId(null);
    setOpenSubshopId(null);
  };

  const handleVisit = (shopId) => {
    if (hero.chosenLocation) return;
    const id = hero.id || hero.localId;
    setVisitPurchases((v) => ({ ...v, [id]: v[id] || {} }));
    updateHero({ id, chosenLocation: shopId, isDone: true });
  };

  // Visit purchase counters for per-visit limits (tokens)
  const getVisitCount = (itemId) => {
    const id = hero.id || hero.localId;
    if (!id) return 0;
    return visitPurchases?.[id]?.[itemId] || 0;
  };
  const incVisitCount = (itemId) => {
    const id = hero.id || hero.localId;
    if (!id) return;
    setVisitPurchases((v) => {
      const prevForHero = v[id] || {};
      const prev = prevForHero[itemId] || 0;
      return {
        ...v,
        [id]: { ...prevForHero, [itemId]: prev + 1 },
      };
    });
  };

  // Merge update actions from executors
  const applyActions = (actions) => {
    if (!Array.isArray(actions) || !actions.length) return;
    const id = hero.id || hero.localId;
    const merged = {};
    for (const a of actions) {
      if (a?.type === 'update') {
        const { type, ...rest } = a;
        Object.assign(merged, rest);
      }
    }
    if (Object.keys(merged).length) {
      updateHero({ id, ...merged });
    }
  };

  // prompt helpers
  const promptNumber = async (label, { min = 0, max = 9999, step = 1, initial = 0 } = {}) => {
    const raw = window.prompt(label, String(initial));
    if (raw == null) return 0;
    const v = Number(raw);
    if (Number.isNaN(v)) return 0;
    return Math.max(min, Math.min(max, Math.round(v / step) * step));
  };
  const promptRoll = async (n, sides, label) => {
    const choice = window.prompt(
      `${label || 'Roll'}: Enter ${n}d${sides} (comma-separated) or leave blank for auto-roll`
    );
    if (!choice)
      return Array.from({ length: n }, () => Math.floor(Math.random() * sides) + 1);
    const parts = choice
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((x) => Number.isFinite(x) && x >= 1 && x <= sides);
    if (parts.length === n) return parts;
    return Array.from({ length: n }, () => Math.floor(Math.random() * sides) + 1);
  };
  const promptPay = async (_h, amount, label = 'Pay') =>
    !!window.confirm(`${label}\nHero pays $${amount}. Continue?`);

  // Posse & UI APIs for handlers
  const posseApi = {
    getActiveHeroId: () => resolvedHeroId,
    getHero: (id) => posse.find((h) => (h.id || h.localId) === id) || null,
    updateHero: (id, patchOrFn) => {
      const target = posse.find((h) => (h.id || h.localId) === id) || {};
      const patch = typeof patchOrFn === 'function' ? patchOrFn(target) : patchOrFn || {};
      updateHero({ id, ...patch });
    },
    addToken: (id, tokenName) => {
      const target = posse.find((h) => (h.id || h.localId) === id) || {};
      const sideBag = nextSideBag(target, tokenName, 1);
      updateHero({ id, sideBag });
    },
    getHeroesAtShop: (shopId) => {
      if (!shopId) return [resolvedHeroId].filter(Boolean);
      return posse
        .filter((h) => (h.id || h.localId) && h.chosenLocation === shopId)
        .map((h) => h.id || h.localId);
    },
  };
  const uiApi = {
promptChoice: async (title, options) => {
  const msg =
    `${title}\n\n${options
         .map((o, i) => `${i + 1}. ${o.label || o}`)
          .join('\n')}\n\nEnter a number:`,
  const pick = window.prompt(msg, '1');
  const idx = Math.max(0, Math.min(options.length - 1, (Number(pick) | 0) - 1));
  return idx;
},
    promptNumber: ({ title, message, min, max, defaultValue }) =>
      promptNumber(title || message || 'Enter a number', { min, max, initial: defaultValue }),
    toast: (msg) => {
      try {
        console.log('[Event]', msg);
      } catch {}
    },
  };

  // ------- Perform (services) -------
  const handlePerform = async (shopId, svc, idx = 0) => {
    if (hero.chosenLocation !== shopId) return;
    if (!svc) return;

    // Doc's Office — build io first (avoid "Cannot access 'io' before initialization")
    if (shopId === 'docsOffice') {
      const io = {
        roll: promptRoll,
        pay: (amount, label) => promptPay(hero, amount, label),
        promptNumber: (label, opts) => promptNumber(label, opts),
        // picker that excludes surgeryLocked
        promptInjuryOrMutation: (h) => {
          const injuries = (getInjuryList(h) || []).filter((c) => !c?.surgeryLocked);
          const mutations = (getMutationList(h) || []).filter((c) => !c?.surgeryLocked);
          const options = [
            ...injuries.map((c, i) => ({ label: `Injury: ${c?.name || c?.title || 'Injury'}`, kind: 'injury', _idx: i })),
            ...mutations.map((c, i) => ({ label: `Mutation: ${c?.name || c?.title || 'Mutation'}`, kind: 'mutation', _idx: i })),
          ];
          if (!options.length) return null;
          const pickStr = window.prompt(
            'Choose a condition to operate on (enter a number):\n\n' +
              options.map((o, i) => `${i + 1}. ${o.label}`).join('\n'),
            '1'
          );
          if (pickStr == null) return null;
          const n = Math.max(0, Math.min(options.length - 1, (Number(pickStr) | 0) - 1));
          return options[n] || null;
        },
        notify: (msg) => console.log('[Doc]', msg),
      };

      // Surgery
      if (svc?.id === 'doc_surgery') {
        const meId = hero.id || hero.localId;
        const mods = getDocsOfficeModsForHero(state, meId);
        const res = await performSurgery({ hero, townState: state, io, mods });
        if (res?.patch) {
          posseApi.updateHero(meId, res.patch);
        }
        if (res?.log?.length) console.log(res.log.join('\n'));
        setState(loadTownState());
        return;
      }

      // Treat Corruption
      if (svc?.id === 'doc_treat_corruption') {
        const { actions, log } = await performTreatCorruption({ hero, io });
        applyActions(actions);
        if (log?.length) console.log(log.join('\n'));
        setState(loadTownState());
        return;
      }

      // Injections clicked as "Perform" (rare)
      if (isInjection(svc)) {
        const { actions, log } = await performInjectionPurchase({ hero, item: svc, townState: state, io });
        applyActions(actions);
        if (log?.length) console.log(log.join('\n'));
        setState(loadTownState());
        return;
      }
    }

    // Church rituals (Perform)
    const meId = hero.id || hero.localId;
    if (svc?.id === 'ch_ritual_exorcism_of_madness') {
      await applyChurchRitual({ posseApi, uiApi, heroId: meId }, 'ch_ritual_exorcism_of_madness');
      setState(loadTownState());
      return;
    }
    if (svc?.id === 'ch_ritual_banish_corruption') {
      await applyChurchRitual({ posseApi, uiApi, heroId: meId }, 'ch_ritual_banish_corruption');
      setState(loadTownState());
      return;
    }
    if (svc?.id === 'ch_ritual_resurrection') {
      await applyChurchRitual({ posseApi, uiApi, heroId: meId }, 'ch_ritual_resurrection');
      setState(loadTownState());
      return;
    }

    // Generic services (aura-style etc.)
    if (svc.resultTable) {
      alert(`Performed: ${svc.name}\n\nRoll as needed and apply the result table.`);
    } else {
      alert(`Performed: ${svc.name}`);
    }
  };
  // ------- Buy (items/tokens/injections) -------
  const canAfford = (cost = {}) => {
    if (typeof cost === 'number') return (hero.gold ?? 0) >= cost;
    if (!cost || typeof cost !== 'object') return true;
    return (
      (hero.gold ?? 0) >= (cost.gold ?? 0) &&
      (hero.darkStone ?? 0) >= (cost.darkStone ?? 0) &&
      (hero.scrap ?? 0) >= (cost.scrap ?? 0) &&
      (hero.tech ?? 0) >= (cost.tech ?? 0)
    );
  };

  const handleBuy = async (shopId, item, idx = 0) => {
    if (hero.chosenLocation !== shopId) return;
    if (!item) return;

    // Doc's Office purchases
    if (shopId === 'docsOffice') {
      const io = {
        pay: (amount, label) => promptPay(hero, amount, label),
        roll: promptRoll,
        promptNumber: (label, opts) => promptNumber(label, opts),
        notify: (msg) => console.log('[Doc]', msg),
      };

      // Injections: enforce via executor
      if (isInjection(item)) {
        const { actions, log } = await performInjectionPurchase({ hero, item, townState: state, io });
        applyActions(actions);
        if (log?.length) console.log(log.join('\n'));
        setState(loadTownState());
        return;
      }

      // Normal doc items or token-like supplies
      const { actions, log } = await performDocItemPurchase({ hero, item, io });
      applyActions(actions);
      if (log?.length) console.log(log.join('\n'));
      setState(loadTownState());
      return;
    }

    // Rituals attempted via “Buy” -> route to Perform
    if (
      isRitualService(item) ||
      isBanishCorruptionService(item) ||
      isExorcismService(item) ||
      isResurrectionService(item)
    ) {
      handlePerform(shopId, item, idx);
      return;
    }

    // Blessed Aura purchase — prompt, Spirit test, then auto-equip
    if (isBlessedAura(item)) {
      const costRaw = getCost(item);
      const costObj = normalizeCostObject(costRaw);
      if (!canAfford(costObj)) {
        alert('Cannot afford this Blessed Aura.');
        return;
      }

      const testSpec = item.rules?.test || { stat: 'Spirit', target: 4 };
      const auraName = item.name.replace(/\s*\(.*\)$/, '');

      // Prompt: confirm purchase and explain the test
      const proceed = window.confirm(
        `Purchase: ${auraName}\n` +
        `Cost: $${costObj.gold ?? 0}\n\n` +
        `This requires a ${testSpec.stat} ${testSpec.target}+ test to obtain.\n` +
        `Gold is spent whether the test passes or fails.\n\n` +
        `Proceed with purchase?`
      );
      if (!proceed) return;

      // Deduct cost
      const goldAfter = (hero.gold ?? 0) - (costObj.gold ?? 0);
      const darkStoneAfter = (hero.darkStone ?? 0) - (costObj.darkStone ?? 0);

      // Roll Spirit test using effective stat
      let statVal = Number(hero?.stats?.[testSpec.stat] ?? hero?.[testSpec.stat] ?? 1) || 1;
      try {
        const { calculateCurrentStats } = await import('../../../utils/calculateStats');
        const { stats: merged = {} } = calculateCurrentStats(hero);
        const effective = Number(merged[testSpec.stat]) || 0;
        if (effective > statVal) statVal = effective;
      } catch {}
      const dice = Math.max(1, statVal);
      const rolls = Array.from({ length: dice }, () => Math.floor(Math.random() * 6) + 1);
      const passed = rolls.some(r => r >= testSpec.target);

      if (!passed) {
        // Failed — pay gold but don't receive the aura
        updateHero({ id: hero.id || hero.localId, gold: goldAfter, darkStone: darkStoneAfter });
        alert(
          `${testSpec.stat} ${testSpec.target}+ Test FAILED\n\n` +
          `Rolled: [${rolls.join(', ')}]  (${dice}d6, need ${testSpec.target}+)\n\n` +
          `You paid $${costObj.gold ?? 0} but the blessing did not take hold.`
        );
        return;
      }

      // Passed — add to inventory and auto-equip to Blessed Aura slot
      const auraItem = {
        ...item,
        id: item.id || `aura_${Date.now()}`,
        name: auraName,
        type: 'Aura',
        slot: 'Blessed Aura',
      };

      const inventory = Array.isArray(hero.inventory) ? [...hero.inventory] : [];
      inventory.push(auraItem);

      const gear = { ...(hero.gear || {}) };
      // Return old aura to inventory if one was equipped
      const oldAura = gear['Blessed Aura'];
      if (oldAura && oldAura.name && oldAura.name !== 'Empty Slot') {
        inventory.push(oldAura);
      }
      gear['Blessed Aura'] = auraItem;

      updateHero({ id: hero.id || hero.localId, gold: goldAfter, darkStone: darkStoneAfter, inventory, gear });

      alert(
        `${testSpec.stat} ${testSpec.target}+ Test PASSED!\n\n` +
        `Rolled: [${rolls.join(', ')}]  (${dice}d6, need ${testSpec.target}+)\n\n` +
        `${auraName} equipped to your Blessed Aura slot.\n` +
        `Effect: ${item.effect || 'See gear details.'}`
      );
      return;
    }

    // Restrictions — class gate
    if (item?.restrictions?.allowedClasses) {
      const allowed = item.restrictions.allowedClasses.map(String);
      const heroClass = String(hero?.heroClass || hero?.class || hero?.name || '');
      if (!allowed.includes(heroClass)) {
        alert(`Only ${allowed.join('/')} may purchase this.`);
        return;
      }
    }

    // One Mount per hero
    const isMount =
      item?.slot === 'Mount' ||
      (Array.isArray(item?.tags) && item.tags.includes('Mount'));
    const heroHasMount =
      Array.isArray(hero?.inventory) && hero.inventory.some((it) => isMount && (it?.slot === 'Mount' || it?.tags?.includes('Mount')));
    if (isMount && heroHasMount) {
      alert('You already have a Mount. A hero can only own one Mount at a time.');
      return;
    }

    const itemId = getItemId(item, idx);
    const costRaw = getCost(item);
    const costObj = normalizeCostObject(costRaw);

    if (!canAfford(costObj)) {
      alert('Cannot afford.');
      return;
    }

    // Weight guard for regular gear (token buys have no weight)
    if (!isTokenPurchase(item) && willExceedCarryLikeGearTab(hero, item)) {
      const cap = getCarryCapacityLikeGearTab(hero);
      const cur = getTotalLoad(hero);
      const w = getItemWeight(item);
      alert(`Too heavy to carry. Capacity ${cur}/${cap}. Item weighs ${w}. Make room first.`);
      return;
    }

    // Token purchases
    if (isTokenPurchase(item)) {
      const perVisitLimit = item.purchaseLimitPerVisit || item?.rules?.purchaseLimitPerVisit || null;
      if (perVisitLimit) {
        const used = getVisitCount(itemId);
        if (used >= perVisitLimit) {
          alert('You are at the per-visit limit for this token.');
          return;
        }
      }

      const grant = item.grantsToken || { type: item.name, amount: 1 };
      const amount = Number(grant.amount || 1);
      const type = String(grant.type || item.name || 'Token');

      const gold = (hero.gold ?? 0) - (costObj.gold ?? 0);
      const darkStone = (hero.darkStone ?? 0) - (costObj.darkStone ?? 0);
      const scrap = (hero.scrap ?? 0) - (costObj.scrap ?? 0);
      const tech = (hero.tech ?? 0) - (costObj.tech ?? 0);

      const sideBag = nextSideBag(hero, type, amount);
      updateHero({ id: hero.id || hero.localId, gold, darkStone, scrap, tech, sideBag });

      incVisitCount(itemId);
      return;
    }

    // Regular gear purchase
    const dsGrant = Number(item?.grantsCurrency?.darkStone || item?.carries?.darkStone || 0);

    const gold = (hero.gold ?? 0) - (costObj.gold ?? 0);
    const darkStone = (hero.darkStone ?? 0) - (costObj.darkStone ?? 0) + dsGrant;
    const scrap = (hero.scrap ?? 0) - (costObj.scrap ?? 0);
    const tech = (hero.tech ?? 0) - (costObj.tech ?? 0);

    const inventory = Array.isArray(hero.inventory) ? [...hero.inventory] : [];
    inventory.push({ ...item, id: itemId });

    updateHero({ id: hero.id || hero.localId, gold, darkStone, scrap, tech, inventory });
  };

  // ---------- rare find helpers ----------
  const readRareFind = (shopId) => {
    const s = state || loadTownState();
    return s?.shopMods?.[shopId]?.rareFind || null; // { priceDS, artifact }
  };
  const clearRareFind = (shopId) => {
    const s = loadTownState();
    const cur = s.shopMods?.[shopId] || {};
    const next = { ...cur };
    delete next.rareFind;
    s.shopMods = { ...(s.shopMods || {}), [shopId]: next };
    saveTownState(s);
    setState(loadTownState());
  };
  const handleBuyRareFind = (shopId) => {
    if (hero.chosenLocation !== shopId) {
      alert('Visit this location first.');
      return;
    }
    const rf = readRareFind(shopId);
    if (!rf || !rf.artifact) return;

    const priceDS = Number(rf.priceDS || 0);
    const dsOnHero = Number(hero.darkStone ?? 0);
    if (dsOnHero < priceDS) {
      alert(`Not enough Dark Stone (need ${priceDS}).`);
      return;
    }

    if (willExceedCarryLikeGearTab(hero, rf.artifact)) {
      const cap = getCarryCapacityLikeGearTab(hero);
      const cur = getTotalLoad(hero);
      const w = getItemWeight(rf.artifact);
      alert(`Too heavy to carry. Capacity ${cur}/${cap}. Artifact weighs ${w}. Make room first.`);
      return;
    }

    const inventory = Array.isArray(hero.inventory) ? [...hero.inventory] : [];
    const added = { ...rf.artifact };
    if (!added.id) added.id = `artifact_${Date.now()}`;
    inventory.push(added);

    const darkStone = dsOnHero - priceDS;
    updateHero({ id: hero.id || hero.localId, darkStone, inventory });

    clearRareFind(shopId);
    alert(`Purchased Artifact: ${rf.artifact.name} for ${priceDS} Dark Stone.`);
  };

  // allowed shops by lodging
  const allowedShops = Object.entries(shopDataById).filter(([id]) =>
    hero.lodging === 'Camp' ? CAMP_SHOPS.includes(id) : true
  );

  // derive subshop + categories
  const shop = openLocationId ? shopDataById[openLocationId] : null;
  const subshops = shop && Array.isArray(shop.shops) ? shop.shops : null;
  const activeSubshop =
    subshops?.find((s) => s.id === openSubshopId) || (subshops ? subshops[0] : null);
  const shopForCategories = activeSubshop || shop;
  const categories = buildCategoriesForShop(shopForCategories, tabsByShop);
  const activeCat = categories.find((c) => c.id === openSubcatId) ?? categories[0];
  const entries = activeCat?.entries || [];

  return (
    <div className="p-4 space-y-4">
	{/* Lodging selection at start of the town day */}
{!hero.lodging && (
  <div className="border p-3 rounded bg-yellow-50 shadow mb-3">
    <h3 className="font-bold mb-2">Choose Lodging for the Day</h3>
    <p className="text-sm mb-2">
      Hotel: Visit any Town location.<br/>
      Camp: Limited to the Camp Site next day, but roll for Camp Events.
    </p>
    <div className="flex gap-2">
      <button
        className="btn btn-primary"
        onClick={() => updateHero({ id: hero.id || hero.localId, lodging: 'Hotel' })}
      >
        Stay at Hotel
      </button>
      <button
        className="btn btn-secondary"
        onClick={() => updateHero({ id: hero.id || hero.localId, lodging: 'Camp' })}
      >
        Camp Outside
      </button>
    </div>
  </div>
)}

      <h2 className="text-xl font-bold">Town Visit</h2>
      <p className="italic text-sm mb-2">
        {hero.name ? `Welcome, ${hero.name}. ` : null}
        Staying at: <strong>{hero.lodging || 'Undecided'}</strong>
        {hero.gold !== undefined && <span> | Gold: ${hero.gold}</span>}
        {hero.darkStone !== undefined && <span> | Dark Stone: {hero.darkStone}</span>}
        {hero.scrap !== undefined && <span> | Scrap: {hero.scrap}</span>}
        {hero.tech !== undefined && <span> | Tech: {hero.tech}</span>}
      </p>

      {/* Locations */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {allowedShops.map(([sid, s]) => {
          const isVisited = hero.chosenLocation === sid;
          return (
            <button
              key={sid}
              className={`btn ${isVisited ? 'btn-success' : 'btn-outline'} justify-between`}
              onClick={() => handleOpenLocation(sid)}
            >
              <span>{s.name}</span>
              {isVisited && <span className="ml-2 text-xs">(Visited)</span>}
            </button>
          );
        })}
      </div>

      {/* Location panel */}
      {openLocationId && (
        <div className="border rounded p-3 bg-white shadow">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-lg">{shop?.name || 'Location'}</h3>
              {hero.chosenLocation === openLocationId && (
                <span className="text-green-600 text-sm">(Chosen)</span>
              )}
            </div>
            <div className="flex gap-2">
              <button className="btn btn-secondary" onClick={handleCloseLocation}>
                Close
              </button>
              {!hero.chosenLocation && (
                <button
                  className="btn btn-primary"
                  disabled={!canVisit}
                  onClick={() => handleVisit(openLocationId)}
                >
                  Visit
                </button>
              )}
            </div>
          </div>

          {/* Description / rules */}
          {shop?.description && <p className="italic text-sm mb-2 mt-2">{shop.description}</p>}
          {Array.isArray(shop?.rules) && shop.rules.length > 0 && (
            <ul className="list-disc list-inside mb-2">
              {shop.rules.map((rule, idx) => (
                <li key={idx} className="text-sm">
                  {rule}
                </li>
              ))}
            </ul>
          )}

          {/* Event Card */}
          <TownEventCard
            shopId={openLocationId}
            onSetRoll={(n) => {
              setLocEventRoll(openLocationId, n);
              setState(loadTownState());
            }}
            onResolve={async () => {
              const ctx = makeLocEventCtx({ posseApi, uiApi });
              await resolveLocEvent(openLocationId, ctx);
              setState(loadTownState());
            }}
          />

          {/* Subshops */}
          {Array.isArray(subshops) && subshops.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {subshops.map((s) => (
                <button
                  key={s.id}
                  className={`btn btn-sm ${openSubshopId === s.id ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => {
                    setOpenSubshopId(s.id);
                    setOpenSubcatId(null);
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}

          {/* Categories */}
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`btn btn-sm ${activeCat.id === cat.id ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setOpenSubcatId(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {/* Entries grid */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            {entries.length === 0 && (
              <div className="text-sm text-gray-500">No entries in this category.</div>
            )}

            {entries.map((item, idx) => {
              if (!item) return null;

              const costRaw = getCost(item);
              const costObj =
                typeof costRaw === 'number' || (costRaw && typeof costRaw === 'object')
                  ? typeof costRaw === 'number'
                    ? { gold: costRaw }
                    : costRaw
                  : null;

              const looksService =
                isInjection(item) ||
                (!isTokenPurchase(item) &&
                  !item.slot &&
                  !(item.type && String(item.type).toLowerCase().includes('gear')) &&
                  !item.value &&
                  (isRitualService(item) ||
                    isBanishCorruptionService(item) ||
                    (typeof item.cost !== 'number' &&
                      (typeof item.cost !== 'object' || item.cost === null)) ||
                    'resultTable' in item ||
                    'requirement' in item ||
                    String(item?.name || '').toLowerCase().includes('surgery')));

              const afford = costObj ? canAfford(costObj) : true;
              const canBuy = hero.chosenLocation === openLocationId && afford;

              const idForCount = getItemId(item, idx);
              const perVisitLimit =
                item.purchaseLimitPerVisit || item?.rules?.purchaseLimitPerVisit || null;
              const usedCount = isTokenPurchase(item) ? (getVisitCount(idForCount) || 0) : 0;
              const atLimit = isTokenPurchase(item) && perVisitLimit && usedCount >= perVisitLimit;

              const hands = deriveHandsRequired(item);
              const weight = Number(item?.weight || 0);
              const dsCost = typeof costObj === 'object' ? Number(costObj?.darkStone || 0) : 0;
              const dsCarry = Number(
                item?.grantsCurrency?.darkStone || item?.carries?.darkStone || 0
              );
              const dsShown = dsCarry > 0 && dsCost > 0 ? dsCarry : dsCarry > 0 ? dsCarry : dsCost;

              const showInjectBtn = isInjection(item) && hero.chosenLocation === openLocationId;

              return (
                <div key={item.id || idx} className="border p-2 rounded shadow-sm">
                  {/* Header */}
                  <div className="font-bold flex items-center justify-between gap-2">
                    <span>{item.name}</span>
                    {isTokenPurchase(item) && perVisitLimit != null && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          atLimit
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {usedCount}/{perVisitLimit} this visit
                      </span>
                    )}
                  </div>

                  {/* Cost */}
                  <div className="text-xs text-gray-600 mt-0.5">
                    Cost: <b>{formatCost(costRaw)}</b>
                  </div>

                  {/* Stats icons row */}
                  <div className="mt-2 flex flex-wrap items-center gap-2 leading-none">
                    {typeof item.upgradeSlots === 'number' && (
                      <IconRowComposite
                        map={ASSETS.slot}
                        count={item.upgradeSlots}
                        title={`Upgrade Slots: ${item.upgradeSlots}`}
                      />
                    )}
                    {weight > 0 && (
                      <IconRowRepeat
                        src={ASSETS.weight}
                        count={weight}
                        title={`Weight: ${weight}`}
                      />
                    )}
                    {dsShown > 0 && (
                      <IconRowRepeat
                        src={ASSETS.ds}
                        count={dsShown}
                        title={
                          dsCarry && dsCost
                            ? `Dark Stone: ${dsCarry} carried, ${dsCost} cost`
                            : dsCarry
                            ? `Dark Stone Carried: ${dsCarry}`
                            : `Dark Stone Cost: ${dsCost}`
                        }
                      />
                    )}
                    {hands > 0 && (
                      <IconRowComposite
                        map={ASSETS.hand}
                        count={hands}
                        title={`Hands Required: ${hands}`}
                      />
                    )}
                  </div>

                  {/* Tags */}
                  {Array.isArray(item.tags) && item.tags.length > 0 && (
                    <div className="mt-1">
                      {item.tags.map((t, i) => (
                        <span
                          key={`tag_${i}`}
                          className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-gray-100 border text-gray-700 mr-1 mt-1"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Effects / description */
                  {/* Rules text (e.g., Frontier Outpost Bank) */}
                  {Array.isArray(item?.rules?.text) && item.rules.text.length > 0 && (
                    <div className="text-xs text-gray-800 mt-1 space-y-1">
                      {item.rules.text.map((line, i) => (
                        <p key={`rt_${i}`}>{line}</p>
                      ))}
                    </div>
                  )}
{item?.effects && Array.isArray(item.effects) && item.effects.length > 0 && (
                    <ul className="text-xs list-disc list-inside mt-1 text-gray-800">
                      {item.effects.map((e, i) => (
                        <li key={`eff_${i}`}>{typeof e === 'string' ? e : JSON.stringify(e)}</li>
                      ))}
                    </ul>
                  )}
                  {item?.effect && (
                    <div className="text-xs text-gray-700 mt-1">{item.effect}</div>
                  )}
                  {item?.description && (
                    <div className="text-xs text-gray-700 mt-1">{item.description}</div>
                  )}

                  {/* Result table preview for services */}
                  {looksService && item.resultTable && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer">Result Table</summary>
                      <div className="text-xs bg-gray-50 border rounded p-2 mt-1">
                        {Object.entries(item.resultTable).map(([roll, out]) => (
                          <div key={roll}>
                            <b>{roll}:</b> {String(out)}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  {/* Actions */}
                  <div className="mt-2 flex items-center gap-2">
                    {showInjectBtn ? (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleBuy(openLocationId, item, idx)}
                      >
                        Inject
                      </button>
                    ) : !looksService ? (
                      <button
                        className="btn btn-sm btn-primary"
                        disabled={!canBuy || atLimit}
                        title={
                          !hero.chosenLocation
                            ? 'Visit this location first'
                            : !afford
                            ? 'Cannot afford'
                            : atLimit
                            ? 'At per-visit limit'
                            : ''
                        }
                        onClick={() => handleBuy(openLocationId, item, idx)}
                      >
                        Buy
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-primary"
                        disabled={hero.chosenLocation !== openLocationId}
                        onClick={() => handlePerform(openLocationId, item, idx)}
                      >
                        Perform
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rare Find */}
          {openLocationId === 'blacksmith' && (
            <RareFindPanel
              shopId={openLocationId}
              readRareFind={readRareFind}
              hero={hero}
              onBuy={() => handleBuyRareFind(openLocationId)}
            />
          )}
        </div>
      )}
    </div>
  );
}
