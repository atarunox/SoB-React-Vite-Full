// src/utils/combatResolution.js

const d6 = () => Math.floor(Math.random() * 6) + 1;
const parsePlusTarget = (v) => {
  if (v == null) return NaN;
  if (typeof v === 'string') {
    const m = v.match(/\d+/);
    return m ? Number(m[0]) : NaN;
  }
  if (typeof v === 'number') return v;
  return NaN;
};

/**
 * HP path:
 *   - Defense rolls once per Hit (success ignores the entire Hit)
 *   - Armor rolls once per resulting Wound (success ignores that wound)
 */
export async function resolveDefensePerHitThenArmorPerWound({ ui, hero, hits, woundsPerHit, getStat }) {
  let incomingHits = Math.max(0, Math.floor(hits));

  // DEFENSE (per Hit)
  if (incomingHits > 0) {
    const defTargetGuess =
      parsePlusTarget(getStat(hero, 'Defense')) ||
      parsePlusTarget(hero?.defense) ||
      NaN;

    const target = Number.isFinite(defTargetGuess)
      ? defTargetGuess
      : (Number(await ui.promptNumber?.({
          title: 'Defense Target',
          message: 'Enter Defense target (e.g., 4 for 4+):',
          min: 2, max: 6, defaultValue: 4,
        })) || 4);

    // Build clear prompt message
    const heroName = hero?.name || 'Hero';
    const defenseMsg = Number.isFinite(defTargetGuess)
      ? `${incomingHits} Hits incoming. ${heroName} has Defense ${target}+.\n\nRoll ${incomingHits}d6. How many PASSED (${target}+ on each die)?\n\n[Enter -1 to auto-roll]`
      : `${incomingHits} Hits incoming.\n\nRoll ${incomingHits}d6 Defense (target ${target}+). How many PASSED?\n\n[Enter -1 to auto-roll]`;

    const passedCount = Number(await ui.promptNumber?.({
      title: 'Defense Roll',
      message: defenseMsg,
      min: -1,
      max: incomingHits,
      defaultValue: -1,
    }));

    if (passedCount === -1 || !Number.isFinite(passedCount)) {
      // Auto-roll
      const rolls = await ui.roll(incomingHits, 6, `Defense — ${incomingHits}d6 vs ${target}+ (1 success blocks 1 hit)`);
      const arr = Array.isArray(rolls) ? rolls : [rolls];
      const blocks = arr.filter(n => n >= target).length;
      incomingHits = Math.max(0, incomingHits - blocks);
      await ui.toast?.(`Defense: ${blocks} passed, ${incomingHits} hit(s) getting through.`);
    } else {
      // Manual entry
      const blocks = Math.max(0, Math.min(incomingHits, Math.floor(passedCount)));
      incomingHits = Math.max(0, incomingHits - blocks);
      await ui.toast?.(`Defense: ${blocks} passed, ${incomingHits} hit(s) getting through.`);
    }
  }

  // Convert remaining hits into wounds
  let pendingWounds = incomingHits * Math.max(0, Math.floor(woundsPerHit));

  // ARMOR (per wound) — auto-detect
  if (pendingWounds > 0) {
    const armorTargetGuess =
      parsePlusTarget(getStat(hero, 'Armor')) ||
      parsePlusTarget(hero?.armor) ||
      NaN;

    if (Number.isFinite(armorTargetGuess)) {
      const heroName = hero?.name || 'Hero';
      const armorMsg = `${pendingWounds} Wound(s) incoming. ${heroName} has Armor ${armorTargetGuess}+.\n\nRoll ${pendingWounds}d6. How many PASSED (${armorTargetGuess}+ on each die)?\n\n[Enter -1 to auto-roll]`;

      const passedCount = Number(await ui.promptNumber?.({
        title: 'Armor Roll',
        message: armorMsg,
        min: -1,
        max: pendingWounds,
        defaultValue: -1,
      }));

      if (passedCount === -1 || !Number.isFinite(passedCount)) {
        // Auto-roll
        const rolls = await ui.roll(pendingWounds, 6, `Armor — ${pendingWounds}d6 vs ${armorTargetGuess}+ (1 success blocks 1 wound)`);
        const arr = Array.isArray(rolls) ? rolls : [rolls];
        const ignores = arr.filter(n => n >= armorTargetGuess).length;
        pendingWounds = Math.max(0, pendingWounds - ignores);
        await ui.toast?.(`Armor: ${ignores} passed. Final Wounds: ${pendingWounds}.`);
      } else {
        // Manual entry
        const ignores = Math.max(0, Math.min(pendingWounds, Math.floor(passedCount)));
        pendingWounds = Math.max(0, pendingWounds - ignores);
        await ui.toast?.(`Armor: ${ignores} passed. Final Wounds: ${pendingWounds}.`);
      }
    }
  }

  return pendingWounds;
}

/**
 * Sanity path:
 *   - Willpower rolls once per Hit (success ignores the entire Hit)
 *   - Spirit Armor rolls once per resulting Wound (success ignores that wound)
 */
export async function resolveWillpowerPerHitThenSpiritArmorPerWound({ ui, hero, hits, woundsPerHit, getStat }) {
  let incomingHits = Math.max(0, Math.floor(hits));

  // WILLPOWER (per Hit)
  if (incomingHits > 0) {
    const wpTargetGuess =
      parsePlusTarget(getStat(hero, 'Willpower')) ||
      parsePlusTarget(hero?.willpower) ||
      NaN;

    const target = Number.isFinite(wpTargetGuess)
      ? wpTargetGuess
      : (Number(await ui.promptNumber?.({
          title: 'Willpower Target',
          message: 'Enter Willpower target (e.g., 5 for 5+):',
          min: 2, max: 6, defaultValue: 5,
        })) || 5);

    // Build clear prompt message
    const heroName = hero?.name || 'Hero';
    const willpowerMsg = Number.isFinite(wpTargetGuess)
      ? `${incomingHits} Horror Hits incoming. ${heroName} has Willpower ${target}+.\n\nRoll ${incomingHits}d6. How many PASSED (${target}+ on each die)?\n\n[Enter -1 to auto-roll]`
      : `${incomingHits} Horror Hits incoming.\n\nRoll ${incomingHits}d6 Willpower (target ${target}+). How many PASSED?\n\n[Enter -1 to auto-roll]`;

    const passedCount = Number(await ui.promptNumber?.({
      title: 'Willpower Roll',
      message: willpowerMsg,
      min: -1,
      max: incomingHits,
      defaultValue: -1,
    }));

    if (passedCount === -1 || !Number.isFinite(passedCount)) {
      // Auto-roll
      const rolls = await ui.roll(incomingHits, 6, `Willpower — ${incomingHits}d6 vs ${target}+ (1 success blocks 1 hit)`);
      const arr = Array.isArray(rolls) ? rolls : [rolls];
      const blocks = arr.filter(n => n >= target).length;
      incomingHits = Math.max(0, incomingHits - blocks);
      await ui.toast?.(`Willpower: ${blocks} passed, ${incomingHits} hit(s) getting through.`);
    } else {
      // Manual entry
      const blocks = Math.max(0, Math.min(incomingHits, Math.floor(passedCount)));
      incomingHits = Math.max(0, incomingHits - blocks);
      await ui.toast?.(`Willpower: ${blocks} passed, ${incomingHits} hit(s) getting through.`);
    }
  }

  // Convert remaining hits into sanity wounds
  let pendingWounds = incomingHits * Math.max(0, Math.floor(woundsPerHit));

  // SPIRIT ARMOR (per wound) — auto-detect
  if (pendingWounds > 0) {
    const saTargetGuess =
      parsePlusTarget(getStat(hero, 'Spirit Armor')) ||
      parsePlusTarget(hero?.spiritArmor) ||
      NaN;

    if (Number.isFinite(saTargetGuess)) {
      const heroName = hero?.name || 'Hero';
      const spiritArmorMsg = `${pendingWounds} Sanity Wound(s) incoming. ${heroName} has Spirit Armor ${saTargetGuess}+.\n\nRoll ${pendingWounds}d6. How many PASSED (${saTargetGuess}+ on each die)?\n\n[Enter -1 to auto-roll]`;

      const passedCount = Number(await ui.promptNumber?.({
        title: 'Spirit Armor Roll',
        message: spiritArmorMsg,
        min: -1,
        max: pendingWounds,
        defaultValue: -1,
      }));

      if (passedCount === -1 || !Number.isFinite(passedCount)) {
        // Auto-roll
        const rolls = await ui.roll(pendingWounds, 6, `Spirit Armor — ${pendingWounds}d6 vs ${saTargetGuess}+ (1 success blocks 1 wound)`);
        const arr = Array.isArray(rolls) ? rolls : [rolls];
        const ignores = arr.filter(n => n >= saTargetGuess).length;
        pendingWounds = Math.max(0, pendingWounds - ignores);
        await ui.toast?.(`Spirit Armor: ${ignores} passed. Final Sanity Wounds: ${pendingWounds}.`);
      } else {
        // Manual entry
        const ignores = Math.max(0, Math.min(pendingWounds, Math.floor(passedCount)));
        pendingWounds = Math.max(0, pendingWounds - ignores);
        await ui.toast?.(`Spirit Armor: ${ignores} passed. Final Sanity Wounds: ${pendingWounds}.`);
      }
    }
  }

  return pendingWounds;
}
