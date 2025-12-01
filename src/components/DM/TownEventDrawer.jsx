import React, { useState } from 'react';
import { townDailyEvents } from '../../data/townDailyEvents';

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

export default function TownEventDrawer() {
  const [deck, setDeck] = useState(shuffle([...townDailyEvents]));
  const [drawn, setDrawn] = useState(null);
  const [activeEvents, setActiveEvents] = useState([]);

  function drawEvent() {
    if (deck.length === 0) return;
    const card = deck[0];
    setDrawn(card);
    setDeck(deck.slice(1));
    if (card.type === 'instant') {
      setActiveEvents(prev => [...prev, card]);
      setDrawn(null);
    }
  }

  function activateLastingEvent() {
    if (drawn && drawn.type === 'lasting') {
      setActiveEvents(prev => [...prev, drawn]);
      setDrawn(null);
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow-md space-y-4">
      <h2 className="text-xl font-bold">Town Daily Event Deck</h2>
      <button onClick={drawEvent} className="btn btn-primary">Draw Event</button>

      {drawn && (
        <div className="border p-3 rounded bg-yellow-100">
          <h3 className="text-lg font-bold">{drawn.name}</h3>
          <p className="italic">{drawn.flavorText}</p>
          <p><strong>Effect:</strong> {drawn.effect}</p>
          {drawn.type === 'lasting' && (
            <button onClick={activateLastingEvent} className="btn btn-success mt-2">Mark as Active</button>
          )}
        </div>
      )}

      {activeEvents.length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold">Ongoing Town Effects:</h4>
          <ul className="list-disc list-inside">
            {activeEvents.map(card => (
              <li key={card.id || card.name}><strong>{card.name}</strong>: {card.effect}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
