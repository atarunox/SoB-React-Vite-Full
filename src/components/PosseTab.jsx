// src/components/PosseTab.jsx
import React, { useMemo, useState, useEffect } from "react";
import { usePosse } from "../context/PosseContext";
import { calculateCurrentStats } from "../utils/calculateStats";

function getId(h) {
  return h?.id || h?.localId;
}

const normalizeKey = (key = "") =>
  key
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-[#8b6b46] bg-[#f5ebd8] px-3 py-2 text-center shadow-sm">
      <div className="text-[11px] font-semibold tracking-wide text-[#3b2f1d]">
        {label}
      </div>
      <div className="text-lg font-black text-[#1f1f1f] leading-tight">
        {value}
      </div>
    </div>
  );
}

function fmtRange(cur, max) {
  const a = Number(cur ?? 0);
  const b = Number(max ?? 0);
  return `${a} / ${b}`;
}

// best-effort carry weight calculation across common shapes
function computeCarryNow(hero) {
  if (!hero || typeof hero !== "object") return 0;
  if (typeof hero.carryWeight === "number") return hero.carryWeight;
  const weightOf = (it) => Number(it?.weight ?? it?.Weight ?? 0);

  let total = 0;

  // Inventory array
  if (Array.isArray(hero.inventory)) {
    for (const item of hero.inventory) total += weightOf(item);
  }

  // Flat gear arrays (various legacy names)
  const maybeArrays = [
    hero.gear,
    hero.equipment,
    hero.equipped,
    hero.equippedItems,
  ];
  for (const arr of maybeArrays) {
    if (Array.isArray(arr)) for (const item of arr) total += weightOf(item);
  }

  // Slot-based equipment objects
  const slots = hero.equippedSlots || hero.slots || hero.equipmentSlots;
  if (slots && typeof slots === "object") {
    for (const key of Object.keys(slots)) {
      const v = slots[key];
      if (Array.isArray(v)) for (const item of v) total += weightOf(item);
      else if (v) total += weightOf(v);
    }
  }

  return total;
}

// Human-readable class label appended after the name
function prettyClass(raw) {
  if (!raw) return "Unknown";
  const compact = String(raw).replace(/[\s_]+/g, "");
  const alias =
    { Bandida: "Bandido", USMarshal: "USMarshall" }[compact] || compact;
  const human = alias.replace(/([a-z])([A-Z])/g, "$1 $2");
  return alias === "USMarshall" ? "US Marshal" : human;
}

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const POSSE_BUFFS_KEY = "sob:posseBuffs";
const POSSE_ITEMS_KEY = "sob:posseItems";
const TREASURE_POOL_KEY = "sob:treasurePool";

const hasBrowserStorage =
  typeof window !== "undefined" && typeof localStorage !== "undefined";

function loadArrayFromStorage(key) {
  if (!hasBrowserStorage) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function PosseTab() {
  const { posse, activeHeroId, setActiveHeroId, updateHero } = usePosse();

  const [activeTab, setActiveTab] = useState("Overview");
  const [posseBuffs, setPosseBuffs] = useState(() =>
    loadArrayFromStorage(POSSE_BUFFS_KEY)
  );
  const [posseItems, setPosseItems] = useState(() =>
    loadArrayFromStorage(POSSE_ITEMS_KEY)
  );
  const [treasurePool, setTreasurePool] = useState(() =>
    loadArrayFromStorage(TREASURE_POOL_KEY)
  );

  // Persist buffs/items whenever they change
  useEffect(() => {
    if (!hasBrowserStorage) return;
    try {
      localStorage.setItem(POSSE_BUFFS_KEY, JSON.stringify(posseBuffs));
    } catch {}
  }, [posseBuffs]);

  useEffect(() => {
    if (!hasBrowserStorage) return;
    try {
      localStorage.setItem(POSSE_ITEMS_KEY, JSON.stringify(posseItems));
    } catch {}
  }, [posseItems]);

  useEffect(() => {
    if (!hasBrowserStorage) return;
    try {
      localStorage.setItem(TREASURE_POOL_KEY, JSON.stringify(treasurePool));
    } catch {}
  }, [treasurePool]);

  useEffect(() => {
    if (!hasBrowserStorage) return;
    if (activeTab === "Posse Buffs") {
      setPosseBuffs(loadArrayFromStorage(POSSE_BUFFS_KEY));
    } else if (activeTab === "Posse Items") {
      setPosseItems(loadArrayFromStorage(POSSE_ITEMS_KEY));
    } else if (activeTab === "Treasure Pool") {
      setTreasurePool(loadArrayFromStorage(TREASURE_POOL_KEY));
    }
  }, [activeTab]);

  const sorted = useMemo(() => {
    return [...(posse || [])].sort((a) =>
      getId(a) === activeHeroId ? -1 : 0
    );
  }, [posse, activeHeroId]);

  // ---- posse buffs handlers -------------------------------------------------

  const addPosseBuff = () => {
    const name = window.prompt(
      'Posse buff name (e.g., "Frontier Outpost Bounty", "Town Trait – Lawful"):'
    );
    if (!name) return;
    const source =
      window.prompt('Source (optional, e.g., "Frontier Outpost Event #11")') ||
      "";
    const notes =
      window.prompt(
        "Effect / notes (optional, e.g., +$25 per enemy killed this Adventure):"
      ) || "";

    setPosseBuffs((prev) => [
      ...prev,
      {
        id: uid(),
        name,
        source,
        notes,
        used: false,
      },
    ]);
  };

  const togglePosseBuffUsed = (id) => {
    setPosseBuffs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, used: !b.used } : b))
    );
  };

  const removePosseBuff = (id) => {
    if (!window.confirm("Remove this posse buff?")) return;
    setPosseBuffs((prev) => prev.filter((b) => b.id !== id));
  };

  const resetPosseBuffsUsed = () => {
    if (!window.confirm("Reset all posse buffs to unused/active?")) return;
    setPosseBuffs((prev) => prev.map((b) => ({ ...b, used: false })));
  };

  // ---- posse items handlers -------------------------------------------------

  const addPosseItem = () => {
    const name = window.prompt(
      'Posse item (e.g., "Shared Bounty Poster", "Group Map", "Clan Token"):'
    );
    if (!name) return;
    const qtyRaw = window.prompt("Quantity (default 1):", "1") || "1";
    const qty = Math.max(1, Number(qtyRaw) || 1);
    const notes =
      window.prompt("Notes (optional, e.g., who is holding it, rules):") || "";

    setPosseItems((prev) => [
      ...prev,
      {
        id: uid(),
        name,
        qty,
        notes,
      },
    ]);
  };

  const changePosseItemQty = (id, delta) => {
    setPosseItems((prev) =>
      prev
        .map((it) =>
          it.id === id
            ? { ...it, qty: Math.max(0, (it.qty ?? 0) + delta) }
            : it
        )
        .filter((it) => (it.qty ?? 0) > 0)
    );
  };

  const removePosseItem = (id) => {
    if (!window.confirm("Remove this posse item?")) return;
    setPosseItems((prev) => prev.filter((it) => it.id !== id));
  };

  const clearPosseItems = () => {
    if (!window.confirm("Clear all posse items?")) return;
    setPosseItems([]);
  };

  // ---- treasure pool handlers ------------------------------------------------

  const claimTreasure = (itemId, heroId) => {
    const item = treasurePool.find((it) => it.id === itemId);
    if (!item) return;
    const hero = posse.find((h) => getId(h) === heroId);
    if (!hero) return;
    const inv = Array.isArray(hero.inventory) ? [...hero.inventory] : [];
    inv.push({ ...item, _claimedAt: Date.now() });
    updateHero({ id: heroId, inventory: inv, updatedAt: Date.now() });
    setTreasurePool((prev) => prev.filter((it) => it.id !== itemId));
  };

  const removeTreasure = (itemId) => {
    if (!window.confirm("Discard this item permanently?")) return;
    setTreasurePool((prev) => prev.filter((it) => it.id !== itemId));
  };

  const clearTreasurePool = () => {
    if (!window.confirm("Discard all items in the treasure pool?")) return;
    setTreasurePool([]);
  };

  // ---------------------------------------------------------------------------

  return (
    <div className="p-4 space-y-4">
      {/* Header + sub-tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <h2 className="text-xl font-bold">Posse</h2>
        <div className="flex flex-wrap gap-2">
          {["Overview", "Treasure Pool", "Posse Buffs", "Posse Items"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                activeTab === tab
                  ? "bg-[#5C3A21] text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB -------------------------------------------------------- */}
      {activeTab === "Overview" && (
        <>
          {!sorted || sorted.length === 0 ? (
            <div className="text-sm text-gray-600">
              No posse members yet. Create heroes in the Party panel to see an
              overview here.
            </div>
          ) : (
            <div className="grid gap-4">
              {sorted.map((hero) => {
                const id = getId(hero);
                const isActive = id === activeHeroId;

                // Derived max stats from the same pipeline as StatsTab
                const { stats: ms } = calculateCurrentStats(hero || {});
                const maxHealth = Number(
                  ms[normalizeKey("Health")] ??
                    hero.maxHealth ??
                    hero.stats?.Health ??
                    0
                );
                const maxSanity = Number(
                  ms[normalizeKey("Sanity")] ??
                    hero.maxSanity ??
                    hero.stats?.Sanity ??
                    0
                );
                const maxGrit = Number(
                  ms[normalizeKey("Grit")] ??
                    hero.maxGrit ??
                    hero.stats?.Grit ??
                    0
                );
                const maxCorruption = Number(
                  ms[normalizeKey("Max Corruption")] ??
                    hero.maxCorruption ??
                    hero.stats?.["Max Corruption"] ??
                    5
                );
                const initiative =
                  ms[normalizeKey("Initiative")] ??
                  hero.initiative ??
                  hero.stats?.Initiative ??
                  "—";
                const strength = Number(
                  ms[normalizeKey("Strength")] ?? hero.stats?.Strength ?? 0
                );
                const maxCarry = strength + 5; // rule: Strength + 5
                const carryNow = computeCarryNow(hero);

                const currentHealth = Number(
                  hero.currentHealth ?? hero.health ?? 0
                );
                const currentSanity = Number(
                  hero.currentSanity ?? hero.sanity ?? 0
                );
                const currentGrit = Number(hero.currentGrit ?? hero.grit ?? 0);
                const currentCorruption = Number(
                  hero.currentCorruption ?? hero.corruption ?? 0
                );

                const name =
                  hero.name ||
                  hero.heroName ||
                  hero.displayName ||
                  hero.heroClass ||
                  "Unnamed Hero";
                const classDisplay = prettyClass(
                  hero.heroClass || hero.classCard?.name
                );
                const level = hero.level ?? hero.stats?.Level ?? 1;

                return (
                  <div
                    key={id}
                    className="rounded-xl shadow border border-[#5C3A21] bg-[#fdf6e3]/90 p-4 flex flex-col gap-4 text-black"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-lg">
                        {name}
                        <span className="text-gray-600 font-normal">
                          {" "}
                          — {classDisplay}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {!isActive && (
                          <button
                            className="btn btn-xs"
                            onClick={() => setActiveHeroId?.(id)}
                            title="Make this the active hero"
                          >
                            Set Active
                          </button>
                        )}
                        {isActive && (
                          <span className="text-xs text-blue-700 font-semibold">
                            Active hero
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Top row: big Health / Sanity */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-[#8b6b46] bg-[#f5ebd8] p-4 text-center shadow">
                        <div className="text-sm font-semibold text-[#3b2f1d]">
                          Health
                        </div>
                        <div className="text-2xl font-black text-[#1f1f1f]">
                          {fmtRange(currentHealth, maxHealth)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-[#8b6b46] bg-[#f5ebd8] p-4 text-center shadow">
                        <div className="text-sm font-semibold text-[#3b2f1d]">
                          Sanity
                        </div>
                        <div className="text-2xl font-black text-[#1f1f1f]">
                          {fmtRange(currentSanity, maxSanity)}
                        </div>
                      </div>
                    </div>

                    {/* Secondary stats: spaced pills */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <StatCard label="Initiative" value={initiative} />
                      <StatCard label="Level" value={level} />
                      <StatCard
                        label="Grit"
                        value={fmtRange(currentGrit, maxGrit)}
                      />
                      <StatCard
                        label="Corruption"
                        value={fmtRange(currentCorruption, maxCorruption)}
                      />
                    </div>

                    {/* Meta info (Gold + Carry) */}
                    <div className="grid grid-cols-2 gap-3">
                      <StatCard label="Gold" value={hero.gold ?? 0} />
                      <StatCard
                        label="Carry"
                        value={fmtRange(carryNow, maxCarry)}
                      />
                    </div>

                    {/* Visit state */}
                    {hero.chosenLocation && (
                      <div className="text-sm text-green-700">
                        Chosen Location:{" "}
                        <strong>{hero.chosenLocation}</strong>
                        {hero.isDone ? " — Done for the day" : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TREASURE POOL TAB ---------------------------------------------------- */}
      {activeTab === "Treasure Pool" && (
        <section className="rounded-xl border border-[#5C3A21] bg-[#fdf6e3]/90 p-4 shadow space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-lg">
              Treasure Pool
              {treasurePool.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({treasurePool.length} item{treasurePool.length !== 1 ? "s" : ""})
                </span>
              )}
            </h3>
            {treasurePool.length > 0 && (
              <button
                className="btn btn-sm btn-ghost text-red-600"
                onClick={clearTreasurePool}
              >
                Discard All
              </button>
            )}
          </div>

          {treasurePool.length === 0 ? (
            <div className="text-sm text-gray-600 italic">
              No items in the treasure pool. When heroes drop items, they appear
              here for others to claim.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {treasurePool.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[#8b6b46] bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{item.name}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.slot && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
                            {item.slot}
                          </span>
                        )}
                        {item.value != null && item.value > 0 && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            ${item.value}
                          </span>
                        )}
                        {item.weight != null && item.weight > 0 && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                            Wt: {item.weight}
                          </span>
                        )}
                        {item._droppedBy && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                            From: {item._droppedBy}
                          </span>
                        )}
                      </div>
                      {(item.description || item.effect) && (
                        <div className="mt-1 text-xs text-gray-700">
                          {item.description || item.effect}
                        </div>
                      )}
                      {item.mods && Object.keys(item.mods).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {Object.entries(item.mods)
                            .filter(([, v]) => typeof v === "number" && v !== 0)
                            .map(([k, v]) => (
                              <span
                                key={k}
                                className="text-[11px] px-1.5 py-0.5 rounded bg-green-50 text-green-800"
                              >
                                {k} {v > 0 ? "+" : ""}
                                {v}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                    <button
                      className="btn btn-xs btn-ghost text-red-600 shrink-0"
                      onClick={() => removeTreasure(item.id)}
                      title="Discard permanently"
                    >
                      Discard
                    </button>
                  </div>

                  {/* Claim buttons — one per hero */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sorted.map((hero) => {
                      const hid = getId(hero);
                      const heroName =
                        hero.name || hero.heroName || hero.heroClass || "Hero";
                      return (
                        <button
                          key={hid}
                          className="btn btn-xs btn-outline min-h-[36px]"
                          onClick={() => claimTreasure(item.id, hid)}
                        >
                          Give to {heroName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-600">
            Items dropped by heroes appear here. Tap a hero name to add the item
            to their inventory.
          </p>
        </section>
      )}

      {/* POSSE BUFFS TAB ----------------------------------------------------- */}
      {activeTab === "Posse Buffs" && (
        <section className="rounded-xl border border-[#5C3A21] bg-[#fdf6e3]/90 p-4 shadow space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-lg">Posse Buffs & Effects</h3>
            <div className="flex gap-2">
              <button className="btn btn-sm" onClick={addPosseBuff}>
                + Add Posse Buff
              </button>
              {posseBuffs.length > 0 && (
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={resetPosseBuffsUsed}
                >
                  Reset Used
                </button>
              )}
            </div>
          </div>

          {posseBuffs.length === 0 ? (
            <div className="text-sm text-gray-600 italic">
              No posse-wide buffs yet. Track things like Frontier Outpost
              bounties, Town Traits, or mission-wide modifiers here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {posseBuffs.map((b) => (
                <div
                  key={b.id}
                  className={`rounded-xl border p-3 bg-white ${
                    b.used ? "opacity-80 border-gray-400" : "border-[#8b6b46]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm">{b.name}</div>
                      {b.source && (
                        <div className="text-[11px] text-gray-500">
                          Source: {b.source}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <label className="text-[11px] flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={!!b.used}
                          onChange={() => togglePosseBuffUsed(b.id)}
                        />
                        <span>{b.used ? "Used / Expired" : "Active"}</span>
                      </label>
                      <button
                        className="btn btn-xs btn-ghost"
                        onClick={() => removePosseBuff(b.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  {b.notes && (
                    <div className="mt-1 text-xs text-gray-700 whitespace-pre-wrap">
                      {b.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-600">
            Example: <strong>Frontier Outpost Bounty</strong> (Event 11) – “All
            heroes gain +$X per enemy killed this Adventure.” Add that here
            once, instead of on each hero.
          </p>
        </section>
      )}

      {/* POSSE ITEMS TAB ----------------------------------------------------- */}
      {activeTab === "Posse Items" && (
        <section className="rounded-xl border border-[#5C3A21] bg-[#fdf6e3]/90 p-4 shadow space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-lg">Posse Items / Shared Stuff</h3>
            <div className="flex gap-2">
              <button className="btn btn-sm" onClick={addPosseItem}>
                + Add Posse Item
              </button>
              {posseItems.length > 0 && (
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={clearPosseItems}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {posseItems.length === 0 ? (
            <div className="text-sm text-gray-600 italic">
              No shared posse items yet. Use this for things like group maps,
              clan tokens, or rewards that aren&apos;t held by a single hero.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {posseItems.map((it) => (
                <div
                  key={it.id}
                  className="rounded-xl border border-[#8b6b46] bg-white p-3 flex flex-col gap-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm">{it.name}</div>
                      <div className="text-[11px] text-gray-600">
                        Qty: {it.qty ?? 1}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex gap-1">
                        <button
                          className="btn btn-xs"
                          onClick={() => changePosseItemQty(it.id, -1)}
                          disabled={(it.qty ?? 1) <= 0}
                        >
                          -1
                        </button>
                        <button
                          className="btn btn-xs"
                          onClick={() => changePosseItemQty(it.id, +1)}
                        >
                          +1
                        </button>
                      </div>
                      <button
                        className="btn btn-xs btn-ghost"
                        onClick={() => removePosseItem(it.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  {it.notes && (
                    <div className="mt-1 text-xs text-gray-700 whitespace-pre-wrap">
                      {it.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-600">
            Tip: keep this for truly shared things; if something belongs to a
            specific hero, put it in their Gear/Inventory instead.
          </p>
        </section>
      )}
    </div>
  );
}
