// src/data/townLocations/BlastedWastesTown/MiningOperation/miningOperation.js

export default {
  id: 'miningOperation',
  name: 'Mining Operation',
  town: 'BlastedWastesTown',
  type: 'Shop',
  description:
    'A sprawling network of tunnels, refineries, and fungus farms dug into the rock and sand beneath Barter Town.',

  events: [
    {
      roll: 2,
      name: 'Refinery Explosion',
      lore:
        'A massive explosion rips through the tunnels and Barter Town as the Refinery explodes in a ball of fire and billowing black smoke!',
      effect:
        'The Mining Operation is Destroyed. Also, roll a D6 for each of the 1 or 2 other Town Locations adjacent to it on the Town Map. On the roll of 1 or 2, that Location is also Destroyed. Any Hero at one of these Destroyed Locations also takes 2D6 Wounds, ignoring Defense.',
    },

    {
      roll: 3,
      name: 'Mining Accident',
      lore:
        'Digging through the rock and sand, the miners have struck the hull of an unstable old ship, accidentally detonating its Warp Drive!',
      effect:
        'All Heroes at the Mining Operation immediately take D6 Corruption Hits from the Dark Stone radiation and Heroes may not Work the Mines today.',
    },

    {
      roll: 4,
      name: 'Fungus Revolt',
      lore:
        'The Fungus Farm Workers have started an uprising!',
      effect:
        'All Heroes at the Mining Operation immediately take D6 Hits from the malnourished workers rioting, and Heroes may not Work the Fungus Farms today.',
    },

    {
      roll: 5,
      name: 'The Dark Beneath the Surface',
      lore:
        'What evil lurks in the dark beneath the surface is sometimes released by those digging too deep.',
      effect:
        'Move the Darkness marker 1 Day forward on the Town Event Track.',
    },

    {
      roll: 6,
      name: 'The Dark Beneath the Surface',
      lore:
        'What evil lurks in the dark beneath the surface is sometimes released by those digging too deep.',
      effect:
        'Move the Darkness marker 1 Day forward on the Town Event Track.',
    },

    {
      roll: 7,
      name: 'Toxic Fumes and a Cavern of Spores',
      lore:
        "It wouldn't be a day down in the tunnels without a few deaths to keep you on your toes.",
      effect: 'No Event.',
    },

    {
      roll: 8,
      name: 'Worker Shortage',
      lore:
        'There has been a shortage of people to work down in the tunnels ever since the last Worker Raid.',
      effect:
        'Heroes gain an extra $100 for any Work Down in the Tunnels they do today.',
    },

    {
      roll: 9,
      name: 'Worker Shortage',
      lore:
        'There has been a shortage of people to work down in the tunnels ever since the last Worker Raid.',
      effect:
        'Heroes gain an extra $100 for any Work Down in the Tunnels they do today.',
    },

    {
      roll: 10,
      name: 'Good Harvest',
      lore:
        'The Fungus harvest has been particularly good this season and there is a surplus of the crops.',
      effect:
        'All Heroes at the Mining Operation today may purchase any of the Fungus Crops for -$25 each.',
    },

    {
      roll: 11,
      name: 'Buried Town',
      lore:
        'Digging in the tunnels, the workers have discovered the ruins of an old Barter Town that once stood here, now consumed by the desert sands.',
      effect:
        'Draw 2 Gear cards and 2 Blasted Wastes Artifacts to see what has been unearthed. Any Heroes at the Mining Operation today may purchase any of these Items for their listed Gold value +$100 (Heroes get first pick of purchasing based on highest to lowest Lore \u2013 roll off if tie).',
    },

    {
      roll: 12,
      name: 'Astounding Discovery',
      lore:
        'Whispered rumors abound about something astounding discovered down in the mines. They say the workers have found part of an ancient ship buried in the rock that pre-dates anything else discovered in this region.',
      effect:
        'You may draw an Artifact from the Derelict Ship OtherWorld (if you do not have the Derelict Ship Expansion, instead draw a World card and an Artifact from that World).',
    },
  ],
};
