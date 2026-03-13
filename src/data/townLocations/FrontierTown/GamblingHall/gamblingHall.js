// Frontier Town - Gambling Hall (Location Events only)

const gamblingHall = {
  id: 'gambling_hall',
  name: 'Gambling Hall',
  type: 'Shop',
  description: 'A noisy den of cards, dice, whiskey, and fancy clothing.',

  events: [
    {
      roll: 2,
      name: 'Assassination Attempt',
      lore:
        'A rival has caught up to you and takes a shot while your back is turned.',
      effect:
        'Make a Cunning 5+ test to see it coming or a Lore 6+ test to dodge the fatal blow. If failed, roll once on the Injury Chart with only a single D6 (instead of the normal 2D6).',
    },
    {
      roll: 3,
      name: '"I Say You\'re Cheatin\' Me!"',
      lore:
        'The angry bandido sitting across from you throws back his chair and draws his pistol.',
      effect:
        'Make a Luck 4+ test to escape (ending your Location Visit and taking an extra Unwanted Attention marker), or try to get the jump on him by drawing your own weapon - roll a D6. If the roll is less than your Initiative (6 always fails), you drop him and collect your winnings of D6 x $50. If you fail at either option, he shoots you - roll once on the Injury Chart.',
    },
    {
      roll: 4,
      name: '"Sorry Mister"',
      lore: 'A drunken patron bumps into you as they stumble toward the door. Patting your pocket as you turn around, you realize that something is missing!',
      effect:
        'You must lose $200, 2 Dark Stone, or 1 Gear or Artifact.',
    },
    {
      roll: 5,
      name: '"Sorry Mister"',
      lore: 'A drunken patron bumps into you as they stumble toward the door. Patting your pocket as you turn around, you realize that something is missing!',
      effect:
        'You must lose $200, 2 Dark Stone, or 1 Gear or Artifact.',
    },
    {
      roll: 6,
      name: 'Laughter, Cheers, and Sadness',
      lore:
        'Smoke fills the air and the cheering thrill of winners roars through the hall, while the empty despair of the drunk and down on their luck lingers in the shadows.',
      effect: 'No Event.',
    },
    {
      roll: 7,
      name: 'Laughter, Cheers, and Sadness',
      lore:
        'Smoke fills the air and the cheering thrill of winners roars through the hall, while the empty despair of the drunk and down on their luck lingers in the shadows.',
      effect: 'No Event.',
    },
    {
      roll: 8,
      name: 'Laughter, Cheers, and Sadness',
      lore:
        'Smoke fills the air and the cheering thrill of winners roars through the hall, while the empty despair of the drunk and down on their luck lingers in the shadows.',
      effect: 'No Event.',
    },
    {
      roll: 9,
      name: "Everyone's a Winner",
      lore: "The Devil's Wheel strikes a jackpot and everyone cheers!",
      effect:
        'Every Hero at the Gambling Hall immediately gains D6 x $25.',
    },
    {
      roll: 10,
      name: "Everyone's a Winner",
      lore: "The Devil's Wheel strikes a jackpot and everyone cheers!",
      effect:
        'Every Hero at the Gambling Hall immediately gains D6 x $25.',
    },
    {
      roll: 11,
      name: 'Drinks and Cigars All Around',
      lore: 'A high roller spreads the wealth!',
      effect:
        'Every Hero at the Gambling Hall may immediately gain 1 Whiskey Token and 1 Fine Cigar Token for free.',
    },
    {
      roll: 12,
      name: 'High Stakes Bet',
      lore:
        'The gambler sitting across from you places his most prized possession on the table to cover his bet!',
      effect:
        'If you play Five Card Draw Poker during this Location Visit and win during the first game, you may also draw a World card and then an Artifact card from that World as an extra reward.',
    },
  ],
};

export default gamblingHall;
