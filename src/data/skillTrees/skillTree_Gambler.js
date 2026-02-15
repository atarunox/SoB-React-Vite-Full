const skillTree_Gambler = [
  [
    {
      name: "Lucky Streak",
      description: "+1 Luck. Once per Adventure, re-roll any single die result.",
      bonus: "+1 Luck"
    },
    {
      name: "Card Sharp",
      description: "+1 Cunning. When gambling in Town, you may re-roll one die.",
      bonus: "+1 Cunning"
    },
    {
      name: "Sleight of Hand",
      description: "+1 Agility. You may swap 1 Fortune Token for 1 Grit once per turn.",
      bonus: "+1 Agility"
    },
    {
      name: "Fast Talker",
      description: "Once per Adventure, convince an Enemy to skip its Activation. Costs 1 Fortune Token."
    }
  ],
  [
    {
      name: "All In",
      description: "Spend all your Fortune Tokens (min 1) to add that many dice to a single To Hit roll.",
      bonus: "+1 Grit"
    },
    {
      name: "Poker Face",
      description: "+1 Spirit. Immune to Fear effects from Enemies with fewer Health than you.",
      bonus: "+1 Spirit"
    },
    {
      name: "Loaded Dice",
      description: "Once per Fight, change one die you rolled to any face. Costs 2 Fortune Tokens."
    },
    {
      name: "Double Down",
      description: "When you roll doubles on a Skill Test, gain +2 to the result and recover 1 Fortune Token."
    }
  ],
  [
    {
      name: "Fortune Favors the Bold",
      description: "Start each Adventure with 2 extra Fortune Tokens. Max Fortune increased by 2.",
      bonus: "+1 Grit"
    },
    {
      name: "Ace Up the Sleeve",
      description: "Once per Adventure, after seeing the result of any roll, you may replace it with a 6."
    },
    {
      name: "High Stakes",
      description: "+1 Damage with all attacks. To Hit rolls of 1 cause you to take 1 Wound.",
      bonus: "+1 Combat"
    },
    {
      name: "Lucky Charm",
      description: "+2 Luck. Allies within 2 spaces gain +1 Luck.",
      bonus: "+2 Luck"
    }
  ],
  [
    {
      name: "House Always Wins",
      description: "Once per Fight, force an Enemy to re-roll all of its Attack dice. Costs 1 Grit.",
      bonus: "+1 Grit"
    },
    {
      name: "Jackpot",
      description: "When you roll three of a kind on any roll, gain D6 x $50 Gold and recover all Fortune Tokens."
    },
    {
      name: "Royal Flush",
      description: "Critical Hits do triple Damage instead of double. Fortune Tokens recover at the start of each Fight.",
      bonus: "+1 Grit"
    },
    {
      name: "Gambler's Ruin",
      description: "Spend 3 Fortune Tokens to automatically pass any single Skill Test. Once per Adventure, negate all Damage from one Attack."
    }
  ]
];

export default skillTree_Gambler;
