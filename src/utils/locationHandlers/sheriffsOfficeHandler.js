import { loadTownState, saveTownState } from '../../utils/townState';
import { d6 } from '../../utils/diceHelpers';

function display(roll) {
  switch (roll) {
    case 2:
      return { title: 'Jailbreak', lore: 'Outlaws storm the jail at dawn.', effect: 'Next Adventure: Town “Jailbreak”. All Heroes Wanted until end of next Adventure (no Grit).' };
    case 3:
      return { title: 'Corrupt Sheriff', lore: 'Power has gone to his head.', effect: 'Law Heroes must Flee or challenge (Spirit 5+). Fail: Injury.' };
    case 4:
      return { title: 'Insane Ramblings', lore: 'Whispers from the cell block.', effect: 'Take 2D6 Horror Hits; doubles advance Darkness by 2.' };
    case 5:
    case 6:
    case 7:
    case 8:
      return { title: 'Cold, Hard Justice', lore: 'Business as usual.', effect: 'No Event.' };
    case 9:
      return { title: 'Telegraph', lore: 'Bad weather on the wire.', effect: 'Recover 1 Grit and Heal D6 Wounds/Sanity (any mix).' };
    case 10:
      return { title: '“We need Six Men!”', lore: 'A call to arms.', effect: 'Non-Law/Holy here become Deputized for free today. Manhunt awards double XP & Gold today.' };
    case 11:
    case 12:
      return { title: 'Legendary Outlaw', lore: '“Sparky” is in the cells.', effect: 'Escort Prisoner today uses Lore 6+; reward becomes D8×$100 if successful.' };
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
    if (!ok) await ctx.enqueueChartRoll?.(id, 'injury');
    return;
  }

  if (roll === 4) {
    ctx.toast?.('Take 2D6 Horror Hits (prompt). On doubles, advance Darkness by 2.');
    return;
  }

  if (roll === 9) {
    const heal = (await ctx.promptNumber?.('Heal D6 Wounds/Sanity (any mix) — roll D6', 'die')) ?? d6();
    ctx.updateHero?.(id, (h) => {
      const grit = Math.min((h.maxGrit ?? 2), (h.grit ?? 0) + 1);
      return { ...h, grit };
    });
    ctx.toast?.(`Recover 1 Grit and heal ${heal} (any mix).`);
    return;
  }

  if (roll === 10) {
    const here = ctx.getHeroesAtShop?.('sheriffsOffice') || [id];
    for (const hid of here) {
      const h = ctx.getHeroById?.(hid) || {};
      const isLaw = (h.keywords || []).includes('Law');
      const isHoly = (h.keywords || []).includes('Holy');
      if (!isLaw && !isHoly) ctx.addKeyword?.(hid, 'Deputized'); // temp tag
    }
    const s = loadTownState();
    saveTownState({ ...s, sheriffsOfficeFlags: { ...(s.sheriffsOfficeFlags || {}), manhuntDoubleRewardsToday: true } });
    return;
  }

  if (roll === 11 || roll === 12) {
    const s = loadTownState();
    saveTownState({ ...s, sheriffsOfficeFlags: { ...(s.sheriffsOfficeFlags || {}), escortLegendaryBonusToday: true } });
    return;
  }
}

export async function handleSheriffsOfficeEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? (d6() + d6());
  await apply(roll, ctx);
  return { log: [`Sheriff’s Office Event Roll: ${roll}`], eventRoll: roll, eventIndex: Math.max(0, roll - 2) };
}

export const sheriffsOfficeHandler = { display, apply };

// NEW: re-export the service executor so imports from the handler keep working
export { performSheriffsOfficeService } from './sheriffsOfficeServices';
