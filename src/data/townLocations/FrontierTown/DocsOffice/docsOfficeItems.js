const docsOfficeItems = [
  // --- Token purchases ---
  {
    id: 'doc_bandages_token',
    name: 'Bandages',
    cost: 50,
    type: 'Gear',
    tags: ['Bandages', 'Tokens'],
    effect: 'Gain 1 Bandages Token',
    grantsToken: { type: 'Bandages', amount: 1 },
    purchaseLimitPerVisit: 2,
  },
  {
    id: 'doc_healing_herbs_token',
    name: 'Healing Herbs',
    cost: 125,
    type: 'Gear',
    tags: ['Plant', 'Tokens'],
    effect: 'Gain 1 Herbs Token',
    grantsToken: { type: 'Herbs', amount: 1 },
    purchaseLimitPerVisit: 2,
  },
  {
    id: 'doc_tonic_token',
    name: 'Tonic',
    cost: 200,
    type: 'Gear',
    tags: ['Tonic', 'Tokens'],
    effect: 'Gain 1 Tonic Token',
    grantsToken: { type: 'Tonic', amount: 1 },
    purchaseLimitPerVisit: 2,
  },

  // --- Regular gear ---
  {
    id: 'doc_specimen_jar',
    name: 'Specimen Jar',
    cost: 150,
    type: 'Gear',
    tags: ['Glass', 'Science'],
    description:
      'A sealed jar with preservative fluid for strange odds and ends recovered from Other Worlds.',
    effect:
      'In Other Worlds give up your movement to try to find a sample of the flora, make Cunning 5+ to fill. Sell to Doc for D6×$100. Limit One.',
    limit: 'One',
  },
  {
    id: 'doc_bone_saw',
    name: 'Bone Saw',
    cost: 1100,
    type: 'Gear',
    slot: 'Hand Weapon',
    tags: ['Science'],
    twoHanded: false,
    handsRequired: 1,
    upgradeSlots: 2,
    weight: 1,
    description:
      'A brutal, well-oiled surgeon’s saw repurposed for the battlefield.',
    effect:
      'Use 1 Grit to reduce Defense of target permanently to 0 (non-Tough only).',
  },
  {
    id: 'doc_tools_of_science',
    name: 'Tools of Science',
    cost: 4800,
    type: 'Gear',
    slot: 'Hand Weapon',
    tags: ['Science'],
    twoHanded: false,
    handsRequired: 1,
    upgradeSlots: 2,
    weight: 1,
    description:
      'Tinkerer’s kit of probes, gauges, and wicked implements that reward keen minds.',
    effect: 'Your base Combat = Cunning.',
  },
  {
    id: 'doc_field_surgeons_apron',
    name: "Field Surgeon's Apron",
    cost: 925,
    type: 'Gear',
    slot: 'Torso',
    tags: ['Science'],
    weight: 1,
    description:
      'Heavy leather apron stained with lessons learned the hard way.',
    effect: 'Any time you kill an Enemy, Heal 1 Sanity',
  },
];

export default docsOfficeItems;
