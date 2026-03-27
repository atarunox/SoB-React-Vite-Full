// src/components/DM/DMHandPanel.jsx
import React, { useState } from "react";
import { useCombatState } from "../../hooks/useCombatState";
import { getAllStatsWithBreakdown } from "../../utils/enemyModifiers";

// ---- Card type styling ----
const TYPE_STYLES = {
  enemy:         { bg: "bg-red-900/90",    border: "border-red-700",   label: "Enemy",         badge: "bg-red-700" },
  darkness:      { bg: "bg-purple-900/90",  border: "border-purple-600", label: "Darkness",     badge: "bg-purple-700" },
  growingDread:  { bg: "bg-indigo-900/90",  border: "border-indigo-600", label: "Growing Dread", badge: "bg-indigo-700" },
  encounter:     { bg: "bg-amber-900/90",   border: "border-amber-600",  label: "Encounter",   badge: "bg-amber-700" },
};

function getStyle(type) {
  return TYPE_STYLES[type] || { bg: "bg-stone-800", border: "border-stone-600", label: type || "Card", badge: "bg-stone-600" };
}

// ---- Helpers for enemy stat display (compact) ----
const unwrap = (x) => (x && typeof x === "object" && "value" in x ? x.value : x);
const getFirst = (obj, keys) => { for (const k of keys) if (obj[k] != null) return obj[k]; };
const toText = (v) => { if (v == null) return null; const u = unwrap(v); return u != null ? String(u) : null; };

function EnemyCardDetail({ card, globalModifiers = [] }) {
  const group = card.groupData;
  if (!group) return <div className="text-sm opacity-70">No enemy data available.</div>;

  const stats = getAllStatsWithBreakdown(group, globalModifiers, group.manualOverrides || {});
  const keywords = Array.isArray(stats.keywords) ? stats.keywords : [];
  const initiative = unwrap(getFirst(stats, ["Initiative", "initiative"]));
  const health = toText(getFirst(stats, ["Health", "health"]));
  const defense = toText(getFirst(stats, ["Defense", "defense"]));
  const armor = toText(getFirst(stats, ["Armor", "armor"]));
  const move = toText(getFirst(stats, ["Move", "move"]));
  const combat = toText(getFirst(stats, ["Combat", "combat"]));

  const meleeRaw = getFirst(stats, ["Melee Attack", "melee", "Melee"]);
  const rangedRaw = getFirst(stats, ["Ranged Attack", "ranged", "Ranged"]);

  const fmtAttack = (atk) => {
    if (!atk) return null;
    const raw = unwrap(atk);
    if (!raw) return null;
    if (typeof raw === "object") {
      const parts = [];
      if (raw.toHit) parts.push(`${raw.toHit} to-hit`);
      if (raw.damage) parts.push(`${raw.damage} dmg`);
      if (raw.range) parts.push(`rng ${raw.range}`);
      return parts.join(", ") || null;
    }
    return String(raw);
  };

  const abilities = (() => {
    const raw = unwrap(getFirst(stats, ["abilities", "Abilities"]));
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(String);
    return String(raw).split(/\n+|[.;](?:\s+|$)/).map(s => s.trim()).filter(Boolean);
  })();

  const eliteChart = (() => {
    const raw = unwrap(getFirst(stats, ["eliteChart", "elitechart", "Elite Chart"]));
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(String);
    return String(raw).split(/\n+|[.;](?:\s+|$)/).map(s => s.trim()).filter(Boolean);
  })();

  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="font-bold text-lg">{group.name}</span>
        <span className="text-sm opacity-80">x{group.count}</span>
        {group.eliteAbilityList?.length > 0 && <span className="badge badge-accent text-xs">Elite</span>}
      </div>

      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {keywords.map((kw, i) => (
            <span key={i} className="px-1.5 py-0.5 text-[10px] rounded bg-stone-700 border border-stone-600">{kw}</span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-xs">
        {initiative != null && <span className="rounded px-2 py-0.5 bg-stone-700"><b>Init:</b> {initiative}</span>}
        {combat && <span className="rounded px-2 py-0.5 bg-stone-700"><b>Combat:</b> {combat}</span>}
        {health && <span className="rounded px-2 py-0.5 bg-stone-700"><b>HP:</b> {health}</span>}
        {defense && <span className="rounded px-2 py-0.5 bg-stone-700"><b>Def:</b> {defense}</span>}
        {armor && <span className="rounded px-2 py-0.5 bg-stone-700"><b>Armor:</b> {armor}</span>}
        {move && <span className="rounded px-2 py-0.5 bg-stone-700"><b>Move:</b> {move}</span>}
      </div>

      {fmtAttack(meleeRaw) && (
        <div className="text-xs"><b>Melee:</b> {fmtAttack(meleeRaw)}</div>
      )}
      {fmtAttack(rangedRaw) && (
        <div className="text-xs"><b>Ranged:</b> {fmtAttack(rangedRaw)}</div>
      )}

      {abilities.length > 0 && (
        <div className="text-xs mt-1">
          <div className="font-semibold mb-0.5">Abilities</div>
          <ul className="list-disc list-inside space-y-0.5">
            {abilities.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      {eliteChart.length > 0 && (
        <div className="text-xs mt-1">
          <div className="font-semibold mb-0.5">Elite Chart</div>
          <ul className="list-disc list-inside space-y-0.5">
            {eliteChart.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function DarknessCardDetail({ card }) {
  return (
    <div className="space-y-2">
      <div className="font-bold text-lg">{card.name}</div>
      {card.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.tags.map((t, i) => (
            <span key={i} className="px-1.5 py-0.5 text-[10px] rounded bg-purple-800 border border-purple-600">{t}</span>
          ))}
        </div>
      )}
      <p className="text-sm"><b>Effect:</b> {card.effect}</p>
      {card.remainsInPlay && <p className="text-xs text-blue-400 italic">Remains in Play</p>}
    </div>
  );
}

function GrowingDreadCardDetail({ card, hidden }) {
  if (hidden) {
    return (
      <div className="space-y-2">
        <div className="font-bold text-lg">Growing Dread (Hidden)</div>
        <p className="text-sm italic opacity-60">This card is face-down. Reveal to see its contents.</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="font-bold text-lg">{card.name}</div>
      {card.flavorText && <p className="text-sm italic opacity-80">{card.flavorText}</p>}
      {card.effect && <p className="text-sm"><b>Effect:</b> {card.effect}</p>}
      {card.remainsInPlay && <p className="text-xs text-blue-400 italic">Remains in Play</p>}
    </div>
  );
}

function EncounterCardDetail({ card }) {
  return (
    <div className="space-y-2">
      <div className="font-bold text-lg">{card.name}</div>
      {card.flavor && <p className="text-sm italic opacity-80">{card.flavor}</p>}
      {card.test && <p className="text-sm"><b>Test:</b> {card.test}</p>}
      <p className="text-sm"><b>Effect:</b> {card.effect}</p>
      {card.target && <p className="text-xs"><b>Target:</b> {card.target}</p>}
      {card.remainsInPlay && <p className="text-xs text-blue-400 italic">Remains in Play</p>}
    </div>
  );
}

// ---- Main Hand Panel ----
export default function DMHandPanel({ globalModifiers = [] }) {
  const { dmHand, removeFromHand, updateHandCard, clearHand } = useCombatState();
  const [focusIndex, setFocusIndex] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  const hand = dmHand ?? [];
  const handSize = hand.length;

  // Keep focus in bounds
  const safeFocus = Math.min(focusIndex, Math.max(0, handSize - 1));
  if (safeFocus !== focusIndex && handSize > 0) setFocusIndex(safeFocus);

  const focusedCard = handSize > 0 ? hand[safeFocus] : null;

  const goPrev = () => setFocusIndex((i) => (i > 0 ? i - 1 : handSize - 1));
  const goNext = () => setFocusIndex((i) => (i < handSize - 1 ? i + 1 : 0));

  const removeFocused = () => {
    if (!focusedCard) return;
    removeFromHand(focusedCard._handId);
    setFocusIndex((i) => Math.max(0, i - 1));
  };

  const toggleHidden = () => {
    if (!focusedCard) return;
    updateHandCard(focusedCard._handId, { hidden: !focusedCard.hidden });
  };

  if (handSize === 0) return null;

  const style = getStyle(focusedCard?.type);

  return (
    <div className="mb-4 border-2 border-amber-600 rounded-lg overflow-hidden bg-stone-900 text-amber-100 shadow-lg">
      {/* Header bar - always visible */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-amber-900/80 cursor-pointer select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">DM Hand</span>
          <span className="text-xs opacity-80">({handSize} card{handSize !== 1 ? 's' : ''})</span>
          {/* Mini card type indicators */}
          <div className="flex gap-1 ml-2">
            {hand.map((c, i) => {
              const s = getStyle(c.type);
              return (
                <button
                  key={c._handId}
                  onClick={(e) => { e.stopPropagation(); setFocusIndex(i); setCollapsed(false); }}
                  className={`w-5 h-5 rounded text-[8px] font-bold flex items-center justify-center border ${
                    i === safeFocus ? 'ring-2 ring-amber-400' : ''
                  } ${s.badge} ${s.border}`}
                  title={c.name || c.groupData?.name || s.label}
                >
                  {c.type === 'enemy' ? 'E' : c.type === 'darkness' ? 'D' : c.type === 'growingDread' ? 'G' : c.type === 'encounter' ? 'N' : '?'}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="text-xs text-amber-300 hover:text-white"
            onClick={(e) => { e.stopPropagation(); clearHand(); }}
            title="Clear entire hand"
          >
            Clear All
          </button>
          <span className="text-xs">{collapsed ? '\u25BC' : '\u25B2'}</span>
        </div>
      </div>

      {/* Expanded card view */}
      {!collapsed && focusedCard && (
        <div className={`p-3 ${style.bg} ${style.border} border-t`}>
          {/* Navigation */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={goPrev}
              disabled={handSize <= 1}
              className="btn btn-xs btn-ghost text-amber-200 disabled:opacity-30"
            >
              &larr; Prev
            </button>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${style.badge}`}>
                {style.label}
              </span>
              <span className="text-xs opacity-80">
                {safeFocus + 1} / {handSize}
              </span>
            </div>
            <button
              onClick={goNext}
              disabled={handSize <= 1}
              className="btn btn-xs btn-ghost text-amber-200 disabled:opacity-30"
            >
              Next &rarr;
            </button>
          </div>

          {/* Card content */}
          <div className="rounded p-3 bg-black/30 border border-white/10">
            {focusedCard.type === 'enemy' && (
              <EnemyCardDetail card={focusedCard} globalModifiers={globalModifiers} />
            )}
            {focusedCard.type === 'darkness' && (
              <DarknessCardDetail card={focusedCard} />
            )}
            {focusedCard.type === 'growingDread' && (
              <GrowingDreadCardDetail card={focusedCard} hidden={focusedCard.hidden} />
            )}
            {focusedCard.type === 'encounter' && (
              <EncounterCardDetail card={focusedCard} />
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-2">
            {focusedCard.type === 'growingDread' && (
              <button
                onClick={toggleHidden}
                className={`btn btn-xs ${focusedCard.hidden ? 'btn-info' : 'btn-warning'}`}
              >
                {focusedCard.hidden ? 'Reveal to DM' : 'Hide Card'}
              </button>
            )}
            <button onClick={removeFocused} className="btn btn-xs btn-error">
              Remove from Hand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
