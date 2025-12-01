// src/components/CustomItemCreator.jsx

import React, { useState } from 'react';

const gearSlots = [
  'Main Hand', 'Off Hand', 'Head', 'Torso', 'Coat', 'Gloves', 'Hands',
  'Pants', 'Feet', 'Shoulders', 'Face', 'Extra 1', 'Extra 2'
];

export default function CustomItemCreator({ hero, updateHero, enhanced }) {
  const [item, setItem] = useState({
    name: '',
    slot: '',
    effects: {},
    weight: 1,
    darkStone: false,
    darkStoneValue: 0,
    upgradeSlots: 0,
    twoHanded: false
  });

  const [statKey, setStatKey] = useState('');
  const [statValue, setStatValue] = useState(0);

  const updateEffect = () => {
    if (!statKey) return;
    const newEffects = { ...item.effects, [statKey]: parseInt(statValue, 10) || 0 };
    setItem({ ...item, effects: newEffects });
    setStatKey('');
    setStatValue(0);
  };

  const handleAdd = () => {
    if (!item.name || !item.slot) return;
    const newItem = { ...item, id: Date.now().toString() };
    const updatedHero = {
      ...hero,
      inventory: [...(hero.inventory || []), newItem]
    };
    updateHero(updatedHero);
    setItem({
      name: '', slot: '', effects: {}, weight: 1, darkStone: false,
      darkStoneValue: 0, upgradeSlots: 0, twoHanded: false
    });
  };

  if (!enhanced) {
    return <div className="text-sm italic text-gray-500">Enhanced creator mode is not enabled.</div>;
  }

  return (
    <div className="space-y-2">
      <input className="input w-full" placeholder="Item Name" value={item.name} onChange={e => setItem({ ...item, name: e.target.value })} />

      <select className="input w-full" value={item.slot} onChange={e => setItem({ ...item, slot: e.target.value })}>
        <option value="">Select Slot</option>
        {gearSlots.map(slot => (
          <option key={slot} value={slot}>{slot}</option>
        ))}
      </select>

      <div className="flex gap-2 items-center">
        <input className="input" placeholder="Stat (e.g. Strength)" value={statKey} onChange={e => setStatKey(e.target.value)} />
        <input className="input w-20" type="number" placeholder="Value" value={statValue} onChange={e => setStatValue(e.target.value)} />
        <button className="btn btn-sm" onClick={updateEffect}>+ Add Stat</button>
      </div>

      {Object.entries(item.effects).length > 0 && (
        <ul className="text-sm list-disc list-inside">
          {Object.entries(item.effects).map(([key, val]) => (
            <li key={key}>{key}: {val >= 0 ? '+' : ''}{val}</li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-sm">Weight
          <input type="number" className="input ml-2 w-16" value={item.weight} onChange={e => setItem({ ...item, weight: parseInt(e.target.value) || 0 })} />
        </label>

        <label className="text-sm">Upgrade Slots
          <input type="number" className="input ml-2 w-16" value={item.upgradeSlots} onChange={e => setItem({ ...item, upgradeSlots: parseInt(e.target.value) || 0 })} />
        </label>

        <label className="text-sm flex items-center gap-1">
          <input type="checkbox" checked={item.twoHanded} onChange={e => setItem({ ...item, twoHanded: e.target.checked })} />
          Two-Handed
        </label>

        <label className="text-sm flex items-center gap-1">
          <input type="checkbox" checked={item.darkStone} onChange={e => setItem({ ...item, darkStone: e.target.checked })} />
          Dark Stone
        </label>

        {item.darkStone && (
          <label className="text-sm">DS Value
            <input type="number" className="input ml-2 w-16" value={item.darkStoneValue} onChange={e => setItem({ ...item, darkStoneValue: parseInt(e.target.value) || 0 })} />
          </label>
        )}
      </div>

      <div className="pt-2">
        <button className="btn btn-primary w-full" onClick={handleAdd}>Add to Inventory</button>
      </div>
    </div>
  );
}
