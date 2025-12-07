import React from "react";
import { DARKNESS_CARDS } from "../../data/darknessCards";
import { useCombatState } from "../../hooks/useCombatState";
import { usePosse } from "../../context/PosseContext";

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function extractEnemyModifiers(card) {
  // ... (same as your function)
  return {};
}

export default function DMDarknessDrawer({ world = "Mines" }) {
  const {
    darknessDeck, setDarknessDeck,
    darknessHeld, setDarknessHeld,
    darknessActive, setDarknessActive,
  } = useCombatState();

  const { posse, updateHero } = usePosse();

  const [current, setCurrent] = React.useState(null);

  // Find hero with active Eagle Spirit Guide buff
  const eagleBuffHero = React.useMemo(() => {
    if (!posse?.heroes) return null;

    for (const hero of posse.heroes) {
      const conditions = Array.isArray(hero?.conditions) ? hero.conditions : [];
      const eagleBuff = conditions.find(c =>
        c?.type === 'buff' &&
        c?.active !== false &&
        !c?.removed &&
        c?.effects?.redrawCard === true &&
        (c?.usesRemaining ?? 0) > 0
      );

      if (eagleBuff) {
        return { hero, buff: eagleBuff };
      }
    }
    return null;
  }, [posse?.heroes]);

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

  const redrawWithEagle = () => {
    if (!eagleBuffHero || !current) return;

    const { hero, buff } = eagleBuffHero;

    // Consume one use of the Eagle Spirit Guide buff
    const updatedConditions = hero.conditions.map(c => {
      if (c?.id === buff.id) {
        const newUses = Math.max(0, (c.usesRemaining ?? 0) - 1);
        return {
          ...c,
          usesRemaining: newUses,
          // Mark as inactive if no uses left
          active: newUses > 0,
        };
      }
      return c;
    });

    // Update hero in posse
    updateHero({
      ...hero,
      conditions: updatedConditions,
      updatedAt: Date.now(),
    });

    // Discard current card and draw a new one
    setCurrent(null);
    if (darknessDeck.length === 0) {
      alert(`🦅 Eagle Spirit Guide used! No more cards in deck to draw.`);
      return;
    }

    // Draw the next card
    setCurrent(darknessDeck[0]);
    setDarknessDeck(darknessDeck.slice(1));

    alert(`🦅 Eagle Spirit Guide: Card redrawn! (${eagleBuffHero.buff.usesRemaining - 1} uses remaining)`);
  };

  const releaseHeldCard = (card, action) => {
    setDarknessHeld(prev => prev.filter(c => c.name !== card.name));
    if (action === 'play') {
      const cardWithModifiers = { ...card, enemyModifiers: extractEnemyModifiers(card) };
      setDarknessActive(prev => [...prev, cardWithModifiers]);
    }
  };

  const clearAll = () => {
    setDarknessActive([]);
    setDarknessHeld([]);
    setCurrent(null);
    alert("All Darkness cards cleared.");
  };

  return (
    <div className="p-4 bg-white rounded shadow-md space-y-4">
      <h2 className="text-xl font-bold">Darkness Deck</h2>
      <div className="flex gap-2">
        <button onClick={drawCard} className="btn btn-primary">Draw Darkness Card</button>
        <button onClick={clearAll} className="btn btn-secondary">Clear All</button>
      </div>

      {eagleBuffHero && (
        <div className="bg-green-50 border-2 border-green-500 rounded p-2 text-sm">
          <strong className="text-green-800">🦅 Eagle Spirit Guide Active!</strong>
          <p className="text-gray-700">
            {eagleBuffHero.hero.name} can redraw a Darkness or Threat card ({eagleBuffHero.buff.usesRemaining} use{eagleBuffHero.buff.usesRemaining !== 1 ? 's' : ''} remaining)
          </p>
        </div>
      )}

      {current && (
        <div className="border p-3 rounded bg-black text-white">
          <h3 className="text-lg font-bold">{current.name}</h3>
          <p className="italic">{current.flavorText}</p>
          <p><strong>Effect:</strong> {current.effect}</p>
          {current.remainsInPlay && (
            <p className="text-xs text-blue-400 mt-1">Remains in Play</p>
          )}
          <div className="flex gap-2 mt-2 flex-wrap">
            <button onClick={playCard} className="btn btn-success">Play</button>
            <button onClick={holdCard} className="btn btn-warning">Hold</button>
            <button onClick={discardCard} className="btn btn-secondary">Discard</button>
            {eagleBuffHero && (
              <button
                onClick={redrawWithEagle}
                className="btn bg-green-600 hover:bg-green-700 text-white border-green-700"
              >
                🦅 Redraw with Eagle Spirit Guide
              </button>
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
