import React, { useState, useEffect } from 'react';
import DrawerOverlay from './DrawerOverlay';
import DrawnMapTilesRow from './DrawnMapTilesRow';
import { mineCards } from '../../data/maps/mineCards';
import { blastedWastesCards } from '../../data/maps/blastedWastesCards';
import { blastedWastesEncounters } from '../../data/encounters/wastesEncounters';
import { canyonEncounters } from '../../data/encounters/canyonEncounters';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const WORLD_TO_MAP_CARDS = {
  Mines: mineCards,
  'Blasted Wastes': blastedWastesCards,
};

const WORLD_TO_ENCOUNTERS = {
  'Blasted Wastes': blastedWastesEncounters,
  'Canyons': canyonEncounters,
};

function computeRemainingDeck(allCards, drawn) {
  const drawnNames = new Set((drawn || []).map(t => t.name));
  return allCards.filter(c => !drawnNames.has(c.name));
}

export default function DMMapDrawer({ world = 'Mines' }) {
  const [deck, setDeck] = useState([]);
  const [drawn, setDrawn] = useState([]);
  const [enlarged, setEnlarged] = useState(null); // {tile, encounter}

  const encounters = WORLD_TO_ENCOUNTERS[world] || [];
  const LS_KEY = `sob_mapDrawerState_${world}`;

  // --- Load from storage on mount/world change
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      try {
        const { drawn: d = [], deck: k = [] } = JSON.parse(stored) || {};
        setDrawn(Array.isArray(d) ? d : []);
        setDeck(Array.isArray(k) ? k : []);
      } catch {
        // If parse fails, rebuild a fresh deck (keeping drawn empty)
        const cards = WORLD_TO_MAP_CARDS[world] || mineCards;
        setDeck(shuffle(cards));
        setDrawn([]);
      }
    } else {
      const cards = WORLD_TO_MAP_CARDS[world] || mineCards;
      setDeck(shuffle(cards));
      setDrawn([]);
    }
    setEnlarged(null); // Always close overlay on world/tab switch
  }, [world]);

  // --- Save to storage whenever deck/drawn change
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ drawn, deck }));
  }, [drawn, deck, LS_KEY]);

  const drawCard = () => {
    setDeck(prevDeck => {
      if (prevDeck.length === 0) return prevDeck;
      return prevDeck.slice(1);
    });
    setDrawn(prevDrawn => {
      const currentDeck = deck;
      if (currentDeck.length === 0) return prevDrawn;
      return [currentDeck[0], ...prevDrawn];
    });
  };

  // Shuffle remaining deck ONLY (keep drawn as-is)
  const shuffleRemaining = () => {
    setDeck(prev => shuffle(prev));
  };

  // Rebuild deck from full card list minus already drawn (keep drawn)
  const resetDeck = () => {
    const all = WORLD_TO_MAP_CARDS[world] || mineCards;
    const remaining = computeRemainingDeck(all, drawn);
    setDeck(shuffle(remaining));
    // IMPORTANT: do NOT clear drawn here — they persist until explicitly cleared
  };

  // Clear drawn tiles and rebuild a full fresh deck
  const clearMap = () => {
    const all = WORLD_TO_MAP_CARDS[world] || mineCards;
    setDrawn([]);
    setDeck(shuffle(all));
    setEnlarged(null);
    // Only the *clear* action wipes the saved state
    localStorage.removeItem(LS_KEY);
  };

  // Attach encounter to each tile (derived; not persisted)
  const drawnWithEncounters = drawn.map(tile => {
    const matchingEncounter = tile.advancedEncounter
      ? encounters.find(e => e.name.trim() === tile.advancedEncounter.name.trim())
      : null;
    return { ...tile, encounter: matchingEncounter };
  });

  const handleEnlarge = (tile) => {
    setEnlarged({ tile, encounter: tile.encounter });
  };

  return (
    <>
      <div className="p-4 bg-white rounded shadow space-y-4">
        <h2 className="text-xl font-bold">Map Drawer ({world})</h2>

        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={drawCard}>
            Draw Map Card
          </button>
          <button className="btn btn-secondary" onClick={shuffleRemaining}>
            Shuffle Remaining
          </button>
          <button className="btn btn-outline" onClick={resetDeck}>
            Reset Deck (keep drawn)
          </button>
          <button className="btn btn-danger" onClick={clearMap}>
            Clear Map
          </button>
        </div>

        <DrawnMapTilesRow
          tiles={drawnWithEncounters}
          encounters={encounters}
          onEnlarge={handleEnlarge}
        />
      </div>

      {enlarged && (
        <DrawerOverlay
          open={!!enlarged}
          onClose={() => setEnlarged(null)}
          title={enlarged.tile.name}
        >
          <div className="flex flex-col items-center space-y-4 p-2">
            <img
              src={enlarged.tile.image}
              alt={enlarged.tile.name}
              className="w-full max-w-lg rounded shadow"
              style={{ maxHeight: '60vh', objectFit: 'contain' }}
            />
            {enlarged.encounter && (
              <div
                className="w-full max-w-[480px] border-2 border-yellow-300 bg-yellow-100/90 shadow-lg rounded-xl p-4 mb-4"
                style={{
                  backgroundImage:
                    "url(/assets/parchment-texture.png), linear-gradient(180deg,#fffbe6 70%,#f8e9b7 100%)",
                  backgroundBlendMode: "multiply",
                  backgroundSize: "cover",
                  backgroundRepeat: "repeat",
                  borderColor: "#f4d774"
                }}
              >
                <h3 className="text-lg font-bold mb-2 text-yellow-900 drop-shadow">
                  Advanced Encounter: {enlarged.encounter.name}
                </h3>
                {enlarged.encounter.flavor && (
                  <p className="italic text-gray-700 mb-2 text-sm">{enlarged.encounter.flavor}</p>
                )}
                {enlarged.encounter.test && typeof enlarged.encounter.test === 'object' ? (
                  <div className="mb-2 p-2 bg-white/60 rounded border border-gray-200">
                    <p className="font-semibold text-sm">{enlarged.encounter.test.stat} {enlarged.encounter.test.target}</p>
                    {enlarged.encounter.test.success?.length > 0 && (
                      <div className="mt-1">
                        <span className="text-green-700 text-xs font-bold">SUCCESS: </span>
                        {enlarged.encounter.test.success.join('; ')}
                      </div>
                    )}
                    {enlarged.encounter.test.fail?.length > 0 && (
                      <div className="mt-1">
                        <span className="text-red-700 text-xs font-bold">FAIL: </span>
                        {enlarged.encounter.test.fail.join('; ')}
                      </div>
                    )}
                  </div>
                ) : enlarged.encounter.test ? (
                  <div className="mb-2"><strong>Test:</strong> {enlarged.encounter.test}</div>
                ) : null}
                {enlarged.encounter.effect && (
                  <div className="mb-2 text-gray-900">
                    <strong>Effect:</strong> {enlarged.encounter.effect}
                  </div>
                )}
                {enlarged.encounter.effects?.length > 0 && (
                  <ul className="list-disc list-inside text-sm mb-2">
                    {enlarged.encounter.effects.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>
        </DrawerOverlay>
      )}
    </>
  );
}
