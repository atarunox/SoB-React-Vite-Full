// src/components/DM/LocationEventPanel.jsx
import React from 'react';
import {
  ensureEventRolled,
  getEventState,
  setEventRoll,
  clearEvent,
  resolveEvent,
} from '../../utils/locationEventsEngine';
import { getEventDisplay } from '../../utils/locationEventText';
import LocationEventRollInput from './LocationEventRollInput';

// Import location data solely to enumerate ids + friendly names
import campSite from '../../data/townLocations/campSite.js';
import frontierOutpost from '../../data/townLocations/frontierOutpost.js';
import gamblingHall from '../../data/townLocations/gamblingHall.js';
import generalStore from '../../data/townLocations/generalStore.js';
import indianTradingPost from '../../data/townLocations/indianTradingPost.js';
import mutantQuarter from '../../data/townLocations/mutantQuarter.js';
import sheriffsOffice from '../../data/townLocations/sheriffsOffice.js';
import docsOffice from '../../data/townLocations/docsOffice.js';
import church from '../../data/townLocations/church.js';

// extras
import blacksmith from '../../data/townLocations/blacksmith.js';
import saloon from '../../data/townLocations/saloon.js';
import smugglersDen from '../../data/townLocations/smugglersDen.js';
import streetMarket from '../../data/townLocations/streetMarket.js';

const LOCATIONS = [
  { id: campSite.id,           name: campSite.name || 'Camp Site' },
  { id: frontierOutpost.id,    name: frontierOutpost.name || 'Frontier Outpost' },
  { id: gamblingHall.id,       name: gamblingHall.name || 'Gambling Hall' },
  { id: generalStore.id,       name: generalStore.name || 'General Store' },
  { id: indianTradingPost.id,  name: indianTradingPost.name || 'Indian Trading Post' },
  { id: mutantQuarter.id,      name: mutantQuarter.name || 'Mutant Quarter' },
  { id: sheriffsOffice.id,     name: sheriffsOffice.name || "Sheriff's Office" },
  { id: docsOffice.id,         name: docsOffice.name || "Doc's Office" },
  { id: church.id,             name: church.name || 'Church' },

  // extras
  { id: blacksmith.id,         name: blacksmith.name || 'Blacksmith' },
  { id: saloon.id,             name: saloon.name || 'Saloon' },
  { id: smugglersDen.id,       name: smugglersDen.name || "Smuggler's Den" },
  { id: streetMarket.id,       name: streetMarket.name || 'Street Market' },
];

export default function LocationEventPanel({ posseApi, uiApi }) {
  const [version, setVersion] = React.useState(0); // bump to refresh list after actions

  // Pre-roll everything once (optional) so rows render with titles immediately
  React.useEffect(() => {
    LOCATIONS.forEach(({ id }) => ensureEventRolled(id));
    setVersion(v => v + 1);
  }, []);

  const refresh = () => setVersion(v => v + 1);

  const onReroll = (shopId) => {
    clearEvent(shopId);
    ensureEventRolled(shopId);
    refresh();
  };

  const onResolve = async (shopId) => {
    try {
      await resolveEvent(shopId, { posseApi, uiApi });
      uiApi?.toast?.('Event applied.');
      refresh();
    } catch (e) {
      console.error(e);
      uiApi?.toast?.(`Failed to apply: ${e?.message || 'Unknown error'}`);
    }
  };

  const onClear = (shopId) => {
    clearEvent(shopId);
    refresh();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Location Events</h2>

      <div className="overflow-x-auto rounded-2xl border bg-white/80">
        <table className="table w-full">
          <thead>
            <tr>
              <th className="text-left">Location</th>
              <th className="text-left w-28">Roll</th>
              <th className="text-left">Title</th>
              <th className="text-left">Lore</th>
              <th className="text-left">Effect</th>
              <th className="text-right w-64">Actions</th>
            </tr>
          </thead>
          <tbody>
            {LOCATIONS.map(({ id, name }) => {
              const rec = getEventState(id) || ensureEventRolled(id);
              const fallback = getEventDisplay(id, rec?.roll || 7) || {};
              const title  = rec?.title  || fallback.title  || 'Location Event';
              const lore   = rec?.lore   ?? fallback.lore   ?? '';
              const effect = rec?.effect || fallback.effect || '';
              const roll   = rec?.roll ?? '';

              return (
                <tr key={id} className="align-top">
                  <td className="font-medium">{name}</td>
                  <td>
                    <LocationEventRollInput
   shopId={id}
   className="input input-bordered w-24"
   onCommit={(n) => {
     // defensive: allow child to just report the chosen value;
     // in case the child didn't set it, we set it here.
     if (Number.isFinite(Number(n))) setEventRoll(id, Number(n));
     refresh();
     uiApi?.toast?.(`Set ${name} roll to ${n}.`);
   }}
 />
                    <div className="text-[10px] text-gray-500 mt-1">2–12</div>
                  </td>
                  <td className="whitespace-pre-wrap">{title}</td>
                  <td className="whitespace-pre-wrap italic text-gray-600">{lore}</td>
                  <td className="whitespace-pre-wrap">{effect}</td>
                  <td className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        className="btn btn-sm"
                        onClick={() => onReroll(id)}
                        title="Reroll (random 2d6)"
                      >
                        Reroll
                      </button>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => onResolve(id)}
                        title="Apply this event’s effects"
                      >
                        Resolve
                      </button>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => onClear(id)}
                        title="Clear from cache (no event until re-rolled)"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">rolled: {roll || '—'}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-gray-500">
        Tip: type a number in the Roll field and press <b>Enter</b> (or unfocus) to set it. Use <b>Resolve</b> to run the handler for that location using the shown roll.
      </div>
    </div>
  );
}
