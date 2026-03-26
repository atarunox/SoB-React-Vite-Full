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
  // Parse "Boost" cards that target a keyword with stat changes
  if (card.tags.includes("Boost")) {
    // Find the keyword target (e.g., "Soldier", "Undead", "Construct", "Void", "Fanatic")
    const keyword = card.tags.find(t => t !== "Darkness" && t !== "Boost");
    if (!keyword) return mods;
    const effect = card.effect;
    // Match patterns like "+1 Initiative", "+2 Health", "+1 Combat", "+1 Defense"
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
  } = useCombatState();

  const [current, setCurrent] = React.useState(null);

  const drawCard = () => {
    if (darknessDeck.length === 0) return;
    setCurrent(darknessDeck[0]);
    setDarknessDeck(darknessDeck.slice(1));
  };

  const playCard = () => {
    if (!current) return;
    const modifiers = extractEnemyModifiers(current);
    const cardWithModifiers = { ...current, enemyModifiers: modifiers };
    setDarknessActive(prev => [...prev, cardWithModifiers]);
    setCurrent(null);
  };

  const holdCard = () => {
    if (!current) return;
    setDarknessHeld(prev => [...prev, current]);
    setCurrent(null);
  };

  const discardCard = () => setCurrent(null);

  const releaseHeldCard = (card, action) => {
    setDarknessHeld(prev => prev.filter(c => c.name !== card.name));
    if (action === 'play') {
      const cardWithModifiers = { ...card, enemyModifiers: extractEnemyModifiers(card) };
      setDarknessActive(prev => [...prev, cardWithModifiers]);
    }
  };

  const reshuffle = () => {
    setDarknessDeck(shuffleFY([...DARKNESS_CARDS]));
    setCurrent(null);
  };

  const clearAll = () => {
    setDarknessActive([]);
    setDarknessHeld([]);
    setCurrent(null);
  };

  return (
    <div className="p-4 bg-white rounded shadow-md space-y-4">
      <h2 className="text-xl font-bold">Darkness Deck</h2>
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={drawCard} className="btn btn-primary">Draw Darkness Card</button>
        <button onClick={reshuffle} className="btn btn-secondary">Reshuffle Deck</button>
        <button onClick={clearAll} className="btn btn-warning">Clear All</button>
        <span className="text-sm text-gray-600">Deck: {darknessDeck.length}</span>
      </div>

      {current && (
        <div className="border p-3 rounded bg-black text-white">
          <h3 className="text-lg font-bold">{current.name}</h3>
          <p><strong>Effect:</strong> {current.effect}</p>
          {current.remainsInPlay && (
            <p className="text-xs text-blue-400 mt-1">Remains in Play</p>
          )}
          <div className="flex gap-2 mt-2">
            <button onClick={playCard} className="btn btn-success">Play</button>
            <button onClick={holdCard} className="btn btn-warning">Hold</button>
            <button onClick={discardCard} className="btn btn-secondary">Discard</button>
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
              <li key={idx} className="flex gap-2 items-center">
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
