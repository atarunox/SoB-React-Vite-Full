import React, { useState, useEffect } from 'react';
import { mineEncounters } from '../../data/encounters/mineEncounters';
import { blastedWastesEncounters } from '../../data/encounters/wastesEncounters';

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const WORLD_TO_ENCOUNTER_CARDS = {
  Mines: mineEncounters,
  "Blasted Wastes": blastedWastesEncounters,
};

// Prefer explicit .target; else infer from test/effect text.
function classifyTarget(enc = {}) {
  const explicit = String(enc.target || '').trim();
  if (explicit) return explicit; // show exactly what the card defines

  const hay = `${enc.test || ''} ${enc.effect || ''}`.toLowerCase();

  if (/each hero ending move/.test(hay)) return 'Each Hero ending move';
  if (/each hero|every hero|all heroes/.test(hay)) return 'Each Hero';
  if (/random hero/.test(hay)) return 'Random Hero';
  if (/chosen hero|one hero|a hero may|any hero/.test(hay)) return 'One Hero';

  // Weather/global style effects that usually apply to everyone
  if (enc.remainsInPlay && /(weather|start of each turn|while in\b)/.test(hay)) {
    return 'All Heroes';
  }

  return 'Unspecified';
}

export default function DMEncounterDrawer({ world = 'Mines' }) {
  const [deck, setDeck] = useState([]);
  const [current, setCurrent] = useState(null);
  const [discard, setDiscard] = useState([]);

  useEffect(() => {
    const cards = WORLD_TO_ENCOUNTER_CARDS[world] || mineEncounters;
    setDeck(shuffle([...cards]));
    setCurrent(null);
    setDiscard([]);
  }, [world]);

  const drawCard = () => {
    if (deck.length === 0) return;
    setCurrent(deck[0]);
    setDeck(deck.slice(1));
  };

  const discardCard = () => {
    if (!current) return;
    setDiscard([current, ...discard]);
    setCurrent(null);
  };

  const reset = () => {
    const cards = WORLD_TO_ENCOUNTER_CARDS[world] || mineEncounters;
    setDeck(shuffle([...cards]));
    setCurrent(null);
    setDiscard([]);
  };

  const targetType = current ? classifyTarget(current) : "";

  return (
    <div className="p-4 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold">Encounter Drawer ({world})</h2>
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={drawCard}>Draw Encounter</button>
        <button className="btn btn-secondary" onClick={reset}>Reset Deck</button>
      </div>

      {current && (
        <div className="mt-4 border p-4 rounded bg-yellow-50 border-yellow-300 shadow">
          <h3 className="text-lg font-bold">{current.name}</h3>
          {current.flavor && (
            <p className="italic text-gray-600 mb-2">{current.flavor}</p>
          )}
          {current.test && (
            <p><strong>Test:</strong> {current.test}</p>
          )}
          <p><strong>Effect:</strong> {current.effect}</p>
          <p className="mt-2"><strong>Target:</strong> {targetType}</p>
          {current.remainsInPlay && (
            <p className="text-sm text-blue-500 mt-1 italic">Remains in Play</p>
          )}
          <button className="btn btn-secondary mt-2" onClick={discardCard}>Discard</button>
        </div>
      )}

      {discard.length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold">Discarded Encounters:</h4>
          <ul className="list-disc list-inside">
            {discard.map((card, idx) => (
              <li key={idx}>
                <span className="font-bold">{card.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
