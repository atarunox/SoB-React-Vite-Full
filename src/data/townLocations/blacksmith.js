// src/data/townLocations/blacksmith.js
// Wrapper plus shape adapter for the Blacksmith.
// FrontierTown/Blacksmith/blacksmith.js exports a 2–12 keyed event chart;
// older code expects { id, name, type, description, events: [...] }.

import chart from './FrontierTown/Blacksmith/blacksmith.js';

const toEventsArray = (src) => {
  if (!src || typeof src !== 'object') return [];
  return Object.entries(src)
    .map(([rollKey, entry]) => {
      const roll = Number(rollKey);
      const e = entry || {};
      return {
        roll: Number.isFinite(roll) ? roll : null,
        name: e.name || '',
        lore: e.lore || '',
        effect: e.effect || '',
        log: Array.isArray(e.log) ? e.log.slice() : [],
      };
    })
    .filter((e) => e.roll != null)
    .sort((a, b) => a.roll - b.roll);
};

const blacksmith = {
  id: 'blacksmith',
  name: 'Blacksmith',
  type: 'Shop',
  description:
    'Blacksmith shop offering horses, carts, Dark Stone gear, and upgrade services.',
  events: toEventsArray(chart),
};

export default blacksmith;
