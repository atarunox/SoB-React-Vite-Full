import React, { useState } from 'react';
import { WORLD_CARDS } from '../../data/worldCards';

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

export default function WorldDrawer({ setWorld }) {
  const [deck, setDeck] = useState(shuffle([...WORLD_CARDS]));
  const [current, setCurrent] = useState(null);

  function drawWorld() {
    if (deck.length === 0) return;
    const next = deck[0];
    setCurrent(next);
    setDeck(deck.slice(1));
    if (typeof setWorld === 'function' && next?.name) {
      setWorld(next.name); // <- updates the top-level World selector
    }
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
