// src/components/Shops/IndianTradingPostShop.jsx
//
// ⚠️ DEPRECATION NOTICE ⚠️
// This component is currently NOT USED in the application.
// The Indian Trading Post is handled directly by TownTab (src/components/TownTab/index.jsx)
// which calls the service handlers from indianTradingPostServices.js.
//
// This file is kept for reference but is not actively maintained.
// If you need to modify Indian Trading Post behavior, edit TownTab and indianTradingPostServices.js instead.
//
import React, { useMemo, useState } from 'react';
import { usePosse } from '../../context/PosseContext';

import indianTradingPostShop from '../../data/townLocations/indianTradingPostShop.js';
import { tabsByShop } from '../../data/townLocations/tabsByShop.js';

import {
  canUseTribalTent,
  normalizeINDIAN_TP_Item,
} from '../../utils/locationHandlers/indianTradingPostUtils';
import {
  performSpiritCleansing,
  performVisionQuest,
} from '../../utils/locationHandlers/indianTradingPostServices';
import { calculateCurrentStats } from '../../utils/calculateStats';

// Reuse your TownTab helper icons/formatters for consistent UI
import {
  ASSETS,
  IconRowComposite,
  IconRowRepeat,
  getCost,
  normalizeCostObject,
  formatCost,
  deriveHandsRequired,
  isInjection,
  isTokenPurchase,
  isRitualService,
  willExceedCarryLikeGearTab,
  getCarryCapacityLikeGearTab,
  getTotalLoad,
  getItemWeight,
  nextSideBag,
} from '../TownTab/townTabHelpers';

// ---------- tiny local prompt helpers (fallbacks if uiApi not given) ----------
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

// --------------------------------- Component ---------------------------------
/**
 * IndianTradingPostShop
 * Props:
 *  - hero: active hero object (optional; falls back to usePosse active hero)
 *  - posseApi: { getHero(id), updateHero(id, patch) } (optional; falls back to usePosse)
 *  - uiApi: { promptChoice, toast } (optional; falls back to window.prompt/console)
 */
export default function IndianTradingPostShop({ hero: heroProp, posseApi: posseApiProp, uiApi: uiApiProp }) {
  const posseCtx = usePosse();
  const hero = useMemo(() => {
    if (heroProp) return heroProp;
    const id = posseCtx.activeHeroId;
    return posseCtx.posse.find((h) => (h.id || h.localId) === id) || null;
  }, [heroProp, posseCtx]);

  const posseApi = useMemo(() => {
    if (posseApiProp) return posseApiProp;
    return {
      getHero: (id) => posseCtx.posse.find((h) => (h.id || h.localId) === id) || null,
      updateHero: (id, patchOrFn) => {
        const target = posseCtx.posse.find((h) => (h.id || h.localId) === id) || {};
        const patch = typeof patchOrFn === 'function' ? patchOrFn(target) : (patchOrFn || {});
        posseCtx.updateHero({ id, ...patch });
      },
      addToken: (id, tokenName) => {
        const target = posseCtx.posse.find((h) => (h.id || h.localId) === id) || {};
        const sideBag = nextSideBag(target, tokenName, 1);
        posseCtx.updateHero({ id, sideBag });
      },
    };
  }, [posseApiProp, posseCtx]);

  const uiApi = useMemo(() => {
    if (uiApiProp) return uiApiProp;
    return {
      promptChoice: async (title, options) => {
        const msg =
          `${title}\n\n${options.map((o, i) => `${i + 1}. ${o.label || o}`).join('\n')}\n\nEnter a number:`;
        const pick = window.prompt(msg, '1');
        const idx = Number.parseInt(pick, 10) - 1;
        if (!Number.isFinite(idx) || idx < 0 || idx >= options.length) return -1;
        return idx;
      },
      toast: (msg) => {
        try { console.log('[IndianTradingPost]', msg); } catch {}
      },
    };
  }, [uiApiProp]);

  const [activeSubshop, setActiveSubshop] = useState(indianTradingPostShop.shops?.[0]?.id || null);

  if (!hero) return <div className="p-3">No active hero.</div>;

  const shopId = indianTradingPostShop.id; // 'indianTradingPost'
  const shopTabs =
    tabsByShop?.[shopId] ||
    [
      { id: 'mm', label: 'Medicine Man', pick: 'services', subshop: 'tradingPost' },
      { id: 'trading', label: 'Trading', pick: 'items', subshop: 'tradingPost' },
      { id: 'glyphs', label: 'Glyph Upgrades', pick: 'items', subshop: 'tradingPost',
        filter: (it) => String(it.id || '').startsWith('glyph_') },
      { id: 'tent', label: 'Tribal Tent', pick: 'items', subshop: 'tribalTent' },
      { id: 'arrows', label: 'Arrows & Ammo', pick: 'items', subshop: 'tribalTent',
        filter: (it) => Array.isArray(it?.keywords) && it.keywords.includes('Arrow') },
    ];

  const subshops = indianTradingPostShop.shops || [];
  const activeSub = subshops.find((s) => s.id === activeSubshop) || subshops[0];

  // Build categories from tabsByShop entry
  const categories = shopTabs
    .filter((t) => !activeSubshop || t.subshop === activeSubshop)
    .map((t) => ({
      ...t,
      entries:
        t.pick === 'services'
          ? (activeSub?.services || indianTradingPostShop.shops?.[0]?.services || [])
          : (activeSub?.items || [])
    }));

  // -------------- Actions: Perform (services) --------------
  const handlePerform = async (svc) => {
    const meId = hero.id || hero.localId;

    // Indian Trading Post services
    if (svc?.id === 'spirit_cleansing') {
      const idx = await uiApi.promptChoice('Spirit Cleansing — choose one ailment', [
        { label: 'Madness' }, { label: 'Curse' }, { label: 'Mutation' },
      ]);
      if (idx < 0) return;
      const targets = ['Madness', 'Curse', 'Mutation'];
      const [costRoll]   = await promptRoll(1, 6, 'Spirit Cleansing Cost — Roll D6 for Dark Stone cost (or blank to auto-roll)');
      const [resultRoll] = await promptRoll(1, 6, 'Spirit Cleansing Outcome — Roll D6 for result (1=gain mutations, 4-5=healed, 6=healed+bonus) (or blank to auto-roll)');
      const out = await performSpiritCleansing({
        posseApi, heroId: meId, target: targets[idx], payRoll: costRoll, resultRoll,
      });
      uiApi.toast(out.log);
      return;
    }

    if (svc?.id === 'vision_quest') {
      // Check if hero already has a Spirit Guide
      const hasGuide = !!hero?.spiritGuide;

      let guideRoll = null;

      // FIRST: Determine Spirit Guide animal (first time only)
      if (!hasGuide) {
        const [roll] = await promptRoll(1, 6, 'Spirit Guide — Roll D6 to determine your Spirit Guide animal (1=Beaver, 2=Wolf, 3=Eagle, 4=Mouse, 5=Crow, 6=Snake) (or blank to auto-roll)');
        guideRoll = roll;
      }

      // THEN: Do Spirit 5+ test (roll dice equal to Spirit stat value)
      const currentStats = calculateCurrentStats(hero);
      const spiritValue = currentStats.Spirit || 2;
      const spiritRolls = await promptRoll(spiritValue, 6, `Vision Quest Spirit Test — Roll ${spiritValue}D6 for Spirit 5+ test (need at least one 5+) (or blank to auto-roll)`);
      const passed = spiritRolls.some(roll => roll >= 5);

      const out = await performVisionQuest({
        posseApi, heroId: meId, spiritTestPassed: passed, guideRoll,
      });
      uiApi.toast(out.log);
      return;
    }

    // Generic: just show a note
    window.alert(`Performed: ${svc?.name || 'Service'}`);
  };

  // -------------- Actions: Buy (items/tokens) --------------
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

  const handleBuy = (item) => {
    const meId = hero.id || hero.localId;

    // Gate Tribal Tent items
    const restricted =
      Array.isArray(item?.keywords) &&
      item.keywords.some((k) => String(k).toLowerCase() === 'restricted:tribalorscout');
    if (restricted && !canUseTribalTent(hero)) {
      window.alert('Only Tribal or Scout heroes may purchase from the Tribal Tent.');
      return;
    }

    const costObj = normalizeCostObject(getCost(item));
    if (!canAfford(costObj)) {
      window.alert('Cannot afford.');
      return;
    }

    // Weight guard for gear
    if (!isTokenPurchase(item) && willExceedCarryLikeGearTab(hero, item)) {
      const cap = getCarryCapacityLikeGearTab(hero);
      const cur = getTotalLoad(hero);
      const w = getItemWeight(item);
      window.alert(`Too heavy to carry. Capacity ${cur}/${cap}. Item weighs ${w}. Make room first.`);
      return;
    }

    // Token purchase (e.g., Hatchet SideBag token)
    if (isTokenPurchase(item)) {
      const grant = item.grantsToken || { type: item.name, amount: 1 };
      const amount = Number(grant.amount || 1);
      const type = String(grant.type || item.name || 'Token');

      const gold = (hero.gold ?? 0) - (costObj.gold ?? 0);
      const darkStone = (hero.darkStone ?? 0) - (costObj.darkStone ?? 0);
      const scrap = (hero.scrap ?? 0) - (costObj.scrap ?? 0);
      const tech = (hero.tech ?? 0) - (costObj.tech ?? 0);

      const sideBag = nextSideBag(hero, type, amount);
      posseApi.updateHero(meId, { gold, darkStone, scrap, tech, sideBag });
      return;
    }

    // Regular gear purchase (merge arrows if your inventory supports quantity)
    const dsGrant = Number(item?.grantsCurrency?.darkStone || item?.carries?.darkStone || 0);

    const gold = (hero.gold ?? 0) - (costObj.gold ?? 0);
    const darkStone = (hero.darkStone ?? 0) - (costObj.darkStone ?? 0) + dsGrant;
    const scrap = (hero.scrap ?? 0) - (costObj.scrap ?? 0);
    const tech = (hero.tech ?? 0) - (costObj.tech ?? 0);

    const inventory = Array.isArray(hero.inventory) ? [...hero.inventory] : [];
    const itemId = item.id || `${item.name || 'item'}_${Date.now()}`;

    // Simple push (if you use quantity stacks for arrows, you can merge here)
    inventory.push({ ...item, id: itemId });

    posseApi.updateHero(meId, { gold, darkStone, scrap, tech, inventory });
  };

  // ------------------------------- Render --------------------------------
  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{indianTradingPostShop.name}</h3>
        <div className="text-xs text-gray-600">
          <b>{hero.name || 'Hero'}</b> — Gold: ${hero.gold ?? 0} | DS: {hero.darkStone ?? 0}
        </div>
      </div>

      {indianTradingPostShop.rules?.length ? (
        <ul className="list-disc list-inside text-sm">
          {indianTradingPostShop.rules.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      ) : null}

      {/* Subshops */}
      {subshops.length > 1 && (
        <div className="mt-1 flex flex-wrap gap-2">
          {subshops.map((s) => (
            <button
              key={s.id}
              className={`btn btn-sm ${activeSub?.id === s.id ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveSubshop(s.id)}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Categories (tabsByShop-derived) */}
      <div className="mt-2 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <a key={cat.id} href={`#cat_${cat.id}`} className="btn btn-sm btn-outline">
            {cat.label}
          </a>
        ))}
      </div>

      {/* Entries */}
      {categories.map((cat) => {
        // pick/entries already built; filter and normalize if items
        let entries = cat.entries || [];
        if (cat.pick === 'items') {
          if (typeof cat.filter === 'function') {
            entries = entries.filter(cat.filter);
          }
          // Normalize bows/arrows invariants
          entries = entries.map(normalizeINDIAN_TP_Item);
        }

        return (
          <div key={cat.id} id={`cat_${cat.id}`} className="mt-3">
            <h4 className="font-semibold mb-2">{cat.label}</h4>
            {entries.length === 0 ? (
              <div className="text-sm text-gray-500">No entries.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {entries.map((item, idx) => {
                  const costRaw = getCost(item);
                  const costObj =
                    typeof costRaw === 'number'
                      ? { gold: costRaw }
                      : (costRaw && typeof costRaw === 'object')
                        ? costRaw
                        : null;

                  const hands = deriveHandsRequired(item);
                  const weight = Number(item?.weight || 0);
                  const dsCost = typeof costObj === 'object' ? Number(costObj?.darkStone || 0) : 0;
                  const dsCarry = Number(item?.grantsCurrency?.darkStone || item?.carries?.darkStone || 0);
                  const dsShown = dsCarry > 0 && dsCost > 0 ? dsCarry : dsCarry > 0 ? dsCarry : dsCost;

                  const looksService =
                    isInjection(item) ||
                    isRitualService(item) ||
                    (!isTokenPurchase(item) &&
                      !item.slot &&
                      !(item.type && String(item.type).toLowerCase().includes('gear')) &&
                      !item.value &&
                      ('resultTable' in item || 'requirement' in item));

                  return (
                    <div key={item.id || idx} className="border p-2 rounded shadow-sm">
                      <div className="font-bold flex items-center justify-between gap-2">
                        <span>{item.name || item.id}</span>
                      </div>

                      <div className="text-xs text-gray-600 mt-0.5">
                        Cost: <b>{formatCost(costRaw)}</b>
                      </div>

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

                      <div className="mt-2 flex items-center gap-2">
                        {looksService ? (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handlePerform(item)}
                          >
                            Perform
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleBuy(item)}
                          >
                            Buy
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
