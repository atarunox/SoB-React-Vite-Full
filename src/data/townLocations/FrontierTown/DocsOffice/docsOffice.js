// src/data/townLocations/FrontierTown/DocsOffice/docsOffice.js

export default {
  id: 'docsOffice',
  name: "Doc's Office",
  type: 'Shop',
  description:
    'Medical attention, surgery, injections, and corruption treatment provided by the town doctor.',

  events: [
    {
      roll: 2,
      name: "The 'Good' Doctor",
      lore:
        "The Doc has been performing late-night experiments on the locals. Catching him in the act, he runs off.",
      effect:
        "Medical Attention is unavailable to any Hero until after the next Adventure."
    },

    {
      roll: 3,
      name: 'Plague Tent',
      lore:
        "The Doc’s hands are full as a demonic plague spreads through town.",
      effect:
        "Make a Luck 5+ test. Fail: gain D3 Corruption with no Willpower saves and your Max Grit is reduced to 1 during the next Adventure."
    },

    {
      roll: 4,
      name: 'Dirty Tools',
      lore:
        "The Doc is using dirty tools for operating… unsanitary and risky.",
      effect:
        "All Surgery rolls today are –1 (to a minimum of 0)."
    },

    {
      roll: 5,
      name: 'Dirty Tools',
      lore:
        "The Doc is using dirty tools for operating… unsanitary and risky.",
      effect:
        "All Surgery rolls today are –1 (to a minimum of 0)."
    },

    {
      roll: 6,
      name: 'The Smell of Death',
      lore:
        "Too familiar at the Doc's Office.",
      effect: 'No Event.'
    },

    {
      roll: 7,
      name: 'The Smell of Death',
      lore:
        "Too familiar at the Doc's Office.",
      effect: 'No Event.'
    },

    {
      roll: 8,
      name: 'The Smell of Death',
      lore:
        "Too familiar at the Doc's Office.",
      effect: 'No Event.'
    },

    {
      roll: 9,
      name: 'Expert Surgeon',
      lore:
        "The Doc is an expert surgeon today… and he’s only had one or two drinks!",
      effect:
        "All Surgery rolls today are +1."
    },

    {
      roll: 10,
      name: 'Expert Surgeon',
      lore:
        "The Doc is an expert surgeon today… and he’s only had one or two drinks!",
      effect:
        "All Surgery rolls today are +1."
    },

    {
      roll: 11,
      name: 'Special Mission',
      lore:
        "The Doc gives you a free Specimen Jar and asks you to recover a sample from another world.",
      effect:
        "Gain a Specimen Jar (used by certain Docs Office services)."
    },

    {
      roll: 12,
      name: 'Medical Miracle',
      lore:
        "Using a new alien device, the Doc waves it over you and you feel… incredible.",
      effect:
        "Roll a D6 for any number of Injuries, Mutations, or Parasites. On 4+, remove it. On 1, take a Corruption point."
    }
  ]
};
