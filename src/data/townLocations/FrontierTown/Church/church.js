// src/data/townLocations/FrontierTown/Church/church.js

export default {
  id: 'church',
  name: 'Church',
  type: 'Shop',
  description:
    'A holy sanctuary offering rituals, blessings, and spiritual protection for Heroes seeking aid.',

  events: [
    {
      roll: 2,
      name: "Cult Worshippers",
      lore:
        "The Order here is not the Sacred Order, but the Order of the Crimson Hand! You struggle with the Inquisitor as he tries to use an artifact on you.",
      effect:
        "Make a Strength 6+ test (roll a number of dice equal to your Strength). Pass: Draw a Mine Artifact. Fail: he steals one Artifact from you. The Church is closed until after the next Adventure."
    },

    {
      roll: 3,
      name: "Possession",
      lore:
        "A Preacher collapses as a demonic force overwhelms him. Rising once more, he stares into your soul.",
      effect:
        "Take D6 Horror Hits; any Sanity lost is permanent. Church closed until after the next Adventure."
    },

    {
      roll: 4,
      name: "Dark Stone Altar",
      lore:
        "The altar is inlaid with shimmering Dark Stone gems.",
      effect:
        "All Rituals now require +1 Dark Stone for the rest of the Town Stay."
    },

    {
      roll: 5,
      name: "Dark Stone Altar",
      lore:
        "The altar is inlaid with shimmering Dark Stone gems.",
      effect:
        "All Rituals now require +1 Dark Stone for the rest of the Town Stay."
    },

    {
      roll: 6,
      name: "Faith to the Forsaken",
      lore:
        "The Preacher’s fiery sermon echoes through the mostly empty church.",
      effect: "No Event."
    },

    {
      roll: 7,
      name: "Faith to the Forsaken",
      lore:
        "The Preacher’s fiery sermon echoes through the mostly empty church.",
      effect: "No Event."
    },

    {
      roll: 8,
      name: "Faith to the Forsaken",
      lore:
        "The Preacher’s fiery sermon echoes through the mostly empty church.",
      effect: "No Event."
    },

    {
      roll: 9,
      name: "A Gift of Blessing",
      lore:
        "Recognized as a champion of light, the Preacher bestows a blessing.",
      effect:
        "Choose any Blessed Aura to gain for free."
    },

    {
      roll: 10,
      name: "A Gift of Blessing",
      lore:
        "Recognized as a champion of light, the Preacher bestows a blessing.",
      effect:
        "Choose any Blessed Aura to gain for free."
    },

    {
      roll: 11,
      name: "Protective Shield",
      lore:
        "Your mind is steeled against the encroaching darkness.",
      effect:
        "During the next Adventure, you may cancel one Darkness or Growing Dread card for free."
    },

    {
      roll: 12,
      name: "Divine Fortitude",
      lore:
        "Your soul is fortified through divine reflection.",
      effect:
        "Gain D3 Sanity."
    }
  ]
};
