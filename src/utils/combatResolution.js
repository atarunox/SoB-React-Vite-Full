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

    const doAutoDef = await ui.promptYesNo?.({
      message:
        `Defense (per Hit): ${incomingHits} incoming hit(s).\n` +
        `Auto-roll Defense now${Number.isFinite(defTargetGuess) ? ` (target ${defTargetGuess}+)` : ''}?`,
    });

    if (doAutoDef) {
      const target = Number.isFinite(defTargetGuess)
        ? defTargetGuess
        : (Number(await ui.promptNumber?.({
            title: 'Defense Target',
            message: 'Enter Defense target (e.g., 4 for 4+):',
            min: 2, max: 6, defaultValue: 4,
          })) || 4);

      const rolls = await ui.roll(incomingHits, 6, `Defense — ${incomingHits}d6 vs ${target}+ (1 success ignores 1 hit)`);
      const arr = Array.isArray(rolls) ? rolls : [rolls];
      const blocks = arr.filter(n => n >= target).length;
      incomingHits = Math.max(0, incomingHits - blocks);
      await ui.toast?.(`Defense blocked ${blocks} hit(s). Hits getting through: ${incomingHits}.`);
    } else {
      const fails = Number(await ui.promptNumber?.({
        title: 'Manual Defense',
        message: `How many Defense rolls FAILED (of ${incomingHits})?`,
        min: 0, max: incomingHits, defaultValue: incomingHits,
      })) || incomingHits;
      incomingHits = Math.max(0, Math.min(incomingHits, fails));
      await ui.toast?.(`Manual Defense: Hits getting through = ${incomingHits}.`);
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
      const doAutoArmor = await ui.promptYesNo?.({
        message: `Auto-roll Armor now (target ${armorTargetGuess}+)?`,
      });

      if (doAutoArmor) {
        const rolls = await ui.roll(pendingWounds, 6, `Armor — ${pendingWounds}d6 vs ${armorTargetGuess}+`);
        const arr = Array.isArray(rolls) ? rolls : [rolls];
        const ignores = arr.filter(n => n >= armorTargetGuess).length;
        pendingWounds = Math.max(0, pendingWounds - ignores);
        await ui.toast?.(`Armor ignored ${ignores} wound(s). Final Wounds: ${pendingWounds}.`);
      } else {
        const armorBlocks = Number(await ui.promptNumber?.({
          title: 'Manual Armor',
          message: `How many Armor rolls SUCCEEDED (of ${pendingWounds})?`,
          min: 0, max: pendingWounds, defaultValue: 0,
        })) || 0;
        pendingWounds = Math.max(0, pendingWounds - armorBlocks);
        await ui.toast?.(`Manual Armor: Final Wounds = ${pendingWounds}.`);
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

    const doAutoWP = await ui.promptYesNo?.({
      message:
        `Willpower (per Hit): ${incomingHits} incoming sanity hit(s).\n` +
        `Auto-roll Willpower now${Number.isFinite(wpTargetGuess) ? ` (target ${wpTargetGuess}+)` : ''}?`,
    });

    if (doAutoWP) {
      const target = Number.isFinite(wpTargetGuess)
        ? wpTargetGuess
        : (Number(await ui.promptNumber?.({
            title: 'Willpower Target',
            message: 'Enter Willpower target (e.g., 5 for 5+):',
            min: 2, max: 6, defaultValue: 5,
          })) || 5);

      const rolls = await ui.roll(incomingHits, 6, `Willpower — ${incomingHits}d6 vs ${target}+ (1 success ignores 1 hit)`);
      const arr = Array.isArray(rolls) ? rolls : [rolls];
      const blocks = arr.filter(n => n >= target).length;
      incomingHits = Math.max(0, incomingHits - blocks);
      await ui.toast?.(`Willpower blocked ${blocks} hit(s). Hits getting through: ${incomingHits}.`);
    } else {
      const fails = Number(await ui.promptNumber?.({
        title: 'Manual Willpower',
        message: `How many Willpower rolls FAILED (of ${incomingHits})?`,
        min: 0, max: incomingHits, defaultValue: incomingHits,
      })) || incomingHits;
      incomingHits = Math.max(0, Math.min(incomingHits, fails));
      await ui.toast?.(`Manual Willpower: Hits getting through = ${incomingHits}.`);
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
      const doAutoSA = await ui.promptYesNo?.({
        message: `Auto-roll Spirit Armor now (target ${saTargetGuess}+)?`,
      });

      if (doAutoSA) {
        const rolls = await ui.roll(pendingWounds, 6, `Spirit Armor — ${pendingWounds}d6 vs ${saTargetGuess}+`);
        const arr = Array.isArray(rolls) ? rolls : [rolls];
        const ignores = arr.filter(n => n >= saTargetGuess).length;
        pendingWounds = Math.max(0, pendingWounds - ignores);
        await ui.toast?.(`Spirit Armor ignored ${ignores} wound(s). Final Sanity Wounds: ${pendingWounds}.`);
      } else {
        const saBlocks = Number(await ui.promptNumber?.({
          title: 'Manual Spirit Armor',
          message: `How many Spirit Armor rolls SUCCEEDED (of ${pendingWounds})?`,
          min: 0, max: pendingWounds, defaultValue: 0,
        })) || 0;
        pendingWounds = Math.max(0, pendingWounds - saBlocks);
        await ui.toast?.(`Manual Spirit Armor: Final Sanity Wounds = ${pendingWounds}.`);
      }
    }
  }

  return pendingWounds;
}
