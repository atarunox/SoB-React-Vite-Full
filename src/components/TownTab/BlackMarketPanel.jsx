// src/components/TownTab/BlackMarketPanel.jsx
import React, { useMemo } from 'react';
import { loadTownState } from '../../utils/townState';
import { hasKeyword } from '../../utils/keywords';

function effectsBlock(effects) {
  if (!effects) return null;
  if (Array.isArray(effects)) {
    if (!effects.length) return null;
    return (
      <ul className="text-xs list-disc list-inside mt-1 text-gray-800">
        {effects.map((e, i) => (
          <li key={i}>{String(e)}</li>
        ))}
      </ul>
    );
  }
  const entries = Object.entries(effects);
  if (!entries.length) return null;
  return (
    <ul className="text-xs list-disc list-inside mt-1 text-gray-800">
      {entries.map(([k, v], i) => (
        <li key={i}>{`${k}: ${v}`}</li>
      ))}
    </ul>
  );
}

function SlotLine({ slot, twoHanded, weight, upgradeSlots, darkStone }) {
  const handed =
    twoHanded === true
      ? ' (Two-Handed)'
      : twoHanded === false
      ? ' (One-Handed)'
      : '';

  const bits = [];
  if (slot) bits.push(`${slot}${handed}`);
  if (Number.isFinite(weight)) bits.push(`Weight ${weight}`);
  if (Number.isFinite(upgradeSlots))
    bits.push(
      `${upgradeSlots} Upgrade Slot${upgradeSlots === 1 ? '' : 's'}`
    );
  if (darkStone) bits.push('Dark Stone');

  if (!bits.length) return null;

  return (
    <div className="text-[11px] text-gray-700 mt-1">
      <span className="inline-flex items-center gap-1">
        {slot?.toLowerCase().includes('hand') ||
        slot?.toLowerCase() === 'gun' ? (
          <span title={twoHanded ? 'Two-Handed' : 'One-Handed'}>
            🤚{twoHanded ? '🤚' : ''}
          </span>
        ) : null}
        <b>Slot</b>:
      </span>{' '}
      {bits.join(' • ')}
    </div>
  );
}

function useBlackMarketStock(shopId) {
  const s = loadTownState() || {};
  const day = s.dayStamp || new Date().toDateString();
  let items = s.lootPool || [];

  if (shopId === 'smugglersDen') {
    // Classic Smuggler's Den: only items explicitly pushed there
    items = items.filter(
      (it) =>
        it &&
        it.forSaleAtSmugglers &&
        (it.shop === 'smugglersDen' || !it.shop)
    );
  } else if (shopId === 'frontierOutpost') {
    // Frontier Outpost: ANY artifact card that ended up in the lootPool
    items = items.filter(
      (it) =>
        it &&
        Array.isArray(it.tags) &&
        it.tags.includes('Artifact')
    );
  } else if (shopId) {
    // Fallback: shop-based filter if we ever reuse this panel
    items = items.filter((it) => it && it.shop === shopId);
  }

  return { items, day, state: s };
}

export default function BlackMarketPanel({ shopId, hero, computePrice, onBuy }) {
  const { items, day, state } = useBlackMarketStock(shopId);

  const visible = useMemo(
    () => items.slice().sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)),
    [items]
  );

  if (!visible.length) return null;

  const locName =
    shopId === 'smugglersDen'
      ? "Smuggler's Den"
      : shopId === 'frontierOutpost'
      ? 'Frontier Outpost'
      : 'Black Market';

  const heroIsLawInSmugglers =
    shopId === 'smugglersDen' && hero && hasKeyword(hero, 'Law');

  return (
    <div className="mt-4 border rounded bg-slate-50 p-3">
      <div className="font-bold mb-2">{locName} Stock</div>
      <p className="text-xs text-gray-600 mb-2">
        Prices include a daily surcharge of <b>D6 × $25</b> that{' '}
        <i>re-rolls each new day</i>. Items persist across days until bought.
      </p>

      {heroIsLawInSmugglers && (
        <div className="mb-2 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">
          Law heroes may look through the Smuggler’s Den stock but cannot buy
          anything here.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {visible.map((it) => {
          const { die, total, base } =
            typeof computePrice === 'function'
              ? computePrice(it, state)
              : {
                  die: 1,
                  total: (it.value || 0) + 25,
                  base: it.value || 0,
                };

          const disabled =
            !!it.soldOut ||
            !hero ||
            hero.chosenLocation !== shopId ||
            heroIsLawInSmugglers;

          return (
            <div
              key={it.id}
              className="border p-2 rounded bg-white shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold break-words">
                  {it.name}
                </div>
                {it.soldOut && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 border">
                    SOLD OUT
                  </span>
                )}
              </div>

              {/* Slot / stats row */}
              <SlotLine
                slot={it.slot}
                twoHanded={it.twoHanded}
                weight={it.weight}
                upgradeSlots={it.upgradeSlots}
                darkStone={!!it.darkStone}
              />

              {/* Cost row */}
              <div className="text-xs text-gray-700 mt-1">
                Cost: <b>${total}</b>
                <span className="text-[11px] text-gray-500 ml-1">
                  ({base ? `$${base} + ` : ''}
                  D6×$25
                  {Number.isFinite(die) ? ` = ${die}×$25` : ''})
                </span>
              </div>

              {/* Effects / stats */}
              {effectsBlock(it.effects)}

              {/* Tags */}
              {Array.isArray(it.tags) && it.tags.length > 0 && (
                <div className="mt-1">
                  {it.tags.map((t, i) => (
                    <span
                      key={i}
                      className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-gray-100 border text-gray-700 mr-1 mt-1"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="mt-2">
                <button
                  className={`btn btn-sm ${
                    disabled ? 'btn-disabled' : 'btn-primary'
                  }`}
                  disabled={disabled}
                  onClick={() => {
                    if (!disabled) {
                      onBuy?.(it, total);
                    }
                  }}
                  title={
                    it.soldOut
                      ? 'Already purchased.'
                      : heroIsLawInSmugglers
                      ? 'Law heroes may not buy from the Smuggler’s Den.'
                      : hero?.chosenLocation !== shopId
                      ? 'Visit this location first.'
                      : ''
                  }
                >
                  {it.soldOut ? 'Sold Out' : 'Buy'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-gray-500 mt-2">Day: {day}</div>
    </div>
  );
}
