// src/data/townLocations/docsOfficeMedical.js

// Medical services (Doc's Office). These IDs are consumed by TownTab.
const docsOfficeMedical = [
  {
    id: 'doc_surgery',
    name: 'Surgery',
    category: 'Service',
    type: 'Medical',
    tags: ['Service', 'Medical', 'Surgery'],
    cost: 'D6 × $50',
    description:
      'Attempt to heal a single Injury or Mutation. Roll a D6 and apply the result.',
    limit: 'One attempt per Injury/Mutation',
    resultTable: {
      '0': 'Dead!',
      '1': 'Botched – Cannot be healed through Surgery (locks this condition).',
      '2-3': 'Failed – Not Healed; the Doc refunds half your money.',
      '4-5': 'Success! – Healed.',
      '6+': 'Impressive Scar – Healed, +2 Max Health.'
    },
    rules: { ui: { requiresConditionPicker: 'InjuryOrMutation' } }
  },

  {
    id: 'doc_treat_corruption',
    name: 'Treat Corruption',
    category: 'Service',
    type: 'Medical',
    tags: ['Service', 'Medical', 'Corruption'],
    cost: { gold: 100 },
    description:
      'Remove any number of Corruption points for $100 each. Then roll a D6; on 1–3, take D6 Wounds (ignores Defense).',
    effect:
      'Pay to remove Corruption; risk medical backlash.',
    rules: {
      ui: { promptsQuantity: true },
      removeCorruption: 'any',
      pricePerPoint: { gold: 100 },
      backlash: { rollDie: 'D6', on: '1-3', woundsDie: 'D6', ignoresDefense: true }
    }
  }
];

export default docsOfficeMedical;
