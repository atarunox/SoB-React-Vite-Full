// src/data/cards/infamousFeudalBandits.js
// Infamous Feudal Bandits modifier deck — drawn when Feudal Bandits spawn.
// Each card gives the Feudal Bandit group an identity with special rules.

export const INFAMOUS_FEUDAL_BANDIT_CARDS = [
  {
    id: 'nobuhara_slavers',
    name: 'Nobuhara Slavers',
    type: 'Infamous Feudal Bandits',
    flavor: 'The footmen of the Nobuhara Clan raid farms and villages, capturing slaves to work in the Dark Stone Mines of their Oni masters. Painted with blood-red war paint on their chests, or white Oni masks over their faces, these bandits strike fear as they descend on helpless villages, dragging people into their Oni cage carts.',
    abilities: [
      {
        name: 'Keyword: Nobu',
        effect: 'These Enemies gain the Keyword Nobu.',
      },
      {
        name: 'Tough',
        effect: 'Immune to Critical Hits.',
      },
      {
        name: 'Raiding Slavers',
        effect: 'Feudal Bandits now have Fear (1) — any Hero starting their Activation adjacent takes 1 Horror Hit.',
      },
    ],
    xpBonus: 5,
    bounty: '$30 each',
    tags: ['Feudal Bandits', 'Nobu'],
  },
  {
    id: 'the_shoguns_enforcers',
    name: "The Shogun's Enforcers",
    type: 'Infamous Feudal Bandits',
    flavor: "The Takobake Clan has countless loyal followers across their domain. In addition to their soldiers that march to war, the peasants and footmen of the Fallen Shogun are used to raid and subjugate neighboring villages. With Dark Stone charms sewn into their headbands, these thugs have been twisted by the power of the Void.",
    abilities: [
      {
        name: 'Keyword: Takobake',
        effect: 'These Enemies gain the Keyword Takobake.',
      },
      {
        name: 'Field Armor',
        effect: 'Armor 6+.',
      },
      {
        name: 'Mutations',
        effect: 'Feudal Bandits are +1 Combat and have Regeneration (2) — Heals 2 Wounds at the start of each turn.',
      },
    ],
    xpBonus: 0,
    bounty: '1 Dark Stone each',
    tags: ['Feudal Bandits', 'Takobake'],
  },
  {
    id: 'men_of_the_dragon',
    name: 'Men of the Dragon',
    type: 'Infamous Feudal Bandits',
    flavor: "With the return of the mighty Sho Riu, many sell swords and thugs have sworn their allegiance to the Dragon King. Adorned with Dragon Tattoos and the hideous scar of the Dragon's brand pressed into their flesh, these bandits have sold their humanity for the dark promise of power.",
    abilities: [
      {
        name: 'Keyword: Dragon Army',
        effect: 'These Enemies gain the Keyword Dragon Army.',
      },
      {
        name: 'Dragon Tattoos',
        effect: '+2 Health.',
      },
      {
        name: 'Burning Blades',
        effect: 'Heroes may not Re-roll their Defense rolls for Combat Hits from Feudal Bandits.',
      },
    ],
    xpBonus: 10,
    bounty: '$15 each',
    tags: ['Feudal Bandits', 'Dragon Army'],
  },
  {
    id: 'the_spiders_legion',
    name: "The Spider's Legion",
    type: 'Infamous Feudal Bandits',
    flavor: "The Spider Queens of the Jorogumo lure countless victims into their web of wretched darkness, draining their life force and corrupting their souls. These thralls have lost what humanity they once had and are now little more than puppets to gather riches for their masters, and spread the spider's insipid venom.",
    abilities: [
      {
        name: 'Keywords: Myth, Undead, Arachnus',
        effect: 'These Enemies gain Keywords Myth, Undead, and Arachnus.',
      },
      {
        name: 'Spider Thralls',
        effect: '+1 Defense.',
      },
      {
        name: 'Venom Blades',
        effect: 'Whenever a Hero takes 1 or more Wounds from Feudal Bandit Combat Hits, they also gain 1 Poison marker.',
      },
    ],
    xpBonus: 10,
    bounty: '$25 each',
    tags: ['Feudal Bandits', 'Myth', 'Undead', 'Arachnus'],
  },
  {
    id: 'swords_of_black_bay',
    name: 'Swords of Black Bay',
    type: 'Infamous Feudal Bandits',
    flavor: 'The Swords of Black Bay are renowned smugglers and thugs that prey on the fishing towns and trade ports along the southern coastline. In these recent days of chaos and war, they have expanded their influence further inland, shaking down local farmers and hitting trade caravans on the roads.',
    abilities: [
      {
        name: 'Pirate Blades',
        effect: '+2 Initiative and Feudal Bandit Combat Hits ignore Armor.',
      },
      {
        name: 'Thieves',
        effect: 'Whenever a Hero takes 1 or more Wounds from Feudal Bandit Combat Hits, they must also lose D6 × $25.',
      },
    ],
    xpBonus: 5,
    bounty: '$25 each',
    tags: ['Feudal Bandits'],
  },
];

export default INFAMOUS_FEUDAL_BANDIT_CARDS;
