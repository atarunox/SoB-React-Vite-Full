const skillTree_FrontierDoc = [
  [
    {
      name: "Patch 'Em Up",
      description: "Once per turn, Heal an adjacent Hero for D6 Wounds. Does not cost an Action.",
      bonus: "+1 Cunning"
    },
    {
      name: "Steady Hands",
      description: "+1 Agility. Field Surgery now succeeds on 3+ instead of 4+.",
      bonus: "+1 Agility"
    },
    {
      name: "Medical Knowledge",
      description: "+1 Lore. When rolling on the Injury Chart, you may add or subtract 1 from the result.",
      bonus: "+1 Lore"
    },
    {
      name: "Combat Medic",
      description: "+1 Initiative. At the start of each Fight, each Hero in your Posse Heals 1 Wound."
    }
  ],
  [
    {
      name: "Triage",
      description: "Once per Fight, spend 1 Grit to Heal all adjacent Heroes for D3 Wounds each.",
      bonus: "+1 Grit"
    },
    {
      name: "Anatomical Expertise",
      description: "+1 Damage with Melee Attacks. Critical Hits with Melee weapons cause Bleeding.",
      bonus: "+1 Combat"
    },
    {
      name: "Antidote",
      description: "Once per Adventure, remove a Poison, Disease, or Parasite condition from any Hero in your Posse."
    },
    {
      name: "Researcher",
      description: "+50 XP the first time you encounter each new Enemy Type. Draw an extra Scavenge card when Scavenging.",
      bonus: "+1 Lore"
    }
  ],
  [
    {
      name: "Miracle Worker",
      description: "Field Surgery now automatically succeeds (no roll needed). May perform Surgery once per Town Stay for free.",
      bonus: "+1 Grit"
    },
    {
      name: "Dark Stone Inoculation",
      description: "+2 Max Corruption. Once per Adventure, remove 1 Corruption from an adjacent Hero."
    },
    {
      name: "Battlefield Surgeon",
      description: "Once per Fight, when a Hero in your Posse would be KO'd, spend 2 Grit to instead set them to 1 Health.",
      bonus: "+1 Spirit"
    },
    {
      name: "Specimen Collector",
      description: "Gain D6 x $25 Gold for each unique Enemy Type defeated during an Adventure. +1 Cunning.",
      bonus: "+1 Cunning"
    }
  ],
  [
    {
      name: "Master Surgeon",
      description: "Surgery in Town always succeeds and costs half price. Field Surgery may now remove Mutations as well as Injuries.",
      bonus: "+1 Grit"
    },
    {
      name: "Experimental Treatments",
      description: "Once per Adventure, grant an adjacent Hero +2 to any single Stat until end of Adventure. On a roll of 1, they also take D3 Corruption Hits."
    },
    {
      name: "Plague Doctor",
      description: "Immune to Disease and Parasite conditions. Adjacent Heroes gain +2 to resist Disease and Poison.",
      bonus: "+1 Health"
    },
    {
      name: "Renowned Physician",
      description: "All Heroes in your Posse start each Adventure with +2 Max Health. Surgery at Doc's Office is always +2 to the outcome roll.",
      bonus: "+1 Grit"
    }
  ]
];

export default skillTree_FrontierDoc;
