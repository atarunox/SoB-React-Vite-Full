const bandidaLevelingChart = [
  { label: "Vendetta – Choose an Enemy Type. +10 XP from it." },
  { label: "+1 Combat" },
  { label: "+1 Initiative" },
  {
    label: "+1 Strength. +D6 Health/Sanity",
    onRoll: (hero, setHero) => {
      const roll = Math.floor(Math.random() * 6) + 1;
      const updated = {
        ...hero,
        maxHealth: (hero.maxHealth || hero.health || 0) + roll,
        maxSanity: (hero.maxSanity || hero.sanity || 0) + roll
      };
      alert(`Rolled a ${roll}: +${roll} Health and +${roll} Sanity applied.`);
      setHero(updated);
    }
  },
  {
    label: "+1 Cunning or +1 Agility. +D6 Health",
    onRoll: (hero, setHero) => {
      const roll = Math.floor(Math.random() * 6) + 1;
      const updated = {
        ...hero,
        maxHealth: (hero.maxHealth || hero.health || 0) + roll
      };
      alert(`Rolled a ${roll}: +${roll} Health applied.`);
      setHero(updated);
    }
  },
  {
    label: "+D6 Health and +3 Sanity",
    onRoll: (hero, setHero) => {
      const roll = Math.floor(Math.random() * 6) + 1;
      const updated = {
        ...hero,
        maxHealth: (hero.maxHealth || hero.health || 0) + roll,
        maxSanity: (hero.maxSanity || hero.sanity || 0) + 3
      };
      alert(`Rolled a ${roll}: +${roll} Health and +3 Sanity applied.`);
      setHero(updated);
    }
  },
  {
    label: "+1 Lore or +1 Luck. +D6 Sanity",
    onRoll: (hero, setHero) => {
      const roll = Math.floor(Math.random() * 6) + 1;
      const updated = {
        ...hero,
        maxSanity: (hero.maxSanity || hero.sanity || 0) + roll
      };
      alert(`Rolled a ${roll}: +${roll} Sanity applied.`);
      setHero(updated);
    }
  },
  { label: "+2 Side Bag Token Capacity" },
  { label: "+1 Initiative" },
  { label: "+1 Combat" },
  {
    label: "Cunnin' Plan – Steal +$50 per 5+ when Holding Up the Bank"
  }
];

export default bandidaLevelingChart;
