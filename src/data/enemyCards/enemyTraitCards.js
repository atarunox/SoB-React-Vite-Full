// src/data/enemyCards/enemyTraitCards.js
// Enemy-specific trait card decks.
// Roll mechanic controlled by ENEMY_TRAIT_CONFIG below.
// Default (triggerOn: '1-3'): roll D6 when enemy appears — on 1-3 draw a random trait card.
// Pack decks (triggerOn: '4-6'): roll D6 — on 4-6 draw a random pack card to determine the variant.
// Populated by scanning via DM Options → Scan Cards → Enemy Trait Card.

export const ENEMY_TRAIT_CONFIG = {
  // Pack decks — triggered on 4-6
  'Serpentmen': { triggerOn: '4-6', label: 'Tribal Pack' },
  'Bandits':    { triggerOn: '4-6', label: 'Outlaw Pack' },
  'Werewolves': { triggerOn: '4-6', label: 'Werewolf Pack' },
};

export const ENEMY_TRAIT_CARDS = {

  // ── Harbinger ──────────────────────────────────────────────────────────────
  'Harbinger': [
    {
      name: 'Lashing Tail',
      effect: 'The Harbinger has double its base Health.\n\nAt the start of its Activation each turn, the Harbinger does 1 Hit to a Random Hero within 3 spaces, lashing out with its tail! This Hit does 2D6 Damage.',
    },
    {
      name: 'Screeching Roar',
      effect: 'The Harbinger has double its base Health.\n\nEach time the Hold Back the Darkness roll is failed, the Harbinger roars, giving all Enemies +2 Damage on their Attacks and all Heroes -2 Damage on their Attacks, until the end of the turn.',
    },
    {
      name: 'Blistering Touch',
      effect: 'The Harbinger has double its base Health.\n\nHarbinger To Hit rolls of 6+ also add D3 Burning markers to the target.\n\nAny Hero that starts their Activation adjacent to the Harbinger must pass an Agility 5+ test or take 3 Hits that do 2 Damage each.',
    },
    {
      name: 'Blasphemous Name',
      effect: 'The Harbinger has triple its base Health.\n\nThe Harbinger gains Combat equal to its Target\'s current Spirit Skill, and prioritizes Targets that are Keyword Holy.',
    },
    {
      name: 'Bringer of Armageddon',
      effect: 'The Harbinger has double its base Health, and gains Keywords Cynder and Ancient.\n\nSpellcaster — At the start of its Activation each turn, casts a Spell from the Shadow Magik deck (or the Default Spell on the back of the Shadow Magik Reference card).',
    },
  ],

  // ── HellBats ───────────────────────────────────────────────────────────────
  'HellBats': [
    {
      name: 'Human Faces',
      flavorText: 'Any Hero starting their Activation adjacent to one or more HellBats takes 1 Corruption Hit as the Human Faces speak to you in dark whispers.',
      effect: '',
    },
    {
      name: 'Spits Burning Bile',
      effect: 'HellBats gain the Assault Special Rule as well as the following Ranged Attack using Ranged To Hit 5+.\n\nBurning Bile — Ranged Attack: Range 3, Shots 1, Damage *\n*A Hero that fails their Defense roll against this Hit gains a Bleeding marker.',
    },
    {
      name: 'Flooding Swarm',
      effect: 'At the end of each Fight round, if there are any Enemies still on the board, add D3+1 Ambushing HellBats to the Fight.\n\nAny HellBat models that cannot be placed each do 2 Horror Hits to every Hero (instead of gaining Elite abilities).',
    },
    {
      name: 'Corpse Nesting',
      flavorText: 'HellBat Trait',
      effect: 'These HellBats come into play with D3 Corpse Pile Enemies.\n\nWhenever these Corpse Piles successfully roll to Spawn a Hungry Dead, instead it Spawns D3 HellBats.\n\nIf one or more HellBats cannot be placed for this, move the Darkness forward 1 space on the Depth Track instead.',
    },
  ],

  // ── Hungry Dead ────────────────────────────────────────────────────────────
  'Hungry Dead': [
    {
      name: 'Grave Weapons',
      flavorText: 'Hungry Dead Trait',
      effect: 'Hungry Dead are +1 Combat and their Melee To Hit rolls of 6+ now do double the normal Damage.',
    },
    {
      name: 'Zombie Plague',
      flavorText: 'Hungry Dead Trait',
      effect: 'Hungry Dead Melee To Hit rolls of 6+ now add a Bleeding marker to the Hero, in addition to the normal Damage, if not defended.\n\nAny Hero that has 1 or more Bleeding markers at the end of the Fight must roll a D6 for each. On the roll of 1 or 2, that Hero gains a Zombie Bite card.',
    },
    {
      name: 'Corrupting Gore',
      flavorText: 'Hungry Dead Trait',
      effect: 'Any time a Hero kills an adjacent Hungry Dead model, that Hero is splattered with disease-ridden gore, taking 1 Corruption Hit.',
    },
    {
      name: 'Unstoppable',
      effect: 'Hungry Dead are +1 Health and Tough (Immune to Critical Hits).\n\nIn addition, Corpse Piles have double their normal Health.\n\nXP bonus applies to both Corpse Piles and Hungry Dead.',
    },
    {
      name: 'Clawing Horde',
      flavorText: 'Hungry Dead Trait',
      effect: 'Hungry Dead are +1 Health.\n\nHungry Dead are +1 Combat for every other Undead model adjacent to the target.',
    },
  ],

  // ── Goliath ────────────────────────────────────────────────────────────────
  'Goliath': [
    {
      name: 'From Beyond the Stars',
      flavorText: 'Goliath Trait',
      effect: 'The Goliath has double its base Health, and gains Keywords Ancient and Alien.\n\nAny time the Goliath does 6 or more Wounds to a Hero during its Activation, that Hero must discard an Item, Side Bag Token, or Dark Stone, consumed by the rampaging creature! It then Heals D6 Wounds (or Promo Wounds if it was a Dark Stone or had a Dark Stone Icon).',
      xp: 5,
    },
    {
      name: 'Feeds on Memories',
      effect: 'The Goliath has double its base Health.\n\nGains extra Combat with its Flailing Tentacles, against each Hero within range, equal to that Hero\'s current Lore Skill.',
    },
    {
      name: 'Unstoppable Mass',
      effect: 'The Goliath has double its base Health.\n\nChanges Targets each turn and prioritizes Targets by who has the highest current Health.\n\nEndurance (3) — This Enemy cannot take more than 3 Wounds from any single Hit (extra Damage is wasted).',
    },
    {
      name: 'Hulking Alien Form',
      effect: 'The Goliath has triple its base Health, and is Keyword Alien.\n\nGains extra Combat with its Flailing Tentacles, against each Hero within range, equal to the total number of Heroes in the Hero Posse.',
    },
    {
      name: 'Plunging Tentacle Arms',
      flavorText: 'Goliath Trait',
      effect: 'The Goliath has double its base Health.\n\nAt the start of each turn (after the first turn of the Fight), if there are no Tentacle Enemies on the board, place 2 Tentacles as an Ambush. These Tentacles represent the arms of the Goliath bursting through the ground to reach the Heroes!\n\nWhen a Tentacle is killed, remove it and collect XP as normal, but also add Wound markers to the Goliath equal to the Tentacle\'s base Health.\n\nWhenever the Goliath moves, remove all Tentacles from the board, discarding any Wound markers they had on them. If the Goliath is killed, remove all Tentacles as well.',
    },
  ],

  // ── Slashers ───────────────────────────────────────────────────────────────
  'Slashers': [
    {
      name: 'Feasting on Flesh',
      effect: 'Slashers have double their base Health and double their base Combat.',
    },
    {
      name: 'Soulless Black Eyes',
      effect: 'Horror Hits caused by Slashers now do 2 Sanity Damage each. Slashers are +2 Health.',
    },
    {
      name: 'Feeding Mandibles',
      effect: 'Whenever a Hero takes one or more Wounds from Slasher Combat Hits, they must also discard 1 Dark Stone or take an extra D3 Wounds, ignoring Defense and Armor.',
    },
    {
      name: 'Serrated Claws',
      effect: 'Slasher Combat Hits now use the D8 for Damage and ignore Armor.',
    },
    {
      name: 'Void Parasites',
      flavorText: 'Slasher Trait',
      effect: 'Slashers gain Keyword Void.\n\nWhen a Slasher is killed by a Hero, leave it in place on the board. At the end of that Hero\'s Activation, that Slasher immediately Activates outside of the normal Initiative order, Re-targeting, moving, and Attacking using double its normal Combat value as it unleashes a final fury in death. It is then removed from play.',
    },
    {
      name: 'Enraged by Light',
      flavorText: 'Slasher Trait',
      effect: 'While on the same Map Tile as the Hero with the Light Source, Slashers are +2 Combat.\n\nAt the start of its Activation, if a Slasher is within 2 spaces of the Hero with the Light Source, it will change to target that Hero.',
    },
  ],

  // ── Order of the Crimson Hand ──────────────────────────────────────────────
  'Order of the Crimson Hand': [
    {
      name: 'Acolytes of the Black',
      effect: 'Any turn in which the Hold Back the Darkness roll is failed, the Crimson Hand get an extra Activation (Move, Attack, etc.) at Initiative 8, as well as at their normal Initiative level.',
    },
    {
      name: 'Ritual Mutation',
      flavorText: 'Crimson Hand Trait',
      effect: 'Roll once on the Mutation Chart (normally only for Heroes), and apply the result to all Crimson Hand models.\n\nIgnore any reference to Sanity and Corruption. If Chest Portal is rolled, it is only triggered once for the whole Enemy Group, when 11 or 12 is rolled to Hold Back the Darkness.',
    },
    {
      name: 'Relic Raiders',
      flavorText: 'Crimson Hand Trait',
      effect: 'Any time a Hero takes 5 or more Wounds from Crimson Hand Combat Hits during the turn, roll a D6. On the roll of 1 or 2, the Crimson Hand steal the Hero\'s highest Gold value Artifact (discard, and transfer to the Crimson Hand). This immediately counts as an extra Artifact for their Sacred Artifact ability.',
      xp: '+5 Per Artifact currently in their possession',
    },
    {
      name: 'New Recruits',
      flavorText: 'New recruits are often unskilled, but have something to prove.',
      effect: 'Crimson Hand lose the Sacred Artifact Ability, are reduced to Range To Hit 5+, and are only Damage 2 for Melee Attacks.\n\nThey are, however, Double their base Health, and gain +2 Damage for each Wound instead, for their Zealot Ability.',
    },
    {
      name: 'Infiltration',
      flavorText: 'Crimson Hand Trait',
      effect: 'Always attacks from Ambush.\n\nIn the first turn of a Fight, gains +1 Shot with their Cult Rifles for each Hero in the Posse that has Cunning 2 or lower.',
      xp: 5,
    },
  ],

  // ── Void Spiders ───────────────────────────────────────────────────────────
  'Void Spiders': [
    {
      name: 'Spitting Venom',
      flavorText: 'Void Spiders move through other models.',
      effect: 'Burning Venom — Void Spiders use the Standard Ability Assault and are Ranged To Hit 4+.\n\nRanged Attack: Range 2, Shots 1, Damage D6, Ignores Armor.',
    },
    {
      name: 'Razor Sharp Jaws',
      flavorText: 'Void Spiders move through other models.',
      effect: 'Void Spider To Hit rolls of 6+ now cause a Bleeding marker in addition to the normal Damage.',
    },
    {
      name: 'Feeding Frenzy',
      flavorText: 'Void Spiders move through other models.',
      effect: 'Void Spider Combat Hits are +1 Damage for each other Void Spider adjacent to the Target.',
    },
    {
      name: 'Indestructible Carapace',
      flavorText: 'Void Spiders move through other models.',
      effect: 'Defense 4+\n−2 Move\n−1 Initiative',
    },
    {
      name: 'Egg Layers',
      flavorText: 'Void Spiders move through other models.',
      effect: 'Void Spider To Hit rolls of 6+ now also cause 1 Corruption Hit.\n\nInfected by Egg Sacks — Until the end of the Adventure, any time a Hero rolls on the Mutation Chart, that Hero also takes 2D6 Wounds, ignoring Defense and Armor, and triggers an Ambush Attack! Void Spiders, as they burst out of the unsuspecting host!',
    },
  ],

  // ── Feral Vampires ─────────────────────────────────────────────────────────
  'Feral Vampires': [
    {
      name: 'Light Sensitive',
      flavorText: 'Vampire Trait',
      effect: 'Gains +2 Combat when attacking the Hero with the Lantern.\n−1 Defense while adjacent to the Hero with the Lantern.\nAt the start of the Vampire Activation each turn, roll a D6 for each Vampire within its Move distance and with a clear path to the Lantern Hero. On the roll of 5 or 6, that Vampire changes to target the Lantern Hero this turn.',
    },
    {
      name: 'Chilling Touch',
      effect: 'Any time a Hero takes 1 or more Wounds from a Vampire, they also take 2 Horror Hits that do 2 Sanity Damage each.',
    },
    {
      name: 'Wall Scurrying',
      effect: 'Always attacks from Ambush.\n\nMoves through other models and changes targets each turn.\n\nImmune to Critical Hits unless adjacent to the attacker.\n\n+2 Move, −1 Combat',
    },
    {
      name: 'Soul Siphoning',
      effect: 'Gains +2 Combat when attacking any Holy or Traveler Hero (or +3 if both).\n\nAt the end of each turn, Heroes take 1 Horror Hit for each Wound currently on every Vampire Enemy adjacent to them.',
    },
    {
      name: 'Blood Frenzied',
      effect: 'Prioritizes targets by who has the most Wounds (highest to lowest).\n\nGains +1 Damage on Combat Hits for every 2 Wounds the target Hero had at the start of the Vampire\'s Activation. Vampire To Hit rolls of 6+ add a Bleeding marker to the target.',
    },
  ],

  // ── Werewolf Feral Kin ─────────────────────────────────────────────────────
  'Werewolf Feral Kin': [
    {
      name: 'Battle Lust',
      effect: 'At the end of each turn, Heals Wounds equal to the number of Blood Spatter spaces the Darkness has passed on the Depth Track (including the current space).\n\nHero Critical Hits do +2 Damage against the Werewolf Feral Kin.',
    },
    {
      name: 'The Smell of Fear',
      effect: 'Prioritizes targets by who currently has the most Sanity Damage (highest to lowest).\n\nGains +1 Damage on Combat Hits for every 2 Sanity Damage the target Hero had at the start of the Werewolf Activation.',
    },
    {
      name: 'Pack Hunters',
      flavorText: 'Werewolf Trait',
      effect: 'When selecting targets, ignores whether or not the target already has a Werewolf Feral Kin targeting it (may double up, etc).\n\nGains +1 Combat and +1 Defense for each other adjacent Werewolf Feral Kin.',
      xp: 5,
    },
    {
      name: 'Leaping',
      flavorText: 'Werewolf Trait',
      effect: 'Moves through other models.\n\nWhen moving to attack, only moves the shortest distance possible to reach the target.\n\nAfter moving at least 1 space to reach a target, gains +1 Damage on all of its Combat Hits for each unspent point of its move remaining.',
      xp: 5,
    },
    {
      name: 'Runic Charms',
      flavorText: 'Werewolf Trait',
      effect: '+2 Defense\n\nGains an additional +2 Defense and is Immune to Critical Hits from any Attack made using an Item that has one or more Holy icons.\n\nAlso, ignores all of the effects of any Sermon or Spell on the D6 roll of 5 or 6.',
      xp: 10,
    },
  ],

  // ── Lost Army ──────────────────────────────────────────────────────────────
  'Lost Army': [
    {
      name: 'Regimental Honors',
      flavorText: 'Lost Army Trait',
      effect: 'One of the Lost Army models is upgraded to being the Lost Army Banner Bearer, gaining the modifiers listed on the Lost Army Banner Reference Card.',
    },
    {
      name: 'Burning Hatred',
      effect: 'At the start of their Activation, every Lost Army model in Formation will move 1 space forward toward the Hero with the Lantern as a Free Move. These models must still stay in Formation.\n\nAny Hero that starts their Activation on the same Map Tile with one or more Lost Army models takes 2 Horror Hits.',
    },
    {
      name: 'Sappers',
      effect: '−1 Initiative, +1 Health\n\nIf any Explosive lands in the same or adjacent space to a Lost Army model, roll a D6. On the roll of 4+, they pick it up and throw it back! Target the original throwing model and roll the Ranged To Hit for the Lost Army soldier. If missed, Bounces as normal.',
    },
    {
      name: 'Battle Hardened',
      effect: '+2 Health\n\nGains +1 Combat for each other Lost Army model adjacent (max +3).',
    },
    {
      name: 'Pillagers',
      effect: 'If there is a Hero within their Move distance, will always move to Attack with Melee instead of firing its Hell Musket Volley.\n\nAny Hero that takes one or more Wounds from Combat Hits during the Lost Army\'s Activation must also discard $100, 1 Dark Stone, or 1 Side Bag Token.',
    },
  ],

  // ── Hellfire Succubi ───────────────────────────────────────────────────────
  'Hellfire Succubi': [
    {
      name: 'Magma Kiss',
      flavorText: 'Hellfire Succubi Trait',
      effect: 'Hellfire Succubi To Hit rolls of 6+ add a Burning Marker to the Hero if the Defense roll is failed (in addition to the normal Damage).',
    },
    {
      name: 'Pit Dwellers',
      effect: 'Prioritizes targets by who currently has the most Corruption Points (highest to lowest).\n\nGains +1 Damage on Combat Hits for every Corruption Point the target Hero has, and +2 Damage for each Mutation the target has.',
    },
    {
      name: 'Charred',
      flavorText: 'Hellfire Succubi Trait',
      effect: 'Heroes take 1 Wound/Sanity Damage (your Choice), ignoring Defense/Willpower, for every Hit they assign to an adjacent Hellfire Succubi.',
      xp: 5,
    },
    {
      name: 'Born of Flesh',
      flavorText: 'Hellfire Succubi Trait',
      effect: 'The Hellfire Succubi lose their Hellfire Demons ability and are reduced to Melee To Hit 4+.\n\nHeroes are -1 on any To Hit rolls they assign to a Hellfire Succubi (if the roll would no longer Hit, it may not be assigned to them). Rolls of 6+ still count as a Critical Hit.',
    },
    {
      name: 'Belian Coven',
      flavorText: 'Hellfire Succubi Trait',
      effect: 'Hellfire Succubi gain Armor 5+ against all Damage done by a Holy or Magik Hero (including Sermons and Spells).\n\nAt the start of each turn, roll a D6. On the roll of 1, 2, or 3, draw a Shadow Magik Spell card to be cast by a Random Hellfire Succubi model.',
      xp: 5,
    },
  ],

  // ── Shaman Juju Trinkets ───────────────────────────────────────────────────
  'Shaman': [
    {
      name: 'Hex Bag',
      effect: 'All of the Shaman\'s Combat Hits are now considered to be Hex Hits (the Hero must use Willpower to prevent the Wounds, rather than Defense).',
    },
    {
      name: 'Juju Wand',
      effect: 'All of the Shaman\'s Spells are now cast at Mastery level. If already at Mastery level, the Shaman casts an extra spell when casting instead.',
    },
    {
      name: "Ven'issa Rattle",
      effect: 'The Shaman gains: Terror (2) — Any Hero starting their Activation on the same Map Tile automatically takes 2 Horror Hits.\n\n(This replaces any Fear the Shaman may already have).',
    },
    {
      name: 'Tribal Voodoo Doll',
      effect: 'At the start of each turn, select a Random Hero. That Hero is reduced to Defense and Willpower 5+ until the end of the turn (unless already worse).',
    },
    {
      name: 'Serpent Tribal Tattoos',
      effect: 'The Shaman gains: Tough — Immune to Critical Hits.\n\n(This Juju Trinket may not be knocked away).',
    },
  ],

  // ── Ancient One ────────────────────────────────────────────────────────────
  'Ancient One': [
    {
      name: 'Dreaded Return',
      flavorText: 'There is a reason all living things fear the Darkness beyond time and space... for the Darkness is older than time; the Void that all things emerged from, and to which all things must return.',
      effect: 'As Old as Time Itself — The Ancient One has +3 Health for each Growing Dread card in the Stack or Discard pile.',
    },
    {
      name: 'Cosmic Cleansing',
      flavorText: 'Perhaps man was not meant to travel through time and space; spreading through the Void to distant worlds and other dimensions of reality. Once more, a time of cleansing has come.',
      effect: 'Extermination Agenda — The Ancient One is +1 Combat for every 2 Heroes in the Posse.\n\nEnd of Mission:\nReward — +100 XP and all Heroes may remove one Mutation, Injury, Curse, or Parasite.\nFailure — Each Hero gains 1 Mutation that cannot be healed or removed in Town.',
    },
    {
      name: 'Wrath of the Gods',
      flavorText: 'Your recent accomplishments have been seen as meddling in affairs beyond the limits of human understanding. It is time for a reminder of humanity\'s true insignificance in the flowing folds of time!',
      effect: 'What Price Wisdom — Heroes take +X Damage from the Ancient One\'s Combat Hits, where X is equal to their Hero Level.\n\nEnd of Mission:\nReward — All Heroes gain D3 Health, emboldened by their victory.\nFailure — Each Hero loses D3 Health permanently.',
    },
    {
      name: 'Return What You Have Stolen',
      flavorText: 'Angered by your trespass throughout time and space, the Ancient One has come to reclaim what you have stolen from its rightful history.',
      effect: 'Treasures Beyond Time — During this Fight, all Heroes take an extra +1 Damage from the Ancient One\'s Combat Hits for each Artifact (from any World) they are currently carrying.\n\nEnd of Mission:\nReward — Each Hero may draw a Mine Artifact.\nFailure — Each Hero must discard their highest $ value Artifact.',
    },
    {
      name: 'Ancient Enemies',
      effect: 'The Doom of Mankind — While the Ancient One is in play, at the start of each turn, roll a D6. On the roll of 1, 2, or 3, draw a Darkness card.',
    },
  ],

  // ── Night Terrors ──────────────────────────────────────────────────────────
  'Night Terrors': [
    {
      name: 'Terror from the Shadows',
      effect: 'Night Terrors always enter play from Ambush.\n\nEndurance (3) — May not take more than 3 Wounds from any single Hit. Extra Damage is wasted.',
    },
    {
      name: 'Rocky Skin',
      effect: 'Night Terrors have +3 Health and Tough (Immune to Critical Hits).',
    },
    {
      name: 'Death in the Dark',
      flavorText: 'Night Terror Trait',
      effect: 'Night Terrors Re-Target each turn, and prioritize their target based on Heroes that are furthest from the Light Source.\n\nWhile NOT on the same Map Tile as the Heroes\' Light Source, a Night Terror is +1 on all of its To Hit rolls.',
    },
    {
      name: 'Stolen in the Night',
      flavorText: 'Night Terror Trait',
      effect: 'When the Night Terrors are placed on the board, also put D3 KO\'d Hero markers at the back of the Map Tile for each Night Terror. These markers represent Stolen Victims and may not be interacted with in any way.\n\nNight Terrors are +1 Health for each of these Stolen Victim markers in play, and +1 Combat for every 2 Stolen Victim markers in play.\n\nAt the end of the Fight, every Hero gains +10 XP for each Stolen Victim marker, and the markers are removed.',
    },
    {
      name: 'Glowing Eyes',
      flavorText: 'Night Terror Trait',
      effect: 'At the start of each turn, if there are one or more Night Terrors on the board, they shift reality, making nightmares manifest!\n\nThis turn, all models are Activated in reverse Initiative order, from lowest to highest (starting with Initiative 0, then 1, then 2, etc).\n\nAll Enemies with Defense 4 or less are considered to have Tough (Immune to Critical Hits) until they Activate each turn.',
    },
  ],

  // ── Serpentmen Tribal Pack (draw on 4-6) ──────────────────────────────────
  'Serpentmen': [
    {
      name: 'Diamond Scale Tribe',
      flavorText: 'Perhaps the most cunning and fierce of the tribes, the warriors of the Diamond Scale are hunters to the core. Disciplined and deadly, they work as a pack and use fighting formations to guard each other\'s flank as the strikers move in for the kill!',
      effect: 'Fierce Warriors — +1 Combat\nFormation — Immune to Critical Hits while adjacent to another Serpentmen model.',
    },
    {
      name: 'Yellow Tail Tribe',
      flavorText: 'The most numerous of the Serpentmen, the Yellow Tail have a breeding cycle three times faster than that of any other tribe. What they lack in experience or training, they make up for in sheer number of new young warriors!',
      effect: 'No extra bonus.',
    },
    {
      name: 'Striking Shadow Tribe',
      flavorText: 'Lashing out from the shadows, this sneaky tribe uses their natural dark colored scales to lay in wait for their prey. Stealth and surprise are their greatest weapons as they strike without warning!',
      effect: 'Stealth Strike — Always attacks from Ambush.\n\nFast Slither — +2 Move and +1 Initiative.',
    },
    {
      name: 'King Moccasin Tribe',
      flavorText: 'The biggest and strongest of the local tribes, these Serpentmen are hearty warriors with thick, razor-sharp blue scales. Where other tribes often use their speed and stealth to attack, the King Moccasin rush headlong into the fight, crushing their opponents with brute force!',
      effect: 'Heavy Scales — +2 Health but −1 Initiative.\n\nBrute Force — Serpentmen Melee To Hit rolls of 6 ignore Defense.\n\nXP: +10',
    },
    {
      name: 'Bloodbane Tribe',
      flavorText: 'The Bloodbane tribe hail from the southern reach of the Dor\'ahk Blood Swamp, where the murky water runs red as it bubbles up from below the surface. These deadly vipers naturally produce a toxin that is legendary for the speed at which it kills, and the torment of those it has touched.',
      effect: 'Vicious Attacks — Serpentmen Combat Hits are +1 Damage.\n\nDeadly Venom — While this Serpentmen Tribe card is in play, all Poison Markers do wounds on 1, 2, or 3 instead.',
    },
  ],

  // ── Bandit Outlaw Pack (draw on 4-6) ──────────────────────────────────────
  'Bandits': [
    {
      name: 'Brimstone Devils',
      flavorText: 'A collection of outlaws and scavengers that went to pilfer the ruins of Brimstone and came back with far more than they bargained for, these bandits have been possessed by Nightmare Demons!',
      effect: 'Demon Bullets — All Brimstone Devil Ranged To Hit rolls of 1 cause 1 Corruption Hit to the target.\n\nPossessed — +2 Health, immune to Critical Hits, never uses Cower, and they have the Keyword Demon.',
    },
    {
      name: 'Fallen Angels',
      flavorText: 'This all-female gang of soiled doves have seen more than their fair share of horrors on the frontier. A rag-tag collection of ex-saloon girls, gunslingers, and Bandidas, the Fallen Angels are ready for some payback.',
      effect: 'Dirty Fighting — All of their Hits are +1 Damage.\n\nWild Cards — Once per Attack, re-roll all missed To Hit rolls.\n\nHard Life — +1 Defense and −1 Health.',
    },
    {
      name: "El Tejon's Desperados",
      flavorText: 'Lead by Carlos Rodriguez de Salvo, also known as "El Tejon", the Badger, these ruthless Bandidos watch the rails and roads, planning their next score down to the detail.',
      effect: 'Tenacious — These Bandits have double normal Health.\n\nTrain Robbers — Always Attacks starting in Ambush.',
    },
    {
      name: 'Deathdealers',
      flavorText: 'Hired killers, this gang of cutthroat assassins prefers dealing death at a distance. With long rifles and a Dark Stone scope, the Deathdealers are expert snipers.',
      effect: 'Bandit Rifles — Bandit Pistols are replaced with Bandit Rifles.\nRange 12, Shots 2, Damage 4 (Brutal: Shots 3)\n\nSnipers — Ranged To Hit 3+. Any ability that would improve their To Hit instead gives them +1 Shot with their Bandit Rifles.',
    },
    {
      name: 'The Hitchcock Gang',
      flavorText: 'The Hitchcock Gang have earned a name for themselves as the most ruthless bank robbers in the Southwest! They hit hard and fast, and have an affinity for using Dynamite.',
      effect: 'Hit Fast — +1 Move and +1 Initiative.\n\nDynamite — When about to make a Ranged Attack, roll a D6. On the roll of 5 or 6, throws Dynamite instead. Place a Dynamite Token in the Target\'s space and roll To Hit. This works like normal Dynamite in every way (for Bounce, etc).',
    },
    {
      name: 'The Lost Marshals',
      flavorText: 'With the tattered black dusters, rusty shotguns, and tarnished tin badges of their former trade, this pack of unlawful turncoats betrayed their oath and their country to get rich on the frontier. It caught up to them in life, but in death...they dispense a new form of law.',
      effect: 'Rusty Shotguns — Twin Irons are replaced with Rusty Shotguns: Range 5, Shots 1, Damage 5. Uses the D8 To Hit.\n\nTarnished Tin — All Lost Marshals are +1 Shot for each Wound it currently has.',
      xp: '+10 (+5 more if Law)',
    },
    {
      name: 'The McMillan Boys',
      flavorText: 'A hefty group of slovenly bandits, the McMillan Boys had a legendary appetite for gold and violence. Overrun and infected while trying to pilfer the Zombie infested ruins of Camp Anderson, this appetite has become an unquenchable hunger for carnage and brains!',
      effect: 'Bloated Bodies — +2 Health\n\nBrain Hungry — +2 Move and +1 Combat. Shootout ability is replaced with Assault, but their Twin Irons are reduced to only Shots 2 (or Shots 3 if Brutal).',
      xp: 15,
    },
    {
      name: "Tuco Vaca's Border Raiders",
      flavorText: 'A wild pack of Bandidos in life, these reckless outlaws raided border towns all across the Southwest, until they were finally caught and hanged in Texas. Risen from the grave, they have become even more reckless than before! Their raspy cackling is enough to chill you to the bone!',
      effect: 'Dynamite — When about to make a Ranged Attack, roll a D6. On the roll of 5 or 6, throws Dynamite instead. Place a Dynamite Token in the Target\'s space and roll To Hit. This works like normal Dynamite in every way (for Bounce, etc).\n\nRaspy Cackling — Explosives (such as Dynamite) only reduce their Defense to 2, rather than fully ignoring it.',
      xp: 5,
    },
    {
      name: 'The Rooker Gang',
      flavorText: 'A fearsome band of outlaws from the 1850s, the Rooker Gang robbed every bank and camp from Uxbridge to Charlotte\'s Mill. There\'s little left of them now except for bones and hate!',
      effect: 'Skeletal — +2 Move and +2 Initiative\n\nFear Bullets — All Rooker Gang Ranged To Hit rolls of 6+ also cause 3 Horror Hits that do 2 Sanity Damage each.',
      xp: 10,
    },
    {
      name: 'The Trailblazer Gang',
      flavorText: 'Ghostly spectres of their former selves, the Trailblazer Gang now haunt the roads and mines they used to rob and terrorize in life. They still drag the chains they were bound in when they attempted a jail break, and were gunned down trying to escape.',
      effect: 'Ethereal Spectres — +2 Move and may move through other models. Reduced to Health 3 (or Health 5 if Brutal), but may not take more than 1 Wound per Hit.\n\nTerrifying — Fear (2) is replaced with Terror (2). If combined with the Elite Chart Ruthless Outlaws ability, this becomes Unspeakable Terror (2).',
      xp: 5,
    },
  ],

  // ── Werewolf Pack (draw on 4-6) ────────────────────────────────────────────
  'Werewolves': [
    {
      name: 'Moonrunners',
      flavorText: 'As part of the training and initiation into their shaman priesthood, the Moonrunners must go on a journey of transformation and madness! Only by experiencing the bloodiest form of beastly cravings, they believe, can one truly understand the nature of the Darkness.',
      effect: 'Indian Shaman Initiates — Moonrunners have Keywords Tribal and Magik.\n\nRunic Magik — All Moonrunners have Endurance 4 (may not take more than 4 Wounds per Hit — extra Damage is wasted).',
    },
    {
      name: 'The Scratched Badges',
      flavorText: 'Legendary for their ruthless brand of twisted justice, The Scratched Badges are a band of U.S. Marshals that have all fallen to the Werewolf\'s Curse. With their new-found power, and a touch of lunar madness, they have gone rogue.',
      effect: 'Cursed Law Men — The Scratched Badges have Keywords Law and Traveler.\n\nTwisted Justice — The Scratched Badges Combat Hits are +2 Damage against any Outlaw Hero, as well as +1 Damage for each Corruption Point the target has.',
    },
    {
      name: 'Children of the Moon',
      flavorText: 'On occasion, an entire group of prospectors working in a mine or a whole community of settlers will succumb to a fast-spreading curse, transforming them all into werewolves over the course of just a few days.',
      effect: 'Settlers and Prospectors — Children of the Moon have Keyword Frontier.\n\nTerritorial — Children of the Moon Melee To Hit rolls of 6+ are +1 Damage for each Hero in the Hero Posse.',
    },
    {
      name: 'The Henshaw Gang',
      flavorText: 'Once simply known as an infamous posse of cutthroats and bandits, The Henshaw Gang were cursed by a dying medicine man after being paid to wipe out an Indian village on the orders of a ruthless rail baron. Already unhinged, the gang now uses their lycan forms to chase down and rob stagecoaches and speeding trains, leaving a bloody trail in their wake.',
      effect: 'Vicious Thieves — The Henshaw Gang have Keyword Outlaw.\n\nFighting Dirty — The Henshaw Gang only have a base Melee To Hit 4+, but each unsaved Hit also adds a Bleeding Marker to the Hero on the D6 roll of 1, 2, or 3.\n\nBounty: $50 Each',
    },
    {
      name: 'Brothers of the Wolf',
      flavorText: 'Taken by the Wolf Mother during a tribal ritual, these young and bloodthirsty Indian Braves are hunters on a physical Spirit journey! Finding one another in the wild and forming a pack, they are on the warpath to collect trophies for their lunar goddess, proving their worth as warriors of the night!',
      effect: 'Indian Braves — Brothers of the Wolf have Keyword Tribal.\n\nCollect Trophies — Any Hero KO\'d by a Brothers of the Wolf Enemy must also discard an Item, Side Bag Token, or Dark Stone (taken as a trophy).',
    },
  ],
};

export default ENEMY_TRAIT_CARDS;
