export default {
  id: 'saloonGear',
  name: 'Gear & Trinkets',
  type: 'GearShop',
  items: [
    {
      id: 'gamblersDeck',
      name: "Gambler's Deck of Cards",
      cost: 850,
      slot: 'Charm',
      effects: ['+1 Cunning'],
      effect: `Once per Adventure, cancel & redraw a Darkness card`,
      limit: 'Limit 1'
    },
    {
      id: 'luckyDice',
      name: "Lucky Dice",
      cost: 1000,
      slot: 'Charm',
      effects: ['+1 Luck'],
      effect: `Once per Adventure add +1 to any die`,
      limit: 'Limit 1'
    },
    {
      id: 'darkStoneShiv',
      name: 'Dark Stone Shiv',
      cost: '1 Dark Stone',
      slot: 'Hand Weapon',
      category: 'Gear•Dark Stone',
      effect: `Free Attack: discard to do D6 Wounds ignoring Defense`,
    },
    {
      id: 'bonedCorset',
      name: 'Boned Corset',
      cost: 1200,
      slot: 'Torso',
      effects: ['Armor 6+'],
    },
    {
      id: 'darkStoneCorset',
      name: 'Dark Stone Corset',
      cost: '3200 + 8 Dark Stone',
      slot: 'Torso',
      effects: ['Armor 5+','+1 Max Grit'],
    },
    {
      id: 'tinyHat',
      name: 'Tiny Hat',
      cost: 2450,
      slot: 'Hat',
      effect: `Once per Adventure remove 1 Corruption point`,
    },
  ]
};
