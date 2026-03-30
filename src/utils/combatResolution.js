// src/utils/combatResolution.js
//
// Complete combat resolution system for Shadows of Brimstone.
// Handles both hero attacks (vs enemies) and enemy attacks (vs heroes),
// plus post-combat healing.

import { d6, d3, rollND, sum, clamp } from './diceHelpers';

/* ==================== Helpers ==================== */

const MAX_ATTACK_DICE = 8;

/** Parse a "4+" threshold string to numeric value. */
export function parsePlusTarget(v) {
  if (v == null) return NaN;
  if (typeof v === 'string') {
    const m = v.match(/\d+/);
    return m ? Number(m[0]) : NaN;
  }
  if (typeof v === 'number') return v;
  return NaN;
}

/** Roll N d6 and return the array. */
function rollDice(count) {
  return Array.from({ length: Math.max(0, count) }, () => d6());
}

/** Check if an ability text contains a keyword (case-insensitive). */
function abilityHas(abilities, keyword) {
  if (!Array.isArray(abilities)) return false;
  const lc = keyword.toLowerCase();
  return abilities.some(a => typeof a === 'string' && a.toLowerCase().includes(lc));
}

/** Extract Endurance(X) value from abilities. Returns null if not present. */
function getEndurance(abilities) {
  if (!Array.isArray(abilities)) return null;
  for (const a of abilities) {
    if (typeof a !== 'string') continue;
    const m = a.match(/endurance\s*\(?(\d+)\)?/i);
    if (m) return Number(m[1]);
  }
  return null;
}

/** Extract "Reduce all damage by X" from abilities. Returns 0 if not present. */
function getDamageReduction(abilities) {
  if (!Array.isArray(abilities)) return 0;
  for (const a of abilities) {
    if (typeof a !== 'string') continue;
    const m = a.match(/reduce\s+all\s+damage\s+(?:taken\s+)?by\s+(\d+)/i);
    if (m) return Number(m[1]);
  }
  return 0;
}

/** Check if enemy has Tough (immune to crits). */
function isTough(abilities) {
  return abilityHas(abilities, 'tough');
}

/** Extract Cover X+ from abilities. Returns { target, types } or null. */
function getCover(abilities) {
  if (!Array.isArray(abilities)) return null;
  for (const a of abilities) {
    if (typeof a !== 'string') continue;
    const m = a.match(/cover\s+(\d+)\+/i);
    if (m) return { target: Number(m[1]), text: a };
  }
  return null;
}

/* ==================== Hero Attack vs Enemy ==================== */

/**
 * Full hero attack resolution against an enemy group.
 *
 * @param {object} opts
 * @param {object} opts.ui            - UI callbacks: { roll, promptNumber, promptYesNo, promptChoice, toast }
 * @param {object} opts.hero          - Hero object
 * @param {object} opts.weapon        - Weapon: { toHit, damage?, type: 'melee'|'ranged' }
 * @param {number} opts.dicePool      - Number of attack dice (Combat for melee, Shots for ranged)
 * @param {object} opts.enemy         - Enemy stats: { defense, armor, health, abilities, ... }
 * @param {object} [opts.offHand]     - Off-hand weapon if dual-wielding: { toHit, damage?, dicePool }
 * @param {object} [opts.conditionRules] - From getConditionRules(hero)
 * @param {function} [opts.getStat]   - (hero, statName) => value
 *
 * @returns {object} { totalWounds, log, crits, hits, damageRolls }
 */
export async function resolveHeroAttack({
  ui, hero, weapon, dicePool, enemy, offHand = null, conditionRules = null, getStat,
}) {
  const log = [];
  let totalWoundsDealt = 0;
  const isDualWield = !!offHand;

  // Build attack list: main-hand (and optionally off-hand)
  const attacks = [];
  const mainDice = Math.min(MAX_ATTACK_DICE, Math.max(0, Math.floor(dicePool)));
  const mainToHit = parsePlusTarget(weapon.toHit);

  if (isDualWield) {
    // Dual-wield: split dice, off-hand needs +1 higher to hit, neither can crit
    const offDice = Math.min(MAX_ATTACK_DICE, Math.max(0, Math.floor(offHand.dicePool ?? Math.floor(mainDice / 2))));
    const offToHit = parsePlusTarget(offHand.toHit);

    attacks.push({
      label: 'Main Hand',
      dice: mainDice,
      toHit: mainToHit,
      canCrit: false, // Neither weapon can crit when dual-wielding
    });
    attacks.push({
      label: 'Off Hand',
      dice: offDice,
      toHit: Math.min(6, offToHit + 1), // Off-hand needs 1 higher to hit
      canCrit: false,
    });
    log.push(`Dual-wielding: Main Hand ${mainDice}d6 (${mainToHit}+), Off Hand ${offDice}d6 (${Math.min(6, offToHit + 1)}+ — +1 penalty). Neither weapon can crit.`);
  } else {
    // Determine if crits are possible
    let canCrit = true;
    if (conditionRules) {
      const type = weapon.type || 'melee';
      if (conditionRules.noCrit?.all) canCrit = false;
      else if (type === 'melee' && conditionRules.noCrit?.melee) canCrit = false;
      else if (type === 'ranged' && conditionRules.noCrit?.ranged) canCrit = false;
    }
    attacks.push({
      label: 'Attack',
      dice: mainDice,
      toHit: mainToHit,
      canCrit,
    });
    log.push(`${weapon.type === 'ranged' ? 'Ranged' : 'Melee'} Attack: ${mainDice}d6, To-Hit ${mainToHit}+${canCrit ? '' : ' (no crits)'}`);
  }

  // Enemy properties
  const enemyDefense = Number(enemy.defense) || 0;
  const enemyArmor = parsePlusTarget(enemy.armor);
  const abilities = enemy.abilities || [];
  const tough = isTough(abilities);
  const endurance = getEndurance(abilities);
  const dmgReduction = getDamageReduction(abilities);
  const cover = getCover(abilities);

  if (tough) log.push('Enemy is Tough — immune to Critical Hits (Defense still applies on 6s).');
  if (endurance != null) log.push(`Enemy has Endurance (${endurance}) — max ${endurance} wound(s) per Hit.`);
  if (dmgReduction > 0) log.push(`Enemy has Damage Reduction ${dmgReduction} (min 1 wound per damage die).`);
  if (cover) log.push(`Enemy has ${cover.text}.`);

  // Process each attack (main-hand, off-hand)
  for (const atk of attacks) {
    if (atk.dice <= 0 || !Number.isFinite(atk.toHit)) {
      log.push(`${atk.label}: No dice to roll.`);
      continue;
    }

    // Step 1: Roll To-Hit
    const rolls = await ui.roll(atk.dice, 6,
      `${atk.label} — ${atk.dice}d6 vs ${atk.toHit}+ To-Hit`);
    const rollArr = Array.isArray(rolls) ? rolls : [rolls];
    log.push(`${atk.label} To-Hit: Rolled [${rollArr.join(', ')}] vs ${atk.toHit}+`);

    // Separate hits and crits
    const normalHits = [];
    const critHits = [];
    for (const r of rollArr) {
      if (r >= 6 && atk.canCrit && !tough) {
        critHits.push(r);
      } else if (r >= atk.toHit) {
        normalHits.push(r);
      }
    }

    // If enemy is Tough, 6s are normal hits (Defense still applies)
    if (tough) {
      for (const r of rollArr) {
        if (r >= 6 && atk.canCrit) {
          normalHits.push(r); // treated as normal hit
        }
      }
    }

    const totalHits = normalHits.length + critHits.length;
    log.push(`${atk.label}: ${totalHits} hit(s) (${normalHits.length} normal, ${critHits.length} critical).`);
    await ui.toast?.(`${atk.label}: ${totalHits} hit(s)!`);

    if (totalHits === 0) continue;

    // Step 2: Roll Damage for each hit
    // Normal hits: D6 damage, subtract enemy Defense
    let woundsFromNormal = 0;
    if (normalHits.length > 0) {
      const dmgRolls = await ui.roll(normalHits.length, 6,
        `${atk.label} — ${normalHits.length}d6 Damage (normal hits)`);
      const dmgArr = Array.isArray(dmgRolls) ? dmgRolls : [dmgRolls];
      log.push(`Normal Damage: Rolled [${dmgArr.join(', ')}], Enemy Defense ${enemyDefense}`);

      for (const dmg of dmgArr) {
        let wounds = Math.max(0, dmg - enemyDefense);
        // Apply Damage Reduction
        if (dmgReduction > 0 && wounds > 0) {
          wounds = Math.max(1, wounds - dmgReduction);
        }
        // Apply Endurance cap
        if (endurance != null) {
          wounds = Math.min(endurance, wounds);
        }
        woundsFromNormal += wounds;
      }
      log.push(`Normal hits dealt ${woundsFromNormal} wound(s) after Defense/DR/Endurance.`);
    }

    // Critical hits: D6 damage, IGNORE enemy Defense
    let woundsFromCrits = 0;
    if (critHits.length > 0) {
      const critDmgRolls = await ui.roll(critHits.length, 6,
        `${atk.label} — ${critHits.length}d6 Damage (CRITICAL — ignores Defense)`);
      const critDmgArr = Array.isArray(critDmgRolls) ? critDmgRolls : [critDmgRolls];
      log.push(`Critical Damage: Rolled [${critDmgArr.join(', ')}] (ignores Defense ${enemyDefense})`);

      for (const dmg of critDmgArr) {
        let wounds = dmg; // Crits ignore Defense
        // Damage Reduction still applies (it's separate from Defense)
        if (dmgReduction > 0 && wounds > 0) {
          wounds = Math.max(1, wounds - dmgReduction);
        }
        // Endurance still applies
        if (endurance != null) {
          wounds = Math.min(endurance, wounds);
        }
        woundsFromCrits += wounds;
      }
      log.push(`Critical hits dealt ${woundsFromCrits} wound(s) after DR/Endurance.`);
    }

    let pendingWounds = woundsFromNormal + woundsFromCrits;

    // Step 3: Cover saves (situational, if applicable)
    if (cover && pendingWounds > 0 && weapon.type === 'ranged') {
      const coverTarget = cover.target;
      const coverRolls = await ui.roll(pendingWounds, 6,
        `Cover — ${pendingWounds}d6 vs ${coverTarget}+`);
      const coverArr = Array.isArray(coverRolls) ? coverRolls : [coverRolls];
      const saved = coverArr.filter(r => r >= coverTarget).length;
      if (saved > 0) {
        pendingWounds = Math.max(0, pendingWounds - saved);
        log.push(`Cover ${coverTarget}+: Rolled [${coverArr.join(', ')}] — saved ${saved} wound(s). Remaining: ${pendingWounds}`);
      }
    }

    // Step 4: Enemy Armor saves (per wound)
    if (Number.isFinite(enemyArmor) && pendingWounds > 0) {
      const armorRolls = await ui.roll(pendingWounds, 6,
        `Enemy Armor — ${pendingWounds}d6 vs ${enemyArmor}+`);
      const armorArr = Array.isArray(armorRolls) ? armorRolls : [armorRolls];
      const saved = armorArr.filter(r => r >= enemyArmor).length;
      pendingWounds = Math.max(0, pendingWounds - saved);
      log.push(`Enemy Armor ${enemyArmor}+: Rolled [${armorArr.join(', ')}] — saved ${saved}. Final wounds: ${pendingWounds}`);
    }

    totalWoundsDealt += pendingWounds;
    log.push(`${atk.label} total: ${pendingWounds} wound(s) applied to enemy.`);
  }

  log.push(`Total wounds dealt: ${totalWoundsDealt}`);
  return { totalWounds: totalWoundsDealt, log };
}


/* ==================== Enemy Hit Generation ==================== */

/**
 * Generate hits from an enemy attack.
 *
 * @param {object} opts
 * @param {object} opts.ui        - UI callbacks
 * @param {object} opts.attack    - { combat|shots, toHit, damage, type: 'melee'|'ranged' }
 * @param {number} opts.count     - Number of enemies attacking (default 1)
 *
 * @returns {object} { hits, damage, rolls, log }
 */
export async function resolveEnemyHitGeneration({ ui, attack, count = 1 }) {
  const log = [];
  const type = attack.type || 'melee';
  const dicePerEnemy = Math.max(0, Math.floor(attack.combat ?? attack.shots ?? 1));
  const toHit = parsePlusTarget(attack.toHit);
  const damagePerHit = Math.max(0, Math.floor(attack.damage ?? 1));
  const totalDice = dicePerEnemy * count;

  if (totalDice <= 0 || !Number.isFinite(toHit)) {
    log.push('Enemy has no attack dice.');
    return { hits: 0, damage: damagePerHit, rolls: [], log };
  }

  log.push(`Enemy ${type} attack: ${count} enem${count === 1 ? 'y' : 'ies'} × ${dicePerEnemy} dice = ${totalDice}d6, To-Hit ${toHit}+, Damage ${damagePerHit} per hit`);

  const rolls = await ui.roll(totalDice, 6,
    `Enemy Attack — ${totalDice}d6 vs ${toHit}+ To-Hit`);
  const rollArr = Array.isArray(rolls) ? rolls : [rolls];
  const hits = rollArr.filter(r => r >= toHit).length;

  log.push(`Enemy rolled [${rollArr.join(', ')}] → ${hits} hit(s).`);
  await ui.toast?.(`Enemy scored ${hits} hit(s)!`);

  return { hits, damage: damagePerHit, rolls: rollArr, log };
}


/* ==================== Hero Defense vs Enemy Attack ==================== */

/**
 * HP path with Grit reroll support:
 *   - Defense rolls once per Hit (success ignores the entire Hit)
 *   - Grit can reroll all failed Defense dice
 *   - Armor rolls once per resulting Wound (success ignores that wound)
 *   - KO guard: stops if hero health reaches 0
 *
 * @param {object} opts
 * @param {object}   opts.ui           - UI callbacks
 * @param {object}   opts.hero         - Hero object
 * @param {number}   opts.hits         - Incoming hits
 * @param {number}   opts.woundsPerHit - Damage per unblocked hit
 * @param {function} opts.getStat      - (hero, statName) => value
 * @param {function} [opts.updateHero] - (heroId, patch) => void
 * @param {string}   [opts.heroId]     - Hero ID for Grit deduction
 */
export async function resolveDefensePerHitThenArmorPerWound({
  ui, hero, hits, woundsPerHit, getStat, updateHero, heroId,
}) {
  const log = [];
  let incomingHits = Math.max(0, Math.floor(hits));

  // DEFENSE (per Hit)
  if (incomingHits > 0) {
    const defTargetGuess =
      parsePlusTarget(getStat?.(hero, 'Defense')) ||
      parsePlusTarget(hero?.defense) ||
      NaN;

    const target = Number.isFinite(defTargetGuess)
      ? defTargetGuess
      : (Number(await ui.promptNumber?.({
          title: 'Defense Target',
          message: 'Enter Defense target (e.g., 4 for 4+):',
          min: 2, max: 6, defaultValue: 4,
        })) || 4);

    // Roll Defense dice
    let rolls = await ui.roll(incomingHits, 6,
      `Defense — ${incomingHits}d6 vs ${target}+ (1 success ignores 1 hit)`);
    let arr = Array.isArray(rolls) ? rolls : [rolls];
    let blocks = arr.filter(n => n >= target).length;
    log.push(`Defense ${target}+: Rolled [${arr.join(', ')}] → ${blocks} block(s) of ${incomingHits} hit(s).`);

    // Grit reroll for failed Defense dice
    const failedCount = arr.length - blocks;
    if (failedCount > 0) {
      const gritResult = await _offerGritRerollForSaves(arr, target, hero, ui, updateHero, heroId, 'Defense');
      if (gritResult.rerolled) {
        arr = gritResult.rolls;
        blocks = arr.filter(n => n >= target).length;
        log.push(`Grit reroll: [${arr.join(', ')}] → ${blocks} block(s) total.`);
      }
    }

    incomingHits = Math.max(0, incomingHits - blocks);
    await ui.toast?.(`Defense blocked ${blocks} hit(s). Hits getting through: ${incomingHits}.`);
  }

  // Convert remaining hits into wounds
  let pendingWounds = incomingHits * Math.max(0, Math.floor(woundsPerHit));

  // ARMOR (per wound) — auto-detect
  if (pendingWounds > 0) {
    const armorTargetGuess =
      parsePlusTarget(getStat?.(hero, 'Armor')) ||
      parsePlusTarget(hero?.armor) ||
      NaN;

    if (Number.isFinite(armorTargetGuess)) {
      let rolls = await ui.roll(pendingWounds, 6,
        `Armor — ${pendingWounds}d6 vs ${armorTargetGuess}+`);
      let arr = Array.isArray(rolls) ? rolls : [rolls];
      let ignores = arr.filter(n => n >= armorTargetGuess).length;
      log.push(`Armor ${armorTargetGuess}+: Rolled [${arr.join(', ')}] → ${ignores} save(s) of ${pendingWounds} wound(s).`);

      // Grit reroll for failed Armor dice
      const failedCount = arr.length - ignores;
      if (failedCount > 0) {
        const gritResult = await _offerGritRerollForSaves(arr, armorTargetGuess, hero, ui, updateHero, heroId, 'Armor');
        if (gritResult.rerolled) {
          arr = gritResult.rolls;
          ignores = arr.filter(n => n >= armorTargetGuess).length;
          log.push(`Grit reroll: [${arr.join(', ')}] → ${ignores} save(s) total.`);
        }
      }

      pendingWounds = Math.max(0, pendingWounds - ignores);
      await ui.toast?.(`Armor ignored ${ignores} wound(s). Final Wounds: ${pendingWounds}.`);
    }
  }

  // KO guard: cap wounds so hero doesn't go below 0
  const currentHP = Number(hero?.currentHealth ?? hero?.health ?? hero?.maxHealth ?? 10);
  if (pendingWounds > currentHP) {
    log.push(`KO: Hero has ${currentHP} HP. Capping wounds at ${currentHP} (knocked out).`);
    pendingWounds = currentHP;
  }

  return { wounds: pendingWounds, log };
}


/**
 * Sanity path with Grit reroll support:
 *   - Willpower rolls once per Hit (success ignores the entire Hit)
 *   - Spirit Armor rolls once per resulting Wound (success ignores that wound)
 *   - KO guard for sanity reaching 0
 */
export async function resolveWillpowerPerHitThenSpiritArmorPerWound({
  ui, hero, hits, woundsPerHit, getStat, updateHero, heroId,
}) {
  const log = [];
  let incomingHits = Math.max(0, Math.floor(hits));

  // WILLPOWER (per Hit)
  if (incomingHits > 0) {
    const wpTargetGuess =
      parsePlusTarget(getStat?.(hero, 'Willpower')) ||
      parsePlusTarget(hero?.willpower) ||
      NaN;

    const target = Number.isFinite(wpTargetGuess)
      ? wpTargetGuess
      : (Number(await ui.promptNumber?.({
          title: 'Willpower Target',
          message: 'Enter Willpower target (e.g., 5 for 5+):',
          min: 2, max: 6, defaultValue: 5,
        })) || 5);

    let rolls = await ui.roll(incomingHits, 6,
      `Willpower — ${incomingHits}d6 vs ${target}+ (1 success ignores 1 hit)`);
    let arr = Array.isArray(rolls) ? rolls : [rolls];
    let blocks = arr.filter(n => n >= target).length;
    log.push(`Willpower ${target}+: Rolled [${arr.join(', ')}] → ${blocks} block(s) of ${incomingHits} hit(s).`);

    // Grit reroll for failed Willpower dice
    const failedCount = arr.length - blocks;
    if (failedCount > 0) {
      const gritResult = await _offerGritRerollForSaves(arr, target, hero, ui, updateHero, heroId, 'Willpower');
      if (gritResult.rerolled) {
        arr = gritResult.rolls;
        blocks = arr.filter(n => n >= target).length;
        log.push(`Grit reroll: [${arr.join(', ')}] → ${blocks} block(s) total.`);
      }
    }

    incomingHits = Math.max(0, incomingHits - blocks);
    await ui.toast?.(`Willpower blocked ${blocks} hit(s). Hits getting through: ${incomingHits}.`);
  }

  // Convert remaining hits into sanity wounds
  let pendingWounds = incomingHits * Math.max(0, Math.floor(woundsPerHit || 1));

  // SPIRIT ARMOR (per wound) — auto-detect
  if (pendingWounds > 0) {
    const saTargetGuess =
      parsePlusTarget(getStat?.(hero, 'Spirit Armor')) ||
      parsePlusTarget(hero?.spiritArmor) ||
      NaN;

    if (Number.isFinite(saTargetGuess)) {
      let rolls = await ui.roll(pendingWounds, 6,
        `Spirit Armor — ${pendingWounds}d6 vs ${saTargetGuess}+`);
      let arr = Array.isArray(rolls) ? rolls : [rolls];
      let ignores = arr.filter(n => n >= saTargetGuess).length;
      log.push(`Spirit Armor ${saTargetGuess}+: Rolled [${arr.join(', ')}] → ${ignores} save(s) of ${pendingWounds} wound(s).`);

      // Grit reroll for failed Spirit Armor dice
      const failedCount = arr.length - ignores;
      if (failedCount > 0) {
        const gritResult = await _offerGritRerollForSaves(arr, saTargetGuess, hero, ui, updateHero, heroId, 'Spirit Armor');
        if (gritResult.rerolled) {
          arr = gritResult.rolls;
          ignores = arr.filter(n => n >= saTargetGuess).length;
          log.push(`Grit reroll: [${arr.join(', ')}] → ${ignores} save(s) total.`);
        }
      }

      pendingWounds = Math.max(0, pendingWounds - ignores);
      await ui.toast?.(`Spirit Armor ignored ${ignores} wound(s). Final Sanity Wounds: ${pendingWounds}.`);
    }
  }

  // KO guard: cap at current sanity
  const currentSanity = Number(hero?.currentSanity ?? hero?.sanity ?? hero?.maxSanity ?? hero?.SanityMax ?? 0);
  if (currentSanity > 0 && pendingWounds > currentSanity) {
    log.push(`Sanity KO: Hero has ${currentSanity} Sanity. Capping at ${currentSanity}.`);
    pendingWounds = currentSanity;
  }

  return { wounds: pendingWounds, log };
}


/* ==================== Full Enemy Attack Resolution ==================== */

/**
 * Complete enemy attack vs a hero: generate hits → Defense → Armor → apply wounds.
 * Handles both physical and horror attacks.
 *
 * @param {object} opts
 * @param {object}   opts.ui
 * @param {object}   opts.hero
 * @param {object}   opts.attack      - { combat|shots, toHit, damage, type: 'melee'|'ranged' }
 * @param {number}   [opts.count=1]   - Number of enemies attacking
 * @param {function} opts.getStat
 * @param {function} [opts.updateHero]
 * @param {string}   [opts.heroId]
 * @param {object}   [opts.horror]    - If present: { hits, damagePerHit } for horror attack
 *
 * @returns {object} { physicalWounds, sanityWounds, log }
 */
export async function resolveFullEnemyAttack({
  ui, hero, attack, count = 1, getStat, updateHero, heroId, horror = null,
}) {
  const log = [];

  // Physical attack
  const hitResult = await resolveEnemyHitGeneration({ ui, attack, count });
  log.push(...hitResult.log);

  let physicalWounds = 0;
  if (hitResult.hits > 0) {
    const defResult = await resolveDefensePerHitThenArmorPerWound({
      ui, hero, hits: hitResult.hits, woundsPerHit: hitResult.damage,
      getStat, updateHero, heroId,
    });
    physicalWounds = defResult.wounds;
    log.push(...defResult.log);
  }

  // Horror attack (if enemy has one)
  let sanityWounds = 0;
  if (horror && horror.hits > 0) {
    log.push(`--- Horror Attack: ${horror.hits} Horror Hit(s) ---`);
    const horrorResult = await resolveWillpowerPerHitThenSpiritArmorPerWound({
      ui, hero, hits: horror.hits, woundsPerHit: horror.damagePerHit || 1,
      getStat, updateHero, heroId,
    });
    sanityWounds = horrorResult.wounds;
    log.push(...horrorResult.log);
  }

  log.push(`Final: ${physicalWounds} wound(s), ${sanityWounds} sanity wound(s).`);
  return { physicalWounds, sanityWounds, log };
}


/* ==================== Post-Combat Healing ==================== */

/**
 * After a fight: each hero heals D3 (any mix of Wounds and Sanity).
 *
 * @param {object} opts
 * @param {object}   opts.ui
 * @param {object}   opts.hero
 * @param {function} [opts.updateHero] - (heroId, patch) => void
 * @param {string}   [opts.heroId]
 *
 * @returns {object} { healedWounds, healedSanity, roll, log }
 */
export async function resolvePostCombatHealing({ ui, hero, updateHero, heroId }) {
  const log = [];
  const healRoll = d3();
  log.push(`Post-combat healing: Rolled D3 = ${healRoll}`);

  const currentHP = Number(hero?.currentHealth ?? hero?.health ?? 0);
  const maxHP = Number(hero?.maxHealth ?? hero?.max_health ?? 10);
  const missingHP = Math.max(0, maxHP - currentHP);

  const currentSan = Number(hero?.currentSanity ?? hero?.sanity ?? 0);
  const maxSan = Number(hero?.maxSanity ?? hero?.SanityMax ?? 0);
  const missingSan = Math.max(0, maxSan - currentSan);

  let healWounds = 0;
  let healSanity = 0;

  if (healRoll <= 0 || (missingHP === 0 && missingSan === 0)) {
    log.push('No healing needed — hero is at full Health and Sanity.');
    return { healedWounds: 0, healedSanity: 0, roll: healRoll, log };
  }

  // If only one type is missing, auto-assign
  if (missingSan === 0) {
    healWounds = Math.min(healRoll, missingHP);
    log.push(`All ${healWounds} point(s) heal Wounds.`);
  } else if (missingHP === 0) {
    healSanity = Math.min(healRoll, missingSan);
    log.push(`All ${healSanity} point(s) heal Sanity.`);
  } else {
    // Player chooses the split
    const choices = [];
    for (let w = 0; w <= healRoll; w++) {
      const s = healRoll - w;
      const wActual = Math.min(w, missingHP);
      const sActual = Math.min(s, missingSan);
      choices.push({
        label: `${wActual} Wound${wActual !== 1 ? 's' : ''}, ${sActual} Sanity`,
        wounds: wActual,
        sanity: sActual,
      });
    }

    const pickIdx = await ui.promptChoice?.(
      `Post-Combat Healing — D3 = ${healRoll}\nMissing: ${missingHP} HP, ${missingSan} Sanity\n\nHow do you split the healing?`,
      choices,
    ) ?? 0;

    const pick = choices[pickIdx] || choices[0];
    healWounds = pick.wounds;
    healSanity = pick.sanity;
    log.push(`Healing: +${healWounds} HP, +${healSanity} Sanity.`);
  }

  // Apply healing
  if (typeof updateHero === 'function' && heroId) {
    const patch = {};
    if (healWounds > 0) patch.currentHealth = Math.min(maxHP, currentHP + healWounds);
    if (healSanity > 0) patch.currentSanity = Math.min(maxSan, currentSan + healSanity);
    if (Object.keys(patch).length > 0) updateHero(heroId, patch);
  }

  return { healedWounds: healWounds, healedSanity: healSanity, roll: healRoll, log };
}


/* ==================== Internal: Grit Reroll for Saves ==================== */

/**
 * Offer Grit reroll for Defense/Armor/Willpower/Spirit Armor saves.
 * Rerolls ALL failed dice at once (per SoB rules).
 */
async function _offerGritRerollForSaves(rolls, target, hero, ui, updateHero, heroId, saveType) {
  if (!rolls || !rolls.length || !hero || typeof ui?.promptChoice !== 'function') {
    return { rolls, rerolled: false };
  }

  const curGrit = Number(hero.currentGrit ?? hero.grit ?? 0);
  if (curGrit <= 0) return { rolls, rerolled: false };

  const failed = rolls.filter(r => r < target);
  if (failed.length === 0) return { rolls, rerolled: false };

  const successes = rolls.filter(r => r >= target).length;
  const spendIdx = await ui.promptChoice(
    `${saveType}: Rolled [${rolls.join(', ')}] → ${successes} success(es), ${failed.length} failure(s).\n` +
    `Current Grit: ${curGrit}\n\nSpend 1 Grit to reroll ALL ${failed.length} failed dice?`,
    [{ label: `Yes — reroll ${failed.length} failed dice` }, { label: 'No — keep these rolls' }],
  );

  if (spendIdx !== 0) return { rolls, rerolled: false };

  // Reroll only the failed dice
  const newRolls = rolls.map(r => r >= target ? r : d6());

  // Deduct grit
  const newGrit = Math.max(0, curGrit - 1);
  if (typeof updateHero === 'function' && heroId) {
    updateHero(heroId, { currentGrit: newGrit });
  }
  // Update hero object in-place for subsequent checks
  hero.currentGrit = newGrit;

  return { rolls: newRolls, rerolled: true };
}
