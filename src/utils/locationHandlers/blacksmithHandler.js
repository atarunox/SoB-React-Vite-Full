// src/utils/locationHandlers/blacksmithHandler.js
import { loadTownState, saveTownState } from '../../utils/townState';
import { getEventDisplay } from '../locationEventText';
import blacksmithData from '../../data/townLocations/FrontierTown/Blacksmith/blacksmith.js';
import { mineArtifacts } from '../../data/items/mineArtifacts';

// NEW: condition notes for permanent max stat changes
import { makeMaxChangeNote, pushConditionNote } from '../../utils/conditionNotes';
import { d6, roll2d6 as d2d6 } from '../../utils/diceHelpers';
const shopId = blacksmithData?.id || 'blacksmith';

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

// --- mechanics -------------------------------------------------------------
async function apply(roll, ctx) {
  // 2: Dark Stone Poisoning (perm Max Health loss on fail)
  if (roll === 2) {
    const id = ctx.getActiveHeroId();
    const okStr = await ctx.doSkillCheck(id, { stat: 'Strength', target: 5 });
    const okAgi = okStr || (await ctx.doSkillCheck(id, { stat: 'Agility', target: 5 }));
    if (!okAgi) {
      const loss = d6();
      ctx.updateHero(id, (h) => {
        const prevMax =
          Number(h.maxHealth ?? h.max_health ?? h.healthMax ?? 10);
        const newMax = Math.max(1, prevMax - loss);
        const next = { ...h, maxHealth: newMax };
        // Log a permanent change note for the Conditions tab
        const note = makeMaxChangeNote({
          stat: 'Max Health',
          delta: -loss,
          newMax,
          source: 'Blacksmith Event 2',
          reason: 'Dark Stone Poisoning',
        });
        return pushConditionNote(next, note);
      });
      ctx.toast?.(`Dark Stone Poisoning: lose ${loss} Max Health (permanent).`);
    } else {
      ctx.toast?.('You overpower/dodge the crazed blacksmith.');
    }
    patchShopMods({ destroyed: true });
    ctx.toast?.('The Blacksmith is closed until after the next Adventure.');
    return;
  }

  // 3: Wild Horse incident (pass: +$100; fail: neighboring building destroyed + Injury checks)
  if (roll === 3) {
    const id = ctx.getActiveHeroId();
    const passed = await ctx.doSkillCheck(id, { stat: 'Strength', target: 5 });
    if (passed) {
      ctx.updateHero(id, (h) => ({ ...h, gold: (h.gold || 0) + 100 }));
      ctx.toast?.('You wrangle the wild horse: +$100.');
    } else {
      ctx.toast?.('A neighboring building is destroyed until after the next Adventure.');
      const hereIds = getAllHeroesHere(ctx);
      for (const hid of hereIds) {
        const okAgi = await ctx.doSkillCheck(hid, { stat: 'Agility', target: 4 });
        if (!okAgi) await ctx.enqueueChartRoll(hid, 'injury');
      }
    }
    return;
  }

  // 4–5: Price hike (+$100), cancels sale
  if (roll === 4 || roll === 5) {
    const cur = getShopMods();
    patchShopMods({ priceDelta: (cur.priceDelta || 0) + 100, saleActive: false });
    ctx.toast?.('Blacksmith prices +$100 (Forging Sale canceled).');
    return;
  }

  // 6–8: No event
  if (roll >= 6 && roll <= 8) {
    ctx.toast?.('No Event at the Blacksmith.');
    return;
  }

  // 9–10: Forging Sale –$50 (min $10)
  if (roll === 9 || roll === 10) {
    const cur = getShopMods();
    patchShopMods({ priceDelta: (cur.priceDelta || 0) - 50, saleActive: true });
    ctx.toast?.('Forging Sale! All Blacksmith items –$50 (minimum $10).');
    return;
  }

  // 11: Rare Find (buy with Dark Stone)
  if (roll === 11) {
    const priceDS = d6() + 1;
    const card = drawMineArtifact();
    patchShopMods({ rareFind: card ? { priceDS, artifact: card } : null });
    const label = card?.name ? `: ${card.name}` : '';
    ctx.toast?.(`Rare Find${label} — you may buy it for ${priceDS} Dark Stone.`);
    return;
  }

  // 12: Unique Forging voucher (Free Attack upgrade)
  if (roll === 12) {
    patchShopMods({ uniqueForgingFreeAttack: true });
    const id = ctx.getActiveHeroId();
    ctx.updateHero(id, (h) => {
      const inv = Array.isArray(h.inventory) ? [...h.inventory] : [];
      inv.push({
        id: `upgrade_voucher_free_attack_${Date.now()}`,
        name: 'Unique Forging Voucher',
        type: 'Upgrade Voucher',
        description:
          'Free Attack – Once per Adventure, deal D6 damage to all adjacent Enemies (ignores Defense).',
        tags: ['Blacksmith', 'Free Upgrade'],
        oneUse: true,
      });
      return { ...h, inventory: inv };
    });
    ctx.toast?.('Unique Forging! You gained a free “Free Attack” upgrade.');
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
 * Adds the purchased Transport into the buyer’s inventory.
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
