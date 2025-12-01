export default {
  id: 'frontierOutpost',
  name: 'Frontier Outpost',
  type: 'Shop',
  description:
    'Military checkpoint offering bounties, banking, trading, and services to defend the frontier against alien threats.',

  events: [
    // ------------------------ 2 ------------------------
    {
      roll: 2,
      name: 'Mad with Power',
      lore:
        'The lieutenant in command at the Outpost has been driven mad, twisted and mutated by the Dark Stone! He now wields his power with a tentacly iron fist and is deploying the soldiers under his command to bring “order” to the region.',
      effect:
        'Heroes may not Train with Soldiers at the Outpost for the rest of this Town Stay. At the start of each day in Town, each hero must make an Agility 5+ or Cunning 5+ test to out-maneuver or avoid the corrupt soldiers as they move around town (they don’t like yer kind here no more!). If passed, carry on with your Day in Town as normal. If failed, you must either leave Town immediately OR pay the soldiers to look the other way with D6×$50.'
    },

    // ------------------------ 3 ------------------------
    {
      roll: 3,
      name: 'Dark Stone Explosion',
      lore:
        'Too much Dark Stone in one place is never a good idea! The Outpost Bank explodes in a fiery cataclysm! A portal to an OtherWorld rips open and masses of mutated tentacles reach through, pulling in townspeople and supplies!',
      effect:
        'Make a Strength 5+ test to fight off the tentacles. If passed, gain 20 XP and you escape with your life! If failed, the tentacles wrap around your Dark Stone and pull it through the gate — lose D6 Dark Stone. Either way, the Frontier Outpost is destroyed and may no longer be visited for the rest of this Town Stay.'
    },

    // ------------------------ 4 ------------------------
    {
      roll: 4,
      name: 'Ambushed Caravan',
      lore:
        'Returning from a mission to chase off some demons, the local soldier regiment was viciously attacked on the road back to town.',
      effect:
        'Few survivors remain to protect the Town if the demons come back. All rolls on the Town Event and Camp Site Hazard chart are –1 for the rest of this Town Stay.'
    },

    // ------------------------ 5 ------------------------
    {
      roll: 5,
      name: 'Dark Stone Glut',
      lore:
        'The market for Dark Stone has fallen in recent days due to the roads being cut off by Black Fang raiders.',
      effect:
        'Dark Stone sold to the Outpost Bank is only worth D6×$10 per shard today.'
    },

    // ------------------------ 6 ------------------------
    {
      roll: 6,
      name: 'Hanging',
      lore:
        'One of the soldiers that tried to run off in the night was caught and is being hanged this afternoon for desertion.',
      effect:
        'With the kick of a stool and the snap of the rope, the man is left swinging as an example to others who would show cowardice. Shaken by the sight of his twitching feet, you lose 1 Grit.'
    },

    // ------------------------ 7 ------------------------
    {
      roll: 7,
      name: 'Trading Post',
      lore:
        'A local prospector has returned from the mines with a strange Artifact, and he’s willing to part with it for the right price.',
      effect:
        'Draw a World Card to determine where the prospector has been, then draw an Artifact from that world. The Artifact may be purchased for D6×$150.'
    },

    // ------------------------ 8 ------------------------
    {
      roll: 8,
      name: 'The Banners Yet Wave',
      lore:
        'Seeing the flags fly high in the wind atop the outpost walls fills your spirit with hope.',
      effect:
        'Recover 1 Grit and fully heal your Health and Sanity.'
    },

    // ------------------------ 9 ------------------------
    {
      roll: 9,
      name: 'Dark Stone Shortage',
      lore:
        'The Outpost Bank is willing to pay top dollar for Dark Stone today.',
      effect:
        'You may sell your Dark Stone shards for D6×$50 each today.'
    },

    // ------------------------ 10 ------------------------
    {
      roll: 10,
      name: 'The Sound of Bugles',
      lore:
        'Over the Outpost walls you can hear the bugles blare as the soldiers run training drills to be ready for the next HellBat attack.',
      effect:
        'Do not roll for a Town Event at the end of this day in Town.'
    },

    // ------------------------ 11 ------------------------
    {
      roll: 11,
      name: 'War Stories',
      lore:
        'Talking with some of the soldiers, you exchange stories of your time battling unspeakable creatures.',
      effect:
        'The next Adventure you play, you may re-roll a Damage roll of one of your Hits that should make for an even better story later.'
    },

    // ------------------------ 12 ------------------------
    {
      roll: 12,
      name: 'Deputized',
      lore:
        'Having heard of your deeds in the region, the local Lieutenant calls you into his tent and deputizes you!',
      effect:
        'Gain the Keyword Law. Note: if you currently have the Keyword Outlaw, you must choose to either replace it with Law OR keep Outlaw instead.'
    }
  ]
};
