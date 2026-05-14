import { loadTownState, saveTownState } from '../../utils/townState';
import { d6 } from '../../utils/diceHelpers';

// ---------- result helpers (shared pattern — see CLAUDE.md) ----------
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

function display(roll) {
  switch (roll) {
    case 2:
      return {
        title: 'Jailbreak',
        lore: 'With his hanging scheduled for today, a ruthless band of Outlaws wastes no time in trying to break out their jailed comrade. You just happen to be in the wrong place at the wrong time!',
        effect: 'The Town Stay is over for all Heroes at the end of the current Day (you must still roll for Town Event). The Heroes\' next Adventure is automatically the Town Adventure "Jailbreak", though this can be avoided if all Heroes agree to flee before the shooting begins (and to start the next Adventure with no Grit).',
      };
    case 3:
      return {
        title: 'Corrupt Sheriff',
        lore: 'The local Sheriff has gone mad with power and greed. Every Law Hero at the Sheriff\'s Office must immediately Flee Town or challenge the Corrupt Sheriff\'s authority!',
        effect: 'To challenge him, make a Spirit 5+ test. If successful, he is defeated and runs for the hills, gain 50 XP and D6×$50. If failed, he draws on you and guns you down. Roll once on the Injury Chart. If the Corrupt Sheriff is not defeated by any Law Hero here, all Heroes in Town are considered Wanted! until the end of this Town Stay.',
      };
    case 4:
      return {
        title: 'Insane Ramblings',
        lore: 'One of the prisoners is rambling on in his jail cell about the insignificance of humanity and the coming of dark gods. It\'s hard not to be unnerved by it.',
        effect: 'Take 2D6 Horror Hits. If the number rolled is doubles, also immediately move the marker 2 spaces forward on the Town Event Track.',
      };
    case 5:
    case 6:
    case 7:
    case 8:
      return {
        title: 'Cold, Hard Justice',
        lore: 'Blind, with a smoking pistol in each hand! You wouldn\'t want it any other way.',
        effect: 'No Event.',
      };
    case 9:
    case 10:
      return {
        title: 'Telegraph',
        lore: 'An incoming telegraph brings news of a Void Storm warning in your area. Time to steel your resolve.',
        effect: 'You may Recover 1 Grit and Heal up to D6 Wounds/Sanity (any mix).',
      };
    case 11:
      return {
        title: '"We need Six Men!"',
        lore: 'Mount Up! We\'ve got a job to do! Every Hero at the Sheriff\'s Office that is not Law or Holy immediately gains the Become Deputized bonus for free.',
        effect: 'Then, any Hero that Joins a Manhunt today gains double any XP and Gold earned.',
      };
    case 12:
      return {
        title: 'Legendary Outlaw',
        lore: 'Locked up in a cell, legendary Outlaw \'Sparky\' Scafford sits, waiting his transfer to the federal Marshals. With a wink and a smile he says, "My Pa\' might\'n have somthin\' to say \'bout that!"',
        effect: 'If you Escort a Prisoner today, it requires a Lore 6+ test, but you gain D8×$100 instead if successful.',
      };
    default:
      return { title: 'Quiet Day', lore: '', effect: 'No Event.' };
  }
}

async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId?.();
  if (!id) return { log: [] };

  const info = display(roll);
  const log = [];

  // Every event starts with its title and lore/flavor text
  log.push(`[Sheriff's Office] (${roll}) ${info.title} — ${info.lore}`);
  log.push(`Effect: ${info.effect}`);

  // 2: Jailbreak — Town Stay over; choose Jailbreak adventure or flee (no Grit)
  if (roll === 2) {
    const s = loadTownState();

    // Mark the Town Stay as ending at end of current Day for all heroes
    saveTownState({
      ...s,
      townStayEndsToday: true,
    });
    log.push('The Town Stay is over for all Heroes at the end of the current Day.');

    // Give the party a choice: Jailbreak adventure or flee
    const choice = await ctx.promptChoice?.(
      `JAILBREAK\n\n${info.lore}\n\nThe Town Stay is over for all Heroes at the end of the current Day (you must still roll for Town Event).\n\nThe Heroes' next Adventure is automatically the Town Adventure "Jailbreak", unless ALL Heroes agree to flee before the shooting begins — but they start the next Adventure with NO Grit.\n\nWhat does the party decide?`,
      [
        { label: 'Town Adventure: Jailbreak' },
        { label: 'All Heroes flee (next Adventure starts with no Grit)' },
      ]
    );

    if (choice === 1) {
      // All heroes flee — start next adventure with no Grit
      const s2 = loadTownState();
      saveTownState({
        ...s2,
        townStayEndsToday: true,
        globalRules: { ...(s2.globalRules || {}), noGritNextAdventure: true },
      });
      // Set all heroes' Grit to 0 for next adventure
      const allHeroes = ctx.listAllTownHeroes?.() || [];
      for (const hid of allHeroes) {
        const heroId = typeof hid === 'string' ? hid : hid?.id || hid?.localId;
        if (heroId) {
          ctx.updateHero?.(heroId, (h) => ({
            ...h,
            adventureDebuffs: { ...(h.adventureDebuffs || {}), noGrit: true },
          }));
        }
      }
      const outcome = 'All Heroes agree to flee before the shooting begins. The next Adventure will start with NO Grit for any Hero.';
      log.push(outcome);
      await showResult(ctx, 'JAILBREAK — Fled!', [outcome]);
      ctx.toast?.('All Heroes fled! Next Adventure starts with no Grit.');
    } else {
      // Jailbreak adventure
      const s2 = loadTownState();
      saveTownState({
        ...s2,
        townStayEndsToday: true,
        nextAdventure: 'Town:Jailbreak',
      });
      const outcome = 'Outlaws have broken out of jail! The next Adventure will be the Town Adventure "Jailbreak".';
      log.push(outcome);
      await showResult(ctx, 'JAILBREAK — Result', [outcome]);
      ctx.toast?.('Jailbreak! Next Adventure: Town Jailbreak.');
    }
    return { log };
  }

  // 3: Corrupt Sheriff — Law Heroes must Flee or challenge (Spirit 5+)
  if (roll === 3) {
    const hero = ctx.getHeroById?.(id) || ctx.getActiveHero?.() || {};
    const heroKeywords = Array.isArray(hero.keywords) ? hero.keywords : [];
    const isLaw = heroKeywords.includes('Law');

    const lore3 = `CORRUPT SHERIFF\n${info.lore}\nThe sheriff has grown drunk on power, shaking down travelers and pocketing the town's gold.`;

    if (!isLaw) {
      // Non-Law heroes are not directly involved — but if no Law hero defeats him, all become Wanted
      const outcome = 'You are not a Law Hero, so you cannot challenge the Corrupt Sheriff directly. If no Law Hero at the Sheriff\'s Office defeats him, all Heroes in Town become Wanted until the end of this Town Stay.';
      log.push(outcome);
      await showResult(ctx, 'CORRUPT SHERIFF — Not Law', [outcome]);
      ctx.toast?.('You are not Law — cannot challenge the Corrupt Sheriff.');
      return { log };
    }

    // Law hero: must Flee Town or challenge
    const testChoice = await ctx.promptChoice?.(
      `${lore3}\n\nAs a Law Hero, you must either challenge the Corrupt Sheriff or Flee Town!\n\nWhat do you do?`,
      [
        { label: 'Challenge him (Spirit 5+ test)' },
        { label: 'Flee Town' },
      ]
    );
    if (testChoice === 1) {
      // Fled — sheriff not defeated; all heroes Wanted
      const s = loadTownState();
      saveTownState({
        ...s,
        globalRules: { ...(s.globalRules || {}), allWantedThisStay: true },
      });
      const outcome = 'You flee from the Corrupt Sheriff. Since no Law Hero defeated him, all Heroes in Town are considered Wanted until the end of this Town Stay!';
      log.push(outcome);
      await showResult(ctx, 'CORRUPT SHERIFF — Fled', [outcome]);
      ctx.toast?.('You fled! All Heroes are Wanted this Town Stay.');
    } else {
      const result = await ctx.doSkillCheck(id, {
        stat: 'Spirit', target: 5, returnDetails: true,
        message: `${lore3}\nYou stare the corrupt lawman down and challenge his authority!`,
      });
      const checkLine = formatCheckResult(result, 'Spirit', 5);
      if (checkLine) log.push(checkLine);
      const passed = result?.passed ?? result;
      if (passed) {
        const goldRoll = d6();
        const gold = goldRoll * 50;
        ctx.updateHero?.(id, (h) => ({
          ...h,
          xp: (h.xp || 0) + 50,
          gold: (h.gold || 0) + gold,
        }));
        const goldLine = `Rolled [${goldRoll}] × $50 = $${gold} reward.`;
        log.push(goldLine);
        const outcome = `You stand your ground and the sheriff backs down, exposed as a fraud! The townsfolk reward your courage. +50 XP, +$${gold}.`;
        log.push(outcome);
        await showResult(ctx, 'CORRUPT SHERIFF — Result', [checkLine, goldLine, '', outcome]);
        ctx.toast?.(`Corrupt Sheriff defeated! +50 XP, +$${gold}.`);
      } else {
        // Failed — roll Injury AND all heroes Wanted
        const s = loadTownState();
        saveTownState({
          ...s,
          globalRules: { ...(s.globalRules || {}), allWantedThisStay: true },
        });
        const outcome = 'The sheriff draws on you before you can react. Roll on the Injury Chart. Since the Corrupt Sheriff was not defeated, all Heroes in Town are Wanted until the end of this Town Stay!';
        log.push(outcome);
        await showResult(ctx, 'CORRUPT SHERIFF — Result', [checkLine, '', outcome]);
        ctx.toast?.('The sheriff guns you down — Injury Chart. All Heroes Wanted!');
        await ctx.enqueueChartRoll?.(id, 'injury');
      }
    }
    return { log };
  }

  // 4: Insane Ramblings — 2D6 Horror Hits (Willpower saves); doubles advance Darkness by 2
  if (roll === 4) {
    const die1 = d6();
    const die2 = d6();
    const horrorTotal = die1 + die2;
    const isDoubles = die1 === die2;

    const lore4 = `INSANE RAMBLINGS\n${info.lore}\nA prisoner babbles about the Void and the insignificance of mankind, and the madness seeps into your mind.`;

    const rollLine = `Rolled [${die1}, ${die2}] = ${horrorTotal} Horror Hits${isDoubles ? ' (DOUBLES!)' : ''}.`;
    log.push(rollLine);

    // Show the Horror Hits result first
    await showResult(ctx, 'INSANE RAMBLINGS — Horror Hits', [
      rollLine,
      '',
      `You must now roll Willpower to resist each Horror Hit.`,
    ]);

    // Willpower saves — each success cancels 1 Horror Hit
    const hero = ctx.getHeroById?.(id) || ctx.getActiveHero?.() || {};
    // Read Willpower TN (target number) from hero — default 5+
    const wpRaw = hero?.willpower ?? hero?.stats?.willpower ?? hero?.stats?.Willpower ?? hero?.Willpower;
    let wpTN = 5;
    if (typeof wpRaw === 'string') {
      const m = wpRaw.match(/(\d)\s*\+/);
      if (m) wpTN = Number(m[1]);
    } else if (typeof wpRaw === 'number' && wpRaw > 0) {
      wpTN = wpRaw;
    }

    // Read Spirit stat (number of dice to roll for Willpower saves)
    const spiritVal = ctx.getEffectiveStat?.(id, 'Spirit') ?? Number(hero?.stats?.Spirit ?? hero?.Spirit ?? 1);
    const wpDice = Math.max(1, spiritVal);

    // Prompt for the Willpower roll
    const wpResult = await ctx.doSkillCheck?.(id, {
      stat: 'Spirit', target: wpTN, returnDetails: true,
      message: `${lore4}\n\n${rollLine}\n\nRoll Willpower (Spirit ${wpTN}+) to resist ${horrorTotal} Horror Hits. Each success cancels 1 Hit.`,
    });
    const wpCheckLine = formatCheckResult(wpResult, 'Willpower', wpTN);
    if (wpCheckLine) log.push(wpCheckLine);

    const successes = wpResult?.successes ?? 0;
    const hitsRemaining = Math.max(0, horrorTotal - successes);

    // Apply remaining Horror Hits as Sanity damage
    if (hitsRemaining > 0) {
      ctx.updateHero?.(id, (h) => {
        const curSanity = Number(h.currentSanity ?? h.sanity ?? 0);
        const nextSanity = Math.max(0, curSanity - hitsRemaining);
        return { ...h, currentSanity: nextSanity };
      });
    }

    const saveLine = `Willpower saved ${successes} of ${horrorTotal} Horror Hits. ${hitsRemaining > 0 ? `${hitsRemaining} Sanity damage taken.` : 'All Horror Hits resisted!'}`;
    log.push(saveLine);

    if (isDoubles) {
      const s = loadTownState();
      const darkness = Number(s.darknessTrack ?? 0) + 2;
      saveTownState({ ...s, darknessTrack: darkness });
      const outcome = `The prisoner's mad ravings bore into your soul. ${hitsRemaining > 0 ? `You take ${hitsRemaining} Sanity damage` : 'You resist the madness'} (doubles!) — the Darkness Track advances by 2.`;
      log.push(outcome);
      await showResult(ctx, 'INSANE RAMBLINGS — Result', [rollLine, wpCheckLine, saveLine, '', outcome]);
      ctx.toast?.(`Insane Ramblings: ${hitsRemaining} Sanity damage (doubles — Darkness +2).`);
    } else {
      const outcome = hitsRemaining > 0
        ? `The prisoner's mad ravings leave you shaken. You take ${hitsRemaining} Sanity damage.`
        : `The prisoner's mad ravings wash over you, but you steel your mind against the madness.`;
      log.push(outcome);
      await showResult(ctx, 'INSANE RAMBLINGS — Result', [rollLine, wpCheckLine, saveLine, '', outcome]);
      ctx.toast?.(`Insane Ramblings: ${hitsRemaining} Sanity damage.`);
    }
    return { log };
  }

  // 5-8: Cold, Hard Justice — No Event
  if (roll >= 5 && roll <= 8) {
    const outcome = 'The sheriff goes about his business. Nothing of note happens today.';
    log.push(outcome);
    await showResult(ctx, 'COLD, HARD JUSTICE — Result', [outcome]);
    ctx.toast?.('Cold, Hard Justice: No Event.');
    return { log };
  }

  // 9-10: Telegraph — Recover 1 Grit and Heal D6 Wounds/Sanity (any mix)
  if (roll === 9 || roll === 10) {
    const healTotal = d6();
    const healLine = `Rolled [${healTotal}] for healing pool (D6).`;
    log.push(healLine);
    const lore910 = `TELEGRAPH\n${info.lore}\nAn urgent wire brings news of a looming Void storm, stiffening your resolve for what's ahead.`;

    const idx = await ctx.promptChoice?.(
      `${lore910}\n\n${healLine}\n\nRecover 1 Grit and Heal up to ${healTotal} total across Health and Sanity (any mix).\n\nHow much goes to Health? (remainder heals Sanity)`,
      Array.from({ length: healTotal + 1 }, (_, i) => ({
        label: `${i} Health, ${healTotal - i} Sanity`,
      }))
    );

    const healthHeal = (idx != null && idx >= 0 && idx <= healTotal) ? idx : healTotal;
    const sanityHeal = healTotal - healthHeal;

    ctx.updateHero?.(id, (h) => {
      const maxGrit = h.maxGrit ?? 2;
      const curGrit = Number(h.currentGrit ?? h.grit ?? 0);
      const nextGrit = Math.min(maxGrit, curGrit + 1);
      const maxHp = Number(h.maxHealth ?? h.max_health ?? 10);
      const curHp = Number(h.currentHealth ?? h.health ?? maxHp);
      const newHp = Math.min(maxHp, curHp + healthHeal);
      const maxSan = Number(h.maxSanity ?? h.SanityMax ?? 0);
      const curSan = Number(h.currentSanity ?? h.sanity ?? maxSan);
      const newSan = Math.min(maxSan, curSan + sanityHeal);
      return {
        ...h,
        currentGrit: nextGrit,
        currentHealth: newHp,
        currentSanity: newSan,
      };
    });
    const outcome = `The telegraph brings urgent news that steels your resolve. Recover 1 Grit. Healed ${healthHeal} Health and ${sanityHeal} Sanity.`;
    log.push(outcome);
    await showResult(ctx, 'TELEGRAPH — Result', [healLine, '', outcome]);
    ctx.toast?.(`Telegraph: +1 Grit, healed ${healthHeal} Health and ${sanityHeal} Sanity.`);
    return { log };
  }

  // 11: "We need Six Men!" — Non-Law/Holy become Deputized; Manhunt double rewards
  if (roll === 11) {
    const rawHere = ctx.getHeroesAtShop?.('sheriffsOffice') || [id];
    // Normalize: getHeroesAtShop may return hero objects or IDs
    const heroIds = rawHere.map(entry =>
      typeof entry === 'string' ? entry : entry?.id || entry?.localId
    ).filter(Boolean);

    const deputized = [];
    for (const hid of heroIds) {
      const h = ctx.getHeroById?.(hid) || {};
      const heroKw = Array.isArray(h.keywords) ? h.keywords : [];
      const isLaw = heroKw.includes('Law');
      const isHoly = heroKw.includes('Holy');
      if (!isLaw && !isHoly) {
        // Grant full Become Deputized bonus: Law keyword + Cunning +1 condition
        const kw = [...heroKw];
        if (!kw.includes('Law')) kw.push('Law');
        const cond = h.conditions || {};
        const temporary = Array.isArray(cond.temporary) ? [...cond.temporary] : [];
        temporary.push({
          id: 'deputized_cunning_plus1',
          name: 'Deputized',
          type: 'temporary',
          effect: '+1 Cunning and Keyword Law. At end of each Adventure, roll D6 — on 1-3 lose this bonus.',
          statMods: { Cunning: +1 },
          active: true,
          expires: 'endOfAdventureCheck',
          expiryRoll: { die: 6, loseOn: [1, 2, 3] },
          addedAt: Date.now(),
        });
        ctx.updateHero?.(hid, (prev) => ({
          ...prev,
          keywords: kw,
          conditions: { ...cond, temporary },
        }));
        deputized.push(h.name || 'Unknown Hero');
      }
    }
    // Set manhunt double rewards flag for today
    const s = loadTownState();
    saveTownState({ ...s, sheriffsOfficeFlags: { ...(s.sheriffsOfficeFlags || {}), manhuntDoubleRewardsToday: true } });

    let outcome;
    if (deputized.length > 0) {
      outcome = `The sheriff pins a badge on every willing volunteer: ${deputized.join(', ')} are now Deputized (+1 Cunning, Law keyword). Any Hero that Joins a Manhunt today gains double XP & Gold!`;
    } else {
      outcome = 'All heroes here are already Law or Holy — no one needs deputizing. Any Hero that Joins a Manhunt today gains double XP & Gold!';
    }
    log.push(outcome);
    await showResult(ctx, '"WE NEED SIX MEN!" — Result', [
      `Heroes at the Sheriff's Office: ${heroIds.length}`,
      deputized.length > 0 ? `Deputized: ${deputized.join(', ')}` : 'No heroes needed deputizing.',
      '',
      outcome,
    ]);
    ctx.toast?.('"We need Six Men!" — Manhunt double XP & Gold today.');
    return { log };
  }

  // 12: Legendary Outlaw — Escort Prisoner uses Lore 6+, reward D8×$100
  if (roll === 12) {
    const s = loadTownState();
    saveTownState({ ...s, sheriffsOfficeFlags: { ...(s.sheriffsOfficeFlags || {}), escortLegendaryBonusToday: true } });
    const outcome = '"Sparky" McBride himself sits in the cells, grinning through broken teeth. Escort Prisoner today uses Lore 6+ and the reward becomes D8×$100 if successful.';
    log.push(outcome);
    await showResult(ctx, 'LEGENDARY OUTLAW — Result', [outcome]);
    ctx.toast?.('Legendary Outlaw — Escort Prisoner today uses Lore 6+ but rewards D8×$100.');
    return { log };
  }

  return { log };
}

export async function handleSheriffsOfficeEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? (d6() + d6());
  const result = await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: result?.log || [`Sheriff's Office Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

export const sheriffsOfficeHandler = { display, apply };

// NEW: re-export the service executor so imports from the handler keep working
export { performSheriffsOfficeService } from './sheriffsOfficeServices';
