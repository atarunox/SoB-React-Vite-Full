import React, { useMemo, useState } from 'react';
import { townTraits } from '../../data/townTraitsChart';
import { createTownDay, serializeTownDay, startNewDay, visitShop, lodge } from '../../rules/townRules';

export default function TownVisitPanel({ shops = [] }) {
  const [lodgings, setLodgings] = useState({}); // heroId -> 'Hotel' | 'Camp'
  const [shopsOpen, setShopsOpen] = useState(() => Object.fromEntries(shops.map(s => [s, true])));
  const [dailyEvent, setDailyEvent] = useState(null);

  const toggleShop = (name) => setShopsOpen(prev => ({ ...prev, [name]: !prev[name] }));

  const endOfDay = () => {
    // clear lodgings for next day, draw daily event
    const ev = townDailyEvents[Math.floor(Math.random()*townDailyEvents.length)];
    setDailyEvent(ev);
    setLodgings({});
  };

  return (
    <div className="p-3 border rounded space-y-3">
      <h3 className="font-semibold">Town Visit</h3>
      <div className="flex flex-wrap gap-2">
        {shops.map(name => (
          <label key={name} className="flex items-center gap-1 border rounded px-2 py-1">
            <input type="checkbox" checked={!!shopsOpen[name]} onChange={() => toggleShop(name)} />
            <span>{name}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-2">
        <button className="border rounded px-2 py-1" onClick={endOfDay}>End of Day (Draw Daily Event)</button>
      </div>

      {dailyEvent && (
        <div className="p-2 rounded border">
          <div className="font-medium">{dailyEvent.name}</div>
          <div className="text-sm opacity-80">{dailyEvent.effect}</div>
        </div>
      )}
    </div>
  );
}
