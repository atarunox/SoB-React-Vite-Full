// src/data/townLocations/BlastedWastesTown/DesertMarketplace/desertMarketplaceBackAlleys.js
// Market Back Alleys: Sell Dark Stone, Shady Alien Saloon, Gambling

export default [
  // ── Sell Dark Stone ───────────────────────────────────────────────────
  {
    id: 'dm_sell_dark_stone',
    name: 'Sell Dark Stone',
    category: 'Service',
    type: 'Trade',
    tags: ['Service', 'Trade', 'Dark Stone'],
    cost: 'Free',
    description:
      'You may sell Dark Stone shards on the Streets for D6 \u00d7 $20 each. Roll for each shard individually as they vary in size, weight, and value.',
    effect: 'Sell Dark Stone for D6 \u00d7 $20 per shard (rolled individually).',
  },

  // ── Visit Shady Alien Saloon ──────────────────────────────────────────
  {
    id: 'dm_get_a_drink',
    name: 'Get a Drink',
    category: 'Service',
    type: 'Saloon',
    tags: ['Service', 'Saloon', 'Entertainment'],
    cost: { gold: 10 },
    description: 'Belly up to the bar at the Shady Alien Saloon.',
    effect: 'Heal D6 Sanity and gain 5 XP.',
  },

  {
    id: 'dm_alien_dancer',
    name: 'Alien Dancer Performance',
    category: 'Service',
    type: 'Entertainment',
    tags: ['Service', 'Entertainment'],
    cost: { gold: 20 },
    limit: 'Once per Visit',
    description: 'Watch an exotic alien dancer perform at the Shady Alien Saloon.',
    effect:
      'Gain 10 XP and make a Lore 4+ test (roll a number of dice equal to your Lore). If successful, you may Recover a Grit. If failed, take 1 Corruption Hit.',
  },

  // ── Gambling ──────────────────────────────────────────────────────────
  {
    id: 'dm_slot_pot',
    name: 'Slot-Pot',
    category: 'Service',
    type: 'Gambling',
    tags: ['Service', 'Gambling'],
    cost: { gold: 25 },
    limit: '2 times per Visit',
    description:
      'Choose a number between 1 and 6 and roll 3 dice. Grit may be used.',
    effect:
      'For each die that rolls your number, gain $100. If all 3 dice roll your number, you\'ve hit a Full Pot \u2013 you may also draw an Artifact card. If none of the dice roll your number, you\'ve fumbled the Pot-Bot \u2013 take 1 Corruption Hit and you must pay an extra $25. If you cannot pay, roll once on the Injury Table instead.',
  },

  {
    id: 'dm_eanarri_dice',
    name: "Back Street Ean'arri Dice",
    category: 'Service',
    type: 'Gambling',
    tags: ['Service', 'Gambling'],
    cost: 'Bet $25\u2013$100',
    limit: '3 times per Visit',
    description:
      "Choose a value to bet between $25 and $100. Roll 2 dice to set the Desert Suns. You then roll one more die for the Wanderer (Grit may be used), but before you do, choose where to place your bet.",
    effect:
      'Bet options: Setting Suns (Wanderer lower than both Sun dice), Lost in the Desert (Wanderer between both Sun dice), Fire in the Sky (Wanderer higher than both Sun dice), Dust and Bones (Wanderer matches either Sun die), Escape to Freedom (Wanderer matches both Sun dice \u2013 pays 5\u00d7 Bet). If your choice matches, earn 2\u00d7 Your Bet. You may then push your luck and roll another Wanderer die using the same choice \u2013 if it also matches, earn 2\u00d7 your previous total. Push up to 4 Wanderer dice total. If any Wanderer die does not match your bet, your Bet is lost.',
  },
];
