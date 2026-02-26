// Indian Trading Post helper utilities + location event handler.
// Exports: canUseTribalTent, normalizeINDIAN_TP_Item, clampArrowStack, applyArrowConsumption
// Main: handleIndianTradingPostEvent (full game-logic handler)

import indianTradingPost from '../../data/townLocations/FrontierTown/IndianTradingPost/indianTradingPost.js';
import { loadTownState, saveTownState } from '../townState';
import { d6, d3, roll2d6 } from '../diceHelpers';

const asStr = (v) => String(v ?? '').toLowerCase();
const asNum = (v, fb = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : fb);

const shopId = 'indianTradingPost';

// ---- shopMods helpers ------------------------------------------------
function patchShopMods(patch) {
  const s = loadTownState();
  const cur = s.shopMods?.[shopId] || {};
  const next = { ...cur, ...patch };
  const updated = { ...s, shopMods: { ...(s.shopMods || {}), [shopId]: next } };
  saveTownState(updated);
}

// ---- hero keyword helpers --------------------------------------------
function hasKeyword(hero, kw) {
  const kws = Array.isArray(hero?.keywords) ? hero.keywords.map(asStr) : [];
  return kws.includes(asStr(kw));
}

// ---------- Tribal Tent gating ----------
export function canUseTribalTent(hero) {
  const kws = Array.isArray(hero?.keywords) ? hero.keywords.map(asStr) : [];
  return kws.includes('tribal') || kws.includes('scout');
}

// ---------- Arrow stack utilities ----------
export function clampArrowStack(stack) {
  return Math.max(0, Math.min(12, asNum(stack, 0)));
}

export function applyArrowConsumption(currentStack, consume = 1) {
  const n = clampArrowStack(currentStack);
  return clampArrowStack(n - Math.max(0, Math.min(1, consume)));
}

// ---------- Optional: normalize shop items (bows/stackables) ----------
export function normalizeINDIAN_TP_Item(item) {
  if (!item) return item;

  const slot = asStr(item.slot);
  if (slot === 'bow') {
    return {
      ...item,
      weight: item.weight ?? 1,
      twoHanded: item.twoHanded ?? true,
      upgradeSlots: item.upgradeSlots ?? 2,
      effects: [
        ...(Array.isArray(item.effects) ? item.effects : []),
        '+1 Initiative while equipped',
        'Crit on 5–6',
      ],
    };
  }
  const kws = Array.isArray(item?.keywords) ? item.keywords.map(asStr) : [];
  if (kws.includes('arrow')) {
    return { ...item, stackable: true, maxStack: 12, consumeOnHit: true };
  }
  return item;
}

// ---------- Event display text (from data file) -----------------------
function display(roll) {
  const idx = Math.max(0, Math.min(10, roll - 2));
  const ev = Array.isArray(indianTradingPost?.events) ? indianTradingPost.events[idx] : null;
  if (!ev) return { title: 'Indian Trading Post Event', lore: '', effect: 'No Event.' };
  return { title: ev.name, lore: ev.lore, effect: ev.effect };
}

// ---------- Game-logic handler ----------------------------------------
/**
 * ctx methods (standard handler interface):
 * - getActiveHeroId(), getHeroById(id), updateHero(id, patchOrFn)
 * - doSkillCheck(id, { stat, target }), enqueueChartRoll(id, chartType)
 * - addKeyword(id, keyword), addToken(id, tokenName)
 * - promptChoice(title, options[]), toast(msg)
 * - getHeroesAtShop(shopId)
 */
async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId();

  // 2: Spirits Running Amok — Darkness +D3, every hero takes 2D6 Horror Hits
  if (roll === 2) {
    const darknessMove = d3();
    ctx.toast?.(`Spirits Running Amok: Darkness Track moves forward ${darknessMove} steps!`);

    // Apply horror hits to all heroes in town
    const heroIds = ctx.getHeroesAtShop?.(shopId) || [id];
    for (const hid of heroIds) {
      if (!hid) continue;
      const horrorHits = d6() + d6();
      ctx.updateHero(hid, h => ({
        ...h,
        wounds: (h.wounds || 0) + horrorHits,
      }));
      const hero = ctx.getHeroById?.(hid) || {};
      ctx.toast?.(`${hero.name || 'Hero'} takes ${horrorHits} Horror Hits from rampaging spirits.`);
    }
    return;
  }

  // 3: Possessed Shaman — No Spirit Cleansing/Quests; Lore 6+ test for grit+XP
  if (roll === 3) {
    patchShopMods({ spiritCleansingDisabled: true, visionQuestsDisabled: true });
    ctx.toast?.('The Shaman is possessed! Spirit Cleansing and Vision Quests are unavailable today.');

    const hero = ctx.getHeroById?.(id) || {};
    const heroLore = Number(hero?.stats?.Lore ?? hero?.Lore ?? 0);
    if (heroLore >= 3) {
      const passed = await ctx.doSkillCheck(id, { stat: 'Lore', target: 6 });
      if (passed) {
        ctx.updateHero(id, h => ({
          ...h,
          grit: Math.min((h.maxGrit || 2), (h.grit || 0) + 1),
          xp: (h.xp || 0) + 25,
        }));
        ctx.toast?.(`${hero.name || 'Hero'} helps drive out the demon: Recover 1 Grit, +25 XP.`);
      } else {
        const horrorHits = d6();
        ctx.updateHero(id, h => ({
          ...h,
          wounds: (h.wounds || 0) + horrorHits,
        }));
        ctx.toast?.(`${hero.name || 'Hero'} fails the Lore test: takes ${horrorHits} Horror Hits.`);
      }
    } else {
      ctx.toast?.(`${hero.name || 'Hero'} does not have Lore 3+ and cannot attempt the test.`);
    }
    return;
  }

  // 4-5: Unfriendly Welcome — +$50 prices for non-Tribal heroes
  if (roll === 4 || roll === 5) {
    const hero = ctx.getHeroById?.(id) || {};
    const isTribal = hasKeyword(hero, 'Tribal');
    if (!isTribal) {
      const cur = loadTownState().shopMods?.[shopId] || {};
      patchShopMods({ priceDelta: (cur.priceDelta || 0) + 50 });
      ctx.toast?.('Unfriendly Welcome: All Indian Trading Post prices are +$50 (you lack the Tribal keyword).');
    } else {
      ctx.toast?.('Unfriendly Welcome: You have the Tribal keyword — prices are unaffected.');
    }
    return;
  }

  // 6-8: No Event
  if (roll >= 6 && roll <= 8) {
    ctx.toast?.('Drumming, Dancing, and a Bonfire: No Event.');
    return;
  }

  // 9-10: Trade Opportunities — sell gear for extra D6×$25 each, DS for $100/shard
  if (roll === 9 || roll === 10) {
    patchShopMods({ tradeOpportunities: true, dsSellPrice: 100 });
    ctx.toast?.('Trade Opportunities: Sell Gear/Artifacts for extra D6×$25 each. Dark Stone sells for $100/shard (this visit).');
    return;
  }

  // 11: Animal Messenger — Spirit Armor 5+ next adventure, first KO no Injury/Madness
  if (roll === 11) {
    ctx.updateHero(id, h => ({
      ...h,
      adventureBuffs: {
        ...(h.adventureBuffs || {}),
        spiritArmor: '5+',
        firstKONoInjuryMadness: true,
        source: 'Animal Messenger (Indian Trading Post)',
      },
    }));
    ctx.toast?.('Animal Messenger: You gain Spirit Armor 5+ for your next Adventure. First KO won\'t cause Injury or Madness.');
    return;
  }

  // 12: One With the Spirits — gain Tribal keyword, or Spirit 4+ test for +Sanity
  if (roll === 12) {
    const hero = ctx.getHeroById?.(id) || {};
    const isTribal = hasKeyword(hero, 'Tribal');

    if (!isTribal) {
      ctx.addKeyword?.(id, 'Tribal');
      ctx.toast?.(`${hero.name || 'Hero'} gains the Tribal keyword — accepted into the tribe!`);
    } else {
      const passed = await ctx.doSkillCheck(id, { stat: 'Spirit', target: 4 });
      if (passed) {
        ctx.updateHero(id, h => ({
          ...h,
          sanity: (h.sanity || 0) + 1,
          maxSanity: (h.maxSanity || h.sanity || 4) + 1,
        }));
        ctx.toast?.(`${hero.name || 'Hero'} communes with spirits: +1 Sanity!`);
      } else {
        ctx.toast?.(`${hero.name || 'Hero'} fails the Spirit test. No extra Sanity gained.`);
      }
    }
    return;
  }
}

// ---------- Named wrapper matching handler interface ------------------
export async function handleIndianTradingPostEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? roll2d6();
  const disp = display(roll);
  await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: [`Indian Trading Post Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
    title: disp.title,
    lore: disp.lore,
    effect: disp.effect,
  };
}

// Expose object export
export const indianTradingPostHandler = { display, apply };
