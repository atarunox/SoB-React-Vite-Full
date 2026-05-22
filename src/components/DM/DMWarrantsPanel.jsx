import React, { useState } from 'react';
import { useWarrantsState } from '../../hooks/useWarrantsState';
import { WARRANT_CARDS, WARRANTS_ENCOUNTERS, WARRANTS_GEAR, ON_THE_RUN_TRAIT } from '../../data/missionModifiers/warrants';

// ── Shared helpers ────────────────────────────────────────────────────────────
function Tag({ label }) {
  return (
    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-100 text-amber-800 border border-amber-300">
      {label}
    </span>
  );
}

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
      {open && <div className="px-3 pb-3 space-y-2 border-t border-[#8b6b46]/20 pt-2">{children}</div>}
    </div>
  );
}

function EffectList({ effects }) {
  return (
    <ul className="space-y-1">
      {effects.map((e, i) => (
        <li key={i} className="text-xs text-gray-700 flex gap-1.5">
          <span className="text-amber-600 shrink-0">•</span>
          <span>{e}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Warrant card display ──────────────────────────────────────────────────────
function WarrantCard({ card, active, onSelect }) {
  return (
    <div
      className={`rounded-lg border-2 p-3 cursor-pointer transition-colors ${
        active
          ? 'border-amber-500 bg-amber-50'
          : 'border-[#8b6b46]/40 bg-[#fdf6e3] hover:border-[#8b6b46]'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="font-bold text-sm text-[#3b2f1d]">{card.name}</span>
        <span className="text-[10px] text-gray-500 shrink-0">{card.promoId}</span>
      </div>
      <div className="flex gap-1 mb-2">
        {card.tags.map(t => <Tag key={t} label={t} />)}
      </div>
      <EffectList effects={card.effects} />
    </div>
  );
}

// ── Idle Phase ────────────────────────────────────────────────────────────────
function IdlePhase({ state, drawWarrant, setWarrant, toggleActive }) {
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-[#8b6b46]/40 p-3 bg-white/80 space-y-2">
        <div className="font-semibold text-sm text-[#3b2f1d]">Core Rules</div>
        <ul className="space-y-1.5 text-xs text-gray-700">
          <li className="flex gap-1.5"><span className="text-amber-600 shrink-0">•</span><span>Requires at least one Hero with the Law keyword.</span></li>
          <li className="flex gap-1.5"><span className="text-amber-600 shrink-0">•</span><span>Whenever the Heroes draw one or more Encounters, also draw one Warrants Encounter.</span></li>
          <li className="flex gap-1.5"><span className="text-amber-600 shrink-0">•</span><span>Before the Adventure begins, draw 1 Warrant card. Its effects are active for the entire Adventure.</span></li>
          <li className="flex gap-1.5"><span className="text-amber-600 shrink-0">•</span><span>The DM may apply the "On the Run" Trait to any Enemy group (Outlaw keyword, +1 Initiative, +2 Move, Cover 5+, Bounty).</span></li>
        </ul>
      </div>

      {state.active && (
        <div className="rounded-md border border-amber-400 bg-amber-50 p-3 space-y-2">
          <div className="font-semibold text-sm text-[#3b2f1d]">Draw Warrant</div>
          <div className="flex gap-2 flex-wrap">
            <button
              className="btn btn-sm bg-amber-700 text-white border-amber-800 hover:bg-amber-800"
              onClick={() => drawWarrant(WARRANT_CARDS)}
            >
              Draw Random
            </button>
          </div>
          <div className="text-xs text-gray-600">Or pick manually:</div>
          <div className="space-y-2">
            {WARRANT_CARDS.map(c => (
              <button
                key={c.id}
                className="w-full text-left px-2 py-1.5 rounded border border-[#8b6b46]/40 bg-white hover:bg-amber-50 text-xs font-medium text-[#3b2f1d]"
                onClick={() => setWarrant(c.id)}
              >
                {c.name} <span className="text-gray-400 font-normal">— {c.promoId}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Adventure Phase ───────────────────────────────────────────────────────────
function AdventurePhase({ state, adjustMarkers, markTargetDefeated, reset }) {
  const warrant = WARRANT_CARDS.find(c => c.id === state.drawnWarrantId);
  if (!warrant) return <div className="text-sm text-gray-500">No warrant drawn.</div>;

  const isSearchAndSeizure = warrant.id === 'search_and_seizure';
  const isWanted = warrant.id === 'wanted_in_3_worlds';

  return (
    <div className="space-y-3">
      {/* Active warrant */}
      <div className="rounded-lg border-2 border-amber-500 bg-amber-50 p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="font-bold text-[#3b2f1d]">{warrant.name}</span>
          <span className="text-[10px] text-gray-500">{warrant.promoId}</span>
        </div>
        <div className="flex gap-1 mb-2">
          {warrant.tags.map(t => <Tag key={t} label={t} />)}
        </div>
        <EffectList effects={warrant.effects} />
      </div>

      {/* Search and Seizure tracker */}
      {isSearchAndSeizure && (
        <div className="rounded-md border border-[#8b6b46]/40 p-3 bg-white/80">
          <div className="font-semibold text-sm text-[#3b2f1d] mb-2">Sanity Markers (Map Tiles)</div>
          <div className="flex items-center gap-3">
            <button className="btn btn-sm btn-ghost" onClick={() => adjustMarkers(-1)}>−</button>
            <span className="text-2xl font-bold text-[#3b2f1d] min-w-[2rem] text-center">{state.sanctionMarkers}</span>
            <button className="btn btn-sm" onClick={() => adjustMarkers(1)}>+</button>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            End of Adventure: each Law Hero gains <b>${state.sanctionMarkers * 50}</b> ({state.sanctionMarkers} markers × $50)
          </div>
        </div>
      )}

      {/* Wanted in 3 Worlds target tracker */}
      {isWanted && (
        <div className="rounded-md border border-[#8b6b46]/40 p-3 bg-white/80">
          <div className="font-semibold text-sm text-[#3b2f1d] mb-2">Warrant Target</div>
          {state.warrantTargetDefeated ? (
            <div className="text-sm text-green-700 font-semibold">✓ Target Defeated — distribute Bounty and Artifacts!</div>
          ) : (
            <button
              className="btn btn-sm bg-red-700 text-white border-red-800 hover:bg-red-800"
              onClick={markTargetDefeated}
            >
              Mark Target Defeated
            </button>
          )}
          <div className="mt-2 text-xs text-gray-600">
            Bounty: Peril Die {'{P}'} × $100 to each Hero. 3 Artifacts distributed by the killing-blow Hero.
          </div>
        </div>
      )}

      <button
        className="btn btn-sm btn-ghost text-red-700 border-red-300"
        onClick={reset}
      >
        End Adventure / Reset
      </button>
    </div>
  );
}

// ── Reference Sections ────────────────────────────────────────────────────────
function EncounterRef() {
  return (
    <div className="space-y-2">
      {WARRANTS_ENCOUNTERS.map(enc => (
        <div key={enc.id} className="rounded border border-[#8b6b46]/30 bg-[#fdf6e3] p-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-semibold text-xs text-[#3b2f1d]">{enc.name}</span>
            <span className="text-[10px] text-gray-400">{enc.promoId}</span>
          </div>
          <div className="flex gap-1 mb-1.5 flex-wrap">
            {enc.tags.map(t => <Tag key={t} label={t} />)}
          </div>
          <EffectList effects={enc.effects} />
        </div>
      ))}
    </div>
  );
}

function GearRef() {
  return (
    <div className="space-y-2">
      {WARRANTS_GEAR.map(g => (
        <div key={g.id} className="rounded border border-[#8b6b46]/30 bg-[#fdf6e3] p-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-semibold text-xs text-[#3b2f1d]">{g.name}</span>
            <span className="text-xs text-amber-700 font-bold">${g.value}</span>
          </div>
          <div className="flex gap-1 mb-1.5 flex-wrap">
            {g.tags.map(t => <Tag key={t} label={t} />)}
            {g.restrictions?.map(r => (
              <span key={r} className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-red-100 text-red-700 border border-red-300">{r}</span>
            ))}
          </div>
          <EffectList effects={g.effects} />
        </div>
      ))}
    </div>
  );
}

function OnTheRunRef() {
  return (
    <div className="rounded border border-[#8b6b46]/30 bg-[#fdf6e3] p-2">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="font-semibold text-xs text-[#3b2f1d]">{ON_THE_RUN_TRAIT.name}</span>
        <span className="text-[10px] text-gray-400">{ON_THE_RUN_TRAIT.promoId}</span>
      </div>
      <EffectList effects={ON_THE_RUN_TRAIT.effects} />
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function DMWarrantsPanel() {
  const { state, toggleActive, drawWarrant, setWarrant, adjustMarkers, markTargetDefeated, reset } = useWarrantsState();

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-bold text-[#3b2f1d]">Warrants</div>
          <div className="text-xs text-gray-500">Requires at least one Law Hero</div>
        </div>
        <button
          onClick={toggleActive}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
            state.active
              ? 'bg-amber-700 text-white border-amber-800'
              : 'bg-gray-100 text-gray-600 border-gray-300'
          }`}
        >
          {state.active ? 'Active' : 'Inactive'}
        </button>
      </div>

      {/* Phase content */}
      {state.phase === 'idle' ? (
        <IdlePhase state={state} drawWarrant={drawWarrant} setWarrant={setWarrant} toggleActive={toggleActive} />
      ) : (
        <AdventurePhase state={state} adjustMarkers={adjustMarkers} markTargetDefeated={markTargetDefeated} reset={reset} />
      )}

      {/* Reference sections (always visible) */}
      <Section title={`Warrant Cards (${WARRANT_CARDS.length})`}>
        <div className="space-y-2">
          {WARRANT_CARDS.map(c => (
            <WarrantCard key={c.id} card={c} active={false} onSelect={() => {}} />
          ))}
        </div>
      </Section>

      <Section title={`Warrant Encounters (${WARRANTS_ENCOUNTERS.length})`}>
        <EncounterRef />
      </Section>

      <Section title={`Warrants Gear (${WARRANTS_GEAR.length})`}>
        <GearRef />
      </Section>

      <Section title="On the Run — Enemy Trait">
        <OnTheRunRef />
      </Section>
    </div>
  );
}
