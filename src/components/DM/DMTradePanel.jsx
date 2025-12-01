import React, { useState } from "react";

export default function DMTradePanel({ posse = [], updateHero }) {
  const [fromHeroId, setFromHeroId] = useState("");
  const [toHeroId, setToHeroId] = useState("");
  const [selectedItemIdx, setSelectedItemIdx] = useState(null);
  const [tradeHistory, setTradeHistory] = useState([]);

  const fromHero = posse.find(h => h.id === fromHeroId);
  const toHero = posse.find(h => h.id === toHeroId);

  const canTrade = fromHero && toHero && selectedItemIdx !== null && fromHeroId !== toHeroId;

  function handleTrade() {
    if (!canTrade) return;
    const item = fromHero.inventory[selectedItemIdx];
    if (!item) return;
    // Remove from fromHero
    const updatedFrom = {
      ...fromHero,
      inventory: fromHero.inventory.filter((_, idx) => idx !== selectedItemIdx)
    };
    // Add to toHero
    const updatedTo = {
      ...toHero,
      inventory: [...(toHero.inventory || []), item]
    };
    updateHero(updatedFrom);
    updateHero(updatedTo);
    setTradeHistory(prev => [
      ...prev,
      {
        item,
        from: fromHero.name,
        to: toHero.name,
        time: Date.now()
      }
    ]);
    setSelectedItemIdx(null);
  }

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-lg">Posse Item Trading</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="font-semibold">From Hero:</label>
          <select className="select select-bordered w-full"
            value={fromHeroId}
            onChange={e => {
              setFromHeroId(e.target.value);
              setSelectedItemIdx(null);
            }}
          >
            <option value="">Select Hero</option>
            {posse.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
          {fromHero && (
            <div className="mt-2">
              <b>Inventory:</b>
              <ul className="space-y-1">
                {(fromHero.inventory || []).length === 0 && (
                  <li className="italic text-gray-400">No items</li>
                )}
                {(fromHero.inventory || []).map((item, idx) => (
                  <li key={idx} className={`p-2 border rounded ${selectedItemIdx === idx ? "bg-blue-200" : "bg-base-100"}`}>
                    <button
                      className="w-full text-left"
                      onClick={() => setSelectedItemIdx(idx)}
                    >
                      <span className="font-semibold">{item.name}</span>
                      <span className="ml-2 text-xs text-gray-700">{item.effect || ""}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div>
          <label className="font-semibold">To Hero:</label>
          <select className="select select-bordered w-full"
            value={toHeroId}
            onChange={e => setToHeroId(e.target.value)}
          >
            <option value="">Select Hero</option>
            {posse
              .filter(h => h.id !== fromHeroId)
              .map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
          </select>
          <div className="mt-2">
            <button
              className="btn btn-primary"
              disabled={!canTrade}
              onClick={handleTrade}
            >
              Trade Item
            </button>
          </div>
        </div>
      </div>
      {/* Trade history */}
      <div>
        <h3 className="font-bold text-md mb-2">Recent Trades</h3>
        <ul className="text-xs max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
          {tradeHistory.length === 0 && <li className="italic text-gray-400">No trades yet.</li>}
          {tradeHistory.slice(-10).reverse().map((t, i) => (
            <li key={i}>
              <b>{t.item.name}</b> from <span className="text-blue-700">{t.from}</span> to <span className="text-green-700">{t.to}</span>
              <span className="ml-2 text-gray-400">{new Date(t.time).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
        {/* Undo last trade */}
        {tradeHistory.length > 0 && (
          <button
            className="btn btn-xs btn-error mt-2"
            onClick={() => {
              const last = tradeHistory[tradeHistory.length - 1];
              if (!last) return;
              // Undo the trade: remove from "to", add back to "from"
              const fromHero = posse.find(h => h.name === last.from);
              const toHero = posse.find(h => h.name === last.to);
              if (toHero && updateHero) {
                let updatedTo = { ...toHero };
                updatedTo.inventory = (updatedTo.inventory || []).filter(
                  item => !(item.name === last.item.name && item.effect === last.item.effect)
                );
                updateHero(updatedTo);
              }
              if (fromHero && updateHero) {
                let updatedFrom = { ...fromHero };
                if (!updatedFrom.inventory) updatedFrom.inventory = [];
                updatedFrom.inventory = [...updatedFrom.inventory, last.item];
                updateHero(updatedFrom);
              }
              setTradeHistory(hist => hist.slice(0, -1));
            }}
          >
            Undo Last Trade
          </button>
        )}
      </div>
    </div>
  );
}
