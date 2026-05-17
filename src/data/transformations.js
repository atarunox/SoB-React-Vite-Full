// Hero Transformation Curses
// Applied by the DM when a hero triggers a Transformation Curse card (e.g. Zombie Bite, Werewolf Scratch, Vampire Drain)
// A hero can only have one transformation at a time. If they would gain another, they take 3 Corruption Hits instead.
// Treated as a special Mutation for healing/removal purposes (Doc's Office cannot remove; treated as permanent unless
// an adventure-specific card says otherwise).

export const TRANSFORMATIONS = {
  zombie: {
    id: 'zombie',
    name: 'Zombie Hero',
    curseName: 'Zombie Bite',
    curseSource: 'Transformation Curse card — Zombie Bite',
    keyword: 'Undead',
    theme: { bg: 'bg-green-950', border: 'border-green-700', text: 'text-green-300', badge: 'bg-green-800 text-green-100' },
    abilities: [
      {
        name: 'Shambling Dead',
        effect: 'Cunning AND Initiative are each reduced to Half (rounding up). Move is reduced by −2 (minimum 1).',
      },
      {
        name: 'Altered Form',
        effect: 'Base Health is Doubled. Endurance (3) — no more than 3 Wounds from any single Hit. +2 Strength. Gains the Undead Keyword.',
      },
      {
        name: 'Rotting Body',
        effect: 'At the start of each Adventure, roll D6 (no Grit). 1–2: Lose 1 Sanity permanently. 3: Lose 1 Health permanently. 4–6: No effect.',
      },
      {
        name: 'Zombie Hunger',
        effect: 'Must make an Escape 3+ test to move away from other Heroes (roll once per turn for each Hero moved away from). If the test is failed, the Hero must move toward that Hero instead; the Hero takes 1 Hit that does a Bleeding marker instead of normal Damage.',
      },
    ],
  },

  werewolf: {
    id: 'werewolf',
    name: 'Werewolf Hero',
    curseName: 'Werewolf Scratch',
    curseSource: 'Transformation Curse card — Werewolf Scratch',
    keyword: 'Werewolf',
    theme: { bg: 'bg-amber-950', border: 'border-amber-700', text: 'text-amber-300', badge: 'bg-amber-800 text-amber-100' },
    abilities: [
      // Placeholder — fill when physical cards are scanned
      {
        name: 'Werewolf Transformation (details pending)',
        effect: 'See physical Werewolf Hero card for full rules. Data to be added when cards are scanned.',
      },
    ],
  },

  vampire: {
    id: 'vampire',
    name: 'Vampire Hero',
    curseName: 'Vampire Drain',
    curseSource: 'Transformation Curse card — Vampire Drain',
    keyword: 'Undead',
    theme: { bg: 'bg-purple-950', border: 'border-purple-700', text: 'text-purple-300', badge: 'bg-purple-800 text-purple-100' },
    abilities: [
      // Placeholder — fill when physical cards are scanned
      {
        name: 'Vampire Transformation (details pending)',
        effect: 'See physical Vampire Hero card for full rules. Data to be added when cards are scanned.',
      },
    ],
  },
};

export const TRANSFORMATION_LIST = Object.values(TRANSFORMATIONS);
