// src/data/townLocations/mutantQuarter.js
export default {
  id: 'mutant_quarter',
  name: 'Mutant Quarter',
  type: 'Shop',
  description:
    'Twisted district of outcasts and experiments. You may add +1 when rolling to avoid Unwanted Attention here.',

  events: [
    {
      roll: 2,
      name: 'Writhing Mass of Flesh',
      effect:
        'The Mutant Quarter is destroyed. Every Hero in Town must make a Lore 6+ test; for each 6+ rolled, gain 20 XP and choose one building to be Protected. At the end of the current day in Town, roll a D6 for every unprotected building; on 1–2 that building is Destroyed.',
      lore:
        'An ever-growing mass of tentacles and flesh tears the Quarter apart, dragging buildings and people into itself.',
    },
    {
      roll: 3,
      name: '“One of us! One of us!!”',
      effect:
        'If you have 3+ Mutations, nothing happens. Otherwise, make a Strength 6+ test or be dunked into a vat of liquid Dark Stone and immediately gain D3 Mutations.',
      lore:
        'A mob of mutants drags you toward a steaming tub of Dark Stone, eager to welcome you into the fold.',
    },
    {
      roll: 4,
      name: 'Railworkers’ Strike',
      effect:
        'All Heroes in the Mutant Quarter and in 2 other random Town Locations must roll a D6. If the roll is > number of Mutations you have, take D6 Wounds, ignoring Defense.',
      lore:
        'Mutant railworkers riot in the streets; stones, tools, and fists fly everywhere.',
    },
    {
      roll: 5,
      name: 'Little Thief',
      effect:
        'Make an Agility 5+ test to catch a mutant street urchin. Pass: gain 20 XP. Fail: discard 3 Side Bag Tokens OR D3 Dark Stone (your choice).',
      lore:
        'A young mutant bumps into you, vanishing into the crowd with whatever she lifted from your pockets.',
    },
    {
      roll: 6,
      name: 'Street Beggars',
      effect:
        'Pay D6×$10 to help a starving mutant family; you may then Recover 1 Grit.',
      lore:
        'A desperate family tugs at your coat, pleading for help to survive another day.',
    },
    {
      roll: 7,
      name: 'Ricketty Buildings and Deformities Galore',
      effect: 'No Event.',
      lore:
        'Crooked shacks and twisted bodies are just the scenery in this part of town.',
    },
    {
      roll: 8,
      name: 'Mutant Saloon',
      effect:
        'Gain 1 Tequila Token. You may pay $25 for a wild show: gain 15 XP and on a D6 roll of 3+, Recover 1 Grit and take 1 Corruption Hit.',
      lore:
        'Inside the mutant saloon the drinks are strong, and the dancers are stronger (and definitely not human).',
    },
    {
      roll: 9,
      name: 'Party in the Streets',
      effect:
        'Every Hero here may make a Luck 4+ test. For each 4+, Heal D6 Health/Sanity in any mix. If at least one 6 is rolled, gain +1 Sanity (once per Town Stay).',
      lore:
        'A raucous street festival erupts, offering music, food, and a brief escape from the horrors of the world.',
    },
    {
      roll: 10,
      name: 'Street Vendor',
      effect:
        'Gain 25 XP and 1 free Bandages, Whiskey, or Dynamite token for each Mutation you have.',
      lore:
        'A friendly vendor recognizes your efforts on behalf of mutants and presses extra supplies into your hands.',
    },
    {
      roll: 11,
      name: 'Preaching the Faith',
      effect:
        'Until the end of your next Adventure you gain the Mutant and Holy keywords, Spirit Armor 5+, and you are Immune to Corruption Hits/Corruption Points.',
      lore:
        'A heavily mutated preacher delivers a blazing sermon, cloaking you in a strange yet powerful blessing.',
    },
    {
      roll: 12,
      name: 'A Few New Tricks',
      effect:
        'Gain D6×25 XP. From now on, while you have at least one Mutation with “Tentacle” or “Tail” in the title, you count as having 1 extra Hand icon each turn (no extra effect if you already have the Prehensile Tail Mutation).',
      lore:
        'An old mutant gunslinger teaches you how to make the most of every twitching limb in a fight.',
    },
  ],
};
