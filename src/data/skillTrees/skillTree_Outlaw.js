const outlawUpgradeChart = [
  [
    {
      name: "Guns Blazing",
      description: "When firing an Outlaw Pistol, you may treat any 6s rolled To Hit as 2 Hits each (instead of a Critical Hit)."
    },
    {
      name: "Renown",
      description: "You may start each Adventure and Traveling with 1 extra Grit.",
      bonus: "+1 Agility"
    },
    {
      name: "Charisma",
      description: "At the end of each turn, you may Heal D3 Sanity from one adjacent Hero.",
      bonus: "+2 Health"
    },
    {
      name: "Duck and Dive",
      description: "When you roll doubles on your 2 dice for Shadow Move, you may automatically Escape this turn and may add the two results together instead of choosing which to use.",
      bonus: "+1 Grit"
    }
  ],
  [
    {
      name: "Gunfighter",
      description: "Once per turn, you may Re-roll one of your To Hit rolls for each Outlaw Pistol you are firing.",
      bonus: "+1 Grit"
    },
    {
      name: "Dark Stone Bandit",
      description: "When Holding up the Outpost Bank in Town, for any 5+ rolled, you may instead steal D3 Dark Stone.",
      bonus: "+1 Cunning"
    },
    {
      name: "Wink",
      description: "Once per Fight, you may take 1 Corruption Hit and gain 10 XP to give another Hero +3 Initiative until the end of the turn.",
      bonus: "+1 Luck"
    },
    {
      name: '"Patch me up Doc!"',
      description: "Once per Town visit, while at the Doc’s Office, use 1 Grit to get a Surgery for free.",
      bonus: "+1 Grit"
    }
  ],
  [
    {
      name: "Wild at Heart",
      description: "You are no longer limited to 'never Re-rolling the same die twice' for your Ranged To Hit rolls.",
      bonus: "+3 Health"
    },
    {
      name: "Personal Touch",
      description: "Your Outlaw Pistols are now considered to have one extra Upgrade Slot and no longer count as an 'X'.",
      bonus: "+1 Luck"
    },
    {
      name: "Wisecrack",
      description: "Once per turn, use 1 Grit to Heal 2 Wounds from every Hero on your Map Tile (including yourself).",
      bonus: "+1 Grit"
    },
    {
      name: "Clean Getaway",
      description: "Once per turn, use 1 Grit to prevent a number of Wounds or Sanity damage you would take from a single source equal to your Luck."
    }
  ],
  [
    {
      name: '"Yee-Haww!"',
      description: "Your Hits with an Outlaw Pistol are Damage +1 (or Damage +2 against a target with Defense 4 or higher).",
      bonus: "+5 Health"
    },
    {
      name: "Dead or Alive",
      description: "Willpower 3+ and +10 Health"
    },
    {
      name: "Redemption",
      description: "Any time you are KO’d, you may Heal D6 Wounds/Sanity (any mix) from every other Hero. You may then immediately Recover on the D6 roll of 5+ (still roll for Injury/Madness)."
    },
    {
      name: "Most Wanted",
      description: "Unless KO’d, you may Heal 1 Wound at the start of each turn. When rolling for 'Wanted?' in Town, for each 6 rolled you get 25 XP but must pay $100 instead."
    }
  ]
];

export default outlawUpgradeChart;
