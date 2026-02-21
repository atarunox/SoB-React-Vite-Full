import { loadTownState, saveTownState } from '../../utils/townState';
import { d6 } from '../../utils/diceHelpers';

function display(roll) {
  switch (roll) {
    case 2:
      return { title: 'Jailbreak', lore: 'Outlaws storm the jail at dawn.', effect: 'Next Adventure: Town "Jailbreak". All Heroes Wanted until end of next Adventure (no Grit).' };
    case 3:
      return { title: 'Corrupt Sheriff', lore: 'Power has gone to his head.', effect: 'Law Heroes must Flee or challenge (Spirit 5+). Pass: +50 XP and D6×$50. Fail: Injury.' };
    case 4:
      return { title: 'Insane Ramblings', lore: 'Whispers from the cell block.', effect: 'Take 2D6 Horror Hits; doubles advance Darkness by 2.' };
    case 5:
    case 6:
    case 7:
    case 8:
      return { title: 'Cold, Hard Justice', lore: 'Business as usual.', effect: 'No Event.' };
    case 9:
    case 10:
      return { title: 'Telegraph', lore: 'Bad weather on the wire.', effect: 'Recover 1 Grit and Heal D6 Wounds/Sanity (any mix).' };
    case 11:
      return { title: '"We need Six Men!"', lore: 'A call to arms.', effect: 'Non-Law/Holy here become Deputized for free today. Manhunt awards double XP & Gold today.' };
    case 12:
      return { title: 'Legendary Outlaw', lore: '"Sparky" is in the cells.', effect: 'Escort Prisoner today uses Lore 6+; reward becomes D8×$100 if successful.' };
    default:
      return { title: 'Quiet Day', lore: '', effect: 'No Event.' };
  }
}

async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId?.();
  if (!id) return;

  if (roll === 2) {
    const s = loadTownState();
    saveTownState({
      ...s,
      nextAdventure: 'Town:Jailbreak',
      globalRules: { ...(s.globalRules || {}), allWantedNextAdventure: true, noGritNextAdventure: true },
    });
    return;
  }

  if (roll === 3) {
    const ok = await ctx.doSkillCheck?.(id, { stat: 'Spirit', target: 5, prompt: true });
    if (ok) {
      const gold = d6() * 50;
      ctx.updateHero?.(id, (h) => ({
        ...h,
        xp: (h.xp || 0) + 50,
        gold: (h.gold || 0) + gold,
      }));
      ctx.toast?.(`Corrupt Sheriff defeated! +50 XP, +$${gold}.`);
    } else {
      await ctx.enqueueChartRoll?.(id, 'injury');
      ctx.toast?.('The sheriff guns you down — roll on the Injury chart.');
    }
    return;
  }

  // 4: Insane Ramblings — 2D6 Horror Hits; on doubles advance Darkness by 2
  if (roll === 4) {
    const die1 = d6();
    const die2 = d6();
    const total = die1 + die2;
    const doubles = die1 === die2;

    const raw = window.prompt(
      `Insane Ramblings\n\n` +
      `"A prisoner babbles about the Void and the insignificance of mankind, ` +
      `and the madness seeps into your mind."\n\n` +
      `Take 2D6 Horror Hits. If doubles, also advance Darkness by 2.\n\n` +
      `Enter 2D6 total (2-12), or leave blank to auto-roll (${die1}+${die2}=${total}):`,
      ''
    );

    let horrorTotal;
    let isDoubles = doubles;
    if (raw == null || raw.trim() === '') {
      horrorTotal = total;
    } else {
      const n = Number(raw);
      horrorTotal = (Number.isFinite(n) && n >= 2 && n <= 12) ? n : total;
      // If manually entered, ask about doubles
      if (Number.isFinite(n)) {
        isDoubles = window.confirm('Were the dice doubles?');
      }
    }

    ctx.updateHero?.(id, (h) => {
      const curSanity = Number(h.currentSanity ?? h.sanity ?? 0);
      const nextSanity = Math.max(0, curSanity - horrorTotal);
      return { ...h, sanity: nextSanity, currentSanity: nextSanity };
    });

    if (isDoubles) {
      const s = loadTownState();
      const darkness = Number(s.darknessTrack ?? 0) + 2;
      saveTownState({ ...s, darknessTrack: darkness });
      window.alert(`Insane Ramblings — took ${horrorTotal} Horror Hits (doubles!).\nDarkness advanced by 2.`);
      ctx.toast?.(`Insane Ramblings: ${horrorTotal} Horror Hits (doubles — Darkness +2).`);
    } else {
      window.alert(`Insane Ramblings — took ${horrorTotal} Horror Hits.`);
      ctx.toast?.(`Insane Ramblings: ${horrorTotal} Horror Hits.`);
    }
    return;
  }

  // 9-10: Telegraph — Recover 1 Grit and Heal D6 Wounds/Sanity (any mix)
  if (roll === 9 || roll === 10) {
    const healTotal = d6();
    const rawHeal = window.prompt(
      `Telegraph\n\n` +
      `"An urgent wire brings news of a looming Void storm, ` +
      `stiffening your resolve for what's ahead."\n\n` +
      `Recover 1 Grit and Heal up to D6 Wounds and/or Sanity (any mix).\n` +
      `Total heal pool: ${healTotal}\n\n` +
      `How much to heal Health? (remainder goes to Sanity)\n` +
      `Enter 0-${healTotal}:`,
      String(healTotal)
    );
    const healthHeal = (() => {
      if (rawHeal == null) return healTotal;
      const n = Number(rawHeal);
      return (Number.isFinite(n) && n >= 0 && n <= healTotal) ? n : healTotal;
    })();
    const sanityHeal = healTotal - healthHeal;

    ctx.updateHero?.(id, (h) => {
      const maxGrit = h.maxGrit ?? 2;
      const grit = Math.min(maxGrit, (h.grit ?? 0) + 1);
      const maxHp = Number(h.maxHealth ?? h.max_health ?? 10);
      const curHp = Number(h.currentHealth ?? h.health ?? maxHp);
      const newHp = Math.min(maxHp, curHp + healthHeal);
      const maxSan = Number(h.maxSanity ?? h.SanityMax ?? 0);
      const curSan = Number(h.currentSanity ?? h.sanity ?? maxSan);
      const newSan = Math.min(maxSan, curSan + sanityHeal);
      return {
        ...h,
        grit,
        health: newHp, currentHealth: newHp,
        sanity: newSan, currentSanity: newSan,
      };
    });
    ctx.toast?.(`Telegraph: +1 Grit, healed ${healthHeal} Health and ${sanityHeal} Sanity.`);
    return;
  }

  // 11: "We need Six Men!" — Non-Law/Holy become Deputized; Manhunt double rewards
  if (roll === 11) {
    const here = ctx.getHeroesAtShop?.('sheriffsOffice') || [id];
    for (const hid of here) {
      const h = ctx.getHeroById?.(hid) || {};
      const isLaw = (h.keywords || []).includes('Law');
      const isHoly = (h.keywords || []).includes('Holy');
      if (!isLaw && !isHoly) ctx.addKeyword?.(hid, 'Deputized');
    }
    const s = loadTownState();
    saveTownState({ ...s, sheriffsOfficeFlags: { ...(s.sheriffsOfficeFlags || {}), manhuntDoubleRewardsToday: true } });
    ctx.toast?.('"We need Six Men!" — Non-Law/Holy Heroes become Deputized. Manhunt double XP & Gold today.');
    return;
  }

  // 12: Legendary Outlaw — Escort Prisoner uses Lore 6+, reward D8×$100
  if (roll === 12) {
    const s = loadTownState();
    saveTownState({ ...s, sheriffsOfficeFlags: { ...(s.sheriffsOfficeFlags || {}), escortLegendaryBonusToday: true } });
    ctx.toast?.('Legendary Outlaw — Escort Prisoner today uses Lore 6+ but rewards D8×$100.');
    return;
  }
}

export async function handleSheriffsOfficeEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? (d6() + d6());
  await apply(roll, ctx);
  return { log: [`Sheriff's Office Event Roll: ${roll}`], eventRoll: roll, eventIndex: Math.max(0, roll - 2) };
}

export const sheriffsOfficeHandler = { display, apply };

// NEW: re-export the service executor so imports from the handler keep working
export { performSheriffsOfficeService } from './sheriffsOfficeServices';
