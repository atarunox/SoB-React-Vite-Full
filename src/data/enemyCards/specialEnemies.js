// Special / Miniboss enemies summoned via Threat cards.
// Each entry references a baseEnemy by name, lists the extras applied on top of base stats,
// and carries enough data to spawn a standalone EnemyGroupCard separate from the base group.

export const SPECIAL_ENEMIES = [
  {
    id: 'pack_master',
    name: 'Pack Master',
    baseEnemyName: 'Werewolf Feral Kin',
    sourceCard: 'Werewolf Feral Kin — Pack Master Threat Card',
    theme: { border: 'border-amber-600', bg: 'bg-amber-950', badge: 'bg-amber-700 text-amber-100' },
    extras: [
      'Double base Health and +2 Defense',
      'Tough — Immune to Critical Hits.',
      'Savage Creature — Moves through other models and changes targets each turn. Also, after moving, Attacks all adjacent Heroes.',
    ],
    statDeltas: {
      healthMultiplier: 2,
      defenseBonus: 2,
      tough: true,
    },
    xpOverride: null, // no explicit XP change listed
  },

  {
    id: 'generalissimo',
    name: 'Generalisimo',
    baseEnemyName: 'Lost Army',
    sourceCard: 'Lost Army — Generalisimo Threat Card',
    theme: { border: 'border-blue-600', bg: 'bg-blue-950', badge: 'bg-blue-700 text-blue-100' },
    extras: [
      'Double base Health and Combat.',
      'Tough — Immune to Critical Hits.',
      'Leadership — While the Generalisimo is on the board, all Lost Army models are +1 Damage on all of their Attacks.',
    ],
    statDeltas: {
      healthMultiplier: 2,
      combatMultiplier: 2,
      tough: true,
    },
    xpOverride: '15+5',
  },

  {
    id: 'banner_bearer',
    name: 'Lost Army Banner Bearer',
    baseEnemyName: 'Lost Army',
    sourceCard: 'Lost Army — Banner Bearer Threat Card',
    theme: { border: 'border-blue-500', bg: 'bg-blue-900', badge: 'bg-blue-700 text-blue-100' },
    extras: [
      'Double base Health.',
      'Tough — Immune to Critical Hits.',
      'Banner of the Legion — All Lost Army models are +1 Combat, and are Armor 4+ while in Formation (or 3+ instead, if already Armor 4+).',
    ],
    statDeltas: {
      healthMultiplier: 2,
      tough: true,
    },
    xpOverride: '15+5',
  },

  {
    id: 'war_shaman',
    name: 'War Shaman',
    baseEnemyName: 'Black Fang Tribe',
    sourceCard: 'Black Fang Tribe — War Shaman Threat Card',
    theme: { border: 'border-orange-600', bg: 'bg-orange-950', badge: 'bg-orange-700 text-orange-100' },
    extras: [
      'Double base Health and Combat.',
      'Tough — Immune to Critical Hits.',
      'Adds an extra Dark Stone to the Pool at the start of the Fight.',
      'At the start of his Activation each turn, casts a Random War Chant.',
    ],
    statDeltas: {
      healthMultiplier: 2,
      combatMultiplier: 2,
      tough: true,
    },
    xpOverride: '10+5',
  },

  {
    id: 'void_magus',
    name: 'Void Magus',
    baseEnemyName: 'Void Sorcerer',
    sourceCard: 'Void Sorcerer — Void Magus Threat Card',
    theme: { border: 'border-purple-600', bg: 'bg-purple-950', badge: 'bg-purple-700 text-purple-100' },
    extras: [
      'All Void Magik Spells are cast starting at Spell Level 3.',
      '+2 Initiative.',
      '+1 Combat.',
      '+10 Health.',
    ],
    statDeltas: {
      initiativeBonus: 2,
      combatBonus: 1,
      healthBonus: 10,
    },
    xpOverride: null,
  },
];

// Map: baseEnemyName → [specialEnemies...]
export const SPECIAL_ENEMIES_BY_BASE = SPECIAL_ENEMIES.reduce((acc, s) => {
  const key = s.baseEnemyName;
  if (!acc[key]) acc[key] = [];
  acc[key].push(s);
  return acc;
}, {});
