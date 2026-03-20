// src/data/townLocations/index.js

import blacksmith from './blacksmith';
import church from './church';
import docsOffice from './docsOffice';
import frontierOutpost from './frontierOutpost';
import gamblingHall from './gamblingHall';
import generalStore from './generalStore';
import indianTradingPost from './indianTradingPost';
import mutantQuarter from './mutantQuarter';
import saloon from './saloon';
import smugglersDen from './smugglersDen';
import streetMarket from './streetMarket';
import sheriffsOffice from './sheriffsOffice';

// ---- Blasted Wastes Town ----
import miningOperation from './miningOperation';
import desertMarketplace from './desertMarketplace';
import temple from './temple';
import gladiatorArena from './gladiatorArena';

export const townLocations = [
  // Frontier Town
  blacksmith,
  church,
  docsOffice,
  frontierOutpost,
  gamblingHall,
  generalStore,
  indianTradingPost,
  mutantQuarter,
  saloon,
  smugglersDen,
  streetMarket,
  sheriffsOffice,
  // Blasted Wastes Town
  miningOperation,
  desertMarketplace,
  temple,
  gladiatorArena,
];

export const townLocationById = townLocations.reduce((map, loc) => {
  if (loc?.id) map[loc.id] = loc;
  return map;
}, {});

export const getLocationEvents = (id) =>
  townLocationById[id]?.events || [];
