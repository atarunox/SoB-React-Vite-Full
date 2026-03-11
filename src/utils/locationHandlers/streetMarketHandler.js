// src/utils/locationHandlers/streetMarketHandler.js
import { loadTownState, saveTownState } from '../townState';
import { calculateCurrentStats } from '../calculateStats';

// Convenience money dice
const rollD6 = () => Math.floor(Math.random() * 6) + 1;
const roll2D6 = () => rollD6() + rollD6();

// Roll Nd6 skill check inline so we can capture and display the dice results
function rollStatCheck(statVal, target) {
  const dice = Math.max(1, statVal);
  const rolls = Array.from({ length: dice }, () => rollD6());
  const passed = rolls.some((r) => r >= target);
  const rollStr = rolls.join(', ');
  return { passed, rolls, rollStr };
}

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
 * - getHeroById(id)
 * - getHeroesAtShop(shopId)
 * - updateHero(id, patchOrFn)
 * - addToken(id, tokenName)
 * - enqueueChartRoll(id, chartName)
 * - promptChoice(title, options[])   // returns selected index or key
 * - toast(msg)
 */
async function apply(roll, ctx) {
  const shopId = 'streetMarket';

  // --- Roll 2: Blood Sacrifice ---
  if (roll === 2) {
    const id = ctx.getActiveHeroId();
    const hero = ctx.getHeroById?.(id) || {};
    const heroName = hero?.name || 'Hero';
    const spiritVal = getEffectiveStat(hero, 'Spirit');

    const choice = await ctx.promptChoice?.(
      `BLOOD SACRIFICE\n\n` +
      `You stumble into a hidden part of the Street Market where a bloody ritual sacrifice is taking place. They are not pleased to see you.\n\n` +
      `Make a Spirit 6+ test. You have ${spiritVal} Spirit (${spiritVal}d6, need a 6+).\n\n` +
      `Choose:`,
      [
        'Leave immediately (your current Day in Town is over)',
        `Make a Spirit 6+ test (You have ${spiritVal} Spirit)`,
      ]
    );
    const leave = choice === 0 || choice === '0';
    if (leave) {
      ctx.updateHero(id, h => ({ ...h, isDone: true }));
      window.alert(
        `BLOOD SACRIFICE\n\n` +
        `You stumble into a hidden part of the Street Market where a bloody ritual sacrifice is taking place. They are not pleased to see you.\n\n` +
        `${heroName} wisely backs away from the dark ritual.\n` +
        `Your current Day in Town is over.`
      );
      return;
    }
    const { passed, rollStr } = rollStatCheck(spiritVal, 6);
    if (passed) {
      const gold = rollD6() * 50;
      ctx.updateHero(id, h => ({ ...h, xp: (h.xp || 0) + 25, gold: (h.gold || 0) + gold }));
      window.alert(
        `Spirit 6+ Test PASSED!\n` +
        `Rolled ${spiritVal}d6: [${rollStr}] — needed a 6+\n\n` +
        `${heroName} holds firm against the dark power of the ritual!\n\n` +
        `Gain 25 XP and $${gold}.`
      );
    } else {
      await ctx.enqueueChartRoll(id, 'madness');
      ctx.updateHero(id, h => ({ ...h, isDone: true }));
      window.alert(
        `Spirit 6+ Test FAILED!\n` +
        `Rolled ${spiritVal}d6: [${rollStr}] — needed a 6+\n\n` +
        `The dark ritual overwhelms ${heroName}'s mind!\n\n` +
        `Your current Day in Town is over.\n` +
        `Roll once on the Madness Chart.`
      );
    }
    return;
  }

  // --- Roll 3: Swamp Slug Stampede ---
  if (roll === 3) {
    const heroIds = ctx.getHeroesAtShop?.(shopId) || [ctx.getActiveHeroId()];

    for (const hid of heroIds) {
      const hero = ctx.getHeroById?.(hid) || {};
      const heroName = hero?.name || 'Hero';
      const loreVal = getEffectiveStat(hero, 'Lore');
      const strVal = getEffectiveStat(hero, 'Strength');

      window.alert(
        `SWAMP SLUG STAMPEDE\n\n` +
        `A herd of slimy Swamp Slugs suddenly stampede through the Street Market, crashing through all the stalls and shops, flattening everything in their path.\n\n` +
        `${heroName} must pass a Lore 5+ or Strength 6+ test or be trampled!\n\n` +
        `You have ${loreVal} Lore (${loreVal}d6, need 5+) and ${strVal} Strength (${strVal}d6, need 6+).`
      );

      // Try Lore 5+ first
      const loreCheck = rollStatCheck(loreVal, 5);
      if (loreCheck.passed) {
        window.alert(
          `Lore 5+ Test PASSED!\n` +
          `Rolled ${loreVal}d6: [${loreCheck.rollStr}] — needed a 5+\n\n` +
          `${heroName} recognizes the slugs' path and dodges out of the way!`
        );
        continue;
      }

      // Lore failed, try Strength 6+
      window.alert(
        `Lore 5+ Test FAILED!\n` +
        `Rolled ${loreVal}d6: [${loreCheck.rollStr}] — needed a 5+\n\n` +
        `Attempting Strength 6+ test instead...`
      );

      const strCheck = rollStatCheck(strVal, 6);
      if (strCheck.passed) {
        window.alert(
          `Strength 6+ Test PASSED!\n` +
          `Rolled ${strVal}d6: [${strCheck.rollStr}] — needed a 6+\n\n` +
          `${heroName} braces and shoves the slugs aside!`
        );
        continue;
      }

      // Both failed — trampled
      await ctx.enqueueChartRoll(hid, 'injury');
      window.alert(
        `Strength 6+ Test FAILED!\n` +
        `Rolled ${strVal}d6: [${strCheck.rollStr}] — needed a 6+\n\n` +
        `${heroName} is trampled by the stampeding slugs!\n` +
        `Roll once on the Injury Chart.`
      );
    }
    patchShopMods(shopId, { destroyed: true });
    window.alert(
      `SWAMP SLUG STAMPEDE\n\n` +
      `The Street Market is destroyed for the rest of this Town Stay!`
    );
    return;
  }

  // --- Roll 4: Held Up ---
  if (roll === 4) {
    const id = ctx.getActiveHeroId();
    const hero = ctx.getHeroById?.(id) || {};
    const heroName = hero?.name || 'Hero';
    const costGold = rollD6() * 100;
    const costDS = rollD6();
    const heroInit = getEffectiveStat(hero, 'Initiative');

    const choice = await ctx.promptChoice?.(
      `HELD UP\n\n` +
      `A couple of gunmen jump out from behind a stall to rob you!\n\n` +
      `Pay $${costGold} or ${costDS} Dark Stone to the robbers.\n` +
      `Or take 'em on — roll 2D6 ≤ your Initiative to fight them off.\n\n` +
      `You have ${heroInit} Initiative.`,
      [
        `Pay $${costGold}`,
        `Pay ${costDS} Dark Stone`,
        `Fight them! (Roll 2D6 ≤ Initiative ${heroInit})`,
      ]
    );
    const idx = (choice === '0' ? 0 : choice === '1' ? 1 : choice === '2' ? 2 : choice);

    if (idx === 0) {
      ctx.updateHero(id, h => ({ ...h, gold: Math.max(0, (h.gold || 0) - costGold) }));
      window.alert(
        `HELD UP\n\n` +
        `A couple of gunmen jump out from behind a stall to rob you!\n\n` +
        `${heroName} pays $${costGold} to the robbers and they slink away.`
      );
      return;
    }
    if (idx === 1) {
      ctx.updateHero(id, h => ({ ...h, darkStone: Math.max(0, (h.darkStone || 0) - costDS) }));
      window.alert(
        `HELD UP\n\n` +
        `A couple of gunmen jump out from behind a stall to rob you!\n\n` +
        `${heroName} hands over ${costDS} Dark Stone and the robbers vanish into the crowd.`
      );
      return;
    }

    const you = roll2D6();
    if (you <= heroInit) {
      ctx.updateHero(id, h => ({ ...h, xp: (h.xp || 0) + 50 }));
      window.alert(
        `HELD UP — FIGHT RESULT\n\n` +
        `A couple of gunmen jump out from behind a stall to rob you!\n\n` +
        `Rolled 2D6 = ${you} ≤ Initiative ${heroInit} — SUCCESS!\n\n` +
        `${heroName} fights them off!\n` +
        `Gain 50 XP.`
      );
    } else {
      const wounds = roll2D6();
      ctx.updateHero(id, h => ({ ...h, wounds: (h.wounds || 0) + wounds }));
      window.alert(
        `HELD UP — FIGHT RESULT\n\n` +
        `A couple of gunmen jump out from behind a stall to rob you!\n\n` +
        `Rolled 2D6 = ${you} > Initiative ${heroInit} — FAILED!\n\n` +
        `They beat ${heroName} down!\n` +
        `Take ${wounds} Wounds, ignoring Defense.`
      );
    }
    return;
  }

  // --- Roll 5: Market Prices Up ---
  if (roll === 5) {
    const cur = loadTownState().shopMods?.[shopId] || { priceDelta: 0, destroyed: false };
    patchShopMods(shopId, { priceDelta: (cur.priceDelta || 0) + 50 });
    window.alert(
      `MARKET PRICES UP\n\n` +
      `Supplies are running low and some of the merchants have raised their prices today.\n\n` +
      `All items at the Street Market are $50 more expensive (this Town Stay).`
    );
    return;
  }

  // --- Roll 6-8: Hogs and Horse Thieves ---
  if (roll >= 6 && roll <= 8) {
    window.alert(
      `HOGS AND HORSE THIEVES\n\n` +
      `Hogs are running loose and a horse trader has been accused of stealing his wares. There is a commotion going on, but it\u2019s not really any of your concern.\n\n` +
      `No Event.`
    );
    return;
  }

  // --- Roll 9: Market Prices Down ---
  if (roll === 9) {
    const cur = loadTownState().shopMods?.[shopId] || { priceDelta: 0, destroyed: false };
    patchShopMods(shopId, { priceDelta: (cur.priceDelta || 0) - 50 });
    window.alert(
      `MARKET PRICES DOWN\n\n` +
      `A caravan of goods has recently arrived and the merchants are eager to do business.\n\n` +
      `All items at the Street Market are $50 less expensive (to a minimum of $25) (this Town Stay).`
    );
    return;
  }

  // --- Roll 10: Fortune Teller ---
  if (roll === 10) {
    const id = ctx.getActiveHeroId();
    const choice = await ctx.promptChoice?.(
      `FORTUNE TELLER\n\n` +
      `A Fortune Teller has set up shop in the market today. She reads your future in cards and bones, offering either glory or risky riches.\n\n` +
      `Choose one path for your next Adventure:`,
      [
        'Path of Glory \u2013 Re-roll one Defense roll per turn for the entire Adventure',
        'Path of Fortune \u2013 Start at half Max Health (round up), but gain a personal Revive Token. If you still have it at the end, gain D6\u00D7$100 and D6\u00D750 XP',
      ]
    );
    const idx = (choice === '0' ? 0 : choice === '1' ? 1 : choice);

    if (idx === 0) {
      ctx.updateHero(id, h => ({ ...h, fortuneTellerPath: 'glory' }));
      window.alert(
        `FORTUNE TELLER\n\n` +
        `A Fortune Teller has set up shop in the market today. She reads your future in cards and bones, offering either glory or risky riches.\n\n` +
        `Path of Glory chosen!\n` +
        `You may re-roll one Defense roll per turn during your next Adventure.`
      );
    } else {
      ctx.updateHero(id, h => ({ ...h, fortuneTellerPath: 'fortune' }));
      window.alert(
        `FORTUNE TELLER\n\n` +
        `A Fortune Teller has set up shop in the market today. She reads your future in cards and bones, offering either glory or risky riches.\n\n` +
        `Path of Fortune chosen!\n` +
        `You will start your next Adventure at half Max Health but gain a personal Revive Token.\n` +
        `Keep it to the end for D6\u00D7$100 and D6\u00D750 XP!`
      );
    }
    return;
  }

  // --- Roll 11: Lucky Streak ---
  if (roll === 11) {
    setGlobalRule('streetGamblingLuckyStreak', true);
    const id = ctx.getActiveHeroId();
    ctx.updateHero(id, h => ({ ...h, grit: Math.min((h.maxGrit || 2), (h.grit || 0) + 1) }));
    window.alert(
      `LUCKY STREAK\n\n` +
      `Lady Luck seems to be smiling on you today!\n\n` +
      `When Street Gambling during this Town Stay, after all re-rolls are complete, you may add or subtract 1 from any one die.\n\n` +
      `Also, Recover 1 Grit.`
    );
    return;
  }

  // --- Roll 12: Rare Deal ---
  if (roll === 12) {
    patchShopMods(shopId, { rareDealHalfPriceArtifact: true });
    window.alert(
      `RARE DEAL\n\n` +
      `Something catches your eye in the market today.\n\n` +
      `Draw a World card, then draw an Artifact from that World.\n` +
      `You may buy the Artifact for half its listed price (round up to the nearest $5).\n` +
      `If the Artifact doesn\u2019t have a listed price, re-draw.`
    );
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
