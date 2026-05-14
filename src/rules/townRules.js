import { townDailyEvents } from '../data/townDailyEvents';
import { townTraits } from '../data/townTraitsChart';

export function createTownDay(state) {
  return {
    day: (state?.day ?? 1),
    visited: new Set(state?.visited ?? []),
    hotelGuests: new Set(state?.hotelGuests ?? []),
    campGuests: new Set(state?.campGuests ?? []),
    shopsOpen: { ...(state?.shopsOpen || {}) },
    dailyEvent: state?.dailyEvent || null,
    traits: new Set(state?.traits || []), // trait IDs like 'TT-002' for Haunted
  };
}

export function serializeTownDay(td) {
  return {
    day: td.day,
    visited: Array.from(td.visited),
    hotelGuests: Array.from(td.hotelGuests),
    campGuests: Array.from(td.campGuests),
    shopsOpen: td.shopsOpen,
    dailyEvent: td.dailyEvent,
    traits: Array.from(td.traits),
  };
}

export function isHaunted(td) {
  return Array.from(td.traits).some(id => {
    const t = townTraits.find(x => x.id === id);
    return t && /Haunted/i.test(t.name);
  });
}

export function startNewDay(prev) {
  const td = createTownDay(prev);
  td.day += 1;
  td.visited.clear();
  td.hotelGuests.clear();
  td.campGuests.clear();
  td.dailyEvent = null;
  return td;
}

export function drawDailyEvent(td) {
  const ev = townDailyEvents[Math.floor(Math.random()*townDailyEvents.length)];
  td.dailyEvent = ev;
  return ev;
}

// Visit a shop; enforces one shop per day per posse and triggers first-visit event
export function visitShop(td, shopName, willpowerRoll = () => Math.floor(Math.random()*6) + 1) {
  const firstVisit = td.visited.size === 0;
  if (td.visited.has(shopName)) {
    return { ok: false, reason: 'Already visited this shop today.' };
  }
  td.visited.add(shopName);

  const results = { ok: true, firstVisit, events: [] };

  if (firstVisit) {
    const ev = drawDailyEvent(td);
    results.events.push({ type: 'TownDailyEvent', event: ev });
    // Haunted: first shop visited each day — Willpower 5+ or -1 Sanity (simplified effect here)
    if (isHaunted(td)) {
      const roll = willpowerRoll();
      const passed = roll >= 5;
      results.events.push({ type: 'HauntedCheck', roll, passed });
    }
  }
  return results;
}

export function lodge(td, heroId, where) {
  if (where === 'Hotel') { td.hotelGuests.add(heroId); td.campGuests.delete(heroId); }
  if (where === 'Camp') { td.campGuests.add(heroId); td.hotelGuests.delete(heroId); }
  return { ok: true };
}
