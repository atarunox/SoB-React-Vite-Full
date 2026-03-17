import React, { useMemo, useState } from "react";
import { useHero } from "../context/HeroContext";
import { usePosse } from "../context/PosseContext";

// minimal shape:
// hero.sidebags = { capacity: number, items: [{ id, name, qty }] }

const ensureSidebags = (hero) => {
  const sb = hero?.sidebags;
  if (!sb || typeof sb !== "object") return { capacity: 6, items: [] };
  const cap = Number.isFinite(sb.capacity) ? sb.capacity : 6;
  const items = Array.isArray(sb.items) ? sb.items : [];
  return { capacity: cap, items };
};

const uid = () => Math.random().toString(36).slice(2, 9);

export default function SidebagsTab() {
  const { hero, setHero } = useHero();
  const { updateHero } = usePosse();
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);

  const sb = useMemo(() => ensureSidebags(hero), [hero]);
  const used = sb.items.reduce((a, i) => a + (i.qty ?? 1), 0);
  const free = Math.max(0, sb.capacity - used);

  if (!hero) {
    return <div className="text-sm text-gray-500">No hero selected.</div>;
  }

  const persist = (next) => {
    const nextHero = {
      ...hero,
      sidebags: next,
      // Explicitly null legacy fields so they overwrite in PosseContext's merge
      sideBag: null,
      sideBagTokens: null,
      updatedAt: Date.now(),
    };
    setHero(nextHero);           // immediate UI
    updateHero({ id: hero.id || hero.localId, sidebags: next, sideBag: null, sideBagTokens: null, updatedAt: Date.now() }); // persisted
  };

  const addItem = () => {
    const n = name.trim();
    const q = Math.max(1, Number(qty) || 1);
    if (!n) return;
    if (q > free) { alert("Not enough space in sidebags."); return; }

    // merge by name (case-insensitive)
    const items = [...sb.items];
    const idx = items.findIndex(i => (i.name || "").toLowerCase() === n.toLowerCase());
    if (idx >= 0) items[idx] = { ...items[idx], qty: (items[idx].qty ?? 1) + q };
    else items.push({ id: uid(), name: n, qty: q });

    persist({ ...sb, items });
    setName("");
    setQty(1);
  };

  const changeQty = (id, delta) => {
    const items = sb.items.map(i => i.id === id ? { ...i, qty: Math.max(0, (i.qty ?? 1) + delta) } : i)
                          .filter(i => (i.qty ?? 1) > 0);
    persist({ ...sb, items });
  };

  const removeItem = (id) => {
    const items = sb.items.filter(i => i.id !== id);
    persist({ ...sb, items });
  };

  const setCapacity = (cap) => {
    const capacity = Math.max(0, Number(cap) || 0);
    // if capacity is lower than used, we still let it set; player must remove items to fit
    persist({ ...sb, capacity });
  };

  return (
    <div className="space-y-4">
      {/* Header / capacity */}
      <div className="flex items-center gap-3">
        <div className="font-semibold">Sidebags</div>
        <div className="text-sm">
          Capacity:&nbsp;
          <input
            type="number"
            className="input input-xs w-20"
            value={sb.capacity}
            min={0}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </div>
        <div className="text-xs text-gray-600">
          Used {used}/{sb.capacity} &middot; Free {free}
        </div>
      </div>

      {/* Add row */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="input"
          placeholder="Token name (e.g., Claim, Reload, Bandage)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          className="input w-24"
          value={qty}
          min={1}
          onChange={(e) => setQty(e.target.value)}
        />
        <button className="btn bg-green-600 text-white" onClick={addItem}>Add</button>
      </div>

      {/* Items grid */}
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {sb.items.length === 0 && (
          <div className="text-sm text-gray-500">No tokens in sidebags.</div>
        )}
        {sb.items.map((it) => (
          <div key={it.id} className="border rounded-xl p-2 flex items-center justify-between">
            <div>
              <div className="font-medium">{it.name}</div>
              <div className="text-xs text-gray-600">Qty: {it.qty ?? 1}</div>
            </div>
            <div className="flex items-center gap-1">
              <button className="btn btn-xs" onClick={() => changeQty(it.id, -1)}>-</button>
              <button className="btn btn-xs" onClick={() => changeQty(it.id, +1)} disabled={free <= 0}>+</button>
              <button className="btn btn-xs bg-red-600 text-white" onClick={() => removeItem(it.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        Tip: You can lower capacity (e.g., encumbrance) and then discard tokens until you fit.
      </p>
    </div>
  );
}
