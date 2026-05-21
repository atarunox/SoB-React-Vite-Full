// src/data/cards/wastelandWarmasters.js
// Wasteland Warmasters — named leader cards for Wasteland Scavenger encounters.
// Each Warmaster always leads a specific warband and has unique stats and abilities.

export const WASTELAND_WARMASTER_CARDS = [
  {
    id: 'reejek_of_marn',
    name: "Ree'Jek of Marn",
    type: 'Wasteland Warmaster',
    flavor: "One of the Night Runners deadliest female warriors, Ree'Jek of Marn fights with twin blades made of polished bone. Though heavily mutated, she is known for her deadly speed.",
    leadsWarband: 'Night Runners',
    stats: {
      xp: '+5',
    },
    abilities: [
      {
        name: 'Deadly Speed',
        effect: "Ree'Jek may move through other models and is +2 Initiative.",
      },
      {
        name: 'Twin Blades',
        effect: "Ree'Jek loses Tribal Shield, but instead is +2 Combat and immune to Critical Hits.",
      },
      {
        name: 'Slash',
        effect: "Any time an adjacent Hero rolls a 1 on a To Hit roll, they immediately take 1 Combat Hit from Ree'Jek.",
      },
    ],
    tags: ['Wasteland', 'Warmaster', 'Night Runners'],
  },
  {
    id: 'kokontar_the_red_destroyer',
    name: "Ko'Kon'Tar the Red Destroyer",
    type: 'Wasteland Warmaster',
    flavor: "Using the blood of his fallen enemies as war paint, Ko'Kon'Tar, The Red Destroyer, has united several of the Death Claw Raider tribes to form an army, sweeping across the desert.",
    leadsWarband: 'Death Claw Raiders',
    stats: {
      healthPerHero: '+5',
      bonusCombat: '+2',
      xp: '+10',
    },
    abilities: [
      {
        name: 'Unstoppable',
        effect: "At the start of the Fight, place 3 Grit here. Any time Ko'Kon'Tar would take 5 or more Wounds from a single Hit (or if the Hit would kill him), remove 1 Grit to cancel all Damage from that Hit.",
      },
    ],
    tags: ['Wasteland', 'Warmaster', 'Death Claw Raiders'],
  },
  {
    id: 'hyrajin_the_bone_king',
    name: "Hy'ra'Jin the Bone King",
    type: 'Wasteland Warmaster',
    flavor: "Known for building his desert fortress out of the bones of his enemies, Hy'ra'Jin uses fear to confuse his prey before enslaving and feeding on them, over time.",
    leadsWarband: 'Flesh Eaters',
    stats: {
      healthPerHero: '+2',
      xp: '+5',
    },
    abilities: [
      {
        name: 'Terror (2)',
        effect: "Heroes on the same Map Tile at the start of their Activation take 2 Horror Hits.",
      },
      {
        name: 'Fearmonger',
        effect: "Hy'ra'Jin gains +1 Combat for every Hero in the Posse that currently has 3 or more Sanity Damage.",
      },
    ],
    tags: ['Wasteland', 'Warmaster', 'Flesh Eaters'],
  },
  {
    id: 'tarrio_gant_the_krakens_chosen',
    name: "Tar'Rio Gant the Kraken's Chosen",
    type: 'Wasteland Warmaster',
    flavor: "Having had one of his arms eaten by the Kraken, Tar'Rio Gant was deemed 'chosen' by the god beast to lead his warband into battle. Wearing armor made of crude scrap arm, Sand Crab chiton and fitted with a crude scrap arm, he fanatically sends his foes back to the sand.",
    leadsWarband: 'The Kraken-Born',
    stats: {
      bonusCombat: '+1',
      xp: '+5',
    },
    abilities: [
      {
        name: 'Chiton Armor',
        effect: "Armor 5+. If Tar'Rio Gant would gain other Armor from a different source, his Chiton Armor is increased to 4+ instead.",
      },
    ],
    tags: ['Wasteland', 'Warmaster', 'The Kraken-Born'],
  },
  {
    id: 'celarrius_drakoth_betrayer_of_the_empire',
    name: 'Celarrius Drakoth Betrayer of the Empire',
    type: 'Wasteland Warmaster',
    flavor: "Celarrius Drakoth was once a supreme general in the Vento Star Empire. After his failed attempt to overthrow the emperor, Drakoth and his followers were marooned on this planet as a death sentence. Rising to power once again, here in the wastes, his thirst for conquest grows.",
    leadsWarband: 'The Sons of Drakoth',
    stats: {
      healthPerHero: '+3',
      xp: '+10',
    },
    abilities: [
      {
        name: 'Tough',
        effect: 'Immune to Critical Hits.',
      },
      {
        name: 'Vento Blaster',
        effect: 'Celarrius Drakoth loses Tribal Shield but gains Snap Fire and a Ranged Attack: Range 8, Shots 3, Damage D6.',
      },
      {
        name: 'Inspiring Leadership',
        effect: 'All other Alien Enemies gain +3 Health.',
      },
    ],
    tags: ['Wasteland', 'Warmaster', 'The Sons of Drakoth', 'Alien'],
  },
];

export default WASTELAND_WARMASTER_CARDS;
