// src/components/DM/DMGrowingDreadDrawer.jsx
import React, { useState } from "react";
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
    const tags = Array.isArray(c.tags) ? c.tags.map(t => t.toLowerCase()) : [];
    if (tags.length === 0) return true;
    return tags.includes(String(world).toLowerCase());
  });
}

export default function DMGrowingDreadDrawer({ world = "Mines" }) {
  const {
    growingDreadDeck, setGrowingDreadDeck,
    growingDreadHand, setGrowingDreadHand,
    growingDreadActive, setGrowingDreadActive,
    addToHand,
  } = useCombatState();

  // Index for cycling through hand cards
  const [handIndex, setHandIndex] = useState(0);

  // Seed / reseed deck on world change
  React.useEffect(() => {
    const pool = filterByWorld(GROWING_DREAD_CARDS, world);
    const seeded = shuffleFY(pool);
    setGrowingDreadDeck(seeded);
    setGrowingDreadHand([]);
    setGrowingDreadActive([]);
  }, [world, setGrowingDreadDeck, setGrowingDreadHand, setGrowingDreadActive]);

  // Draw card and add directly to hand (held until played or end of mission)
  const drawCard = () => {
    if (growingDreadDeck.length === 0) return;
    const card = growingDreadDeck[0];
    setGrowingDreadDeck(growingDreadDeck.slice(1));
    // Add directly to hand — held until end of mission
    setGrowingDreadHand(prev => [...prev, { ...card, hidden: true }]);
    // Also add to unified DM hand for visibility
    addToHand({ type: 'growingDread', ...card, hidden: true });
  };

  const revealInHand = (idx) => {
    setGrowingDreadHand(prev => prev.map((c, i) => i === idx ? { ...c, hidden: false } : c));
  };

  const hideInHand = (idx) => {
    setGrowingDreadHand(prev => prev.map((c, i) => i === idx ? { ...c, hidden: true } : c));
  };

  const playFromHand = (idx) => {
    const card = growingDreadHand[idx];
    if (!card) return;
    setGrowingDreadHand(prev => prev.filter((_, i) => i !== idx));
    setGrowingDreadActive(prev => [...prev, { ...card, hidden: false }]);
    if (handIndex >= growingDreadHand.length - 1) setHandIndex(Math.max(0, handIndex - 1));
  };

  const discardFromHand = (idx) => {
    setGrowingDreadHand(prev => prev.filter((_, i) => i !== idx));
    if (handIndex >= growingDreadHand.length - 1) setHandIndex(Math.max(0, handIndex - 1));
  };

  const reshuffle = () => {
    const pool = filterByWorld(GROWING_DREAD_CARDS, world);
    setGrowingDreadDeck(shuffleFY(pool));
  };

  const resetAll = () => {
    const pool = filterByWorld(GROWING_DREAD_CARDS, world);
    setGrowingDreadDeck(shuffleFY(pool));
    setGrowingDreadHand([]);
    setGrowingDreadActive([]);
    setHandIndex(0);
  };

  const safeHandIndex = Math.min(handIndex, Math.max(0, growingDreadHand.length - 1));
  const focusedCard = growingDreadHand.length > 0 ? growingDreadHand[safeHandIndex] : null;

  return (
    <div className="p-4 bg-white rounded shadow-md space-y-4">
      <h2 className="text-xl font-bold">Growing Dread Deck</h2>
      <p className="text-xs text-gray-500">
        Drawn cards are held face-down in your hand until played or the mission ends. Reveal to peek at any time.
      </p>
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={drawCard} className="btn btn-primary" disabled={growingDreadDeck.length === 0}>
          Draw Growing Dread
        </button>
        <button onClick={reshuffle} className="btn btn-secondary">Reshuffle Deck</button>
        <button onClick={resetAll} className="btn btn-warning">Reset (World: {world})</button>
        <span className="text-sm text-gray-600">Deck: {growingDreadDeck.length}</span>
      </div>

      {/* Hand — cycle through held cards */}
      {growingDreadHand.length > 0 && (
        <div className="border-2 border-indigo-400 rounded-lg overflow-hidden bg-indigo-950 text-indigo-100">
          <div className="px-3 py-2 bg-indigo-900/80 flex items-center justify-between">
            <span className="font-bold text-sm">
              Held Cards ({growingDreadHand.length})
            </span>
            <span className="text-xs opacity-80">Held until end of mission</span>
          </div>

          <div className="p-3">
            {/* Navigation */}
            {growingDreadHand.length > 1 && (
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setHandIndex(i => i > 0 ? i - 1 : growingDreadHand.length - 1)}
                  className="btn btn-xs btn-ghost text-indigo-200"
                >
                  &larr; Prev
                </button>
                <span className="text-xs opacity-80">
                  {safeHandIndex + 1} / {growingDreadHand.length}
                </span>
                <button
                  onClick={() => setHandIndex(i => i < growingDreadHand.length - 1 ? i + 1 : 0)}
                  className="btn btn-xs btn-ghost text-indigo-200"
                >
                  Next &rarr;
                </button>
              </div>
            )}

            {/* Card display */}
            {focusedCard && (
              <div className="rounded p-3 bg-black/30 border border-white/10">
                {focusedCard.hidden ? (
                  <div>
                    <div className="font-bold text-lg">Growing Dread (Face Down)</div>
                    <p className="text-sm italic opacity-60">This card is face-down. Reveal to peek at its contents.</p>
                  </div>
                ) : (
                  <div>
                    <div className="font-bold text-lg">{focusedCard.name}</div>
                    {focusedCard.flavorText && <p className="text-sm italic opacity-80">{focusedCard.flavorText}</p>}
                    {focusedCard.effect && <p className="text-sm mt-1"><b>Effect:</b> {focusedCard.effect}</p>}
                    {focusedCard.remainsInPlay && <p className="text-xs text-blue-400 italic mt-1">Remains in Play</p>}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  {focusedCard.hidden ? (
                    <button className="btn btn-xs btn-info" onClick={() => revealInHand(safeHandIndex)}>
                      Reveal to DM
                    </button>
                  ) : (
                    <button className="btn btn-xs btn-warning" onClick={() => hideInHand(safeHandIndex)}>
                      Hide Card
                    </button>
                  )}
                  <button className="btn btn-xs btn-success" onClick={() => playFromHand(safeHandIndex)}>
                    Play
                  </button>
                  <button className="btn btn-xs btn-error" onClick={() => discardFromHand(safeHandIndex)}>
                    Discard
                  </button>
                </div>
              </div>
            )}
          </div>
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
