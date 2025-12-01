import React from "react";

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
    </div>
  );
}
