// src/data/townLocations/BlastedWastesTown/ScavengerDoc/scavengerDocServices.js
// Doc Services — Healing at the Scavenger Doc.

const scavengerDocServices = [
  {
    id: 'scav_doc_surgery',
    name: 'Scavenger Doc - Surgery',
    category: 'Service',
    type: 'Medical',
    tags: ['Service', 'Medical', 'Surgery'],
    cost: { gold: 250 },
    limit: 'Limit One Surgery attempt per Visit',
    description:
      'Choose one Injury, Mutation, or Parasite you want to remove and roll on the chart below. If a Parasite is chosen, -1 to the roll.',
    effect:
      'D6 Roll Result: 0 — Dead! Your Hero is killed during surgery. 1 — Painful Butchering: The ailment is not Healed and you lose D6 Health/Sanity (any mix) permanently. 2–3 — Failed: The ailment is not Healed. 4–6+ — Success! The Injury/Mutation/Parasite is Healed!',
    resultTable: {
      '0': 'Dead! — Your Hero is killed during surgery.',
      '1': 'Painful Butchering — The ailment is not Healed and you lose D6 Health/Sanity (any mix) permanently.',
      '2-3': 'Failed — The ailment is not Healed.',
      '4-6+': 'Success! — The Injury/Mutation/Parasite is Healed!',
    },
    rules: { ui: { requiresConditionPicker: 'InjuryOrMutation' } },
  },

  {
    id: 'scav_doc_xanthar_leech',
    name: 'Xanthar Leech Treatment',
    category: 'Service',
    type: 'Medical',
    tags: ['Service', 'Medical', 'Corruption', 'Leech'],
    cost: { gold: 50 },
    costLabel: '$50 per Leech',
    limit: 'Limit Once per Town Stay',
    description:
      'Decide how many Xanthar Leeches you want applied (up to 5), and roll a D6 for each. For every roll of 5 or 6, the Leeches suck out (remove) 1 Corruption Point from you. For every 1 rolled, however, take D6 Wounds, ignoring Defense, as that Leech chews too deeply.',
    rules: {
      ui: { promptsQuantity: true },
      maxQuantity: 5,
      removesCorruptionOn: '5-6',
      woundsOn: '1',
      woundsDie: 'D6',
      ignoresDefense: true,
    },
  },
];

export default scavengerDocServices;
