// src/data/townLocations/BlastedWastesTown/Temple/templeServices.js
// Shared services available at the Temple regardless of Idol.

export default [
  {
    id: 'temple_banishment_of_madness',
    name: 'Banishment of Madness',
    category: 'Ritual',
    type: 'Ritual',
    tags: ['Ritual', 'Service'],
    cost: { gold: 250 },
    limit: '1 Banishment attempt per Visit',
    description:
      'Choose one Madness or Curse you want to remove and roll on the chart below. If a Curse is chosen, -1 to the roll.',
    effect:
      'D6 Roll Result: 0 — Dead! Your Hero is killed during the ritual. 1 — Demonic Attack: The ailment is not Healed and you lose D6 Health/Sanity (any mix) permanently. 2–3 — Failed: The ailment is not Healed. 4–6+ — Success! The Madness or Curse is Healed!',
    resultTable: {
      '0': 'Dead! — Your Hero is killed during the ritual.',
      '1': 'Demonic Attack — The ailment is not Healed and you lose D6 Health/Sanity (any mix) permanently.',
      '2-3': 'Failed — The ailment is not Healed.',
      '4-6': 'Success! — The Madness or Curse is Healed!',
    },
  },

  {
    id: 'temple_cleansing_torment',
    name: 'The Cleansing Torment',
    category: 'Ritual',
    type: 'Ritual',
    tags: ['Ritual', 'Service'],
    cost: { gold: 100 },
    description:
      'Pushing you into the rusted fuel chamber from an old wreck, the alien priest seals the hatch behind you. An orange gas fills the pod from vents in the wall, as your world spins with bleeding colors!',
    effect:
      'Remove D6-2 Corruption points from your Hero. If no Corruption points are removed, instead you take D6 Sanity Damage, ignoring Willpower.',
  },
];
