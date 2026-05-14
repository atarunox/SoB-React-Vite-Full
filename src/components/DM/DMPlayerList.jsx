import React, { useState, useEffect } from "react";

// small helpers (no UI impact)
const getId = (h) => h?.id ?? h?.localId ?? null;
function makeKeyFactory() {
  const seen = new Map();
  return (base, idx) => {
    const keyBase = base ?? "noid";
    const n = seen.get(keyBase) ?? 0;
    seen.set(keyBase, n + 1);
    return `hero:${keyBase}:${n}`; // hero:abc:0, hero:abc:1, ...
  };
}
const uniqueKeyForHero = makeKeyFactory();

const POSSE_BUFFS_KEY = "sob:posseBuffs";
const POSSE_ITEMS_KEY = "sob:posseItems";

function loadArrayFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function DMPlayerList({
  posse = [],
  setSelectedHeroId,           // optional legacy pattern
  onManage = () => {},         // optional: (hero) => void
}) {
  // optional: dedupe by id to avoid duplicate rows if the same hero appears twice
  const posseDedupe = React.useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const h of Array.isArray(posse) ? posse : []) {
      const id = getId(h) ?? `noid:${h?.name ?? ""}`;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(h);
    }
    return out;
  }, [posse]);

  // Read posse buffs & items from localStorage (same source as PosseTab)
  const [posseBuffs, setPosseBuffs] = useState(() => loadArrayFromStorage(POSSE_BUFFS_KEY));
  const [posseItems, setPosseItems] = useState(() => loadArrayFromStorage(POSSE_ITEMS_KEY));
  const [showPosseExtras, setShowPosseExtras] = useState(false);

  // Re-sync whenever this component gains visibility (tab switch)
  useEffect(() => {
    const onFocus = () => {
      setPosseBuffs(loadArrayFromStorage(POSSE_BUFFS_KEY));
      setPosseItems(loadArrayFromStorage(POSSE_ITEMS_KEY));
    };
    window.addEventListener("focus", onFocus);
    // Also sync on an interval for tab-switch detection within the SPA
    const iv = setInterval(onFocus, 3000);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(iv);
    };
  }, []);

  const activeBuffs = posseBuffs.filter((b) => !b.used);
  const usedBuffs = posseBuffs.filter((b) => b.used);
  const totalExtras = posseBuffs.length + posseItems.length;

  return (
    <div className="p-4 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold">Players in Posse</h2>

      {(!Array.isArray(posse) || posse.length === 0) && (
        <div className="text-gray-500">No heroes in posse.</div>
      )}

      {posseDedupe.length > 0 && (
        <ul className="divide-y rounded overflow-hidden">
          {posseDedupe.map((hero, idx) => {
            const id = getId(hero);
            const name = hero.name || "Unnamed Hero";
            const level = Number(hero.level) || 1;
            const klass = hero.heroClass ?? hero.class ?? "—";
            const condCount = Array.isArray(hero.conditions) ? hero.conditions.length : 0;

            return (
              <li
                key={uniqueKeyForHero(id ?? name, idx)}
                className={`py-2 px-2 flex flex-col sm:flex-row sm:items-center sm:justify-between ${
                  idx % 2 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold">{name}</span>
                  <span className="ml-2 text-xs text-gray-600">
                    Lv {level} • {klass}
                    {condCount > 0 && (
                      <span className="ml-2 text-[11px] text-amber-700">
                        {condCount} condition{condCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </span>
                </div>

                {(setSelectedHeroId || onManage) && (
                  <div className="mt-2 sm:mt-0">
                    <button
                      type="button" // <-- prevents form submit if wrapped by a <form>
                      className="btn btn-primary btn-xs"
                      onClick={(e) => {
                        e?.preventDefault?.();
                        e?.stopPropagation?.();
                        if (typeof onManage === "function") onManage(hero);
                        if (typeof setSelectedHeroId === "function") {
                          const sel = hero.localId ?? hero.id ?? null;
                          if (sel != null) setSelectedHeroId(sel);
                        }
                      }}
                    >
                      Manage
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Posse Buffs & Items (read-only DM view) */}
      {totalExtras > 0 && (
        <div className="border-t pt-3 mt-2">
          <button
            type="button"
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-700"
            onClick={() => setShowPosseExtras((v) => !v)}
          >
            <span>
              Posse Buffs & Items{" "}
              <span className="text-xs font-normal text-gray-500">
                ({activeBuffs.length} active buff{activeBuffs.length !== 1 ? "s" : ""}
                {usedBuffs.length > 0 ? `, ${usedBuffs.length} used` : ""}
                {posseItems.length > 0
                  ? `, ${posseItems.length} item${posseItems.length !== 1 ? "s" : ""}`
                  : ""})
              </span>
            </span>
            <span className="text-xs">{showPosseExtras ? "▲ Hide" : "▼ Show"}</span>
          </button>

          {showPosseExtras && (
            <div className="mt-3 space-y-3">
              {/* Active Buffs */}
              {activeBuffs.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-green-700 mb-1">Active Buffs</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeBuffs.map((b) => (
                      <div
                        key={b.id}
                        className="rounded-lg border border-green-300 bg-green-50 px-3 py-2"
                      >
                        <div className="font-semibold text-sm text-green-900">{b.name}</div>
                        {b.source && (
                          <div className="text-[11px] text-green-700">Source: {b.source}</div>
                        )}
                        {b.notes && (
                          <div className="text-xs text-green-800 mt-0.5">{b.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Used / Expired Buffs */}
              {usedBuffs.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Used / Expired Buffs
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {usedBuffs.map((b) => (
                      <div
                        key={b.id}
                        className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 opacity-60"
                      >
                        <div className="font-semibold text-sm text-gray-700 line-through">
                          {b.name}
                        </div>
                        {b.source && (
                          <div className="text-[11px] text-gray-500">Source: {b.source}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posse Items */}
              {posseItems.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-blue-700 mb-1">Shared Items</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {posseItems.map((it) => (
                      <div
                        key={it.id}
                        className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-blue-900">{it.name}</span>
                          <span className="text-xs text-blue-700 font-medium">
                            x{it.qty ?? 1}
                          </span>
                        </div>
                        {it.notes && (
                          <div className="text-xs text-blue-800 mt-0.5">{it.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[11px] text-gray-400 italic">
                Read-only view — players manage these in the Posse tab.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
