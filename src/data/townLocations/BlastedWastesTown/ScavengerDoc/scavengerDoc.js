// src/data/townLocations/BlastedWastesTown/ScavengerDoc/scavengerDoc.js

export default {
  id: 'scavengerDoc',
  name: 'Scavenger Doc',
  town: 'BlastedWastesTown',
  type: 'Shop',
  description:
    'A ramshackle alien medical hut run by a questionable scavenger doctor. Offers surgery, Xanthar Leech treatments, medical supplies, and scientific research.',

  events: [
    {
      roll: 2,
      name: 'Vile Experiments',
      lore:
        "Entering the Doc's hut, you find him hunched over a surgery table, working on unnatural experiments! Seeing that you've discovered him, he hits a button on a console and the door to the hut slams shut! Turning to face you, he picks up a vicious looking saw and attacks!",
      effect:
        'Make a Strength 6+ test to overpower the mad Doc and avoid becoming the subject of his next vile experiment! If passed, gain 25 XP. If failed, roll once on the Injury Table. Either way, the Scavenger Doc is closed and may not be visited for the remainder of the Town Stay.',
    },
    {
      roll: 3,
      name: 'No Understanding of Human Anatomy',
      lore:
        "The Scavenger Doc takes one look at you and scratches his alien head. Poking you in the belly and then in the thigh, it becomes clear that he has no idea where to even begin with your anatomy.",
      effect:
        'Heroes may NOT purchase any Surgery at the Scavenger Doc during this Town Stay.',
    },
    {
      roll: 4,
      name: 'Alien Virus',
      lore:
        "An alien virus has been spreading through the camp like wildfire. Bodies of the sick and the dead litter the streets, and the Doc's shack is overflowing.",
      effect:
        'Every Hero in Town must immediately make a Luck 5+ test to avoid getting sick. If failed, during the next Adventure you are -3 Health and -1 Max Grit.',
    },
    {
      roll: 5,
      name: 'Rusty Tools and Hungry Leeches',
      lore:
        "Dried gore is baked onto the floor here, and the Doc's assortment of tools and specimens seem filthy.",
      effect:
        'Any Surgery performed here today is -1 to the roll, and Xanthar Leech Treatments do Wounds on rolls of 1 or 2.',
    },
    {
      roll: 6,
      name: 'Screams of Pain and Suffering',
      lore:
        '"I\'m sure they\'ll be fine in the morning...Next!"',
      effect: 'No Event.',
    },
    {
      roll: 7,
      name: 'Screams of Pain and Suffering',
      lore:
        '"I\'m sure they\'ll be fine in the morning...Next!"',
      effect: 'No Event.',
    },
    {
      roll: 8,
      name: 'Screams of Pain and Suffering',
      lore:
        '"I\'m sure they\'ll be fine in the morning...Next!"',
      effect: 'No Event.',
    },
    {
      roll: 9,
      name: 'An Actual Doctor',
      lore:
        "It's a miracle! The Scavenger Doc actually has some amount of medical training.",
      effect:
        'Any Surgery performed here today is +1 to the roll.',
    },
    {
      roll: 10,
      name: 'Dying Patient',
      lore:
        'A dying alien patient lays on an old bed in a dark corner of the room. Motioning you over, he hacks and coughs telling you that he has failed in his mission. With his dying breath, he hands you something and says, "I can do no more. Take this... When the time is right, you\'ll know what to do..." And with that, he dies.',
      effect:
        'Draw a Mine Artifact card that he gives you as he dies.',
    },
    {
      roll: 11,
      name: 'Alien Technology',
      lore:
        'The Scavenger Doc has an alien device that mends bones and regenerates flesh.',
      effect:
        'You may choose any one Injury or Mutation you have to immediately Heal for free.',
    },
    {
      roll: 12,
      name: 'Research Library',
      lore:
        'The Scavenger Doc has an extensive library of ragged books, pads, and fungus samples.',
      effect:
        'You may immediately gain 1 Fungus Research or Alien Research marker, as though you had engaged in Scientific Research here.',
    },
  ],
};
