// src/data/townLocationEvents.js
// Canonical event lookup by display name and id.
// Built from townLocations/index.js — no manual per-file imports needed.

import { townLocations } from './townLocations/index.js';
import campSite from './townLocations/campSite.js';

const allLocations = [...townLocations, campSite];

export const townLocationEvents = allLocations.reduce((map, loc) => {
  if (!loc) return map;
  // Key by the location's display name (e.g. "Blacksmith", "Doc's Office")
  if (loc.name) map[loc.name] = loc;
  // Also key by id for flexibility (e.g. "blacksmith", "docsOffice")
  if (loc.id) map[loc.id] = loc;
  return map;
}, {});
