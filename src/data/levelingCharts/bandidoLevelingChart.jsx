const bandidoLevelingChart = [
  { label: "Vendetta – Choose an Enemy Type. +10 XP from it." },
  { label: "+1 Combat", statMod: { stat: "combat", amount: 1 } },
  { label: "+1 Initiative", statMod: { stat: "Initiative", amount: 1 } },
  {
    label: "+1 Strength. +D6 Health/Sanity",
    statMod: { stat: "Strength", amount: 1 },
    onRoll: (hero, setHero) => {
      const roll = Math.floor(Math.random() * 6) + 1;
      const updated = {
        ...hero,
        maxHealth: (hero.maxHealth || hero.health || 0) + roll,
        maxSanity: (hero.maxSanity || hero.sanity || 0) + roll,
      };
      alert(`Rolled ${roll}: +${roll} Health and +${roll} Sanity`);
      setHero(updated);
    },
  },
  {
    label: "+1 Cunning or +1 Agility. +D6 Health",
    // You could offer a prompt or toggle for which stat to increase
    statMod: { stat: "Cunning", amount: 1 },
    onRoll: (hero, setHero) => {
      const roll = Math.floor(Math.random() * 6) + 1;
      const updated = {
        ...hero,
        maxHealth: (hero.maxHealth || hero.health || 0) + roll,
      };
      alert(`Rolled ${roll}: +${roll} Health`);
      setHero(updated);
    },
  },
  {
    label: "+D6 Health and +3 Sanity",
    onRoll: (hero, setHero) => {
      const roll = Math.floor(Math.random() * 6) + 1;
      const updated = {
        ...hero,
        maxHealth: (hero.maxHealth || hero.health || 0) + roll,
        maxSanity: (hero.maxSanity || hero.sanity || 0) + 3,
      };
      alert(`Rolled ${roll}: +${roll} Health and +3 Sanity`);
      setHero(updated);
    },
  },
  {
    label: "+1 Lore or +1 Luck. +D6 Sanity",
    statMod: { stat: "Lore", amount: 1 },
    onRoll: (hero, setHero) => {
      const roll = Math.floor(Math.random() * 6) + 1;
      const updated = {
        ...hero,
        maxSanity: (hero.maxSanity || hero.sanity || 0) + roll,
      };
      alert(`Rolled ${roll}: +${roll} Sanity`);
      setHero(updated);
    },
  },
  { label: "+2 Side Bag Token Capacity" },
  { label: "+1 Initiative", statMod: { stat: "Initiative", amount: 1 } },
  { label: "+1 Combat", statMod: { stat: "combat", amount: 1 } },
  {
    label: "Cunnin' Plan – Steal +$50 per 5+ when Holding Up the Bank"
  }
];

export default bandidoLevelingChart;
