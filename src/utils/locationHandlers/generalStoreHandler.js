// src/utils/locationHandlers/generalStoreHandler.js
import { loadTownState, saveTownState } from '../../utils/townState';
import generalStoreData from '../../data/townLocations/FrontierTown/GeneralStore/generalStore.js';
import { otherWorldArtifacts } from '../../data/items/otherWorldArtifacts.js';

const shopId = generalStoreData?.id || 'general_store';

// dice
const d6 = () => Math.floor(Math.random() * 6) + 1;
const roll2d6 = () => d6() + d6();

// ---------- Shop state helpers ----------
function getShopMods() {
  const s = loadTownState();
  return s.shopMods?.[shopId] || { priceDelta: 0 };
}

function patchShopMods(patch) {
  const s = loadTownState();
  const cur = getShopMods();
  const next = { ...cur, ...patch };
  const updated = { ...s, shopMods: { ...(s.shopMods || {}), [shopId]: next } };
  saveTownState(updated);
  // Notify UI to refresh prices
  try {
    window.dispatchEvent(new CustomEvent('shopmods:changed', { detail: { shopId, mods: next } }));
  } catch {}
}

function patchStayMods(patch) {
  const s = loadTownState() || {};
  const next = { ...(s.stayMods || {}), ...patch };
  saveTownState({ ...s, stayMods: next });
}

// ---------- display (title / lore / effect) ----------
export function display(roll) {
  const idx = Math.max(0, Math.min(10, roll - 2));
  const ev = generalStoreData?.events?.[idx];
  if (!ev) {
    return { title: 'General Store Event', lore: '', effect: 'No Event.' };
  }
  return {
    title: ev.name || 'General Store Event',
    lore: ev.lore || '',
    effect: ev.effect || 'No Event.',
  };
}

// ---------- mechanics (Resolve) ----------
export async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId?.();
  if (!id) return;

  // 2: Closed – No Heroes may visit until after the next Adventure
  if (roll === 2) {
    patchShopMods({ destroyed: true, closed: true });
    ctx.toast?.('General Store Closed: Shop unavailable until after the next Adventure.');
    return;
  }

  // 3: Robbery – Pay D6×$10 OR Agility 5+ to stop robbery for $100
  if (roll === 3) {
    const fee = d6() * 10;
    const choice = await ctx.promptChoice?.('Robbery!', [
      { label: `Pay $${fee} and stop them (get $100 reward)` },
      { label: 'Attempt Agility 5+ test' },
    ]);

    if (choice === 0) {
      // Pay and get reward
      ctx.updateHero?.(id, (h) => ({
        ...h,
        gold: Math.max(0, (h.gold || 0) - fee + 100)
      }));
      ctx.toast?.(`Robbery: -$${fee}, +$100 reward (net +$${100 - fee}).`);
    } else {
      // Agility test
      const passed = await ctx.doSkillCheck?.(id, { stat: 'Agility', target: 5 });
      if (passed) {
        ctx.updateHero?.(id, (h) => ({ ...h, gold: (h.gold || 0) + 100 }));
        ctx.toast?.('Robbery: Agility 5+ success! +$100 reward.');
      } else {
        await ctx.enqueueChartRoll?.(id, 'injury');
        ctx.toast?.('Robbery: Failed Agility test. Roll on Injury chart.');
      }
    }
    return;
  }

  // 4-5: Cost Increase – All prices +$50
  if (roll === 4 || roll === 5) {
    const cur = getShopMods();
    patchShopMods({
      priceDelta: (cur.priceDelta || 0) + 50,
      fireSale: false
    });
    ctx.toast?.('Cost Increase: All General Store prices +$50 (cancels Fire Sale).');
    return;
  }

  // 6-8: No Event
  if (roll >= 6 && roll <= 8) {
    ctx.toast?.('Flies are a\' Buzzing — No Event.');
    return;
  }

  // 9-10: Fire Sale – All prices –$50 (min $25)
  if (roll === 9 || roll === 10) {
    const cur = getShopMods();
    patchShopMods({
      priceDelta: (cur.priceDelta || 0) - 50,
      fireSale: true,
      minPrice: 25
    });
    ctx.toast?.('Fire Sale: All General Store prices -$50 (min $25) (cancels Cost Increase).');
    return;
  }

  // 11: New Items in Stock – Draw 3 Gear cards
  if (roll === 11) {
    // TODO: Implement gear card drawing system
    ctx.toast?.('New Items in Stock: Draw 3 Gear cards; you may buy one for $25 (or at listed price). [UI TODO]');
    return;
  }

  // 12: Artifact for Sale – Draw a World + Artifact card
  if (roll === 12) {
    // Group artifacts by world (same as Frontier Outpost #7)
    const byWorld = otherWorldArtifacts.reduce((acc, art) => {
      const w = art.world || 'Unknown';
      if (!acc[w]) acc[w] = [];
      acc[w].push(art);
      return acc;
    }, {});

    const worlds = Object.keys(byWorld);
    if (!worlds.length) {
      ctx.toast?.('General Store: Artifact for Sale – No Artifacts found in data; resolve manually.');
    } else {
      // Randomly select world and artifact
      const world = worlds[Math.floor(Math.random() * worlds.length)];
      const pool = byWorld[world] || [];
      const artifact = pool[Math.floor(Math.random() * pool.length)] || pool[0];

      // Price: $100 fixed (card says "list price or $100 if none listed")
      const price = 100;

      // Store in stayMods for UI to display/purchase
      patchStayMods({
        gsWorldArtifactOffer: {
          id: 'gs_world_artifact',
          world,
          artifactId: artifact.id,
          artifactName: artifact.name,
          artifact: artifact, // full artifact object
          price,
          locationId: 'generalStore',
        }
      });

      ctx.toast?.(
        `Artifact for Sale! World: ${world}. Artifact: ${artifact.name}. Available for purchase at $${price}.`
      );
    }
    return;
  }
}

// --------- Dispatcher compatible with locationEventsEngine ---------------
export async function handleGeneralStoreEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? roll2d6();
  await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: [`General Store Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

export const generalStoreHandler = { display, apply };
export default generalStoreHandler;
