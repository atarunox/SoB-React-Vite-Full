// src/utils/locationHandlers/desertMarketplaceHandler.js

import { d6 as _d6 } from '../../utils/diceHelpers';

const ctxD6 = async (ctx, label) =>
  typeof ctx?.d6 === 'function' ? ctx.d6(label) : _d6();

// ---------- result formatting helper ----------
function formatCheckResult(result, stat, target) {
  if (result && typeof result === 'object' && Array.isArray(result.rolls)) {
    const diceStr = result.rolls.join(', ');
    const sCount =
      result.successes ?? result.rolls.filter((r) => r >= target).length;
    return `Rolled [${diceStr}] — ${result.passed ? 'PASSED' : 'FAILED'} (${stat} ${target}+, ${sCount} success${sCount !== 1 ? 'es' : ''})`;
  }
  return null;
}

async function showResult(ctx, title, lines) {
  const body = Array.isArray(lines) ? lines.join('\n') : lines;
  await ctx.promptChoice?.(`${title}\n\n${body}`, [{ label: 'Continue' }]);
}

// ---------- display (title / lore / effect) ----------
export function display(roll) {
  switch (roll) {
    case 2:
      return {
        title: 'Alien Assassin',
        lore: 'Walking through a side street, you are pulled into the shadows and thrown to the ground! Standing over you, a masked assassin brandishes a rusty, serrated blade and a contract for your life!',
        effect:
          'Make a Luck 5+ test to break free and escape! If failed, roll once on the Injury Table, using only a single D6+1.',
      };
    case 3:
      return {
        title: 'Down a Dark Alley',
        lore: 'While passing down a dark alley, an alien street urchin bumps into you and runs off. Checking your pockets, you discover something is missing!',
        effect:
          'Choose 1 Item or Side Bag Token to discard, stolen by the little thief.',
      };
    case 4:
      return {
        title: 'Market Chase',
        lore: "A gang of angry looking alien thugs has decided that they don't like the way you look, and begins chasing you through the market streets, with hate in their eyes!",
        effect:
          'Make an Agility 4+ test to outrun the thugs or a Cunning 5+ test to outwit them. If successful, gain 25 XP. If failed, take 2D6 Wounds ignoring Defense, and your Location Visit is over.',
      };
    case 5:
      return {
        title: 'Street Brawl',
        lore: 'Broken and bitter convicts roam the streets here, fighting over scraps of food to survive. As you pick your way through the filth, a brawl breaks out and you are swept up in it!',
        effect: 'Take D6 Hits that do 2 Wounds each.',
      };
    case 6:
    case 7:
    case 8:
      return {
        title: 'Dusty Streets and Dirty Looks',
        lore: 'Just another day in a desert wasteland alien prison colony barter town.',
        effect: 'No Event.',
      };
    case 9:
      return {
        title: 'Lucky Find',
        lore: 'One of the market stalls is selling a rare and precious item discovered out in the desert dunes.',
        effect:
          'Draw a World card and an Artifact from that World. You may purchase this Item for $100 + its listed Gold Value.',
      };
    case 10:
      return {
        title: 'Starving Refugees',
        lore: 'The back alleys and doorways are crowded with huddled refugees; diseased and hungry.',
        effect:
          'You may give supplies or Gold to these refugees. Discard 1 Side Bag Token or $100. If you do, Recover a Grit and remove 1 Corruption Point.',
      };
    case 11:
      return {
        title: 'Tattoo Parlor',
        lore: 'Smoke and screams pour out the open doorway of a seedy looking alien tattoo parlor.',
        effect:
          'You may get one Wasteland Tattoo here at the cost of $250 × the number of Tattoos you already have (so the first Tattoo is free). Each Wasteland Tattoo gives you — Once per Adventure, Recover a Grit.',
      };
    case 12:
      return {
        title: 'Slave Auction',
        lore: 'An alien slave auction is running in the market square, with a row of chained and filthy looking prisoners up for sale.',
        effect:
          'You may pay to free one of the alien slaves for 2D6 × $100. If you do, you may either release them of any life debt, gaining +1 Corruption Resistance, or take them on as an alien Ally.',
      };
    default:
      return {
        title: 'Dusty Streets and Dirty Looks',
        lore: 'Just another day in a desert wasteland alien prison colony barter town.',
        effect: 'No Event.',
      };
  }
}

// ---------- mechanics (Resolve) ----------
export async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId?.();
  if (!id) return { log: [] };

  const info = display(roll);
  const log = [];

  log.push(`[Desert Marketplace] (${roll}) ${info.title} — ${info.lore}`);
  log.push(`Effect: ${info.effect}`);

  // 2: Alien Assassin — Luck 5+ to escape, else Injury Table (D6+1)
  if (roll === 2) {
    const lore2 = `ALIEN ASSASSIN\n${info.lore}`;
    const result = await ctx.doSkillCheck(id, {
      stat: 'Luck',
      target: 5,
      returnDetails: true,
      message: `${lore2}\nYou struggle to break free from the assassin's grip!`,
    });
    const checkLine = formatCheckResult(result, 'Luck', 5);
    if (checkLine) log.push(checkLine);
    const passed = result?.passed ?? result;
    if (passed) {
      const outcome =
        'You wrench free and escape into the crowded marketplace! The assassin vanishes into the shadows.';
      log.push(outcome);
      await showResult(ctx, 'ALIEN ASSASSIN — Result', [
        checkLine,
        '',
        outcome,
      ]);
      ctx.toast?.('Alien Assassin: escaped!');
    } else {
      const injRoll = await ctxD6(ctx, 'Alien Assassin — Roll D6+1 for Injury Table');
      const injValue = injRoll + 1;
      const injLine = `Rolled [${injRoll}] + 1 = ${injValue} on the Injury Table.`;
      log.push(injLine);
      const outcome = `The assassin's blade finds its mark! Roll on the Injury Table with D6+1 (${injValue}).`;
      log.push(outcome);
      await showResult(ctx, 'ALIEN ASSASSIN — Result', [
        checkLine,
        injLine,
        '',
        outcome,
      ]);
      ctx.toast?.(`Alien Assassin: Injury Table roll ${injValue}.`);
      await ctx.enqueueChartRoll?.(id, 'injury');
    }
    return { log };
  }

  // 3: Down a Dark Alley — Choose 1 Item or Side Bag Token to discard
  if (roll === 3) {
    const outcome =
      'The little thief disappears into the crowd. Choose 1 Item or Side Bag Token to discard — stolen by the street urchin.';
    log.push(outcome);
    await showResult(ctx, 'DOWN A DARK ALLEY — Result', [outcome]);
    ctx.toast?.('Down a Dark Alley: discard 1 Item or Side Bag Token.');
    return { log };
  }

  // 4: Market Chase — Agility 4+ OR Cunning 5+
  if (roll === 4) {
    const lore4 = `MARKET CHASE\n${info.lore}`;
    const testChoice = await ctx.promptChoice?.(
      `MARKET CHASE\n${info.lore}\n\nThe thugs close in! Choose how to escape:`,
      [
        { label: 'Outrun them (Agility 4+ test)' },
        { label: 'Outwit them (Cunning 5+ test)' },
      ]
    );
    let result;
    let checkLine;
    if (testChoice === 0) {
      result = await ctx.doSkillCheck(id, {
        stat: 'Agility',
        target: 4,
        returnDetails: true,
        message: `${lore4}\nYou sprint through the market stalls, dodging alien merchants and overturning carts!`,
      });
      checkLine = formatCheckResult(result, 'Agility', 4);
    } else {
      result = await ctx.doSkillCheck(id, {
        stat: 'Cunning',
        target: 5,
        returnDetails: true,
        message: `${lore4}\nYou duck behind a stall and try to outwit the thugs, taking cover until they pass!`,
      });
      checkLine = formatCheckResult(result, 'Cunning', 5);
    }
    if (checkLine) log.push(checkLine);
    const passed = result?.passed ?? result;
    if (passed) {
      ctx.updateHero?.(id, (h) => ({ ...h, xp: (h.xp || 0) + 25 }));
      const outcome =
        'You lose the thugs in the winding market streets! Gain 25 XP.';
      log.push(outcome);
      await showResult(ctx, 'MARKET CHASE — Result', [
        checkLine,
        '',
        outcome,
      ]);
      ctx.toast?.('Market Chase: escaped! +25 XP.');
    } else {
      const woundRoll1 = await ctxD6(ctx, 'Market Chase — Roll first D6 for Wounds');
      const woundRoll2 = await ctxD6(ctx, 'Market Chase — Roll second D6 for Wounds');
      const totalWounds = woundRoll1 + woundRoll2;
      const woundLine = `Rolled [${woundRoll1}, ${woundRoll2}] = ${totalWounds} Wounds (ignoring Defense).`;
      log.push(woundLine);
      ctx.updateHero?.(id, (h) => ({
        ...h,
        currentHealth: Math.max(
          0,
          (h.currentHealth ?? h.health ?? h.maxHealth ?? 10) - totalWounds
        ),
      }));
      const outcome = `The thugs catch you and rough you up! Take ${totalWounds} Wounds (ignoring Defense). Your Location Visit is over.`;
      log.push(outcome);
      await showResult(ctx, 'MARKET CHASE — Result', [
        checkLine,
        woundLine,
        '',
        outcome,
      ]);
      ctx.toast?.(
        `Market Chase: ${totalWounds} Wounds. Visit over.`
      );
    }
    return { log };
  }

  // 5: Street Brawl — D6 Hits, each doing 2 Wounds
  if (roll === 5) {
    const hitRoll = await ctxD6(ctx, 'Street Brawl — Roll D6 for number of Hits');
    const totalWounds = hitRoll * 2;
    const hitLine = `Rolled [${hitRoll}] Hits × 2 Wounds each = ${totalWounds} Wounds total.`;
    log.push(hitLine);
    ctx.updateHero?.(id, (h) => ({
      ...h,
      currentHealth: Math.max(
        0,
        (h.currentHealth ?? h.health ?? h.maxHealth ?? 10) - totalWounds
      ),
    }));
    const outcome = `The brawl sweeps over you! ${hitRoll} Hits at 2 Wounds each = ${totalWounds} Wounds total.`;
    log.push(outcome);
    await showResult(ctx, 'STREET BRAWL — Result', [hitLine, '', outcome]);
    ctx.toast?.(`Street Brawl: ${hitRoll} Hits, ${totalWounds} Wounds.`);
    return { log };
  }

  // 6-8: Dusty Streets and Dirty Looks — No Event
  if (roll >= 6 && roll <= 8) {
    const outcome = 'Just another day in a desert wasteland alien prison colony barter town. No Event.';
    log.push(outcome);
    await showResult(ctx, 'DUSTY STREETS AND DIRTY LOOKS — Result', [outcome]);
    ctx.toast?.('No Event.');
    return { log };
  }

  // 9: Lucky Find — Draw World card + Artifact, purchase for $100 + Gold Value
  if (roll === 9) {
    const outcome =
      'One of the market stalls is selling a rare and precious item discovered out in the desert dunes. Draw a World card and an Artifact from that World. You may purchase this Item for $100 + its listed Gold Value.';
    log.push(outcome);
    await showResult(ctx, 'LUCKY FIND — Result', [outcome]);
    ctx.toast?.('Lucky Find: draw a World card + Artifact to purchase.');
    return { log };
  }

  // 10: Starving Refugees — Donate to recover Grit + remove Corruption
  if (roll === 10) {
    const choice = await ctx.promptChoice?.(
      `STARVING REFUGEES\n${info.lore}\n\nYou may give supplies or Gold to help the refugees. What do you do?`,
      [
        { label: 'Give $100' },
        { label: 'Discard 1 Side Bag Token' },
        { label: 'Walk on by (do nothing)' },
      ]
    );
    if (choice === 0) {
      const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? null;
      const heroGold = Number(hero?.gold ?? 0);
      if (heroGold < 100) {
        const outcome = "You don't have enough Gold ($100 needed).";
        log.push(outcome);
        await showResult(ctx, 'STARVING REFUGEES — Result', [outcome]);
        ctx.toast?.('Not enough Gold.');
        return { log };
      }
      ctx.updateHero?.(id, (h) => {
        const maxGrit = Number(h.maxGrit ?? h.stats?.Grit ?? 2);
        const curGrit = Number(h.currentGrit ?? h.grit ?? 0);
        const nextGrit = Math.min(maxGrit, curGrit + 1);
        const corruption = Math.max(0, (h.corruption ?? 0) - 1);
        return {
          ...h,
          gold: Math.max(0, (h.gold || 0) - 100),
          currentGrit: nextGrit,
          corruption,
        };
      });
      const outcome =
        'You give $100 to help the starving refugees. Recover 1 Grit and remove 1 Corruption Point.';
      log.push(outcome);
      await showResult(ctx, 'STARVING REFUGEES — Result', [outcome]);
      ctx.toast?.('Starving Refugees: -$100, +1 Grit, -1 Corruption.');
    } else if (choice === 1) {
      ctx.updateHero?.(id, (h) => {
        const maxGrit = Number(h.maxGrit ?? h.stats?.Grit ?? 2);
        const curGrit = Number(h.currentGrit ?? h.grit ?? 0);
        const nextGrit = Math.min(maxGrit, curGrit + 1);
        const corruption = Math.max(0, (h.corruption ?? 0) - 1);
        return { ...h, currentGrit: nextGrit, corruption };
      });
      const outcome =
        'You give a Side Bag Token to help the starving refugees. Discard 1 Side Bag Token. Recover 1 Grit and remove 1 Corruption Point.';
      log.push(outcome);
      await showResult(ctx, 'STARVING REFUGEES — Result', [outcome]);
      ctx.toast?.('Starving Refugees: discard token, +1 Grit, -1 Corruption.');
    } else {
      const outcome =
        'You walk past the refugees. Their desperate eyes follow you.';
      log.push(outcome);
      await showResult(ctx, 'STARVING REFUGEES — Result', [outcome]);
    }
    return { log };
  }

  // 11: Tattoo Parlor — Buy Wasteland Tattoo ($250 × existing count)
  if (roll === 11) {
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? null;
    const tattooCount = Number(hero?.wastelandTattoos ?? 0);
    const cost = 250 * tattooCount;
    const costLabel = cost === 0 ? 'free' : `$${cost}`;

    const choice = await ctx.promptChoice?.(
      `TATTOO PARLOR\n${info.lore}\n\nYou currently have ${tattooCount} Wasteland Tattoo${tattooCount !== 1 ? 's' : ''}.\nCost for next tattoo: ${costLabel} ($250 × ${tattooCount} existing).\n\nEach Wasteland Tattoo gives you — Once per Adventure, Recover a Grit.`,
      [
        { label: `Get a Wasteland Tattoo (${costLabel})` },
        { label: 'Pass on the tattoo' },
      ]
    );
    if (choice === 0) {
      const heroGold = Number(hero?.gold ?? 0);
      if (heroGold < cost) {
        const outcome = `You can't afford it ($${cost} needed, you have $${heroGold}).`;
        log.push(outcome);
        await showResult(ctx, 'TATTOO PARLOR — Result', [outcome]);
        ctx.toast?.('Not enough Gold for the tattoo.');
        return { log };
      }
      ctx.updateHero?.(id, (h) => ({
        ...h,
        gold: Math.max(0, (h.gold || 0) - cost),
        wastelandTattoos: (h.wastelandTattoos ?? 0) + 1,
      }));
      const outcome = `You endure the pain and receive a Wasteland Tattoo! ${cost > 0 ? `-$${cost}. ` : ''}You now have ${tattooCount + 1} Wasteland Tattoo${tattooCount + 1 !== 1 ? 's' : ''}. Each gives you — Once per Adventure, Recover a Grit.`;
      log.push(outcome);
      await showResult(ctx, 'TATTOO PARLOR — Result', [outcome]);
      ctx.toast?.(`Wasteland Tattoo acquired! ${cost > 0 ? `-$${cost}` : 'Free!'}`);
    } else {
      const outcome = 'You decide to pass on the tattoo and walk away.';
      log.push(outcome);
      await showResult(ctx, 'TATTOO PARLOR — Result', [outcome]);
    }
    return { log };
  }

  // 12: Slave Auction — Pay 2D6 × $100 to free a slave
  if (roll === 12) {
    const costRoll1 = await ctxD6(ctx, 'Slave Auction — Roll first D6 for cost');
    const costRoll2 = await ctxD6(ctx, 'Slave Auction — Roll second D6 for cost');
    const costTotal = (costRoll1 + costRoll2) * 100;
    const costLine = `Rolled [${costRoll1}, ${costRoll2}] × $100 = $${costTotal} to free a slave.`;
    log.push(costLine);

    const choice = await ctx.promptChoice?.(
      `SLAVE AUCTION\n${info.lore}\n\n${costLine}\n\nDo you want to pay $${costTotal} to free one of the alien slaves?`,
      [
        { label: `Pay $${costTotal} to free a slave` },
        { label: 'Walk away' },
      ]
    );

    if (choice === 0) {
      const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? null;
      const heroGold = Number(hero?.gold ?? 0);
      if (heroGold < costTotal) {
        const outcome = `You can't afford to free a slave ($${costTotal} needed, you have $${heroGold}).`;
        log.push(outcome);
        await showResult(ctx, 'SLAVE AUCTION — Result', [costLine, '', outcome]);
        ctx.toast?.('Not enough Gold.');
        return { log };
      }

      const releaseChoice = await ctx.promptChoice?.(
        `SLAVE AUCTION\nYou pay $${costTotal} and the shackles are removed. The freed slave looks up at you with gratitude. What do you do?`,
        [
          {
            label:
              'Release them — gain +1 Corruption Resistance',
          },
          {
            label:
              'Take them as an alien Ally (requires Allies Expansion)',
          },
        ]
      );

      ctx.updateHero?.(id, (h) => ({
        ...h,
        gold: Math.max(0, (h.gold || 0) - costTotal),
      }));

      if (releaseChoice === 0) {
        ctx.updateHero?.(id, (h) => ({
          ...h,
          corruptionResistance: (h.corruptionResistance ?? 0) + 1,
        }));
        const outcome = `You free the slave and release them of any life debt. -$${costTotal}. Gained +1 Corruption Resistance (you may hold 1 more Corruption before gaining a Mutation).`;
        log.push(outcome);
        await showResult(ctx, 'SLAVE AUCTION — Result', [
          costLine,
          '',
          outcome,
        ]);
        ctx.toast?.(
          `Slave freed! -$${costTotal}, +1 Corruption Resistance.`
        );
      } else {
        const outcome = `You free the slave and take them on as an alien Ally. -$${costTotal}. Use as a Henchman Ally with keyword Alien, 2× base Health. They never charge Grit Cost to Hire (but must still be Revived if killed).`;
        log.push(outcome);
        await showResult(ctx, 'SLAVE AUCTION — Result', [
          costLine,
          '',
          outcome,
        ]);
        ctx.toast?.(`Alien Ally gained! -$${costTotal}.`);
      }
    } else {
      const outcome =
        'You turn away from the auction. The cries of the prisoners echo behind you.';
      log.push(outcome);
      await showResult(ctx, 'SLAVE AUCTION — Result', [outcome]);
    }
    return { log };
  }

  return { log };
}

// --------- Dispatcher compatible with locationEventsEngine ---------------
export async function handleDesertMarketplaceEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? (_d6() + _d6());
  const result = await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: result?.log || [`Desert Marketplace Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

export const desertMarketplaceHandler = { display, apply };
export default desertMarketplaceHandler;
