// src/data/cards/wastelandWarbands.js
// Wasteland Warbands modifier deck — drawn when Wasteland Scavengers spawn
// Each card gives the Scavenger group a warband identity with special rules.

export const WASTELAND_WARBAND_CARDS = [
  {
    id: 'death_claw_raiders_1',
    name: 'Death Claw Raiders',
    type: 'Wasteland Warband',
    abilities: [],
    xpBonus: 0,
    tags: ['Wasteland', 'Warband'],
  },
  {
    id: 'death_claw_raiders_2',
    name: 'Death Claw Raiders',
    type: 'Wasteland Warband',
    abilities: [],
    xpBonus: 0,
    tags: ['Wasteland', 'Warband'],
  },
  {
    id: 'flesh_eaters',
    name: 'Flesh Eaters',
    type: 'Wasteland Warband',
    abilities: [
      {
        name: 'The Hunger',
        effect: 'Wasteland Scavengers are +1 Damage against any Hero with Strength 3+, and +2 Damage against any Hero with Strength 5+.',
      },
    ],
    xpBonus: 5,
    tags: ['Wasteland', 'Warband'],
  },
  {
    id: 'the_sons_of_drakoth',
    name: 'The Sons of Drakoth',
    type: 'Wasteland Warband',
    abilities: [
      {
        name: 'Energy Weapons',
        effect: 'Any Hero that takes 1 or more Wounds from Ranged Attacks by Wasteland Scavengers also gains a Stunned marker.',
      },
      {
        name: 'Tech Gear',
        effect: 'Any time a Wasteland Scavenger is killed, place 1 Tech Token here. If the Warlord is killed, place D3 Tech Tokens instead. After the Fight, Heroes may collect 1 Tech Token each worth $25.',
      },
    ],
    xpBonus: 5,
    tags: ['Wasteland', 'Warband'],
  },
  {
    id: 'night_runners',
    name: 'Night Runners',
    type: 'Wasteland Warband',
    abilities: [
      {
        name: 'Heavily Mutated',
        effect: 'Wasteland Scavengers are +1 Defense and gain the Keyword Mutant.',
      },
      {
        name: 'Nocturnal',
        effect: 'During Night Encounters, Wasteland Scavengers are +1 Shot (Ranged) and +1 Initiative.',
      },
    ],
    xpBonus: 10,
    tags: ['Wasteland', 'Warband'],
  },
  {
    id: 'the_kraken_born',
    name: 'The Kraken-Born',
    type: 'Wasteland Warband',
    abilities: [
      {
        name: 'Fanatical',
        effect: 'Wasteland Scavengers gain the Keyword Fanatic and lose the Keyword Desert Raider. Each Scavenger gains additional Combat equal to their current Initiative value for that turn.',
      },
      {
        name: 'Endurance (3)',
        effect: 'Wasteland Scavengers may not take more than 3 Wounds from a single Hit.',
      },
    ],
    xpBonus: 15,
    tags: ['Wasteland', 'Warband'],
  },
];

export default WASTELAND_WARBAND_CARDS;
