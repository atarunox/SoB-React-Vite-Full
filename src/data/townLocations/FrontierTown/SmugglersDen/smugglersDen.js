// src/data/townLocations/smugglersDen.js
export default {
  id: 'smugglersDen',
  name: 'Smuggler’s Den',
  type: 'Shop',
  description:
    'Shadowy den of thieves and black-market traders. Law Heroes may not visit the Smuggler’s Den.',

  events: [
    {
      roll: 2,
      name: 'He Arrived in Town Just Before You Did',
      effect:
        'If you are an Outlaw: your Location Visit ends; either play the “High Noon Duel” Solo Town Adventure or spend 1 Grit to flee Town and become Wanted. If you are not an Outlaw: either pay D6×$100 or flee Town and become Wanted.',
      lore:
        'A relentless US Marshal finally catches up to you just as you step through the door.',
    },
    {
      roll: 3,
      name: '“It’s a Raid!”',
      effect:
        'The Smuggler’s Den is closed for the rest of this Town Stay. Any Wanted Hero here must make a Luck 6+ test to slip away. Fail: you are arrested and thrown in jail. Make a Cunning 3+ test to escape and flee Town (Town Stay over, gain 20 XP); if that fails, your Hero is hanged (though the Hanging High Town Adventure may save you).',
      lore:
        'US Marshals burst in, guns drawn, shouting for everyone to get their hands up.',
    },
    {
      roll: 4,
      name: '“What’chu Lookin’ at, Boy?”',
      effect:
        'Lose 1 Grit as you stare down a huge thug. If you have no Grit, your visit ends as you quietly back out.',
      lore:
        'A mountain of a man gives you a hard look, daring you to make a move.',
    },
    {
      roll: 5,
      name: '“What’chu Lookin’ at, Boy?”',
      effect:
        'Lose 1 Grit as you stare down a huge thug. If you have no Grit, your visit ends as you quietly back out.',
      lore:
        'A mountain of a man gives you a hard look, daring you to make a move.',
    },
    {
      roll: 6,
      name: 'Drunken Debauchery and Veiled Threats',
      effect: 'No Event.',
      lore:
        'The crowd is too drunk and mean-spirited to notice you over the general chaos.',
    },
    {
      roll: 7,
      name: 'Drunken Debauchery and Veiled Threats',
      effect: 'No Event.',
      lore:
        'The crowd is too drunk and mean-spirited to notice you over the general chaos.',
    },
    {
      roll: 8,
      name: 'Drunken Debauchery and Veiled Threats',
      effect: 'No Event.',
      lore:
        'The crowd is too drunk and mean-spirited to notice you over the general chaos.',
    },
    {
      roll: 9,
      name: 'A Big Haul',
      effect:
        'Add 2 extra items to the Black Market Goods available this Town Stay.',
      lore:
        'A wagon “accidentally” loses a shipment, and the goods quickly find their way inside.',
    },
    {
      roll: 10,
      name: 'A Big Haul',
      effect:
        'Add 2 extra items to the Black Market Goods available this Town Stay.',
      lore:
        'A wagon “accidentally” loses a shipment, and the goods quickly find their way inside.',
    },
    {
      roll: 11,
      name: 'Honor Among Thieves',
      effect:
        'Gain D6×$25 and 10 XP. If you are an Outlaw, also Recover 1 Grit.',
      lore:
        'Sometimes being part of the criminal fraternity pays off; tonight is one of those times.',
    },
    {
      roll: 12,
      name: 'One Last Job',
      effect:
        'If you accept the job, your Town Stay ends. Make a Cunning 5+ test; for each 5+ you gain +2 Agility for the train robbery. Then make an Agility 6+ test (with +2 if you have a Transport item); for each 6+, gain $500 and take 1 Corruption Hit. Finally, make a Luck 5+ test: pass and keep all your loot; fail and lose half your earnings and become Wanted.',
      lore:
        'A bandido offers you one big train heist that could set you up for life… or end it.',
    },
  ],
};
