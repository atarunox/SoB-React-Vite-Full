// AUTO-GENERATED scaffold for WORLD_CARDS used by WorldDrawer.
// Replace with your real world deck data when ready.

export const WORLD_CARDS = [
  {
    id: 'world_mines',
    name: 'Mines',
    worldType: 'Western',
    weather: null,
    effect: 'Use standard Mine Encounters and Loot.',
    lootNote: 'Standard Loot deck.',
  },
  {
    id: 'world_blasted_wastes',
    name: 'Blasted Wastes',
    worldType: 'Western (OtherWorld)',
    weather: 'Toxic Gusts',
    effect: 'Use Blasted Wastes Encounters, Threats, and Travel Hazards.',
    lootNote: 'Use Wasteland Loot for Blasted Wastes and Canyon.',
  },
  {
    id: 'world_jargono',
    name: 'Jargono',
    worldType: 'OtherWorld',
    weather: 'Humid',
    effect: 'Use Jargono Depth Events and Threats.',
    lootNote: 'Standard Loot deck.',
  },
];

export default WORLD_CARDS;


// Optional campaign grouping; expand as needed.
export const WORLD_CARDS_BY_CAMPAIGN = {
  Default: WORLD_CARDS,
};
