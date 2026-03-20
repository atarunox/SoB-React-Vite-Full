// src/utils/locationHandlers/gladiatorArenaHandler.js
import { loadTownState, saveTownState } from '../../utils/townState';
import { d6 as _d6, d3 as _d3 } from '../../utils/diceHelpers';

// Use ctx.d6/ctx.d3 when available (respects manual roll mode); fallback to auto-roll
const ctxD6 = async (ctx, label) => (typeof ctx?.d6 === 'function') ? ctx.d6(label) : _d6();
const ctxD3 = async (ctx, label) => (typeof ctx?.d3 === 'function') ? ctx.d3(label) : _d3();
const ctxRoll = async (ctx, n, sides, label) =>
  (typeof ctx?.roll === 'function') ? ctx.roll(n, sides, label) : Array.from({ length: n }, () => Math.floor(Math.random() * sides) + 1);

const shopId = 'gladiatorArena';

// ---------- townState helpers ----------
function getTownFlags() {
  const s = loadTownState() || {};
  return s[shopId] || {};
}
function patchTownFlags(patch) {
  const s = loadTownState() || {};
  saveTownState({ ...s, [shopId]: { ...getTownFlags(), ...patch } });
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
        title: 'Warden Raid',
        lore: 'Without warning, explosions tear through the arena walls and three Mk IV Warden robots burst in, blasting away at the crowds and mechanically announcing in an alien tongue what must be orders to disperse.',
        effect: 'Make a Cunning 6+ test to escape from the ruthless kill bots. If successful, gain 15 XP. If failed, take D8 Wounds, ignoring Defense. Either way, the Gladiator Arena is shut down (destroyed) for the rest of this Town Stay.',
      };
    case 3:
      return {
        title: 'Pulled From the Crowd',
        lore: 'Singled out by a local warlord that is viewing the fights from his personal box, you are dragged out of the stands and thrown onto the arena floor. Now you must fight... or die.',
        effect: 'You must immediately resolve a Fight in the Arena, even if you have already done so this Town Stay.',
      };
    case 4:
      return {
        title: 'Wounded Trainer',
        lore: 'It looks like the veteran trainer here has seen better days, what with his one arm and no legs.',
        effect: 'All rolls to Train with an Arena Veteran today are -1 to the result.',
      };
    case 5:
      return {
        title: 'Fight in the Stands',
        lore: 'A nasty fight breaks out in the stands as rival fans go crazy!',
        effect: 'Make a Strength 5+ test to push your way through to safety. If failed, take D6 Wounds, ignoring Defense, from the bumps and bruises.',
      };
    case 6:
      return {
        title: 'Low Attendance',
        lore: 'The stands are nearly empty and the fighters here seem beaten down.',
        effect: 'The Bet on a Match event is Limit Once for this Location Visit.',
      };
    case 7:
      return {
        title: 'Blood and Sand',
        lore: 'The cheering crowd and mindless violence make you forget about the dreary desert wasteland outside these walls.',
        effect: 'No Effect.',
      };
    case 8:
      return {
        title: 'Carnage',
        lore: 'The pit fighters are using more deadly weapons than normal.',
        effect: 'During any Bet on a Match event, if two or more 3s are rolled, the fighters tear each other apart! All bets are lost, but you may Recover a Grit.',
      };
    case 9:
      return {
        title: 'Roaring Crowd',
        lore: 'Your heart thumps in your chest as the roar of the crowd electrifies the room.',
        effect: 'You may Recover a Grit.',
      };
    case 10:
      return {
        title: 'Singing and Chanting',
        lore: 'The crowd is extra wild tonight, and they are chanting the names of their favorite competitors.',
        effect: 'During any Fight in the Arena today, a Hero may ignore the first Injury roll they would have to make.',
      };
    case 11:
      return {
        title: 'Black Smoke and Spinning Wheels',
        lore: 'Crude vehicles have been constructed from the wreckage and scraps in the desert wastes, and are now used to battle on the arena floor!',
        effect: 'Roll an extra 3 dice for all Bet on a Match events today. Heroes gain an extra $50 for every 6 (or 1) rolled by their chosen fighter during the Match, if their side wins. Also, any Hero participating in a Fight in the Arena must use Luck as one of their 3 chosen Skills.',
      };
    case 12:
      return {
        title: 'Expert Trainer',
        lore: "Renowned veteran Kor'talay the Krusher is at the arena today, giving tips and tricks on how he has survived this long in the pits.",
        effect: 'All rolls to Train with an Arena Veteran today are +2 to the result.',
      };
    default:
      return { title: 'Quiet Day', lore: '', effect: 'No Event.' };
  }
}

// ---------- mechanics (Resolve) ----------
export async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId?.();
  if (!id) return { log: [] };

  const info = display(roll);
  const log = [];

  // Every event starts with its title and lore/flavor text
  log.push(`[Gladiator Arena] (${roll}) ${info.title} — ${info.lore}`);
  log.push(`Effect: ${info.effect}`);

  // 2: Warden Raid — Cunning 6+ to escape. Pass: 15 XP. Fail: D8 Wounds ignoring Defense. Arena destroyed.
  if (roll === 2) {
    const lore2 = `WARDEN RAID\n${info.lore}\nThree Mk IV Warden robots are tearing through the arena!`;
    const result = await ctx.doSkillCheck(id, {
      stat: 'Cunning', target: 6, returnDetails: true,
      message: `${lore2}\nMake a Cunning 6+ test to escape from the ruthless kill bots.`,
    });
    const checkLine = formatCheckResult(result, 'Cunning', 6);
    if (checkLine) log.push(checkLine);
    const passed = result?.passed ?? result;
    if (passed) {
      ctx.updateHero?.(id, (h) => ({ ...h, xp: (h.xp || 0) + 15 }));
      const outcome = 'You dodge through the chaos and escape the kill bots! Gain 15 XP.';
      log.push(outcome);
      await showResult(ctx, 'WARDEN RAID — Result', [checkLine, '', outcome, '', 'The Gladiator Arena is shut down for the rest of this Town Stay.']);
      ctx.toast?.('Warden Raid: Escaped! +15 XP. Arena shut down.');
    } else {
      // D8 Wounds (roll a d8 via two dice: we simulate d8 since ctx only has d6)
      const d8Roll = Math.floor(Math.random() * 8) + 1;
      const woundLine = `Rolled [${d8Roll}] for D8 Wounds (ignoring Defense).`;
      log.push(woundLine);
      ctx.updateHero?.(id, (h) => ({ ...h, wounds: (h.wounds || 0) + d8Roll }));
      const outcome = `A shock prod strikes you! Take ${d8Roll} Wounds (ignoring Defense).`;
      log.push(outcome);
      await showResult(ctx, 'WARDEN RAID — Result', [checkLine, woundLine, '', outcome, '', 'The Gladiator Arena is shut down for the rest of this Town Stay.']);
      ctx.toast?.(`Warden Raid: Hit by shock prod! ${d8Roll} Wounds. Arena shut down.`);
    }
    // Arena is destroyed for the rest of this Town Stay
    patchTownFlags({ destroyed: true });
    log.push('The Gladiator Arena is shut down (destroyed) for the rest of this Town Stay.');
    return { log };
  }

  // 3: Pulled From the Crowd — Must resolve a Fight in the Arena immediately
  if (roll === 3) {
    const outcome = 'A local warlord singles you out and you are thrown onto the arena floor! You must immediately resolve a Fight in the Arena (even if you already have this Town Stay).';
    log.push(outcome);
    patchTownFlags({ forcedFight: true });
    await showResult(ctx, 'PULLED FROM THE CROWD — Result', [outcome, '', 'Use the Fight in the Arena activity to resolve this battle.']);
    ctx.toast?.('Pulled From the Crowd: You must Fight in the Arena!');
    return { log };
  }

  // 4: Wounded Trainer — All Train with Arena Veteran rolls are -1
  if (roll === 4) {
    patchTownFlags({ trainModifier: (getTownFlags().trainModifier || 0) - 1 });
    const outcome = 'The veteran trainer has seen better days. All rolls to Train with an Arena Veteran today are -1 to the result.';
    log.push(outcome);
    await showResult(ctx, 'WOUNDED TRAINER — Result', [outcome]);
    ctx.toast?.('Wounded Trainer: Training rolls are -1 today.');
    return { log };
  }

  // 5: Fight in the Stands — Strength 5+ or take D6 Wounds ignoring Defense
  if (roll === 5) {
    const lore5 = `FIGHT IN THE STANDS\n${info.lore}\nYou must push your way through the brawling fans to safety!`;
    const result = await ctx.doSkillCheck(id, {
      stat: 'Strength', target: 5, returnDetails: true,
      message: `${lore5}\nMake a Strength 5+ test to push your way through to safety.`,
    });
    const checkLine = formatCheckResult(result, 'Strength', 5);
    if (checkLine) log.push(checkLine);
    const passed = result?.passed ?? result;
    if (passed) {
      const outcome = 'You shove through the brawling crowd and make it to safety! No injuries.';
      log.push(outcome);
      await showResult(ctx, 'FIGHT IN THE STANDS — Result', [checkLine, '', outcome]);
      ctx.toast?.('Fight in the Stands: pushed through safely!');
    } else {
      const woundRoll = await ctxD6(ctx, 'Fight in the Stands — Roll 1d6 for Wounds');
      ctx.updateHero?.(id, (h) => ({ ...h, wounds: (h.wounds || 0) + woundRoll }));
      const woundLine = `Rolled [${woundRoll}] for Wounds (ignoring Defense).`;
      log.push(woundLine);
      const outcome = `The brawl catches you. Take ${woundRoll} Wounds (ignoring Defense) from the bumps and bruises.`;
      log.push(outcome);
      await showResult(ctx, 'FIGHT IN THE STANDS — Result', [checkLine, woundLine, '', outcome]);
      ctx.toast?.(`Fight in the Stands: take ${woundRoll} Wounds.`);
    }
    return { log };
  }

  // 6: Low Attendance — Bet on a Match is Limit Once this visit
  if (roll === 6) {
    patchTownFlags({ betLimitOnce: true });
    const outcome = 'The stands are nearly empty. The Bet on a Match event is limited to once for this Location Visit.';
    log.push(outcome);
    await showResult(ctx, 'LOW ATTENDANCE — Result', [outcome]);
    ctx.toast?.('Low Attendance: Bet on a Match limited to once.');
    return { log };
  }

  // 7: Blood and Sand — No Effect
  if (roll === 7) {
    const outcome = 'The cheering crowd and mindless violence make you forget about the dreary desert wasteland outside these walls. No Effect.';
    log.push(outcome);
    await showResult(ctx, 'BLOOD AND SAND — Result', [outcome]);
    ctx.toast?.('Blood and Sand: No effect.');
    return { log };
  }

  // 8: Carnage — During Bet on a Match, two or more 3s = fighters tear each other apart, bets lost, may recover Grit
  if (roll === 8) {
    patchTownFlags({ carnage: true });
    const outcome = 'The pit fighters are using more deadly weapons than normal. During any Bet on a Match event, if two or more 3s are rolled, the fighters tear each other apart! All bets are lost, but you may Recover a Grit.';
    log.push(outcome);
    await showResult(ctx, 'CARNAGE — Result', [outcome]);
    ctx.toast?.('Carnage: Special Bet on a Match rules in effect.');
    return { log };
  }

  // 9: Roaring Crowd — Recover a Grit
  if (roll === 9) {
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? null;
    const maxGrit = Number(hero?.maxGrit ?? hero?.stats?.Grit ?? 2);
    const curGrit = Number(hero?.currentGrit ?? hero?.grit ?? 0);
    if (curGrit < maxGrit) {
      ctx.updateHero?.(id, (h) => {
        const max = Number(h.maxGrit ?? h.stats?.Grit ?? 2);
        const cur = Number(h.currentGrit ?? h.grit ?? 0);
        return { ...h, currentGrit: Math.min(max, cur + 1) };
      });
      const outcome = 'The roar of the crowd electrifies you! Recover 1 Grit.';
      log.push(outcome);
      await showResult(ctx, 'ROARING CROWD — Result', [outcome]);
      ctx.toast?.('Roaring Crowd: +1 Grit.');
    } else {
      const outcome = 'The crowd roars, but your Grit is already at maximum.';
      log.push(outcome);
      await showResult(ctx, 'ROARING CROWD — Result', [outcome]);
      ctx.toast?.('Roaring Crowd: Grit already at max.');
    }
    return { log };
  }

  // 10: Singing and Chanting — During Fight in the Arena today, ignore first Injury roll
  if (roll === 10) {
    patchTownFlags({ ignoreFirstInjury: true });
    const outcome = 'The crowd is extra wild tonight! During any Fight in the Arena today, a Hero may ignore the first Injury roll they would have to make.';
    log.push(outcome);
    await showResult(ctx, 'SINGING AND CHANTING — Result', [outcome]);
    ctx.toast?.('Singing and Chanting: Ignore first Injury in Fight in the Arena.');
    return { log };
  }

  // 11: Black Smoke and Spinning Wheels — Extra dice for Bet on a Match, bonus $50 per 6/1, Fight must use Luck
  if (roll === 11) {
    patchTownFlags({ blackSmoke: true, extraBetDice: 3, bonusPerSixOrOne: 50, fightRequiresLuck: true });
    const outcome = 'Crude vehicles roar across the arena floor! Roll an extra 3 dice for all Bet on a Match events today. Heroes gain an extra $50 for every 6 (or 1) rolled by their chosen fighter if their side wins. Also, any Hero in a Fight in the Arena must use Luck as one of their 3 chosen Skills.';
    log.push(outcome);
    await showResult(ctx, 'BLACK SMOKE AND SPINNING WHEELS — Result', [outcome]);
    ctx.toast?.('Black Smoke and Spinning Wheels: Special arena rules in effect!');
    return { log };
  }

  // 12: Expert Trainer — All Train with Arena Veteran rolls are +2
  if (roll === 12) {
    patchTownFlags({ trainModifier: (getTownFlags().trainModifier || 0) + 2 });
    const outcome = "Renowned veteran Kor'talay the Krusher is giving tips today. All rolls to Train with an Arena Veteran today are +2 to the result.";
    log.push(outcome);
    await showResult(ctx, 'EXPERT TRAINER — Result', [outcome]);
    ctx.toast?.('Expert Trainer: Training rolls are +2 today!');
    return { log };
  }

  return { log };
}

// --------- Dispatcher compatible with locationEventsEngine ---------------
export async function handleGladiatorArenaEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? (_d6() + _d6());
  const result = await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: result?.log || [`Gladiator Arena Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

export const gladiatorArenaHandler = { display, apply };
export default gladiatorArenaHandler;
