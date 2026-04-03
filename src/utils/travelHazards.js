// src/utils/travelHazards.js
//
// Travel hazard resolution for between-adventure travel in Shadows of Brimstone.
// When heroes travel to or from a Mine/OtherWorld, they may encounter hazards.

import { d6, d3, roll2d6 } from './diceHelpers';

/**
 * Full travel hazard chart (2d6-based).
 * Each entry has a roll range, name, and resolution function.
 */
export const TRAVEL_HAZARD_CHART = [
  {
    roll: 2,
    name: 'Bandit Ambush!',
    description: 'The posse is ambushed by bandits on the trail!',
    resolve: async (ctx) => {
      const log = ['BANDIT AMBUSH! Each Hero takes 2 Wounds ignoring Defense and Armor.'];
      for (const hero of ctx.heroes) {
        const id = hero.id || hero.localId;
        const name = hero.name || hero.heroClass || 'Hero';
        const curHP = Number(hero.currentHealth ?? hero.health ?? 10);
        const wounds = Math.min(2, curHP);
        if (ctx.updateHero && wounds > 0) {
          ctx.updateHero(id, (h) => ({
            ...h,
            currentHealth: Math.max(0, (Number(h.currentHealth ?? h.health ?? 10)) - wounds),
          }));
        }
        log.push(`${name}: Takes ${wounds} Wound(s).`);
      }
      return { log };
    },
  },
  {
    roll: 3,
    name: 'Lost in the Wastes',
    description: 'The posse gets lost! Each Hero takes D3 Corruption Hits.',
    resolve: async (ctx) => {
      const log = ['LOST IN THE WASTES! Each Hero takes D3 Corruption Hits.'];
      for (const hero of ctx.heroes) {
        const id = hero.id || hero.localId;
        const name = hero.name || hero.heroClass || 'Hero';
        const corruptionHits = d3();
        const curCorruption = Number(hero.currentCorruption ?? hero.corruption ?? 0);
        if (ctx.updateHero) {
          ctx.updateHero(id, (h) => ({
            ...h,
            currentCorruption: (Number(h.currentCorruption ?? h.corruption ?? 0)) + corruptionHits,
          }));
        }
        log.push(`${name}: ${corruptionHits} Corruption Hit(s) → gains ${corruptionHits} Corruption.`);
      }
      return { log };
    },
  },
  {
    roll: 4,
    name: 'Harsh Weather',
    description: 'Terrible weather slows the journey. Each Hero loses D3 Sanity.',
    resolve: async (ctx) => {
      const log = ['HARSH WEATHER! Each Hero loses D3 Sanity.'];
      for (const hero of ctx.heroes) {
        const id = hero.id || hero.localId;
        const name = hero.name || hero.heroClass || 'Hero';
        const loss = d3();
        if (ctx.updateHero) {
          ctx.updateHero(id, (h) => ({
            ...h,
            currentSanity: Math.max(0, (Number(h.currentSanity ?? h.sanity ?? 0)) - loss),
          }));
        }
        log.push(`${name}: Loses ${loss} Sanity.`);
      }
      return { log };
    },
  },
  {
    roll: 5,
    name: 'Broken Trail',
    description: 'A rockslide blocks the trail. Each Hero must pass Strength 5+ or lose D3 Health.',
    resolve: async (ctx) => {
      const log = ['BROKEN TRAIL! Each Hero must pass Strength 5+ or lose D3 Health.'];
      for (const hero of ctx.heroes) {
        const id = hero.id || hero.localId;
        const name = hero.name || hero.heroClass || 'Hero';
        const statVal = Number(ctx.getStat?.(hero, 'Strength') ?? hero?.stats?.Strength ?? 3);
        const dice = Math.max(1, statVal);
        const rolls = Array.from({ length: dice }, () => d6());
        const passed = rolls.some(r => r >= 5);
        if (passed) {
          log.push(`${name}: Rolled [${rolls.join(', ')}] — PASSED!`);
        } else {
          const damage = d3();
          if (ctx.updateHero) {
            ctx.updateHero(id, (h) => ({
              ...h,
              currentHealth: Math.max(0, (Number(h.currentHealth ?? h.health ?? 10)) - damage),
            }));
          }
          log.push(`${name}: Rolled [${rolls.join(', ')}] — FAILED. Loses ${damage} Health.`);
        }
      }
      return { log };
    },
  },
  {
    roll: [6, 7, 8],
    name: 'Uneventful Journey',
    description: 'The trail is clear and the weather is fine. No hazards.',
    resolve: async () => {
      return { log: ['UNEVENTFUL JOURNEY. The trail is clear — no hazards encountered.'] };
    },
  },
  {
    roll: 9,
    name: 'Wild Animals',
    description: 'Wild animals threaten the camp! Each Hero must pass Cunning 5+ or lose 1 Side Bag token.',
    resolve: async (ctx) => {
      const log = ['WILD ANIMALS! Each Hero must pass Cunning 5+ or lose 1 Side Bag token.'];
      for (const hero of ctx.heroes) {
        const id = hero.id || hero.localId;
        const name = hero.name || hero.heroClass || 'Hero';
        const statVal = Number(ctx.getStat?.(hero, 'Cunning') ?? hero?.stats?.Cunning ?? 3);
        const dice = Math.max(1, statVal);
        const rolls = Array.from({ length: dice }, () => d6());
        const passed = rolls.some(r => r >= 5);
        if (passed) {
          log.push(`${name}: Rolled [${rolls.join(', ')}] — PASSED!`);
        } else {
          log.push(`${name}: Rolled [${rolls.join(', ')}] — FAILED. Loses 1 Side Bag token (remove manually).`);
        }
      }
      return { log };
    },
  },
  {
    roll: 10,
    name: 'Traveler\'s Fortune',
    description: 'A friendly traveler shares supplies. Each Hero gains D6 × $10 Gold.',
    resolve: async (ctx) => {
      const log = ['TRAVELER\'S FORTUNE! Each Hero gains D6 × $10 Gold.'];
      for (const hero of ctx.heroes) {
        const id = hero.id || hero.localId;
        const name = hero.name || hero.heroClass || 'Hero';
        const goldRoll = d6();
        const gold = goldRoll * 10;
        if (ctx.updateHero) {
          ctx.updateHero(id, (h) => ({
            ...h,
            gold: (Number(h.gold) || 0) + gold,
          }));
        }
        log.push(`${name}: Rolled ${goldRoll} → gains $${gold} Gold.`);
      }
      return { log };
    },
  },
  {
    roll: 11,
    name: 'Old Prospector',
    description: 'An old prospector gives you a tip. Each Hero gains 1 Dark Stone.',
    resolve: async (ctx) => {
      const log = ['OLD PROSPECTOR! Each Hero gains 1 Dark Stone.'];
      for (const hero of ctx.heroes) {
        const id = hero.id || hero.localId;
        const name = hero.name || hero.heroClass || 'Hero';
        if (ctx.updateHero) {
          ctx.updateHero(id, (h) => ({
            ...h,
            darkStone: (Number(h.darkStone) || 0) + 1,
          }));
        }
        log.push(`${name}: Gains 1 Dark Stone.`);
      }
      return { log };
    },
  },
  {
    roll: 12,
    name: 'Wayside Shrine',
    description: 'A wayside shrine provides comfort. Each Hero heals D3 Wounds and D3 Sanity.',
    resolve: async (ctx) => {
      const log = ['WAYSIDE SHRINE! Each Hero heals D3 Wounds and D3 Sanity.'];
      for (const hero of ctx.heroes) {
        const id = hero.id || hero.localId;
        const name = hero.name || hero.heroClass || 'Hero';
        const healHP = d3();
        const healSan = d3();
        if (ctx.updateHero) {
          ctx.updateHero(id, (h) => ({
            ...h,
            currentHealth: Math.min(
              Number(h.maxHealth ?? h.max_health ?? 10),
              (Number(h.currentHealth ?? h.health ?? 10)) + healHP
            ),
            currentSanity: Math.min(
              Number(h.maxSanity ?? h.SanityMax ?? 0),
              (Number(h.currentSanity ?? h.sanity ?? 0)) + healSan
            ),
          }));
        }
        log.push(`${name}: Heals ${healHP} Wound(s) and ${healSan} Sanity.`);
      }
      return { log };
    },
  },
];

/**
 * Look up a travel hazard by 2d6 roll.
 * @param {number} roll - The 2d6 result (2-12)
 * @returns {object|null} The matching hazard entry
 */
export function getHazardForRoll(roll) {
  return TRAVEL_HAZARD_CHART.find(h => {
    if (Array.isArray(h.roll)) return h.roll.includes(roll);
    return h.roll === roll;
  }) || null;
}

/**
 * Roll and resolve a travel hazard for the party.
 *
 * @param {object} ctx
 * @param {Array}    ctx.heroes      - Array of hero objects
 * @param {function} ctx.updateHero  - (heroId, patchOrFn) => void
 * @param {function} [ctx.getStat]   - (hero, statName) => value
 * @param {object}   [ctx.ui]        - UI callbacks (toast, promptChoice)
 *
 * @returns {object} { roll, hazard, log }
 */
export async function rollTravelHazard(ctx) {
  const roll = roll2d6();
  const hazard = getHazardForRoll(roll);
  const log = [`Travel Hazard Roll: ${roll}`];

  if (!hazard) {
    log.push('No matching hazard (this shouldn\'t happen).');
    return { roll, hazard: null, log };
  }

  log.push(`${hazard.name}: ${hazard.description}`);

  if (hazard.resolve) {
    const result = await hazard.resolve(ctx);
    log.push(...(result.log || []));
  }

  ctx.ui?.toast?.(`Travel Hazard: ${hazard.name}`);
  return { roll, hazard, log };
}
