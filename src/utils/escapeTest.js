// src/utils/escapeTest.js
//
// Escape test mechanics for Shadows of Brimstone.
// Heroes may attempt to Escape from a combat. Each hero rolls
// individually — the check uses their Agility stat by default.

import { d6 } from './diceHelpers';
import { parsePlusTarget } from './combatResolution';

/**
 * Resolve an Escape test for a hero.
 *
 * Standard escape: Agility 5+ (pass = escape successfully).
 * Some enemies/conditions modify the target or stat used.
 *
 * @param {object} opts
 * @param {object}   opts.ui           - UI callbacks: { roll, promptChoice, toast }
 * @param {object}   opts.hero         - Hero object
 * @param {function} opts.getStat      - (hero, statName) => value
 * @param {function} [opts.updateHero] - (heroId, patchOrFn) => void
 * @param {string}   [opts.heroId]
 * @param {string}   [opts.stat='Agility'] - Stat to test
 * @param {number}   [opts.target=5]   - Target number (e.g., 5 for 5+)
 * @param {number}   [opts.modifier=0] - Flat modifier to dice count
 * @param {string}   [opts.reason]     - Flavor text explaining why escape is needed
 *
 * @returns {object} { escaped, rolls, successes, log }
 */
export async function resolveEscapeTest({
  ui, hero, getStat, updateHero, heroId,
  stat = 'Agility', target = 5, modifier = 0, reason = '',
}) {
  const log = [];

  if (reason) log.push(reason);

  // Get effective stat value
  let statVal = 1;
  if (getStat) {
    const v = getStat(hero, stat);
    if (Number.isFinite(Number(v))) statVal = Number(v);
  } else if (hero?.stats?.[stat] != null) {
    statVal = Number(hero.stats[stat]) || 1;
  }

  const dice = Math.max(1, statVal + modifier);
  log.push(`Escape Test: ${stat} ${target}+ (${dice}d6)`);

  const rolls = await ui.roll(dice, 6,
    `Escape Test — ${stat} ${target}+ (${dice}d6)${reason ? '\n' + reason : ''}`);
  const arr = Array.isArray(rolls) ? rolls : [rolls];
  const successes = arr.filter(r => r >= target).length;
  const escaped = successes > 0;

  log.push(`Rolled [${arr.join(', ')}] → ${successes} success(es). ${escaped ? 'ESCAPED!' : 'FAILED — stuck in combat.'}`);
  await ui.toast?.(escaped ? 'Escape successful!' : 'Escape failed!');

  return { escaped, rolls: arr, successes, log };
}

/**
 * Resolve escape tests for the entire party.
 * Each hero rolls individually; some may escape while others don't.
 *
 * @param {object} opts
 * @param {object}   opts.ui
 * @param {Array}    opts.heroes       - Array of hero objects
 * @param {function} opts.getStat
 * @param {function} [opts.updateHero]
 * @param {string}   [opts.stat='Agility']
 * @param {number}   [opts.target=5]
 * @param {string}   [opts.reason]
 *
 * @returns {object} { results: Array<{ heroId, heroName, escaped, rolls, successes }>, allEscaped, log }
 */
export async function resolvePartyEscape({
  ui, heroes, getStat, updateHero,
  stat = 'Agility', target = 5, reason = '',
}) {
  const log = [];
  const results = [];

  if (reason) log.push(reason);
  log.push(`Party Escape: ${heroes.length} hero(es) attempting ${stat} ${target}+`);

  for (const hero of heroes) {
    const heroId = hero.id || hero.localId;
    const heroName = hero.name || hero.heroClass || 'Hero';

    log.push(`--- ${heroName} ---`);
    const result = await resolveEscapeTest({
      ui, hero, getStat, updateHero, heroId,
      stat, target, reason: '',
    });

    results.push({
      heroId,
      heroName,
      escaped: result.escaped,
      rolls: result.rolls,
      successes: result.successes,
    });
    log.push(...result.log);
  }

  const allEscaped = results.every(r => r.escaped);
  const escapedNames = results.filter(r => r.escaped).map(r => r.heroName);
  const stuckNames = results.filter(r => !r.escaped).map(r => r.heroName);

  if (allEscaped) {
    log.push('All heroes escaped successfully!');
  } else {
    log.push(`Escaped: ${escapedNames.join(', ') || 'none'}. Stuck: ${stuckNames.join(', ')}.`);
  }

  return { results, allEscaped, log };
}
