// src/data/townLocations/BlastedWastesTown/WastelandWorkshop/wastelandWorkshop.js

export default {
  id: 'wastelandWorkshop',
  name: 'Wasteland Workshop',
  town: 'BlastedWastesTown',
  type: 'Shop',
  description:
    'A rough-hewn workshop run by a grizzled Junksmith who cobbles together weapons, armor, and gadgets from scrap metal and salvaged tech.',

  events: [
    {
      roll: 2,
      name: 'Boiler Overload',
      lore:
        'Steam erupts in a massive, scalding cloud and bolts are shot like bullets out of the bursting boiler! Ruuuunnn!!! Every Hero at this Location must make a Luck 5+ test to get out before the boiler explodes!',
      effect:
        'If successful, gain 15 XP. If failed, you are caught in the blast and burned severely! Roll once on the Injury Table using a D6+3 (instead of the normal 2D6). After all Heroes here have made this test, the Wasteland Workshop is destroyed and may not be visited for the rest of this Town Stay.',
    },

    {
      roll: 3,
      name: 'Rampaging Robot',
      lore:
        "One of the Junksmith's latest creations is running amok in the workshop! Every Hero at this Location must make an Agility 5+ test to avoid getting knocked around by the crazed machine!",
      effect:
        'If successful, gain 15 XP. If failed, take D6 Hits that do 2 Damage each (as normal, this damage carries over to the next Adventure).',
    },

    {
      roll: 4,
      name: 'Broken Torch',
      lore:
        "The Junksmith's welding torch is on the fritz again.",
      effect:
        'Items and Upgrades that include 1 or more Scrap as part of their cost may not be purchased here today.',
    },

    {
      roll: 5,
      name: 'Over a Barrel',
      lore:
        'Looking you up and down, the Junksmith sees you as rich travelers, ready to be taken for a ride.',
      effect:
        'All purchases made at the Wasteland Workshop today cost an extra +$50 x your Hero Level, in addition to the normal cost.',
    },

    {
      roll: 6,
      name: 'The Smell of Burning Oil',
      lore:
        'Warms the heart and burns the nostrils.',
      effect: 'No Event.',
    },

    {
      roll: 7,
      name: 'The Smell of Burning Oil',
      lore:
        'Warms the heart and burns the nostrils.',
      effect: 'No Event.',
    },

    {
      roll: 8,
      name: 'The Smell of Burning Oil',
      lore:
        'Warms the heart and burns the nostrils.',
      effect: 'No Event.',
    },

    {
      roll: 9,
      name: 'Junk Shortage',
      lore:
        'No one has been able to bring back much usable scrap due to all of the raiders in the area lately.',
      effect:
        'All Scrap and Tech Tokens sold here today are worth an extra $25 each for Scrap and $100 each for Tech.',
    },

    {
      roll: 10,
      name: 'Cargo Crate',
      lore:
        'A group of scavengers have brought back a beaten crate, pulled from the wreckage of a crashed ship.',
      effect:
        'You may pay D6 x $100 to purchase and open the crate! If you do, roll 2D6 (no Grit). If the roll is 5 or higher, collect Scrap Tokens equal to the roll. If the roll is doubles, you may also collect Tech Tokens equal to the double number rolled or draw a World card and an Artifact from that World. If the roll is less than 5, the crate is empty.',
    },

    {
      roll: 11,
      name: 'Lend a Hand',
      lore:
        'Feeling a bit overwhelmed by the demands of one of the local Warlords, the Junksmith could use a hand.',
      effect:
        "You may give up the rest of your day's Location Visit here to work in the shop, gaining D6 x $50 and Recovering 1 Grit.",
    },

    {
      roll: 12,
      name: 'One of a Kind',
      lore:
        'The Junksmith has been tinkering with a new idea and wants to test it out on you.',
      effect:
        'You may choose any Item you have with an open Upgrade Slot and roll a D6. On the roll of 5 or 6, that Item gains a unique Upgrade (filling 1 Slot) granting +1 to a Random Skill (Roll D6: 1-Agility, 2-Cunning, 3-Spirit, 4-Strength, 5-Lore, 6-Luck). You must give this Item a name.',
    },
  ],
};
