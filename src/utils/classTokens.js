// src/utils/classTokens.js
//
// Class-specific token systems for Shadows of Brimstone.
// Handles Fortune Tokens (Gambler), Fury Tokens (Wandering Samurai),
// Revive Tokens, and other class-specific resource mechanics.

/* ==================== Token Definitions ==================== */

/**
 * All class-specific token types.
 */
export const CLASS_TOKEN_TYPES = {
  fortune: {
    name: 'Fortune Token',
    heroClass: 'Gambler',
    description: 'Spend to reroll any single die, or gain +1 to any roll. Earned from gambling and class abilities.',
    maxDefault: 3,
    fieldName: 'fortuneTokens',
  },
  fury: {
    name: 'Fury Token',
    heroClass: 'Wandering Samurai',
    description: 'Spend to add +1 damage to a melee attack, or make an additional melee attack. Earned from combat and class abilities.',
    maxDefault: 3,
    fieldName: 'furyTokens',
  },
  revive: {
    name: 'Revive Token',
    heroClass: null, // Available to all classes via items/abilities
    description: 'When KO\'d, spend a Revive Token to immediately stand up with 1 Health instead of rolling on the Injury chart.',
    maxDefault: 1,
    fieldName: 'reviveTokens',
  },
  faith: {
    name: 'Faith Token',
    heroClass: 'Preacher',
    description: 'Spend to grant +1 to a Willpower or Spirit Armor save for any Hero in your space.',
    maxDefault: 2,
    fieldName: 'faithTokens',
  },
  focus: {
    name: 'Focus Token',
    heroClass: 'Indian Scout',
    description: 'Spend to reroll a ranged attack or add +1 to a Cunning test.',
    maxDefault: 2,
    fieldName: 'focusTokens',
  },
};


/* ==================== Token Management ==================== */

/**
 * Get the current token count for a hero.
 * @param {object} hero
 * @param {string} tokenType - Key from CLASS_TOKEN_TYPES
 * @returns {number}
 */
export function getTokenCount(hero, tokenType) {
  const def = CLASS_TOKEN_TYPES[tokenType];
  if (!def) return 0;
  return Number(hero?.[def.fieldName]) || 0;
}

/**
 * Get the max tokens for a hero (from class abilities or items).
 * @param {object} hero
 * @param {string} tokenType
 * @returns {number}
 */
export function getMaxTokens(hero, tokenType) {
  const def = CLASS_TOKEN_TYPES[tokenType];
  if (!def) return 0;
  // Check for hero-specific max override
  const maxField = `max${def.fieldName.charAt(0).toUpperCase()}${def.fieldName.slice(1)}`;
  return Number(hero?.[maxField]) || def.maxDefault;
}

/**
 * Get all applicable token types for a hero's class.
 * Always includes 'revive' (available to all), plus any class-specific ones.
 * @param {object} hero
 * @returns {Array<{ type: string, definition: object, count: number, max: number }>}
 */
export function getHeroTokens(hero) {
  if (!hero) return [];
  const heroClass = (hero.heroClass || '').trim();
  const results = [];

  for (const [type, def] of Object.entries(CLASS_TOKEN_TYPES)) {
    // Include if: no class restriction, or hero matches the class
    if (def.heroClass === null || def.heroClass === heroClass) {
      results.push({
        type,
        definition: def,
        count: getTokenCount(hero, type),
        max: getMaxTokens(hero, type),
      });
    }
  }
  return results;
}

/**
 * Add tokens to a hero. Returns an updater function for use with updateHero.
 * Respects the max cap.
 * @param {string} tokenType
 * @param {number} count - Number to add (default 1)
 * @returns {function} Updater: (hero) => patchedHero
 */
export function addTokenUpdater(tokenType, count = 1) {
  const def = CLASS_TOKEN_TYPES[tokenType];
  if (!def) return (h) => h;

  return (h) => {
    const current = Number(h?.[def.fieldName]) || 0;
    const max = getMaxTokens(h, tokenType);
    return {
      ...h,
      [def.fieldName]: Math.min(max, current + Math.abs(count)),
    };
  };
}

/**
 * Spend tokens from a hero. Returns an updater function.
 * @param {string} tokenType
 * @param {number} count - Number to spend (default 1)
 * @returns {function} Updater: (hero) => patchedHero
 */
export function spendTokenUpdater(tokenType, count = 1) {
  const def = CLASS_TOKEN_TYPES[tokenType];
  if (!def) return (h) => h;

  return (h) => {
    const current = Number(h?.[def.fieldName]) || 0;
    return {
      ...h,
      [def.fieldName]: Math.max(0, current - Math.abs(count)),
    };
  };
}

/**
 * Refill tokens to max at the start of an adventure.
 * Returns an updater function that refills all applicable tokens.
 * @param {object} hero - Hero to check class for
 * @returns {function} Updater: (hero) => patchedHero
 */
export function refillAllTokensUpdater(hero) {
  const applicable = getHeroTokens(hero);
  return (h) => {
    const patch = { ...h };
    for (const { type, definition, max } of applicable) {
      patch[definition.fieldName] = max;
    }
    return patch;
  };
}


/* ==================== Token Usage Resolution ==================== */

/**
 * Offer to spend a Fortune Token to reroll a die or add +1.
 *
 * @param {object} opts
 * @param {object}   opts.ui
 * @param {object}   opts.hero
 * @param {function} opts.updateHero
 * @param {string}   opts.heroId
 * @param {number}   opts.currentRoll - The current die result
 * @param {string}   [opts.context]   - What the roll is for (flavor text)
 *
 * @returns {object} { modified, newValue, spent, log }
 */
export async function offerFortuneToken({ ui, hero, updateHero, heroId, currentRoll, context = '' }) {
  const count = getTokenCount(hero, 'fortune');
  if (count <= 0) return { modified: false, newValue: currentRoll, spent: false, log: [] };

  const log = [];
  const choiceIdx = await ui.promptChoice?.(
    `Fortune Token Available (${count} remaining)\n` +
    `Current roll: ${currentRoll}${context ? '\n' + context : ''}\n\n` +
    `Spend a Fortune Token?`,
    [
      { label: `Reroll the die` },
      { label: `Add +1 (${currentRoll} → ${Math.min(6, currentRoll + 1)})` },
      { label: 'No — keep this roll' },
    ],
  );

  if (choiceIdx === 2 || choiceIdx == null) {
    return { modified: false, newValue: currentRoll, spent: false, log: [] };
  }

  // Spend the token
  if (typeof updateHero === 'function' && heroId) {
    updateHero(heroId, spendTokenUpdater('fortune'));
  }

  if (choiceIdx === 0) {
    // Reroll
    const newRoll = Math.floor(Math.random() * 6) + 1;
    log.push(`Fortune Token spent: Rerolled ${currentRoll} → ${newRoll}.`);
    return { modified: true, newValue: newRoll, spent: true, log };
  } else {
    // +1
    const newVal = Math.min(6, currentRoll + 1);
    log.push(`Fortune Token spent: ${currentRoll} + 1 = ${newVal}.`);
    return { modified: true, newValue: newVal, spent: true, log };
  }
}

/**
 * Offer to spend a Fury Token for bonus melee damage.
 *
 * @param {object} opts
 * @param {object}   opts.ui
 * @param {object}   opts.hero
 * @param {function} opts.updateHero
 * @param {string}   opts.heroId
 * @param {number}   opts.baseDamage - The base damage amount
 *
 * @returns {object} { modified, bonusDamage, spent, log }
 */
export async function offerFuryToken({ ui, hero, updateHero, heroId, baseDamage }) {
  const count = getTokenCount(hero, 'fury');
  if (count <= 0) return { modified: false, bonusDamage: 0, spent: false, log: [] };

  const log = [];
  const choiceIdx = await ui.promptChoice?.(
    `Fury Token Available (${count} remaining)\n` +
    `Base damage: ${baseDamage}\n\n` +
    `Spend a Fury Token to add +1 damage to this melee attack?`,
    [
      { label: 'Yes — spend Fury Token (+1 damage)' },
      { label: 'No — keep tokens' },
    ],
  );

  if (choiceIdx !== 0) {
    return { modified: false, bonusDamage: 0, spent: false, log: [] };
  }

  if (typeof updateHero === 'function' && heroId) {
    updateHero(heroId, spendTokenUpdater('fury'));
  }

  log.push(`Fury Token spent: +1 melee damage (${baseDamage} → ${baseDamage + 1}).`);
  return { modified: true, bonusDamage: 1, spent: true, log };
}

/**
 * Attempt to use a Revive Token when KO'd.
 *
 * @param {object} opts
 * @param {object}   opts.ui
 * @param {object}   opts.hero
 * @param {function} opts.updateHero
 * @param {string}   opts.heroId
 *
 * @returns {object} { revived, log }
 */
export async function offerReviveToken({ ui, hero, updateHero, heroId }) {
  const count = getTokenCount(hero, 'revive');
  if (count <= 0) return { revived: false, log: ['No Revive Tokens available.'] };

  const log = [];
  const choiceIdx = await ui.promptChoice?.(
    `KO'd! Revive Token Available (${count} remaining)\n\n` +
    `Spend a Revive Token to stand up with 1 Health instead of rolling on the Injury chart?`,
    [
      { label: 'Yes — use Revive Token' },
      { label: 'No — roll on Injury chart' },
    ],
  );

  if (choiceIdx !== 0) {
    return { revived: false, log: ['Chose not to use Revive Token.'] };
  }

  if (typeof updateHero === 'function' && heroId) {
    updateHero(heroId, (h) => ({
      ...spendTokenUpdater('revive')(h),
      currentHealth: 1,
    }));
  }

  log.push('Revive Token spent! Hero stands up with 1 Health.');
  await ui.toast?.('Revived with 1 Health!');
  return { revived: true, log };
}
