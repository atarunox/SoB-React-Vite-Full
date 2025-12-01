// src/screens/TownScreen.jsx
import React, { useState, useMemo } from 'react';
import { useHero } from '../context/HeroContext';
import { usePosse } from '../context/PosseContext';

// Shop data imports
import church from '../data/townLocations/church.js';
import gambling from '../data/townLocations/gamblingHall.js';
import saloon from '../data/townLocations/saloon.js';
import streetMarket from '../data/townLocations/streetMarket.js';
import frontierOutpost from '../data/townLocations/frontierOutpost.js';
import blacksmith from '../data/townLocations/blacksmith.js';
import sheriffOffice from '../data/townLocations/sheriffsOffice.js';
import indianTradingPost from '../data/townLocations/indianTradingPost.js';
import smugglerDen from '../data/townLocations/smugglersDen.js';
import generalStore from '../data/townLocations/generalStore.js';
import mutantQuarter from '../data/townLocations/mutantQuarter.js';

import GenericShop from './GenericShop.jsx';

const allTownLocations = [
  church,
  gambling,
  saloon,
  streetMarket,
  frontierOutpost,
  blacksmith,
  sheriffOffice,
  indianTradingPost,
  smugglerDen,
  generalStore,
  mutantQuarter,
];

const TownLocationCard = ({ location, onClick }) => (
  <div className="bg-white border rounded-lg p-4 shadow hover:shadow-md transition">
    <div
      onClick={() => onClick(location.id)}
      className="cursor-pointer hover:bg-yellow-100 -mx-4 -mt-4 px-4 pt-4 pb-2 rounded-t-lg transition"
    >
      <h3 className="text-lg font-bold text-gray-800">{location.name}</h3>
      {location.type && <p className="text-sm italic text-gray-600">{location.type}</p>}
    </div>
    {location.description && <p className="text-sm text-gray-700 mt-2">{location.description}</p>}
    {Array.isArray(location.rules) && location.rules.length > 0 && (
      <ul className="list-disc text-sm ml-5 mt-2 text-gray-700">
        {location.rules.map((rule, idx) => (
          <li key={idx}>{rule}</li>
        ))}
      </ul>
    )}
    {Array.isArray(location.events) && location.events.length > 0 && (
      <details className="mt-3">
        <summary className="text-sm font-medium text-gray-700 cursor-pointer">
          View Event Table
        </summary>
        <ul className="list-square ml-5 mt-1 text-sm text-gray-700">
          {location.events.map((event, idx) => (
            <li key={idx}>{event}</li>
          ))}
        </ul>
      </details>
    )}
  </div>
);

// Defaults for display and safe math
const defaultHeroResources = { gold: 0, darkStone: 0, scrap: 0, tech: 0 };

const TownScreen = ({ hero, updateHero }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  // fallbacks: allow parent to pass updateHero; otherwise use PosseContext
  const posseCtx = usePosse();
  const cloudUpdateHero = typeof updateHero === 'function' ? updateHero : posseCtx?.updateHero;

  // also mirror resource changes to active hero so StatsTab recomputes
  const { hero: activeHero, updateHero: updateActiveHero } = useHero();

  // Defensive guard for hero object
  if (!hero) {
    return <div className="p-4 text-center">No hero selected.</div>;
  }

  const heroId = hero.id || hero.localId;

  // Merge in resource defaults for display
  const displayHero = useMemo(
    () => ({
      ...hero,
      ...defaultHeroResources,
      gold: Number(hero.gold ?? 0),
      darkStone: Number(hero.darkStone ?? 0),
      scrap: Number(hero.scrap ?? 0),
      tech: Number(hero.tech ?? 0),
    }),
    [hero]
  );

  // Centralized saver: write to Firestore/Posse and mirror to active hero when same id
  const savePatch = (patch) => {
    if (!heroId) return;
    const payload = { id: heroId, ...patch, updatedAt: Date.now() };

    if (typeof cloudUpdateHero === 'function') cloudUpdateHero(payload);

    const activeId = activeHero?.id || activeHero?.localId;
    if (activeId && String(activeId) === String(heroId) && typeof updateActiveHero === 'function') {
      updateActiveHero(payload);
    }
  };

  // Gate logic: can only buy if this location is the one chosen for the day
  const isVisited = selectedLocation && displayHero.chosenLocation === selectedLocation;
  const canVisit = !displayHero.chosenLocation; // (optionally also check lodging if you require it)

  const handleVisit = (shopId) => {
    if (!canVisit) return;
    savePatch({ chosenLocation: shopId, isDone: true });
  };

  const handleClose = () => {
    setSelectedLocation(null);
  };

  const selectedLocMeta =
    selectedLocation ? allTownLocations.find(loc => loc.id === selectedLocation) : null;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-center">Frontier Town</h2>

      {/* Hero resource summary bar */}
      <div className="mb-2 text-center text-sm">
        Gold: {displayHero.gold} | Dark Stone: {displayHero.darkStone} | Scrap: {displayHero.scrap} | Tech: {displayHero.tech}
      </div>

      {!selectedLocation ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allTownLocations.map((loc, idx) => (
            <TownLocationCard key={loc.id ?? idx} location={loc} onClick={setSelectedLocation} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top bar with title + actions (Visit / Close) */}
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xl font-bold">
                {selectedLocMeta?.name || 'Shop'}
                {isVisited && <span className="ml-2 text-green-600 text-sm">(Chosen)</span>}
              </div>
              {selectedLocMeta?.description && (
                <div className="text-sm text-gray-700 mt-1">{selectedLocMeta.description}</div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm font-medium"
                onClick={handleClose}
              >
                Close
              </button>
              {!isVisited && (
                <button
                  className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                  onClick={() => handleVisit(selectedLocation)}
                  disabled={!canVisit}
                  title={!canVisit ? 'You already chose a location today.' : ''}
                >
                  Visit
                </button>
              )}
            </div>
          </div>

          {/* Optional: show location rules */}
          {!!(selectedLocMeta?.rules?.length) && (
            <ul className="list-disc text-sm ml-5 text-gray-700">
              {selectedLocMeta.rules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          )}

          {/* GenericShop gets a readOnly flag; inside, disable Buy buttons when readOnly */}
          <GenericShop
            shopKey={selectedLocation}
            title={selectedLocMeta?.name || 'Shop'}
            hero={displayHero}
            updateHero={savePatch}
            readOnly={!isVisited}
          />

          {/* Back link */}
          <button
            onClick={() => setSelectedLocation(null)}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm font-medium"
          >
            ← Back to Town
          </button>
        </div>
      )}
    </div>
  );
};

export default TownScreen;
