// src/components/DM/DMRuinousNightmaresPanel.jsx
import React, { useState } from 'react';
import { useRuinousNightmaresState } from '../../hooks/useRuinousNightmaresState';
import { NIGHTMARE_CARDS, RUINOUS_NIGHTMARES_RULES, UNIQUE_NIGHTMARE_CARD_TYPES } from '../../data/missionModifiers/ruinousNightmares';

function Section({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md border border-[#8b6b46]/40 bg-white/80">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-left"
      >
        <span className="font-semibold text-sm text-[#3b2f1d]">{title}</span>
        <span className="text-[#8b6b46] text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-[#8b6b46]/20 pt-2">
          {children}
        </div>
      )}
    </div>
  );
}

function NightmareCardDisplay({ card, highlight }) {
  return (
    <div className={`rounded-lg border-2 p-3 ${
      highlight
        ? 'border-purple-500 bg-purple-50'
        : 'border-[#8b6b46]/40 bg-[#fdf6e3]'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="font-bold text-sm text-[#3b2f1d]">{card.name}</span>
        {card.promoId && (
          <span className="text-[10px] text-gray-400 shrink-0">{card.promoId}</span>
        )}
      </div>
      {card.flavor && (
        <p className="text-xs italic text-gray-500 mb-2">{card.flavor}</p>
      )}
      <ul className="space-y-1">
        {card.effects.map((e, i) => (
          <li key={i} className="text-xs text-gray-800 flex gap-1.5">
            <span className="text-purple-600 shrink-0">•</span>
            <span>{e}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IdlePhase({ state, setLevel, drawFightCards }) {
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-[#8b6b46]/40 p-3 bg-white/80 space-y-2">
        <div className="font-semibold text-sm text-[#3b2f1d]">Core Rules</div>
        <ul className="space-y-1.5 text-xs text-gray-700">
          {RUINOUS_NIGHTMARES_RULES.rules.map((r, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-purple-600 shrink-0">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-md border border-purple-300 bg-purple-50 p-3 space-y-3">
        <div className="font-semibold text-sm text-[#3b2f1d]">Nightmare Level</div>
        <div className="flex gap-2">
          {[1, 2, 3].map(n => (
            <button
              key={n}
              onClick={() => setLevel(n)}
              className={`flex-1 py-2 rounded-lg border-2 text-sm font-bold transition-colors ${
                state.level === n
                  ? 'border-purple-600 bg-purple-600 text-white'
                  : 'border-purple-300 bg-white text-purple-700 hover:bg-purple-100'
              }`}
            >
              Level {n}
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-600">
          Draw <b>{state.level}</b> card{state.level > 1 ? 's' : ''} at the start of each Fight.
          Reward: <b>+{state.level * 20} XP or ${state.level * 200}</b> per Hero per Fight.
        </div>

        <button
          className="w-full py-2 rounded-lg bg-purple-700 text-white text-sm font-bold border border-purple-800 hover:bg-purple-800 transition-colors"
          onClick={drawFightCards}
        >
          Draw Cards for This Fight
        </button>
      </div>
    </div>
  );
}

function FightPhase({ state, endFight }) {
  const activeCards = state.activeCardIds.map(id => NIGHTMARE_CARDS.find(c => c.id === id)).filter(Boolean);
  const cardCount = activeCards.length;

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-purple-400 bg-purple-50 p-3">
        <div className="font-semibold text-sm text-[#3b2f1d] mb-1">
          Active Nightmare Cards ({cardCount})
        </div>
        <div className="text-xs text-gray-600 mb-2">
          These effects apply for the duration of this Fight.
        </div>
        <div className="space-y-2">
          {activeCards.map((card, i) => (
            <NightmareCardDisplay key={`${card.id}-${i}`} card={card} highlight />
          ))}
        </div>
      </div>

      <div className="rounded-md border border-green-300 bg-green-50 p-3">
        <div className="font-semibold text-sm text-[#3b2f1d] mb-1">End of Fight Reward</div>
        <div className="text-sm text-green-800">
          For each Nightmare card used, each Hero may choose:
        </div>
        <div className="mt-2 flex gap-3 text-sm font-bold text-green-900">
          <span>+{cardCount * 20} XP</span>
          <span className="text-gray-400">or</span>
          <span>${cardCount * 200}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          ({cardCount} card{cardCount !== 1 ? 's' : ''} × +20 XP or $200 each, chosen per Hero independently)
        </div>
      </div>

      <button
        className="w-full py-2 rounded-lg bg-gray-600 text-white text-sm font-bold border border-gray-700 hover:bg-gray-700 transition-colors"
        onClick={endFight}
      >
        End Fight — Ready for Next Draw
      </button>
    </div>
  );
}

export default function DMRuinousNightmaresPanel() {
  const { state, toggleActive, setLevel, drawFightCards, endFight, reset } = useRuinousNightmaresState();

  const uniqueCardTypes = UNIQUE_NIGHTMARE_CARD_TYPES.length;
  const totalCards = NIGHTMARE_CARDS.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-bold text-[#3b2f1d]">Ruinous Nightmares</div>
          <div className="text-xs text-gray-500">
            {totalCards}-card deck ({uniqueCardTypes} types) — shuffle before each Fight
          </div>
        </div>
        <div className="flex items-center gap-2">
          {state.active && (
            <button
              className="px-2 py-1 rounded text-xs font-semibold border border-red-300 text-red-600 hover:bg-red-50"
              onClick={reset}
            >
              Reset
            </button>
          )}
          <button
            onClick={toggleActive}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              state.active
                ? 'bg-purple-700 text-white border-purple-800'
                : 'bg-gray-100 text-gray-600 border-gray-300'
            }`}
          >
            {state.active ? 'Active' : 'Inactive'}
          </button>
        </div>
      </div>

      {state.active && (
        state.phase === 'fight'
          ? <FightPhase state={state} endFight={endFight} />
          : <IdlePhase state={state} setLevel={setLevel} drawFightCards={drawFightCards} />
      )}

      <Section title={`All Nightmare Cards (${totalCards} cards, ${uniqueCardTypes} types)`}>
        <div className="space-y-2">
          {/* Show unique types only in reference list */}
          {NIGHTMARE_CARDS.filter((c, i, arr) => arr.findIndex(x => x.name === c.name) === i).map(card => (
            <NightmareCardDisplay key={card.id} card={card} highlight={false} />
          ))}
        </div>
      </Section>
    </div>
  );
}
