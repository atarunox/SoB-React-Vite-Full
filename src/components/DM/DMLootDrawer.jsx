import React, { useState, useEffect } from 'react';
import { lootDeck } from '../../data/loot/lootDeck';
import { wastelandLootDeck } from '../../data/loot/wastelandLootDeck';

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

export default function DMLootDrawer({ world = 'Mines', posse = [] }) {
  // Determine which loot deck to use
  const deckToUse = (world === 'Blasted Wastes' || world === 'Canyons') ? wastelandLootDeck : lootDeck;

  const [deck, setDeck] = useState([]);
  const [lootPool, setLootPool] = useState([]);

  useEffect(() => {
    setDeck(shuffle([...deckToUse]));
    setLootPool([]);
  }, [world]);

  const drawLootForPosse = () => {
    if (!posse.length || deck.length < posse.length) return;
    const drawn = deck.slice(0, posse.length);
    setLootPool([...lootPool, ...drawn]);
    setDeck(deck.slice(posse.length));
  };

  const claimLoot = (itemIdx, hero) => {
    // Remove from loot pool, assign to hero (real app: update hero inventory!)
    const [claimed] = lootPool.splice(itemIdx, 1);
    setLootPool([...lootPool]);
    // Assign logic goes here
    alert(`${hero.name} claimed ${claimed.name || claimed.type}`);
  };

  const reset = () => {
    setDeck(shuffle([...deckToUse]));
    setLootPool([]);
  };

  return (
    <div className="p-4 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold">Loot Drawer ({world})</h2>
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={drawLootForPosse}>
          Draw Loot for Posse ({posse.length} cards)
        </button>
        <button className="btn btn-secondary" onClick={reset}>Reset Deck</button>
      </div>
      {lootPool.length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold">Shared Loot Pool:</h4>
          <ul className="list-disc list-inside">
            {lootPool.map((item, idx) => (
              <li key={idx}>
                <span className="font-bold">{item.name || item.type}</span>
                <span className="ml-2 text-xs italic">{item.effect}</span>
                {posse.length > 0 && (
                  <span className="ml-4">
                    <select onChange={e => claimLoot(idx, posse.find(h => h.localId === e.target.value))}>
                      <option value="">Assign to...</option>
                      {posse.map(h => (
                        <option key={h.localId} value={h.localId}>{h.name}</option>
                      ))}
                    </select>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
