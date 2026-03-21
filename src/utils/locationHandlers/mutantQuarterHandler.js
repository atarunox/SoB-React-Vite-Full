// src/utils/locationHandlers/mutantQuarterHandler.js
import { loadTownState, saveTownState } from '../../utils/townState';
import { d6 as _d6, d3 as _d3 } from '../../utils/diceHelpers';
import { getEventDisplay } from '../locationEventText';

// Use ctx.d6/ctx.d3 when available (respects manual roll mode); fallback to auto-roll
const ctxD6 = async (ctx, label) => (typeof ctx?.d6 === 'function') ? ctx.d6(label) : _d6();
const ctxD3 = async (ctx, label) => (typeof ctx?.d3 === 'function') ? ctx.d3(label) : _d3();

const shopId = 'mutantQuarter';

// ---------- result formatting helper ----------
/**
 * Formats a doSkillCheck result (from returnDetails: true) into a readable string.
 * Shows the dice rolled, pass/fail, and success count.
 */
function formatCheckResult(result, stat, target) {
  if (result && typeof result === 'object' && Array.isArray(result.rolls)) {
    const diceStr = result.rolls.join(', ');
    const sCount = result.successes ?? result.rolls.filter(r => r >= target).length;
    return `Rolled [${diceStr}] — ${result.passed ? 'PASSED' : 'FAILED'} (${stat} ${target}+, ${sCount} success${sCount !== 1 ? 'es' : ''})`;
  }
  return null;
}

/**
 * Shows a result prompt to the player so they can see the outcome before continuing.
 * Uses promptChoice with a single "Continue" button as an acknowledgement dialog.
 */
async function showResult(ctx, title, lines) {
  const body = Array.isArray(lines) ? lines.join('\n') : lines;
  await ctx.promptChoice?.(`${title}\n\n${body}`, [{ label: 'Continue' }]);
}

// ---------- display (title / lore / effect) ----------
export function display(roll) {
  return getEventDisplay(shopId, roll) || { title: 'Mutant Quarter Event', lore: '', effect: 'No Event.' };
}

// ---------- mechanics (Resolve) ----------
/**
 * ctx methods:
 * - getActiveHeroId()
 * - getHeroById(id) / getHero(id)
 * - updateHero(id, patchOrFn)
 * - addToken(id, tokenName)
 * - enqueueChartRoll(id, chartName)
 * - doSkillCheck(id, { stat, target, message, returnDetails })
 * - promptChoice(title, options[])   // {label}
 * - toast(msg)
 */
export async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId?.();
  if (!id) return { log: [] };

  const info = display(roll);
  const log = [];

  // Every event starts with its title and lore/flavor text
  log.push(`[Mutant Quarter] (${roll}) ${info.title} — ${info.lore}`);
  log.push(`Effect: ${info.effect}`);

  // 2: Writhing Mass of Flesh — Lore 6+ test; each 6+ = 20 XP; D6 per building 1-2 destroyed
  if (roll === 2) {
    const lore2 = `WRITHING MASS OF FLESH\n${info.lore}`;
    const result = await ctx.doSkillCheck(id, {
      stat: 'Lore', target: 6, returnDetails: true,
      message: `${lore2}\nMake a Lore 6+ test to protect buildings from the destruction!`,
    });
    const checkLine = formatCheckResult(result, 'Lore', 6);
    if (checkLine) log.push(checkLine);

    let successes = 0;
    if (result && typeof result === 'object' && Number.isFinite(result.successes)) {
      successes = result.successes;
    } else if (result && typeof result === 'object' && Array.isArray(result.rolls)) {
      successes = result.rolls.filter(r => r >= 6).length;
    } else {
      successes = (result?.passed ?? result) ? 1 : 0;
    }

    const xp = successes * 20;
    if (xp > 0) {
      ctx.updateHero?.(id, (h) => ({ ...h, xp: (h.xp || 0) + xp }));
      log.push(`${successes} success${successes !== 1 ? 'es' : ''} on Lore 6+ — +${xp} XP.`);
    }

    const buildingNote = 'At end of day, roll a D6 for every unprotected building in Town. On a 1-2, that building is Destroyed. Resolve this manually.';
    log.push(buildingNote);
    const outcome = xp > 0
      ? `You manage to shield some buildings from the destruction. +${xp} XP.\n\n${buildingNote}`
      : `The writhing mass tears through the Quarter unchecked.\n\n${buildingNote}`;
    await showResult(ctx, 'WRITHING MASS OF FLESH — Result', [checkLine, '', outcome]);
    ctx.toast?.('Writhing Mass of Flesh: Roll D6 per building at end of day (1-2 Destroyed).');
    return { log };
  }

  // 3: "One of us! One of us!!" — 3+ mutations = safe; else Strength 6+; fail = D3 mutations + lose D3 Dark Stone
  if (roll === 3) {
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? null;
    const mutations = Array.isArray(hero?.mutations) ? hero.mutations : [];
    const mutCount = mutations.length;

    if (mutCount >= 3) {
      const outcome = `You already have ${mutCount} Mutations — the mob recognizes you as one of their own. Nothing happens.`;
      log.push(outcome);
      await showResult(ctx, '"ONE OF US!" — Result', [outcome]);
      ctx.toast?.('One of us! You already have 3+ Mutations — no effect.');
      return { log };
    }

    const lore3 = `"ONE OF US! ONE OF US!!"\n${info.lore}`;
    const result = await ctx.doSkillCheck(id, {
      stat: 'Strength', target: 6, returnDetails: true,
      message: `${lore3}\nMake a Strength 6+ test to resist being dunked into the vat!`,
    });
    const checkLine = formatCheckResult(result, 'Strength', 6);
    if (checkLine) log.push(checkLine);
    const passed = result?.passed ?? result;

    if (passed) {
      const outcome = 'You break free of the mob and escape the vat. No effect.';
      log.push(outcome);
      await showResult(ctx, '"ONE OF US!" — Result', [checkLine, '', outcome]);
      ctx.toast?.('You resisted the mob!');
    } else {
      const mutRoll = await ctxD3(ctx, '"One of us!" — Roll D3 for number of Mutations gained');
      const dsRoll = await ctxD3(ctx, '"One of us!" — Roll D3 for Dark Stone lost');
      const mutLine = `Rolled [${mutRoll}] — gain ${mutRoll} Mutation${mutRoll !== 1 ? 's' : ''}.`;
      const dsLine = `Rolled [${dsRoll}] — lose ${dsRoll} Dark Stone.`;
      log.push(mutLine);
      log.push(dsLine);

      for (let i = 0; i < mutRoll; i++) {
        await ctx.enqueueChartRoll?.(id, 'mutation');
      }
      ctx.updateHero?.(id, (h) => ({
        ...h,
        darkStone: Math.max(0, (h.darkStone || 0) - dsRoll),
      }));

      const outcome = `You are dunked into the vat of liquid Dark Stone! Gain ${mutRoll} Mutation${mutRoll !== 1 ? 's' : ''} and lose ${dsRoll} Dark Stone.`;
      log.push(outcome);
      await showResult(ctx, '"ONE OF US!" — Result', [checkLine, mutLine, dsLine, '', outcome]);
      ctx.toast?.(`One of us! Gain ${mutRoll} Mutation(s), lose ${dsRoll} Dark Stone.`);
    }
    return { log };
  }

  // 4: Railworkers' Strike — D6 vs mutation count; if > mutations, take D6 Wounds ignoring Defense; 2 random buildings also affected
  if (roll === 4) {
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? null;
    const mutations = Array.isArray(hero?.mutations) ? hero.mutations : [];
    const mutCount = mutations.length;

    const escapeRoll = await ctxD6(ctx, 'Railworkers\' Strike — Roll D6 (if > Mutations, take D6 Wounds)');
    const escapeLine = `Rolled [${escapeRoll}] vs ${mutCount} Mutation${mutCount !== 1 ? 's' : ''}.`;
    log.push(escapeLine);

    if (escapeRoll > mutCount) {
      const woundRoll = await ctxD6(ctx, 'Railworkers\' Strike — Roll D6 for Wounds');
      const woundLine = `Rolled [${woundRoll}] for Wounds (ignoring Defense).`;
      log.push(woundLine);
      ctx.updateHero?.(id, (h) => {
        const max = h.maxHealth ?? h.max_health ?? 10;
        const cur = h.currentHealth ?? h.health ?? max;
        return { ...h, currentHealth: Math.max(0, cur - woundRoll) };
      });
      const outcome = `The riot catches you off guard! You take ${woundRoll} Wounds, ignoring Defense.`;
      log.push(outcome);
      await showResult(ctx, 'RAILWORKERS\' STRIKE — Result', [escapeLine, woundLine, '', outcome]);
      ctx.toast?.(`Railworkers' Strike: take ${woundRoll} Wounds (ignoring Defense).`);
    } else {
      const outcome = 'Your mutations help you blend in with the rioters. You escape unscathed!';
      log.push(outcome);
      await showResult(ctx, 'RAILWORKERS\' STRIKE — Result', [escapeLine, '', outcome]);
      ctx.toast?.('Railworkers\' Strike: no damage, your mutations protected you.');
    }

    const buildingNote = 'Additionally, 2 other random Town Locations are affected. All Heroes there must also roll. Resolve this manually.';
    log.push(buildingNote);
    ctx.toast?.('Railworkers\' Strike also affects 2 other random buildings — resolve manually.');
    return { log };
  }

  // 5: Little Thief — Agility 5+; pass = +20 XP; fail = lose 3 Side Bag Tokens OR D3 Dark Stone
  if (roll === 5) {
    const lore5 = `LITTLE THIEF\n${info.lore}`;
    const result = await ctx.doSkillCheck(id, {
      stat: 'Agility', target: 5, returnDetails: true,
      message: `${lore5}\nMake an Agility 5+ test to catch the thief!`,
    });
    const checkLine = formatCheckResult(result, 'Agility', 5);
    if (checkLine) log.push(checkLine);
    const passed = result?.passed ?? result;

    if (passed) {
      ctx.updateHero?.(id, (h) => ({ ...h, xp: (h.xp || 0) + 20 }));
      const outcome = 'You catch the little thief red-handed! +20 XP.';
      log.push(outcome);
      await showResult(ctx, 'LITTLE THIEF — Result', [checkLine, '', outcome]);
      ctx.toast?.('Little Thief caught! +20 XP.');
    } else {
      const choiceIdx = await ctx.promptChoice?.(
        `LITTLE THIEF\n${info.lore}\n\n${checkLine}\n\nThe thief got away! Choose what you lose:`,
        [
          { label: 'Lose 3 Side Bag Tokens' },
          { label: 'Lose D3 Dark Stone' },
        ]
      );

      if (choiceIdx === 1) {
        const dsRoll = await ctxD3(ctx, 'Little Thief — Roll D3 for Dark Stone lost');
        const dsLine = `Rolled [${dsRoll}] — lose ${dsRoll} Dark Stone.`;
        log.push(dsLine);
        ctx.updateHero?.(id, (h) => ({
          ...h,
          darkStone: Math.max(0, (h.darkStone || 0) - dsRoll),
        }));
        const outcome = `The thief got away with ${dsRoll} Dark Stone.`;
        log.push(outcome);
        await showResult(ctx, 'LITTLE THIEF — Result', [checkLine, dsLine, '', outcome]);
        ctx.toast?.(`Little Thief: lost ${dsRoll} Dark Stone.`);
      } else {
        log.push('Lost 3 Side Bag Tokens.');
        const outcome = 'The thief made off with 3 of your Side Bag Tokens!';
        log.push(outcome);
        await showResult(ctx, 'LITTLE THIEF — Result', [checkLine, '', outcome]);
        ctx.toast?.('Little Thief: lost 3 Side Bag Tokens. Remove them manually.');
      }
    }
    return { log };
  }

  // 6: Street Beggars — Pay D6x$10, Recover 1 Grit
  if (roll === 6) {
    const costRoll = await ctxD6(ctx, 'Street Beggars — Roll D6 for cost (x$10)');
    const cost = costRoll * 10;
    const costLine = `Rolled [${costRoll}] x $10 = $${cost} to help the family.`;
    log.push(costLine);

    ctx.updateHero?.(id, (h) => {
      const maxGrit = Number(h.maxGrit ?? h.stats?.Grit ?? 2);
      const curGrit = Number(h.currentGrit ?? h.grit ?? 0);
      const nextGrit = Math.min(maxGrit, curGrit + 1);
      return {
        ...h,
        gold: Math.max(0, (h.gold || 0) - cost),
        currentGrit: nextGrit,
      };
    });

    const outcome = `You pay $${cost} to help a starving mutant family. Their gratitude warms your heart. Recover 1 Grit.`;
    log.push(outcome);
    await showResult(ctx, 'STREET BEGGARS — Result', [costLine, '', outcome]);
    ctx.toast?.(`Street Beggars: -$${cost}, +1 Grit.`);
    return { log };
  }

  // 7: No Event
  if (roll === 7) {
    const outcome = 'Crooked shacks and twisted bodies are just the scenery in this part of town. No Event.';
    log.push(outcome);
    await showResult(ctx, 'RICKETTY BUILDINGS AND DEFORMITIES GALORE — Result', [outcome]);
    return { log };
  }

  // 8: Mutant Saloon — Gain 1 Tequila; optionally pay $25 for +15 XP, then D6 3+: +1 Grit & +1 Corruption Hit
  if (roll === 8) {
    await ctx.addToken?.(id, 'Tequila');
    const tokenLine = 'Gained 1 Tequila Token.';
    log.push(tokenLine);

    const choiceIdx = await ctx.promptChoice?.(
      `MUTANT SALOON\n${info.lore}\n\n${tokenLine}\n\nPay $25 for a wild show? (+15 XP, then D6: on 3+, Recover 1 Grit and take 1 Corruption Hit.)`,
      [
        { label: 'Pay $25 and watch the show' },
        { label: 'Keep your gold and move on' },
      ]
    );

    if (choiceIdx === 0) {
      ctx.updateHero?.(id, (h) => ({
        ...h,
        gold: Math.max(0, (h.gold || 0) - 25),
        xp: (h.xp || 0) + 15,
      }));
      log.push('Paid $25 for the show. +15 XP.');

      const showRoll = await ctxD6(ctx, 'Mutant Saloon — Roll D6 for show result (3+ = Grit + Corruption)');
      const showLine = `Rolled [${showRoll}] for the show result.`;
      log.push(showLine);

      if (showRoll >= 3) {
        ctx.updateHero?.(id, (h) => {
          const maxGrit = Number(h.maxGrit ?? h.stats?.Grit ?? 2);
          const curGrit = Number(h.currentGrit ?? h.grit ?? 0);
          const nextGrit = Math.min(maxGrit, curGrit + 1);
          return {
            ...h,
            currentGrit: nextGrit,
            corruptionHits: (h.corruptionHits || 0) + 1,
          };
        });
        const outcome = 'The show is wild! Recover 1 Grit and take 1 Corruption Hit.';
        log.push(outcome);
        await showResult(ctx, 'MUTANT SALOON — Result', [tokenLine, showLine, '', outcome]);
        ctx.toast?.('Mutant Saloon: +1 Tequila, +15 XP, +1 Grit, +1 Corruption Hit.');
      } else {
        const outcome = 'The show is entertaining but nothing special happens beyond the XP.';
        log.push(outcome);
        await showResult(ctx, 'MUTANT SALOON — Result', [tokenLine, showLine, '', outcome]);
        ctx.toast?.('Mutant Saloon: +1 Tequila, +15 XP.');
      }
    } else {
      const outcome = 'You pocket the Tequila and move on.';
      log.push(outcome);
      await showResult(ctx, 'MUTANT SALOON — Result', [tokenLine, '', outcome]);
      ctx.toast?.('Mutant Saloon: +1 Tequila Token.');
    }
    return { log };
  }

  // 9: Party in the Streets — Luck 4+; pass = heal D6 Health & D6 Sanity; if any 6, +1 Sanity (once per stay)
  if (roll === 9) {
    const lore9 = `PARTY IN THE STREETS\n${info.lore}`;
    const result = await ctx.doSkillCheck(id, {
      stat: 'Luck', target: 4, returnDetails: true,
      message: `${lore9}\nMake a Luck 4+ test to join the revelry!`,
    });
    const checkLine = formatCheckResult(result, 'Luck', 4);
    if (checkLine) log.push(checkLine);
    const passed = result?.passed ?? result;

    if (passed) {
      const healthRoll = await ctxD6(ctx, 'Party in the Streets — Roll D6 for Health healed');
      const sanityRoll = await ctxD6(ctx, 'Party in the Streets — Roll D6 for Sanity healed');
      const healthLine = `Rolled [${healthRoll}] for Health healed.`;
      const sanityLine = `Rolled [${sanityRoll}] for Sanity healed.`;
      log.push(healthLine);
      log.push(sanityLine);

      ctx.updateHero?.(id, (h) => {
        const maxHp = h.maxHealth ?? h.max_health ?? 10;
        const curHp = h.currentHealth ?? h.health ?? maxHp;
        const maxSan = h.maxSanity ?? h.SanityMax ?? 0;
        const curSan = h.currentSanity ?? h.sanity ?? maxSan;
        return {
          ...h,
          currentHealth: Math.min(maxHp, curHp + healthRoll),
          currentSanity: Math.min(maxSan, curSan + sanityRoll),
        };
      });

      let bonusLine = '';
      // Once-per-stay +1 Sanity if any 6 rolled
      const s = loadTownState() || {};
      const onceKey = `partyBonus_${id}`;
      const stayMods = s.stayMods || {};
      if (!stayMods[onceKey] && (healthRoll === 6 || sanityRoll === 6)) {
        ctx.updateHero?.(id, (h) => {
          const maxSan = h.maxSanity ?? h.SanityMax ?? 0;
          const curSan = h.currentSanity ?? h.sanity ?? maxSan;
          return { ...h, currentSanity: Math.min(maxSan, curSan + 1) };
        });
        saveTownState({ ...s, stayMods: { ...stayMods, [onceKey]: true } });
        bonusLine = 'A 6 was rolled! Bonus +1 Sanity (once per Town Stay).';
        log.push(bonusLine);
      }

      const outcome = `The festival lifts your spirits! Heal ${healthRoll} Health and ${sanityRoll} Sanity.${bonusLine ? '\n' + bonusLine : ''}`;
      log.push(outcome);
      await showResult(ctx, 'PARTY IN THE STREETS — Result', [checkLine, healthLine, sanityLine, bonusLine, '', outcome].filter(Boolean));
      ctx.toast?.(`Party in the Streets: heal ${healthRoll} HP, ${sanityRoll} Sanity.${bonusLine ? ' +1 bonus Sanity!' : ''}`);
    } else {
      const outcome = 'You fail to get into the spirit of the festival. Nothing happens.';
      log.push(outcome);
      await showResult(ctx, 'PARTY IN THE STREETS — Result', [checkLine, '', outcome]);
      ctx.toast?.('Party in the Streets: failed the Luck test.');
    }
    return { log };
  }

  // 10: Street Vendor — Heal D6 Health & D6 Sanity, +25 XP, +1 token per Mutation
  if (roll === 10) {
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? null;
    const mutations = Array.isArray(hero?.mutations) ? hero.mutations : [];
    const mutCount = mutations.length;

    const healthRoll = await ctxD6(ctx, 'Street Vendor — Roll D6 for Health healed');
    const sanityRoll = await ctxD6(ctx, 'Street Vendor — Roll D6 for Sanity healed');
    const healthLine = `Rolled [${healthRoll}] for Health healed.`;
    const sanityLine = `Rolled [${sanityRoll}] for Sanity healed.`;
    log.push(healthLine);
    log.push(sanityLine);

    ctx.updateHero?.(id, (h) => {
      const maxHp = h.maxHealth ?? h.max_health ?? 10;
      const curHp = h.currentHealth ?? h.health ?? maxHp;
      const maxSan = h.maxSanity ?? h.SanityMax ?? 0;
      const curSan = h.currentSanity ?? h.sanity ?? maxSan;
      return {
        ...h,
        currentHealth: Math.min(maxHp, curHp + healthRoll),
        currentSanity: Math.min(maxSan, curSan + sanityRoll),
        xp: (h.xp || 0) + 25,
      };
    });
    log.push('+25 XP from the grateful vendor.');

    if (mutCount > 0) {
      const tokenNote = `You have ${mutCount} Mutation${mutCount !== 1 ? 's' : ''} — gain ${mutCount} free token${mutCount !== 1 ? 's' : ''} (Bandages, Whiskey, or Dynamite each). Select your tokens manually.`;
      log.push(tokenNote);
      const outcome = `The vendor presses supplies into your hands. Heal ${healthRoll} Health and ${sanityRoll} Sanity, +25 XP, and ${mutCount} free token${mutCount !== 1 ? 's' : ''} (choose Bandages, Whiskey, or Dynamite for each).`;
      await showResult(ctx, 'STREET VENDOR — Result', [healthLine, sanityLine, '', outcome]);
      ctx.toast?.(`Street Vendor: heal ${healthRoll} HP, ${sanityRoll} Sanity, +25 XP, ${mutCount} free token(s).`);
    } else {
      const outcome = `The vendor recognizes your efforts. Heal ${healthRoll} Health and ${sanityRoll} Sanity, +25 XP. (No Mutations, so no bonus tokens.)`;
      log.push(outcome);
      await showResult(ctx, 'STREET VENDOR — Result', [healthLine, sanityLine, '', outcome]);
      ctx.toast?.(`Street Vendor: heal ${healthRoll} HP, ${sanityRoll} Sanity, +25 XP.`);
    }
    return { log };
  }

  // 11: Preaching the Faith — +1 Spirit next Adventure, remove 2 Corruption Hits
  if (roll === 11) {
    ctx.updateHero?.(id, (h) => {
      const corr = Math.max(0, (h.corruptionHits || 0) - 2);
      return {
        ...h,
        corruptionHits: corr,
        adventureBuffs: {
          ...(h.adventureBuffs || {}),
          Spirit: ((h.adventureBuffs?.Spirit) || 0) + 1,
          source: 'Preaching the Faith (Mutant Quarter)',
        },
      };
    });

    const outcome = 'A heavily mutated preacher delivers a blazing sermon, cloaking you in a powerful blessing.';
    const effects = '+1 Spirit for next Adventure. 2 Corruption Hits removed.';
    log.push(outcome);
    log.push(effects);
    await showResult(ctx, 'PREACHING THE FAITH — Result', [outcome, '', effects]);
    ctx.toast?.('Preaching the Faith: +1 Spirit next Adventure, -2 Corruption Hits.');
    return { log };
  }

  // 12: A Few New Tricks — D6x25 XP; if Tentacle/Tail mutation, +1 Extra Use
  if (roll === 12) {
    const xpRoll = await ctxD6(ctx, 'A Few New Tricks — Roll D6 for XP (x25)');
    const xp = xpRoll * 25;
    const xpLine = `Rolled [${xpRoll}] x 25 = ${xp} XP.`;
    log.push(xpLine);

    ctx.updateHero?.(id, (h) => ({ ...h, xp: (h.xp || 0) + xp }));

    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? null;
    const mutations = Array.isArray(hero?.mutations) ? hero.mutations : [];
    const hasTentacleOrTail = mutations.some(m => {
      const name = (m?.name || m || '').toLowerCase();
      return name.includes('tentacle') || name.includes('tail');
    });

    let extraLine = '';
    if (hasTentacleOrTail) {
      extraLine = 'You have a Tentacle or Tail mutation — you count as having 1 extra Hand icon each turn (unless you already have Prehensile Tail).';
      log.push(extraLine);
    }

    const outcome = `An old mutant gunslinger shares his tricks. +${xp} XP.${extraLine ? '\n' + extraLine : ''}`;
    log.push(outcome);
    await showResult(ctx, 'A FEW NEW TRICKS — Result', [xpLine, extraLine, '', outcome].filter(Boolean));
    ctx.toast?.(`A Few New Tricks: +${xp} XP.${hasTentacleOrTail ? ' Extra Hand icon from mutation!' : ''}`);
    return { log };
  }

  return { log };
}

// --------- Dispatcher compatible with locationEventsEngine ---------------
export async function handleMutantQuarterEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? (_d6() + _d6());
  const result = await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: result?.log || [`Mutant Quarter Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

export const mutantQuarterHandler = { display, apply };
export default mutantQuarterHandler;
