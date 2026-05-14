// src/utils/locationHandlers/streetMarketHandler.js
import { loadTownState, saveTownState } from '../townState';
import { WORLD_CARDS } from '../../data/worldCards';
import { mineArtifacts } from '../../data/items/mineArtifacts';
import { otherWorldArtifacts } from '../../data/items/otherWorldArtifacts';

import { d6 as _d6, roll2d6 as _roll2d6 } from '../../utils/diceHelpers';

// Use ctx.d6 when available (respects manual roll mode); fallback to auto-roll
const ctxD6 = async (ctx, label) => (typeof ctx?.d6 === 'function') ? ctx.d6(label) : _d6();

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

export function display(roll) {
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
      effect: 'You must pay D6\u00D7$100 OR D6 Dark Stone to the robbers. Alternatively, you can take \u2019em on! Roll 2D6; if the total is equal to or greater than your Initiative, you fight them off and gain 50 XP. Otherwise, they beat you down \u2014 take 2D6 Wounds, ignoring Defense.'
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

export async function apply(roll, ctx) {
  const shopId = 'streetMarket';
  const id = ctx.getActiveHeroId?.();
  if (!id) return { log: [] };

  const info = display(roll);
  const log = [];

  log.push(`[Street Market] (${roll}) ${info.title} — ${info.lore}`);
  log.push(`Effect: ${info.effect}`);

  // --- Roll 2: Blood Sacrifice ---
  if (roll === 2) {
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? {};
    const heroName = hero?.name || 'Hero';

    const choice = await ctx.promptChoice?.(
      `BLOOD SACRIFICE\n\n${info.lore}\n\nChoose:`,
      [
        { label: 'Leave immediately (your current Day in Town is over)' },
        { label: 'Make a Spirit 6+ test' },
      ]
    );
    if (choice === 0) {
      ctx.updateHero?.(id, h => ({ ...h, isDone: true }));
      const outcome = `${heroName} wisely backs away from the dark ritual. Your current Day in Town is over.`;
      log.push(outcome);
      await showResult(ctx, 'BLOOD SACRIFICE — Result', [outcome]);
      return { log };
    }

    const result = await ctx.doSkillCheck(id, {
      stat: 'Spirit', target: 6, returnDetails: true,
      message: `BLOOD SACRIFICE\n${info.lore}\n${heroName} confronts the dark ritual!`,
    });
    const checkLine = formatCheckResult(result, 'Spirit', 6);
    if (checkLine) log.push(checkLine);
    const passed = result?.passed ?? result;

    if (passed) {
      const gold = await ctxD6(ctx, 'Blood Sacrifice — Roll 1d6 for gold (\u00D7$50)') * 50;
      ctx.updateHero?.(id, h => ({ ...h, xp: (h.xp || 0) + 25, gold: (h.gold || 0) + gold }));
      const outcome = `${heroName} holds firm against the dark power! Gain 25 XP and $${gold}.`;
      log.push(outcome);
      await showResult(ctx, 'BLOOD SACRIFICE — Result', [checkLine, '', outcome]);
      ctx.toast?.(`Blood Sacrifice: +25 XP, +$${gold}.`);
    } else {
      await ctx.enqueueChartRoll?.(id, 'madness');
      ctx.updateHero?.(id, h => ({ ...h, isDone: true }));
      const outcome = `The dark ritual overwhelms ${heroName}\u2019s mind! Your current Day in Town is over. Roll once on the Madness Chart.`;
      log.push(outcome);
      await showResult(ctx, 'BLOOD SACRIFICE — Result', [checkLine, '', outcome]);
      ctx.toast?.('Blood Sacrifice failed! Roll on Madness Chart.');
    }
    return { log };
  }

  // --- Roll 3: Swamp Slug Stampede ---
  if (roll === 3) {
    const heroIds = ctx.getHeroesAtShop?.(shopId) || [id];

    for (const hid of heroIds) {
      const hero = (ctx.getHeroById ?? ctx.getHero)?.(hid) ?? {};
      const heroName = hero?.name || 'Hero';

      const testChoice = await ctx.promptChoice?.(
        `SWAMP SLUG STAMPEDE\n\n${info.lore}\n\n${heroName} must pass a Lore 5+ or Strength 6+ test or be trampled!\n\nChoose which test to attempt:`,
        [
          { label: 'Lore 5+ test' },
          { label: 'Strength 6+ test' },
        ]
      );

      let result, checkLine;
      if (testChoice === 1) {
        result = await ctx.doSkillCheck(hid, {
          stat: 'Strength', target: 6, returnDetails: true,
          message: `SWAMP SLUG STAMPEDE\n${heroName} braces against the stampeding slugs!`,
        });
        checkLine = formatCheckResult(result, 'Strength', 6);
      } else {
        result = await ctx.doSkillCheck(hid, {
          stat: 'Lore', target: 5, returnDetails: true,
          message: `SWAMP SLUG STAMPEDE\n${heroName} tries to read the slugs' path and dodge!`,
        });
        checkLine = formatCheckResult(result, 'Lore', 5);
      }
      if (checkLine) log.push(`${heroName}: ${checkLine}`);
      const passed = result?.passed ?? result;

      if (passed) {
        const outcome = testChoice === 1
          ? `${heroName} braces and shoves the slugs aside!`
          : `${heroName} recognizes the slugs' path and dodges out of the way!`;
        log.push(outcome);
        await showResult(ctx, `SWAMP SLUG STAMPEDE — ${heroName}`, [checkLine, '', outcome]);
      } else {
        await ctx.enqueueChartRoll?.(hid, 'injury');
        const outcome = `${heroName} is trampled by the stampeding slugs! Roll once on the Injury Chart.`;
        log.push(outcome);
        await showResult(ctx, `SWAMP SLUG STAMPEDE — ${heroName}`, [checkLine, '', outcome]);
      }
    }
    patchShopMods(shopId, { destroyed: true });
    log.push('The Street Market is destroyed for the rest of this Town Stay!');
    await showResult(ctx, 'SWAMP SLUG STAMPEDE', ['The Street Market is destroyed for the rest of this Town Stay!']);
    return { log };
  }

  // --- Roll 4: Held Up ---
  if (roll === 4) {
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? {};
    const heroName = hero?.name || 'Hero';
    const costGold = await ctxD6(ctx, 'Held Up — Roll 1d6 for gold cost (\u00D7$100)') * 100;
    const costDS = await ctxD6(ctx, 'Held Up — Roll 1d6 for Dark Stone cost');

    const choice = await ctx.promptChoice?.(
      `HELD UP\n\n${info.lore}\n\nPay $${costGold} or ${costDS} Dark Stone to the robbers.\nOr take \u2019em on — roll 2D6 \u2265 your Initiative to fight them off.\n\nChoose:`,
      [
        { label: `Pay $${costGold}` },
        { label: `Pay ${costDS} Dark Stone` },
        { label: 'Fight them!' },
      ]
    );

    if (choice === 0) {
      ctx.updateHero?.(id, h => ({ ...h, gold: Math.max(0, (h.gold || 0) - costGold) }));
      const outcome = `${heroName} pays $${costGold} to the robbers and they slink away.`;
      log.push(outcome);
      await showResult(ctx, 'HELD UP — Result', [outcome]);
      ctx.toast?.(`Held Up: paid $${costGold}.`);
      return { log };
    }
    if (choice === 1) {
      ctx.updateHero?.(id, h => ({ ...h, darkStone: Math.max(0, (h.darkStone || 0) - costDS) }));
      const outcome = `${heroName} hands over ${costDS} Dark Stone and the robbers vanish into the crowd.`;
      log.push(outcome);
      await showResult(ctx, 'HELD UP — Result', [outcome]);
      ctx.toast?.(`Held Up: paid ${costDS} Dark Stone.`);
      return { log };
    }

    // Fight — roll 2D6 vs Initiative
    const die1 = await ctxD6(ctx, 'Held Up — Fight! Roll first d6');
    const die2 = await ctxD6(ctx, 'Held Up — Fight! Roll second d6');
    const you = die1 + die2;
    const heroInit = hero?.initiative ?? hero?.stats?.Initiative ?? 0;
    const fightLine = `Rolled [${die1}, ${die2}] = ${you} vs Initiative ${heroInit}.`;
    log.push(fightLine);

    if (you >= heroInit) {
      ctx.updateHero?.(id, h => ({ ...h, xp: (h.xp || 0) + 50 }));
      const outcome = `2D6 = ${you} \u2265 Initiative ${heroInit} \u2014 SUCCESS! ${heroName} fights them off! +50 XP.`;
      log.push(outcome);
      await showResult(ctx, 'HELD UP — Fight Result', [fightLine, '', outcome]);
      ctx.toast?.('Held Up: fought them off! +50 XP.');
    } else {
      const w1 = await ctxD6(ctx, 'Held Up — Roll first d6 for Wounds');
      const w2 = await ctxD6(ctx, 'Held Up — Roll second d6 for Wounds');
      const wounds = w1 + w2;
      ctx.updateHero?.(id, h => ({
        ...h,
        currentHealth: Math.max(0, (h.currentHealth ?? h.maxHealth ?? 10) - wounds),
      }));
      const woundLine = `Rolled [${w1}, ${w2}] = ${wounds} Wounds (ignoring Defense).`;
      log.push(woundLine);
      const outcome = `2D6 = ${you} < Initiative ${heroInit} \u2014 FAILED! They beat ${heroName} down! Take ${wounds} Wounds, ignoring Defense.`;
      log.push(outcome);
      await showResult(ctx, 'HELD UP — Fight Result', [fightLine, woundLine, '', outcome]);
      ctx.toast?.(`Held Up: beaten down! ${wounds} Wounds.`);
    }
    return { log };
  }

  // --- Roll 5: Market Prices Up ---
  if (roll === 5) {
    const cur = loadTownState().shopMods?.[shopId] || { priceDelta: 0, destroyed: false };
    patchShopMods(shopId, { priceDelta: (cur.priceDelta || 0) + 50 });
    const outcome = 'All items at the Street Market are $50 more expensive (this Town Stay).';
    log.push(outcome);
    await showResult(ctx, 'MARKET PRICES UP', [info.lore, '', outcome]);
    ctx.toast?.('Street Market: prices +$50.');
    return { log };
  }

  // --- Roll 6-8: Hogs and Horse Thieves ---
  if (roll >= 6 && roll <= 8) {
    log.push('Hogs and Horse Thieves — No Event.');
    await showResult(ctx, 'HOGS AND HORSE THIEVES', [info.lore, '', 'No Event.']);
    return { log };
  }

  // --- Roll 9: Market Prices Down ---
  if (roll === 9) {
    const cur = loadTownState().shopMods?.[shopId] || { priceDelta: 0, destroyed: false };
    patchShopMods(shopId, { priceDelta: (cur.priceDelta || 0) - 50 });
    const outcome = 'All items at the Street Market are $50 less expensive (to a minimum of $25) (this Town Stay).';
    log.push(outcome);
    await showResult(ctx, 'MARKET PRICES DOWN', [info.lore, '', outcome]);
    ctx.toast?.('Street Market: prices -$50.');
    return { log };
  }

  // --- Roll 10: Fortune Teller ---
  if (roll === 10) {
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? {};
    const heroName = hero?.name || 'Hero';
    const choice = await ctx.promptChoice?.(
      `FORTUNE TELLER\n\n${info.lore}\n\nChoose one path for your next Adventure:`,
      [
        { label: 'Path of Glory \u2013 Re-roll one Defense roll per turn for the entire Adventure' },
        { label: 'Path of Fortune \u2013 Start at half Max Health (round up), but gain a personal Revive Token. If still held at end of Adventure, gain D6\u00D7$100 and D6\u00D750 XP' },
      ]
    );

    if (choice === 0) {
      ctx.updateHero?.(id, h => {
        const conds = h.conditions && typeof h.conditions === 'object' && !Array.isArray(h.conditions)
          ? h.conditions : {};
        const tempList = Array.isArray(conds.temporary) ? [...conds.temporary] : [];
        tempList.push({
          name: 'Path of Glory',
          type: 'temporary',
          temporary: true,
          duration: 'nextAdventure',
          effect: 'You may re-roll one Defense roll per turn for the entire Adventure.',
          effectText: 'Re-roll one Defense roll per turn for the entire Adventure.',
          source: 'Fortune Teller (Street Market)',
        });
        return {
          ...h,
          fortuneTellerPath: 'glory',
          conditions: { ...conds, temporary: tempList },
        };
      });
      const outcome = `Path of Glory chosen! ${heroName} may re-roll one Defense roll per turn during the next Adventure. Added to Temporary Conditions.`;
      log.push(outcome);
      await showResult(ctx, 'FORTUNE TELLER — Result', [outcome]);
      ctx.toast?.('Fortune Teller: Path of Glory chosen!');
    } else {
      const maxHealth = hero?.health?.max ?? hero?.maxHealth ?? hero?.stats?.Health ?? 12;
      const halfHealth = Math.ceil(maxHealth / 2);

      ctx.updateHero?.(id, h => {
        const conds = h.conditions && typeof h.conditions === 'object' && !Array.isArray(h.conditions)
          ? h.conditions : {};
        const tempList = Array.isArray(conds.temporary) ? [...conds.temporary] : [];
        tempList.push({
          name: 'Path of Fortune',
          type: 'temporary',
          temporary: true,
          duration: 'nextAdventure',
          effect: `Start Adventure at half Max Health (${halfHealth}/${maxHealth}). Personal Revive Token: if you die, use it to revive (only you can use it). If still held at end of Adventure, gain D6\u00D7$100 and D6\u00D750 XP.`,
          effectText: `Start at half Max Health (${halfHealth}/${maxHealth}). You have a personal Revive Token. If still held at end of Adventure, gain D6\u00D7$100 and D6\u00D750 XP.`,
          source: 'Fortune Teller (Street Market)',
        });
        tempList.push({
          name: 'Revive Token (Fortune Teller)',
          type: 'temporary',
          temporary: true,
          duration: 'nextAdventure',
          effect: 'Personal Revive Token \u2014 only you can use this. If you die, discard to revive. If still held at end of Adventure, gain D6\u00D7$100 and D6\u00D750 XP.',
          effectText: 'Personal Revive Token \u2014 only you can use this. If you die, discard to revive. If still held at the end of the Adventure, gain D6\u00D7$100 and D6\u00D750 XP.',
          source: 'Fortune Teller (Street Market)',
        });

        const health = h.health ? { ...h.health } : { current: maxHealth, max: maxHealth };
        health.current = halfHealth;

        return {
          ...h,
          fortuneTellerPath: 'fortune',
          fortuneReviveToken: true,
          conditions: { ...conds, temporary: tempList },
          health,
          currentHealth: halfHealth,
        };
      });
      const outcome = `Path of Fortune chosen!\n${heroName}\u2019s Health reduced to ${halfHealth}/${maxHealth}.\nYou gain a personal Revive Token.\nIf you still have it at the end of the Adventure, gain D6\u00D7$100 and D6\u00D750 XP!\nBoth conditions added to Temporary Conditions.`;
      log.push(outcome);
      await showResult(ctx, 'FORTUNE TELLER — Result', [outcome]);
      ctx.toast?.('Fortune Teller: Path of Fortune chosen!');
    }
    return { log };
  }

  // --- Roll 11: Lucky Streak ---
  if (roll === 11) {
    setGlobalRule('streetGamblingLuckyStreak', true);
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? {};
    const heroName = hero?.name || 'Hero';
    ctx.updateHero?.(id, h => {
      const conds = h.conditions && typeof h.conditions === 'object' && !Array.isArray(h.conditions)
        ? h.conditions : {};
      const tempList = Array.isArray(conds.temporary) ? [...conds.temporary] : [];
      tempList.push({
        name: 'Lucky Streak',
        type: 'temporary',
        temporary: true,
        duration: 'thisTownStay',
        effect: 'When Street Gambling, after all re-rolls are complete, you may add or subtract 1 from any one die.',
        effectText: 'Street Gambling: after all re-rolls, you may adjust one die by \u00B11.',
        source: 'Lucky Streak (Street Market Event #11)',
      });
      const maxGrit = h.maxGrit ?? h.stats?.Grit ?? 2;
      const curGrit = h.currentGrit ?? h.grit ?? 0;
      return {
        ...h,
        currentGrit: Math.min(maxGrit, curGrit + 1),
        conditions: { ...conds, temporary: tempList },
      };
    });
    const outcome = `Lady Luck smiles on ${heroName}!\nWhen Street Gambling this Town Stay, after all re-rolls, you may adjust one die by \u00B11.\nRecovered 1 Grit.\nLucky Streak added to Temporary Conditions.`;
    log.push(outcome);
    await showResult(ctx, 'LUCKY STREAK', [outcome]);
    ctx.toast?.('Lucky Streak: +1 Grit and gambling bonus!');
    return { log };
  }

  // --- Roll 12: Rare Deal ---
  if (roll === 12) {
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? {};
    const heroName = hero?.name || 'Hero';

    // Build a mapping of world names to their artifact pools
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
      const outcome = 'No world cards available. Draw a World card manually, then draw an Artifact from that World. You may buy it for half price (round up to nearest $5).';
      log.push(outcome);
      await showResult(ctx, 'RARE DEAL', [outcome]);
      patchShopMods(shopId, { rareDealHalfPriceArtifact: true });
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

    const pricedPool = pool.filter(a => Number(a?.value) > 0);

    if (!pricedPool.length) {
      const outcome = `World Card drawn: ${worldName}\n\nNo priced Artifacts found for ${worldName}.\nDraw a physical Artifact card from that World.\nYou may buy it for half its listed price (round up to nearest $5).\nIf it doesn\u2019t have a listed price, re-draw.`;
      log.push(outcome);
      await showResult(ctx, 'RARE DEAL', [outcome]);
      patchShopMods(shopId, { rareDealHalfPriceArtifact: true });
      return { log };
    }

    const artifact = pricedPool[Math.floor(Math.random() * pricedPool.length)];
    const fullPrice = Number(artifact.value) || 0;
    const halfPrice = Math.ceil(fullPrice / 2 / 5) * 5;

    const effectsStr = artifact.effects
      ? (Array.isArray(artifact.effects) ? artifact.effects.join(' ') : JSON.stringify(artifact.effects))
      : '';

    const buyChoice = await ctx.promptChoice?.(
      `RARE DEAL\n\nWorld Card: ${worldName}\nArtifact: ${artifact.name}\nType: ${artifact.type || 'Artifact'}\nFull Price: $${fullPrice}\nHalf Price (yours): $${halfPrice}${effectsStr ? `\nEffects: ${effectsStr}` : ''}\n\nWould you like to buy ${artifact.name} for $${halfPrice}?`,
      [
        { label: `Buy ${artifact.name} for $${halfPrice}` },
        { label: 'Pass on this deal' },
      ]
    );

    if (buyChoice === 0) {
      const heroGold = hero?.gold ?? 0;
      if (heroGold < halfPrice) {
        const outcome = `${heroName} doesn\u2019t have enough gold! Need $${halfPrice}, have $${heroGold}.`;
        log.push(outcome);
        await showResult(ctx, 'RARE DEAL — Result', [outcome]);
        return { log };
      }
      ctx.updateHero?.(id, h => {
        const items = Array.isArray(h.items) ? [...h.items] : [];
        items.push({
          ...artifact,
          id: artifact.id || `rare_deal_${Date.now()}`,
          acquiredFrom: 'Rare Deal (Street Market)',
          pricePaid: halfPrice,
        });
        return {
          ...h,
          gold: Math.max(0, (h.gold || 0) - halfPrice),
          items,
        };
      });
      const outcome = `${heroName} purchases ${artifact.name} for $${halfPrice} (half of $${fullPrice})! The artifact has been added to your inventory.`;
      log.push(outcome);
      await showResult(ctx, 'RARE DEAL — Result', [outcome]);
      ctx.toast?.(`Rare Deal: bought ${artifact.name} for $${halfPrice}!`);
    } else {
      const outcome = `${heroName} passes on ${artifact.name}. Perhaps next time.`;
      log.push(outcome);
      await showResult(ctx, 'RARE DEAL — Result', [outcome]);
    }
    return { log };
  }

  return { log };
}

// ---- Named wrapper so the registry can call it like others ----------------
export async function handleStreetMarketEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? _roll2d6();
  const result = await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: result?.log || [`Street Market Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

export const streetMarketHandler = { display, apply };
