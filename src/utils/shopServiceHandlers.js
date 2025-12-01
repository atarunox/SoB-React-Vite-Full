// src/utils/shopServiceHandlers.js
import { rollDice } from './diceUtils';

export const shopServiceHandlers = {
  rollD6AndAddHealth: (hero) => {
    const roll = rollDice(1, 6);
    const newHealth = Math.min((hero.health ?? 0) + roll, hero.maxHealth ?? 999);
    return {
      message: `Healed ${roll} Health!`,
      changes: { health: newHealth }
    };
  },

  gambleGold: (hero) => {
    const win = Math.random() < 0.5;
    const amount = rollDice(1, 6) * 10;
    const gold = Math.max((hero.gold ?? 0) + (win ? amount : -amount), 0);
    return {
      message: `${win ? 'Won' : 'Lost'} $${amount} gambling.`,
      changes: { gold }
    };
  },

  removeCurse: (hero) => {
    return {
      message: 'One Curse removed (if tracked).',
      changes: {} // Insert condition cleanup here
    };
  },

  addXP: (hero) => {
    const amount = rollDice(2, 6);
    return {
      message: `Gained ${amount} XP!`,
      changes: { xp: (hero.xp ?? 0) + amount }
    };
  },

  restoreGrit: (hero) => {
    const grit = Math.min((hero.grit ?? 0) + 1, hero.maxGrit ?? 2);
    return {
      message: 'Restored 1 Grit.',
      changes: { grit }
    };
  }
};
