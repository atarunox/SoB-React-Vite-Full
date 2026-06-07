// src/data/missionModifiers/ruinousNightmares.js
// Ruinous Nightmares — Challenge supplement cards (Promo set)
// Deck: 15 cards (12 types, with ×2 duplicates noted below)
// Rules: Chosen Nightmare Level (1–3) = cards drawn per Fight.
//        Shuffle deck before each Fight (no discard pile).
//        Reward: +20 XP or $200 per Hero for each Nightmare card used.

export const NIGHTMARE_CARDS = [
  {
    id: 'burns_to_the_touch_1',
    name: 'Burns to the Touch',
    promoId: 'Promo-918',
    flavor: 'As you hold your weapons, they begin to grow warm to the touch. Now burning hot, you alternate hands to avoid the unnatural heat from searing your skin.',
    effects: [
      'All Heroes count as having 1 fewer Hand to equip Items.',
      'You may still use a two-handed Weapon, but you are −2 on your To Hit rolls.',
      'Limit 1 per Fight. (Re-draw if drawn a second time this Fight.)',
    ],
    copies: 2,
  },
  {
    id: 'burns_to_the_touch_2',
    name: 'Burns to the Touch',
    promoId: 'Promo-918',
    flavor: 'As you hold your weapons, they begin to grow warm to the touch. Now burning hot, you alternate hands to avoid the unnatural heat from searing your skin.',
    effects: [
      'All Heroes count as having 1 fewer Hand to equip Items.',
      'You may still use a two-handed Weapon, but you are −2 on your To Hit rolls.',
      'Limit 1 per Fight. (Re-draw if drawn a second time this Fight.)',
    ],
    copies: 2,
  },
  {
    id: 'fed_by_hatred_1',
    name: 'Fed By Hatred',
    promoId: 'Promo-910',
    flavor: 'With each strike you make, you can feel the Darkness growing within you. It needs to be let out... just one more hit.',
    effects: [
      'Whenever an Enemy is killed, move the Darkness marker forward 2 spaces on the Depth Track.',
      'This does NOT apply to the first Enemy killed by each Hero during a turn.',
    ],
    copies: 2,
  },
  {
    id: 'fed_by_hatred_2',
    name: 'Fed By Hatred',
    promoId: 'Promo-910',
    flavor: 'With each strike you make, you can feel the Darkness growing within you. It needs to be let out... just one more hit.',
    effects: [
      'Whenever an Enemy is killed, move the Darkness marker forward 2 spaces on the Depth Track.',
      'This does NOT apply to the first Enemy killed by each Hero during a turn.',
    ],
    copies: 2,
  },
  {
    id: 'shifting_shadows_1',
    name: 'Shifting Shadows',
    promoId: null,
    flavor: 'The Darkness swirls through the air, shifting and distorting your vision as you struggle to focus.',
    effects: [
      'Heroes are −1 on all To Hit rolls.',
      'Natural To Hit rolls of 6+ may still count as Critical Hits.',
    ],
    copies: 2,
  },
  {
    id: 'shifting_shadows_2',
    name: 'Shifting Shadows',
    promoId: null,
    flavor: 'The Darkness swirls through the air, shifting and distorting your vision as you struggle to focus.',
    effects: [
      'Heroes are −1 on all To Hit rolls.',
      'Natural To Hit rolls of 6+ may still count as Critical Hits.',
    ],
    copies: 2,
  },
  {
    id: 'invulnerable',
    name: 'Invulnerable',
    promoId: null,
    flavor: 'Wreathed in shadow, the enemies you face seem unstoppable.',
    effects: [
      'All Enemies gain +X Defense where X equals half the Hero Party Level (round up).',
      'If an Enemy is Immune to Critical Hits, this extra Defense bonus MAY still be ignored by a Critical Hit.',
    ],
    copies: 1,
  },
  {
    id: 'brutish_strength',
    name: 'Brutish Strength',
    promoId: null,
    flavor: 'Imbued with the power of the Darkness, even the smallest of foes can withstand immense punishment.',
    effects: [
      'All Enemies gain +X Health where X equals the Hero Party Level.',
      'For Enemies with variable Health, they gain +X/per Hero instead.',
    ],
    copies: 1,
  },
  {
    id: 'reality_warp',
    name: 'Reality Warp',
    promoId: 'Promo-923',
    flavor: 'Time and space twist and bend here. It takes all of your focus just to stand.',
    effects: [
      'Whenever a Hero uses an Ability Token, they must spend an extra Ability Token or the effect is canceled. (Using multiple at once effectively doubles the cost.)',
      'If a Hero has no Ability Tokens, they are −1 on their Defense rolls instead.',
    ],
    copies: 1,
  },
  {
    id: 'unravel',
    name: 'Unravel',
    promoId: 'Promo-924',
    flavor: "Your equipment begins to come apart in your hands, as though the very fabric of reality is unraveling before your eyes!",
    effects: [
      'All Item Upgrades are ignored.',
      'If a Hero has no Upgrades on any equipped Items, they are −1 Shot and −1 Combat on their Attacks instead (minimum of 1).',
    ],
    copies: 1,
  },
  {
    id: 'dark_shroud',
    name: 'Dark Shroud',
    promoId: null,
    flavor: 'A grim shadow hangs over the room, like a heavy shroud. You can feel your will to fight being drawn out of you. Even the simple act of opening your side satchel has the weight of a thousand hands pressing down to keep it sealed.',
    effects: [
      'Side Bag Tokens and "Once per..." Item and Ability effects may not be used.',
    ],
    copies: 1,
  },
  {
    id: 'shredding_damage',
    name: 'Shredding Damage',
    promoId: null,
    flavor: 'Slashing and clawing with ferocious vigor, the enemies that surround you can shred cloth, flesh, and bone with unnerving ease.',
    effects: [
      'All Enemies are +X Damage on their Attacks where X equals the Hero Party Level.',
    ],
    copies: 1,
  },
  {
    id: 'knocked_away',
    name: 'Knocked Away',
    promoId: null,
    flavor: 'With each terrifying blow, you fear these fiends will do you in. In desperation, using your equipment as an improvised shield becomes the only thing standing between you and death.',
    effects: [
      'Whenever a Hero takes 7 or more Wounds during a Turn, they must also choose: Discard a Gear or Artifact card OR be automatically KO\'d by Wounds.',
      'Limit once per Hero, per Turn.',
    ],
    copies: 1,
  },
  {
    id: 'terrifying_creatures',
    name: 'Terrifying Creatures',
    promoId: 'Promo-928',
    flavor: 'You have seen many nightmares in your travels, but these creatures send chills down your spine.',
    effects: [
      'All Enemies gain Terror (X) based on size — Small: 1, Medium: 2, Large: 4, XL: 6, XXL or bigger: 8.',
      'For XL or bigger Enemies this is Unspeakable Terror (X) instead.',
      'If an Enemy already has Fear, Terror, or Unspeakable Terror, this is in addition to it.',
    ],
    copies: 1,
  },
  {
    id: 'void_nullify',
    name: 'Void Nullify',
    promoId: 'Promo-929',
    flavor: 'The inner glow of your Dark Stone seems to flicker and fade as you look on in disbelief. Something nearby seems to be draining its energy.',
    effects: [
      'Items with Dark Stone Icons may not be used (including Items with Upgrades that have a Dark Stone Icon attached).',
    ],
    copies: 1,
  },
];

export const RUINOUS_NIGHTMARES_RULES = {
  name: 'Ruinous Nightmares',
  rules: [
    'At the start of any Adventure, choose a Nightmare Level: 1, 2, or 3.',
    'At the start of each Fight, shuffle the Ruinous Nightmare deck and draw cards equal to the Nightmare Level. These cards apply for the duration of that Fight.',
    'The deck has no discard pile — shuffle the full deck before each Fight.',
    'At the end of each Fight, for each Ruinous Nightmare card used, every Hero may choose to gain either +20 XP or $200.',
  ],
};

export const UNIQUE_NIGHTMARE_CARD_TYPES = [
  'Burns to the Touch',
  'Fed By Hatred',
  'Shifting Shadows',
  'Invulnerable',
  'Brutish Strength',
  'Reality Warp',
  'Unravel',
  'Dark Shroud',
  'Shredding Damage',
  'Knocked Away',
  'Terrifying Creatures',
  'Void Nullify',
];
