const bandidoUpgradeChart = [
  [
    {
      name: "Barrage",
      description: "Once per turn, use 1 Grit to gain +1 Shot with each Gun you fire this turn.",
    },
    {
      name: "Strong Arm",
      description: "You may double your Range for Throwing Explosives.",
      bonus: "+1 Strength"
    },
    {
      name: "Swingin' Fists",
      description: "Instead of a normal Melee Attack, use 1 Grit to do a 3 Combat Melee Attack to every adjacent Model."
    },
    {
      name: "Sinister Laugh",
      description: "Any time you kill an Enemy, roll a D6. On the roll of 5 or 6, Recover 1 Grit.",
      bonus: "+1 Grit"
    }
  ],
  [
    {
      name: "Steel Nerves",
      description: "Once per turn, you may Re-roll a single failed Willpower save.",
      bonus: "+1 Grit"
    },
    {
      name: "Destruction Artist",
      description: "Any Explosives you Throw Bounce 1 fewer time than whatever is rolled."
    },
    {
      name: "Charge",
      description: "At the start of your Activation, you may choose an Enemy that is not adjacent. You are +2 Damage on all Combat Hits to that Enemy this turn."
    },
    {
      name: "Twitch",
      description: "Once per Adventure, gain +4 Initiative until the end of the turn.",
      bonus: "+1 Grit"
    }
  ],
  [
    {
      name: "Infamy",
      description: "Once per Town Stay, you may intimidate a local shopkeeper to pay D6×$25 less for a single Item/Service."
    },
    {
      name: "Dark Stone Dynamite",
      description: "Once per turn, Use 1 Dark Stone when Throwing a Dynamite Token to add +2 Damage to each model Hit."
    },
    {
      name: "Rage",
      description: "Once per turn, use 3 Grit to gain +4 Combat for one Attack.",
      bonus: "+1 Grit"
    },
    {
      name: "Lovable Scoundrel",
      description: "You gain double the XP listed on all Loot and Scavenge cards.",
      bonus: "+1 Spirit"
    }
  ],
  [
    {
      name: "Accuracy",
      description: "Ranged To Hit 4+"
    },
    {
      name: "Chew on This!",
      description: "Once per Fight, when you get a Critical Hit on a Melee Attack, you may discard a Dynamite Token to add 2D6 Damage to the Hit."
    },
    {
      name: "Deadly",
      description: "Your Melee Attacks get Critical Hits on rolls of 5 or 6 now."
    },
    {
      name: "Won't Stay Dead",
      description: "At the start of each turn, Heal 1 Wound on the D6 roll of 4+. If KO'd, instead you may Recover on the D6 roll of 4+ (you must still roll for Injury/Madness)."
    }
  ]
];

export default bandidoUpgradeChart;
