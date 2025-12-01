import React, { useState } from 'react';
import { townDailyEvents } from '../../data/townDailyEvents';

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

const TOWN_LOCATIONS = [
  'Blacksmith',
  'Church',
  'Saloon',
  'General Store',
  'Doc’s Office',
  'Sheriff’s Office',
  'Indian Trading Post',
  'Street Market',
  'Smuggler’s Den',
  'Mutant Quarter',
  'Frontier Outpost',
  'Gambling Hall',
  'Other'
];

// Each hero's location event result will be tracked separately
export default function TownVisitPanel({ posse = [] }) {
  const [locations, setLocations] = useState({});
  const [doneForDay, setDoneForDay] = useState({});
  const [deck, setDeck] = useState(shuffle([...townDailyEvents]));
  const [currentEvent, setCurrentEvent] = useState(null);
  const [discard, setDiscard] = useState([]);
  const [locationEvents, setLocationEvents] = useState({}); // new

  // Update selected location for a hero, auto-mark done, and auto-roll event
  const handleLocationChange = (heroName, location) => {
    setLocations(prev => ({ ...prev, [heroName]: location }));

    // Auto-mark as done
    setDoneForDay(prev => ({ ...prev, [heroName]: true }));

    // Draw a town daily event for this hero's visit
    let eventCard = null;
    if (deck.length === 0) {
      // If no cards left, reshuffle discard into deck first
      setDeck(shuffle([...discard]));
      setDiscard([]);
    }
    if (deck.length > 0) {
      eventCard = deck[0];
      setDeck(deck.slice(1));
      setDiscard(prev => [...prev, eventCard]);
      setLocationEvents(prev => ({ ...prev, [heroName]: eventCard }));
    }
  };

  const toggleDone = heroName => {
    setDoneForDay(prev => ({ ...prev, [heroName]: !prev[heroName] }));
  };

  const drawEvent = () => {
    if (deck.length === 0) {
      alert('No more daily events in the deck. Please reshuffle.');
      return;
    }
    const card = deck[0];
    setDeck(deck.slice(1));
    setCurrentEvent(card);
    setDiscard(prev => [...prev, card]);
  };

  const reshuffle = () => {
    setDeck(shuffle([...deck, ...discard]));
    setDiscard([]);
    setCurrentEvent(null);
    setLocationEvents({});
  };

  const allDone = posse.length > 0 && posse.every(h => doneForDay[h.name]);

  const startNextDay = () => {
    setLocations({});
    setDoneForDay({});
    setCurrentEvent(null);
    setDiscard([]);
    setDeck(shuffle([...townDailyEvents]));
    setLocationEvents({});
  };

  return (
    <div className="p-4 bg-white rounded shadow-md space-y-4">
      <h2 className="text-xl font-bold">Town Visit: Assign Locations</h2>
      {posse.map(hero => (
        <div key={hero.name} className="p-2 border rounded bg-gray-50 flex items-center gap-2 flex-wrap">
          <span className="font-semibold">{hero.name}</span>
          <select
            value={locations[hero.name] || ''}
            onChange={e => handleLocationChange(hero.name, e.target.value)}
            className="border p-1 rounded ml-2"
            disabled={doneForDay[hero.name]}
          >
            <option value="">-- Choose Location --</option>
            {TOWN_LOCATIONS.map(loc => (
              <option value={loc} key={loc}>{loc}</option>
            ))}
          </select>
          <button
            className={`btn btn-sm ml-2 ${doneForDay[hero.name] ? 'btn-success' : 'btn-outline'}`}
            onClick={() => toggleDone(hero.name)}
          >
            {doneForDay[hero.name] ? 'Done for Day' : 'Mark Done'}
          </button>
          {locationEvents[hero.name] && (
            <div className="ml-4 p-1 bg-gray-100 border rounded text-xs">
              <strong>{locationEvents[hero.name].name}:</strong> {locationEvents[hero.name].effect}
            </div>
          )}
        </div>
      ))}

      <div className="mt-4 flex gap-2">
        <button onClick={drawEvent} className="btn btn-success">Draw Town Daily Event</button>
        <button onClick={reshuffle} className="btn btn-warning">Reshuffle</button>
        {allDone && (
          <button onClick={startNextDay} className="btn btn-primary ml-2">Start Next Day</button>
        )}
      </div>

      {currentEvent && (
        <div className="mt-4 p-2 border rounded bg-gray-100">
          <p><strong>{currentEvent.name}</strong></p>
          <p>{currentEvent.effect}</p>
        </div>
      )}

      <div className="text-sm text-gray-600">
        Discard pile: {discard.length} cards &nbsp; | &nbsp; Cards remaining: {deck.length}
      </div>
    </div>
  );
}
