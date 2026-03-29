import React, { useState } from "react";
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
  if (!card) return {};
  // Use structured statModifiers when available (signs pre-validated)
  if (card.statModifiers) {
    const { keywordFilter, effects } = card.statModifiers;
    if (keywordFilter && effects) {
      return { [keywordFilter]: { ...effects } };
    }
  }
  // Fallback: regex parse from effect text (for cards without statModifiers)
  if (!card.tags || !card.effect) return {};
  const mods = {};
  if (card.tags.includes("Boost")) {
    const keyword = card.tags.find(t => t !== "Darkness" && t !== "Boost");
    if (!keyword) return mods;
    const effect = card.effect;
    const statPattern = /([+-])(\d+)\s+(Initiative|Health|Combat|Defense|Damage|Move|Shots)/gi;
    let match;
    while ((match = statPattern.exec(effect)) !== null) {
      const sign = match[1] === '-' ? -1 : 1;
      const val = parseInt(match[2]) * sign;
      const stat = match[3].toLowerCase();
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
  const [drawQueue, setDrawQueue] = useState([]);
  const [current, setCurrent] = useState(null);

  // Index for cycling held cards
  const [heldIndex, setHeldIndex] = useState(0);

  // Draw a single card (or add to queue if one is already showing)
  const drawCard = () => {
    if (darknessDeck.length === 0) return;
    const card = darknessDeck[0];
    setDarknessDeck(darknessDeck.slice(1));
    if (current) {
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

  // Play immediately (applies effect)
  const playCard = () => {
    if (!current) return;
    const modifiers = extractEnemyModifiers(current);
    const cardWithModifiers = { ...current, enemyModifiers: modifiers };
    setDarknessActive(prev => [...prev, cardWithModifiers]);
    advanceQueue();
  };

  // Add to hand (held until played or cleared)
  const holdCard = () => {
    if (!current) return;
    setDarknessHeld(prev => [...prev, current]);
    addToHand({ type: 'darkness', ...current });
    advanceQueue();
  };

  const discardCard = () => advanceQueue();

  // Play a held card from hand
  const playHeldCard = (idx) => {
    const card = darknessHeld[idx];
    if (!card) return;
    setDarknessHeld(prev => prev.filter((_, i) => i !== idx));
    const modifiers = extractEnemyModifiers(card);
    setDarknessActive(prev => [...prev, { ...card, enemyModifiers: modifiers }]);
    if (heldIndex >= darknessHeld.length - 1) setHeldIndex(Math.max(0, heldIndex - 1));
  };

  const discardHeldCard = (idx) => {
    setDarknessHeld(prev => prev.filter((_, i) => i !== idx));
    if (heldIndex >= darknessHeld.length - 1) setHeldIndex(Math.max(0, heldIndex - 1));
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
  const safeHeldIndex = Math.min(heldIndex, Math.max(0, darknessHeld.length - 1));
  const focusedHeld = darknessHeld.length > 0 ? darknessHeld[safeHeldIndex] : null;

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
          {current.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {current.tags.map((t, i) => (
                <span key={i} className="px-1.5 py-0.5 text-[10px] rounded bg-purple-800 border border-purple-600">{t}</span>
              ))}
            </div>
          )}
          <p className="mt-2"><strong>Effect:</strong> {current.effect}</p>
          {current.remainsInPlay && (
            <p className="text-xs text-blue-400 mt-1">Remains in Play</p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            <button onClick={playCard} className="btn btn-success btn-sm">Play Now</button>
            <button onClick={holdCard} className="btn btn-info btn-sm">Add to Hand</button>
            <button onClick={discardCard} className="btn btn-secondary btn-sm">Discard</button>
          </div>
        </div>
      )}

      {/* Held hand — cycle through */}
      {darknessHeld.length > 0 && (
        <div className="border-2 border-purple-400 rounded-lg overflow-hidden bg-purple-950 text-purple-100">
          <div className="px-3 py-2 bg-purple-900/80 flex items-center justify-between">
            <span className="font-bold text-sm">
              Held Darkness Cards ({darknessHeld.length})
            </span>
            <span className="text-xs opacity-80">Retained until played or cleared</span>
          </div>

          <div className="p-3">
            {/* Navigation */}
            {darknessHeld.length > 1 && (
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setHeldIndex(i => i > 0 ? i - 1 : darknessHeld.length - 1)}
                  className="btn btn-xs btn-ghost text-purple-200"
                >
                  &larr; Prev
                </button>
                <span className="text-xs opacity-80">
                  {safeHeldIndex + 1} / {darknessHeld.length}
                </span>
                <button
                  onClick={() => setHeldIndex(i => i < darknessHeld.length - 1 ? i + 1 : 0)}
                  className="btn btn-xs btn-ghost text-purple-200"
                >
                  Next &rarr;
                </button>
              </div>
            )}

            {focusedHeld && (
              <div className="rounded p-3 bg-black/30 border border-white/10">
                <div className="font-bold text-lg">{focusedHeld.name}</div>
                {focusedHeld.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {focusedHeld.tags.map((t, i) => (
                      <span key={i} className="px-1.5 py-0.5 text-[10px] rounded bg-purple-800 border border-purple-600">{t}</span>
                    ))}
                  </div>
                )}
                <p className="text-sm mt-2"><b>Effect:</b> {focusedHeld.effect}</p>
                {focusedHeld.remainsInPlay && <p className="text-xs text-blue-400 italic mt-1">Remains in Play</p>}

                <div className="flex flex-wrap gap-2 mt-3">
                  <button className="btn btn-xs btn-success" onClick={() => playHeldCard(safeHeldIndex)}>
                    Play
                  </button>
                  <button className="btn btn-xs btn-error" onClick={() => discardHeldCard(safeHeldIndex)}>
                    Discard
                  </button>
                </div>
              </div>
            )}
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
    </div>
  );
}
