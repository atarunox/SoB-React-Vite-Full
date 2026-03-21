// src/utils/locationHandlers/generalStoreHandler.js
import { loadTownState, saveTownState } from '../../utils/townState';
import { d6 as _d6 } from '../../utils/diceHelpers';
import { getEventDisplay } from '../locationEventText';

// Use ctx.d6 when available (respects manual roll mode); fallback to auto-roll
const ctxD6 = async (ctx, label) => (typeof ctx?.d6 === 'function') ? ctx.d6(label) : _d6();

const shopId = 'generalStore';

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
function patchShopMods(patch) {
  const s = loadTownState();
  const cur = s.shopMods?.[shopId] || {};
  const next = { ...cur, ...patch };
  const updated = { ...s, shopMods: { ...(s.shopMods || {}), [shopId]: next } };
  saveTownState(updated);
  try {
    window.dispatchEvent(new CustomEvent('shopmods:changed', { detail: { shopId, mods: next } }));
  } catch {}
}

// ---------- display (title / lore / effect) ----------
export function display(roll) {
  return (
    getEventDisplay(shopId, roll) || {
      title: 'General Store Event',
      lore: '',
      effect: 'No Event.',
    }
  );
}

// ---------- mechanics (apply) ----------
export async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId?.();
  if (!id) return { log: [] };

  const info = display(roll);
  const log = [];

  // Every event starts with its title and lore/flavor text
  log.push(`[General Store] (${roll}) ${info.title} — ${info.lore}`);
  log.push(`Effect: ${info.effect}`);

  // 2: Closed — No Hero may visit until after the next Adventure.
  if (roll === 2) {
    patchShopMods({ destroyed: true });
    const outcome = 'The General Store has been shut down due to a recent demonic attack. No Hero may visit until after the next Adventure.';
    log.push(outcome);
    await showResult(ctx, 'CLOSED — Result', [outcome]);
    ctx.toast?.('General Store is closed until after the next Adventure.');
    return { log };
  }

  // 3: Robbery — Choose: hand over D6×$10 OR Agility 5+ test
  if (roll === 3) {
    const lore3 = `ROBBERY\n${info.lore}`;
    const choice = await ctx.promptChoice?.(
      `ROBBERY\n${info.lore}\n\nMasked gunmen burst in! Choose how to respond:`,
      [
        { label: 'Hand over D6 × $10 to the robbers' },
        { label: 'Attempt Agility 5+ test to fight them off' },
      ]
    );

    if (choice === 0) {
      // Pay D6 × $10
      const dieRoll = await ctxD6(ctx, 'Robbery — Roll 1d6 for cost (×$10)');
      const cost = dieRoll * 10;
      const costLine = `Rolled [${dieRoll}] × $10 = $${cost} handed over.`;
      log.push(costLine);
      ctx.updateHero?.(id, (h) => ({
        ...h,
        gold: Math.max(0, (h.gold || 0) - cost),
      }));
      const outcome = `You hand over $${cost} to the masked gunmen. They take the money and flee.`;
      log.push(outcome);
      await showResult(ctx, 'ROBBERY — Result', [costLine, '', outcome]);
      ctx.toast?.(`Robbery: lost $${cost}.`);
    } else {
      // Agility 5+ test
      const result = await ctx.doSkillCheck(id, {
        stat: 'Agility', target: 5, returnDetails: true,
        message: `${lore3}\nYou leap into action to stop the robbery!`,
      });
      const checkLine = formatCheckResult(result, 'Agility', 5);
      if (checkLine) log.push(checkLine);
      const passed = result?.passed ?? result;

      if (passed) {
        ctx.updateHero?.(id, (h) => ({
          ...h,
          gold: (h.gold || 0) + 100,
        }));
        const outcome = 'You fight off the robbers! The grateful shop owner rewards you with $100.';
        log.push(outcome);
        await showResult(ctx, 'ROBBERY — Result', [checkLine, '', outcome]);
        ctx.toast?.('Robbery stopped! +$100 reward.');
      } else {
        const outcome = 'The robbers get the drop on you! You are shot. Roll once on the Injury Chart.';
        log.push(outcome);
        await showResult(ctx, 'ROBBERY — Result', [checkLine, '', outcome]);
        ctx.toast?.('Shot during the robbery! Roll on the Injury Chart.');
        await ctx.enqueueChartRoll?.(id, 'injury');
      }
    }
    return { log };
  }

  // 4-5: Cost Increase — All prices +$50, cancel Fire Sale
  if (roll === 4 || roll === 5) {
    patchShopMods({ priceDelta: 50 });
    const outcome = "All General Store prices are increased by $50 for this Town Stay. Any Fire Sale is cancelled.";
    log.push(outcome);
    await showResult(ctx, 'COST INCREASE — Result', [outcome]);
    ctx.toast?.('General Store: Cost Increase (+$50 to all prices).');
    return { log };
  }

  // 6-8: No Event
  if (roll >= 6 && roll <= 8) {
    const outcome = "Flies are a' Buzzing, the Streets are Filth. Nothing of note happens.";
    log.push(outcome);
    await showResult(ctx, "FLIES ARE A' BUZZING — Result", [outcome]);
    return { log };
  }

  // 9-10: Fire Sale — All prices -$50 (min $25), cancel Cost Increase
  if (roll === 9 || roll === 10) {
    patchShopMods({ priceDelta: -50 });
    const outcome = "Fire Sale! All General Store prices are reduced by $50 (to a minimum of $25) for this Town Stay. Any Cost Increase is cancelled.";
    log.push(outcome);
    await showResult(ctx, 'FIRE SALE! — Result', [outcome]);
    ctx.toast?.('General Store: Fire Sale! (-$50 to all prices, min $25).');
    return { log };
  }

  // 11: New Items in Stock — Draw 3 Gear cards; buy one at $25 or listed price
  if (roll === 11) {
    patchShopMods({ newItemsInStock: true, newItemsCount: 3 });
    const outcome = 'Fresh in from the Badlands! The shop owner shows 3 new Gear cards for sale. Any may be purchased for list price, or $25 if no price is listed.';
    log.push(outcome);
    await showResult(ctx, 'NEW ITEMS IN STOCK — Result', [outcome]);
    ctx.toast?.('New Items in Stock: Draw 3 Gear cards to purchase.');
    return { log };
  }

  // 12: Artifact for Sale — Draw World+Artifact; buy for $100
  if (roll === 12) {
    patchShopMods({ artifactForSale: true, artifactPrice: 100 });
    const outcome = 'The shop owner has a rare artifact brought back from a recent expedition! Draw a World Card to determine the origin, then draw an Artifact from that world. It may be purchased for list price, or $100 if none listed.';
    log.push(outcome);
    await showResult(ctx, 'ARTIFACT FOR SALE — Result', [outcome]);
    ctx.toast?.('Artifact for Sale: a rare find is available for $100.');
    return { log };
  }

  return { log };
}

// --------- Dispatcher compatible with locationEventsEngine ---------------
export async function handleGeneralStoreEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? (_d6() + _d6());
  const result = await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: result?.log || [`General Store Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

export const generalStoreHandler = { display, apply };
export default generalStoreHandler;
