// Structured Indian Trading Post shop data (Trading Post / Tribal Tent / Medicine Man)
// Categories are OBJECTS, not arrays — this matches buildCategoriesForShop.

// If you keep your goods lists in this file, leave them here.
// If you split them, import from their modules instead.

import { medicineManServices, medManAuras } from '../../utils/locationHandlers/indianTradingPostServices';

// Example goods (replace with your real arrays if you already have them elsewhere)
const tradingPostGoods = [
  // { id:'bowstring_oil', name:'Bowstring Oil', cost: 50, effects:[...] },
];
const tribalTentGoods = [
  // Be sure to tag Tribal/Scout restricted items:
  // { id:'longbow', name:'Longbow', slot:'Bow', weight:1, keywords:['Restricted:TribalOrScout'], cost:300 }
];

// Legacy flat list for compatibility with tabsByShop and other consumers:
export const indianTradingPostItems = [
  ...tradingPostGoods,
  ...tribalTentGoods,
];


const indianTradingPostShop = {
  id: 'indianTradingPost',
  name: 'Indian Trading Post',
  description:
    'A gathering of traders, tents, and the Medicine Man.',
  rules: [
    'Tribal Tent is restricted to heroes with the Tribal or Scout keyword.',
  ],

  shops: [
    {
      id: 'tradingPost',
      name: 'Trading Post',
      categories: {
        goods: tradingPostGoods,
      },
    },
    {
      id: 'tribalTent',
      name: 'Tribal Tent',
      categories: {
        tribal: tribalTentGoods,
      },
    },
    {
      id: 'medicineMan',
      name: 'Medicine Man',
      categories: {
        services: medicineManServices, // Spirit Cleansing / Vision Quest
        aura: medManAuras,            // optional, can be empty
      },
    },
  ],
};

export default indianTradingPostShop;
