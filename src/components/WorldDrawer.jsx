import React, { useState } from 'react';
import { WORLD_CARDS } from '../../data/worldCards';

// Shuffle helper
function shuffle(array) {
  // Fisher-Yates shuffle, robust for React state
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function WorldDrawer() {
  const [deck, setDeck] = useState(shuffle([...WORLD_CARDS]));
  const [current, setCurrent] = useState(null);

  function drawWorld() {
    let currentDeck = deck;
    if (currentDeck.length === 0) {
      currentDeck = shuffle([...WORLD_CARDS]);
    }
    setCurrent(currentDeck[0]);
    setDeck(currentDeck.slice(1));
  }

  return (
    <div className="p-4 bg-white rounded shadow-md space-y-4">
      <h2 className="text-xl font-bold">World Deck</h2>
      <button onClick={drawWorld} className="btn btn-primary">Draw World</button>

      {current && (
        <div className="border p-3 rounded bg-blue-100">
          <h3 className="text-lg font-bold">{current.name}</h3>
          <p><strong>Type:</strong> {current.worldType}</p>
          {current.weather && <p><strong>Weather:</strong> {current.weather}</p>}
          <p><strong>Effect:</strong> {current.effect}</p>
          {current.lootNote && <p><strong>Loot:</strong> {current.lootNote}</p>}
        </div>
      )}
    </div>
  );
}
