// src/data/townLocations/BlastedWastesTown/WastelandWorkshop/wastelandWorkshopUpgrades.js
// Wasteland Rust Forge — Upgrades
// * No two Upgrades of the same Type may be attached to the same Item. *

export default [
  // ── Hand Weapon Upgrades ───────────────────────────────────────────────
  {
    id: 'ww_hand_guard',
    name: 'Hand Guard',
    type: 'upgrade',
    cost: { scrap: 4 },
    tags: ['Upgrade', 'Guard', 'Rust'],
    requires: 'Hand Weapon',
    effects: [
      'Attach to any Hand Weapon.',
      'Bonus: You are +2 Health.',
    ],
    modifiers: { health: 2 },
  },

  {
    id: 'ww_reinforced_handle',
    name: 'Reinforced Handle',
    type: 'upgrade',
    cost: { scrap: 12 },
    tags: ['Upgrade', 'Handle', 'Rust'],
    requires: 'Hand Weapon',
    effects: [
      'Attach to any Hand Weapon.',
      'Bonus: You are +1 Initiative.',
    ],
    modifiers: { initiative: 1 },
  },

  {
    id: 'ww_electro_shock',
    name: 'Electro Shock',
    type: 'upgrade',
    cost: { scrap: 2, tech: 4 },
    tags: ['Upgrade', 'Rust', 'Tech'],
    requires: 'Hand Weapon',
    effects: [
      'Attach to any Hand Weapon.',
      'Bonus: Any model wounded by your Combat Hits gains a Stunned Marker on the D6 roll of 4+ (or automatically if you discard a Dark Stone).',
    ],
  },

  {
    id: 'ww_suspensor',
    name: 'Suspensor',
    type: 'upgrade',
    cost: { tech: 8 },
    tags: ['Upgrade', 'Rust', 'Tech'],
    requires: 'Any Item',
    effects: [
      'Attach to any Item.',
      'Bonus: The Item now counts as having one fewer Weight.',
    ],
  },

  // ── Gun Upgrades ───────────────────────────────────────────────────────
  {
    id: 'ww_axe_blade_attachment',
    name: 'Axe Blade Attachment',
    type: 'upgrade',
    cost: { scrap: 10 },
    tags: ['Upgrade', 'Bayonet', 'Rust'],
    requires: 'Gun',
    effects: [
      'Attach to any Gun.',
      'Bonus: Once per turn, you may add +1 Damage to one of your Hits against an adjacent model. +1 Combat.',
    ],
    modifiers: { combat: 1 },
  },

  {
    id: 'ww_chain_blade_attachment',
    name: 'Chain Blade Attachment',
    type: 'upgrade',
    cost: { scrap: 15, tech: 2 },
    tags: ['Upgrade', 'Bayonet', 'Rust', 'Tech'],
    requires: 'Gun',
    effects: [
      'Attach to any Gun.',
      'Bonus: Once per turn, add a Bleeding Marker to an adjacent model you just wounded.',
    ],
  },

  {
    id: 'ww_desert_scope',
    name: 'Desert Scope',
    type: 'upgrade',
    cost: { scrap: 3, tech: 3 },
    tags: ['Upgrade', 'Scope', 'Rust', 'Tech'],
    requires: 'Gun',
    effects: [
      'Attach to any Gun.',
      'Bonus: +2 Range and once per Attack with this Gun, you may Re-roll one missed To Hit roll (even if it was already Re-rolled).',
    ],
    modifiers: { range: 2 },
  },

  {
    id: 'ww_laser_scope',
    name: 'Laser Scope',
    type: 'upgrade',
    cost: { tech: 5 },
    tags: ['Upgrade', 'Scope', 'Rust', 'Tech'],
    requires: 'Gun',
    effects: [
      'Attach to any Gun.',
      'Bonus: Your Ranged Hits with this Gun are +1 Damage to any target that is at least 3 spaces away.',
    ],
  },
];
