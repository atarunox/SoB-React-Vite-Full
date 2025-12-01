// src/components/DM/DMGrowingDreadDrawer.jsx
import React from "react";
import { GROWING_DREAD_CARDS } from "../../data/growingDreadCards";
import { useCombatState } from "../../hooks/useCombatState";

function shuffleFY(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Optional: if your cards include tags like ["Western","Jargono"] etc.
function filterByWorld(cards, world) {
  if (!cards?.length) return [];
  // Accept if no tags OR tags include this world
  return cards.filter(c => {
    const tags = Array.isArray(c.tags) ? c.tags.map(String.toLowerCase) : [];
    if (tags.length === 0) return true;
    return tags.includes(String(world).toLowerCase());
  });
}

export default function DMGrowingDreadDrawer({ world = "Mines" }) {
  const {
    growingDreadDeck, setGrowingDreadDeck,
    growingDreadHand, setGrowingDreadHand,
    growingDreadActive, setGrowingDreadActive,
  } = useCombatState();

  const [current, setCurrent] = React.useState(null);

  // Seed / reseed deck on world change
  React.useEffect(() => {
    const pool = filterByWorld(GROWING_DREAD_CARDS, world);
    const seeded = shuffleFY(pool);
    setGrowingDreadDeck(seeded);
    setGrowingDreadHand([]);    // optional: clear hand on world swap
    setGrowingDreadActive([]);  // optional: clear active on world swap
    setCurrent(null);
  }, [world, setGrowingDreadDeck, setGrowingDreadHand, setGrowingDreadActive]);

  const drawCard = () => {
    if (growingDreadDeck.length === 0) return;
    setCurrent(growingDreadDeck[0]);
    setGrowingDreadDeck(growingDreadDeck.slice(1));
  };

  const addToHand = () => {
    if (!current) return;
    setGrowingDreadHand(prev => [...prev, current]);
    setCurrent(null);
  };

  const playFromHand = (card) => {
    setGrowingDreadHand(prev => prev.filter(c => c !== card));
    setGrowingDreadActive(prev => [...prev, card]);
  };

  const discardFromHand = (card) => {
    setGrowingDreadHand(prev => prev.filter(c => c !== card));
  };

  const reshuffle = () => {
    const pool = filterByWorld(GROWING_DREAD_CARDS, world);
    setGrowingDreadDeck(shuffleFY(pool));
    setCurrent(null);
  };

  const resetAll = () => {
    const pool = filterByWorld(GROWING_DREAD_CARDS, world);
    setGrowingDreadDeck(shuffleFY(pool));
    setGrowingDreadHand([]);
    setGrowingDreadActive([]);
    setCurrent(null);
  };

  return (
    <div className="p-4 bg-white rounded shadow-md space-y-4">
      <h2 className="text-xl font-bold">Growing Dread Deck</h2>
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={drawCard} className="btn btn-primary">Draw Growing Dread</button>
        <button onClick={addToHand} className="btn" disabled={!current}>Add Current to DM Hand</button>
        <button onClick={reshuffle} className="btn btn-secondary">Reshuffle Deck</button>
        <button onClick={resetAll} className="btn btn-warning">Reset (World: {world})</button>
        <span className="text-sm text-gray-600">Deck: {growingDreadDeck.length}</span>
      </div>

      {current && (
        <div className="border p-3 rounded bg-black text-white">
          <h3 className="text-lg font-bold">{current.name}</h3>
          {current.flavorText && <p className="italic">{current.flavorText}</p>}
          {current.effect && <p><strong>Effect:</strong> {current.effect}</p>}
          {current.remainsInPlay && (
            <p className="text-xs text-blue-400 mt-1">Remains in Play</p>
          )}
        </div>
      )}

      {growingDreadHand.length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold">DM Hand (play any time):</h4>
          <ul className="space-y-2">
            {growingDreadHand.map((card, idx) => (
              <li key={idx} className="flex gap-2 items-center">
                <span>
                  <strong>{card.name}</strong>
                  {card.effect ? <> — {card.effect}</> : null}
                </span>
                <button className="btn btn-success btn-xs" onClick={() => playFromHand(card)}>
                  Play
                </button>
                <button className="btn btn-secondary btn-xs" onClick={() => discardFromHand(card)}>
                  Discard
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {growingDreadActive.length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold">Active Growing Dread Effects:</h4>
          <ul className="list-disc list-inside">
            {growingDreadActive.map((card, idx) => (
              <li key={idx}>
                <strong>{card.name}</strong>
                {card.effect ? <>: {card.effect}</> : null}
                {card.remainsInPlay && <span className="ml-2 text-xs text-blue-600">(Remains in Play)</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
