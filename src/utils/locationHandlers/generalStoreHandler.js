// src/utils/locationHandlers/generalStoreHandler.js
import { loadTownState, saveTownState } from '../../utils/townState';
import { d6 as _d6 } from '../../utils/diceHelpers';
import { getEventDisplay } from '../locationEventText';
import { gearCards } from '../../data/items/gearCards.js';
import { WORLD_CARDS } from '../../data/worldCards';
import { mineArtifacts } from '../../data/items/mineArtifacts';
import { otherWorldArtifacts } from '../../data/items/otherWorldArtifacts.js';

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

  // 11: New Items in Stock — Draw 3 Gear cards; buy at listed price or $25
  if (roll === 11) {
    const pool = Array.isArray(gearCards) ? gearCards : [];
    const drawn = [];
    for (let i = 0; i < 3; i++) {
      if (!pool.length) break;
      const card = pool[Math.floor(Math.random() * pool.length)];
      if (card) drawn.push({ ...card, id: card.id || `gear_gs_${Date.now()}_${i}` });
    }

    if (!drawn.length) {
      const outcome = 'Fresh in from the Badlands! No Gear cards available in data — draw 3 Gear cards manually.';
      log.push(outcome);
      await showResult(ctx, 'NEW ITEMS IN STOCK — Result', [outcome]);
      return { log };
    }

    patchShopMods({ newItemsInStock: true, newItemsCount: drawn.length });

    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? null;
    const heroName = hero?.name || 'Hero';
    const headerLine = `Fresh in from the Badlands! The shop owner shows ${drawn.length} new Gear cards for sale.`;
    log.push(headerLine);

    for (let i = 0; i < drawn.length; i++) {
      const card = drawn[i];
      const listPrice = Number(card.value) || 0;
      const price = listPrice > 0 ? listPrice : 25;
      const priceLabel = listPrice > 0 ? `$${listPrice} (list price)` : '$25 (no list price)';
      const effectsStr = Array.isArray(card.effects) ? card.effects.join('; ') : '';

      const buyChoice = await ctx.promptChoice?.(
        `NEW ITEMS IN STOCK (${i + 1}/${drawn.length})\n\n${card.name}${card.slot ? ` (${card.slot})` : ''}${effectsStr ? `\nEffects: ${effectsStr}` : ''}\nPrice: ${priceLabel}\n\nPurchase ${card.name}?`,
        [
          { label: `Buy ${card.name} for $${price}` },
          { label: 'Pass' },
        ]
      );

      if (buyChoice === 0) {
        const heroGold = Number(((ctx.getHeroById ?? ctx.getHero)?.(id))?.gold ?? 0);
        if (heroGold < price) {
          const noGold = `${heroName} doesn't have enough gold! Need $${price}, have $${heroGold}.`;
          log.push(noGold);
          await showResult(ctx, 'NEW ITEMS IN STOCK — Result', [noGold]);
        } else {
          ctx.updateHero?.(id, h => {
            const items = Array.isArray(h.items) ? [...h.items] : [];
            items.push({
              ...card,
              type: card.type || 'Gear',
              acquiredFrom: 'New Items in Stock (General Store)',
              pricePaid: price,
            });
            return { ...h, gold: Math.max(0, (h.gold || 0) - price), items };
          });
          const bought = `${heroName} purchases ${card.name} for $${price}!`;
          log.push(bought);
          await showResult(ctx, 'NEW ITEMS IN STOCK — Result', [bought]);
          ctx.toast?.(`Bought ${card.name} for $${price}.`);
        }
      } else {
        log.push(`Passed on ${card.name}.`);
      }
    }
    return { log };
  }

  // 12: Artifact for Sale — Draw World+Artifact; buy for listed price or $100
  if (roll === 12) {
    const worldArtifactMap = {};
    if (Array.isArray(mineArtifacts) && mineArtifacts.length > 0) {
      worldArtifactMap['Mines'] = mineArtifacts;
    }
    if (Array.isArray(otherWorldArtifacts)) {
      for (const art of otherWorldArtifacts) {
        const w = art?.world || 'Unknown';
        if (!worldArtifactMap[w]) worldArtifactMap[w] = [];
        worldArtifactMap[w].push(art);
      }
    }

    const availableWorlds = Array.isArray(WORLD_CARDS) && WORLD_CARDS.length > 0
      ? WORLD_CARDS
      : Object.keys(worldArtifactMap).map(w => ({ name: w }));

    if (!availableWorlds.length) {
      const outcome = 'The shop owner has a rare artifact, but no World cards are available in data. Draw a World Card and Artifact manually. Purchase for list price or $100.';
      log.push(outcome);
      await showResult(ctx, 'ARTIFACT FOR SALE — Result', [outcome]);
      return { log };
    }

    const worldCard = availableWorlds[Math.floor(Math.random() * availableWorlds.length)];
    const worldName = worldCard.name || 'Unknown World';

    let pool = worldArtifactMap[worldName] || [];
    if (!pool.length) {
      const looseKey = Object.keys(worldArtifactMap).find(
        k => k.toLowerCase().includes(worldName.toLowerCase()) ||
             worldName.toLowerCase().includes(k.toLowerCase())
      );
      if (looseKey) pool = worldArtifactMap[looseKey];
    }

    if (!pool.length) {
      const outcome = `World Card drawn: ${worldName}\n\nNo Artifacts found for ${worldName} in data. Draw the Artifact manually. Purchase for list price or $100.`;
      log.push(outcome);
      patchShopMods({ artifactForSale: true, artifactPrice: 100 });
      await showResult(ctx, 'ARTIFACT FOR SALE — Result', [outcome]);
      return { log };
    }

    const artifact = pool[Math.floor(Math.random() * pool.length)];
    const listPrice = Number(artifact.value) || 0;
    const price = listPrice > 0 ? listPrice : 100;
    const priceLabel = listPrice > 0 ? `$${listPrice} (list price)` : '$100 (no list price)';
    const effectsStr = artifact.effects
      ? (Array.isArray(artifact.effects) ? artifact.effects.join('; ') : JSON.stringify(artifact.effects))
      : '';

    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? null;
    const heroName = hero?.name || 'Hero';

    const buyChoice = await ctx.promptChoice?.(
      `ARTIFACT FOR SALE\n\nWorld Card: ${worldName}\nArtifact: ${artifact.name}\nType: ${artifact.type || 'Artifact'}${effectsStr ? `\nEffects: ${effectsStr}` : ''}\nPrice: ${priceLabel}\n\nPurchase ${artifact.name}?`,
      [
        { label: `Buy ${artifact.name} for $${price}` },
        { label: 'Pass' },
      ]
    );

    if (buyChoice === 0) {
      const heroGold = Number(((ctx.getHeroById ?? ctx.getHero)?.(id))?.gold ?? 0);
      if (heroGold < price) {
        const noGold = `${heroName} doesn't have enough gold! Need $${price}, have $${heroGold}.`;
        log.push(noGold);
        await showResult(ctx, 'ARTIFACT FOR SALE — Result', [noGold]);
      } else {
        ctx.updateHero?.(id, h => {
          const items = Array.isArray(h.items) ? [...h.items] : [];
          items.push({
            ...artifact,
            id: artifact.id || `artifact_gs_${Date.now()}`,
            type: artifact.type || 'Artifact',
            acquiredFrom: 'Artifact for Sale (General Store)',
            pricePaid: price,
          });
          return { ...h, gold: Math.max(0, (h.gold || 0) - price), items };
        });
        const bought = `${heroName} purchases ${artifact.name} for $${price}!`;
        log.push(bought);
        await showResult(ctx, 'ARTIFACT FOR SALE — Result', [bought]);
        ctx.toast?.(`Bought ${artifact.name} for $${price}!`);
      }
    } else {
      log.push(`Passed on ${artifact.name}.`);
      // Store in shopMods so it can still be purchased in the shop UI
      patchShopMods({
        artifactForSale: true,
        artifactPrice: price,
        artifactCard: {
          ...artifact,
          id: artifact.id || `artifact_gs_${Date.now()}`,
          type: artifact.type || 'Artifact',
          world: worldName,
        },
      });
      await showResult(ctx, 'ARTIFACT FOR SALE — Result', [`${artifact.name} is available in the shop for $${price}.`]);
      ctx.toast?.(`Artifact for Sale: ${artifact.name} ($${price}).`);
    }
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
