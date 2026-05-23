// Challenge Pack #2
// Adds threat cards, darkness cards, encounter cards, and beast enemy traits.
// Duplicates are intentional — they match the physical card count.

// ── Threat Cards ──────────────────────────────────────────────────────────────
export const CP2_THREAT_CARDS = [
  { id: 'cp2_devouring_swarm_pp_1',   name: 'Devouring Swarm',        tier: 'low',  spawn: 'D3+1 Flesh Mites and {P}{P} Void Spiders',            effects: ['Swarm — These Enemies move through other models.'] },
  { id: 'cp2_devouring_swarm_pp_2',   name: 'Devouring Swarm',        tier: 'low',  spawn: 'D3+1 Flesh Mites and {P}{P} Void Spiders',            effects: ['Swarm — These Enemies move through other models.'] },
  { id: 'cp2_devouring_swarm_p6_1',   name: 'Devouring Swarm',        tier: 'low',  spawn: '{P} Flesh Mites and {P}+6 Void Spiders',              effects: ['Swarm — These Enemies move through other models.'] },
  { id: 'cp2_devouring_swarm_p6_2',   name: 'Devouring Swarm',        tier: 'low',  spawn: '{P} Flesh Mites and {P}+6 Void Spiders',              effects: ['Swarm — These Enemies move through other models.'] },
  { id: 'cp2_armored_pack_1',         name: 'Armored Hunting Pack',   tier: 'low',  spawn: 'D3 Slashers and 1 Sand Crab',                          effects: ['Pack Hunters — While there are any Sand Crabs on the board, all Slashers have Armor 5+.'] },
  { id: 'cp2_armored_pack_2',         name: 'Armored Hunting Pack',   tier: 'low',  spawn: '3 Slashers and D3 Sand Crabs',                         effects: ['Pack Hunters — While there are any Sand Crabs on the board, all Slashers have Armor 5+.'] },
  { id: 'cp2_void_tide_1',            name: 'Void Tide',              tier: 'low',  spawn: '{P}{P} Void Spiders, {P}{P} Void Swarms, and 1 Void Hive',   effects: ['Void Nest — Whenever a Void Hive rolls to spawn a Void Swarm, it makes an additional roll, spawning a Void Spider on a D6 roll of 5+.', 'Caustic Bile — Void Spiders may make Melee Attacks up to 2 spaces away.'] },
  { id: 'cp2_void_tide_2',            name: 'Void Tide',              tier: 'low',  spawn: '{P}+6 Void Spiders, {P}{P} Void Swarms, and 1 Void Hive',    effects: ['Void Nest — Whenever a Void Hive rolls to spawn a Void Swarm, it makes an additional roll, spawning a Void Spider on a D6 roll of 5+.', 'Caustic Bile — Void Spiders may make Melee Attacks up to 2 spaces away.'] },
  { id: 'cp2_bestial_eruption_1',     name: 'Bestial Eruption',       tier: 'low',  spawn: '1 Dark Stone Scorpion and 1 Sand Crab',                effects: ['Bursting From the Ground — This is an Ambush Attack.'] },
  { id: 'cp2_bestial_eruption_2',     name: 'Bestial Eruption',       tier: 'low',  spawn: '1 Dark Stone Scorpion and D3 Sand Crabs',              effects: ['Bursting From the Ground — This is an Ambush Attack.', 'If only 1 Sand Crab spawns, add 1 additional Dark Stone Scorpion to the Fight.'] },
  { id: 'cp2_devouring_swarm_high_1', name: 'Devouring Swarm',        tier: 'high', spawn: '6 Flesh Mites and 12 Void Spiders',                    effects: ['Swarm — These Enemies move through other models.'] },
  { id: 'cp2_devouring_swarm_high_2', name: 'Devouring Swarm',        tier: 'high', spawn: '6 Flesh Mites and 12 Void Spiders',                    effects: ['Swarm — These Enemies move through other models.'] },
  { id: 'cp2_armored_pack_high',      name: 'Armored Hunting Pack',   tier: 'high', spawn: '3 Slashers and 3 Sand Crabs',                          effects: ['Pack Hunters — While there are any Sand Crabs on the board, all Slashers have Armor 5+ and +2 Combat.'] },
  { id: 'cp2_void_tide_high',         name: 'Void Tide',              tier: 'high', spawn: '{P}+6 Void Spiders, {P}+6 Void Swarms, and D3 Void Hives', effects: ['Void Nest — Whenever a Void Hive rolls to spawn a Void Swarm, it makes an additional roll, spawning a Void Spider on a D6 roll of 5+.', 'Caustic Bile — Void Spiders may make Melee Attacks up to 2 spaces away.'] },
  { id: 'cp2_bestial_eruption_high',  name: 'Bestial Eruption',       tier: 'high', spawn: '2 Dark Stone Scorpions and 3 Sand Crabs',              effects: ['Bursting From the Ground — This is an Ambush Attack.'] },
  { id: 'cp2_devil_of_black_rock',    name: 'The Devil of Black Rock', tier: 'epic', spawn: 'The Devil of Black Rock (Legendary)',                   effects: ['Named Legendary enemy. Draw when indicated by a Threat card. See stat card for full rules.'] },
];

// ── Darkness Cards ────────────────────────────────────────────────────────────
export const CP2_DARKNESS_CARDS = [
  {
    id: 'cp2_infected_scratch_1',
    name: 'Infected Scratch',
    type: 'Darkness',
    tags: ['Infection', 'Injury'],
    effects: [
      'One Random Hero that currently has at least 1 Wound has been infected! That Hero takes this card as an Injury.',
      'Infection — Any time you take a Wound (after Defense, Armor, etc.) it counts as 2 Wounds. If KO\'d by Wounds, roll Injury using only a D8.',
      'Once applied, this may no longer be canceled as a Darkness card, but persists beyond this Adventure and must be healed as an Injury.',
    ],
  },
  {
    id: 'cp2_infected_scratch_2',
    name: 'Infected Scratch',
    type: 'Darkness',
    tags: ['Infection', 'Injury'],
    effects: [
      'One Random Hero that currently has at least 1 Wound has been infected! That Hero takes this card as an Injury.',
      'Infection — Any time you take a Wound (after Defense, Armor, etc.) it counts as 2 Wounds. If KO\'d by Wounds, roll Injury using only a D8.',
      'Once applied, this may no longer be canceled as a Darkness card, but persists beyond this Adventure and must be healed as an Injury.',
    ],
  },
  {
    id: 'cp2_endless_waves',
    name: 'Endless Waves',
    type: 'Darkness',
    tags: ['Horde'],
    remainsInPlay: true,
    effects: [
      'During the next Fight, whenever an XL or smaller Enemy is killed, roll a D6 (this roll may not be modified or Re-rolled). On a roll of 1 or 2, add a new Enemy of that type to the board using the same placement method as that Enemy Group.',
    ],
  },
  {
    id: 'cp2_unnatural_evolution',
    name: 'Unnatural Evolution',
    type: 'Darkness',
    tags: ['Horror'],
    remainsInPlay: true,
    effects: [
      'At the start of their Activation, every Hero takes 1 basic Hit for each Enemy adjacent to them (or 3 Hits for each Large size or bigger Enemy adjacent). These Hits do 2 Damage each.',
    ],
  },
];

// ── Encounter Cards ───────────────────────────────────────────────────────────
export const CP2_ENCOUNTER_CARDS = [
  {
    id: 'cp2_ominous_chitters',
    name: 'Ominous Chitters',
    tags: ['Encounter', 'Active', 'Dread'],
    flavor: 'A nightmarish chittering echoes through the darkness ahead. Stopping in your tracks, you listen intently to try and determine how far away the sound is. Before you can react, a much louder chitter responds; this one from the area you just left.',
    effects: [
      'Each Hero must choose one of their Skills to make a Skill 5+ test.',
      'Success: Gain 20 XP as you hold firm your resolve.',
      'Fail: Take 2D6 Horror Hits.',
      'For every 1 rolled during this test, take an extra D6 Horror Hits (even if the test is successful).',
    ],
  },
  {
    id: 'cp2_shredded_remains',
    name: 'Shredded Remains',
    tags: ['Encounter', 'Active', 'Blood'],
    flavor: "A mangled heap of torn clothes and shredded flesh rests here, filled with writhing void maggots. As you lean in close to inspect the remains, you recognize the etched silver flask clutched in one bony hand. There can be no mistake, this is the body of your old friend and partner.",
    test: { stat: 'Spirit', target: '6+', noGrit: true },
    effects: [
      'Spirit 6+ (No Grit).',
      'Success: You clench your jaw and swear vengeance. You are +1 Combat and +1 Shot for the rest of the Adventure.',
      'Fail: You are −1 on all of your Willpower rolls for the rest of the Adventure.',
    ],
  },
  {
    id: 'cp2_stalking_in_the_dark',
    name: 'Stalking in the Dark',
    tags: ['Encounter', 'Active', 'Dread'],
    flavor: "Something is out there, moving through the shadows. You can feel it watching. It's as though you are being stalked by an unseen evil in the dark. It's only a matter of time now, before it strikes.",
    test: { stat: 'Cunning', target: '6+' },
    effects: [
      'Cunning 6+.',
      'Success: Gain 25 XP as you keep an eye on the shadows in every room.',
      'For each Hero that failed this test, draw a Growing Dread card and add it to the stack.',
    ],
  },
  {
    id: 'cp2_splintered_bones',
    name: 'Splintered Bones',
    tags: ['Encounter', 'Environment', 'Dread'],
    flavor: 'Shards and splinters of broken bone cover the ground, each stripped of flesh and ravaged with tooth and mandible marks, gnawed on by a ravenous beast. Whatever devoured these poor souls, it was clearly brutal in its feeding, crunching through armor, flesh, and bone with a terrifying hunger.',
    test: { stat: 'Lore', target: '6+' },
    effects: [
      'Lore 6+.',
      'Success: Gain 15 XP as you inspect the bones.',
      'For each Hero that failed this test, all Enemies are +1 Damage on their Attacks during the next Fight.',
    ],
  },
  {
    id: 'cp2_fetid_lair',
    name: 'Fetid Lair',
    tags: ['Encounter', 'Environment', 'Darkness'],
    flavor: 'The ground and walls here are cracked, spilling a violet glow into the room as waves of void energy cascade out from each fissure, distorting the air. The smell of rot fills your nostrils as you pick your way through the broken remains that litter the floor. Evil lurks here.',
    effects: [
      'Each Hero must choose 3 different Skills and make the following tests in order: Skill 5+, Skill 6+, and Skill 6+ requiring at least 2 rolls of 6+ to succeed.',
      'For each successful test: gain 15 XP and 1 starting Side Bag Token.',
      'For each failed test: roll once on the Mutation chart.',
    ],
  },
];

// ── Beast Enemy Traits ────────────────────────────────────────────────────────
export const CP2_BEAST_TRAITS = [
  {
    id: 'cp2_shredding',
    name: 'Shredding',
    type: 'Enemy Trait',
    tags: ['Beast'],
    effects: [
      'This Trait can be applied to all Beast Enemies during a Fight.',
      'Beast Combat Hits are +2 Damage each and ignore Armor.',
    ],
  },
  {
    id: 'cp2_corrosive_ichor',
    name: 'Corrosive Ichor',
    type: 'Enemy Trait',
    tags: ['Beast'],
    effects: [
      'This Trait can be applied to all Beast Enemies during a Fight.',
      'Whenever a Beast is killed (or takes at least 3 Wounds during an Attack), every Hero adjacent to it takes D6 Hits that do 2 Wounds each.',
      'XP: +5',
    ],
  },
  {
    id: 'cp2_unleashed',
    name: 'Unleashed',
    type: 'Enemy Trait',
    tags: ['Beast'],
    effects: [
      'This Trait can be applied to all Beast Enemies during a Fight.',
      'Beasts gain +X Combat where X is the difference between its Initiative and the Target\'s Initiative (minimum +1). Example: Initiative 7 Beast vs. Initiative 4 Hero = +3 Combat.',
    ],
  },
  {
    id: 'cp2_savage_ferocity',
    name: 'Savage Ferocity',
    type: 'Enemy Trait',
    tags: ['Beast'],
    effects: [
      'This Trait can be applied to all Beast Enemies during a Fight.',
      'Beasts gain +2 Initiative and all successful Melee To Hit rolls count as 2 Combat Hits each. To Hit rolls of 6+ count as 3 Combat Hits instead. Any ability triggered by a particular To Hit roll counts for all Combat Hits caused by that roll.',
    ],
  },
  {
    id: 'cp2_unstoppable',
    name: 'Unstoppable',
    type: 'Enemy Trait',
    tags: ['Beast'],
    effects: [
      'This Trait can be applied to all Beast Enemies during a Fight.',
      'Beasts move through other models and ignore the first 3 Wounds they would take during each Hero\'s Attack.',
    ],
  },
];

export const CHALLENGE_PACK_2 = {
  id: 'challengePack2',
  name: 'Challenge Pack #2',
  description: 'Adds threat cards (Devouring Swarm, Armored Hunting Pack, Void Tide, Bestial Eruption, The Devil of Black Rock), darkness cards (Infected Scratch ×2, Endless Waves, Unnatural Evolution), encounter cards (Ominous Chitters, Shredded Remains, Stalking in the Dark, Splintered Bones, Fetid Lair), and 5 Beast Enemy Traits (Shredding, Corrosive Ichor, Unleashed, Savage Ferocity, Unstoppable).',
  threatCards: CP2_THREAT_CARDS,
  darknessCards: CP2_DARKNESS_CARDS,
  encounterCards: CP2_ENCOUNTER_CARDS,
  beastTraits: CP2_BEAST_TRAITS,
};

export default CHALLENGE_PACK_2;
