// src/data/townLocations/BlastedWastesTown/Temple/templeItems.js
// Purchase items organized by Idol.

// ── Idol 1: Massive Warhead ──────────────────────────────────────────────────
export const warheadItems = [
  {
    id: 'temple_doomsday_hood',
    name: 'Doomsday Hood',
    type: 'gear',
    cost: { gold: 500 },
    slot: 'Hat / Face',
    tags: ['Gear', 'Clothing', 'Hat', 'Face', 'Holy'],
    effects: [
      'This hood allows you to be an unknown witness to the chaos of the universe.',
      'Spirit Armor 5+.',
      'Any time a Depth Event is rolled when Holding Back the Darkness, you take D6 Horror Hits.',
    ],
  },
  {
    id: 'temple_armageddon_charm',
    name: 'Armageddon Charm',
    type: 'gear',
    cost: { gold: 100 },
    slot: 'Charm',
    tags: ['Gear', 'Charm'],
    limit: '1',
    effects: [
      'From this necklace hangs a launch key for the Warhead.',
      'Any time you Fail a Mission (without Fleeing), gain 50 XP and draw a Loot card.',
    ],
  },
];

// ── Idol 2: The Great Kraken ────────────────────────────────────────────────
export const krakenItems = [
  {
    id: 'temple_krakens_nectar',
    name: "The Kraken's Nectar",
    type: 'gear',
    cost: { gold: 250 },
    slot: 'Consumable',
    tags: ['Gear', 'Nectar', 'Tokens'],
    effects: ['Gain 1 Nectar Token.'],
  },
  {
    id: 'temple_soulless_eye_amulet',
    name: 'Soulless Eye Amulet',
    type: 'Artifact',
    cost: { gold: 800 },
    slot: 'Charm',
    tags: ['Artifact', 'Charm'],
    effects: [
      'This amulet holds the eye of a lesser Sand Kraken.',
      '+2 Sanity.',
      'Discard to cancel a Madness.',
    ],
    modifiers: { sanity: 2 },
  },
  {
    id: 'temple_chiton_blade',
    name: 'Chiton Blade',
    type: 'gear',
    cost: { gold: 1250 },
    slot: 'Hand Weapon',
    tags: ['Gear', 'Hand Weapon', 'Blade'],
    upgradeSlots: 3,
    effects: [
      '+1 Combat.',
      '+1 Damage against Beast Enemies.',
    ],
    modifiers: { combat: 1 },
  },
];

// ── Idol 3: Dark Stone Warp Drive ───────────────────────────────────────────
export const warpDriveItems = [
  {
    id: 'temple_scarra_mask',
    name: 'Scarra Mask',
    type: 'gear',
    cost: { gold: 650 },
    slot: 'Face',
    tags: ['Gear', 'Clothing', 'Face'],
    effects: [
      '+1 Spirit.',
      'You may ignore the first 3 Unwanted Attention markers you get while in Town.',
    ],
    modifiers: { Spirit: 1 },
  },
  {
    id: 'temple_warp_coolant_injection',
    name: 'Warp Coolant Injection',
    type: 'Boost',
    cost: { gold: 250 },
    slot: 'Injection',
    tags: ['Boost', 'Injection'],
    limit: '1 Injection at a time',
    effects: [
      'Withdrawn from the sacred coolant reservoir of the holy Warp Core.',
      'You immediately gain D3 Corruption Points, ignoring Willpower.',
      'For the next 2 Adventures, you are +2 Max Grit.',
    ],
  },
  {
    id: 'temple_necklace_star_gods',
    name: 'Necklace of the Star Gods',
    type: 'gear',
    cost: { gold: 1200 },
    slot: 'Charm',
    tags: ['Gear', 'Charm', 'Tech'],
    limit: '1',
    effects: [
      'You are +1 Damage against Ancient and Alien Enemies.',
    ],
  },
];

// ── Idol 4: Deactivated Mk II Warden ───────────────────────────────────────
export const wardenItems = [
  {
    id: 'temple_oath_of_warden',
    name: 'Take the Oath of the Warden',
    type: 'Oath',
    cost: { gold: 0 },
    slot: 'Oath',
    tags: ['Oath', 'Law'],
    requirement: 'Must have No Corruption or Mutations to acquire.',
    effects: [
      'Vowing to be a protector of the weak and suffering, you stand proud as a guardian of justice.',
      'You gain +1 Damage on all of your Attacks against Outlaw Enemies.',
      'Also, while in the Blasted Wastes, you gain Keyword Law and Holy.',
      'This bonus is lost if you ever have Keyword Outlaw or do anything by choice to take one or more Corruption Hits.',
    ],
  },
  {
    id: 'temple_mechanical_prosthetic',
    name: 'Mechanical Prosthetic',
    type: 'gear',
    cost: { gold: 500, tech: 3 },
    slot: 'Medical',
    tags: ['Gear', 'Medical', 'Tech'],
    upgradeSlots: 3,
    limit: '2 (for different Injuries/Mutations)',
    effects: [
      'With gears, servos, and pistons in place, you feel good as new...better even!',
      'Choose 1 Injury or Mutation you currently have to be suppressed. While you have this Item equipped, it is as though you do not have that Injury or Mutation in any way.',
    ],
  },
];

// ── Idol 5: Hall of Bones ──────────────────────────────────────────────────
export const hallOfBonesItems = [
  {
    id: 'temple_help_polish_bones',
    name: 'Help Polish the Bones',
    category: 'Service',
    type: 'Service',
    tags: ['Service'],
    cost: 'Free',
    limit: 'Once per Town Stay',
    effects: [
      'Helping to prepare and polish a batch of new bones for the Temple walls, you sort through the piles of dead, donated to the cause.',
      'Take D6 Horror Hits, but you may also draw a Wasteland Loot card, pulled from the bodies (no extra for World card).',
    ],
  },
  {
    id: 'temple_relic_alien_martyr',
    name: 'Relic of an Alien Martyr',
    type: 'Artifact',
    cost: { gold: 600 },
    slot: 'Charm',
    tags: ['Artifact', 'Charm'],
    limit: '1',
    effects: [
      'Once per Adventure, use at the start of a turn to let every Hero immediately Heal D6 Wounds (if KO\'d by Wounds, they may immediately Recover, rolling for Injury as normal).',
    ],
  },
  {
    id: 'temple_skull_mask',
    name: 'Skull Mask',
    type: 'gear',
    cost: { gold: 450 },
    slot: 'Face',
    tags: ['Gear', 'Clothing', 'Face'],
    effects: [
      'You take 1 less Horror Hit from each Enemy with the Fear or Terror abilities (no effect on Unspeakable Terror).',
    ],
  },
];

// ── Idol 6: Gateway to the Void ────────────────────────────────────────────
export const gatewayToTheVoidItems = [
  {
    id: 'temple_controlled_mutation',
    name: 'Controlled Mutation',
    category: 'Service',
    type: 'Service',
    tags: ['Service'],
    cost: 'Free',
    limit: 'Once per Town Stay',
    effects: [
      'With the help of the followers, you harness the power of the Gate, dipping parts of your body into the event horizon to affect a twisting change.',
      'Take 2D6 Corruption Hits. You may choose to have any number of these ignore Willpower.',
      'For each Mutation gained from this, you may roll 3 times on the chart and choose which Mutation to keep (ignoring the others rolled).',
    ],
  },
  {
    id: 'temple_talisman_of_void',
    name: 'Talisman of the Void',
    type: 'gear',
    cost: { gold: 100 },
    slot: 'Charm',
    tags: ['Gear', 'Charm', 'Void'],
    limit: '1',
    effects: [
      'Discard the Talisman of the Void any time a World card would be drawn to instead choose the World card.',
    ],
  },
];

// All idol items keyed by idol number
export const templeItemsByIdol = {
  1: warheadItems,
  2: krakenItems,
  3: warpDriveItems,
  4: wardenItems,
  5: hallOfBonesItems,
  6: gatewayToTheVoidItems,
};

export default templeItemsByIdol;
