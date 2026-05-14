import React, { useState } from 'react';
import { WORLD_CARDS } from '../../data/worldCards';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function WorldDrawer({ setWorld, onChange, value, compact }) {
  const [deck, setDeck] = useState(shuffle([...WORLD_CARDS]));
  const [current, setCurrent] = useState(null);

  // Accept either setWorld or onChange prop
  const notify = onChange ?? setWorld;

  function drawWorld() {
    let currentDeck = deck;
    if (currentDeck.length === 0) {
      currentDeck = shuffle([...WORLD_CARDS]);
    }
    const next = currentDeck[0];
    setCurrent(next);
    setDeck(currentDeck.slice(1));
    if (typeof notify === 'function' && next?.name) {
      notify(next.name);
    }
  }

  // The card to display: use drawn card if it matches the current world,
  // otherwise look up the externally-set world so the card stays in sync.
  const displayCard = current?.name === value
    ? current
    : (value ? WORLD_CARDS.find((c) => c.name === value) ?? current : current);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button onClick={drawWorld} className="btn btn-sm btn-primary">
          Draw World
        </button>
        {displayCard && (
          <span className="text-sm font-semibold">{displayCard.name}</span>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded shadow-md space-y-4">
      <h2 className="text-xl font-bold">World Deck</h2>
      <button onClick={drawWorld} className="btn btn-primary">Draw World</button>

      {displayCard && (
        <div className="border p-3 rounded bg-blue-100">
          <h3 className="text-lg font-bold">{displayCard.name}</h3>
          <p><strong>Type:</strong> {displayCard.worldType}</p>
          {displayCard.weather && <p><strong>Weather:</strong> {displayCard.weather}</p>}
          <p><strong>Effect:</strong> {displayCard.effect}</p>
          {displayCard.lootNote && <p><strong>Loot:</strong> {displayCard.lootNote}</p>}
        </div>
      )}
    </div>
  );
}
