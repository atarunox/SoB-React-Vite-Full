// src/data/townLocations/BlastedWastesTown/DesertMarketplace/desertMarketplace.js

export default {
  id: 'desertMarketplace',
  name: 'Desert Marketplace',
  town: 'BlastedWastesTown',
  type: 'Shop',
  description:
    'A sprawling alien bazaar in the desert wasteland, full of shady dealings, rare finds, and dangerous encounters.',

  events: [
    {
      roll: 2,
      name: 'Alien Assassin',
      lore:
        'Walking through a side street, you are pulled into the shadows and thrown to the ground! Standing over you, a masked assassin brandishes a rusty serrated blade and a contract for your life!',
      effect:
        'Make a Luck 5+ test (roll a number of dice equal to your Luck) to break free and escape! If failed, roll once on the Injury Table, using only a single D6+1.',
    },

    {
      roll: 3,
      name: 'Down a Dark Alley',
      lore:
        'While passing down a dark alley an alien street urchin bumps into you and runs off. Checking your pockets, you discover something is missing!',
      effect:
        'Choose 1 Item or Side Bag Token to discard, stolen by the little thief.',
    },

    {
      roll: 4,
      name: 'Market Chase',
      lore:
        "A gang of angry looking alien thugs has decided that they don't like the way you look and begins chasing you through the market streets, with hate in their eyes!",
      effect:
        'Make an Agility 4+ test (roll a number of dice equal to your Agility) to outrun the thugs or a Cunning 5+ test (dice = Cunning) to outwit them, taking cover until they have passed. If successful, gain 25 XP. If failed, they find you and rough you up! Take 2D6 Wounds, ignoring Defense, and your Location Visit is over.',
    },

    {
      roll: 5,
      name: 'Street Brawl',
      lore:
        'Broken and bitter enemies roam the streets here, fighting over scraps of food to survive. As you pick your way through the filth, a brawl breaks out and you are swept up in it.',
      effect:
        'Take D6 Hits that do 2 Wounds each.',
    },

    {
      roll: 6,
      name: 'Dusty Streets and Dirty Looks',
      lore:
        'Just another day in a desert wasteland alien prison colony barter town.',
      effect: 'No Event.',
    },

    {
      roll: 7,
      name: 'Dusty Streets and Dirty Looks',
      lore:
        'Just another day in a desert wasteland alien prison colony barter town.',
      effect: 'No Event.',
    },

    {
      roll: 8,
      name: 'Dusty Streets and Dirty Looks',
      lore:
        'Just another day in a desert wasteland alien prison colony barter town.',
      effect: 'No Event.',
    },

    {
      roll: 9,
      name: 'Lucky Find',
      lore:
        'One of the market stalls is selling a rare and precious item discovered out in the desert dunes.',
      effect:
        'Draw a World card and an Artifact from that World. You may purchase this Item for $100 + its listed Gold Value.',
    },

    {
      roll: 10,
      name: 'Starving Refugees',
      lore:
        'The back alleys and doorways are crowded with huddled refugees; diseased and hungry.',
      effect:
        'You may give supplies or Gold to these refugees to help them in their plight. You may discard 1 Side Bag Token or $100. If you do, you may also Recover a Grit and remove 1 Corruption Point.',
    },

    {
      roll: 11,
      name: 'Tattoo Parlor',
      lore:
        'Sinewy and scarred, you spy the gaze of a tough looking alien tattoo artist.',
      effect:
        'You may get any Wasteland Tattoo here at the cost of $250 \u00d7 the number of Tattoos you already have (so the first Tattoo is free). Each Wasteland Tattoo gives you \u2013 Once per Adventure, Recover a Grit.',
    },

    {
      roll: 12,
      name: 'Slave Auction',
      lore:
        'An alien slave auction is running in the market square, with a row of chained and filthy looking prisoners up for sale.',
      effect:
        'You may pay to free one of the alien slaves for 2D6 \u00d7 $100. If you do, you may either release them at a life debt, gaining +1 Corruption Resistance (you may gain 1 extra Corruption before gaining a Mutation), or take them on as an alien Ally (Only if you have the Alien Expansion \u2013 use as a Breachman Ally, but with keyword Alien, 1 less Health, and they will never charge you their normal Grit Cost to Hire as they owe you a life debt) \u2013 you must still pay to Revive them between Adventures if killed though.',
    },
  ],
};
