// src/components/DM/DMActiveEnemiesPanel.jsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { getAllStatsWithBreakdown } from "../../utils/enemyModifiers";

// Swipe hook: detect horizontal swipe gestures for cycling
function useSwipe({ onLeft, onRight }) {
  const startX = useRef(null);
  const startY = useRef(null);

  const onTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (startX.current == null || startY.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > 60 && absDx > absDy) {
      dx > 0 ? onRight() : onLeft();
    }

    startX.current = null;
    startY.current = null;
  }, [onLeft, onRight]);

  return { onTouchStart, onTouchEnd };
}

// ---------- helpers ----------
function fmtThreshold(x) {
  if (x == null) return null;
  const s = typeof x === "number" ? `${x}+` : String(x);
  return /\+$/.test(s) ? s : s;
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

// pick a value by case-insensitive key variants (supports hyphen/space/underscore)
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

// Parse an attack value from either an object or a string. Fallback to baseDamage if missing.
function normalizeAttack(val, baseDamage) {
  const raw = unwrap(val);
  if (raw == null) return null;

  // If it's a string like "4+ to-hit • 3 dmg • 6 range"
  if (typeof raw === "string") {
    const s = raw;
    const toHit = (s.match(/(\d+\+)\s*(?:to[-\s]?hit)?/i) || [])[1];
    const damage = (s.match(/(\d+)\s*(?:dmg|damage)/i) || [])[1] || (baseDamage != null ? String(baseDamage) : null);
    const range = (s.match(/(\d+)\s*(?:range|rng)/i) || [])[1] || null;
    const notes = s; // full string works as notes too
    return { toHit, damage, range, notes };
  }

  // If it's an object, accept many possible key spellings
  if (typeof raw === "object") {
    const toHit = unwrap(
      pickCI(raw, ["toHit", "to-hit", "to hit", "to_hit", "tohit", "thresh", "threshold"])
    );
    let damage = unwrap(pickCI(raw, ["damage", "dmg"]));
    if (damage == null && baseDamage != null) damage = baseDamage;
    const range = unwrap(pickCI(raw, ["range", "rng"]));
    const notes = unwrap(pickCI(raw, ["notes", "desc", "text"]));
    return { toHit, damage, range, notes };
  }

  // If it's a number, assume it's to-hit
  if (typeof raw === "number") {
    return { toHit: `${raw}+`, damage: baseDamage ?? null, range: null };
  }

  return null;
}

function formatAttackBlock(a) {
  if (!a) return null;
  const toHit = a.toHit != null ? fmtThreshold(a.toHit) : null;
  const damage = a.damage != null ? String(a.damage) : null;
  const range = a.range != null ? String(a.range) : null;
  const notes = a.notes ? String(a.notes) : null;

  const rows = [];
  if (toHit || damage || range) {
    rows.push(
      <div key="row" className="flex flex-wrap gap-2">
        {toHit && (
          <span className="rounded px-2 py-0.5 text-xs bg-stone-800 border border-stone-700">
            <b>To-Hit:</b> {toHit}
          </span>
        )}
        {damage && (
          <span className="rounded px-2 py-0.5 text-xs bg-stone-800 border border-stone-700">
            <b>Damage:</b> {damage}
          </span>
        )}
        {range && (
          <span className="rounded px-2 py-0.5 text-xs bg-stone-800 border border-stone-700">
            <b>Range:</b> {range}
          </span>
        )}
      </div>
    );
  }
  // Only show notes if they add something beyond the chips (avoid echoing the same string)
  if (notes && !/^\s*(\d+\+)?/i.test(notes)) {
    rows.push(
      <div key="notes" className="text-xs opacity-90 mt-1">
        {notes}
      </div>
    );
  }
  return rows.length ? <div className="space-y-1">{rows}</div> : null;
}

const safeTitle = (obj) => {
  if (!obj || typeof obj !== "object") return undefined;
  try {
    return JSON.stringify(obj);
  } catch {
    return undefined;
  }
};
// --------------------------------------------

// Roll N unique abilities from an elite chart
function rollEliteAbilities(eliteChart, count) {
  if (!Array.isArray(eliteChart) || eliteChart.length === 0 || count <= 0) return [];
  const results = [];
  const available = eliteChart.map((text, i) => ({ roll: i + 1, text }));
  for (let n = 0; n < count; n++) {
    const pool = available.filter(a => !results.some(r => r.roll === a.roll));
    const source = pool.length > 0 ? pool : available;
    const pick = source[Math.floor(Math.random() * source.length)];
    results.push({ ...pick });
  }
  return results;
}

export default function DMActiveEnemiesPanel({
  combatGroups = [],
  globalModifiers = [],
  setCombatGroups,
  eliteCount = 0,
  isBrutal = false,
}) {
  const [focusIndex, setFocusIndex] = useState(0);
  const [viewMode, setViewMode] = useState("cycle"); // "cycle" or "all"
  const prevTotal = useRef(0);

  const total = combatGroups.length;
  const safeFocus = Math.min(focusIndex, Math.max(0, total - 1));

  // Auto-jump to the newest group when enemies are added
  useEffect(() => {
    if (total > prevTotal.current && prevTotal.current > 0) {
      setFocusIndex(total - 1);
    }
    prevTotal.current = total;
  }, [total]);

  const goPrev = useCallback(() => setFocusIndex(i => i > 0 ? i - 1 : total - 1), [total]);
  const goNext = useCallback(() => setFocusIndex(i => i < total - 1 ? i + 1 : 0), [total]);

  const swipeHandlers = useSwipe({ onLeft: goNext, onRight: goPrev });

  const groupsToShow = viewMode === "cycle" && total > 0
    ? [{ group: combatGroups[safeFocus], idx: safeFocus }]
    : combatGroups.map((group, idx) => ({ group, idx }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-bold text-lg">Active Enemies ({total} group{total !== 1 ? 's' : ''})</h2>
        {total > 1 && (
          <div className="flex items-center gap-1">
            <button
              className={`px-3 py-1 rounded text-xs font-semibold border ${viewMode === 'cycle' ? 'bg-[#5C3A21] text-white border-[#5C3A21]' : 'bg-white text-stone-700 border-stone-300'}`}
              onClick={() => setViewMode('cycle')}
            >
              Cycle
            </button>
            <button
              className={`px-3 py-1 rounded text-xs font-semibold border ${viewMode === 'all' ? 'bg-[#5C3A21] text-white border-[#5C3A21]' : 'bg-white text-stone-700 border-stone-300'}`}
              onClick={() => setViewMode('all')}
            >
              Show All
            </button>
          </div>
        )}
      </div>

      {/* Cycling navigation — always visible when enemies exist */}
      {viewMode === "cycle" && total > 1 && (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-stone-100 border border-stone-300 p-2">
          <button
            onClick={goPrev}
            className="px-3 py-2 rounded-md bg-[#5C3A21] text-white font-bold text-sm active:bg-[#4a2f1a] min-w-[70px]"
          >
            &larr; Prev
          </button>
          <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <div className="text-xs font-semibold text-stone-500">
              {safeFocus + 1} / {total}
            </div>
            <div className="flex gap-1 flex-wrap justify-center">
              {combatGroups.map((g, i) => (
                <button
                  key={g.id || i}
                  onClick={() => setFocusIndex(i)}
                  className={`px-2 py-1 rounded text-xs font-bold border transition-colors ${
                    i === safeFocus
                      ? 'bg-red-700 border-red-500 text-white ring-2 ring-amber-400'
                      : 'bg-stone-200 border-stone-400 text-stone-700 hover:bg-stone-300'
                  }`}
                  title={g.name}
                >
                  {g.name} x{g.count}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={goNext}
            className="px-3 py-2 rounded-md bg-[#5C3A21] text-white font-bold text-sm active:bg-[#4a2f1a] min-w-[70px]"
          >
            Next &rarr;
          </button>
        </div>
      )}

      {combatGroups.length === 0 && (
        <div className="italic text-gray-400">No active enemy groups. Draw a threat to begin.</div>
      )}

      <div
        {...(viewMode === "cycle" && total > 1 ? swipeHandlers : {})}
        style={viewMode === "cycle" && total > 1 ? { touchAction: "pan-y" } : undefined}
      >
      {groupsToShow.map(({ group, idx }) => {
        const stats = getAllStatsWithBreakdown(
          group,
          globalModifiers,
          group.manualOverrides || {}
        );

        // Header bits
        const keywords = Array.isArray(stats.keywords) ? stats.keywords : [];

        // Initiative / Size (header, top-right)
        const initiative = unwrap(getFirst(stats, ["Initiative", "initiative"]));
        const size = unwrap(getFirst(stats, ["Size", "size"]));

        // Mobility
        const move = toText(getFirst(stats, ["Move", "move"]));
        const escape = toText(getFirst(stats, ["Escape", "escape"]));

        // Defense & Vitality (rendered as right-aligned chips; no big box)
        const defense = toText(getFirst(stats, ["Defense", "defense"]));
        const armor = toText(getFirst(stats, ["Armor", "armor"]));
        const spiritArmor = toText(
          getFirst(stats, ["Spirit Armor", "spirit armor", "SpiritArmor", "spiritArmor"])
        );
        const health = toText(getFirst(stats, ["Health", "health"]));

        // Base Damage for attack fallback
        const baseDamage = unwrap(getFirst(stats, ["Damage", "damage"]));

        // Attacks (normalize robustly)
        const meleeRaw = getFirst(stats, ["Melee Attack", "melee", "Melee"]);
        const rangedRaw = getFirst(stats, ["Ranged Attack", "ranged", "Ranged"]);
        const meleeAtk = normalizeAttack(meleeRaw, baseDamage);
        const rangedAtk = normalizeAttack(rangedRaw, baseDamage);

        // Abilities / Elite Chart (unchanged)
        const abilities = (() => {
          const raw = unwrap(getFirst(stats, ["abilities", "Abilities"]));
          if (!raw && raw !== 0) return [];
          if (Array.isArray(raw)) return raw.map(String);
          return String(raw)
            .split(/\n+|[.;](?:\s+|$)/)
            .map((s) => s.trim())
            .filter(Boolean);
        })();
        const eliteChart = (() => {
          const raw = unwrap(getFirst(stats, ["eliteChart", "elitechart", "Elite Chart"]));
          if (!raw && raw !== 0) return [];
          if (Array.isArray(raw)) return raw.map(String);
          return String(raw)
            .split(/\n+|[.;](?:\s+|$)/)
            .map((s) => s.trim())
            .filter(Boolean);
        })();

        // Other stats (exclude fields rendered in blocks)
        const EXCLUDE = new Set([
          "keywords",
          "abilities",
          "Abilities",
          "eliteChart",
          "elitechart",
          "Elite Chart",
          "Initiative",
          "initiative",
          "Size",
          "size",
          "Move",
          "move",
          "Escape",
          "escape",
          "Defense",
          "defense",
          "Armor",
          "armor",
          "Spirit Armor",
          "spirit armor",
          "SpiritArmor",
          "spiritArmor",
          "Health",
          "health",
          "Damage",
          "damage",
          "Melee Attack",
          "melee",
          "Melee",
          "Ranged Attack",
          "ranged",
          "Ranged",
          "name",
          "Name",
          "world",
          "World",
          "id",
          "localId",
          "note",
          "stats",
          "toHit",
          "eliteAbilities",
          "statVariantMissing",
          "brutal",
          "combat",
          "Combat",
          "xpEach",
          "xp",
          "XP",
          "set",
        ]);
        const otherEntries = Object.entries(stats)
          .filter(([k]) => !EXCLUDE.has(k))
          .map(([k, obj]) => {
            const label = String(k).replace(/(^|\s)\S/g, (s) => s.toUpperCase());
            const text = toText(obj);
            return { label, text, obj };
          })
          .filter((e) => e.text);

        const brutalFlag = group.baseStats?.brutal;
        const hasStatSystem = typeof brutalFlag === 'boolean';
        const cardBg = brutalFlag ? 'bg-red-950' : hasStatSystem ? 'bg-green-950' : 'bg-[#3b2f1d]';
        const cardBorder = brutalFlag ? 'border-red-800' : hasStatSystem ? 'border-green-800' : 'border-[#8b6b46]';

        return (
          <div
            key={group.id || idx}
            className={`rounded-lg p-4 ${cardBg} text-amber-100 border ${cardBorder} shadow`}
          >
            {/* HEADER: name/elite/keywords (left) + small initiative bubble (right) */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex flex-col gap-2 min-w-[220px]">
                <div className="flex items-baseline gap-2 flex-wrap">
                  {hasStatSystem && (
                    <span className={`text-xs font-bold italic tracking-widest uppercase ${brutalFlag ? 'text-red-400' : 'text-green-400'}`}>
                      {brutalFlag ? 'Brutal' : 'Normal'}
                    </span>
                  )}
                  <span className="font-bold text-xl leading-none">{group.name}</span>
                  <span className="text-sm opacity-90">x{group.count}</span>
                  {group.eliteAbilityList?.length > 0 && (
                    <span className="badge badge-accent">Elite</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {keywords.length ? (
                    keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[11px] rounded bg-stone-800 border border-stone-700"
                      >
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs opacity-70">No keywords</span>
                  )}
                </div>
              </div>

              {/* SMALLER bubble with "Initiative" label inside */}
              <div className="flex flex-col items-end gap-1">
                <div className="w-[80px] h-[80px] rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center">
                  <div className="flex flex-col items-center leading-tight">
                    <div className="text-xl font-black">
                      {initiative != null ? String(initiative) : "—"}
                    </div>
                    <div className="text-[9px] uppercase tracking-wide opacity-80 -mt-0.5">
                      Initiative
                    </div>
                  </div>
                </div>
                <div className="w-full text-right text-[11px] opacity-80">Size:</div>
                <div className="w-full text-right font-semibold">
                  {size != null ? String(size) : "—"}
                </div>
              </div>
            </div>

            {/* CONTENT: single column fills width; bottom row has right-aligned chips (no big box) */}
            <div className="mt-3 space-y-3">
              {(meleeAtk || rangedAtk) && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-1">
                    Attacks
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {meleeAtk && (
                      <div className="rounded-md p-2 bg-stone-900/60 border border-stone-700">
                        <div className="text-xs font-semibold mb-1">Melee</div>
                        {formatAttackBlock(meleeAtk)}
                      </div>
                    )}
                    {rangedAtk && (
                      <div className="rounded-md p-2 bg-stone-900/60 border border-stone-700">
                        <div className="text-xs font-semibold mb-1">Ranged</div>
                        {formatAttackBlock(rangedAtk)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(move || escape) && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-1">
                    Mobility
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {move && (
                      <span className="rounded-md px-2.5 py-1 text-xs bg-stone-800 border border-stone-700">
                        <b>Move:</b> {move}
                      </span>
                    )}
                    {escape && (
                      <span className="rounded-md px-2.5 py-1 text-xs bg-stone-800 border border-stone-700">
                        <b>Escape:</b> {escape}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {otherEntries.length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-1">
                    Other
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {otherEntries.map(({ label, text, obj }) => (
                      <span
                        key={`${label}-${text}`}
                        className="rounded-md px-2.5 py-1 text-xs bg-stone-800 border border-stone-700"
                        title={safeTitle(obj)}
                      >
                        <b>{label}:</b> {text}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Right-aligned Defense/Armor/Spirit Armor/Health chips (no container box) */}
              {(defense || armor || spiritArmor || health) && (
                <div className="flex flex-wrap gap-2 justify-end">
                  {defense && (
                    <span className="rounded-md px-2.5 py-1 text-xs bg-stone-800 border border-stone-700">
                      <b>Defense:</b> {defense}
                    </span>
                  )}
                  {armor && (
                    <span className="rounded-md px-2.5 py-1 text-xs bg-stone-800 border border-stone-700">
                      <b>Armor:</b> {armor}
                    </span>
                  )}
                  {spiritArmor && (
                    <span className="rounded-md px-2.5 py-1 text-xs bg-stone-800 border border-stone-700">
                      <b>Spirit Armor:</b> {spiritArmor}
                    </span>
                  )}
                  {health && (
                    <span className="rounded-md px-2.5 py-1 text-xs bg-stone-800 border border-stone-700">
                      <b>Health:</b> {health}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Abilities */}
            {abilities.length > 0 && (
              <div className="mt-4 text-xs space-y-1">
                <div className="font-semibold">Abilities</div>
                <ul className="list-disc list-inside space-y-0.5">
                  {abilities.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Active Elite Abilities */}
            {(() => {
              const activeElites = group.eliteAbilityList || [];
              const chart = group.eliteChart || group.baseStats?.eliteChart || [];
              const totalElites = eliteCount + (group.manualExtraElite || 0);

              const rerollAll = () => {
                const rolled = rollEliteAbilities(chart, totalElites);
                setCombatGroups((groups) =>
                  groups.map((g, i) => (i === idx ? { ...g, eliteAbilityList: rolled } : g))
                );
              };

              const addOneElite = () => {
                const newExtra = (group.manualExtraElite || 0) + 1;
                const rolled = rollEliteAbilities(chart, totalElites + 1);
                setCombatGroups((groups) =>
                  groups.map((g, i) => (i === idx ? { ...g, manualExtraElite: newExtra, eliteAbilityList: rolled } : g))
                );
              };

              const removeOneElite = () => {
                if (activeElites.length <= 0) return;
                const newExtra = Math.max(0, (group.manualExtraElite || 0) - 1);
                // Remove the last elite ability
                const trimmed = activeElites.slice(0, -1);
                setCombatGroups((groups) =>
                  groups.map((g, i) => (i === idx ? { ...g, manualExtraElite: newExtra, eliteAbilityList: trimmed } : g))
                );
              };

              const removeSpecific = (eliteIdx) => {
                const updated = activeElites.filter((_, ei) => ei !== eliteIdx);
                setCombatGroups((groups) =>
                  groups.map((g, i) => (i === idx ? { ...g, eliteAbilityList: updated } : g))
                );
              };

              return (
                <div className="mt-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="font-semibold text-sm flex items-center gap-2">
                      <span>Elite Abilities</span>
                      {activeElites.length > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs bg-amber-600 text-white font-bold">
                          {activeElites.length}
                        </span>
                      )}
                    </div>
                    {chart.length > 0 && (
                      <div className="flex gap-1">
                        <button
                          onClick={addOneElite}
                          className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-700 text-white border border-amber-600 hover:bg-amber-600"
                          title="Add one more elite ability"
                        >
                          +1 Elite
                        </button>
                        <button
                          onClick={removeOneElite}
                          disabled={activeElites.length === 0}
                          className="px-2 py-0.5 rounded text-xs font-semibold bg-stone-700 text-stone-200 border border-stone-600 hover:bg-stone-600 disabled:opacity-40"
                          title="Remove last elite ability"
                        >
                          −1 Elite
                        </button>
                        <button
                          onClick={rerollAll}
                          className="px-2 py-0.5 rounded text-xs font-semibold bg-red-800 text-white border border-red-700 hover:bg-red-700"
                          title="Re-roll all elite abilities"
                        >
                          Re-roll
                        </button>
                      </div>
                    )}
                  </div>

                  {activeElites.length > 0 ? (
                    <ul className="space-y-1">
                      {activeElites.map((elite, ei) => (
                        <li key={ei} className="flex items-start gap-2 text-xs rounded-md p-1.5 bg-amber-900/40 border border-amber-700/50">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px] font-bold mt-0.5">
                            {elite.roll}
                          </span>
                          <span className="flex-1">{elite.text}</span>
                          <button
                            onClick={() => removeSpecific(ei)}
                            className="shrink-0 text-red-400 hover:text-red-300 text-xs font-bold"
                            title="Remove this elite ability"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs opacity-60 italic">
                      {chart.length > 0
                        ? "No elite abilities active. Use +1 Elite or Re-roll to add."
                        : "No elite chart for this enemy."
                      }
                    </div>
                  )}

                  {/* Collapsible full elite chart reference */}
                  {chart.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer opacity-70 hover:opacity-100">
                        Full Elite Chart (reference)
                      </summary>
                      <ol className="list-decimal list-inside text-xs mt-1 space-y-0.5 opacity-80">
                        {chart.map((line, ci) => (
                          <li key={ci}>{line}</li>
                        ))}
                      </ol>
                    </details>
                  )}
                </div>
              );
            })()}

            {/* DM note + remove */}
            <div className="mt-4">
              <label className="text-xs font-semibold">DM Note:</label>
              <input
                type="text"
                className="input input-xs w-full mt-1"
                value={group.note || ""}
                placeholder="Type a note…"
                onChange={(e) => {
                  const val = e.target.value;
                  setCombatGroups((groups) =>
                    groups.map((g, i) => (i === idx ? { ...g, note: val } : g))
                  );
                }}
              />
              <button
                className="btn btn-xs btn-error mt-2"
                onClick={() =>
                  setCombatGroups((groups) => groups.filter((_, i) => i !== idx))
                }
              >
                Remove Group
              </button>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
