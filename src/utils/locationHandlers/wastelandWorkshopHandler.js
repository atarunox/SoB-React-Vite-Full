// src/utils/locationHandlers/wastelandWorkshopHandler.js

import { d6 as _d6, d3 as _d3 } from '../../utils/diceHelpers';
import { loadTownState, saveTownState } from '../../utils/townState';
import { drawWorldCardAndArtifact, offerArtifactForSale } from './worldCardDraw.js';

// Use ctx.d6/ctx.d3 when available (respects manual roll mode); fallback to auto-roll
const ctxD6 = async (ctx, label) => (typeof ctx?.d6 === 'function') ? ctx.d6(label) : _d6();
const ctxD3 = async (ctx, label) => (typeof ctx?.d3 === 'function') ? ctx.d3(label) : _d3();

const shopId = 'wastelandWorkshop';

// ---------- townState helpers ----------
function patchTownState(patch) {
  const s = loadTownState() || {};
  saveTownState({ ...s, ...patch });
}

function patchShopMods(patch) {
  const s = loadTownState() || {};
  const cur = s.shopMods?.[shopId] || {};
  const next = { ...cur, ...patch };
  const updated = { ...s, shopMods: { ...(s.shopMods || {}), [shopId]: next } };
  saveTownState(updated);
}

// ---------- result formatting helper ----------
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

// ---------- display (title / lore / effect) ----------
export function display(roll) {
  switch (roll) {
    case 2:
      return {
        title: 'Boiler Overload',
        lore: 'Steam erupts in a massive, scalding cloud and bolts are shot like bullets out of the bursting boiler! Ruuuunnn!!! Every Hero at this Location must make a Luck 5+ test to get out before the boiler explodes!',
        effect: 'If successful, gain 15 XP. If failed, you are caught in the blast and burned severely! Roll once on the Injury Table using a D6+3 (instead of the normal 2D6). After all Heroes here have made this test, the Wasteland Workshop is destroyed and may not be visited for the rest of this Town Stay.',
      };
    case 3:
      return {
        title: 'Rampaging Robot',
        lore: "One of the Junksmith's latest creations is running amok in the workshop! Every Hero at this Location must make an Agility 5+ test to avoid getting knocked around by the crazed machine!",
        effect: 'If successful, gain 15 XP. If failed, take D6 Hits that do 2 Damage each (as normal, this damage carries over to the next Adventure).',
      };
    case 4:
      return {
        title: 'Broken Torch',
        lore: "The Junksmith's welding torch is on the fritz again.",
        effect: 'Items and Upgrades that include 1 or more Scrap as part of their cost may not be purchased here today.',
      };
    case 5:
      return {
        title: 'Over a Barrel',
        lore: 'Looking you up and down, the Junksmith sees you as rich travelers, ready to be taken for a ride.',
        effect: 'All purchases made at the Wasteland Workshop today cost an extra +$50 x your Hero Level, in addition to the normal cost.',
      };
    case 6:
    case 7:
    case 8:
      return {
        title: 'The Smell of Burning Oil',
        lore: 'Warms the heart and burns the nostrils.',
        effect: 'No Event.',
      };
    case 9:
      return {
        title: 'Junk Shortage',
        lore: 'No one has been able to bring back much usable scrap due to all of the raiders in the area lately.',
        effect: 'All Scrap and Tech Tokens sold here today are worth an extra $25 each for Scrap and $100 each for Tech.',
      };
    case 10:
      return {
        title: 'Cargo Crate',
        lore: 'A group of scavengers have brought back a beaten crate, pulled from the wreckage of a crashed ship.',
        effect: 'You may pay D6 x $100 to purchase and open the crate! If you do, roll 2D6 (no Grit). If the roll is 5 or higher, collect Scrap Tokens equal to the roll. If the roll is doubles, you may also collect Tech Tokens equal to the double number rolled or draw a World card and an Artifact from that World. If the roll is less than 5, the crate is empty.',
      };
    case 11:
      return {
        title: 'Lend a Hand',
        lore: 'Feeling a bit overwhelmed by the demands of one of the local Warlords, the Junksmith could use a hand.',
        effect: "You may give up the rest of your day's Location Visit here to work in the shop, gaining D6 x $50 and Recovering 1 Grit.",
      };
    case 12:
      return {
        title: 'One of a Kind',
        lore: 'The Junksmith has been tinkering with a new idea and wants to test it out on you.',
        effect: 'You may choose any Item you have with an open Upgrade Slot and roll a D6. On the roll of 5 or 6, that Item gains a unique Upgrade (filling 1 Slot) granting +1 to a Random Skill (Roll D6: 1-Agility, 2-Cunning, 3-Spirit, 4-Strength, 5-Lore, 6-Luck). You must give this Item a name.',
      };
    default:
      return { title: 'Wasteland Workshop', lore: '', effect: 'No Event.' };
  }
}

// ---------- mechanics (Resolve) ----------
export async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId?.();
  if (!id) return { log: [] };

  const info = display(roll);
  const log = [];

  // Every event starts with its title and lore/flavor text
  log.push(`[Wasteland Workshop] (${roll}) ${info.title} — ${info.lore}`);
  log.push(`Effect: ${info.effect}`);

  // 2: Boiler Overload — Luck 5+ or Injury Table D6+3; Workshop destroyed
  if (roll === 2) {
    const lore2 = `BOILER OVERLOAD\n${info.lore}`;
    const heroIds = ctx.getHeroesAtShop?.(shopId) || [id];
    const lines = [];

    for (const hid of heroIds) {
      const hero = (ctx.getHeroById ?? ctx.getHero)?.(hid);
      const heroName = hero?.name || 'Hero';

      const result = await ctx.doSkillCheck(hid, {
        stat: 'Luck', target: 5, returnDetails: true,
        message: `${lore2}\n${heroName} must make a Luck 5+ test to escape the exploding boiler!`,
      });
      const checkLine = formatCheckResult(result, 'Luck', 5);
      if (checkLine) {
        log.push(`${heroName}: ${checkLine}`);
        lines.push(`${heroName}: ${checkLine}`);
      }

      const passed = result?.passed ?? result;
      if (passed) {
        ctx.updateHero?.(hid, (h) => ({ ...h, xp: (h.xp || 0) + 15 }));
        const outcome = `${heroName} escapes the blast! +15 XP.`;
        log.push(outcome);
        lines.push(outcome);
      } else {
        // Roll D6+3 on the Injury Table
        const injRoll = await ctxD6(ctx, `Boiler Overload — ${heroName} rolls D6 for Injury Table (will add +3)`);
        const injTotal = injRoll + 3;
        const injLine = `${heroName}: Rolled [${injRoll}] + 3 = ${injTotal} on the Injury Table.`;
        log.push(injLine);
        lines.push(injLine);
        lines.push(`${heroName} is caught in the blast and burned severely!`);
        await ctx.enqueueChartRoll?.(hid, 'injury');
      }
    }

    // Destroy the Wasteland Workshop
    const ts = loadTownState() || {};
    const destroyed = new Set(ts.destroyedLocations || []);
    destroyed.add(shopId);
    saveTownState({ ...ts, destroyedLocations: Array.from(destroyed) });
    const destroyLine = 'The Wasteland Workshop is destroyed and may not be visited for the rest of this Town Stay.';
    log.push(destroyLine);
    lines.push('', destroyLine);

    await showResult(ctx, 'BOILER OVERLOAD — Result', lines);
    ctx.toast?.('Boiler Overload! Wasteland Workshop destroyed!');
    return { log };
  }

  // 3: Rampaging Robot — Agility 5+ or D6 Hits x 2 Damage each
  if (roll === 3) {
    const lore3 = `RAMPAGING ROBOT\n${info.lore}`;
    const heroIds = ctx.getHeroesAtShop?.(shopId) || [id];
    const lines = [];

    for (const hid of heroIds) {
      const hero = (ctx.getHeroById ?? ctx.getHero)?.(hid);
      const heroName = hero?.name || 'Hero';

      const result = await ctx.doSkillCheck(hid, {
        stat: 'Agility', target: 5, returnDetails: true,
        message: `${lore3}\n${heroName} must dodge the crazed machine!`,
      });
      const checkLine = formatCheckResult(result, 'Agility', 5);
      if (checkLine) {
        log.push(`${heroName}: ${checkLine}`);
        lines.push(`${heroName}: ${checkLine}`);
      }

      const passed = result?.passed ?? result;
      if (passed) {
        ctx.updateHero?.(hid, (h) => ({ ...h, xp: (h.xp || 0) + 15 }));
        const outcome = `${heroName} dodges the robot! +15 XP.`;
        log.push(outcome);
        lines.push(outcome);
      } else {
        const hitRoll = await ctxD6(ctx, `Rampaging Robot — ${heroName} rolls D6 for number of Hits (2 Damage each)`);
        const totalDmg = hitRoll * 2;
        const hitLine = `${heroName}: Rolled [${hitRoll}] Hits × 2 Damage each = ${totalDmg} total Damage.`;
        log.push(hitLine);
        lines.push(hitLine);

        ctx.updateHero?.(hid, (h) => ({
          ...h,
          currentHealth: Math.max(0, (h.currentHealth ?? h.health ?? h.maxHealth ?? 10) - totalDmg),
        }));
        lines.push(`${heroName} is battered by the rampaging robot! This damage carries over to the next Adventure.`);
      }
    }

    await showResult(ctx, 'RAMPAGING ROBOT — Result', lines);
    ctx.toast?.('Rampaging Robot!');
    return { log };
  }

  // 4: Broken Torch — No Scrap-cost items today
  if (roll === 4) {
    const ts = loadTownState() || {};
    const flags = { ...(ts.wastelandWorkshopFlags || {}) };
    flags.brokenTorch = true;
    saveTownState({ ...ts, wastelandWorkshopFlags: flags });

    const outcome = "The Junksmith's welding torch is on the fritz again. Items and Upgrades that include 1 or more Scrap as part of their cost may not be purchased here today.";
    log.push(outcome);
    await showResult(ctx, 'BROKEN TORCH — Result', [outcome]);
    ctx.toast?.('Broken Torch: No Scrap-cost items available today.');
    return { log };
  }

  // 5: Over a Barrel — All purchases cost extra +$50 x Hero Level
  if (roll === 5) {
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id);
    const heroLevel = Number(hero?.level ?? hero?.heroLevel ?? 1);
    const surcharge = 50 * heroLevel;

    const ts = loadTownState() || {};
    const flags = { ...(ts.wastelandWorkshopFlags || {}) };
    flags.overABarrelSurcharge = surcharge;
    saveTownState({ ...ts, wastelandWorkshopFlags: flags });

    const outcome = `The Junksmith is charging a premium today. All purchases at the Wasteland Workshop cost an extra +$${surcharge} ($50 × Hero Level ${heroLevel}).`;
    log.push(outcome);
    await showResult(ctx, 'OVER A BARREL — Result', [outcome]);
    ctx.toast?.(`Over a Barrel: +$${surcharge} surcharge on all purchases.`);
    return { log };
  }

  // 6-8: The Smell of Burning Oil — No Event
  if (roll === 6 || roll === 7 || roll === 8) {
    const outcome = 'Warms the heart and burns the nostrils. No Event.';
    log.push(outcome);
    await showResult(ctx, 'THE SMELL OF BURNING OIL — Result', [outcome]);
    ctx.toast?.('No Event.');
    return { log };
  }

  // 9: Junk Shortage — Scrap +$25, Tech +$100 when sold
  if (roll === 9) {
    const ts = loadTownState() || {};
    const flags = { ...(ts.wastelandWorkshopFlags || {}) };
    flags.junkShortage = true;
    flags.scrapBonusSell = 25;
    flags.techBonusSell = 100;
    saveTownState({ ...ts, wastelandWorkshopFlags: flags });

    const outcome = 'Due to raiders in the area, usable scrap is scarce. All Scrap Tokens sold here today are worth an extra $25 each, and Tech Tokens are worth an extra $100 each.';
    log.push(outcome);
    await showResult(ctx, 'JUNK SHORTAGE — Result', [outcome]);
    ctx.toast?.('Junk Shortage: Scrap +$25 and Tech +$100 when sold today!');
    return { log };
  }

  // 10: Cargo Crate — Pay D6 x $100, then roll 2D6
  if (roll === 10) {
    const costRoll = await ctxD6(ctx, 'Cargo Crate — Roll D6 for cost (×$100)');
    const cost = costRoll * 100;
    const costLine = `The crate costs D6 × $100: Rolled [${costRoll}] = $${cost}.`;
    log.push(costLine);

    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id);
    const heroGold = Number(hero?.gold ?? 0);

    const buyChoice = await ctx.promptChoice?.(
      `CARGO CRATE\n${info.lore}\n\n${costLine}\n\nYou have $${heroGold}. Purchase and open the crate?`,
      [
        { label: `Yes — Pay $${cost} and open the crate` },
        { label: 'No — Pass on the crate' },
      ]
    );

    if (buyChoice === 1) {
      const outcome = 'You decide to pass on the crate. Maybe next time.';
      log.push(outcome);
      await showResult(ctx, 'CARGO CRATE — Result', [outcome]);
      ctx.toast?.('Passed on the Cargo Crate.');
      return { log };
    }

    // Pay the cost
    ctx.updateHero?.(id, (h) => ({ ...h, gold: Math.max(0, (h.gold || 0) - cost) }));
    log.push(`Paid $${cost} for the crate.`);

    // Roll 2D6 (no Grit)
    const d1 = await ctxD6(ctx, 'Cargo Crate — Roll first D6 (2D6 crate roll)');
    const d2 = await ctxD6(ctx, 'Cargo Crate — Roll second D6 (2D6 crate roll)');
    const crateTotal = d1 + d2;
    const isDoubles = d1 === d2;
    const crateLine = `Rolled [${d1}, ${d2}] = ${crateTotal}${isDoubles ? ' (DOUBLES!)' : ''}.`;
    log.push(crateLine);

    const resultLines = [costLine, `Paid $${cost}.`, crateLine, ''];

    if (crateTotal >= 5) {
      // Add Scrap Tokens equal to the roll
      for (let i = 0; i < crateTotal; i++) {
        await ctx.addToken?.(id, 'Scrap');
      }
      const scrapLine = `Collect ${crateTotal} Scrap Tokens!`;
      log.push(scrapLine);
      resultLines.push(scrapLine);

      if (isDoubles) {
        const doublesChoice = await ctx.promptChoice?.(
          `CARGO CRATE — Doubles!\n\nYou rolled doubles (${d1}+${d2})! Choose your bonus:`,
          [
            { label: `Collect ${d1} Tech Tokens` },
            { label: 'Draw a World card and an Artifact from that World' },
          ]
        );
        if (doublesChoice === 0) {
          // Add Tech Tokens equal to the double number
          for (let i = 0; i < d1; i++) {
            await ctx.addToken?.(id, 'Tech');
          }
          const techLine = `Also collect ${d1} Tech Tokens from the doubles!`;
          log.push(techLine);
          resultLines.push(techLine);
        } else {
          // Draw a World card and Artifact, offer for sale
          const draw = drawWorldCardAndArtifact();
          const worldName = draw.worldName || 'Unknown World';
          const artifact = draw.artifact;

          const worldLine = `World Card drawn: ${worldName}`;
          log.push(worldLine);
          resultLines.push(worldLine);

          if (!artifact) {
            const fallback = `No Artifacts found for ${worldName} in data. Draw the Artifact manually.`;
            log.push(fallback);
            resultLines.push(fallback);
          } else {
            const artLine = `Artifact drawn: ${artifact.name} (${worldName})`;
            log.push(artLine);
            resultLines.push(artLine);

            // Show the crate results so far, then offer artifact
            await showResult(ctx, 'CARGO CRATE — Result', resultLines);

            const listPrice = Number(artifact.value) || 0;
            const saleResult = await offerArtifactForSale(ctx, artifact, {
              price: listPrice > 0 ? listPrice : 0,
              acquiredFrom: `Cargo Crate (Wasteland Workshop) — ${worldName}`,
              title: 'CARGO CRATE — Artifact',
              worldName,
              patchShopMods: (patch) => patchShopMods(patch),
              shopModKey: 'artifactForSale',
            });
            log.push(...saleResult.log);
            ctx.toast?.(crateTotal >= 5 ? `Cargo Crate: ${crateTotal} Scrap + ${artifact.name}!` : `Cargo Crate: ${artifact.name}!`);
            return { log };
          }
        }
      }
    } else {
      const emptyLine = 'The crate is empty. Nothing of value inside.';
      log.push(emptyLine);
      resultLines.push(emptyLine);
    }

    await showResult(ctx, 'CARGO CRATE — Result', resultLines);
    ctx.toast?.(crateTotal >= 5 ? `Cargo Crate: ${crateTotal} Scrap Tokens!` : 'Cargo Crate: Empty!');
    return { log };
  }

  // 11: Lend a Hand — Give up rest of visit for D6 x $50 and Recover 1 Grit
  if (roll === 11) {
    const choice = await ctx.promptChoice?.(
      `LEND A HAND\n${info.lore}\n\nGive up the rest of your Location Visit to help the Junksmith?`,
      [
        { label: 'Yes — Help out in the shop' },
        { label: 'No — Decline' },
      ]
    );

    if (choice === 1) {
      const outcome = 'You politely decline the Junksmith\'s request.';
      log.push(outcome);
      await showResult(ctx, 'LEND A HAND — Result', [outcome]);
      ctx.toast?.('Declined to help.');
      return { log };
    }

    const payRoll = await ctxD6(ctx, 'Lend a Hand — Roll D6 for gold earned (×$50)');
    const goldGained = payRoll * 50;
    const payLine = `Rolled [${payRoll}] × $50 = $${goldGained} earned.`;
    log.push(payLine);

    ctx.updateHero?.(id, (h) => {
      const maxGrit = Number(h.maxGrit ?? h.stats?.Grit ?? 2);
      const curGrit = Number(h.currentGrit ?? h.grit ?? 0);
      const nextGrit = Math.min(maxGrit, curGrit + 1);
      return {
        ...h,
        gold: (h.gold || 0) + goldGained,
        currentGrit: nextGrit,
        isDone: true,
      };
    });

    const outcome = `You spend the rest of the day helping the Junksmith. Gain $${goldGained} and Recover 1 Grit. Your visit ends.`;
    log.push(outcome);
    await showResult(ctx, 'LEND A HAND — Result', [payLine, '', outcome]);
    ctx.toast?.(`Lend a Hand: +$${goldGained}, +1 Grit. Visit ends.`);
    return { log };
  }

  // 12: One of a Kind — Choose an Item, roll D6, on 5-6 gain unique Upgrade
  if (roll === 12) {
    const SKILL_MAP = { 1: 'Agility', 2: 'Cunning', 3: 'Spirit', 4: 'Strength', 5: 'Lore', 6: 'Luck' };

    const proceed = await ctx.promptChoice?.(
      `ONE OF A KIND\n${info.lore}\n\nDo you have an Item with an open Upgrade Slot to try this on?`,
      [
        { label: 'Yes — Choose an Item and roll' },
        { label: 'No — I don\'t have a suitable Item' },
      ]
    );

    if (proceed === 1) {
      const outcome = 'You have no suitable Item for the Junksmith\'s tinkering.';
      log.push(outcome);
      await showResult(ctx, 'ONE OF A KIND — Result', [outcome]);
      ctx.toast?.('No suitable Item available.');
      return { log };
    }

    const upgradeRoll = await ctxD6(ctx, 'One of a Kind — Roll D6 (need 5 or 6 for unique Upgrade)');
    const upgradeLine = `Rolled [${upgradeRoll}] for the upgrade attempt.`;
    log.push(upgradeLine);

    if (upgradeRoll >= 5) {
      const skillRoll = await ctxD6(ctx, 'One of a Kind — Roll D6 for Random Skill (1-Agi, 2-Cun, 3-Spi, 4-Str, 5-Lor, 6-Luc)');
      const skill = SKILL_MAP[skillRoll] || 'Luck';
      const skillLine = `Rolled [${skillRoll}] for skill: +1 ${skill}.`;
      log.push(skillLine);

      const outcome = `Success! The Item gains a unique Upgrade: +1 ${skill}. You must give this Item a name (and optionally a reasoning for the modification).`;
      log.push(outcome);
      await showResult(ctx, 'ONE OF A KIND — Result', [upgradeLine, skillLine, '', outcome]);
      ctx.toast?.(`One of a Kind: +1 ${skill} Upgrade!`);
    } else {
      const outcome = `The Junksmith tinkers with the Item, but the modification doesn't quite work out. No Upgrade gained.`;
      log.push(outcome);
      await showResult(ctx, 'ONE OF A KIND — Result', [upgradeLine, '', outcome]);
      ctx.toast?.('One of a Kind: Upgrade attempt failed.');
    }
    return { log };
  }

  return { log };
}

// --------- Dispatcher compatible with locationEventsEngine ---------------
export async function handleWastelandWorkshopEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? (_d6() + _d6());
  const result = await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: result?.log || [`Wasteland Workshop Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

export const wastelandWorkshopHandler = { display, apply };
export default wastelandWorkshopHandler;
