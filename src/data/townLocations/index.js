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

// If you later add a Camp Site or other towns, you can import and append here.

export const townLocations = [
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
];

export const townLocationById = townLocations.reduce((map, loc) => {
  if (loc?.id) map[loc.id] = loc;
  return map;
}, {});

export const getLocationEvents = (id) =>
  townLocationById[id]?.events || [];
