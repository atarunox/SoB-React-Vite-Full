import React, { useState, useMemo } from 'react';
import { DARKNESS_CARDS }      from '../../data/darknessCards';
import { GROWING_DREAD_CARDS } from '../../data/growingDreadCards';
import { ENCOUNTER_CARDS }     from '../../data/encounterCards';
import { lootCards }           from '../../data/lootDeck';
import { WORLD_CARDS }         from '../../data/worldCards';
import { MAP_CARDS }           from '../../data/mapCards';
import { gearCards }           from '../../data/items/gearCards';
import { mineArtifacts }       from '../../data/items/mineArtifacts';
import { otherWorldArtifacts } from '../../data/items/otherWorldArtifacts';
import { ENEMY_CARDS }         from '../../data/enemyCards';
import { ENEMY_TRAIT_CARDS }      from '../../data/enemyCards/enemyTraitCards';
import { BLACK_FANG_WAR_CHANT }  from '../../data/enemyCards/warChantCards';
import { TOWN_TYPE_CARDS }        from '../../data/cards/townTypeCards';
import { townTraitsChart }        from './charts/townTraitsChart';

// Flatten enemy trait cards: { enemyName: [cards] } → [{ enemy, name, effect, ... }]
const flatEnemyTraitCards = Object.entries(ENEMY_TRAIT_CARDS).flatMap(
  ([enemy, cards]) => cards.map(c => ({ ...c, tags: [enemy] }))
);

// ── Flat decks ────────────────────────────────────────────────────────────────
const DECKS = [
  { id: 'darkness',    label: 'Darkness Cards',        cards: DARKNESS_CARDS      },
  { id: 'growingDread',label: 'Growing Dread',         cards: GROWING_DREAD_CARDS },
  { id: 'encounter',   label: 'Encounter Cards',       cards: ENCOUNTER_CARDS     },
  { id: 'loot',        label: 'Loot Cards',            cards: lootCards           },
  { id: 'world',       label: 'World Cards',           cards: WORLD_CARDS         },
  { id: 'map',         label: 'Map Cards',             cards: MAP_CARDS           },
  { id: 'gear',        label: 'Gear Cards',            cards: gearCards           },
  { id: 'mineArt',    label: 'Mine Artifacts',         cards: mineArtifacts       },
  { id: 'owArt',      label: 'OtherWorld Artifacts',   cards: otherWorldArtifacts },
  { id: 'townTypes',   label: 'Town Type Cards',        cards: TOWN_TYPE_CARDS         },
  { id: 'townTraits',  label: 'Town Traits (D36)',      cards: townTraitsChart         },
  { id: 'enemyTraits',   label: 'Enemy Trait Cards',        cards: flatEnemyTraitCards   },
  { id: 'warChant',     label: 'Black Fang War Chant',     cards: BLACK_FANG_WAR_CHANT  },
];

// ── Generic card row ──────────────────────────────────────────────────────────
function CardRow({ card }) {
  const tags = [
    ...(card.tags   || []),
    ...(card.subtype || []),
    ...(card.keywords || []),
    card.slot ? card.slot : null,
    card.type ? card.type : null,
  ].filter(Boolean);

  const effectLines = (() => {
    if (Array.isArray(card.effects))     return card.effects;
    if (Array.isArray(card.abilities))   return card.abilities;
    if (card.effect)    return [card.effect];
    if (card.flavorText)return [card.flavorText];
    if (card.text)      return [card.text];
    if (card.description) return [card.description];
    return [];
  })();

  const name = card.name || card.type || '(unnamed)';

  return (
    <div className="border border-[#8b6b46]/40 rounded-lg bg-[#fdf6e3] px-3 py-2 space-y-1">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <span className="font-bold text-[#3b2f1d] text-sm leading-snug">{name}</span>
        <div className="flex items-center gap-1 flex-wrap shrink-0">
          {card.consumesDarkStone && (
            <span className="text-[10px] font-semibold bg-slate-700 text-slate-100 border border-slate-500 rounded px-1.5 py-0.5">
              ◆ Dark Stone
            </span>
          )}
          {card.remainsInPlay && (
            <span className="text-[10px] font-semibold bg-amber-200 text-amber-900 border border-amber-400 rounded px-1.5 py-0.5">
              Remains in Play
            </span>
          )}
          {card.value != null && (
            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded px-1.5 py-0.5">
              ${card.value}
            </span>
          )}
          {tags.slice(0, 4).map((t, i) => (
            <span key={i} className="text-[10px] bg-[#2a1f14]/10 text-[#5c3a1e] rounded-full px-2 py-0.5 border border-[#8b6b46]/30">
              {t}
            </span>
          ))}
        </div>
      </div>
      {effectLines.length > 0 && (
        <ul className="list-none space-y-0.5">
          {effectLines.map((line, i) => (
            <li key={i} className="text-xs italic text-[#3b2f1d]/80 leading-snug">{line}</li>
          ))}
        </ul>
      )}
      {card.restrictions?.length > 0 && (
        <p className="text-[10px] text-red-700/70 italic">{card.restrictions.join(' · ')}</p>
      )}
    </div>
  );
}

// ── Enemy card row ────────────────────────────────────────────────────────────
function EnemyRow({ enemy }) {
  const hp      = enemy.health ?? enemy.stats?.brutal?.health ?? enemy.stats?.normal?.health ?? '?';
  const def     = enemy.defense ?? enemy.stats?.brutal?.defense ?? '?';
  const init    = enemy.initiative ?? '?';
  const toHit   = enemy.melee?.toHit ?? enemy.toHit?.melee ?? '?';
  const dmg     = enemy.melee?.damage ?? enemy.stats?.brutal?.damage ?? '?';
  const abilities = enemy.abilities || [];

  return (
    <div className="border border-[#8b6b46]/40 rounded-lg bg-[#fdf6e3] px-3 py-2 space-y-1">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <span className="font-bold text-[#3b2f1d] text-sm leading-snug">{enemy.name}</span>
        <div className="flex items-center gap-1 flex-wrap shrink-0">
          <span className="text-[10px] bg-red-100 text-red-800 border border-red-300 rounded px-1.5 py-0.5 font-semibold">
            HP {hp}
          </span>
          {def !== '?' && (
            <span className="text-[10px] bg-blue-100 text-blue-800 border border-blue-300 rounded px-1.5 py-0.5 font-semibold">
              Def {def}+
            </span>
          )}
          <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 rounded px-1.5 py-0.5 font-semibold">
            Init {init}
          </span>
          {toHit !== '?' && (
            <span className="text-[10px] bg-[#2a1f14]/10 text-[#5c3a1e] rounded-full px-2 py-0.5 border border-[#8b6b46]/30">
              {toHit} / {dmg} dmg
            </span>
          )}
          {(enemy.keywords || []).slice(0, 3).map((k, i) => (
            <span key={i} className="text-[10px] bg-[#2a1f14]/10 text-[#5c3a1e] rounded-full px-2 py-0.5 border border-[#8b6b46]/30">
              {k}
            </span>
          ))}
        </div>
      </div>
      {abilities.length > 0 && (
        <ul className="list-none space-y-0.5">
          {abilities.map((a, i) => (
            <li key={i} className="text-xs italic text-[#3b2f1d]/80 leading-snug">{a}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Generic deck section ──────────────────────────────────────────────────────
function DeckSection({ deck }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const cards = Array.isArray(deck.cards) ? deck.cards : [];

  const filtered = useMemo(() => {
    if (!query.trim()) return cards;
    const q = query.toLowerCase();
    return cards.filter(c => {
      const parts = [
        c.name, c.effect, c.text, c.description, c.type, c.slot,
        ...(c.tags || []), ...(c.subtype || []), ...(c.keywords || []),
        ...(Array.isArray(c.effects) ? c.effects : []),
      ].filter(Boolean).join(' ').toLowerCase();
      return parts.includes(q);
    });
  }, [cards, query]);

  return (
    <div className="border border-[#8b6b46] rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#2a1f14] to-[#3d2c1a] hover:from-[#3d2c1a] hover:to-[#5c3a1e] transition-colors"
        onClick={() => setOpen(v => !v)}
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
              placeholder="Search…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full text-sm px-3 py-1.5 rounded-lg border border-[#8b6b46]/50 bg-white/80 focus:outline-none focus:ring-1 focus:ring-[#b8860b]/50"
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

// ── Enemy section (grouped by world) ─────────────────────────────────────────
function EnemySection() {
  const [open, setOpen]       = useState(false);
  const [world, setWorld]     = useState('');
  const [query, setQuery]     = useState('');

  const worlds = useMemo(() => Object.keys(ENEMY_CARDS).sort(), []);

  const worldEnemies = useMemo(() => {
    const list = world ? (ENEMY_CARDS[world] || []) : [];
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(e => {
      const parts = [
        e.name,
        ...(e.keywords || []),
        ...(e.abilities || []),
      ].filter(Boolean).join(' ').toLowerCase();
      return parts.includes(q);
    });
  }, [world, query]);

  const totalCount = useMemo(
    () => Object.values(ENEMY_CARDS).reduce((s, arr) => s + arr.length, 0),
    []
  );

  return (
    <div className="border border-[#8b6b46] rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#2a1f14] to-[#3d2c1a] hover:from-[#3d2c1a] hover:to-[#5c3a1e] transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <span className="font-bold text-amber-200 tracking-wide">Enemy Cards</span>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-amber-900/60 text-amber-200 rounded-full px-2.5 py-0.5 font-semibold">
            {totalCount} enemies
          </span>
          <span className="text-amber-400 text-sm">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="bg-[#fdf6e3]/50 p-3 space-y-2">
          <select
            value={world}
            onChange={e => { setWorld(e.target.value); setQuery(''); }}
            className="w-full text-sm px-3 py-1.5 rounded-lg border border-[#8b6b46]/50 bg-white/80 focus:outline-none focus:ring-1 focus:ring-[#b8860b]/50"
          >
            <option value="">— Select a world —</option>
            {worlds.map(w => (
              <option key={w} value={w}>{w} ({(ENEMY_CARDS[w] || []).length})</option>
            ))}
          </select>

          {world && (
            <input
              type="text"
              placeholder="Search enemies…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full text-sm px-3 py-1.5 rounded-lg border border-[#8b6b46]/50 bg-white/80 focus:outline-none focus:ring-1 focus:ring-[#b8860b]/50"
            />
          )}

          {!world ? (
            <p className="text-sm italic text-[#5c3a1e]/60 text-center py-2">Select a world to view enemies.</p>
          ) : worldEnemies.length === 0 ? (
            <p className="text-sm italic text-[#5c3a1e]/60 text-center py-2">No enemies match.</p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto themed-scrollbar pr-1">
              {worldEnemies.map((enemy, i) => (
                <EnemyRow key={enemy.id ?? enemy.name ?? i} enemy={enemy} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function DMDeckExplorer() {
  const flatTotal = DECKS.reduce((s, d) => s + (Array.isArray(d.cards) ? d.cards.length : 0), 0);
  const enemyTotal = Object.values(ENEMY_CARDS).reduce((s, a) => s + a.length, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base text-[#3b2f1d]">Deck Explorer</h3>
        <span className="text-xs text-[#5c3a1e]/60">
          {flatTotal + enemyTotal} total cards
        </span>
      </div>
      {DECKS.map(deck => (
        <DeckSection key={deck.id} deck={deck} />
      ))}
      <EnemySection />
    </div>
  );
}
