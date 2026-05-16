import React, { useMemo } from 'react';
import { useAdventure } from '../context/AdventureContext';
import { usePosse } from '../context/PosseContext';
import { useWorld } from '../context/WorldContext';
import { useCombatState } from '../hooks/useCombatState';
import { getHBtDThreshold } from '../data/depthEvents/depthEventLookup';

// ---------------------------------------------------------------------------
// World themes
// ---------------------------------------------------------------------------

const WORLD_THEMES = {
  'Mines': {
    pageStyle:   { background: 'radial-gradient(ellipse at top, #1c120a 0%, #0a0704 100%)' },
    sectionCls:  'bg-stone-900/80 border-stone-700',
    headerCls:   'text-amber-400',
    subCls:      'text-amber-200/70',
    accentCls:   'bg-amber-900/60 border-amber-600 text-amber-200',
    trackDefault:'bg-stone-700 border-stone-500 text-stone-400',
    trackConsumed:'bg-stone-950 border-stone-900 text-stone-800',
    trackGD:     'bg-green-950 border-green-700 text-green-400',
    trackBS:     'bg-red-950  border-red-800  text-red-500',
    heroBg:      'bg-stone-800 border-stone-600',
    heroBgKO:    'bg-red-950/40 border-red-700',
    dieCls:      'bg-stone-900 border-stone-600 text-amber-200',
    rollSuccess: 'bg-green-950/40 border-green-700',
    rollFail:    'bg-red-950/40  border-red-800',
    rollDoubles: 'bg-amber-950/40 border-amber-600',
    posseHeader: 'text-amber-400',
    flavor:      'The Mines of Brimstone',
  },
  'Targa Plateau': {
    pageStyle:   { background: 'radial-gradient(ellipse at top, #060d1a 0%, #020408 100%)' },
    sectionCls:  'bg-slate-900/80 border-cyan-900',
    headerCls:   'text-cyan-300',
    subCls:      'text-cyan-100/60',
    accentCls:   'bg-cyan-900/50 border-cyan-600 text-cyan-200',
    trackDefault:'bg-slate-700 border-slate-500 text-slate-400',
    trackConsumed:'bg-slate-950 border-slate-900 text-slate-800',
    trackGD:     'bg-green-950 border-green-700 text-green-400',
    trackBS:     'bg-red-950  border-red-800  text-red-500',
    heroBg:      'bg-slate-800 border-cyan-900',
    heroBgKO:    'bg-red-950/40 border-red-700',
    dieCls:      'bg-slate-900 border-slate-600 text-cyan-200',
    rollSuccess: 'bg-green-950/40 border-green-700',
    rollFail:    'bg-red-950/40  border-red-800',
    rollDoubles: 'bg-cyan-950/40 border-cyan-600',
    posseHeader: 'text-cyan-300',
    flavor:      'Targa Plateau — The Alien Ice World',
  },
  'Swamps of Jargono': {
    pageStyle:   { background: 'radial-gradient(ellipse at top, #071208 0%, #020602 100%)' },
    sectionCls:  'bg-green-950/70 border-green-800',
    headerCls:   'text-green-400',
    subCls:      'text-green-200/60',
    accentCls:   'bg-green-900/50 border-green-600 text-green-200',
    trackDefault:'bg-green-900/60 border-green-700 text-green-400',
    trackConsumed:'bg-green-950 border-green-950 text-green-900',
    trackGD:     'bg-green-950 border-green-700 text-green-400',
    trackBS:     'bg-red-950  border-red-800  text-red-500',
    heroBg:      'bg-green-950/60 border-green-700',
    heroBgKO:    'bg-red-950/40 border-red-700',
    dieCls:      'bg-green-950 border-green-700 text-green-200',
    rollSuccess: 'bg-green-950/60 border-green-600',
    rollFail:    'bg-red-950/40  border-red-800',
    rollDoubles: 'bg-green-900/40 border-green-500',
    posseHeader: 'text-green-400',
    flavor:      'Swamps of Jargono — The Ancient Jungle',
  },
  'Derelict Ship': {
    pageStyle:   { background: 'radial-gradient(ellipse at top, #05100f 0%, #020808 100%)' },
    sectionCls:  'bg-gray-900/80 border-teal-900',
    headerCls:   'text-teal-300',
    subCls:      'text-teal-100/50',
    accentCls:   'bg-teal-900/40 border-teal-600 text-teal-200',
    trackDefault:'bg-gray-700 border-gray-600 text-gray-400',
    trackConsumed:'bg-gray-950 border-gray-900 text-gray-800',
    trackGD:     'bg-green-950 border-green-700 text-green-400',
    trackBS:     'bg-red-950  border-red-800  text-red-500',
    heroBg:      'bg-gray-800 border-teal-800',
    heroBgKO:    'bg-red-950/40 border-red-700',
    dieCls:      'bg-gray-900 border-teal-800 text-teal-200',
    rollSuccess: 'bg-green-950/40 border-green-700',
    rollFail:    'bg-red-950/40  border-red-800',
    rollDoubles: 'bg-teal-950/40 border-teal-600',
    posseHeader: 'text-teal-300',
    flavor:      'Derelict Ship — Adrift in the Void',
  },
  'Canyons': {
    pageStyle:   { background: 'radial-gradient(ellipse at top, #1a0800 0%, #0d0300 100%)' },
    sectionCls:  'bg-orange-950/60 border-orange-900',
    headerCls:   'text-orange-400',
    subCls:      'text-orange-200/60',
    accentCls:   'bg-orange-900/50 border-orange-600 text-orange-200',
    trackDefault:'bg-red-900/40 border-red-800 text-red-300',
    trackConsumed:'bg-red-950 border-red-950 text-red-900',
    trackGD:     'bg-green-950 border-green-700 text-green-400',
    trackBS:     'bg-red-950  border-red-800  text-red-500',
    heroBg:      'bg-orange-950/50 border-orange-800',
    heroBgKO:    'bg-red-950/40 border-red-700',
    dieCls:      'bg-orange-950 border-orange-700 text-orange-200',
    rollSuccess: 'bg-green-950/40 border-green-700',
    rollFail:    'bg-red-950/40  border-red-800',
    rollDoubles: 'bg-orange-950/40 border-orange-600',
    posseHeader: 'text-orange-400',
    flavor:      'The Canyons — Bone-Dry Badlands',
  },
  'Blasted Wastes': {
    pageStyle:   { background: 'radial-gradient(ellipse at top, #150f03 0%, #090602 100%)' },
    sectionCls:  'bg-yellow-950/50 border-yellow-900',
    headerCls:   'text-yellow-500',
    subCls:      'text-yellow-200/50',
    accentCls:   'bg-yellow-900/40 border-yellow-700 text-yellow-200',
    trackDefault:'bg-yellow-950/60 border-yellow-800 text-yellow-600',
    trackConsumed:'bg-gray-950 border-gray-900 text-gray-800',
    trackGD:     'bg-green-950 border-green-700 text-green-400',
    trackBS:     'bg-red-950  border-red-800  text-red-500',
    heroBg:      'bg-yellow-950/40 border-yellow-800',
    heroBgKO:    'bg-red-950/40 border-red-700',
    dieCls:      'bg-yellow-950 border-yellow-700 text-yellow-200',
    rollSuccess: 'bg-green-950/40 border-green-700',
    rollFail:    'bg-red-950/40  border-red-800',
    rollDoubles: 'bg-yellow-950/40 border-yellow-600',
    posseHeader: 'text-yellow-500',
    flavor:      'Blasted Wastes — The Scorched Earth',
  },
  'Frontier Town': {
    pageStyle:   { background: 'radial-gradient(ellipse at top, #1a1008 0%, #0d0804 100%)' },
    sectionCls:  'bg-leather-dark/60 border-leather',
    headerCls:   'text-brass',
    subCls:      'text-parchment/60',
    accentCls:   'bg-brass/20 border-brass text-parchment',
    trackDefault:'bg-leather/40 border-leather text-parchment-dark',
    trackConsumed:'bg-shadow border-shadow-light text-shadow-light',
    trackGD:     'bg-green-950 border-green-700 text-green-400',
    trackBS:     'bg-red-950  border-red-800  text-red-500',
    heroBg:      'bg-leather-dark/60 border-leather',
    heroBgKO:    'bg-red-950/40 border-blood',
    dieCls:      'bg-shadow border-leather text-parchment',
    rollSuccess: 'bg-green-950/40 border-green-700',
    rollFail:    'bg-red-950/40  border-blood',
    rollDoubles: 'bg-brass/10 border-brass',
    posseHeader: 'text-brass',
    flavor:      'Frontier Town — The Last Safe Place',
  },
};

const DEFAULT_THEME = WORLD_THEMES['Mines'];

function getTheme(world) {
  return WORLD_THEMES[world] ?? DEFAULT_THEME;
}

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

function GritRow({ current, max, theme }) {
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

function HeroCard({ hero, theme }) {
  const s = hero.stats ?? {};
  const isKO = (hero.currentHealth ?? 0) <= 0 || (hero.currentSanity ?? 0) <= 0;

  const posseConditions = useMemo(() => [
    ...(hero.injuries  ?? []).filter(c => c?.posseEffect === true).map(c => ({ ...c, type: 'Injury'   })),
    ...(hero.madness   ?? []).filter(c => c?.posseEffect === true).map(c => ({ ...c, type: 'Madness'  })),
    ...(hero.mutations ?? []).filter(c => c?.posseEffect === true).map(c => ({ ...c, type: 'Mutation' })),
  ], [hero.injuries, hero.madness, hero.mutations]);

  const cardCls = isKO ? theme.heroBgKO : theme.heroBg;

  return (
    <div className={`rounded-2xl border p-4 md:p-5 space-y-3 ${cardCls}`}>
      {/* Name + class row */}
      <div className="flex items-baseline gap-2 flex-wrap">
        <h2 className={`text-2xl font-extrabold leading-tight ${theme.headerCls}`}>
          {hero.name || 'Unknown Hero'}
        </h2>
        <span className="text-base text-gray-300">{hero.heroClass || ''}</span>
        {isKO && (
          <span className="ml-auto text-sm font-bold text-red-400 animate-pulse">KO</span>
        )}
      </div>

      {/* Resource bars */}
      <div className="space-y-2.5">
        <ResourceBar
          label="Health"
          current={hero.currentHealth}
          max={hero.maxHealth ?? 10}
          colorClass="bg-blood"
          trackClass="bg-gray-700/80"
        />
        <ResourceBar
          label="Sanity"
          current={hero.currentSanity}
          max={hero.maxSanity ?? 10}
          colorClass="bg-indigo-500"
          trackClass="bg-gray-700/80"
        />
        <ResourceBar
          label="Corruption"
          current={hero.currentCorruption ?? 0}
          max={hero.maxCorruption ?? 5}
          colorClass="bg-corruption"
          trackClass="bg-gray-700/80"
        />
      </div>

      {/* Grit + Gold + XP */}
      <div className="flex flex-wrap items-center gap-3">
        <GritRow current={hero.currentGrit} max={hero.Grit} theme={theme} />
        <div className="flex gap-2 ml-auto">
          <span className={`text-sm px-2.5 py-0.5 rounded-full font-semibold ${theme.accentCls}`}>
            ${hero.gold ?? 0}
          </span>
          <span className="text-sm bg-gray-700/60 border border-gray-600 text-gray-300 px-2.5 py-0.5 rounded-full font-semibold">
            {hero.xp ?? 0} XP
          </span>
        </div>
      </div>

      {/* 6 dice-pool stats */}
      <div className="grid grid-cols-6 gap-1 text-center bg-black/20 rounded-xl px-2 py-2">
        {[
          ['STR', s.Strength],
          ['AGI', s.Agility],
          ['CUN', s.Cunning],
          ['SPI', s.Spirit],
          ['LOR', s.Lore],
          ['LGK', s.Luck],
        ].map(([abbr, val]) => (
          <div key={abbr} className="flex flex-col items-center leading-none gap-0.5">
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">{abbr}</span>
            <span className={`text-lg font-extrabold ${theme.headerCls}`}>{val ?? '—'}</span>
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
            className="text-sm bg-black/20 border border-white/10 text-gray-300 px-2.5 py-0.5 rounded font-medium"
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

function DepthTrack({ state, theme }) {
  const {
    depth       = 0,
    darkness    = 0,
    trackLength = 15,
    turn        = 1,
    growingDreadSpaces = [],
    bloodSpatterSpaces = [],
  } = state;

  const threshold = getHBtDThreshold(depth);

  // Slots: [P-entry] [space 15..1] [D-entry]
  const slots = useMemo(() => {
    const s = [{ type: 'entry', side: 'posse' }];
    for (let i = 1; i <= trackLength; i++) {
      s.push({ type: 'space', spaceNum: trackLength + 1 - i });
    }
    s.push({ type: 'entry', side: 'darkness' });
    return s;
  }, [trackLength]);

  const posseSlot    = depth;
  const darknessSlot = (trackLength + 1) - darkness;

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-3">
        <span className={`text-xl font-extrabold uppercase tracking-widest flex items-center gap-2 ${theme.headerCls}`}>
          ⚔ DEPTH TRACK
        </span>
        <span className="text-sm text-gray-300">
          Depth <strong className="text-white">{depth}</strong>
        </span>
        <span className={`text-sm px-2.5 py-0.5 rounded-full font-bold border ${theme.accentCls}`}>
          HBD {threshold}+
        </span>
        <span className="text-gray-500 text-sm">Turn {turn}</span>

        {/* Legend */}
        <div className="flex gap-3 ml-auto text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className={`inline-block w-3 h-3 rounded-sm border ${theme.trackBS}`} /> BS Card
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`inline-block w-3 h-3 rounded-sm border ${theme.trackGD}`} /> GD Card
          </span>
        </div>
      </div>

      {/* Slots */}
      <div className="overflow-x-auto">
        <div className="flex gap-1.5 pb-3 min-w-max">
          {slots.map((slot, i) => {
            const isParty = i === posseSlot;
            const isDark  = i === darknessSlot;
            const consumed = i > darknessSlot;

            if (slot.type === 'entry') {
              const isPosse = slot.side === 'posse';
              return (
                <div
                  key={i}
                  className={`relative flex flex-col items-center justify-center w-12 h-14 rounded-lg border-2 border-dashed shrink-0 text-xs font-bold ${
                    isPosse ? 'border-blue-500 text-blue-400 bg-blue-950/30'
                            : 'border-red-600  text-red-400  bg-red-950/30'
                  }`}
                >
                  <span className="leading-none">{isPosse ? 'P' : 'D'}</span>
                  <span className="text-[9px] mt-0.5 opacity-70">{isPosse ? 'START' : 'DARK'}</span>
                  {isParty && (
                    <div className="absolute -top-2 w-5 h-5 rounded-full bg-blue-500 border-2 border-blue-700 flex items-center justify-center text-white text-[9px] font-bold shadow">P</div>
                  )}
                  {isDark && (
                    <div className="absolute -bottom-2 w-5 h-5 rounded-full bg-red-600 border-2 border-red-800 flex items-center justify-center text-white text-[9px] font-bold shadow">D</div>
                  )}
                </div>
              );
            }

            const { spaceNum } = slot;
            const isGD = growingDreadSpaces.includes(spaceNum);
            const isBS = bloodSpatterSpaces.includes(spaceNum);
            const spaceCls = consumed ? theme.trackConsumed
              : isGD ? theme.trackGD
              : isBS ? theme.trackBS
              : theme.trackDefault;

            return (
              <div
                key={i}
                className={`relative flex flex-col items-center justify-center w-10 h-14 rounded-lg border-2 shrink-0 font-mono font-bold ${spaceCls}`}
              >
                <span className={`text-sm leading-none ${consumed ? 'opacity-30' : ''}`}>{spaceNum}</span>
                {!consumed && isGD && <span className="text-[9px] text-green-400 leading-none mt-0.5">GD</span>}
                {!consumed && isBS && <span className="text-[9px] text-red-400 leading-none mt-0.5">BS</span>}
                {isParty && (
                  <div className="absolute -top-2 w-5 h-5 rounded-full bg-blue-500 border-2 border-blue-700 flex items-center justify-center text-white text-[9px] font-bold shadow">P</div>
                )}
                {isDark && (
                  <div className="absolute -bottom-2 w-5 h-5 rounded-full bg-red-600 border-2 border-red-800 flex items-center justify-center text-white text-[9px] font-bold shadow">D</div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-600 px-1">
          <span>← Posse Entry</span>
          <span>Darkness Entry →</span>
        </div>
      </div>

      <div className="flex gap-4 text-xs text-gray-500">
        <span><strong className="text-blue-300">P</strong> = Posse</span>
        <span><strong className="text-red-400">D</strong> = Darkness</span>
        <span>Dark spaces = consumed</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Last HBtD roll badge
// ---------------------------------------------------------------------------

function LastRollBadge({ lastRoll, theme }) {
  if (!lastRoll || !isRecent(lastRoll.timestamp)) return null;

  const { die1, die2, roll, threshold, success, isDoubles, depthEvent, rolledBy, landedOnGD, landedOnBS } = lastRoll;

  const cls = isDoubles ? theme.rollDoubles
    : success            ? theme.rollSuccess
    :                      theme.rollFail;

  return (
    <div className={`rounded-xl border px-4 py-3 space-y-2 ${cls}`}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          Last HBtD{rolledBy ? ` — ${rolledBy}` : ''}
        </span>

        {/* Dice */}
        <div className="flex items-center gap-2">
          {[die1, die2].map((d, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border-2 font-extrabold text-xl leading-none ${theme.dieCls}`}
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
          <span className="px-2.5 py-0.5 rounded-full bg-red-900/60 border border-red-700 text-red-300 text-sm font-bold">
            FAIL — Darkness advances
          </span>
        )}

        {!isDoubles && landedOnBS && (
          <span className="px-2.5 py-0.5 rounded-full bg-red-900/50 border border-red-700 text-red-200 text-sm font-bold">
            Darkness Card!
          </span>
        )}
        {!isDoubles && landedOnGD && (
          <span className="px-2.5 py-0.5 rounded-full bg-green-900/50 border border-green-600 text-green-200 text-sm font-bold">
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
  const { combatGroups } = useCombatState();

  const theme  = useMemo(() => getTheme(world), [world]);
  const heroes = useMemo(() => (Array.isArray(posse) ? posse : []), [posse]);

  return (
    <div
      className="min-h-screen text-white p-4 md:p-6 space-y-6"
      style={theme.pageStyle}
    >
      {/* ── Header ── */}
      <header className="flex flex-wrap items-baseline gap-3 border-b border-white/10 pb-4">
        <h1 className={`text-3xl md:text-4xl font-extrabold tracking-widest uppercase ${theme.headerCls}`}>
          Shadows of Brimstone
        </h1>
        {world && (
          <span className={`text-lg font-semibold ${theme.subCls}`}>
            — {theme.flavor ?? world}
          </span>
        )}
        {state?.active && (
          <span className={`ml-auto flex items-center gap-2 border rounded-lg px-3 py-1.5 font-bold text-base ${theme.accentCls}`}>
            ⏳ Turn {state.turn ?? 1}
          </span>
        )}
      </header>

      {/* ── Adventure Track ── */}
      <section className={`border rounded-2xl p-4 md:p-6 space-y-4 ${theme.sectionCls}`}>
        {state?.active ? (
          <>
            <DepthTrack state={state} theme={theme} />
            {state.lastRoll && isRecent(state.lastRoll.timestamp) && (
              <LastRollBadge lastRoll={state.lastRoll} theme={theme} />
            )}
          </>
        ) : (
          <p className="text-center text-gray-500 text-lg italic py-6">
            No adventure currently active
          </p>
        )}
      </section>

      {/* ── Initiative Order ── */}
      {(() => {
        const heroEntries = heroes.map(h => ({
          name:       h.name || 'Hero',
          sub:        h.heroClass || h.class || '',
          initiative: Number(h.stats?.Initiative ?? h.initiative ?? 4),
          type:       'hero',
          id:         h.id ?? h.localId ?? h.name,
        }));
        const enemyEntries = (combatGroups || []).map(g => ({
          name:       g.name || 'Enemy',
          sub:        `×${g.count ?? 1}`,
          initiative: Number(g.baseStats?.initiative ?? 0),
          type:       'enemy',
          id:         g.id,
        }));
        const sorted = [...heroEntries, ...enemyEntries]
          .sort((a, b) => b.initiative - a.initiative || (a.type === 'enemy' ? -1 : 1));
        if (sorted.length === 0) return null;
        return (
          <section className={`border rounded-2xl p-4 md:p-5 space-y-3 ${theme.sectionCls}`}>
            <h2 className={`text-xl font-extrabold uppercase tracking-widest flex items-center gap-2 ${theme.posseHeader}`}>
              ⚔ INITIATIVE ORDER
            </h2>
            <div className="flex flex-wrap gap-3">
              {sorted.map((entry, idx) => (
                <div
                  key={entry.id ?? idx}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 border min-w-[160px] ${
                    entry.type === 'enemy'
                      ? 'bg-red-950/40 border-red-700/60'
                      : 'bg-black/30 border-white/10'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-base font-extrabold shrink-0 ${theme.accentCls}`}>
                    {idx + 1}
                  </span>
                  <div>
                    <div className={`font-bold text-base leading-tight ${entry.type === 'enemy' ? 'text-red-300' : 'text-white'}`}>
                      {entry.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {entry.sub}{entry.sub ? ' — ' : ''}Init {entry.initiative}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* ── Posse Grid ── */}
      <section className="space-y-3">
        <h2 className={`text-2xl font-extrabold uppercase tracking-widest flex items-center gap-2 ${theme.posseHeader}`}>
          👥 POSSE{heroes.length > 0 ? ` (${heroes.length})` : ''}
        </h2>

        {heroes.length === 0 ? (
          <div className={`border rounded-2xl p-8 text-center ${theme.sectionCls}`}>
            <p className="text-gray-500 text-lg italic">No heroes in posse</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {heroes.map(hero => (
              <HeroCard key={hero.id ?? hero.localId ?? hero.name} hero={hero} theme={theme} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
