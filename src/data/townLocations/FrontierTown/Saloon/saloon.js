// src/data/townLocations/saloon.js
export default {
  id: 'saloon',
  name: 'Saloon',
  type: 'Shop',
  description:
    'Rowdy watering hole full of booze, music, brawls, and rumors from all over the frontier.',

  events: [
    {
      roll: 2,
      name: 'Assassination Attempt',
      effect:
        'Make a Spirit 5+ OR Luck 6+ test. Fail: roll once on the Injury chart, using only 1D6 instead of the normal 2D6.',
      lore:
        'A rival takes a shot at you from behind while you’re enjoying your drink.',
    },
    {
      roll: 3,
      name: '“You a’ Cheatin’ Us?!”',
      effect:
        'Make a Cunning 6+ test to talk your way out OR an Agility 4+ test to escape. Fail: the mob beats you down; roll once on the Injury chart.',
      lore:
        'Accused of cheating at cards, you suddenly have a very angry crowd closing in.',
    },
    {
      roll: 4,
      name: 'Spilled Drink',
      effect:
        'Choose: leave Town at the end of the day, or buy drinks for the offended patron and his friends, paying D6×$25.',
      lore:
        'A drunk spills his drink on you and insists on a duel at sunrise unless you smooth things over.',
    },
    {
      roll: 5,
      name: 'Bar Fight',
      effect:
        'Make a Strength 5+ test or take D6 Wounds from the brawl (these carry over into the next Adventure).',
      lore:
        'Chairs, bottles, and fists fly as a full-on bar fight erupts around you.',
    },
    {
      roll: 6,
      name: 'Dark Tidings',
      effect:
        'Start your next Adventure with 1 less Grit than normal (to a minimum of 0).',
      lore:
        'A gloomy stranger speaks of swarms of HellBats on the road ahead, sapping your resolve.',
    },
    {
      roll: 7,
      name: 'A Good Time',
      effect: 'Pay $10 and Recover 1 Grit for use while in Town.',
      lore:
        'A round of drinks and good company does wonders for your nerves.',
    },
    {
      roll: 8,
      name: 'A Tall Tale',
      effect:
        'Make a Lore 5+ test; gain 10 XP for each 5+ rolled as you soak up tales of adventure.',
      lore:
        'A grizzled storyteller spins yarns of heroism and horror late into the night.',
    },
    {
      roll: 9,
      name: 'Aces and Eights',
      effect:
        'For the rest of this Location Visit, you gain +2 Luck and +2 Cunning.',
      lore:
        'Tonight the cards just seem to fall your way, and your mind is razor sharp.',
    },
    {
      roll: 10,
      name: 'Song and Dance',
      effect:
        'Make a Luck 5+ test. Pass: Heal D3 Health. Fail: you are knocked out and robbed; lose D6×$25 and your visit to the Saloon ends immediately.',
      lore:
        'A saloon girl leads you upstairs for some “company”; whether you wake up refreshed or fleeced is another matter.',
    },
    {
      roll: 11,
      name: 'A Catchy Tune',
      effect:
        'Start your next Adventure with Max Grit (as if fully restored at the start).',
      lore:
        'A piano tune digs into your brain, leaving you oddly energized and ready for anything.',
    },
    {
      roll: 12,
      name: 'Hero of the People',
      effect:
        'For the rest of this Location Visit, all your Gambling winnings are doubled. Also gain 2 Whiskey Tokens.',
      lore:
        'The locals recognize your deeds and celebrate you with free drinks and cheers.',
    },
  ],
};
