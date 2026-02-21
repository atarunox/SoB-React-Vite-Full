// src/utils/locationHandlers/streetMarketHandler.js
import { loadTownState, saveTownState } from '../townState';

// Convenience money dice
const rollD6 = () => Math.floor(Math.random() * 6) + 1;
const roll2D6 = () => rollD6() + rollD6();

// Helper to mutate shop mods
function patchShopMods(shopId, patch) {
  const s = loadTownState();
  const cur = s.shopMods?.[shopId] || { priceDelta: 0, destroyed: false };
  const next = { ...cur, ...patch };
  const updated = { ...s, shopMods: { ...(s.shopMods || {}), [shopId]: next } };
  saveTownState(updated);
}

// Helper to set global rules (for the town stay)
function setGlobalRule(key, val = true) {
  const s = loadTownState();
  const next = { ...s, globalRules: { ...(s.globalRules || {}), [key]: val } };
  saveTownState(next);
}

function displayFor(roll) {
  // Returns { title, lore, effect }
  switch (true) {
    case roll === 2: return {
      title: 'Blood Sacrifice',
      lore: 'An old crone hisses a prayer as iron bowls fill with dark offerings.',
      effect: 'Spirit 6+ or gain a Madness (roll on Madness Chart). Pass: Gain 25 XP and D6×$50.'
    };
    case roll === 3: return {
      title: 'Swamp Slug Stampede',
      lore: 'The ground trembles—slimy shadows surge between the stalls!',
      effect: 'Lore 5+ or Strength 5+, else roll on Injury Chart. Then this location is destroyed for the town stay.'
    };
    case roll === 4: return {
      title: 'Held Up',
      lore: 'Knives glint from behind burlap canopies as hands reach for your purse.',
      effect: 'Pay D6×$100, or D6 Dark Stone, or roll 2D6 Initiative. Win: +50 XP; else take 2D6 Wounds (ignores Defense).'
    };
    case roll === 5: return {
      title: 'Market Prices Up',
      lore: 'Hawkers shout in unison—“Shortage! Prices go up!”',
      effect: 'All Street Market items cost +$50 (this town stay).'
    };
    case roll >= 6 && roll <= 8: return {
      title: 'Hogs and Horse Thieves',
      lore: 'A commotion, some hoofprints, and a lot of grumbling. Business resumes.',
      effect: 'No Event.'
    };
    case roll === 9: return {
      title: 'Market Prices Down',
      lore: 'A fresh caravan rolls in, wagons sagging with goods.',
      effect: 'All Street Market items –$50 (minimum $25; this town stay).'
    };
    case roll === 10: return {
      title: 'Fortune Teller',
      lore: 'A veil parts; a painted eye stares straight through your fate.',
      effect: 'Choose: Gain a Revive Token, OR gain D6×$100 and +50 XP.'
    };
    case roll === 11: return {
      title: 'Lucky Streak',
      lore: 'Dice clatter, cards snap—Lady Luck nods your way.',
      effect: 'All re-rolls may add/subtract 1 (this town stay). Recover 1 Grit.'
    };
    case roll === 12: return {
      title: 'Rare Deal',
      lore: 'From beneath the counter, the broker unveils a relic swaddled in silk.',
      effect: 'Draw a World card; you may buy an Artifact at half price (limit 1).'
    };
    default: return {
      title: 'Street Market Event',
      lore: '',
      effect: 'No Event.'
    };
  }
}

/**
 * ctx methods used here:
 * - getActiveHeroId()
 * - getHeroesAtShop(shopId)
 * - updateHero(id, patchOrFn)
 * - addToken(id, tokenName)
 * - enqueueChartRoll(id, chartName)
 * - promptChoice(title, options[])   // returns selected index or key
 * - doSkillCheck(id, { stat, target }) // boolean
 * - toast(msg)
 */
async function apply(roll, ctx) {
  const shopId = 'streetMarket';

  if (roll === 2) {
    const id = ctx.getActiveHeroId();
    const passed = await ctx.doSkillCheck(id, { stat: 'Spirit', target: 6 });
    if (passed) {
      const gold = rollD6() * 50;
      ctx.updateHero(id, h => ({ ...h, xp: (h.xp || 0) + 25, gold: (h.gold || 0) + gold }));
      ctx.toast?.(`Blood Sacrifice passed: +25 XP, +$${gold}`);
    } else {
      await ctx.enqueueChartRoll(id, 'madness');
      ctx.toast?.('Blood Sacrifice failed: Roll on Madness chart.');
    }
    return;
  }

  if (roll === 3) {
    const id = ctx.getActiveHeroId();
    const okLore = await ctx.doSkillCheck(id, { stat: 'Lore', target: 5 });
    const okStr = okLore || await ctx.doSkillCheck(id, { stat: 'Strength', target: 5 });
    if (!okStr) {
      await ctx.enqueueChartRoll(id, 'injury');
      ctx.toast?.('Swamp Slug Stampede: Roll on Injury chart.');
    }
    patchShopMods(shopId, { destroyed: true });
    ctx.toast?.('The Street Market is destroyed for the rest of this town stay!');
    return;
  }

  if (roll === 4) {
    const id = ctx.getActiveHeroId();
    const costGold = rollD6() * 100;
    const costDS = rollD6();
    const choice = await ctx.promptChoice('Held Up', [
      `Pay $${costGold}`,
      `Pay ${costDS} Dark Stone`,
      'Fight (2D6 Initiative contest)',
    ]);
    const idx = (choice === '0' ? 0 : choice === '1' ? 1 : choice === '2' ? 2 : choice);

    if (idx === 0) {
      ctx.updateHero(id, h => ({ ...h, gold: Math.max(0, (h.gold || 0) - costGold) }));
      ctx.toast?.(`Paid $${costGold} to avoid trouble.`);
      return;
    }
    if (idx === 1) {
      ctx.updateHero(id, h => ({ ...h, darkStone: Math.max(0, (h.darkStone || 0) - costDS) }));
      ctx.toast?.(`Paid ${costDS} Dark Stone to avoid trouble.`);
      return;
    }

    const you = roll2D6();
    const hero = ctx.getHeroById?.(id) || {};
    const heroInit = Number(hero.initiative ?? hero.Initiative ?? 0);
    if (you >= heroInit) {
      ctx.updateHero(id, h => ({ ...h, xp: (h.xp || 0) + 50 }));
      ctx.toast?.(`You won the scuffle (rolled ${you} vs Initiative ${heroInit}): +50 XP`);
    } else {
      const wounds = rollD6() + rollD6();
      ctx.updateHero(id, h => ({ ...h, wounds: (h.wounds || 0) + wounds }));
      ctx.toast?.(`You lost (rolled ${you} vs Initiative ${heroInit}): take ${wounds} Wounds (ignores Defense).`);
    }
    return;
  }

  if (roll === 5) {
    const cur = loadTownState().shopMods?.[shopId] || { priceDelta: 0, destroyed: false };
    patchShopMods(shopId, { priceDelta: (cur.priceDelta || 0) + 50 });
    ctx.toast?.('Street Market prices increased by $50 (this town stay).');
    return;
  }

  if (roll >= 6 && roll <= 8) {
    ctx.toast?.('Hogs and Horse Thieves: No Event.');
    return;
  }

  if (roll === 9) {
    const cur = loadTownState().shopMods?.[shopId] || { priceDelta: 0, destroyed: false };
    patchShopMods(shopId, { priceDelta: (cur.priceDelta || 0) - 50 });
    ctx.toast?.('Street Market prices decreased by $50 (min $25; this town stay).');
    return;
  }

  if (roll === 10) {
    const id = ctx.getActiveHeroId();
    const choice = await ctx.promptChoice('Fortune Teller', [
      'Path of Glory (Gain a Revive Token)',
      'Path of Luck (Gain D6×$100 and +50 XP)',
    ]);
    const idx = (choice === '0' ? 0 : choice === '1' ? 1 : choice);

    if (idx === 0) {
      await ctx.addToken(id, 'Revive Token');
      ctx.toast?.('You gained a Revive Token.');
    } else {
      const gold = rollD6() * 100;
      ctx.updateHero(id, h => ({
        ...h,
        gold: (h.gold || 0) + gold,
        xp: (h.xp || 0) + 50,
      }));
      ctx.toast?.(`You gained $${gold} and +50 XP.`);
    }
    return;
  }

  if (roll === 11) {
    setGlobalRule('rerollFlexPlusMinus1', true);
    const id = ctx.getActiveHeroId();
    ctx.updateHero(id, h => ({ ...h, grit: Math.min((h.maxGrit || 2), (h.grit || 0) + 1) }));
    ctx.toast?.('Lucky Streak: Re-rolls ±1 for this town stay; recover 1 Grit.');
    return;
  }

  if (roll === 12) {
    patchShopMods(shopId, { rareDealHalfPriceArtifact: true });
    ctx.toast?.('Rare Deal: You may buy one Artifact at half price (this visit).');
    return;
  }
}

// ---- Named wrapper so the registry can call it like others ----------------
export async function handleStreetMarketEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? roll2D6();
  const disp = displayFor(roll); // provide title/lore/effect for UI
  await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: [`Street Market Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
    title: disp.title,
    lore: disp.lore,
    effect: disp.effect,
  };
}

// Expose object (if anything else imports it)
export const streetMarketHandler = {
  display: (roll) => displayFor(roll),
  apply,
};
