// src/utils/locationHandlers/templeHandler.js

import { loadTownState, saveTownState } from '../../utils/townState';
import { d6 as _d6, d3 as _d3 } from '../../utils/diceHelpers';
import { templeIdols } from '../../data/townLocations/BlastedWastesTown/Temple/templeIdols.js';

const ctxD6 = async (ctx, label) =>
  typeof ctx?.d6 === 'function' ? ctx.d6(label) : _d6();
const ctxD3 = async (ctx, label) =>
  typeof ctx?.d3 === 'function' ? ctx.d3(label) : _d3();

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

// ---------- Idol state management ----------
function getTempleIdol() {
  const s = loadTownState() || {};
  return s.templeIdol ?? null;
}

function setTempleIdol(idolRoll) {
  const s = loadTownState() || {};
  saveTownState({ ...s, templeIdol: idolRoll });
}

function getIdolData(idolRoll) {
  return templeIdols[idolRoll] || null;
}

// ---------- display (title / lore / effect) ----------
export function display(roll) {
  switch (roll) {
    case 2:
      return {
        title: 'Blood and Sacrifice',
        lore: "Throwing a hood over your head, you are dragged to the Idol's altar and made ready for sacrifice!",
        effect:
          'Make a Luck 5+ test to break free! If failed, roll twice on the Injury Table and your Town Stay is over.',
      };
    case 3:
      return {
        title: '"Heretic!"',
        lore: "Something you did seems to have greatly offended the followers! It would seem a simple apology won't do.",
        effect:
          'Make a Cunning 6+ test to talk your way out of this. If failed, take D6 Hits and your Location Visit is over.',
      };
    case 4:
      return {
        title: 'Fanatical Followers',
        lore: "Those who worship the Temple's Idol have limitless devotion to its power.",
        effect:
          "Use the number 4 Location Event unique to the Temple's Idol.",
      };
    case 5:
      return {
        title: '"Join us..."',
        lore: 'The followers here seem quite adamant that you join their cult!',
        effect:
          "You may not interact with this Location any further until you purchase the Blessing of the Temple's Idol first.",
      };
    case 6:
    case 7:
    case 8:
      return {
        title: 'The Smell of Incense',
        lore: 'Offerings to a disturbing idol and quiet chanting. These guys clearly know how to have a good time.',
        effect: 'No Event.',
      };
    case 9:
      return {
        title: 'Blessing of the Temple',
        lore: 'Recognizing your worth as a Hero, the priests of the Temple bless your journey.',
        effect:
          "You may immediately gain the Blessing of this Temple's Idol for free.",
      };
    case 10:
      return {
        title: "The Idol's Glory",
        lore: "The Temple's Idol is not just a thing to be feared, but a reason for hope in this desolate place.",
        effect:
          "Use the number 10 Location Event unique to the Temple's Idol.",
      };
    case 11:
      return {
        title: 'An Offering to the Gods',
        lore: 'Alone at the foot of the Idol, you feel strangely compelled to believe in its power, even if for but a moment.',
        effect:
          'You may discard a Scrap, Tech, Dark Stone, or Side Bag Token. If you do, Recover Grit up to your Max Grit.',
      };
    case 12:
      return {
        title: '"Our Savior!"',
        lore: "The prophecy tells of one who would come from far beyond the stars, to lead the people here to freedom! The faithful of this Temple's Idol believe that 'savior' is you!",
        effect:
          'Gain D3 Scrap Tokens, D3 Tech Tokens, and draw an Artifact as aid in your quest.',
      };
    default:
      return {
        title: 'The Smell of Incense',
        lore: 'Offerings to a disturbing idol and quiet chanting.',
        effect: 'No Event.',
      };
  }
}

// ---------- Idol-specific event handlers ----------

async function applyIdolEvent4(idolRoll, ctx, id, log) {
  const idol = getIdolData(idolRoll);
  if (!idol) return;
  const ev = idol.event4;
  log.push(`[Temple — ${idol.name}] (4) ${ev.name} — ${ev.lore}`);
  log.push(`Effect: ${ev.effect}`);

  switch (idolRoll) {
    // Idol 1: Hammer of Devotion — run or roll 2D6+Str, >=13 triggers countdown
    case 1: {
      const choice = await ctx.promptChoice?.(
        `THE HAMMER OF DEVOTION\n${ev.lore}\n\nYou must either run (ending your Town Stay), or take your chances and strike the Warhead!`,
        [
          { label: 'Run! (end your Town Stay)' },
          { label: 'Strike the Warhead (Roll 2D6 + Strength)' },
        ]
      );
      if (choice === 0) {
        const outcome = 'You flee the Temple! Your Town Stay is over.';
        log.push(outcome);
        await showResult(ctx, 'THE HAMMER OF DEVOTION — Result', [outcome]);
        ctx.toast?.('Hammer of Devotion: fled! Town Stay over.');
        return;
      }
      const roll1 = await ctxD6(ctx, 'Hammer of Devotion — Roll first D6');
      const roll2 = await ctxD6(ctx, 'Hammer of Devotion — Roll second D6');
      const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? null;
      const str = Number(hero?.stats?.Strength ?? hero?.Strength ?? 3);
      const total = roll1 + roll2 + str;
      const rollLine = `Rolled [${roll1}, ${roll2}] + Strength ${str} = ${total}`;
      log.push(rollLine);
      if (total >= 13) {
        const outcome = `${rollLine}\nTotal is 13 or higher — the countdown sequence triggers! This is the last day in Town for all Heroes. Every Hero takes 3 Corruption Hits from the ensuing fallout.`;
        log.push(outcome);
        await showResult(ctx, 'THE HAMMER OF DEVOTION — DETONATION!', [rollLine, '', outcome]);
        ctx.toast?.('Warhead detonates! Last day in Town. 3 Corruption Hits each!');
      } else {
        const outcome = `${rollLine}\nThe Warhead holds — no detonation. You breathe a sigh of relief.`;
        log.push(outcome);
        await showResult(ctx, 'THE HAMMER OF DEVOTION — Safe!', [rollLine, '', outcome]);
        ctx.toast?.('The Warhead holds! No effect.');
      }
      return;
    }

    // Idol 2: Sacrifice the Chosen — Strength 5+ or burned
    case 2: {
      const lore2 = `SACRIFICE THE CHOSEN\n${ev.lore}`;
      const result = await ctx.doSkillCheck(id, {
        stat: 'Strength',
        target: 5,
        returnDetails: true,
        message: `${lore2}\nOverpower the Kraken priests before they throw you into the fire pit!`,
      });
      const checkLine = formatCheckResult(result, 'Strength', 5);
      if (checkLine) log.push(checkLine);
      const passed = result?.passed ?? result;
      if (passed) {
        ctx.updateHero?.(id, (h) => ({ ...h, xp: (h.xp || 0) + 20 }));
        const outcome = 'You overpower the priests and escape the fire pit! Gain 20 XP.';
        log.push(outcome);
        await showResult(ctx, 'SACRIFICE THE CHOSEN — Result', [checkLine, '', outcome]);
        ctx.toast?.('Sacrifice the Chosen: escaped! +20 XP.');
      } else {
        const woundRoll = await ctxD6(ctx, 'Sacrifice — Roll D6 for Wounds');
        ctx.updateHero?.(id, (h) => ({
          ...h,
          currentHealth: Math.max(0, (h.currentHealth ?? h.health ?? h.maxHealth ?? 10) - woundRoll),
        }));
        const woundLine = `Rolled [${woundRoll}] Wounds (ignoring Defense).`;
        log.push(woundLine);
        const outcome = `You are badly burned and cut up! Take ${woundRoll} Wounds (ignoring Defense) and 2 Bleeding markers. Your Location Visit is over.`;
        log.push(outcome);
        await showResult(ctx, 'SACRIFICE THE CHOSEN — Result', [checkLine, woundLine, '', outcome]);
        ctx.toast?.(`Sacrifice the Chosen: ${woundRoll} Wounds + 2 Bleeding. Visit over.`);
      }
      return;
    }

    // Idol 3: Radiation Leak — leave (temple destroyed) or Cunning 6+
    case 3: {
      const choice = await ctx.promptChoice?.(
        `RADIATION LEAK\n${ev.lore}\n\nWhat do you do?`,
        [
          { label: 'Leave (Location Visit ends, Temple is Destroyed)' },
          { label: 'Try to repair the crack (Cunning 6+ test)' },
        ]
      );
      if (choice === 0) {
        const outcome = 'You flee the radiation! Your Location Visit is over and the Temple is Destroyed.';
        log.push(outcome);
        await showResult(ctx, 'RADIATION LEAK — Result', [outcome]);
        ctx.toast?.('Radiation Leak: fled. Temple Destroyed.');
        return;
      }
      const lore3 = `RADIATION LEAK\n${ev.lore}\nYou attempt to repair the crack in the Warp Drive!`;
      const result = await ctx.doSkillCheck(id, {
        stat: 'Cunning',
        target: 6,
        returnDetails: true,
        message: `${lore3}`,
      });
      const checkLine = formatCheckResult(result, 'Cunning', 6);
      if (checkLine) log.push(checkLine);
      const passed = result?.passed ?? result;
      if (passed) {
        ctx.updateHero?.(id, (h) => ({ ...h, xp: (h.xp || 0) + 25 }));
        const outcome = 'You seal the crack successfully! Gain 25 XP. No further effect.';
        log.push(outcome);
        await showResult(ctx, 'RADIATION LEAK — Repaired!', [checkLine, '', outcome]);
        ctx.toast?.('Radiation Leak: repaired! +25 XP.');
      } else {
        const corruptRoll = await ctxD6(ctx, 'Radiation Leak — Roll D6 for Corruption Hits');
        const corruptLine = `Rolled [${corruptRoll}] Corruption Hits.`;
        log.push(corruptLine);
        const outcome = `The followers catch you tampering and burn you on the core! Take ${corruptRoll} Corruption Hits. The Temple is Destroyed anyway.`;
        log.push(outcome);
        await showResult(ctx, 'RADIATION LEAK — Failed!', [checkLine, corruptLine, '', outcome]);
        ctx.toast?.(`Radiation Leak: failed! ${corruptRoll} Corruption Hits. Temple Destroyed.`);
      }
      return;
    }

    // Idol 4: Active Beacon — Luck 5+; fail = Temple + 1 building destroyed
    case 4: {
      const lore4 = `ACTIVE BEACON\n${ev.lore}`;
      const result = await ctx.doSkillCheck(id, {
        stat: 'Luck',
        target: 5,
        returnDetails: true,
        message: `${lore4}\nMake a Luck 5+ test as the signal momentarily triggers!`,
      });
      const checkLine = formatCheckResult(result, 'Luck', 5);
      if (checkLine) log.push(checkLine);
      const passed = result?.passed ?? result;
      if (passed) {
        const outcome = 'The signal fades without being received. No effect.';
        log.push(outcome);
        await showResult(ctx, 'ACTIVE BEACON — Result', [checkLine, '', outcome]);
        ctx.toast?.('Active Beacon: signal fades. No effect.');
      } else {
        const outcome = 'The beacon has been received by another Warden! It attacks the Town, immediately destroying the Temple and 1 other Random Building!';
        log.push(outcome);
        await showResult(ctx, 'ACTIVE BEACON — Warden Incoming!', [checkLine, '', outcome]);
        ctx.toast?.('Active Beacon: Warden attacks! Temple + 1 building Destroyed!');
      }
      return;
    }

    // Idol 5: New Bones for the Hall — fight 5 followers
    case 5: {
      const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? null;
      const str = Number(hero?.stats?.Strength ?? hero?.Strength ?? 3);
      const rolls = [];
      for (let i = 0; i < 5; i++) {
        const r = await ctxD6(ctx, `New Bones — Roll die ${i + 1} of 5`);
        rolls.push(r);
      }
      const defeated = rolls.filter((r) => r <= str).length;
      const notDefeated = 5 - defeated;
      const xpGain = defeated * 10;
      const wounds = notDefeated * 3;
      const rollLine = `Rolled [${rolls.join(', ')}] vs Strength ${str}: ${defeated} defeated, ${notDefeated} not defeated.`;
      log.push(rollLine);
      ctx.updateHero?.(id, (h) => ({
        ...h,
        xp: (h.xp || 0) + xpGain,
        currentHealth: Math.max(0, (h.currentHealth ?? h.health ?? h.maxHealth ?? 10) - wounds),
      }));
      const outcome = `${defeated} followers defeated (+${xpGain} XP). ${notDefeated} not defeated (${wounds} Wounds, ignoring Defense).${wounds > 0 ? ' If KO\'d, only roll D6 on the Injury Table.' : ''}`;
      log.push(outcome);
      await showResult(ctx, 'NEW BONES FOR THE HALL — Result', [rollLine, '', outcome]);
      ctx.toast?.(`New Bones: ${defeated} defeated (+${xpGain} XP), ${wounds} Wounds.`);
      return;
    }

    // Idol 6: "Something's Coming Through!" — combat encounter
    case 6: {
      const outcome = `Hideous creatures burst forth from the swirling Gate to attack the Temple!\n\nPlace the Underground Lift Blasted Wastes Map Tile with a Gate on the entrance, no exits. Every Hero at the Temple must be placed on this Map Tile. Draw a Low Threat card (normal Threat, NOT OtherWorld), re-drawing until you find a Void or Demon Enemy, to Ambush Attack the Heroes. Play out this Fight as though it were part of the next Adventure, gaining XP and Loot. No Hold Back the Darkness, Scavenge, or Fleeing. Heroes return to their Location Visit when complete.`;
      log.push(outcome);
      await showResult(ctx, '"SOMETHING\'S COMING THROUGH!" — Combat', [outcome]);
      ctx.toast?.('"Something\'s Coming Through!" — fight Void/Demon enemies!');
      return;
    }

    default:
      return;
  }
}

async function applyIdolEvent10(idolRoll, ctx, id, log) {
  const idol = getIdolData(idolRoll);
  if (!idol) return;
  const ev = idol.event10;
  log.push(`[Temple — ${idol.name}] (10) ${ev.name} — ${ev.lore}`);
  log.push(`Effect: ${ev.effect}`);

  switch (idolRoll) {
    // Idol 1: Like There's no Tomorrow — heal D6 Sanity + Grit, but -1 Location Events tomorrow
    case 1: {
      const choice = await ctx.promptChoice?.(
        `LIKE THERE'S NO TOMORROW\n${ev.lore}\n\nEvery Hero at the Temple may Heal D6 Sanity and Recover a Grit. If you do, you are -1 on any Location Event roll you make in Town tomorrow.\n\nDo you want to join the party?`,
        [
          { label: 'Yes, party on! (Heal D6 Sanity, Recover Grit, -1 to event rolls tomorrow)' },
          { label: 'No thanks' },
        ]
      );
      if (choice === 0) {
        const healRoll = await ctxD6(ctx, "Like There's no Tomorrow — Roll D6 for Sanity healing");
        ctx.updateHero?.(id, (h) => {
          const maxSanity = Number(h.maxSanity ?? h.SanityMax ?? 0);
          const curSanity = Number(h.currentSanity ?? h.sanity ?? 0);
          const newSanity = Math.min(maxSanity, curSanity + healRoll);
          const maxGrit = Number(h.maxGrit ?? h.stats?.Grit ?? 2);
          const curGrit = Number(h.currentGrit ?? h.grit ?? 0);
          const newGrit = Math.min(maxGrit, curGrit + 1);
          return {
            ...h,
            currentSanity: newSanity,
            sanity: newSanity,
            currentGrit: newGrit,
            adventureDebuffs: {
              ...(h.adventureDebuffs || {}),
              locationEventMod: ((h.adventureDebuffs?.locationEventMod) || 0) - 1,
            },
          };
        });
        const healLine = `Rolled [${healRoll}] — Healed ${healRoll} Sanity and Recovered a Grit.`;
        log.push(healLine);
        const outcome = `${healLine}\nDebuff applied: -1 on Location Event rolls in Town tomorrow.`;
        log.push(outcome);
        await showResult(ctx, "LIKE THERE'S NO TOMORROW — Result", [healLine, '', 'Debuff: -1 to Location Event rolls tomorrow.']);
        ctx.toast?.(`Party on! Healed ${healRoll} Sanity, +1 Grit, -1 events tomorrow.`);
      } else {
        const outcome = 'You decline the invitation.';
        log.push(outcome);
        await showResult(ctx, "LIKE THERE'S NO TOMORROW — Result", [outcome]);
      }
      return;
    }

    // Idol 2: Feast of Flesh — eat (-3 Sanity, +1 Lore next adv) or refuse (visit ends)
    case 2: {
      const choice = await ctx.promptChoice?.(
        `FEAST OF FLESH\n${ev.lore}\n\nThey stare at you intently. What do you do?`,
        [
          { label: 'Eat the flesh (-3 Sanity, +1 Lore next Adventure)' },
          { label: 'Refuse to eat (Location Visit ends)' },
        ]
      );
      if (choice === 0) {
        ctx.updateHero?.(id, (h) => {
          const curSanity = Number(h.currentSanity ?? h.sanity ?? 0);
          return {
            ...h,
            currentSanity: Math.max(0, curSanity - 3),
            sanity: Math.max(0, curSanity - 3),
            adventureBuffs: {
              ...(h.adventureBuffs || {}),
              bonusLore: ((h.adventureBuffs?.bonusLore) || 0) + 1,
              source: 'Feast of Flesh (Temple)',
            },
          };
        });
        const outcome = 'You choke down the grisly meal. -3 Sanity. +1 Lore next Adventure.';
        log.push(outcome);
        await showResult(ctx, 'FEAST OF FLESH — Result', [outcome]);
        ctx.toast?.('Feast of Flesh: -3 Sanity, +1 Lore next Adventure.');
      } else {
        const outcome = 'You refuse to eat. The followers glare at you as you are escorted out. Your Location Visit is over.';
        log.push(outcome);
        await showResult(ctx, 'FEAST OF FLESH — Result', [outcome]);
        ctx.toast?.('Feast of Flesh: refused. Visit over.');
      }
      return;
    }

    // Idol 3: Power for the Town — no Town Event today
    case 3: {
      const s = loadTownState() || {};
      saveTownState({ ...s, skipTownEvent: true });
      const outcome = 'The followers transfer extra power from the Warp Drive. Do not roll for a Town Event at the end of the Day today.';
      log.push(outcome);
      await showResult(ctx, 'POWER FOR THE TOWN — Result', [outcome]);
      ctx.toast?.('Power for the Town: no Town Event today.');
      return;
    }

    // Idol 4: Tinkering with Tech — gain D3 Tech Tokens
    case 4: {
      const techRoll = await ctxD3(ctx, 'Tinkering with Tech — Roll D3 for Tech Tokens');
      for (let i = 0; i < techRoll; i++) {
        await ctx.addToken?.(id, 'Tech');
      }
      const outcome = `The Cult of Steel shares their knowledge. Gain ${techRoll} Tech Token${techRoll !== 1 ? 's' : ''}.`;
      log.push(outcome);
      await showResult(ctx, 'TINKERING WITH TECH — Result', [`Rolled [${techRoll}] Tech Tokens.`, '', outcome]);
      ctx.toast?.(`Tinkering with Tech: +${techRoll} Tech Tokens.`);
      return;
    }

    // Idol 5: Parade of Skulls — all Heroes fully heal Sanity + remove 1 Corruption
    case 5: {
      ctx.updateHero?.(id, (h) => {
        const maxSanity = Number(h.maxSanity ?? h.SanityMax ?? 0);
        const corruption = Math.max(0, (h.corruption ?? 0) - 1);
        return {
          ...h,
          currentSanity: maxSanity,
          sanity: maxSanity,
          corruption,
        };
      });
      const outcome = 'A festival of death and life! Every Hero at the Temple may fully heal their Sanity and remove 1 Corruption Point.';
      log.push(outcome);
      await showResult(ctx, 'PARADE OF SKULLS — Result', [outcome]);
      ctx.toast?.('Parade of Skulls: full Sanity heal, -1 Corruption.');
      return;
    }

    // Idol 6: Visions of Tomorrow — start next Adventure with Max Grit
    case 6: {
      ctx.updateHero?.(id, (h) => ({
        ...h,
        adventureBuffs: {
          ...(h.adventureBuffs || {}),
          startWithMaxGrit: true,
          source: 'Visions of Tomorrow (Temple)',
        },
      }));
      const outcome = 'Gazing into the abyss of the Void Gate, you see visions of things yet to come! You may start the next Adventure with Max Grit.';
      log.push(outcome);
      await showResult(ctx, 'VISIONS OF TOMORROW — Result', [outcome]);
      ctx.toast?.('Visions of Tomorrow: next Adventure starts with Max Grit!');
      return;
    }

    default:
      return;
  }
}

// ---------- Core apply ----------
export async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId?.();
  if (!id) return { log: [] };

  const info = display(roll);
  const log = [];

  // Check/roll for idol on first visit
  let idolRoll = getTempleIdol();
  if (idolRoll == null) {
    idolRoll = await ctxD6(ctx, 'Temple — Roll D6 for Idol type');
    setTempleIdol(idolRoll);
    const idol = getIdolData(idolRoll);
    const idolName = idol?.name || `Unknown Idol (${idolRoll})`;
    const idolLine = `Rolled [${idolRoll}] for Temple Idol: ${idolName}.`;
    log.push(idolLine);
    if (idol?.description) log.push(idol.description);
    await showResult(ctx, 'TEMPLE — Idol Revealed', [idolLine, '', idol?.description || '']);
    ctx.toast?.(`Temple Idol: ${idolName}`);
  }

  log.push(`[Temple] (${roll}) ${info.title} — ${info.lore}`);
  log.push(`Effect: ${info.effect}`);

  // 2: Blood and Sacrifice — Luck 5+; fail = 2× Injury Table, Town Stay over
  if (roll === 2) {
    const lore2 = `BLOOD AND SACRIFICE\n${info.lore}`;
    const result = await ctx.doSkillCheck(id, {
      stat: 'Luck',
      target: 5,
      returnDetails: true,
      message: `${lore2}\nStruggle to break free from the altar!`,
    });
    const checkLine = formatCheckResult(result, 'Luck', 5);
    if (checkLine) log.push(checkLine);
    const passed = result?.passed ?? result;
    if (passed) {
      const outcome = 'You break free from the altar! The cultists scatter as you make your escape.';
      log.push(outcome);
      await showResult(ctx, 'BLOOD AND SACRIFICE — Result', [checkLine, '', outcome]);
      ctx.toast?.('Blood and Sacrifice: escaped!');
    } else {
      const outcome = 'You cannot break free! Roll twice on the Injury Table. Your Town Stay is over.';
      log.push(outcome);
      await showResult(ctx, 'BLOOD AND SACRIFICE — Result', [checkLine, '', outcome]);
      ctx.toast?.('Blood and Sacrifice: failed! 2× Injury Table. Town Stay over.');
      await ctx.enqueueChartRoll?.(id, 'injury');
      await ctx.enqueueChartRoll?.(id, 'injury');
    }
    return { log };
  }

  // 3: "Heretic!" — Cunning 6+; fail = D6 Hits, visit over
  if (roll === 3) {
    const lore3 = `"HERETIC!"\n${info.lore}`;
    const result = await ctx.doSkillCheck(id, {
      stat: 'Cunning',
      target: 6,
      returnDetails: true,
      message: `${lore3}\nTry to talk your way out of this before the mob closes in!`,
    });
    const checkLine = formatCheckResult(result, 'Cunning', 6);
    if (checkLine) log.push(checkLine);
    const passed = result?.passed ?? result;
    if (passed) {
      const outcome = 'Your silver tongue saves you! The followers grumble but let you pass.';
      log.push(outcome);
      await showResult(ctx, '"HERETIC!" — Result', [checkLine, '', outcome]);
      ctx.toast?.('"Heretic!": talked your way out!');
    } else {
      const hitRoll = await ctxD6(ctx, '"Heretic!" — Roll D6 for Hits');
      const hitLine = `Rolled [${hitRoll}] Hits.`;
      log.push(hitLine);
      ctx.updateHero?.(id, (h) => ({
        ...h,
        currentHealth: Math.max(0, (h.currentHealth ?? h.health ?? h.maxHealth ?? 10) - hitRoll),
      }));
      const outcome = `The crowd turns on you! Take ${hitRoll} Hits. Your Location Visit is over.`;
      log.push(outcome);
      await showResult(ctx, '"HERETIC!" — Result', [checkLine, hitLine, '', outcome]);
      ctx.toast?.(`"Heretic!": ${hitRoll} Hits. Visit over.`);
    }
    return { log };
  }

  // 4: Fanatical Followers — delegate to idol-specific event
  if (roll === 4) {
    await applyIdolEvent4(idolRoll, ctx, id, log);
    return { log };
  }

  // 5: "Join us..." — must buy blessing before further interaction
  if (roll === 5) {
    const idol = getIdolData(idolRoll);
    const blessingName = idol?.blessing?.name || "the Temple's Blessing";
    const outcome = `The followers demand you join their cult! You may not interact with this Location any further until you purchase ${blessingName} first.`;
    log.push(outcome);
    await showResult(ctx, '"JOIN US..." — Result', [outcome]);
    ctx.toast?.(`"Join us...": must purchase ${blessingName} to continue.`);
    return { log };
  }

  // 6-8: The Smell of Incense — No Event
  if (roll >= 6 && roll <= 8) {
    const outcome = 'Offerings to a disturbing idol and quiet chanting. No Event.';
    log.push(outcome);
    await showResult(ctx, 'THE SMELL OF INCENSE — Result', [outcome]);
    ctx.toast?.('No Event.');
    return { log };
  }

  // 9: Blessing of the Temple — gain idol's blessing for free
  if (roll === 9) {
    const idol = getIdolData(idolRoll);
    const blessing = idol?.blessing;
    if (blessing) {
      ctx.updateHero?.(id, (h) => {
        const inv = Array.isArray(h.inventory) ? [...h.inventory] : [];
        inv.push({ ...blessing, source: 'Temple Blessing (free)' });
        return { ...h, inventory: inv };
      });
      const outcome = `The priests bless your journey! You gain ${blessing.name} for free.\n\nEffects: ${blessing.effects?.join(' ') || 'None'}`;
      log.push(outcome);
      await showResult(ctx, 'BLESSING OF THE TEMPLE — Result', [outcome]);
      ctx.toast?.(`Blessing of the Temple: ${blessing.name} gained for free!`);
    } else {
      const outcome = 'The priests bless your journey! Gain the Idol\'s Blessing for free.';
      log.push(outcome);
      await showResult(ctx, 'BLESSING OF THE TEMPLE — Result', [outcome]);
    }
    return { log };
  }

  // 10: The Idol's Glory — delegate to idol-specific event
  if (roll === 10) {
    await applyIdolEvent10(idolRoll, ctx, id, log);
    return { log };
  }

  // 11: An Offering to the Gods — discard token, recover all Grit
  if (roll === 11) {
    const choice = await ctx.promptChoice?.(
      `AN OFFERING TO THE GODS\n${info.lore}\n\nYou may discard a Scrap, Tech, Dark Stone, or Side Bag Token to Recover Grit up to your Max Grit.`,
      [
        { label: 'Make an offering (discard a token, recover all Grit)' },
        { label: 'Walk away' },
      ]
    );
    if (choice === 0) {
      ctx.updateHero?.(id, (h) => {
        const maxGrit = Number(h.maxGrit ?? h.stats?.Grit ?? 2);
        return { ...h, currentGrit: maxGrit };
      });
      const outcome = 'You place your offering at the foot of the Idol. Discard 1 token. Grit recovered to Max!';
      log.push(outcome);
      await showResult(ctx, 'AN OFFERING TO THE GODS — Result', [outcome]);
      ctx.toast?.('Offering made: Grit recovered to Max!');
    } else {
      const outcome = 'You walk away from the Idol.';
      log.push(outcome);
      await showResult(ctx, 'AN OFFERING TO THE GODS — Result', [outcome]);
    }
    return { log };
  }

  // 12: "Our Savior!" — D3 Scrap, D3 Tech, draw Artifact
  if (roll === 12) {
    const scrapRoll = await ctxD3(ctx, '"Our Savior!" — Roll D3 for Scrap Tokens');
    const techRoll = await ctxD3(ctx, '"Our Savior!" — Roll D3 for Tech Tokens');
    for (let i = 0; i < scrapRoll; i++) {
      await ctx.addToken?.(id, 'Scrap');
    }
    for (let i = 0; i < techRoll; i++) {
      await ctx.addToken?.(id, 'Tech');
    }
    const tokenLine = `Rolled [${scrapRoll}] Scrap Tokens, [${techRoll}] Tech Tokens.`;
    log.push(tokenLine);
    const outcome = `The faithful believe you are their savior! Gain ${scrapRoll} Scrap Token${scrapRoll !== 1 ? 's' : ''}, ${techRoll} Tech Token${techRoll !== 1 ? 's' : ''}, and draw an Artifact as aid in your quest.\n\nThis bonus repeats each Town Stay at a Temple with the same Idol (until you have 8 Corruption or 3 Mutations).`;
    log.push(outcome);
    await showResult(ctx, '"OUR SAVIOR!" — Result', [tokenLine, '', outcome]);
    ctx.toast?.(`"Our Savior!": +${scrapRoll} Scrap, +${techRoll} Tech, draw an Artifact!`);
    return { log };
  }

  return { log };
}

// --------- Dispatcher compatible with locationEventsEngine ---------------
export async function handleTempleEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? (_d6() + _d6());
  const result = await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: result?.log || [`Temple Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

export const templeHandler = { display, apply };
export default templeHandler;
