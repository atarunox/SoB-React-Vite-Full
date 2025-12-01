// Frontier Town – General Store (Location Events only)

const generalStore = {
  id: 'general_store',
  name: 'General Store',
  type: 'Shop',
  description: 'A general mercantile stocked with everyday supplies and tokens.',

  events: [
    {
      roll: 2,
      name: 'Closed',
      lore:
        'Due to a recent demonic attack, the shop has been shut down.',
      effect:
        'No Hero may visit this Location until after the next Adventure.',
    },
    {
      roll: 3,
      name: 'Robbery',
      lore:
        'While you are browsing, masked gunmen burst into the shop.',
      effect:
        'Every Hero in the General Store must either hand over D6 × $10 (or as much as they have), or make an Agility 5+ test. Pass: turn them off and the shop owner rewards you with $100. Fail: you are shot; roll once on the Injury Chart.',
    },
    {
      roll: 4,
      name: 'Cost Increase',
      lore: 'Supply is low, demand is up.',
      effect:
        "All purchase prices are +$50. Cancels 'Fire Sale!'.",
    },
    {
      roll: 5,
      name: 'Cost Increase',
      lore: 'Supply is low, demand is up.',
      effect:
        "All purchase prices are +$50. Cancels 'Fire Sale!'.",
    },
    {
      roll: 6,
      name: "Flies are a' Buzzing, the Streets are Filth",
      lore: 'All too familiar at the General Store.',
      effect: 'No Event.',
    },
    {
      roll: 7,
      name: "Flies are a' Buzzing, the Streets are Filth",
      lore: 'All too familiar at the General Store.',
      effect: 'No Event.',
    },
    {
      roll: 8,
      name: "Flies are a' Buzzing, the Streets are Filth",
      lore: 'All too familiar at the General Store.',
      effect: 'No Event.',
    },
    {
      roll: 9,
      name: 'Fire Sale!',
      lore:
        "The shelves are fully stocked, but it's practically a ghost town out there.",
      effect:
        "All purchase prices are reduced by $50 (to a minimum of $25). Cancels 'Cost Increase'.",
    },
    {
      roll: 10,
      name: 'Fire Sale!',
      lore:
        "The shelves are fully stocked, but it's practically a ghost town out there.",
      effect:
        "All purchase prices are reduced by $50 (to a minimum of $25). Cancels 'Cost Increase'.",
    },
    {
      roll: 11,
      name: 'New Items in Stock',
      lore:
        'Fresh in from the Badlands, the shop owner shows his new gear for sale.',
      effect:
        'Draw 3 Gear cards. Any may be purchased for list price. If there is no listed price, that card may be purchased for $25 as a special sale.',
    },
    {
      roll: 12,
      name: 'Artifact for Sale',
      lore:
        'The shop owner has a rare artifact brought back from a recent expedition.',
      effect:
        'Draw a World Card to determine where the expedition began, then draw an Artifact from that world. It may be purchased for list price, or $100 if none listed.',
    },
  ],
};

export default generalStore;
