import React from "react";
import { DARKNESS_CARDS } from "../../data/darknessCards";
import { useCombatState } from "../../hooks/useCombatState";

function shuffleFY(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function extractEnemyModifiers(card) {
  if (!card || !card.tags || !card.effect) return {};
  const mods = {};
  if (card.tags.includes("Boost")) {
    const keyword = card.tags.find(t => t !== "Darkness" && t !== "Boost");
    if (!keyword) return mods;
    const effect = card.effect;
    const statPattern = /[+-](\d+)\s+(Initiative|Health|Combat|Defense|Damage|Move|Shots)/gi;
    let match;
    while ((match = statPattern.exec(effect)) !== null) {
      const val = parseInt(match[1]);
      const stat = match[2].toLowerCase();
      if (!mods[keyword]) mods[keyword] = {};
      mods[keyword][stat] = (mods[keyword][stat] || 0) + val;
    }
  }
  return mods;
}

export default function DMDarknessDrawer({ world = "Mines" }) {
  const {
    darknessDeck, setDarknessDeck,
    darknessHeld, setDarknessHeld,
    darknessActive, setDarknessActive,
    addToHand,
  } = useCombatState();

  // Queue for drawing multiple cards and resolving them 1 by 1
  const [drawQueue, setDrawQueue] = React.useState([]);
  const [current, setCurrent] = React.useState(null);

  // Draw a single card (or add to queue if one is already showing)
  const drawCard = () => {
    if (darknessDeck.length === 0) return;
    const card = darknessDeck[0];
    setDarknessDeck(darknessDeck.slice(1));
    if (current) {
      // Already viewing a card - queue this one
      setDrawQueue(prev => [...prev, card]);
    } else {
      setCurrent(card);
    }
  };

  // Draw multiple cards at once (e.g., "Draw D3 Darkness")
  const drawMultiple = (count) => {
    const available = Math.min(count, darknessDeck.length);
    if (available === 0) return;
    const drawn = darknessDeck.slice(0, available);
    setDarknessDeck(darknessDeck.slice(available));
    if (current) {
      setDrawQueue(prev => [...prev, ...drawn]);
    } else {
      setCurrent(drawn[0]);
      if (drawn.length > 1) setDrawQueue(prev => [...prev, ...drawn.slice(1)]);
    }
  };

  // Advance to next card in queue after resolving current
  const advanceQueue = () => {
    if (drawQueue.length > 0) {
      setCurrent(drawQueue[0]);
      setDrawQueue(prev => prev.slice(1));
    } else {
      setCurrent(null);
    }
  };

  const playCard = () => {
    if (!current) return;
    const modifiers = extractEnemyModifiers(current);
    const cardWithModifiers = { ...current, enemyModifiers: modifiers };
    setDarknessActive(prev => [...prev, cardWithModifiers]);
    advanceQueue();
  };

  const holdCard = () => {
    if (!current) return;
    setDarknessHeld(prev => [...prev, current]);
    advanceQueue();
  };

  const sendToHand = () => {
    if (!current) return;
    addToHand({ type: 'darkness', ...current });
    advanceQueue();
  };

  const discardCard = () => advanceQueue();

  const releaseHeldCard = (card, action) => {
    setDarknessHeld(prev => prev.filter(c => c.name !== card.name));
    if (action === 'play') {
      const cardWithModifiers = { ...card, enemyModifiers: extractEnemyModifiers(card) };
      setDarknessActive(prev => [...prev, cardWithModifiers]);
    }
  };

  const sendHeldToHand = (card) => {
    setDarknessHeld(prev => prev.filter(c => c.name !== card.name));
    addToHand({ type: 'darkness', ...card });
  };

  const reshuffle = () => {
    setDarknessDeck(shuffleFY([...DARKNESS_CARDS]));
    setCurrent(null);
    setDrawQueue([]);
  };

  const clearAll = () => {
    setDarknessActive([]);
    setDarknessHeld([]);
    setCurrent(null);
    setDrawQueue([]);
  };

  const queueSize = drawQueue.length;

  return (
    <div className="p-4 bg-white rounded shadow-md space-y-4">
      <h2 className="text-xl font-bold">Darkness Deck</h2>
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={drawCard} className="btn btn-primary">Draw Darkness Card</button>
        <button onClick={() => drawMultiple(2)} className="btn btn-primary btn-sm">Draw 2</button>
        <button onClick={() => drawMultiple(3)} className="btn btn-primary btn-sm">Draw 3</button>
        <button onClick={reshuffle} className="btn btn-secondary">Reshuffle Deck</button>
        <button onClick={clearAll} className="btn btn-warning">Clear All</button>
        <span className="text-sm text-gray-600">Deck: {darknessDeck.length}</span>
      </div>

      {/* Queue indicator */}
      {queueSize > 0 && (
        <div className="text-sm bg-purple-100 text-purple-800 px-3 py-1.5 rounded border border-purple-300">
          {queueSize} more card{queueSize !== 1 ? 's' : ''} queued — resolve current card to see next
        </div>
      )}

      {current && (
        <div className="border p-3 rounded bg-black text-white">
          <h3 className="text-lg font-bold">{current.name}</h3>
          <p><strong>Effect:</strong> {current.effect}</p>
          {current.remainsInPlay && (
            <p className="text-xs text-blue-400 mt-1">Remains in Play</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            <button onClick={playCard} className="btn btn-success btn-sm">Play</button>
            <button onClick={holdCard} className="btn btn-warning btn-sm">Hold</button>
            <button onClick={sendToHand} className="btn btn-info btn-sm">Add to Hand</button>
            <button onClick={discardCard} className="btn btn-secondary btn-sm">Discard</button>
          </div>
        </div>
      )}

      {darknessActive.length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold">Active Darkness Effects:</h4>
          <ul className="list-disc list-inside">
            {darknessActive.map((card, idx) => (
              <li key={idx}>
                <strong>{card.name}</strong>: {card.effect}
              </li>
            ))}
          </ul>
        </div>
      )}

      {darknessHeld.length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold">Held Darkness Cards:</h4>
          <ul className="space-y-2">
            {darknessHeld.map((card, idx) => (
              <li key={idx} className="flex flex-wrap gap-2 items-center">
                <span>
                  <strong>{card.name}</strong>
                  {': '}
                  {card.effect}
                </span>
                <button
                  className="btn btn-success btn-xs"
                  onClick={() => releaseHeldCard(card, 'play')}
                >
                  Play
                </button>
                <button
                  className="btn btn-info btn-xs"
                  onClick={() => sendHeldToHand(card)}
                >
                  To Hand
                </button>
                <button
                  className="btn btn-secondary btn-xs"
                  onClick={() => releaseHeldCard(card, 'discard')}
                >
                  Discard
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
