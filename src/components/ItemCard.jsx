import React from 'react';

const ItemCard = ({ item }) => {
  return (
    <div className="border p-3 rounded shadow-sm bg-yellow-50 space-y-1">
      <h4 className="font-bold text-lg">{item.name}</h4>
      {item.cost !== undefined && <p><strong>Cost:</strong> ${item.cost}</p>}
      {item.value !== undefined && <p><strong>Value:</strong> ${item.value}</p>}
      {item.darkStone && <p><strong>Dark Stone:</strong> {item.darkStone}</p>}
      {item.weight !== undefined && <p><strong>Weight:</strong> {item.weight}</p>}
      {item.slot && <p><strong>Slot:</strong> {item.slot}</p>}
      {item.type && <p><strong>Type:</strong> {item.type}</p>}
      {item.twoHanded && <p><strong>Two-Handed:</strong> Yes</p>}
      {item.upgradeSlots !== undefined && <p><strong>Upgrade Slots:</strong> {item.upgradeSlots}</p>}
      {item.effect && <p className="italic">{item.effect}</p>}
      {Array.isArray(item.effects) && item.effects.length > 0 && (
        <ul className="list-disc list-inside text-sm italic">
          {item.effects.map((fx, i) => <li key={i}>{fx}</li>)}
        </ul>
      )}
      {Array.isArray(item.restrictions) && item.restrictions.length > 0 && (
        <p className="text-red-700"><strong>Restrictions:</strong> {item.restrictions.join(', ')}</p>
      )}
      {item.tags && <p><strong>Tags:</strong> {item.tags.join(', ')}</p>}
    </div>
  );
};

export default ItemCard;
