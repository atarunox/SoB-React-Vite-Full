// src/data/townLocations/BlastedWastesTown/Temple/temple.js

export default {
  id: 'temple',
  name: 'Temple',
  town: 'BlastedWastesTown',
  type: 'Shop',
  description:
    'The first time any Hero visits the Temple during a Town Stay, roll a D6 to see what type of Idol the local inhabitants worship here. Each type of Idol has its own entry. During this Town Stay, Heroes may ONLY interact with the entry for the Idol rolled.',

  idols: [
    { roll: 1, name: 'Massive Warhead' },
    { roll: 2, name: 'The Great Kraken' },
    { roll: 3, name: 'Dark Stone Warp Drive' },
    { roll: 4, name: 'Deactivated Mk II Warden' },
    { roll: 5, name: 'Hall of Bones' },
    { roll: 6, name: 'Gateway to the Void' },
  ],

  events: [
    {
      roll: 2,
      name: 'Blood and Sacrifice',
      lore:
        "Throwing a hood over your head, you are dragged to the Idol's altar and made ready for sacrifice!",
      effect:
        'Make a Luck 5+ test to break free! If failed, roll twice on the Injury Table and your Town Stay is over.',
    },
    {
      roll: 3,
      name: '"Heretic!"',
      lore:
        "Something you did seems to have greatly offended the followers! It would seem a simple apology won't do.",
      effect:
        'Make a Cunning 6+ test to talk your way out of this. If failed, take D6 Hits and your Location Visit is over.',
    },
    {
      roll: 4,
      name: 'Fanatical Followers',
      lore:
        "Those who worship the Temple's Idol have limitless devotion to its power.",
      effect:
        "Use the number 4 Location Event unique to the Temple's Idol (listed in the section for that Idol).",
    },
    {
      roll: 5,
      name: '"Join us..."',
      lore:
        'The followers here seem quite adamant that you join their cult!',
      effect:
        "You may not interact with this Location any further until you purchase the Blessing of the Temple's Idol first (listed in the section for that Idol).",
    },
    {
      roll: 6,
      name: 'The Smell of Incense',
      lore:
        'Offerings to a disturbing idol and quiet chanting. These guys clearly know how to have a good time.',
      effect: 'No Event.',
    },
    {
      roll: 7,
      name: 'The Smell of Incense',
      lore:
        'Offerings to a disturbing idol and quiet chanting. These guys clearly know how to have a good time.',
      effect: 'No Event.',
    },
    {
      roll: 8,
      name: 'The Smell of Incense',
      lore:
        'Offerings to a disturbing idol and quiet chanting. These guys clearly know how to have a good time.',
      effect: 'No Event.',
    },
    {
      roll: 9,
      name: 'Blessing of the Temple',
      lore:
        'Recognizing your worth as a Hero, the priests of the Temple bless your journey.',
      effect:
        "You may immediately gain the Blessing of this Temple's Idol for free (listed in the section for that Idol).",
    },
    {
      roll: 10,
      name: "The Idol's Glory",
      lore:
        "The Temple's Idol is not just a thing to be feared, but a reason for hope in this desolate place.",
      effect:
        "Use the number 10 Location Event unique to the Temple's Idol (listed in the section for that Idol).",
    },
    {
      roll: 11,
      name: 'An Offering to the Gods',
      lore:
        'Alone at the foot of the Idol, you feel strangely compelled to believe in its power, even if for but a moment.',
      effect:
        'You may discard a Scrap, Tech, Dark Stone, or Side Bag Token. If you do, Recover Grit up to your Max Grit.',
    },
    {
      roll: 12,
      name: '"Our Savior!"',
      lore:
        'The prophecy tells of one who would come from far beyond the stars, to lead the people here to freedom! The faithful of this Temple\'s Idol believe that \'savior\' is you!',
      effect:
        'Gain D3 Scrap Tokens, D3 Tech Tokens, and draw an Artifact as aid in your quest. From now on (until you have 8 Corruption or 3 Mutations all at the same time, casting doubt on your purity) any time you visit a Barter Town Temple with the same Idol as this one, you gain this bonus again (limit once per Town Stay).',
    },
  ],
};
