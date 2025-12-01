export const skillTree_Prospector = [
  // Row 0: Top-level skills
  [
    {
      id: 'native_health1',
      name: 'Tribal Resilience',
      description: '+1 Max Health',
      effects: { health: 1 },
      unlockedBy: null,
    },
    {
      id: 'native_grit1',
      name: 'Savage Grit',
      description: '+1 Grit',
      effects: { maxGrit: 1 },
      unlockedBy: null,
    },
    {
      id: 'native_spirit1',
      name: 'Jungle Instincts',
      description: '+1 Spirit',
      effects: { Spirit: 1 },
      unlockedBy: null,
    },
    {
      id: 'native_initiative1',
      name: 'Stalking Hunter',
      description: '+1 Initiative',
      effects: { Initiative: 1 },
      unlockedBy: null,
    },
  ],

  // Row 1
  [
    {
      id: 'native_health2',
      name: 'Thick Hide',
      description: '+1 Defense',
      effects: { defense: 1 },
      unlockedBy: 'native_health1',
    },
    {
      id: 'native_grit2',
      name: 'Battle Hardened',
      description: '+1 Grit recovery per turn',
      effects: { gritRegen: 1 },
      unlockedBy: 'native_grit1',
    },
    {
      id: 'native_spirit2',
      name: 'Ancestral Guidance',
      description: '+1 Lore',
      effects: { Lore: 1 },
      unlockedBy: 'native_spirit1',
    },
    {
      id: 'native_initiative2',
      name: 'Skirmisher',
      description: '+1 Agility',
      effects: { Agility: 1 },
      unlockedBy: 'native_initiative1',
    },
  ],

  // Row 2
  [
    {
      id: 'native_health3',
      name: 'Tough as Nails',
      description: '+2 Max Health',
      effects: { health: 2 },
      unlockedBy: 'native_health2',
    },
    {
      id: 'native_grit3',
      name: 'Fearless Roar',
      description: '+1 Willpower',
      effects: { willpower: 1 },
      unlockedBy: 'native_grit2',
    },
    {
      id: 'native_spirit3',
      name: 'Jungle Ritualist',
      description: '+1 Spell/Spirit Effectiveness',
      effects: { spellPower: 1 },
      unlockedBy: 'native_spirit2',
    },
    {
      id: 'native_initiative3',
      name: 'Swift Strikes',
      description: '+1 To-Hit (melee)',
      effects: { toHitMelee: 1 },
      unlockedBy: 'native_initiative2',
    },
  ],

  // Row 3
  [
    {
      id: 'native_health4',
      name: 'Unbreakable',
      description: '+1 Defense and +2 Health',
      effects: { defense: 1, health: 2 },
      unlockedBy: 'native_health3',
    },
    {
      id: 'native_grit4',
      name: 'Spiritual Fury',
      description: 'Recover 1 Grit once per Adventure',
      effects: { oncePerAdventure: 'Recover 1 Grit' },
      unlockedBy: 'native_grit3',
    },
    {
      id: 'native_spirit4',
      name: 'Totem Warrior',
      description: '+1 Spirit and +1 Sanity',
      effects: { Spirit: 1, sanity: 1 },
      unlockedBy: 'native_spirit3',
    },
    {
      id: 'native_initiative4',
      name: 'Predator\'s Grace',
      description: '+1 Initiative and +1 Agility',
      effects: { Initiative: 1, Agility: 1 },
      unlockedBy: 'native_initiative3',
    },
  ],
];


export default function Placeholder() { return null; }
