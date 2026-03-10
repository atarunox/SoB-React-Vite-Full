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
      lore: 'You stumble into a hidden part of the Street Market where a bloody ritual sacrifice is taking place. They are not pleased to see you.',
      effect: 'You may choose to leave (your current Day in Town is over) or make a Spirit 6+ test. If passed, gain 25 XP and D6\u00D7$50. If failed, your current Day in Town is over and you must roll once on the Madness Chart.'
    };
    case roll === 3: return {
      title: 'Swamp Slug Stampede',
      lore: 'A herd of slimy Swamp Slugs suddenly stampede through the Street Market, crashing through all the stalls and shops, flattening everything in their path.',
      effect: 'Every Hero at the Street Market must pass a Lore 5+ or Strength 6+ test or be trampled and roll once on the Injury Chart. The Street Market is destroyed for the rest of this Town Stay.'
    };
    case roll === 4: return {
      title: 'Held Up',
      lore: 'A couple of gunmen jump out from behind a stall to rob you!',
      effect: 'You must pay D6\u00D7$100 OR D6 Dark Stone to the robbers. Alternatively, you can take \u2019em on! Roll 2D6; if the total is equal to or less than your Initiative, you fight them off and gain 50 XP. Otherwise, they beat you down \u2014 take 2D6 Wounds, ignoring Defense.'
    };
    case roll === 5: return {
      title: 'Market Prices Up',
      lore: 'Supplies are running low and some of the merchants have raised their prices today.',
      effect: 'All items at the Street Market are $50 more expensive (this Town Stay).'
    };
    case roll >= 6 && roll <= 8: return {
      title: 'Hogs and Horse Thieves',
      lore: 'Hogs are running loose and a horse trader has been accused of stealing his wares. There is a commotion going on, but it\u2019s not really any of your concern.',
      effect: 'No Event.'
    };
    case roll === 9: return {
      title: 'Market Prices Down',
      lore: 'A caravan of goods has recently arrived and the merchants are eager to do business.',
      effect: 'All items at the Street Market are $50 less expensive (to a minimum of $25) (this Town Stay).'
    };
    case roll === 10: return {
      title: 'Fortune Teller',
      lore: 'A Fortune Teller has set up shop in the market today.',
      effect: 'Choose one path for your next Adventure: Path of Glory \u2013 you may re-roll one Defense roll per turn for the entire Adventure. Path of Fortune \u2013 you start the Adventure at half your Max Health (round up), but gain a personal Revive Token. If that Token is still in your possession at the end of the Adventure, you gain D6\u00D7$100 and D6\u00D750 XP.'
    };
    case roll === 11: return {
      title: 'Lucky Streak',
      lore: 'Lady Luck seems to be smiling on you today!',
      effect: 'When Street Gambling during this Town Stay, after all re-rolls are complete, you may add or subtract 1 from any one die. Also, Recover 1 Grit.'
    };
    case roll === 12: return {
      title: 'Rare Deal',
      lore: 'Something catches your eye in the market today.',
      effect: 'Draw a World card, then draw an Artifact from that World. You may buy the Artifact for half its listed price (round up to the nearest $5). If the Artifact doesn\u2019t have a listed price, re-draw.'
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
    const choice = await ctx.promptChoice?.(
      'You stumble into a hidden part of the Street Market where a bloody ritual sacrifice is taking place. They are not pleased to see you.',
      [
        'Leave immediately (your current Day in Town is over)',
        'Make a Spirit 6+ test',
      ]
    );
    const leave = choice === 0 || choice === '0';
    if (leave) {
      ctx.updateHero(id, h => ({ ...h, isDone: true }));
      ctx.toast?.('You wisely back away. Your current Day in Town is over.');
      return;
    }
    const passed = await ctx.doSkillCheck(id, { stat: 'Spirit', target: 6 });
    if (passed) {
      const gold = rollD6() * 50;
      ctx.updateHero(id, h => ({ ...h, xp: (h.xp || 0) + 25, gold: (h.gold || 0) + gold }));
      ctx.toast?.(`Blood Sacrifice passed: +25 XP, +$${gold}`);
    } else {
      await ctx.enqueueChartRoll(id, 'madness');
      ctx.updateHero(id, h => ({ ...h, isDone: true }));
      ctx.toast?.('Blood Sacrifice failed: your current Day in Town is over. Roll on Madness Chart.');
    }
    return;
  }

  if (roll === 3) {
    ctx.toast?.('A herd of slimy Swamp Slugs suddenly stampede through the Street Market, crashing through all the stalls and shops, flattening everything in their path.');

    // Every Hero at the Street Market must pass Lore 5+ or Strength 5+
    const heroIds = ctx.getHeroesAtShop?.(shopId) || [ctx.getActiveHeroId()];
    for (const hid of heroIds) {
      const okLore = await ctx.doSkillCheck(hid, { stat: 'Lore', target: 5 });
      const okStr = okLore || await ctx.doSkillCheck(hid, { stat: 'Strength', target: 6 });
      if (!okStr) {
        await ctx.enqueueChartRoll(hid, 'injury');
        const hero = ctx.getHeroById?.(hid) || {};
        ctx.toast?.(`${hero.name || 'Hero'} is trampled! Roll on Injury Chart.`);
      }
    }
    patchShopMods(shopId, { destroyed: true });
    ctx.toast?.('The Street Market is destroyed for the rest of this Town Stay!');
    return;
  }

  if (roll === 4) {
    const id = ctx.getActiveHeroId();
    const costGold = rollD6() * 100;
    const costDS = rollD6();
    const hero = ctx.getHeroById?.(id) || {};
    const heroInit = Number(hero.initiative ?? hero.Initiative ?? 0);
    const choice = await ctx.promptChoice?.(
      `A couple of gunmen jump out from behind a stall to rob you! Pay D6\u00D7$100 ($${costGold}) or D6 Dark Stone (${costDS}) to get out of this. Or take \u2019em on \u2014 roll 2D6 \u2264 your Initiative (${heroInit}) to fight them off.`,
      [
        `Pay $${costGold}`,
        `Pay ${costDS} Dark Stone`,
        'Fight them! (Roll 2D6 \u2264 Initiative)',
      ]
    );
    const idx = (choice === '0' ? 0 : choice === '1' ? 1 : choice === '2' ? 2 : choice);

    if (idx === 0) {
      ctx.updateHero(id, h => ({ ...h, gold: Math.max(0, (h.gold || 0) - costGold) }));
      ctx.toast?.(`Paid $${costGold} to the robbers.`);
      return;
    }
    if (idx === 1) {
      ctx.updateHero(id, h => ({ ...h, darkStone: Math.max(0, (h.darkStone || 0) - costDS) }));
      ctx.toast?.(`Paid ${costDS} Dark Stone to the robbers.`);
      return;
    }

    const you = roll2D6();
    if (you <= heroInit) {
      ctx.updateHero(id, h => ({ ...h, xp: (h.xp || 0) + 50 }));
      ctx.toast?.(`You fight them off! (rolled ${you} \u2264 Initiative ${heroInit}): +50 XP`);
    } else {
      const wounds = roll2D6();
      ctx.updateHero(id, h => ({ ...h, wounds: (h.wounds || 0) + wounds }));
      ctx.toast?.(`They beat you down (rolled ${you} > Initiative ${heroInit}): take ${wounds} Wounds, ignoring Defense.`);
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
    const choice = await ctx.promptChoice?.(
      'A Fortune Teller has set up shop in the market today. Choose one path for your next Adventure:',
      [
        'Path of Glory \u2013 Re-roll one Defense roll per turn for the entire Adventure',
        'Path of Fortune \u2013 Start at half Max Health (round up), but gain a personal Revive Token. If you still have it at the end, gain D6\u00D7$100 and D6\u00D750 XP',
      ]
    );
    const idx = (choice === '0' ? 0 : choice === '1' ? 1 : choice);

    if (idx === 0) {
      ctx.updateHero(id, h => ({ ...h, fortuneTellerPath: 'glory' }));
      ctx.toast?.('Path of Glory chosen: you may re-roll one Defense roll per turn during your next Adventure.');
    } else {
      ctx.updateHero(id, h => ({ ...h, fortuneTellerPath: 'fortune' }));
      ctx.toast?.('Path of Fortune chosen: you will start your next Adventure at half Max Health but gain a personal Revive Token. Keep it to the end for D6\u00D7$100 and D6\u00D750 XP!');
    }
    return;
  }

  if (roll === 11) {
    setGlobalRule('streetGamblingLuckyStreak', true);
    const id = ctx.getActiveHeroId();
    ctx.updateHero(id, h => ({ ...h, grit: Math.min((h.maxGrit || 2), (h.grit || 0) + 1) }));
    ctx.toast?.('Lady Luck seems to be smiling on you today! When Street Gambling this Town Stay, after all re-rolls you may add or subtract 1 from any one die. Also, Recover 1 Grit.');
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
