import React, { useState, useEffect } from 'react';
import { travelHazardChart } from '../../data/charts/travelHazardChart';
import { townDailyEvents } from '../../data/townDailyEvents';
import { townLocationEvents } from '../../data/townLocationEvents'; // Should be a mapping: { [location]: [event objects] }

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function filterByNumber(list, query) {
  if (!query) return list;
  return list.filter(item => `${item.id}`.includes(query));

}

export default function TownToolsDMTab({ posse = [], updateHero, world = 'Mines', locations = {}, updateLocations }) {
  // --- Travel Hazards ---
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState({});
  const [hazards, setHazards] = useState(travelHazardChart);

  // --- Daily Event Deck ---
  const [eventDeck, setEventDeck] = useState(shuffle([...townDailyEvents]));
  const [dailyEvent, setDailyEvent] = useState(null);

  // --- End-of-Day State ---
  const [showHotelCampPrompt, setShowHotelCampPrompt] = useState(false);
  const [heroStays, setHeroStays] = useState({}); // {heroId: 'Hotel' or 'Camp'}

  // --- Draw daily event card ---
  const drawDailyEvent = () => {
    if (eventDeck.length === 0) {
      setEventDeck(shuffle([...townDailyEvents]));
    }
    setDailyEvent(eventDeck[0]);
    setEventDeck(eventDeck.slice(1));
  };

  // --- Handle Hotel/Camp for each hero ---
  const handleSetStay = (hero, stay) => {
    setHeroStays(prev => ({ ...prev, [hero.localId]: stay }));
  };
  const confirmHotelCamp = () => {
    // Attach to each hero and reset for next day
    posse.forEach(hero => {
      updateHero({ ...hero, stay: heroStays[hero.localId] || 'Hotel' });
    });
    setShowHotelCampPrompt(false);
    setHeroStays({});
  };

  // --- End Day Logic ---
  const endDay = () => {
    // Clear hero locations
    if (updateLocations) updateLocations({});
    setShowHotelCampPrompt(true);
    drawDailyEvent();
    // Unwanted attention could be cleared here if rules specify
  };

  // --- Unwanted Attention markers ---
  const getUnwantedAttention = hero =>
    (hero.unwantedAttentionMarkers || 0);

  // --- Collapsible helpers ---
  const toggle = key => setOpen(prev => ({ ...prev, [key]: !prev[key] }));

  // --- Where heroes are and events ---
  const locationNames = Object.keys(locations || {});
  return (
    <div className="p-4">
      <h2 className="font-bold mb-4">Town DM Tools</h2>

      {/* Travel Hazards */}
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <input
            type="text"
            className="input input-sm"
            placeholder="Search hazard number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="btn btn-xs ml-2" onClick={() => setSearch('')}>Clear</button>
        </div>
        <button className="btn btn-xs" onClick={() => toggle('hazards')}>
          {open.hazards ? 'Hide' : 'Show'} Travel Hazards ({filterByNumber(hazards, search).length})
        </button>
        {open.hazards && (
          <ul className="list-decimal ml-6 max-h-48 overflow-auto">
            {filterByNumber(hazards, search).map(hz => (
              <li key={hz.id}><strong>{hz.id}: {hz.name}</strong> — {hz.effect}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Town Daily Event */}
      <div className="mb-4">
        <button className="btn btn-primary btn-sm" onClick={drawDailyEvent}>Draw Town Daily Event</button>
        {dailyEvent && (
          <div className="border rounded p-2 mt-2 bg-blue-50">
            <strong>{dailyEvent.name}</strong>: {dailyEvent.effect}
          </div>
        )}
      </div>

      {/* Heroes at Locations */}
      <div className="mb-4">
        <h3 className="font-bold">Hero Locations:</h3>
        <ul>
          {posse.map(hero => (
            <li key={hero.localId}>
              <strong>{hero.name}</strong> — <span>{locations[hero.localId] || 'None'}</span>
              {getUnwantedAttention(hero) > 0 && (
                <span className="ml-2 text-xs text-red-600">
                  [Unwanted Attention: {getUnwantedAttention(hero)}]
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Location Events */}
<div className="mb-4">
  <h3 className="font-bold">Current Location Events:</h3>
  <ul>
    {locationNames.map(loc => {
      const locEvents = townLocationEvents[loc];
      if (!locEvents)
        return (
          <li key={loc} className="mb-1">
            <strong>{loc}</strong>: <span className="text-gray-500 italic">No event data</span>
          </li>
        );
      // Support both array and object export
      if (Array.isArray(locEvents)) {
        return (
          <li key={loc} className="mb-1">
            <strong>{loc}</strong>:
            <ul className="list-disc ml-5">
              {locEvents.map((event, i) => (
                <li key={i}>
                  {(event.name || event.result || `Option ${i+1}`) + ': ' + (event.effect || event.event)}
                </li>
              ))}
            </ul>
          </li>
        );
      }
      // Single object export
      return (
        <li key={loc} className="mb-1">
          <strong>{loc}</strong>: {(locEvents.name || locEvents.result) + ': ' + (locEvents.effect || locEvents.event)}
        </li>
      );
    })}
  </ul>
</div>


      {/* End of Day */}
      <div className="mb-4">
        <button className="btn btn-accent" onClick={endDay}>End Day (reset shops/events/daily)</button>
      </div>

      {/* Hotel/Camp Assignment */}
      {showHotelCampPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded p-4 w-96 shadow-xl">
            <h3 className="font-bold mb-2">Where does each hero stay?</h3>
            {posse.map(hero => (
              <div key={hero.localId} className="flex justify-between items-center mb-2">
                <span>{hero.name}</span>
                <select
                  className="input input-sm"
                  value={heroStays[hero.localId] || 'Hotel'}
                  onChange={e => handleSetStay(hero, e.target.value)}
                >
                  <option value="Hotel">Hotel</option>
                  <option value="Camp">Camp</option>
                </select>
              </div>
            ))}
            <button className="btn btn-success btn-sm mt-3" onClick={confirmHotelCamp}>Confirm</button>
          </div>
        </div>
      )}
    </div>
  );
}
