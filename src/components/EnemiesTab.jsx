// src/components/EnemiesTab.jsx
// Player-facing tab for cycling through active enemies during combat.
import React, { useState } from "react";
import { useCombatState } from "../hooks/useCombatState";
import { getAllStatsWithBreakdown } from "../utils/enemyModifiers";

// ---------- helpers (shared with DMActiveEnemiesPanel) ----------
function fmtThreshold(x) {
  if (x == null) return null;
  const s = typeof x === "number" ? `${x}+` : String(x);
  return s;
}
const unwrap = (x) => (x && typeof x === "object" && "value" in x ? x.value : x);
const toText = (v) => {
  if (v == null) return null;
  const u = unwrap(v);
  if (u == null) return null;
  if (typeof u === "boolean") return u ? "Yes" : "No";
  return String(u);
};
const getFirst = (obj, keys) => {
  for (const k of keys) if (obj[k] != null) return obj[k];
};

function pickCI(obj, names) {
  if (!obj || typeof obj !== "object") return undefined;
  const keys = Object.keys(obj);
  const norm = (s) => String(s).toLowerCase().replace(/[\s_-]+/g, "");
  for (const want of names) {
    const target = norm(want);
    const hit = keys.find((k) => norm(k) === target);
    if (hit) return obj[hit];
  }
}

function normalizeAttack(val, baseDamage) {
  const raw = unwrap(val);
  if (raw == null) return null;
  if (typeof raw === "string") {
    const s = raw;
    const toHit = (s.match(/(\d+\+)\s*(?:to[-\s]?hit)?/i) || [])[1];
    const damage = (s.match(/(\d+)\s*(?:dmg|damage)/i) || [])[1] || (baseDamage != null ? String(baseDamage) : null);
    const range = (s.match(/(\d+)\s*(?:range|rng)/i) || [])[1] || null;
    return { toHit, damage, range };
  }
  if (typeof raw === "object") {
    const toHit = unwrap(pickCI(raw, ["toHit", "to-hit", "to hit", "to_hit", "tohit", "thresh", "threshold"]));
    let damage = unwrap(pickCI(raw, ["damage", "dmg"]));
    if (damage == null && baseDamage != null) damage = baseDamage;
    const range = unwrap(pickCI(raw, ["range", "rng"]));
    return { toHit, damage, range };
  }
  if (typeof raw === "number") {
    return { toHit: `${raw}+`, damage: baseDamage ?? null, range: null };
  }
  return null;
}

function AttackChips({ atk }) {
  if (!atk) return null;
  const toHit = atk.toHit != null ? fmtThreshold(atk.toHit) : null;
  const damage = atk.damage != null ? String(atk.damage) : null;
  const range = atk.range != null ? String(atk.range) : null;
  if (!toHit && !damage && !range) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {toHit && <span className="rounded px-2 py-0.5 text-xs bg-stone-800 border border-stone-700"><b>To-Hit:</b> {toHit}</span>}
      {damage && <span className="rounded px-2 py-0.5 text-xs bg-stone-800 border border-stone-700"><b>Damage:</b> {damage}</span>}
      {range && <span className="rounded px-2 py-0.5 text-xs bg-stone-800 border border-stone-700"><b>Range:</b> {range}</span>}
    </div>
  );
}

// ---------- main component ----------
export default function EnemiesTab() {
  const { combatGroups = [], darknessActive = [], growingDreadActive = [] } = useCombatState() || {};
  const [focusIndex, setFocusIndex] = useState(0);
  const [viewMode, setViewMode] = useState("cycle");

  const globalModifiers = [...darknessActive, ...growingDreadActive];
  const total = combatGroups.length;
  const safeFocus = Math.min(focusIndex, Math.max(0, total - 1));

  const goPrev = () => setFocusIndex((i) => (i > 0 ? i - 1 : total - 1));
  const goNext = () => setFocusIndex((i) => (i < total - 1 ? i + 1 : 0));

  const groupsToShow =
    viewMode === "cycle" && total > 0
      ? [{ group: combatGroups[safeFocus], idx: safeFocus }]
      : combatGroups.map((group, idx) => ({ group, idx }));

  if (!total) {
    return (
      <div className="p-6 text-center text-stone-500 italic">
        No active enemies. Enemies will appear here once the DM draws threats.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header + view toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-bold text-lg">
          Active Enemies ({total} group{total !== 1 ? "s" : ""})
        </h2>
        {total > 1 && (
          <div className="flex items-center gap-2">
            <button
              className={`px-2 py-1 rounded text-xs font-semibold ${viewMode === "cycle" ? "bg-[#5C3A21] text-white" : "bg-white/60 text-black"}`}
              onClick={() => setViewMode("cycle")}
            >
              Cycle
            </button>
            <button
              className={`px-2 py-1 rounded text-xs font-semibold ${viewMode === "all" ? "bg-[#5C3A21] text-white" : "bg-white/60 text-black"}`}
              onClick={() => setViewMode("all")}
            >
              Show All
            </button>
          </div>
        )}
      </div>

      {/* Cycling navigation */}
      {viewMode === "cycle" && total > 1 && (
        <div className="flex items-center justify-between">
          <button onClick={goPrev} className="px-3 py-1 rounded bg-white/60 text-black font-bold">
            &larr; Prev
          </button>
          <div className="flex gap-1">
            {combatGroups.map((g, i) => (
              <button
                key={g.id || i}
                onClick={() => setFocusIndex(i)}
                className={`w-7 h-7 rounded text-xs font-bold flex items-center justify-center border ${
                  i === safeFocus
                    ? "bg-red-700 border-red-500 text-white ring-2 ring-amber-400"
                    : "bg-stone-300 border-stone-400 text-stone-700"
                }`}
                title={g.name}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button onClick={goNext} className="px-3 py-1 rounded bg-white/60 text-black font-bold">
            Next &rarr;
          </button>
        </div>
      )}

      {/* Enemy cards */}
      {groupsToShow.map(({ group, idx }) => (
        <EnemyCard key={group.id || idx} group={group} globalModifiers={globalModifiers} />
      ))}
    </div>
  );
}

// ---------- single enemy card (read-only) ----------
function EnemyCard({ group, globalModifiers }) {
  const stats = getAllStatsWithBreakdown(group, globalModifiers, group.manualOverrides || {});

  const keywords = Array.isArray(stats.keywords) ? stats.keywords : [];
  const initiative = unwrap(getFirst(stats, ["Initiative", "initiative"]));
  const size = unwrap(getFirst(stats, ["Size", "size"]));
  const move = toText(getFirst(stats, ["Move", "move"]));
  const escape = toText(getFirst(stats, ["Escape", "escape"]));
  const defense = toText(getFirst(stats, ["Defense", "defense"]));
  const armor = toText(getFirst(stats, ["Armor", "armor"]));
  const spiritArmor = toText(getFirst(stats, ["Spirit Armor", "spirit armor", "SpiritArmor", "spiritArmor"]));
  const health = toText(getFirst(stats, ["Health", "health"]));
  const baseDamage = unwrap(getFirst(stats, ["Damage", "damage"]));

  const meleeAtk = normalizeAttack(getFirst(stats, ["Melee Attack", "melee", "Melee"]), baseDamage);
  const rangedAtk = normalizeAttack(getFirst(stats, ["Ranged Attack", "ranged", "Ranged"]), baseDamage);

  const abilities = (() => {
    const raw = unwrap(getFirst(stats, ["abilities", "Abilities"]));
    if (!raw && raw !== 0) return [];
    if (Array.isArray(raw)) return raw.map(String);
    return String(raw).split(/\n+|[.;](?:\s+|$)/).map((s) => s.trim()).filter(Boolean);
  })();

  const eliteChart = (() => {
    const raw = unwrap(getFirst(stats, ["eliteChart", "elitechart", "Elite Chart"]));
    if (!raw && raw !== 0) return [];
    if (Array.isArray(raw)) return raw.map(String);
    return String(raw).split(/\n+|[.;](?:\s+|$)/).map((s) => s.trim()).filter(Boolean);
  })();

  const EXCLUDE = new Set([
    "keywords", "abilities", "Abilities", "eliteChart", "elitechart", "Elite Chart",
    "Initiative", "initiative", "Size", "size", "Move", "move", "Escape", "escape",
    "Defense", "defense", "Armor", "armor", "Spirit Armor", "spirit armor", "SpiritArmor", "spiritArmor",
    "Health", "health", "Damage", "damage", "Melee Attack", "melee", "Melee",
    "Ranged Attack", "ranged", "Ranged", "name", "Name", "world", "World", "id", "localId", "note",
  ]);
  const otherEntries = Object.entries(stats)
    .filter(([k]) => !EXCLUDE.has(k))
    .map(([k, obj]) => ({ label: k.replace(/(^|\s)\S/g, (s) => s.toUpperCase()), text: toText(obj) }))
    .filter((e) => e.text);

  return (
    <div className="rounded-lg p-4 bg-[#3b2f1d] text-amber-100 border border-[#8b6b46] shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-2 min-w-[180px]">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-bold text-xl leading-none">{group.name}</span>
            <span className="text-sm opacity-90">x{group.count}</span>
            {group.eliteAbilityList?.length > 0 && (
              <span className="px-2 py-0.5 rounded text-xs bg-amber-600 text-white font-semibold">Elite</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {keywords.length ? keywords.map((kw, i) => (
              <span key={i} className="px-2 py-0.5 text-[11px] rounded bg-stone-800 border border-stone-700">{kw}</span>
            )) : <span className="text-xs opacity-70">No keywords</span>}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="w-[72px] h-[72px] rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center">
            <div className="flex flex-col items-center leading-tight">
              <div className="text-xl font-black">{initiative != null ? String(initiative) : "—"}</div>
              <div className="text-[9px] uppercase tracking-wide opacity-80 -mt-0.5">Initiative</div>
            </div>
          </div>
          <div className="text-right text-[11px] opacity-80">Size: <span className="font-semibold">{size != null ? String(size) : "—"}</span></div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-3 space-y-3">
        {(meleeAtk || rangedAtk) && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-1">Attacks</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {meleeAtk && (
                <div className="rounded-md p-2 bg-stone-900/60 border border-stone-700">
                  <div className="text-xs font-semibold mb-1">Melee</div>
                  <AttackChips atk={meleeAtk} />
                </div>
              )}
              {rangedAtk && (
                <div className="rounded-md p-2 bg-stone-900/60 border border-stone-700">
                  <div className="text-xs font-semibold mb-1">Ranged</div>
                  <AttackChips atk={rangedAtk} />
                </div>
              )}
            </div>
          </div>
        )}

        {(move || escape) && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-1">Mobility</div>
            <div className="flex flex-wrap gap-2">
              {move && <span className="rounded-md px-2.5 py-1 text-xs bg-stone-800 border border-stone-700"><b>Move:</b> {move}</span>}
              {escape && <span className="rounded-md px-2.5 py-1 text-xs bg-stone-800 border border-stone-700"><b>Escape:</b> {escape}</span>}
            </div>
          </div>
        )}

        {otherEntries.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-1">Other</div>
            <div className="flex flex-wrap gap-2">
              {otherEntries.map(({ label, text }) => (
                <span key={`${label}-${text}`} className="rounded-md px-2.5 py-1 text-xs bg-stone-800 border border-stone-700">
                  <b>{label}:</b> {text}
                </span>
              ))}
            </div>
          </div>
        )}

        {(defense || armor || spiritArmor || health) && (
          <div className="flex flex-wrap gap-2 justify-end">
            {defense && <span className="rounded-md px-2.5 py-1 text-xs bg-stone-800 border border-stone-700"><b>Defense:</b> {defense}</span>}
            {armor && <span className="rounded-md px-2.5 py-1 text-xs bg-stone-800 border border-stone-700"><b>Armor:</b> {armor}</span>}
            {spiritArmor && <span className="rounded-md px-2.5 py-1 text-xs bg-stone-800 border border-stone-700"><b>Spirit Armor:</b> {spiritArmor}</span>}
            {health && <span className="rounded-md px-2.5 py-1 text-xs bg-stone-800 border border-stone-700"><b>Health:</b> {health}</span>}
          </div>
        )}
      </div>

      {/* Abilities */}
      {abilities.length > 0 && (
        <div className="mt-4 text-xs space-y-1">
          <div className="font-semibold">Abilities</div>
          <ul className="list-disc list-inside space-y-0.5">
            {abilities.map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        </div>
      )}
      {eliteChart.length > 0 && (
        <div className="mt-3 text-xs space-y-1">
          <div className="font-semibold">Elite Chart</div>
          <ul className="list-disc list-inside space-y-0.5">
            {eliteChart.map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
