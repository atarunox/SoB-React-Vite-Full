import React, { useState, useEffect } from 'react';
import { mineEncounters } from '../../data/encounters/mineEncounters';
import { blastedWastesEncounters } from '../../data/encounters/wastesEncounters';
import { canyonEncounters } from '../../data/encounters/canyonEncounters';
import { useCombatState } from '../../hooks/useCombatState';

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const WORLD_TO_ENCOUNTER_CARDS = {
  Mines: mineEncounters,
  "Blasted Wastes": blastedWastesEncounters,
  "Canyons": canyonEncounters,
};

function classifyTarget(enc = {}) {
  const explicit = String(enc.target || '').trim();
  if (explicit) return explicit;

  const hay = `${typeof enc.test === 'string' ? enc.test : ''} ${enc.effect || ''}`.toLowerCase();
  if (/each hero ending move/.test(hay)) return 'Each Hero ending move';
  if (/each hero|every hero|all heroes/.test(hay)) return 'Each Hero';
  if (/random hero/.test(hay)) return 'Random Hero';
  if (/chosen hero|one hero|a hero may|any hero/.test(hay)) return 'One Hero';
  if (enc.remainsInPlay && /(weather|start of each turn|while in\b)/.test(hay)) return 'All Heroes';
  return 'Unspecified';
}

function isRichSchema(card) {
  return card.test && typeof card.test === 'object';
}

function TestBlock({ test }) {
  if (!test) return null;
  if (typeof test === 'string') return <p><strong>Test:</strong> {test}</p>;
  return (
    <div className="mb-2 p-2 bg-white/60 rounded border border-gray-200">
      <p className="font-semibold text-sm">{test.stat} {test.target}</p>
      {test.success?.length > 0 && (
        <div className="mt-1">
          <span className="text-green-700 text-xs font-bold">SUCCESS:</span>
          <ul className="list-disc list-inside text-sm ml-1">
            {test.success.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
      {test.fail?.length > 0 && (
        <div className="mt-1">
          <span className="text-red-700 text-xs font-bold">FAIL:</span>
          <ul className="list-disc list-inside text-sm ml-1">
            {test.fail.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function ChoicesBlock({ choices }) {
  if (!choices?.length) return null;
  return (
    <div className="space-y-2">
      <p className="font-semibold text-sm">Choose:</p>
      {choices.map((c, i) => (
        <div key={i} className="p-2 bg-white/60 rounded border border-gray-200">
          <p className="font-semibold text-sm text-blue-800">{c.label}</p>
          {c.test && <TestBlock test={c.test} />}
          {c.effects?.length > 0 && (
            <ul className="list-disc list-inside text-sm mt-1">
              {c.effects.map((e, j) => <li key={j}>{e}</li>)}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function RollTableBlock({ rollTable }) {
  if (!rollTable) return null;
  return (
    <div className="p-2 bg-white/60 rounded border border-gray-200">
      <p className="font-semibold text-sm mb-1">Roll {rollTable.dice}:</p>
      <div className="space-y-1">
        {Object.entries(rollTable.results).map(([range, result]) => (
          <div key={range} className="flex gap-2 text-sm">
            <span className="font-mono font-bold text-gray-600 min-w-[3rem]">{range}</span>
            <div>
              <span className="font-semibold">{result.name}</span>
              {result.effect && <span className="ml-1">— {result.effect}</span>}
              {result.test && <TestBlock test={result.test} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FollowUpBlock({ followUp }) {
  if (!followUp) return null;
  return (
    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
      <p className="text-xs font-bold text-blue-700 mb-1">
        {followUp.label || `Then: Roll ${followUp.roll}`}
      </p>
      {followUp.test && <TestBlock test={followUp.test} />}
      {followUp.table && (
        <div className="text-sm">
          {Object.entries(followUp.table).map(([range, effect]) => (
            <p key={range}><span className="font-mono">{range}:</span> {effect}</p>
          ))}
        </div>
      )}
      {followUp.effects?.length > 0 && (
        <ul className="list-disc list-inside text-sm">
          {followUp.effects.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}
    </div>
  );
}

function EncounterCard({ card }) {
  const rich = isRichSchema(card);
  const targetType = classifyTarget(card);

  return (
    <div className="border p-4 rounded bg-yellow-50 border-yellow-300 shadow">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-bold">{card.name}</h3>
        {card.remainsInPlay && (
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">
            Remains in Play
          </span>
        )}
      </div>

      {card.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1 mb-2">
          {card.tags.map((t, i) => (
            <span key={i} className="text-xs px-1.5 py-0.5 bg-gray-200 rounded">{t}</span>
          ))}
        </div>
      )}

      {card.flavor && <p className="italic text-gray-600 mb-2 text-sm">{card.flavor}</p>}

      {rich ? (
        <div className="space-y-2">
          <TestBlock test={card.test} />
          {card.effects?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1">EFFECTS:</p>
              <ul className="list-disc list-inside text-sm">
                {card.effects.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
          <ChoicesBlock choices={card.choices} />
          <RollTableBlock rollTable={card.rollTable} />
          <FollowUpBlock followUp={card.followUp} />
          {card.notes && <p className="text-xs text-gray-500 mt-1 italic">{card.notes}</p>}
        </div>
      ) : (
        <div>
          {card.test && <p><strong>Test:</strong> {card.test}</p>}
          <p className="text-sm"><strong>Effect:</strong> {card.effect}</p>
        </div>
      )}

      <p className="mt-2 text-xs text-gray-500"><strong>Target:</strong> {targetType}</p>
    </div>
  );
}

export default function DMEncounterDrawer({ world = 'Mines' }) {
  const { addToHand } = useCombatState();
  const [deck, setDeck] = useState([]);
  const [current, setCurrent] = useState(null);
  const [discard, setDiscard] = useState([]);
  const [inPlay, setInPlay] = useState([]);

  useEffect(() => {
    const cards = WORLD_TO_ENCOUNTER_CARDS[world] || mineEncounters;
    setDeck(shuffle([...cards]));
    setCurrent(null);
    setDiscard([]);
    setInPlay([]);
  }, [world]);

  const drawCard = () => {
    if (deck.length === 0) return;
    setCurrent(deck[0]);
    setDeck(deck.slice(1));
  };

  const addCurrentToHand = () => {
    if (!current) return;
    addToHand({ type: 'encounter', ...current });
    if (current.remainsInPlay) {
      setInPlay(prev => [...prev, current]);
    } else {
      setDiscard(prev => [current, ...prev]);
    }
    setCurrent(null);
  };

  const discardCard = () => {
    if (!current) return;
    if (current.remainsInPlay) {
      setInPlay(prev => [...prev, current]);
    } else {
      setDiscard(prev => [current, ...prev]);
    }
    setCurrent(null);
  };

  const removeFromPlay = (idx) => {
    const card = inPlay[idx];
    setInPlay(prev => prev.filter((_, i) => i !== idx));
    setDiscard(prev => [card, ...prev]);
  };

  const reset = () => {
    const cards = WORLD_TO_ENCOUNTER_CARDS[world] || mineEncounters;
    setDeck(shuffle([...cards]));
    setCurrent(null);
    setDiscard([]);
    setInPlay([]);
  };

  return (
    <div className="p-4 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold">Encounter Deck ({world})</h2>
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary btn-sm min-h-[44px]" onClick={drawCard} disabled={deck.length === 0}>
          Draw Encounter ({deck.length})
        </button>
        <button className="btn btn-secondary btn-sm min-h-[44px]" onClick={reset}>Reset Deck</button>
      </div>

      {current && (
        <div className="mt-4">
          <EncounterCard card={current} />
          <div className="flex flex-wrap gap-2 mt-3">
            <button className="btn btn-info btn-sm min-h-[44px]" onClick={addCurrentToHand}>
              Add to Hand
            </button>
            <button className="btn btn-secondary btn-sm min-h-[44px]" onClick={discardCard}>
              {current.remainsInPlay ? 'Place in Play' : 'Discard'}
            </button>
          </div>
        </div>
      )}

      {inPlay.length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold text-blue-700 mb-2">In Play ({inPlay.length}):</h4>
          <div className="space-y-2">
            {inPlay.map((card, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded">
                <div>
                  <span className="font-semibold text-sm">{card.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {card.tags?.join(', ')}
                  </span>
                </div>
                <button
                  className="btn btn-ghost btn-xs min-h-[36px]"
                  onClick={() => removeFromPlay(idx)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {discard.length > 0 && (
        <div className="mt-4">
          <details>
            <summary className="font-bold cursor-pointer">Discard Pile ({discard.length})</summary>
            <ul className="list-disc list-inside mt-1 text-sm">
              {discard.map((card, idx) => (
                <li key={idx}>{card.name}</li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}
