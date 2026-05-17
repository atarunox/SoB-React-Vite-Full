import React, { useState } from "react";
import { getAllStatsWithBreakdown } from "../../utils/enemyModifiers";
import { TRAIT_DECKS } from "../../data/traitDecks";
import { ENEMY_TRAIT_CARDS, ENEMY_TRAIT_CONFIG, CORRUPTED_TRAIT } from "../../data/enemyCards/enemyTraitCards";
import { SPECIAL_ENEMIES_BY_BASE } from "../../data/enemyCards/specialEnemies";
import { DARKNESS_CARDS } from "../../data/darknessCards";
import { GROWING_DREAD_CARDS } from "../../data/growingDreadCards";
import StatBreakdownModal from "./StatBreakdownModal";
import { getEnemyDifficulty } from "../../utils/enemyUtils";

export default function EnemyGroupCard({
  group,
  groupIdx,
  setCombatGroups,
  allGroups,
  posse = [],
  globalModifiers = [],
}) {
  const [breakdownModal, setBreakdownModal] = useState({ show: false, stat: "", breakdown: null });
  const [manualOverrides, setManualOverrides] = useState(group.manualOverrides || {});
  const [showElite, setShowElite] = useState(false);
  const [traitRoll, setTraitRoll] = useState(null);

  const statBundle = getAllStatsWithBreakdown(group, globalModifiers, manualOverrides);

  const highestLevel = Math.max(...(posse.map(h => h.level || 1)), 1);
  const hasDrifter = posse.some(h => h.heroClass === "Drifter");
  const darknessPassed = globalModifiers.some(m => m.type === "darknessPassed");
  const growingDreadModifier = globalModifiers.reduce((sum, mod) => sum + (mod.eliteModifier || 0), 0);
  const manualExtraElite = group.manualExtraElite || 0;

  const { elite: eliteAbilities, brutal } = getEnemyDifficulty({
    heroLevel: highestLevel,
    hasDrifter,
    darknessPassed,
    growingDreadModifier,
    manualExtraElite,
  });

  // Use brutal flag from enemy data OR from posse level
  const isBrutal = brutal || group.baseStats?.brutal;

  function setManualElite(val) {
    const newGroups = [...allGroups];
    newGroups[groupIdx].manualExtraElite = val;
    setCombatGroups(newGroups);
  }

  const applyCorrupted = () => {
    const newGroups = [...allGroups];
    newGroups[groupIdx].modifiers.push({
      type: 'corrupted',
      name: CORRUPTED_TRAIT.name,
      description: CORRUPTED_TRAIT.effect,
    });
    setCombatGroups(newGroups);
  };

  const spawnSpecial = (special) => {
    const bs = group.baseStats || {};
    // Build adjusted base stats from deltas
    const baseHealth = Number(bs.health) || 0;
    const baseCombat = Number(bs.combat) || 0;
    const baseDefense = Number(bs.defense) || 0;
    const baseInit = Number(bs.initiative) || 0;

    const newHealth = Math.round(baseHealth * (special.statDeltas.healthMultiplier || 1)) + (special.statDeltas.healthBonus || 0);
    const newCombat = Math.round(baseCombat * (special.statDeltas.combatMultiplier || 1)) + (special.statDeltas.combatBonus || 0);
    const newDefense = baseDefense + (special.statDeltas.defenseBonus || 0);
    const newInit = baseInit + (special.statDeltas.initiativeBonus || 0);

    const specialGroup = {
      id: Date.now().toString(),
      name: special.name,
      count: 1,
      isSpecial: true,
      specialTheme: special.theme,
      specialSource: special.sourceCard,
      baseEnemyName: special.baseEnemyName,
      baseStats: {
        ...bs,
        health: newHealth || baseHealth,
        combat: newCombat || baseCombat,
        defense: newDefense || baseDefense,
        initiative: newInit || baseInit,
        xp: special.xpOverride ?? bs.xp,
        tough: special.statDeltas.tough || false,
        abilities: [
          ...(bs.abilities || []),
          ...special.extras.map(e => `[${special.name}] ${e}`),
        ],
      },
      modifiers: [],
      manualExtraElite: 0,
    };
    setCombatGroups([...allGroups, specialGroup]);
  };

  const drawTrait = () => {
    const traitDeck = TRAIT_DECKS[group.baseStats.world] || [];
    if (traitDeck.length === 0) return;
    const idx = Math.floor(Math.random() * traitDeck.length);
    const card = traitDeck[idx];
    if (!card) return;
    const newGroups = [...allGroups];
    newGroups[groupIdx].modifiers.push({
      type: "trait", name: card.name, effect: card.effect || {},
      addKeywords: card.keywords || [], description: card.description || "",
    });
    setCombatGroups(newGroups);
  };
  const drawDarkness = () => {
    const idx = Math.floor(Math.random() * DARKNESS_CARDS.length);
    const card = DARKNESS_CARDS[idx];
    const newGroups = [...allGroups];
    newGroups[groupIdx].modifiers.push({
      type: "darkness", name: card.name, effect: card.effect || {},
      addKeywords: card.keywords || [], description: card.description || "",
    });
    setCombatGroups(newGroups);
  };
  const drawGrowingDread = () => {
    const idx = Math.floor(Math.random() * GROWING_DREAD_CARDS.length);
    const card = GROWING_DREAD_CARDS[idx];
    const newGroups = [...allGroups];
    newGroups[groupIdx].modifiers.push({
      type: "growingDread", name: card.name, effect: card.effect || {},
      addKeywords: card.keywords || [], description: card.description || "",
    });
    setCombatGroups(newGroups);
  };
  const drawEnemyTrait = () => {
    const deck = ENEMY_TRAIT_CARDS[group.name] || [];
    if (deck.length === 0) return;
    const roll = Math.floor(Math.random() * 6) + 1;
    const triggerOn = ENEMY_TRAIT_CONFIG[group.name]?.triggerOn || '1-3';
    const triggered = triggerOn === '4-6' ? roll >= 4 : roll <= 3;
    if (!triggered) {
      setTraitRoll({ roll, card: null });
      return;
    }
    const card = deck[Math.floor(Math.random() * deck.length)];
    setTraitRoll({ roll, card });
    const newGroups = [...allGroups];
    newGroups[groupIdx].modifiers.push({
      type: "enemyTrait",
      name: card.name,
      description: card.effect || '',
    });
    setCombatGroups(newGroups);
  };

  const removeModifier = (i) => {
    const newGroups = [...allGroups];
    newGroups[groupIdx].modifiers.splice(i, 1);
    setCombatGroups(newGroups);
  };
  const removeGroup = () => {
    setCombatGroups(allGroups.filter((_, i) => i !== groupIdx));
  };

  const bs = group.baseStats || {};
  const keywords = statBundle.keywords || bs.keywords || [];
  const hasStatSystem = typeof bs.brutal === 'boolean';

  const specialTheme = group.isSpecial ? (group.specialTheme || {}) : null;
  const headerBg   = specialTheme ? specialTheme.bg   : (isBrutal ? 'bg-red-950' : hasStatSystem ? 'bg-green-950' : 'bg-leather-dark');
  const borderColor = specialTheme ? specialTheme.border : (isBrutal ? 'border-red-800' : hasStatSystem ? 'border-green-800' : 'border-leather');
  const statBarBg  = specialTheme ? specialTheme.bg   : (isBrutal ? 'bg-red-950' : hasStatSystem ? 'bg-green-950' : 'bg-leather-dark');

  const specialVariants = SPECIAL_ENEMIES_BY_BASE[group.name] || [];

  const statCell = (label, value, highlight = false) => (
    <div className={`flex flex-col items-center justify-center px-2 py-1 ${highlight ? 'bg-black/20' : ''}`}>
      <span className="text-[10px] uppercase tracking-widest text-parchment/70 font-semibold">{label}</span>
      <span className="text-xl font-bold text-parchment leading-none mt-0.5">{value ?? '—'}</span>
    </div>
  );

  return (
    <div className={`rounded-lg overflow-hidden shadow-horror border-2 ${borderColor} text-sm`}>
      <StatBreakdownModal
        show={breakdownModal.show}
        onClose={() => setBreakdownModal({ show: false, stat: "", breakdown: null })}
        breakdown={breakdownModal.breakdown}
        statName={breakdownModal.stat}
      />

      {/* ── Header ── */}
      <div className={`px-3 pt-2 pb-2 ${headerBg} relative`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {group.isSpecial && (
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${specialTheme?.badge ?? 'bg-white/20 text-white'}`}>
                  ★ Special
                </span>
                {group.baseEnemyName && (
                  <span className="text-[10px] text-white/50 italic">({group.baseEnemyName} variant)</span>
                )}
              </div>
            )}
            {!group.isSpecial && hasStatSystem && (
              <div className={`text-xs font-bold italic tracking-widest uppercase mb-0.5 ${isBrutal ? 'text-red-400' : 'text-green-400'}`}>
                {isBrutal ? 'Brutal' : 'Normal'}
              </div>
            )}
            {bs.statVariantMissing && (
              <div className="text-[10px] text-amber-400 italic mb-0.5">
                ({isBrutal ? 'Normal' : 'Brutal'} stats not yet scanned — using {isBrutal ? 'brutal' : 'normal'} fallback)
              </div>
            )}
            <div className="text-parchment-light font-bold text-lg leading-tight truncate" style={{ fontVariant: 'small-caps' }}>
              {group.name}
              {group.count > 1 && <span className="ml-2 text-brass font-bold">×{group.count}</span>}
            </div>
            <div className="text-parchment/60 text-xs tracking-wide">
              {keywords.join(' ♦ ')}
            </div>
          </div>
          {/* Initiative */}
          <div className="flex flex-col items-center shrink-0">
            <span className="text-[9px] uppercase tracking-widest text-parchment/60">Initiative</span>
            <div className="w-10 h-10 rounded-full border-2 border-parchment/40 bg-black/30 flex items-center justify-center">
              <span className="text-parchment font-bold text-lg leading-none">{bs.initiative ?? '—'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-parchment/70">
          <span>Size: <b className="text-parchment">{bs.Size || bs.size || '—'}</b></span>
          <span>Move: <b className="text-parchment">{bs.move ?? '—'}</b></span>
          <span>Escape: <b className="text-parchment">{bs.escape || '—'}</b></span>
          <span>XP: <b className="text-parchment">{bs.xp ?? '—'}{bs.xpEach ? ` +${bs.xpEach} ea` : ''}</b></span>
        </div>
      </div>

      {/* ── Abilities ── */}
      {Array.isArray(bs.abilities) && bs.abilities.length > 0 && (
        <div className="bg-parchment-dark border-t border-leather px-3 py-2">
          <div className="text-xs font-bold uppercase tracking-widest text-leather-dark mb-1"
               style={{ fontVariant: 'small-caps', color: '#8B6914' }}>
            Abilities:
          </div>
          <ul className="space-y-1">
            {bs.abilities.map((a, i) => {
              const [title, ...rest] = a.split(/\s[–-]\s/);
              const desc = rest.join(' – ');
              return (
                <li key={i} className="text-xs leading-snug text-leather-dark">
                  {desc ? (
                    <><b>{title}</b> – {desc}</>
                  ) : a}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── Active modifiers ── */}
      {group.modifiers.length > 0 && (
        <div className="bg-parchment border-t border-leather px-3 py-2">
          <div className="text-xs font-bold uppercase tracking-widest text-leather mb-1">Active Modifiers</div>
          <ul className="space-y-1">
            {group.modifiers.map((m, i) => (
              <li key={i} className="flex items-start justify-between gap-1 text-xs">
                <span><b>{m.name}</b>{m.description && ` — ${m.description}`}</span>
                <button className="text-red-600 shrink-0 hover:underline" onClick={() => removeModifier(i)}>✕</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Elite abilities (when rolled) ── */}
      {Array.isArray(group.eliteAbilityList) && group.eliteAbilityList.length > 0 && (
        <div className="bg-amber-50 border-t border-amber-300 px-3 py-2">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-800 mb-1">Elite Abilities</div>
          <ul className="space-y-1">
            {group.eliteAbilityList.map((a, i) => {
              const [title, ...rest] = (a.text || '').split(/\s[–-]\s/);
              const desc = rest.join(' – ');
              return (
                <li key={i} className="text-xs leading-snug text-amber-900">
                  <b>{a.roll}. {title}</b>{desc && ` – ${desc}`}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── Enemy trait roll result ── */}
      {traitRoll && (
        <div className={`border-t px-3 py-2 text-xs ${traitRoll.card ? 'bg-purple-950 border-purple-700' : 'bg-gray-900 border-gray-700'}`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className={`font-bold ${traitRoll.card ? 'text-purple-300' : 'text-gray-400'}`}>
                Trait Roll: {traitRoll.roll} — {traitRoll.card ? `drew "${traitRoll.card.name}"` : `No trait (${(ENEMY_TRAIT_CONFIG[group.name]?.triggerOn || '1-3') === '4-6' ? '1–3' : '4–6'})`}
              </span>
              {traitRoll.card?.effect && (
                <p className="text-parchment/80 mt-0.5 leading-snug">{traitRoll.card.effect}</p>
              )}
            </div>
            <button className="text-gray-500 hover:text-gray-300 shrink-0" onClick={() => setTraitRoll(null)}>✕</button>
          </div>
        </div>
      )}

      {/* ── Stats bar ── */}
      <div className={`${statBarBg} border-t border-parchment/20`}>
        <div className="grid grid-cols-6 divide-x divide-parchment/20 text-center">
          <div className="flex flex-col items-center col-span-2 divide-y divide-parchment/20">
            <span className="text-[9px] uppercase tracking-widest text-parchment/60 pt-1">To Hit</span>
            <div className="grid grid-cols-2 w-full divide-x divide-parchment/20">
              {statCell('Range', bs.ranged ? bs.ranged.toHit : '—')}
              {statCell('Melee', bs.melee ? bs.melee.toHit : '—')}
            </div>
          </div>
          {statCell('Combat', bs.combat ?? '—', true)}
          {statCell('Damage', bs.melee?.damage ?? '—', true)}
          <div className="col-span-2 flex flex-col items-center justify-center px-1 py-1">
            <span className="text-[9px] uppercase tracking-widest text-parchment/60">Health</span>
            <span className="text-2xl font-bold text-parchment leading-none">{bs.health ?? '—'}</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[9px] text-parchment/60">Defense</span>
              <span className="text-xs font-bold text-parchment bg-black/30 rounded-full w-5 h-5 flex items-center justify-center">{bs.defense ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Elite chart ── */}
      {Array.isArray(bs.eliteChart) && bs.eliteChart.length > 0 && (
        <div className="border-t border-leather">
          <button
            className="w-full flex items-center justify-between px-3 py-1.5 bg-green-950 text-parchment/80 text-xs"
            onClick={() => setShowElite(v => !v)}
          >
            <span className="font-bold uppercase tracking-widest" style={{ fontVariant: 'small-caps' }}>Elite Chart</span>
            <span className="text-parchment/50">{showElite ? '▲ Hide' : '▼ Roll a D6 for Elite Ability'}</span>
          </button>
          {showElite && (
            <div className="bg-green-950/80 px-3 py-2 space-y-1">
              {bs.eliteChart.map((entry, i) => {
                const [title, ...rest] = entry.split(/\s[–-]\s/);
                const desc = rest.join(' – ');
                return (
                  <div key={i} className="text-xs text-parchment/90 leading-snug">
                    <b>{i + 1}) {title}</b>{desc && ` – ${desc}`}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Controls ── */}
      <div className="bg-parchment border-t border-leather px-3 py-2 flex flex-wrap gap-2 items-center">
        <div className="flex gap-1">
          <button className="btn btn-xs btn-outline" onClick={() => setManualElite(manualExtraElite + 1)}>+1 Elite</button>
          <button className="btn btn-xs btn-outline" disabled={manualExtraElite === 0}
            onClick={() => setManualElite(Math.max(0, manualExtraElite - 1))}>−1 Elite</button>
        </div>
        <div className="flex gap-1 flex-wrap">
          <button className="btn btn-xs btn-outline" onClick={drawTrait}>Trait</button>
          <button className="btn btn-xs btn-outline" onClick={drawDarkness}>Darkness</button>
          <button className="btn btn-xs btn-outline" onClick={drawGrowingDread}>Grd</button>
          {/* Corrupted universal trait — only for non-Demon/Undead */}
          {!(group.baseStats?.keywords || []).some(k => k === 'Demon' || k === 'Undead') && (
            <button
              className="btn btn-xs btn-outline"
              style={{ borderColor: '#6b7280', color: '#6b7280' }}
              onClick={applyCorrupted}
              title="Apply Corrupted trait — +2 Init/Health, Possessed keyword, Taint of Evil"
            >
              Corrupted
            </button>
          )}
          {ENEMY_TRAIT_CARDS[group.name]?.length > 0 && (
            <button
              className="btn btn-xs btn-outline btn-secondary"
              onClick={drawEnemyTrait}
              title={`Roll D6 — ${ENEMY_TRAIT_CONFIG[group.name]?.triggerOn || '1-3'} draws an enemy trait card`}
            >
              {ENEMY_TRAIT_CONFIG[group.name]?.triggerOn === '4-6'
                ? `${ENEMY_TRAIT_CONFIG[group.name]?.label ?? 'Pack'} (4-6)`
                : 'Trait (D6 1-3)'}
            </button>
          )}
        </div>
        {/* Spawn special/miniboss variants */}
        {specialVariants.length > 0 && (
          <div className="w-full flex gap-1 flex-wrap pt-1 border-t border-leather/30">
            <span className="text-[10px] text-leather-dark/60 self-center font-semibold uppercase tracking-wide">Spawn:</span>
            {specialVariants.map(s => (
              <button
                key={s.id}
                className="btn btn-xs"
                style={{ backgroundColor: '#1c1917', color: '#fbbf24', border: '1px solid #92400e' }}
                onClick={() => spawnSpecial(s)}
                title={s.sourceCard}
              >
                ★ {s.name}
              </button>
            ))}
          </div>
        )}
        <button className="btn btn-xs btn-ghost text-red-600 ml-auto" onClick={removeGroup}>Remove</button>
      </div>
    </div>
  );
}
