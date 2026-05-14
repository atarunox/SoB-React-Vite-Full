// src/data/townLocations/FrontierTown/SheriffsOffice/sheriffsOffice.js
export default {
  id: 'sheriffs_office',
  name: "Sheriff's Office",
  type: 'Shop',
  description:
    'Seat of law in town. Outlaw Heroes may not visit the Sheriff\'s Office, except to use Pay Off Your Warrants (no roll for Event).',

  events: [
    {
      roll: 2,
      name: 'Jailbreak',
      effect:
        'The Town Stay is over for all Heroes at the end of the current Day (you must still roll for Town Event). The Heroes\' next Adventure is automatically the Town Adventure "Jailbreak", though this can be avoided if all Heroes agree to flee before the shooting begins (and to start the next Adventure with no Grit).',
      lore:
        'With his hanging scheduled for today, a ruthless band of Outlaws wastes no time in trying to break out their jailed comrade. You just happen to be in the wrong place at the wrong time!',
    },
    {
      roll: 3,
      name: 'Corrupt Sheriff',
      effect:
        'Every Law Hero at the Sheriff\'s Office must immediately Flee Town or challenge the Corrupt Sheriff\'s authority! To challenge him, make a Spirit 5+ test. If successful, he is defeated and runs for the hills, gain 50 XP and D6×$50. If failed, he draws on you and guns you down. Roll once on the Injury Chart. If the Corrupt Sheriff is not defeated by any Law Hero here, all Heroes in Town are considered Wanted! until the end of this Town Stay.',
      lore:
        'The local Sheriff has gone mad with power and greed.',
    },
    {
      roll: 4,
      name: 'Insane Ramblings',
      effect:
        'Take 2D6 Horror Hits. If the number rolled is doubles, also immediately move the marker 2 spaces forward on the Town Event Track.',
      lore:
        'One of the prisoners is rambling on in his jail cell about the insignificance of humanity and the coming of dark gods. It\'s hard not to be unnerved by it.',
    },
    {
      roll: 5,
      name: 'Cold, Hard Justice',
      effect: 'No Event.',
      lore:
        'Blind, with a smoking pistol in each hand! You wouldn\'t want it any other way.',
    },
    {
      roll: 6,
      name: 'Cold, Hard Justice',
      effect: 'No Event.',
      lore:
        'Blind, with a smoking pistol in each hand! You wouldn\'t want it any other way.',
    },
    {
      roll: 7,
      name: 'Cold, Hard Justice',
      effect: 'No Event.',
      lore:
        'Blind, with a smoking pistol in each hand! You wouldn\'t want it any other way.',
    },
    {
      roll: 8,
      name: 'Cold, Hard Justice',
      effect: 'No Event.',
      lore:
        'Blind, with a smoking pistol in each hand! You wouldn\'t want it any other way.',
    },
    {
      roll: 9,
      name: 'Telegraph',
      effect:
        'You may Recover 1 Grit and Heal up to D6 Wounds/Sanity (any mix).',
      lore:
        'An incoming telegraph brings news of a Void Storm warning in your area. Time to steel your resolve.',
    },
    {
      roll: 10,
      name: 'Telegraph',
      effect:
        'You may Recover 1 Grit and Heal up to D6 Wounds/Sanity (any mix).',
      lore:
        'An incoming telegraph brings news of a Void Storm warning in your area. Time to steel your resolve.',
    },
    {
      roll: 11,
      name: '"We need Six Men!"',
      effect:
        'Every Hero at the Sheriff\'s Office that is not Law or Holy immediately gains the Become Deputized bonus for free (see other side). Then, any Hero that Joins a Manhunt today gains double any XP and Gold earned.',
      lore:
        'Mount Up! We\'ve got a job to do!',
    },
    {
      roll: 12,
      name: 'Legendary Outlaw',
      effect:
        'If you Escort a Prisoner today, it requires a Lore 6+ test, but you gain D8×$100 instead if successful.',
      lore:
        'Locked up in a cell, legendary Outlaw \'Sparky\' Scafford sits, waiting his transfer to the federal Marshals. With a wink and a smile he says, "My Pa\' might\'n have somthin\' to say \'bout that!"',
    },
  ],
};
