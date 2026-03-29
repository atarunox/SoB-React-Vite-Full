// src/utils/locationHandlers/blacksmithHandler.js
import { loadTownState, saveTownState } from '../../utils/townState';
import { getEventDisplay } from '../locationEventText';
import blacksmithData from '../../data/townLocations/FrontierTown/Blacksmith/blacksmith.js';
import { mineArtifacts } from '../../data/items/mineArtifacts';

import { makeMaxChangeNote, pushConditionNote } from '../../utils/conditionNotes';
import { d6 as _d6, roll2d6 as d2d6 } from '../../utils/diceHelpers';

// Use ctx.d6 when available (respects manual roll mode); fallback to auto-roll
const ctxD6 = async (ctx, label) => (typeof ctx?.d6 === 'function') ? ctx.d6(label) : _d6();

const shopId = blacksmithData?.id || 'blacksmith';

// ---------- result formatting helpers ----------
function formatCheckResult(result, stat, target) {
  if (result && typeof result === 'object' && Array.isArray(result.rolls)) {
    const diceStr = result.rolls.join(', ');
    const sCount = result.successes ?? result.rolls.filter(r => r >= target).length;
    return `Rolled [${diceStr}] — ${result.passed ? 'PASSED' : 'FAILED'} (${stat} ${target}+, ${sCount} success${sCount !== 1 ? 'es' : ''})`;
  }
  return null;
}

async function showResult(ctx, title, lines) {
  const body = Array.isArray(lines) ? lines.join('\n') : lines;
  await ctx.promptChoice?.(`${title}\n\n${body}`, [{ label: 'Continue' }]);
}

// ---------- townState helpers ----------
function getShopMods() {
  const s = loadTownState();
  const cur =
    s.shopMods?.[shopId] || { priceDelta: 0, destroyed: false, saleActive: false };

  // Legacy → current migration for Rare Find keys
  if (!cur.rareFind && (cur.rareFindDSPrice || cur.rareFindCard)) {
    const priceDS = Number(cur.rareFindDSPrice || 0);
    const artifact = cur.rareFindCard || null;
    cur.rareFind = artifact ? { priceDS, artifact } : null;

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
  try {
    window.dispatchEvent(new CustomEvent('shopmods:changed', { detail: { shopId, mods: next } }));
  } catch {}
}

export function display(roll) {
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

  const safeId =
    raw.id ||
    `mine_art_${i}_${String(raw.name || 'artifact')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')}`;

  const cost =
    raw.cost && typeof raw.cost === 'object'
      ? { ...raw.cost }
      : Number.isFinite(raw.value)
      ? { gold: Number(raw.value) }
      : { gold: 0 };

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

// ---------- mechanics (apply) ----------
export async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId?.();
  if (!id) return { log: [] };

  const info = display(roll);
  const log = [];

  log.push(`[Blacksmith] (${roll}) ${info.title} — ${info.lore}`);
  log.push(`Effect: ${info.effect}`);

  // 2: Dark Stone Poisoning – choose Strength 5+ or Agility 5+; fail: perm Max Health loss
  if (roll === 2) {
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? null;
    const heroName = hero?.name || 'Hero';
    const lore2 = `DARK STONE POISONING\n${info.lore}`;

    const testChoice = await ctx.promptChoice?.(
      `DARK STONE POISONING\n${info.lore}\n\n${heroName} must choose a test:`,
      [
        { label: 'Overpower him (Strength 5+ test)' },
        { label: 'Dodge and trip him (Agility 5+ test)' },
      ]
    );

    let result, checkLine;
    if (testChoice === 1) {
      result = await ctx.doSkillCheck(id, {
        stat: 'Agility', target: 5, returnDetails: true,
        message: `${lore2}\n${heroName} tries to dodge and trip the crazed blacksmith!`,
      });
      checkLine = formatCheckResult(result, 'Agility', 5);
    } else {
      result = await ctx.doSkillCheck(id, {
        stat: 'Strength', target: 5, returnDetails: true,
        message: `${lore2}\n${heroName} tries to overpower the crazed blacksmith!`,
      });
      checkLine = formatCheckResult(result, 'Strength', 5);
    }
    if (checkLine) log.push(checkLine);
    const passed = result?.passed ?? result;

    if (!passed) {
      const loss = await ctxD6(ctx, 'Dark Stone Poisoning — Roll 1d6 for Max Health loss');
      const lossLine = `Rolled [${loss}] for Max Health loss.`;
      log.push(lossLine);
      ctx.updateHero?.(id, (h) => {
        const prevMax = Number(h.maxHealth ?? h.max_health ?? h.healthMax ?? 10);
        const newMax = Math.max(1, prevMax - loss);
        const curHp = Number(h.currentHealth ?? h.health ?? prevMax);
        const cappedHp = Math.min(curHp, newMax);
        const next = { ...h, maxHealth: newMax, currentHealth: cappedHp };
        const note = makeMaxChangeNote({
          stat: 'Max Health', delta: -loss, newMax,
          source: 'Blacksmith Event 2', reason: 'Dark Stone Poisoning',
        });
        return pushConditionNote(next, note);
      });
      const outcome = `The crazed blacksmith stabs ${heroName} with a hot poker, searing a nasty Dark Stone Scar. Permanently lose ${loss} Max Health. The Blacksmith is closed until after the next Adventure.`;
      log.push(outcome);
      await showResult(ctx, 'DARK STONE POISONING — Result', [checkLine, lossLine, '', outcome]);
      ctx.toast?.(`Dark Stone Poisoning: -${loss} Max Health. Blacksmith closed.`);
    } else {
      const stat = testChoice === 1 ? 'dodges' : 'overpowers';
      const outcome = `${heroName} ${stat} the crazed blacksmith! The blacksmith himself is shot dead. The Blacksmith is closed until after the next Adventure.`;
      log.push(outcome);
      await showResult(ctx, 'DARK STONE POISONING — Result', [checkLine, '', outcome]);
      ctx.toast?.('Dark Stone Poisoning: escaped! Blacksmith closed.');
    }
    patchShopMods({ destroyed: true });
    return { log };
  }

  // 3: Wild Horse – Strength 5+; pass: +$100; fail: random building destroyed + Agility 4+ checks
  if (roll === 3) {
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? null;
    const heroName = hero?.name || 'Hero';
    const lore3 = `WILD HORSE\n${info.lore}\n${heroName} must wrangle the horse!`;

    const result = await ctx.doSkillCheck(id, {
      stat: 'Strength', target: 5, returnDetails: true,
      message: `${lore3}\nMake a Strength 5+ test to wrangle the wild horse.`,
    });
    const checkLine = formatCheckResult(result, 'Strength', 5);
    if (checkLine) log.push(checkLine);
    const passed = result?.passed ?? result;

    if (passed) {
      ctx.updateHero?.(id, (h) => ({ ...h, gold: (h.gold || 0) + 100 }));
      const outcome = `${heroName} wrestles the wild horse under control. The blacksmith pays you $100 for your trouble.`;
      log.push(outcome);
      await showResult(ctx, 'WILD HORSE — Result', [checkLine, '', outcome]);
      ctx.toast?.('Wild Horse: +$100!');
    } else {
      // Pick a random building to destroy
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

      const destroyOutcome = `The horse wreaks havoc and smashes into the ${names[pick] || pick}! It is destroyed until after the next Adventure.`;
      log.push(destroyOutcome);
      await showResult(ctx, 'WILD HORSE — Result', [
        checkLine, '',
        destroyOutcome, '',
        'All Heroes at the Blacksmith must now make an Agility 4+ test or roll on the Injury Chart!',
      ]);

      // All heroes at the blacksmith must pass Agility 4+
      const hereIds = getAllHeroesHere(ctx);
      for (const hid of hereIds) {
        const h = (ctx.getHeroById ?? ctx.getHero)?.(hid) ?? null;
        const hName = h?.name || 'Hero';

        const agiResult = await ctx.doSkillCheck(hid, {
          stat: 'Agility', target: 4, returnDetails: true,
          message: `WILD HORSE — Collapsing Building\n${hName} must dodge the debris!\nMake an Agility 4+ test.`,
        });
        const agiLine = formatCheckResult(agiResult, 'Agility', 4);
        if (agiLine) log.push(`${hName}: ${agiLine}`);
        const agiPassed = agiResult?.passed ?? agiResult;

        if (!agiPassed) {
          await ctx.enqueueChartRoll(hid, 'injury');
          const agiOutcome = `${hName} is caught in the collapsing building! Roll on the Injury Chart.`;
          log.push(agiOutcome);
          await showResult(ctx, `WILD HORSE — ${hName}`, [agiLine, '', agiOutcome]);
          ctx.toast?.(`${hName}: injured by collapsing building.`);
        } else {
          const agiOutcome = `${hName} escapes the collapsing building safely!`;
          log.push(agiOutcome);
          await showResult(ctx, `WILD HORSE — ${hName}`, [agiLine, '', agiOutcome]);
        }
      }
    }
    return { log };
  }

  // 4–5: Price hike (+$100), cancels sale
  if (roll === 4 || roll === 5) {
    patchShopMods({ priceDelta: 100, saleActive: false });
    const outcome = `${info.effect}`;
    log.push(outcome);
    await showResult(ctx, 'COST INCREASE', [outcome]);
    ctx.toast?.('Blacksmith: prices +$100 this visit.');
    return { log };
  }

  // 6–8: No event
  if (roll >= 6 && roll <= 8) {
    const outcome = `${info.effect}`;
    log.push(outcome);
    await showResult(ctx, 'BLACK SMOKE AND HORSE MANURE', [outcome]);
    return { log };
  }

  // 9–10: Forging Sale –$50 (min $10)
  if (roll === 9 || roll === 10) {
    patchShopMods({ priceDelta: -50, saleActive: true });
    const outcome = `${info.effect}`;
    log.push(outcome);
    await showResult(ctx, 'FORGING SALE!', [outcome]);
    ctx.toast?.('Blacksmith: Forging Sale! Prices -$50.');
    return { log };
  }

  // 11: Rare Find (buy with Dark Stone)
  if (roll === 11) {
    const priceDS = await ctxD6(ctx, 'Rare Find — Roll 1d6 for Dark Stone price') + 1;
    const card = drawMineArtifact();
    patchShopMods({ rareFind: card ? { priceDS, artifact: card } : null });
    const label = card?.name || 'an Artifact';
    const outcome = `Drawn: ${label}\nPrice: ${priceDS} Dark Stone\n\nYou can purchase this artifact in the shop below.`;
    log.push(`Rare Find: ${label} for ${priceDS} Dark Stone.`);
    await showResult(ctx, 'RARE FIND', [info.effect, '', outcome]);
    ctx.toast?.(`Rare Find: ${label} for ${priceDS} Dark Stone.`);
    return { log };
  }

  // 12: Unique Forging (Free Attack upgrade — applied via shopMods flag)
  if (roll === 12) {
    patchShopMods({ uniqueForging: true });
    const outcome = `${info.effect}\n\nChoose one of your items with an empty Upgrade Slot below to receive this free upgrade.`;
    log.push(outcome);
    await showResult(ctx, 'UNIQUE FORGING', [outcome]);
    ctx.toast?.('Unique Forging: choose an item for a free upgrade!');
    return { log };
  }

  return { log };
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

export async function onAfterPurchaseBlacksmithTransport(item, ctx = {}) {
  if (String(item?.category).toLowerCase() !== 'transport') return;

  const id = ctx.getActiveHeroId?.();
  if (!id) return;

  ctx.updateHero?.(id, (h) => {
    const inv = Array.isArray(h.inventory) ? [...h.inventory] : [];
    inv.push({
      id: item.id || `transport_${Date.now()}`,
      name: item.name || 'Transport',
      category: 'Transport',
      tags: Array.isArray(item.tags) ? item.tags : [],
      description: item.description || item.effect || '',
      source: 'Blacksmith',
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
  const result = await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: result?.log || [`Blacksmith Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

export const blacksmithHandler = { display, apply };
