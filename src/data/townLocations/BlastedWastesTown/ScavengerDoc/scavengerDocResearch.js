// src/data/townLocations/BlastedWastesTown/ScavengerDoc/scavengerDocResearch.js
// Scientific Research — Medical or Cunning 4 or higher Heroes Only.

const scavengerDocResearch = [
  {
    id: 'scav_research_fungus',
    name: 'Research Fungus and Flora',
    category: 'Research',
    type: 'Service',
    tags: ['Service', 'Research', 'Science'],
    cost: { gold: 0 },
    limit: 'Limit Once per Town Stay. This ends your Location Visit.',
    requirement: 'Medical or Cunning 4 or higher Heroes Only',
    description:
      'Make a Cunning 5+ test to learn more about the fungus and plant life found on this alien world, and beyond. If successful, gain 10 XP and you gain 1 Fungus Research marker.',
    effect:
      'Cunning 5+ test. Success: +10 XP, +1 Fungus Research marker. Bonuses: 1 marker = Expertise with Plants and Fungus (roll 6 to keep Plant/Fungus items). 2+ markers = Expertise works on 5 or 6.',
    researchType: 'fungusResearch',
  },

  {
    id: 'scav_research_alien',
    name: 'Research Alien Biology',
    category: 'Research',
    type: 'Service',
    tags: ['Service', 'Research', 'Science'],
    cost: { gold: 0 },
    limit: 'Limit Once per Town Stay. This ends your Location Visit.',
    requirement: 'Medical or Cunning 4 or higher Heroes Only',
    description:
      'Make a Cunning 6+ test to learn more about the anatomy and ecology of the various aliens found in the Blasted Wastes and beyond. If successful, gain 25 XP and you gain 1 Alien Research marker.',
    effect:
      'Cunning 6+ test. Success: +25 XP, +1 Alien Research marker. Bonuses: 1 marker = Familiarity with Alien Culture (+1 Lore in Blasted Wastes OtherWorld). 3+ markers = Expertise on Alien Life (+1 Damage vs Alien enemies).',
    researchType: 'alienResearch',
  },
];

export default scavengerDocResearch;
