// src/components/Shops/BlacksmithShop.jsx
import React from 'react';
import { loadTownState, getShopMods } from '../../utils/townState'; // uses getShopMods(state, shopId)

function useBlacksmithMods() {
  const read = () => getShopMods(loadTownState(), 'blacksmith');
  const [mods, setMods] = React.useState(read);

  React.useEffect(() => {
    const onChange = () => setMods(read());
    window.addEventListener('sobTownStateChanged', onChange);
    return () => window.removeEventListener('sobTownStateChanged', onChange);
  }, []);

  return mods || { priceDelta: 0, destroyed: false, saleActive: false };
}

function goldCostOf(item) {
  if (!item) return 0;
  if (typeof item.cost === 'number') return item.cost;
  if (item.cost && typeof item.cost === 'object') return Number(item.cost.gold || 0);
  if (typeof item.value === 'number') return item.value; // legacy
  return 0;
}

export default function BlacksmithShop({ shop }) {
  const mods = useBlacksmithMods();
  const disabled = !!mods.destroyed;
  const items = Array.isArray(shop?.items) ? shop.items : [];
// --- Small helpers (same logic as TownTab, trimmed) ---
const capCount = (n) => Math.max(0, Number(n || 0));
const deriveHandsRequired = (item) => {
  if (item?.rules?.freeAttackPerTurn) return 0;
  if (typeof item?.handsRequired === 'number') return item.handsRequired;
  if (item?.twoHanded) return 2;
  if (item?.slot === 'Gun' || item?.slot === 'Hand Weapon') return 1;
  return 0;
};

// Render simple chips; you can swap for your ImgIcon row if you prefer
const StatChip = ({ label }) => (
  <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-gray-100 border text-gray-700 mr-1 mt-1">
    {label}
  </span>
);

// Build a compact stat list for an item
function renderItemStats(item) {
  const stats = [];
  const slots = capCount(item?.upgradeSlots);
  const weight = capCount(item?.weight);
  const hands = capCount(deriveHandsRequired(item));

  if (slots) stats.push(`Slots: ${slots}`);
  if (weight) stats.push(`Weight: ${weight}`);
  if (hands)  stats.push(`Hands: ${hands}`);

  // Optional Dark Stone signal: show whichever is present (carried or cost)
  const dsCost = Number(item?.cost?.darkStone || 0);
  const dsCarry = Number(item?.grantsCurrency?.darkStone || item?.carries?.darkStone || 0);
  if (dsCarry) stats.push(`Carries DS: ${dsCarry}`);
  else if (dsCost) stats.push(`DS Cost: ${dsCost}`);

  if (!stats.length) return null;
  return (
    <div className="mt-2 -mx-1">
      {stats.map((s, i) => <StatChip key={i} label={s} />)}
    </div>
  );
}

  return (
    <div>
      {disabled && (
        <div className="alert alert-warning mb-3">
          The Blacksmith is closed.
        </div>
      )}

      {/* Rare Find panel (optional, for parity with TownTab) */}
      {mods.rareFind?.artifact && (
        <div className="alert alert-info mb-4">
          <div className="font-semibold">
            Rare Find: {mods.rareFind.artifact.name}
          </div>
          <div className="text-sm">Price: {mods.rareFind.priceDS} Dark Stone</div>
        </div>
      )}

      <div className="tabs tabs-bordered mb-4">
        {/* parent tabs would live up-stack; left as placeholder */}
      </div>

      <div className="grid gap-3">
        {items.length === 0 && (
          <div className="text-sm text-gray-500">No items available.</div>
        )}
        {items.map((item, idx) => {
          const base = goldCostOf(item);
          let price = base + (mods.priceDelta || 0);
          if (base > 0) price = Math.max(10, price); // enforce floor
          const key = item.id ?? item.name ?? `itm_${idx}`;
          return (
            <div key={key} className="card bg-white shadow">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{item.name}</h4>
                  <div className="badge">{`$${price}`}</div>
                </div>
                {/* ...item description/effects, etc... */}
                <button className="btn btn-primary btn-sm" disabled={disabled}>
                  Buy
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
