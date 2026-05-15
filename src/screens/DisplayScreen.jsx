import React, { useMemo } from 'react';
import { useAdventure } from '../context/AdventureContext';
import { usePosse } from '../context/PosseContext';
import { useWorld } from '../context/WorldContext';
import { getHBtDThreshold } from '../data/depthEvents/depthEventLookup';

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val ?? min));
}

function fillPct(current, max) {
  if (!max || max <= 0) return 0;
  return clamp((current / max) * 100, 0, 100);
}

function isRecent(timestamp, maxMs = 120_000) {
  return timestamp && Date.now() - timestamp < maxMs;
}

// ---------------------------------------------------------------------------
// Resource bar
// ---------------------------------------------------------------------------

function ResourceBar({ label, current, max, colorClass, trackClass = 'bg-gray-700' }) {
  const pct = fillPct(current, max);
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
        <span className="text-sm font-bold text-white">
          {current ?? 0} / {max ?? 0}
        </span>
      </div>
      <div className={`h-4 rounded-full overflow-hidden ${trackClass}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grit token row
// ---------------------------------------------------------------------------

function GritRow({ current, max }) {
  const cap = Math.max(max ?? 2, 1);
  const cur = clamp(current ?? 0, 0, cap);
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-xs text-gray-400 uppercase tracking-wide">Grit</span>
      {Array.from({ length: cap }, (_, i) => (
        <span
          key={i}
          className={`w-4 h-4 rounded-full border-2 inline-block ${
            i < cur ? 'bg-brass border-brass' : 'bg-transparent border-gray-600'
          }`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-0.5">{cur}/{cap}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hero card
// ---------------------------------------------------------------------------

function HeroCard({ hero }) {
  const s = hero.stats ?? {};
  const isKO = (hero.currentHealth ?? 0) <= 0 || (hero.currentSanity ?? 0) <= 0;

  const posseConditions = useMemo(() => [
    ...(hero.injuries  ?? []).filter(c => c?.posseEffect === true).map(c => ({ ...c, type: 'Injury'   })),
    ...(hero.madness   ?? []).filter(c => c?.posseEffect === true).map(c => ({ ...c, type: 'Madness'  })),
    ...(hero.mutations ?? []).filter(c => c?.posseEffect === true).map(c => ({ ...c, type: 'Mutation' })),
  ], [hero.injuries, hero.madness, hero.mutations]);

  return (
    <div className={`
      rounded-2xl border p-4 md:p-5 space-y-3
      ${isKO
        ? 'border-blood bg-red-950/30'
        : 'border-gray-700 bg-gray-800'}
    `}>
      {/* Name + class row */}
      <div className="flex items-baseline gap-2 flex-wrap">
        <h2 className="text-2xl font-extrabold text-parchment leading-tight">
          {hero.name || 'Unknown Hero'}
        </h2>
        <span className="text-base text-brass">{hero.heroClass || ''}</span>
        {isKO && (
          <span className="ml-auto text-sm font-bold text-blood animate-pulse">KO</span>
        )}
      </div>

      {/* Resource bars */}
      <div className="space-y-2.5">
        <ResourceBar
          label="Health"
          current={hero.currentHealth}
          max={hero.maxHealth ?? 10}
          colorClass="bg-blood"
        />
        <ResourceBar
          label="Sanity"
          current={hero.currentSanity}
          max={hero.maxSanity ?? 10}
          colorClass="bg-indigo-500"
        />
        {(hero.currentCorruption ?? 0) > 0 && (
          <ResourceBar
            label="Corruption"
            current={hero.currentCorruption}
            max={hero.maxCorruption ?? 5}
            colorClass="bg-corruption"
          />
        )}
      </div>

      {/* Grit + Gold + XP */}
      <div className="flex flex-wrap items-center gap-3">
        <GritRow current={hero.currentGrit} max={hero.Grit} />
        <div className="flex gap-2 ml-auto">
          <span className="text-sm bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-2.5 py-0.5 rounded-full font-semibold">
            ${hero.gold ?? 0}
          </span>
          <span className="text-sm bg-gray-700/60 border border-gray-600 text-gray-300 px-2.5 py-0.5 rounded-full font-semibold">
            {hero.xp ?? 0} XP
          </span>
        </div>
      </div>

      {/* 6 dice-pool stats */}
      <div className="grid grid-cols-6 gap-1 text-center bg-gray-900/50 rounded-xl px-2 py-2">
        {[
          ['Str', s.Strength],
          ['Agi', s.Agility],
          ['Cun', s.Cunning],
          ['Spi', s.Spirit],
          ['Lor', s.Lore],
          ['Lck', s.Luck],
        ].map(([abbr, val]) => (
          <div key={abbr} className="flex flex-col items-center leading-none gap-0.5">
            <span className="text-[10px] text-gray-500 uppercase">{abbr}</span>
            <span className="text-lg font-extrabold text-parchment">{val ?? '—'}</span>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="flex flex-wrap gap-2">
        {[
          ['Init',   s.Initiative],
          ['Combat', s.Combat],
          ['Move',   s.Move],
        ].map(([label, val]) => (
          <span
            key={label}
            className="text-sm bg-gray-700 border border-gray-600 text-gray-200 px-2.5 py-0.5 rounded font-medium"
          >
            {label}: <strong className="text-white">{val ?? '—'}</strong>
          </span>
        ))}
      </div>

      {/* Posse-affecting conditions */}
      {posseConditions.length > 0 && (
        <div className="border border-orange-600 bg-orange-950/30 rounded-xl p-2.5 space-y-1.5">
          <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">
            Affects Whole Posse
          </p>
          {posseConditions.map((c, i) => (
            <div key={i} className="text-sm text-orange-200 leading-snug">
              <span className="font-semibold text-orange-300">[{c.type}] {c.name}:</span>{' '}
              <span className="text-orange-100">{c.effect}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Depth track
// ---------------------------------------------------------------------------

function DepthTrack({ state, world }) {
  const {
    depth       = 0,
    darkness    = 12,
    trackLength = 12,
    turn        = 1,
    growingDreadSpaces = [],
    bloodSpatterSpaces = [],
  } = state;

  const threshold = getHBtDThreshold(depth);

  // Spaces 0..trackLength
  const spaces = Array.from({ length: trackLength + 1 }, (_, i) => i);

  function spaceStyle(i) {
    // A space is "consumed by darkness" when darkness has advanced past it.
    // darkness counts DOWN from trackLength (starts at trackLength, goes to 0).
    // Consumed = i > darkness (ahead of the darkness front, i.e. already dark).
    const consumed   = i > darkness;
    const isGD       = growingDreadSpaces.includes(i);
    const isBS       = bloodSpatterSpaces.includes(i);

    if (consumed) return 'bg-gray-950 border-gray-800 text-gray-800';
    if (isGD)     return 'bg-purple-950 border-purple-600 text-purple-400';
    if (isBS)     return 'bg-red-950 border-red-800 text-red-500';
    return 'bg-gray-700 border-gray-500 text-gray-400';
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xl font-bold text-brass">Depth Track</span>
        <span className="text-base text-parchment">
          Depth <strong>{depth}</strong>
        </span>
        <span className="bg-amber-900/60 border border-amber-600 text-amber-200 text-sm px-2.5 py-0.5 rounded-full font-bold">
          HBtD {threshold}+
        </span>
        <span className="text-gray-500 text-sm">Turn {turn}</span>

        {/* Legend */}
        <div className="flex gap-3 ml-auto text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-red-950 border border-red-800" />
            Blood Spatter
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-purple-950 border border-purple-600" />
            Growing Dread
          </span>
        </div>
      </div>

      {/* Spaces */}
      <div className="overflow-x-auto">
        <div className="flex gap-1.5 pb-3 min-w-max">
          {spaces.map(i => {
            const isParty   = i === depth;
            const isDarkFront = i === darkness;

            return (
              <div
                key={i}
                className={`
                  relative flex items-center justify-center
                  w-10 h-12 rounded-lg border-2 shrink-0
                  text-xs font-mono font-bold
                  ${spaceStyle(i)}
                `}
              >
                {/* Space number (hidden behind markers) */}
                <span className={(isParty || isDarkFront) ? 'opacity-0' : ''}>{i}</span>

                {/* Party marker (top half) */}
                {isParty && (
                  <div className="absolute top-0.5 left-1/2 -translate-x-1/2">
                    <span className="text-[11px] font-extrabold text-blue-300 leading-none">P</span>
                  </div>
                )}

                {/* Darkness front marker (bottom half) */}
                {isDarkFront && (
                  <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2">
                    <span className="text-[11px] font-extrabold text-red-400 leading-none">D</span>
                  </div>
                )}

                {/* Combined — show both stacked */}
                {isParty && isDarkFront && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center leading-none gap-0.5">
                    <span className="text-[10px] font-extrabold text-blue-300">P</span>
                    <span className="text-[10px] font-extrabold text-red-400">D</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-600 px-1">
          <span>← Entrance (0)</span>
          <span>Deep ({trackLength}) →</span>
        </div>
      </div>

      {/* Marker key */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span><strong className="text-blue-300">P</strong> = Party position</span>
        <span><strong className="text-red-400">D</strong> = Darkness front</span>
        <span>Faded spaces = consumed by darkness</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Last HBtD roll badge
// ---------------------------------------------------------------------------

function LastRollBadge({ lastRoll }) {
  if (!lastRoll || !isRecent(lastRoll.timestamp)) return null;

  const { die1, die2, roll, threshold, success, isDoubles, depthEvent, rolledBy, landedOnGD, landedOnBS } = lastRoll;

  const borderColor = isDoubles ? 'border-yellow-500'
    : success                   ? 'border-green-600'
    :                             'border-blood';
  const bgColor = isDoubles ? 'bg-yellow-950/30'
    : success                ? 'bg-green-950/30'
    :                          'bg-red-950/30';

  return (
    <div className={`rounded-xl border px-4 py-3 space-y-2 ${borderColor} ${bgColor}`}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          Last HBtD{rolledBy ? ` — ${rolledBy}` : ''}
        </span>

        {/* Dice */}
        <div className="flex items-center gap-2">
          {[die1, die2].map((d, idx) => (
            <span
              key={idx}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 border-2 border-gray-600 text-parchment font-extrabold text-xl leading-none"
            >
              {d}
            </span>
          ))}
          <span className="text-gray-300 font-bold text-lg">= {roll}</span>
          <span className="text-gray-500 text-sm">vs {threshold}+</span>
        </div>

        {/* Result pill */}
        {isDoubles ? (
          <span className="px-2.5 py-0.5 rounded-full bg-yellow-800/60 border border-yellow-500 text-yellow-200 text-sm font-bold">
            DOUBLES — Depth Event!
          </span>
        ) : success ? (
          <span className="px-2.5 py-0.5 rounded-full bg-green-800/60 border border-green-600 text-green-200 text-sm font-bold">
            SUCCESS — Held!
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full bg-red-900/60 border border-blood text-red-300 text-sm font-bold">
            FAIL — Darkness advances
          </span>
        )}

        {!isDoubles && landedOnBS && (
          <span className="px-2.5 py-0.5 rounded-full bg-blood/50 border border-blood text-red-200 text-sm font-bold">
            Darkness Card!
          </span>
        )}
        {!isDoubles && landedOnGD && (
          <span className="px-2.5 py-0.5 rounded-full bg-purple-900/50 border border-purple-600 text-purple-200 text-sm font-bold">
            Growing Dread Card!
          </span>
        )}
      </div>

      {isDoubles && depthEvent && (
        <div className="text-sm text-yellow-100 bg-yellow-950/40 rounded-lg px-3 py-2 border border-yellow-700/40">
          <span className="font-bold text-yellow-300">Depth Event: </span>
          {depthEvent.name ?? depthEvent.title ?? 'See chart'}
          {depthEvent.effect && (
            <span className="block text-yellow-200/70 mt-0.5 text-xs break-words">{depthEvent.effect}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main DisplayScreen
// ---------------------------------------------------------------------------

export default function DisplayScreen() {
  const { state }  = useAdventure();
  const { posse }  = usePosse();
  const { world }  = useWorld();

  const heroes = useMemo(() => (Array.isArray(posse) ? posse : []), [posse]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 space-y-6">

      {/* ── Header ── */}
      <header className="flex flex-wrap items-baseline gap-3 border-b border-gray-800 pb-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-brass tracking-widest uppercase">
          Shadows of Brimstone
        </h1>
        {world && (
          <span className="text-xl text-parchment font-semibold">
            — {world}
          </span>
        )}
        {state?.active && (
          <span className="ml-auto text-base text-gray-400">
            Turn <strong className="text-parchment text-lg">{state.turn ?? 1}</strong>
          </span>
        )}
      </header>

      {/* ── Adventure Track ── */}
      <section className="bg-gray-900 border border-gray-700 rounded-2xl p-4 md:p-6 space-y-4">
        {state?.active ? (
          <>
            <DepthTrack state={state} world={world} />
            {state.lastRoll && isRecent(state.lastRoll.timestamp) && (
              <LastRollBadge lastRoll={state.lastRoll} />
            )}
          </>
        ) : (
          <p className="text-center text-gray-500 text-lg italic py-6">
            No adventure currently active
          </p>
        )}
      </section>

      {/* ── Posse Grid ── */}
      <section className="space-y-3">
        <h2 className="text-2xl font-bold text-brass uppercase tracking-wider">
          Posse{heroes.length > 0 ? ` (${heroes.length})` : ''}
        </h2>

        {heroes.length === 0 ? (
          <div className="bg-gray-900/60 border border-gray-700 rounded-2xl p-8 text-center">
            <p className="text-gray-500 text-lg italic">No heroes in posse</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {heroes.map(hero => (
              <HeroCard key={hero.id ?? hero.localId ?? hero.name} hero={hero} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
