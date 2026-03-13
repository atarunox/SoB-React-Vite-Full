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
 * - doSkillCheck(id, { stat, target, message }), enqueueChartRoll(id, chartType)
 * - addKeyword(id, keyword), addToken(id, tokenName)
 * - promptChoice(title, options[]), promptNumber(msg, label), toast(msg)
 * - getHeroesAtShop(shopId)
 */
async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId();
  if (!id) return { log: [] };

  const info = display(roll);
  const log = [];

  // Every event starts with its title and lore/flavor text
  log.push(`[Indian Trading Post] (${roll}) ${info.title} — ${info.lore}`);
  log.push(`Effect: ${info.effect}`);

  // 2: Spirits Running Amok — Darkness +D3, every hero takes 2D6 Horror Hits
  if (roll === 2) {
    const darknessMove = d3();
    const s = loadTownState();
    const darkness = Number(s.darknessTrack ?? 0) + darknessMove;
    saveTownState({ ...s, darknessTrack: darkness });

    log.push(`A tribal ceremony erupts in chaos as vengeful spirits pour out! Darkness Track moves forward ${darknessMove} steps.`);
    ctx.toast?.(`Spirits Running Amok: Darkness Track +${darknessMove}!`);

    // Apply horror hits to all heroes in town
    const heroIds = ctx.getHeroesAtShop?.(shopId) || [id];
    for (const hid of heroIds) {
      if (!hid) continue;
      const horrorHits = d6() + d6();
      ctx.updateHero(hid, h => {
        const curSanity = Number(h.currentSanity ?? h.sanity ?? 0);
        const nextSanity = Math.max(0, curSanity - horrorHits);
        return { ...h, sanity: nextSanity, currentSanity: nextSanity };
      });
      const hero = ctx.getHeroById?.(hid) || {};
      log.push(`${hero.name || 'Hero'} takes ${horrorHits} Horror Hits from the rampaging spirits.`);
      ctx.toast?.(`${hero.name || 'Hero'} takes ${horrorHits} Horror Hits.`);
    }
    return { log };
  }

  // 3: Possessed Shaman — No Spirit Cleansing/Quests; Lore 6+ test for grit+XP
  if (roll === 3) {
    patchShopMods({ spiritCleansingDisabled: true, visionQuestsDisabled: true });
    log.push('The Shaman is possessed by a powerful demon! Spirit Cleansing and Vision Quests are unavailable today.');
    ctx.toast?.('The Shaman is possessed! Spirit Cleansing and Vision Quests unavailable.');

    const hero = ctx.getHeroById?.(id) || {};
    const heroLore = Number(hero?.stats?.Lore ?? hero?.Lore ?? 0);
    if (heroLore >= 3) {
      const lore3 = `POSSESSED SHAMAN\n${info.lore}\nThe shaman writhes and screams as the demon twists inside him. Only someone wise in the old ways can help.`;
      const passed = await ctx.doSkillCheck(id, {
        stat: 'Lore', target: 6,
        message: `${lore3}\nYou step forward and begin reciting ancient rites to drive out the demon...`,
      });
      if (passed) {
        ctx.updateHero(id, h => ({
          ...h,
          grit: Math.min((h.maxGrit || 2), (h.grit || 0) + 1),
          xp: (h.xp || 0) + 25,
        }));
        log.push(`${hero.name || 'Hero'} drives out the demon with ancient knowledge! Recover 1 Grit, +25 XP.`);
        ctx.toast?.(`${hero.name || 'Hero'} drives out the demon: +1 Grit, +25 XP.`);
      } else {
        const horrorHits = d6();
        ctx.updateHero(id, h => {
          const curSanity = Number(h.currentSanity ?? h.sanity ?? 0);
          const nextSanity = Math.max(0, curSanity - horrorHits);
          return { ...h, sanity: nextSanity, currentSanity: nextSanity };
        });
        log.push(`${hero.name || 'Hero'} fails to contain the demon and takes ${horrorHits} Horror Hits as it lashes out.`);
        ctx.toast?.(`${hero.name || 'Hero'} fails the Lore test: ${horrorHits} Horror Hits.`);
      }
    } else {
      log.push(`${hero.name || 'Hero'} does not have Lore 3+ and cannot attempt to drive out the demon.`);
      ctx.toast?.(`${hero.name || 'Hero'} lacks Lore 3+ — cannot attempt the test.`);
    }
    return { log };
  }

  // 4-5: Unfriendly Welcome — +$50 prices for non-Tribal heroes
  if (roll === 4 || roll === 5) {
    const hero = ctx.getHeroById?.(id) || {};
    const isTribal = hasKeyword(hero, 'Tribal');
    if (!isTribal) {
      const cur = loadTownState().shopMods?.[shopId] || {};
      patchShopMods({ priceDelta: (cur.priceDelta || 0) + 50 });
      log.push(`Tension with the local Cavalry has the tribe on edge. ${hero.name || 'Hero'} lacks the Tribal keyword — all prices here are +$50.`);
      ctx.toast?.('Unfriendly Welcome: All prices +$50 (no Tribal keyword).');
    } else {
      log.push(`${hero.name || 'Hero'} has the Tribal keyword and is welcomed as one of their own. Prices are unaffected.`);
      ctx.toast?.('Unfriendly Welcome: Tribal keyword — prices unaffected.');
    }
    return { log };
  }

  // 6-8: No Event
  if (roll >= 6 && roll <= 8) {
    log.push('The night is filled with drums, chanting, and firelight. A good time for everyone — no event.');
    ctx.toast?.('Drumming, Dancing, and a Bonfire: No Event.');
    return { log };
  }

  // 9-10: Trade Opportunities — sell gear for extra D6×$25 each, DS for $100/shard
  if (roll === 9 || roll === 10) {
    patchShopMods({ tradeOpportunities: true, dsSellPrice: 100 });
    log.push('The tribe is gearing up for war and paying top dollar! Sell Gear/Artifacts for an extra D6×$25 each. Dark Stone sells for $100/shard (this visit).');
    ctx.toast?.('Trade Opportunities: Extra D6×$25 per Gear/Artifact, Dark Stone $100/shard.');
    return { log };
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
    log.push('An owl watches you with knowing eyes, and you feel the spirits guiding your path. Gain Spirit Armor 5+ for your next Adventure. First KO will not cause Injury or Madness.');
    ctx.toast?.('Animal Messenger: Spirit Armor 5+ next Adventure. First KO safe.');
    return { log };
  }

  // 12: One With the Spirits — gain Tribal keyword, or Spirit 4+ test for +Sanity
  if (roll === 12) {
    const hero = ctx.getHeroById?.(id) || {};
    const isTribal = hasKeyword(hero, 'Tribal');

    if (!isTribal) {
      ctx.addKeyword?.(id, 'Tribal');
      log.push(`For your deeds, the tribe offers ${hero.name || 'Hero'} full acceptance. You gain the Tribal keyword!`);
      ctx.toast?.(`${hero.name || 'Hero'} gains the Tribal keyword — accepted into the tribe!`);
    } else {
      const lore12 = `ONE WITH THE SPIRITS\n${info.lore}\nYou already belong to the tribe, so the elders offer deeper spiritual insight.`;
      const passed = await ctx.doSkillCheck(id, {
        stat: 'Spirit', target: 4,
        message: `${lore12}\nYou close your eyes and open your mind to the spirit world...`,
      });
      if (passed) {
        ctx.updateHero(id, h => ({
          ...h,
          sanity: (h.sanity || 0) + 1,
          maxSanity: (h.maxSanity || h.sanity || 4) + 1,
        }));
        log.push(`${hero.name || 'Hero'} communes with the spirits and gains deeper understanding. +1 Sanity!`);
        ctx.toast?.(`${hero.name || 'Hero'} communes with spirits: +1 Sanity!`);
      } else {
        log.push(`${hero.name || 'Hero'} reaches out to the spirits but cannot find the connection. No extra Sanity gained.`);
        ctx.toast?.(`${hero.name || 'Hero'} fails the Spirit test. No Sanity gained.`);
      }
    }
    return { log };
  }

  return { log };
}

// ---------- Named wrapper matching handler interface ------------------
export async function handleIndianTradingPostEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? roll2d6();
  const result = await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: result?.log || [`Indian Trading Post Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

// Expose object export
export const indianTradingPostHandler = { display, apply };
