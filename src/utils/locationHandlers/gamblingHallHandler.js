// src/utils/locationHandlers/gamblingHallHandler.js
//
// Gambling Hall Location Events handler.
// Follows canonical handler conventions (see saloonHandler.js).
// Uses ctx.doSkillCheck, ctx.promptChoice, ctx.updateHero, ctx.toast.
//

import { loadTownState, saveTownState } from '../townState.js';
import { performGamblingHallHighStakes } from './gamblingHallServices.js';
import { d6 } from '../../utils/diceHelpers';

// ---------- gear / artifact collection helpers ----------
function isGearOrArtifact(it) {
  if (!it) return false;
  const t = String(it?.type || '').toLowerCase();
  const hasTag = Array.isArray(it?.tags) &&
    it.tags.some((tag) => /^(gear|artifact)/i.test(tag));
  return hasTag || t === 'gear' || t.startsWith('gear ') || t === 'artifact' || t.startsWith('artifact ');
}

function collectGearAndArtifacts(hero) {
  const results = [];

  // inventory items
  const inv = Array.isArray(hero?.inventory) ? hero.inventory : [];
  inv.forEach((it, idx) => {
    if (isGearOrArtifact(it)) {
      results.push({
        source: 'inventory', idx, it,
        label: `${it?.name || it?.id || 'Item'} (${String(it?.type || 'Gear')})`,
      });
    }
  });

  // equipped / gear slots
  const pushEquipped = (slotKey, it) => {
    if (!isGearOrArtifact(it)) return;
    results.push({
      source: 'slot', slot: slotKey, it,
      label: `${it?.name || it?.id || 'Item'} (equipped: ${slotKey})`,
    });
  };

  if (hero?.equipped && typeof hero.equipped === 'object') {
    Object.entries(hero.equipped).forEach(([k, it]) => pushEquipped(k, it));
  }
  if (hero?.gear && typeof hero.gear === 'object' && !Array.isArray(hero.gear)) {
    Object.entries(hero.gear).forEach(([k, it]) => pushEquipped(k, it));
  }
  if (hero?.gearSlots && typeof hero.gearSlots === 'object') {
    Object.entries(hero.gearSlots).forEach(([k, it]) => pushEquipped(k, it));
  }
  if (Array.isArray(hero?.slots)) {
    hero.slots.forEach((entry) => {
      const slotKey = entry?.slot || entry?.name || 'Slot';
      const it = entry?.item || entry?.equipped || null;
      pushEquipped(slotKey, it);
    });
  } else if (hero?.slots && typeof hero.slots === 'object') {
    Object.entries(hero.slots).forEach(([slotKey, maybe]) => {
      const it = maybe && typeof maybe === 'object' && 'item' in maybe ? maybe.item : maybe;
      pushEquipped(slotKey, it);
    });
  }

  return results;
}

function removeItemFromHero(ctx, heroId, picked) {
  ctx.updateHero?.(heroId, (h) => {
    const next = { ...h };
    if (picked.source === 'inventory') {
      const inv = Array.isArray(h.inventory) ? [...h.inventory] : [];
      inv.splice(picked.idx, 1);
      next.inventory = inv;
    } else if (picked.source === 'slot') {
      const slot = picked.slot;
      if (next.equipped?.[slot]) {
        next.equipped = { ...next.equipped };
        delete next.equipped[slot];
      } else if (next.gear?.[slot] && typeof next.gear === 'object' && !Array.isArray(next.gear)) {
        next.gear = { ...next.gear };
        delete next.gear[slot];
      } else if (next.gearSlots?.[slot]) {
        next.gearSlots = { ...next.gearSlots };
        delete next.gearSlots[slot];
      }
    }
    return next;
  });
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
        title: 'Assassination Attempt',
        lore: 'A rival has caught up to you and takes a shot while your back is turned.',
        effect:
          'Make a Cunning 5+ test to see it coming or a Lore 6+ test to dodge the fatal blow. If failed, roll once on the Injury Chart with only a single D6 (instead of the normal 2D6).',
      };
    case 3:
      return {
        title: '"I Say You\'re Cheatin\' Me!"',
        lore: 'The angry bandido sitting across from you throws back his chair and draws his pistol.',
        effect:
          'Make a Luck 4+ test to escape (ending your Location Visit and taking an extra Unwanted Attention marker), or try to get the jump on him by drawing your own weapon — roll a D6. If the roll is less than your Initiative (6 always fails), you drop him and collect your winnings of D6 × $50. If you fail at either option, he shoots you — roll once on the Injury Chart.',
      };
    case 4:
    case 5:
      return {
        title: '"Sorry Mister"',
        lore: 'A drunken patron bumps into you as they stumble toward the door. Patting your pocket as you turn around, you realize that something is missing!',
        effect: 'You must lose $200, 2 Dark Stone, or 1 Gear or Artifact.',
      };
    case 6:
    case 7:
    case 8:
      return {
        title: 'Laughter, Cheers, and Sadness',
        lore: 'Smoke fills the air and the cheering thrill of winners roars through the hall, while the empty despair of the drunk and down on their luck lingers in the shadows.',
        effect: 'No Event.',
      };
    case 9:
    case 10:
      return {
        title: "Everyone's a Winner",
        lore: "The Devil's Wheel strikes a jackpot and everyone cheers!",
        effect: 'Every Hero at the Gambling Hall immediately gains D6 × $25.',
      };
    case 11:
      return {
        title: 'Drinks and Cigars All Around',
        lore: 'A high roller spreads the wealth!',
        effect:
          'Every Hero at the Gambling Hall may immediately gain 1 Whiskey Token and 1 Fine Cigar Token for free.',
      };
    case 12:
      return {
        title: 'High Stakes Bet',
        lore: 'The gambler sitting across from you places his most prized possession on the table to cover his bet!',
        effect:
          'If you play Five Card Draw Poker during this Location Visit and win during the first game, you may also draw a World card and then an Artifact card from that World as an extra reward.',
      };
    default:
      return { title: 'Quiet Night', lore: '', effect: 'No Event.' };
  }
}

// ---------- helper: get heroes at Gambling Hall ----------
function getHeroesAtGamblingHall(ctx = {}) {
  // 1) Location-aware list
  if (ctx.getHeroesAtShop) {
    const list = ctx.getHeroesAtShop('gamblingHall') || ctx.getHeroesAtShop('gambling_hall') || [];
    if (list.length) {
      return list.map(hid => {
        if (typeof hid === 'object') return hid;
        return (ctx.getHeroById ?? ctx.getHero)?.(hid) ?? null;
      }).filter(Boolean);
    }
  }

  // 2) Active hero
  const id = ctx.getActiveHeroId?.();
  if (id) {
    const h = (ctx.getHeroById ?? ctx.getHero)?.(id);
    if (h) return [h];
  }

  return [];
}

// ---------- mechanics (apply) ----------
export async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId?.();
  if (!id) return { log: [] };

  const info = display(roll);
  const log = [];

  log.push(`[Gambling Hall] (${roll}) ${info.title} — ${info.lore}`);
  log.push(`Effect: ${info.effect}`);

  // 2: Assassination Attempt — Cunning 5+ OR Lore 6+
  if (roll === 2) {
    const lore2 = `ASSASSINATION ATTEMPT\n${info.lore}`;
    const testChoice = await ctx.promptChoice?.(
      `ASSASSINATION ATTEMPT\n${info.lore}\n\nChoose how to react:`,
      [
        { label: 'See it coming (Cunning 5+ test)' },
        { label: 'Dodge the fatal blow (Lore 6+ test)' },
      ]
    );
    let result;
    let checkLine;
    if (testChoice === 1) {
      result = await ctx.doSkillCheck(id, {
        stat: 'Lore', target: 6, returnDetails: true,
        message: `${lore2}\nYou try to dodge the fatal blow at the last second!`,
      });
      checkLine = formatCheckResult(result, 'Lore', 6);
    } else {
      result = await ctx.doSkillCheck(id, {
        stat: 'Cunning', target: 5, returnDetails: true,
        message: `${lore2}\nYou try to sense the danger before the shot rings out!`,
      });
      checkLine = formatCheckResult(result, 'Cunning', 5);
    }
    if (checkLine) log.push(checkLine);
    const passed = result?.passed ?? result;
    if (passed) {
      const outcome = 'Your instincts save your life! You dodge the shot just in time. No further effect.';
      log.push(outcome);
      await showResult(ctx, 'ASSASSINATION ATTEMPT — Result', [checkLine, '', outcome]);
      ctx.toast?.('Assassination Attempt avoided!');
    } else {
      const outcome = 'The shot catches you off guard! Roll once on the Injury Chart with only a single D6 (instead of the normal 2D6).';
      log.push(outcome);
      await showResult(ctx, 'ASSASSINATION ATTEMPT — Result', [checkLine, '', outcome]);
      ctx.toast?.('Hit! Roll on the Injury Chart (single D6).');
      await ctx.enqueueChartRoll?.(id, 'injury');
    }
    return { log };
  }

  // 3: "I Say You're Cheatin' Me!" — Luck 4+ to escape OR draw weapon (D6 vs Initiative)
  if (roll === 3) {
    const lore3 = `"I SAY YOU'RE CHEATIN' ME!"\n${info.lore}`;
    const pathChoice = await ctx.promptChoice?.(
      `"I SAY YOU'RE CHEATIN' ME!"\n${info.lore}\n\nThe bandido draws his pistol! Choose how to react:`,
      [
        { label: 'Try to escape (Luck 4+ test — ends Location Visit, +1 Unwanted Attention)' },
        { label: 'Draw your own weapon (D6 vs Initiative — drop him and collect D6 × $50)' },
      ]
    );

    if (pathChoice === 1) {
      // Draw weapon path: D6 vs Initiative (6 always fails)
      const hero = (ctx.getHeroById ?? ctx.getHero)?.(id);
      const initiative = Number(hero?.initiative ?? hero?.stats?.Initiative ?? 0);
      const rawRoll = await ctx.promptNumber?.(
        `Draw your weapon! Roll a D6 vs your Initiative (${initiative}).\n6 always fails.\n\nEnter your D6 roll:`,
        'initiativeRoll',
      );
      const weaponRoll = Math.max(1, Math.min(6, Number(rawRoll) || d6()));
      const weaponLine = `Rolled [${weaponRoll}] vs Initiative ${initiative} (6 always fails).`;
      log.push(weaponLine);

      if (weaponRoll < initiative && weaponRoll !== 6) {
        // Success: drop him and collect winnings
        const winDie = d6();
        const winnings = winDie * 50;
        const winLine = `Rolled [${winDie}] × $50 = $${winnings} in winnings!`;
        log.push(winLine);
        ctx.updateHero?.(id, (h) => ({ ...h, gold: (h.gold || 0) + winnings }));
        const outcome = `You get the jump on the bandido and drop him! You collect $${winnings} in winnings.`;
        log.push(outcome);
        await showResult(ctx, '"I SAY YOU\'RE CHEATIN\' ME!" — Result', [weaponLine, winLine, '', outcome]);
        ctx.toast?.(`Dropped the bandido! +$${winnings}.`);
      } else {
        // Failed: he shoots you
        const outcome = 'The bandido is faster! He shoots you before you can draw. Roll once on the Injury Chart.';
        log.push(outcome);
        await showResult(ctx, '"I SAY YOU\'RE CHEATIN\' ME!" — Result', [weaponLine, '', outcome]);
        ctx.toast?.('Shot by the bandido! Roll on the Injury Chart.');
        await ctx.enqueueChartRoll?.(id, 'injury');
      }
    } else {
      // Escape path: Luck 4+
      const result = await ctx.doSkillCheck(id, {
        stat: 'Luck', target: 4, returnDetails: true,
        message: `${lore3}\nHis first drunken shot hits the post behind you — time to run!`,
      });
      const checkLine = formatCheckResult(result, 'Luck', 4);
      if (checkLine) log.push(checkLine);
      const passed = result?.passed ?? result;

      if (passed) {
        // Escape: end visit + Unwanted Attention
        ctx.updateHero?.(id, (h) => ({
          ...h,
          isDone: true,
          unwantedAttention: (h.unwantedAttention || 0) + 1,
        }));
        const outcome = `The shot misses! You escape the Gambling Hall, but draw attention on the way out. +1 Unwanted Attention. Location Visit ends.`;
        log.push(outcome);
        await showResult(ctx, '"I SAY YOU\'RE CHEATIN\' ME!" — Result', [checkLine, '', outcome]);
        ctx.toast?.('Escaped! +1 Unwanted Attention. Visit ends.');
      } else {
        const outcome = 'You can\'t dodge in time — the bandido shoots you! Roll once on the Injury Chart.';
        log.push(outcome);
        await showResult(ctx, '"I SAY YOU\'RE CHEATIN\' ME!" — Result', [checkLine, '', outcome]);
        ctx.toast?.('Shot by the bandido! Roll on the Injury Chart.');
        await ctx.enqueueChartRoll?.(id, 'injury');
      }
    }
    return { log };
  }

  // 4-5: "Sorry Mister" — lose $200, 2 Dark Stone, or 1 Gear/Artifact
  if (roll === 4 || roll === 5) {
    const choice = await ctx.promptChoice?.(
      `"SORRY MISTER"\n${info.lore}\n\nYou must lose ONE of the following:`,
      [
        { label: 'Lose $200' },
        { label: 'Lose 2 Dark Stone' },
        { label: 'Lose 1 Gear or Artifact' },
      ]
    );

    if (choice === 0) {
      ctx.updateHero?.(id, (h) => ({ ...h, gold: Math.max(0, (h.gold || 0) - 200) }));
      const outcome = 'Your pocket has been picked! You lose $200.';
      log.push(outcome);
      await showResult(ctx, '"SORRY MISTER" — Result', [outcome]);
      ctx.toast?.('Pickpocketed! -$200.');
    } else if (choice === 1) {
      ctx.updateHero?.(id, (h) => ({ ...h, darkStone: Math.max(0, (h.darkStone || 0) - 2) }));
      const outcome = 'Your Dark Stone pouch feels lighter! You lose 2 Dark Stone.';
      log.push(outcome);
      await showResult(ctx, '"SORRY MISTER" — Result', [outcome]);
      ctx.toast?.('Pickpocketed! -2 Dark Stone.');
    } else {
      // Collect gear and artifact items from the hero
      const hero = (ctx.getHeroById ?? ctx.getHero)?.(id);
      const lossItems = collectGearAndArtifacts(hero);

      if (lossItems.length === 0) {
        const outcome = 'You have no Gear or Artifacts to lose! The thief finds nothing of value.';
        log.push(outcome);
        await showResult(ctx, '"SORRY MISTER" — Result', [outcome]);
        ctx.toast?.('No Gear or Artifacts to lose.');
      } else {
        const itemChoice = await ctx.promptChoice?.(
          `"SORRY MISTER"\n\nChoose a Gear or Artifact to lose:`,
          lossItems.map((it) => ({ label: it.label }))
        );
        const picked = lossItems[itemChoice ?? 0];
        if (picked) {
          removeItemFromHero(ctx, id, picked);
          const outcome = `Something is missing from your pack! You lost: ${picked.label}.`;
          log.push(outcome);
          await showResult(ctx, '"SORRY MISTER" — Result', [outcome]);
          ctx.toast?.(`Pickpocketed! Lost ${picked.label}.`);
        }
      }
    }
    return { log };
  }

  // 6-8: Laughter, Cheers, and Sadness — No Event
  if (roll >= 6 && roll <= 8) {
    const outcome = 'The usual buzz of the Gambling Hall. No event.';
    log.push(outcome);
    await showResult(ctx, 'LAUGHTER, CHEERS, AND SADNESS — Result', [outcome]);
    return { log };
  }

  // 9-10: Everyone's a Winner — Every hero at the Hall gains D6 × $25
  if (roll === 9 || roll === 10) {
    const heroes = getHeroesAtGamblingHall(ctx);
    const results = [];

    for (const h of heroes) {
      const hid = h.id || h.localId;
      const hName = h.name || 'Hero';
      const die = d6();
      const winnings = die * 25;
      ctx.updateHero?.(hid, (hero) => ({ ...hero, gold: (hero.gold || 0) + winnings }));
      const line = `${hName} rolled [${die}] × $25 = +$${winnings}.`;
      log.push(line);
      results.push(line);
    }

    if (!heroes.length) {
      // Fallback: just the active hero
      const die = d6();
      const winnings = die * 25;
      ctx.updateHero?.(id, (h) => ({ ...h, gold: (h.gold || 0) + winnings }));
      const line = `Rolled [${die}] × $25 = +$${winnings}.`;
      log.push(line);
      results.push(line);
    }

    await showResult(ctx, "EVERYONE'S A WINNER — Result", [
      "The Devil's Wheel strikes a jackpot and everyone cheers!",
      '',
      ...results,
    ]);
    ctx.toast?.("Everyone's a Winner! Each hero gains D6 × $25.");
    return { log };
  }

  // 11: Drinks and Cigars All Around — each hero gains 1 Whiskey + 1 Fine Cigar
  if (roll === 11) {
    const heroes = getHeroesAtGamblingHall(ctx);
    const results = [];

    for (const h of heroes) {
      const hid = h.id || h.localId;
      const hName = h.name || 'Hero';
      await ctx.addToken?.(hid, 'Whiskey');
      await ctx.addToken?.(hid, 'Fine Cigar');
      const line = `${hName} gains 1 Whiskey Token and 1 Fine Cigar Token.`;
      log.push(line);
      results.push(line);
    }

    if (!heroes.length) {
      await ctx.addToken?.(id, 'Whiskey');
      await ctx.addToken?.(id, 'Fine Cigar');
      const line = 'Gained 1 Whiskey Token and 1 Fine Cigar Token.';
      log.push(line);
      results.push(line);
    }

    await showResult(ctx, 'DRINKS AND CIGARS ALL AROUND — Result', [
      'A high roller spreads the wealth!',
      '',
      ...results,
    ]);
    ctx.toast?.('Drinks and Cigars All Around!');
    return { log };
  }

  // 12: High Stakes Bet — first Poker win grants bonus World + Artifact
  if (roll === 12) {
    const state = loadTownState() || {};
    state.gamblingHallFlags = state.gamblingHallFlags || {};
    state.gamblingHallFlags.firstPokerWinAwardsArtifact = true;
    saveTownState(state);

    const outcome = 'High Stakes Bet is active! If you play Five Card Draw Poker during this Location Visit and win during the first game, draw a World card and then an Artifact card from that World as an extra reward.';
    log.push(outcome);
    await showResult(ctx, 'HIGH STAKES BET — Result', [outcome]);
    ctx.toast?.('High Stakes Bet active: first Poker win grants bonus World + Artifact draw.');
    return { log };
  }

  return { log };
}

// --------- Dispatcher compatible with locationEventsEngine ---------------
export async function handleGamblingHallEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? (d6() + d6());
  const result = await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: result?.log || [`Gambling Hall Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

export const gamblingHallHandler = { display, apply, handleGamblingHallEvent };

// Keep exporting this so Poker services can import it from here if needed
export { performGamblingHallHighStakes } from './gamblingHallServices.js';
