// src/data/townLocations/gamblingHallEntertainment.js
const gamblingHallEntertainment = {
  id: 'gamblingHallEntertainment',
  name: 'Entertainment',
  type: 'service',
  items: [],
  services: [
    {
      id: 'five_card_draw_poker',
      name: 'Five Card Draw Poker',
      price: 50,
      tags: ['Gambling', 'LimitThreePerVisit'],
      rules: {
        text:
          'Roll 5 dice to represent your hand. You may ante $50–$250 more as an Extra Bet, or fold. You may re-roll any number of your dice during a Cunning test (gaining Unwanted Attention on rerolls). After final hand, you may spend 1 Grit to add +$50–$250 (optional). Make a Cunning test to win based on your hand:',
        hands: [
          'Royal Flush (5 sequential numbers) – Cunning 3+',
          'Four of a Kind – Cunning 3+',
          'Full House – Cunning 4+',
          'Straight (4 sequential numbers) – Cunning 5+',
          'Three of a Kind – Cunning 6+',
          'Anything Else – Cunning 6+ at least two successes',
        ],
        reward:
          'If successful, gain D6 × $25 as well as double your Extra Bet. On fail, lose the Poker game and your bet.',
        limitPerVisit: 3,
        locationScopedCost: true,
      },
    },
    {
      id: 'brimstone_craps',
      name: 'Brimstone Craps',
      price: 100,
      tags: ['Gambling', 'LimitOncePerVisit'],
      rules: {
        text:
          'Make a Luck 5+ test. If successful, gain $100 for every 5+ rolled. On fail, you leave with nothing.',
        limitPerVisit: 1,
        locationScopedCost: true,
      },
    },
    {
      id: 'the_devils_wheel',
      name: "The Devil's Wheel",
      price: 25,
      tags: ['Gambling', 'LimitThreePerVisit', 'MiniGame'],
      rules: {
        text:
          "Play The Devil's Wheel mini-game (see rulebook). Reward table by total points (0–9 no reward; 10 $25; 11 $50; 12–13 $100; 14–17 $250; 18–20 $500; 21–30 $1000; 31–35 $2000; 36 $5000). Any time an Artifact is collected from The Devil's Wheel, it also triggers a jackpot giving D6 × $25 to each other Hero at the Gambling Hall.",
        limitPerVisit: 3,
        locationScopedCost: true,
      },
    },
  ],
};

export default gamblingHallEntertainment;
