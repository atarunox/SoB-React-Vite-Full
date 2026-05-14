// src/data/townLocations/smugglersDen.js
export default {
  id: 'smugglersDen',
  name: "Smuggler’s Den",
  type: 'Shop',
  description:
    "Shadowy den of thieves and black-market traders. Law Heroes may not visit the Smuggler’s Den.",

  events: [
    {
      roll: 2,
      name: 'He Arrived in Town Just Before You Did',
      lore: "A grizzled US Marshal that’s been hunting you for months has finally caught up.",
      effect:
        "If you are an Outlaw, this is it! Your Location Visit is over and you must play the Solo Town Adventure “High Noon Duel” or use 1 Grit to flee Town and become Wanted! If you are not an Outlaw, you must pay D6×$100 or flee Town and become Wanted!",
    },
    {
      roll: 3,
      name: "“It’s a Raid!”",
      lore: "Nobody move! U.S. Marshals! Marshals raid the Smuggler’s Den, having a small shootout with the outlaws and arresting those with warrants.",
      effect:
        "The Smuggler’s Den is closed for the rest of this Town Stay. In addition, any Hero at the Smuggler’s Den that is Wanted! must pass a Luck 6+ test to sneak out the back in the confusion. If failed, you are arrested and thrown in jail! Make a Cunning 3+ test to escape and flee Town (gain 20 XP but your Town Stay is over). If failed, you are hung at dawn… your Hero is killed (though your Hero Posse may play the Hanging High Town Adventure to rescue you).",
    },
    {
      roll: 4,
      name: "“What’chu Lookin’ at, Boy?”",
      lore: 'A large, nasty-looking thug turns his attention to you.',
      effect:
        "Lose 1 Grit as you stare down the thug. If you do not have a Grit, you quickly make your way to the door and your visit to the Smuggler’s Den is over.",
    },
    {
      roll: 5,
      name: "“What’chu Lookin’ at, Boy?”",
      lore: 'A large, nasty-looking thug turns his attention to you.',
      effect:
        "Lose 1 Grit as you stare down the thug. If you do not have a Grit, you quickly make your way to the door and your visit to the Smuggler’s Den is over.",
    },
    {
      roll: 6,
      name: 'Drunken Debauchery and Veiled Threats',
      lore: 'The scruffy, smelly, and downright vile scum that reside here barely notice your arrival amongst the revelry. Probably for the best.',
      effect: 'No Event.',
    },
    {
      roll: 7,
      name: 'Drunken Debauchery and Veiled Threats',
      lore: 'The scruffy, smelly, and downright vile scum that reside here barely notice your arrival amongst the revelry. Probably for the best.',
      effect: 'No Event.',
    },
    {
      roll: 8,
      name: 'Drunken Debauchery and Veiled Threats',
      lore: 'The scruffy, smelly, and downright vile scum that reside here barely notice your arrival amongst the revelry. Probably for the best.',
      effect: 'No Event.',
    },
    {
      roll: 9,
      name: 'A Big Haul',
      lore: "More illicit items have found their way into the Black Market this afternoon. I’m sure they just fell off the back of a wagon.",
      effect:
        'Roll for and draw an extra 2 Items for the Black Market Goods.',
    },
    {
      roll: 10,
      name: 'A Big Haul',
      lore: "More illicit items have found their way into the Black Market this afternoon. I’m sure they just fell off the back of a wagon.",
      effect:
        'Roll for and draw an extra 2 Items for the Black Market Goods.',
    },
    {
      roll: 11,
      name: 'Honor Among Thieves',
      lore: "Sometimes it’s good to be bad!",
      effect:
        'Gain D6×$25 and 10 XP. If you are an Outlaw, also Recover 1 Grit. If you are Wanted!, Recover Grit up to your Max Grit.',
    },
    {
      roll: 12,
      name: 'One Last Job',
      lore: "You are approached by a swarthy bandido with information on a train heist that could make you rich, but you have to act fast! This could be the big ticket, the one you’ve been waiting for!",
      effect:
        'If you accept the train heist job, your Town Stay is over. Make a Cunning 5+ test to plan out the heist. For every 5+ rolled, you are +2 Agility when robbing the train. Then make an Agility 6+ test to ride out and board the train (for this test, you are also +2 Agility if you have a Transport Item). For every 6+ rolled gain $500 and take 1 Corruption Hit. Once the train heist is complete, make a Luck 5+ test. If passed, you have gotten away without a hitch. If failed, the swarthy bandido sold you out — Lose half the $ you earned and you become Wanted!',
    },
  ],
};
