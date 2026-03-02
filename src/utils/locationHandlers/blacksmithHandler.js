// src/utils/locationHandlers/blacksmithHandler.js
import { loadTownState, saveTownState } from '../../utils/townState';
import { getEventDisplay } from '../locationEventText';
import blacksmithData from '../../data/townLocations/FrontierTown/Blacksmith/blacksmith.js';
import { mineArtifacts } from '../../data/items/mineArtifacts';
import { calculateCurrentStats } from '../calculateStats';

// NEW: condition notes for permanent max stat changes
import { makeMaxChangeNote, pushConditionNote } from '../../utils/conditionNotes';
import { d6, roll2d6 as d2d6 } from '../../utils/diceHelpers';
const shopId = blacksmithData?.id || 'blacksmith';

// Resolve a hero's effective stat value (includes gear/skills/conditions)
function getEffectiveStat(hero, statName) {
  if (!hero) return 0;
  try {
    const { stats = {} } = calculateCurrentStats(hero);
    const v = Number(stats[statName]) || 0;
    if (v > 0) return v;
  } catch {}
  return Number(hero?.stats?.[statName] ?? hero?.[statName] ?? 0);
}

function getShopMods() {
  const s = loadTownState();
  const cur =
    s.shopMods?.[shopId] || { priceDelta: 0, destroyed: false, saleActive: false };

  // Legacy → current migration for Rare Find keys
  if (!cur.rareFind && (cur.rareFindDSPrice || cur.rareFindCard)) {
    const priceDS = Number(cur.rareFindDSPrice || 0);
    const artifact = cur.rareFindCard || null;
    cur.rareFind = artifact ? { priceDS, artifact } : null;

    // Clean legacy keys and persist migration
    delete cur.rareFindDSPrice;
    delete cur.rareFindCard;

    const s2 = loadTownState();
    const nextAll = { ...(s2.shopMods || {}), [shopId]: cur };
    saveTownState({ ...s2, shopMods: nextAll });
  }

  return cur;
}

function patchShopMods(patch) {
  const s = loadTownState();
  const cur = getShopMods();
  const next = { ...cur, ...patch };
  const updated = { ...s, shopMods: { ...(s.shopMods || {}), [shopId]: next } };
  saveTownState(updated);
  // Optional: nudge UI to refresh price banners, sale badges, etc.
  try {
    window.dispatchEvent(new CustomEvent('shopmods:changed', { detail: { shopId, mods: next } }));
  } catch {}
}

function display(roll) {
  return (
    getEventDisplay(shopId, roll) || {
      title: 'Blacksmith Event',
      lore: '',
      effect: 'No Event.',
    }
  );
}

// ---- helper to draw/normalize a Mine Artifact card ------------------------
function drawMineArtifact() {
  const pool = Array.isArray(mineArtifacts) ? mineArtifacts : [];
  if (!pool.length) return null;

  const i = Math.floor(Math.random() * pool.length);
  const raw = pool[i] || {};

  // Ensure a stable id
  const safeId =
    raw.id ||
    `mine_art_${i}_${String(raw.name || 'artifact')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')}`;

  // Normalize cost (UI expects cost object)
  const cost =
    raw.cost && typeof raw.cost === 'object'
      ? { ...raw.cost }
      : Number.isFinite(raw.value)
      ? { gold: Number(raw.value) }
      : { gold: 0 };

  // Normalize effects to array of strings
  const effects = Array.isArray(raw.effects)
    ? raw.effects
    : raw.effect
    ? [String(raw.effect)]
    : [];

  return {
    ...raw,
    id: safeId,
    type: raw.type || 'Artifact',
    tags: Array.isArray(raw.tags) ? raw.tags : ['Artifact'],
    upgradeSlots: Number.isFinite(raw.upgradeSlots) ? raw.upgradeSlots : 0,
    weight: Number.isFinite(raw.weight) ? raw.weight : 1,
    cost,
    effects,
    source: 'Mine Artifacts Deck',
  };
}

// Utility: get list of hero IDs affected for "all heroes at the shop" cases.
function getAllHeroesHere(ctx) {
  const fromEngine = Array.isArray(ctx.targetHeroIds) ? ctx.targetHeroIds : null;
  if (fromEngine && fromEngine.length) return Array.from(new Set(fromEngine));

  const viaCtx =
    (ctx.getHeroesAtShop?.(shopId) || [ctx.getActiveHeroId?.()]).filter(Boolean);
  return Array.from(new Set(viaCtx));
}

// The canonical Free Attack upgrade applied by roll 12
const FREE_ATTACK_UPGRADE = {
  id: 'bs_unique_forging_free_attack',
  name: 'Free Attack (Unique Forging)',
  description: 'Once per Adventure, do D6 Damage to every adjacent Enemy, ignoring Defense.',
  mods: null,
  tags: ['Blacksmith', 'Free Upgrade'],
};

// --- mechanics -------------------------------------------------------------
async function apply(roll, ctx) {
  const lore = blacksmithData[roll] || {};

  // 2: Dark Stone Poisoning (perm Max Health loss on fail)
  if (roll === 2) {
    const id = ctx.getActiveHeroId();
    const hero = ctx.getHeroById?.(id);
    const heroName = hero?.name || 'Hero';
    const strVal = getEffectiveStat(hero, 'Strength');
    const agiVal = getEffectiveStat(hero, 'Agility');

    // Flavor text + named choice prompt
    const raw = window.prompt(
      `DARK STONE POISONING\n\n` +
      `${lore.effect}\n\n` +
      `${heroName} must choose a test:\n\n` +
      `  1  =  Strength 5+  (overpower him)  —  You have ${strVal} Strength (${strVal}d6)\n` +
      `  2  =  Agility 5+  (dodge and trip him)  —  You have ${agiVal} Agility (${agiVal}d6)\n\n` +
      `Enter 1 or 2:`,
      '1'
    );
    const pick = String(raw).trim();
    const stat = pick === '2' ? 'Agility' : 'Strength';
    const statVal = pick === '2' ? agiVal : strVal;
    const passed = await ctx.doSkillCheck(id, { stat, target: 5 });

    if (!passed) {
      const loss = d6();
      ctx.updateHero(id, (h) => {
        const prevMax =
          Number(h.maxHealth ?? h.max_health ?? h.healthMax ?? 10);
        const newMax = Math.max(1, prevMax - loss);
        const curHp = Number(h.currentHealth ?? h.health ?? prevMax);
        const cappedHp = Math.min(curHp, newMax);
        const next = { ...h, maxHealth: newMax, currentHealth: cappedHp, health: cappedHp };
        const note = makeMaxChangeNote({
          stat: 'Max Health',
          delta: -loss,
          newMax,
          source: 'Blacksmith Event 2',
          reason: 'Dark Stone Poisoning',
        });
        return pushConditionNote(next, note);
      });
      window.alert(
        `${stat} 5+ Test FAILED!\n\n` +
        `The crazed blacksmith stabs ${heroName} with a hot poker, ` +
        `searing a nasty Dark Stone Scar into your side.\n\n` +
        `Rolled D6 = ${loss}\n` +
        `${heroName} permanently loses ${loss} Max Health.\n\n` +
        `The Blacksmith is closed until after the next Adventure.`
      );
    } else {
      window.alert(
        `${stat} 5+ Test PASSED!\n\n` +
        `${heroName} ${stat === 'Strength' ? 'overpowers' : 'dodges'} the crazed blacksmith!\n` +
        `Either way, the blacksmith himself is shot dead.\n\n` +
        `The Blacksmith is closed until after the next Adventure.`
      );
    }
    patchShopMods({ destroyed: true });
    return;
  }

  // 3: Wild Horse incident (pass: +$100; fail: neighboring building destroyed + Injury checks)
  if (roll === 3) {
    const id = ctx.getActiveHeroId();
    const hero = ctx.getHeroById?.(id);
    const heroName = hero?.name || 'Hero';
    const strVal = getEffectiveStat(hero, 'Strength');

    window.alert(
      `WILD HORSE\n\n` +
      `${lore.effect}\n\n` +
      `${heroName} must make a Strength 5+ test to wrangle the horse!\n` +
      `You have ${strVal} Strength (${strVal}d6)`
    );

    const passed = await ctx.doSkillCheck(id, { stat: 'Strength', target: 5 });
    if (passed) {
      ctx.updateHero(id, (h) => ({ ...h, gold: (h.gold || 0) + 100 }));
      window.alert(
        `Strength 5+ Test PASSED!\n\n` +
        `${heroName} wrestles the wild horse under control.\n` +
        `The blacksmith pays you $100 for your trouble.`
      );
    } else {
      // Pick a random building to destroy (exclude the blacksmith itself and camp)
      const candidates = [
        'generalStore', 'church', 'docsOffice', 'saloon',
        'gamblingHall', 'sheriffsOffice', 'smugglersDen',
        'streetMarket', 'indianTradingPost', 'mutantQuarter',
        'frontierOutpost',
      ];
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      const s = loadTownState();
      const nextMods = { ...(s.shopMods || {}) };
      nextMods[pick] = { ...(nextMods[pick] || {}), destroyed: true };
      saveTownState({ ...s, shopMods: nextMods });

      const names = {
        generalStore: 'General Store', church: 'Church', docsOffice: "Doc's Office",
        saloon: 'Saloon', gamblingHall: 'Gambling Hall', sheriffsOffice: "Sheriff's Office",
        smugglersDen: "Smuggler's Den", streetMarket: 'Street Market',
        indianTradingPost: 'Indian Trading Post', mutantQuarter: 'Mutant Quarter',
        frontierOutpost: 'Frontier Outpost',
      };

      window.alert(
        `Strength 5+ Test FAILED!\n\n` +
        `The horse wreaks havoc through town and smashes into the ${names[pick] || pick}!\n` +
        `The ${names[pick] || pick} is destroyed until after the next Adventure.\n\n` +
        `All Heroes at the Blacksmith must now make an Agility 4+ test ` +
        `or roll on the Injury Chart!`
      );

      // All heroes at the blacksmith must pass Agility 4+
      const hereIds = getAllHeroesHere(ctx);
      for (const hid of hereIds) {
        const h = ctx.getHeroById?.(hid);
        const hName = h?.name || 'Hero';
        const agiVal = getEffectiveStat(h, 'Agility');
        window.alert(
          `${hName} must make an Agility 4+ test to escape the collapsing building!\n` +
          `${hName} has ${agiVal} Agility (${agiVal}d6)`
        );
        const okAgi = await ctx.doSkillCheck(hid, { stat: 'Agility', target: 4 });
        if (!okAgi) {
          await ctx.enqueueChartRoll(hid, 'injury');
          window.alert(
            `${hName}: Agility 4+ Test FAILED!\n\n` +
            `The building collapses on ${hName}!\n` +
            `Roll on the Injury Chart.`
          );
        } else {
          window.alert(
            `${hName}: Agility 4+ Test PASSED!\n\n` +
            `${hName} escapes the collapsing building safely!`
          );
        }
      }
    }
    return;
  }

  // 4–5: Price hike (+$100), cancels sale
  if (roll === 4 || roll === 5) {
    patchShopMods({ priceDelta: 100, saleActive: false });
    window.alert(
      `COST INCREASE\n\n` +
      `${lore.effect}`
    );
    return;
  }

  // 6–8: No event
  if (roll >= 6 && roll <= 8) {
    window.alert(
      `BLACK SMOKE AND HORSE MANURE\n\n` +
      `${lore.effect}`
    );
    return;
  }

  // 9–10: Forging Sale –$50 (min $10)
  if (roll === 9 || roll === 10) {
    patchShopMods({ priceDelta: -50, saleActive: true });
    window.alert(
      `FORGING SALE!\n\n` +
      `${lore.effect}`
    );
    return;
  }

  // 11: Rare Find (buy with Dark Stone)
  if (roll === 11) {
    const priceDS = d6() + 1;
    const card = drawMineArtifact();
    patchShopMods({ rareFind: card ? { priceDS, artifact: card } : null });
    const label = card?.name || 'an Artifact';
    window.alert(
      `RARE FIND\n\n` +
      `${lore.effect}\n\n` +
      `Drawn: ${label}\n` +
      `Price: ${priceDS} Dark Stone\n\n` +
      `You can purchase this artifact in the shop below.`
    );
    return;
  }

  // 12: Unique Forging (Free Attack upgrade — applied via shopMods flag)
  if (roll === 12) {
    patchShopMods({ uniqueForging: true });
    window.alert(
      `UNIQUE FORGING\n\n` +
      `${lore.effect}\n\n` +
      `Choose one of your items with an empty Upgrade Slot below ` +
      `to receive this free upgrade.`
    );
    return;
  }
}
// ---------- Transport purchase helpers (drop-in) ----------

function _isStageCoach(item) {
  const name = String(item?.name || '').toLowerCase();
  const tags = Array.isArray(item?.tags) ? item.tags.map((t) => String(t).toLowerCase()) : [];
  return tags.includes('stagecoach') || /stage\s*coach/i.test(name) || item?.id === 'transport_stage_coach';
}

function _scanPosseForStageCoach(ctx) {
  const list = (ctx.listAllTownHeroes?.() || ctx.getAllHeroes?.() || []).map((h) =>
    ctx.getHeroById ? ctx.getHeroById(h.id || h.localId || h) || h : h
  );
  for (const hero of list) {
    const inv = Array.isArray(hero?.inventory) ? hero.inventory : [];
    for (const it of inv) {
      if (_isStageCoach(it)) return true;
    }
  }
  return false;
}

/**
 * onBeforePurchaseBlacksmithTransport
 * Blocks purchase if Stage Coach already exists in the posse.
 * Return { ok: boolean, reason?: string }
 */
export async function onBeforePurchaseBlacksmithTransport(item, ctx = {}) {
  if (String(item?.category).toLowerCase() !== 'transport') return { ok: true };

  if (_isStageCoach(item)) {
    const already = _scanPosseForStageCoach(ctx);
    if (already) {
      const reason = 'Your posse already owns a Stage Coach. Only one is allowed per posse.';
      ctx.toast?.(reason);
      return { ok: false, reason };
    }
  }
  return { ok: true };
}

/**
 * onAfterPurchaseBlacksmithTransport
 * Adds the purchased Transport into the buyer's inventory.
 * Assumes gold/DS cost was already deducted by your generic shop flow.
 */
export async function onAfterPurchaseBlacksmithTransport(item, ctx = {}) {
  if (String(item?.category).toLowerCase() !== 'transport') return;

  const id = ctx.getActiveHeroId?.();
  if (!id) return;

  ctx.updateHero?.(id, (h) => {
    const inv = Array.isArray(h.inventory) ? [...h.inventory] : [];
    // store a concise item snapshot; keep your own fields intact
    inv.push({
      id: item.id || `transport_${Date.now()}`,
      name: item.name || 'Transport',
      category: 'Transport',
      tags: Array.isArray(item.tags) ? item.tags : [],
      description: item.description || item.effect || '',
      source: 'Blacksmith',
      // optionally keep weight/slots/etc if your item defines them
      weight: Number.isFinite(item.weight) ? item.weight : undefined,
      upgradeSlots: Number.isFinite(item.upgradeSlots) ? item.upgradeSlots : undefined,
    });
    return { ...h, inventory: inv };
  });

  ctx.toast?.(`${item.name} added to inventory.`);
}

export { FREE_ATTACK_UPGRADE };

export async function handleBlacksmithEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? d2d6();
  await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: [`Blacksmith Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

export const blacksmithHandler = { display, apply };
