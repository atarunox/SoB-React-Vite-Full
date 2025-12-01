// src/data/townLocations/indianTradingPost.js
export default {
  id: 'indian_trading_post',
  name: 'Indian Trading Post',
  type: 'Shop',
  description:
    'Frontier trading post run by the local tribe, offering Spirit Cleansing, Vision Quests, and rare goods.',

  events: [
    {
      roll: 2,
      name: 'Spirits Running Amok',
      effect:
        'A ritual goes wrong and angry spirits sweep through town. Move Darkness D3 steps forward on the Town Event Track and every Hero in Town takes 2D6 Hits.',
      lore:
        'A tribal ceremony erupts in chaos as vengeful spirits pour out of the Trading Post and lash out at everyone nearby.',
    },
    {
      roll: 3,
      name: 'Possessed Shaman',
      effect:
        'Spirit Cleansing and Vision Quests are unavailable today. Any Hero here with Lore 3+ may make a Lore 6+ test: if passed, Recover 1 Grit and gain 25 XP for each 6+ rolled; for each 1 rolled, take D6 Horror Hits.',
      lore:
        'A shaman is possessed by a powerful demon; only the wisest heroes can help drive it out.',
    },
    {
      roll: 4,
      name: 'Unfriendly Welcome',
      effect:
        'All prices here are +$50 for any Hero that does NOT have the Tribal keyword (including things that are normally free).',
      lore:
        'Tension with the local Cavalry has the tribe on edge, and strangers are met with suspicion and higher prices.',
    },
    {
      roll: 5,
      name: 'Unfriendly Welcome',
      effect:
        'All prices here are +$50 for any Hero that does NOT have the Tribal keyword (including things that are normally free).',
      lore:
        'Tension with the local Cavalry has the tribe on edge, and strangers are met with suspicion and higher prices.',
    },
    {
      roll: 6,
      name: 'Drumming, Dancing, and a Bonfire',
      effect: 'No Event.',
      lore:
        'The night is filled with drums, chanting, and firelight; it’s a good time for everyone.',
    },
    {
      roll: 7,
      name: 'Drumming, Dancing, and a Bonfire',
      effect: 'No Event.',
      lore:
        'The night is filled with drums, chanting, and firelight; it’s a good time for everyone.',
    },
    {
      roll: 8,
      name: 'Drumming, Dancing, and a Bonfire',
      effect: 'No Event.',
      lore:
        'The night is filled with drums, chanting, and firelight; it’s a good time for everyone.',
    },
    {
      roll: 9,
      name: 'Trade Opportunities',
      effect:
        'Heroes here may sell Gear and Artifact cards for an extra D6×$25 each and may also sell Dark Stone for $100 per shard for the rest of the day.',
      lore:
        'The tribe is gearing up for war and is paying top dollar for useful gear and Dark Stone.',
    },
    {
      roll: 10,
      name: 'Trade Opportunities',
      effect:
        'Heroes here may sell Gear and Artifact cards for an extra D6×$25 each and may also sell Dark Stone for $100 per shard for the rest of the day.',
      lore:
        'The tribe is gearing up for war and is paying top dollar for useful gear and Dark Stone.',
    },
    {
      roll: 11,
      name: 'Animal Messenger',
      effect:
        'During your next Adventure, you gain Spirit Armor 5+. The first time you are KO’d, you do not roll for Injury or Madness.',
      lore:
        'An owl watches you with knowing eyes, and you feel the spirits guiding and protecting your path.',
    },
    {
      roll: 12,
      name: 'One With the Spirits',
      effect:
        'You may gain the Tribal keyword. If you already have Tribal, make a Spirit 4+ test and gain +1 Sanity for each 4+ rolled.',
      lore:
        'For your deeds, you are offered full acceptance into the tribe, or further spiritual insight if you already belong.',
    },
  ],
};
