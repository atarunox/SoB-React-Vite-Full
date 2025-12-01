import React, { useEffect, useState } from 'react';
import {
  applyCardModifiers,
  clearModifiers,
  getActiveModifiers
} from './dynamicModifiers'; // must be local-only

export default function DMTools({ cards = [] }) {
  const [active, setActive] = useState(getActiveModifiers());

  useEffect(() => {
    // No Firestore; load from local memory
    setActive(getActiveModifiers());
  }, []);

  const handlePlayCard = (card) => {
    applyCardModifiers(card);
    setActive(getActiveModifiers());
  };

  const handleClear = () => {
    clearModifiers();
    setActive(getActiveModifiers());
  };

  return (
    <div className="p-4 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold">DM Modifier Tools</h2>

      <button onClick={handleClear} className="btn btn-error mb-2">
//         Reset Modifiers
      </button>

      <div>
        <h3 className="font-semibold">Active Modifiers</h3>
        <pre className="bg-gray-100 p-2 text-sm overflow-auto max-h-60 rounded">
          {JSON.stringify(active, null, 2)}
        </pre>
      </div>

      <div>
        <h3 className="font-semibold">Play a Card</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {cards.map((card, idx) => (
            <button
              key={idx}
              onClick={() => handlePlayCard(card)}
              className="btn btn-primary"
            >
//               Play: {card.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
