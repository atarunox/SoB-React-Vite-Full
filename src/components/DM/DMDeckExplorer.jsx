import React, { useState } from 'react';
import { DARKNESS_CARDS } from '../../data/darknessCards';
import { GROWING_DREAD_CARDS } from '../../data/growingDreadCards';
import { ENCOUNTER_CARDS } from '../../data/encounterCards';
import { lootCards } from '../../data/lootDeck';
import { WORLD_CARDS } from '../../data/worldCards';

const DECKS = [
  { id: 'darkness',    label: 'Darkness Cards',    cards: DARKNESS_CARDS   },
  { id: 'growingDread',label: 'Growing Dread',     cards: GROWING_DREAD_CARDS },
  { id: 'encounter',   label: 'Encounter Cards',   cards: ENCOUNTER_CARDS   },
  { id: 'loot',        label: 'Loot Cards',        cards: lootCards         },
  { id: 'world',       label: 'World Cards',       cards: WORLD_CARDS       },
];

function CardRow({ card }) {
  const tags   = card.tags   || card.subtype || [];
  const effect = card.effect || card.flavorText || card.text || card.description || '';
  const name   = card.name   || card.type   || '(unnamed)';

  return (
    <div className="border border-[#8b6b46]/40 rounded-lg bg-[#fdf6e3] px-3 py-2 space-y-1">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <span className="font-bold text-[#3b2f1d] text-sm leading-snug">{name}</span>
        <div className="flex items-center gap-1 flex-wrap shrink-0">
          {card.remainsInPlay && (
            <span className="text-[10px] font-semibold bg-amber-200 text-amber-900 border border-amber-400 rounded px-1.5 py-0.5">
              Remains in Play
            </span>
          )}
          {tags.map((t) => (
            <span key={t} className="text-[10px] bg-[#2a1f14]/10 text-[#5c3a1e] rounded-full px-2 py-0.5 border border-[#8b6b46]/30">
              {t}
            </span>
          ))}
        </div>
      </div>
      {effect && (
        <p className="text-xs italic text-[#3b2f1d]/80 leading-snug">{effect}</p>
      )}
    </div>
  );
}

function DeckSection({ deck }) {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState('');
  const cards = Array.isArray(deck.cards) ? deck.cards : [];

  const filtered = query.trim()
    ? cards.filter((c) => {
        const hay = [c.name, c.effect, c.text, c.description, ...(c.tags || c.subtype || [])]
          .filter(Boolean).join(' ').toLowerCase();
        return hay.includes(query.toLowerCase());
      })
    : cards;

  return (
    <div className="border border-[#8b6b46] rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#2a1f14] to-[#3d2c1a] hover:from-[#3d2c1a] hover:to-[#5c3a1e] transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-bold text-amber-200 tracking-wide">{deck.label}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-amber-900/60 text-amber-200 rounded-full px-2.5 py-0.5 font-semibold">
            {cards.length} card{cards.length !== 1 ? 's' : ''}
          </span>
          <span className="text-amber-400 text-sm">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="bg-[#fdf6e3]/50 p-3 space-y-2">
          {cards.length > 4 && (
            <input
              type="text"
              placeholder="Search cards…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-sm px-3 py-1.5 rounded-lg border border-[#8b6b46]/50 bg-white/80 focus:outline-none focus:ring-1 focus:ring-brass/50"
            />
          )}
          {filtered.length === 0 ? (
            <p className="text-sm italic text-[#5c3a1e]/60 text-center py-2">No cards match.</p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto themed-scrollbar pr-1">
              {filtered.map((card, i) => (
                <CardRow key={card.id ?? card.name ?? i} card={card} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DMDeckExplorer() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base text-[#3b2f1d]">Deck Explorer</h3>
        <span className="text-xs text-[#5c3a1e]/60">
          {DECKS.reduce((s, d) => s + (Array.isArray(d.cards) ? d.cards.length : 0), 0)} total cards
        </span>
      </div>
      {DECKS.map((deck) => (
        <DeckSection key={deck.id} deck={deck} />
      ))}
    </div>
  );
}
