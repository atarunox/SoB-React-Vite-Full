
import React, { useEffect, useState } from 'react';
import { getWorldFolder } from '../../utils/worldLoader';
import { useWorld } from '../../context/WorldContext';

export default function DMThreatDrawer() {
  const { world } = useWorld();
  const [cards, setCards] = useState([]);

  useEffect(() => {
    async function loadCards() {
      try {
        const path = getWorldFolder(world);
        const data = await import(`${path}/threatDeck/threatDeck.js`);
        setCards(data.default || []);
      } catch (err) {
        console.error('Failed to load threat deck for', world, err);
      }
    }
    loadCards();
  }, [world]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Threat Deck - {world}</h2>
      <ul className="space-y-2">
        {cards.map((card, i) => (
          <li key={i} className="border p-2 rounded bg-white shadow">
            <strong>{card.name}</strong>: {card.effect}
          </li>
        ))}
      </ul>
    </div>
  );
}
