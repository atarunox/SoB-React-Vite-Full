// src/data/townLocations/smugglersDenOutlawActions.js
// Actions shown in the “Smugglers & Thieves (Outlaw Only)” tab

const smugglersDenOutlawActions = {
  id: 'smugglersDenOutlawActions',
  name: 'Smugglers & Thieves (Outlaw Only)',
  type: 'service',
  items: [],
  services: [
    {
      id: 'join_bank_heist',
      name: 'Join a Bank Heist',
      price: 0,
      tags: ['OutlawOnly', 'OncePerTownStay', 'EndsVisit'],
      rules: {
        text: [
          'Make a Cunning 5+ test to rob the Town bank with a local group of Outlaws.',
          'You may discard an Explosive to gain +3 Cunning for this test.',
          'Success: gain D6×$50 and XP (GM decides). For each 1 rolled during the heist, take D6 Hits.',
          'If arrested, you are set to hang. Make an Agility 4+ test to escape into the crowd (gain 25 XP, your Town Stay ends).',
          'If failed, your Hero is killed the following dawn (the posse may attempt The Hanging High Town Adventure to rescue).',
        ],
        outlawOnly: true,
        oncePerTownStay: true,
      },
    },
    {
      id: 'rustle_cattle',
      name: 'Rustle Cattle',
      price: 0,
      tags: ['OutlawOnly', 'OncePerTownStay', 'EndsVisit', 'Take1CorruptionHit'],
      rules: {
        text: [
          'Take 1 Corruption Hit.',
          'Make an Agility 5+ test to ride out with rustlers.',
          'Success: gain cash based on results (e.g., $50 per qualifying roll, bonuses if mounted/Transport).',
          'Failure: the herd scatters—you take some lumps and ride back worse for wear.',
        ],
        outlawOnly: true,
        oncePerTownStay: true,
      },
    },
    {
      id: 'shady_contacts',
      name: 'Shady Contacts',
      price: 0,
      tags: ['OncePerTownStay', 'AllHeroes'],
      rules: {
        text: [
          'Look at the top D6–2 cards of the Daily Event deck and replace them in any order.',
          'Gain 10 XP.',
        ],
        oncePerTownStay: true,
      },
    },
  ],
};

export default smugglersDenOutlawActions;
