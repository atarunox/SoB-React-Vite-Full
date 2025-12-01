export const lootCards = [
  { id: 'LT-001', type: 'Gold', amount: () => 50 + Math.floor(Math.random()*50) },
  { id: 'LT-002', type: 'Gear', effect: 'Draw a Gear card (not included here).' },
  { id: 'LT-003', type: 'Dark Stone', amount: () => 1 + Math.floor(Math.random()*2) },
];
