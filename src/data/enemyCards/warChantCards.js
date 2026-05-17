// Black Fang War Chant deck.
// Drawn by the Black Fang Shaman during combat (one per activation, or at Mastery level = two).
// Cards that say "Consumes 1 Dark Stone from the Pool" require a Dark Stone pool token on the table.
// The DM resolves these effects immediately when drawn.

export const BLACK_FANG_WAR_CHANT = [
  {
    name: "The Hunter's Call",
    tags: ['Chant', 'Magik', 'Attack'],
    effect: 'Immediately add D3-1 Black Fang Tribe to the Fight, in Ambush.\n\nFor every model that can\'t be added, move the Darkness 1 space forward on the Depth Track instead.',
    consumesDarkStone: false,
  },
  {
    name: 'Blood Rain',
    tags: ['Chant', 'Magik', 'Blood', 'Weather'],
    effect: 'Select a Random Hero. That Hero, and every other Hero within 2 spaces of him, immediately takes 2D6 Horror Hits and are −1 on all of their To Hit rolls during their next Activation (To Hit rolls of 6+ still count as Critical Hits).',
    consumesDarkStone: false,
  },
  {
    name: 'Void Frenzy',
    tags: ['Chant', 'Magik', 'Void', 'Boost'],
    effect: 'All Black Fang Tribe are +1 Combat this turn, and their Melee Attacks are +1 Damage for each Dark Stone in the Pool at the start of their Attack (max +5).',
    consumesDarkStone: true,
  },
  {
    name: 'Celestial Lore',
    tags: ['Chant', 'Magik', 'Void'],
    effect: 'Every Hero must make a Lore 5+ test.\n\nIf successful, gain 25 XP.\n\nFor every die rolled that did not get a 5+, the Hero takes 3 Wounds (or Promo Wounds if Brutal), ignoring Defense.',
    consumesDarkStone: true,
  },
  {
    name: 'Dream Storm',
    tags: ['Chant', 'Magik', 'Insanity'],
    effect: 'Every Hero immediately takes D6 Horror Hits.\n\nThese Horror Hits each do Damage equal to the Hero\'s Spirit.',
    consumesDarkStone: false,
  },
  {
    name: "Push'Qua's Wrath",
    tags: ['Chant', 'Magik'],
    effect: 'Until the end of the turn, all Enemies are +3 Combat.',
    consumesDarkStone: true,
  },
];

export default BLACK_FANG_WAR_CHANT;
