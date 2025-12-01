// src/components/CreateHero.jsx
import React, { useState } from 'react';
import { HEROES } from '../data/heroes';
import { HERO_CLASS_CARDS } from '../data/heroClassCards';
import { usePosse } from '../context/PosseContext';

function normalizeClassKey(heroClass) {
  return (heroClass || '')
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

export default function CreateHero({ onCreate, onCancel, onCreatedId }) {
  const { addHero } = usePosse(); // <-- use Firestore-backed addHero

  const categories = Object.keys(HEROES);
  const [category, setCategory] = useState(categories[0] || '');
  const [heroClass, setHeroClass] = useState('');
  const [name, setName] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [selectedFaction, setSelectedFaction] = useState('');

  const classList = category && HEROES[category] ? Object.keys(HEROES[category]) : [];
  const heroData = category && heroClass ? HEROES[category][heroClass] : null;

  const heroClassKey = Object.keys(HERO_CLASS_CARDS).find(
    key => normalizeClassKey(key) === normalizeClassKey(heroClass)
  );
  const classCards = heroClassKey ? HERO_CLASS_CARDS[heroClassKey].classCards : [];
  const factions = heroClassKey ? HERO_CLASS_CARDS[heroClassKey].factions || [] : [];

  const selectedClassCardObj = classCards.find(c => c.id === selectedCard);
  const selectedFactionObj = factions.find(f => f.id === selectedFaction);

  async function handleCreate() {
    if (!name || !category || !heroClass) {
      alert('Please fill in all required fields.');
      return;
    }
    if (!heroData) {
      alert('No hero data found for this class.');
      return;
    }

    const timestamp = Date.now();
    let stats = { ...(heroData.stats || {}) };

    // Apply Class Card Effects
    if (selectedClassCardObj?.effects) {
      for (const [key, val] of Object.entries(selectedClassCardObj.effects)) {
        stats[key] = typeof val === 'number' ? (stats[key] || 0) + val : val;
      }
    }

    // Apply Faction Effects
    if (selectedFactionObj?.effects) {
      for (const [key, val] of Object.entries(selectedFactionObj.effects)) {
        stats[key] = typeof val === 'number' ? (stats[key] || 0) + val : val;
      }
    }

    const newId = `hero_${timestamp}`;
    const hero = {
      ...heroData,            // keep base data
      stats,                  // with applied effects
      name,
      heroClass,
      heroCategory: category,
      id: newId,
      localId: newId,
      selectedClassCard: selectedClassCardObj || null,
      selectedFaction: selectedFactionObj || null,
    };

    try {
      // this updates local state immediately and writes to Firestore (shared/posse.heroes via arrayUnion)
      await addHero(hero);

      // optional callbacks for parent components
      onCreate?.(hero);
      onCreatedId?.(hero.id);
    } catch (e) {
      console.error('Failed to add hero:', e);
      alert('Failed to add hero. See console for details.');
    }
  }

  return (
    <div className="bg-white p-6 rounded border max-w-md mx-auto shadow-md space-y-4">
      <h2 className="text-xl font-bold text-center mb-2">Create a New Hero</h2>

      <label className="block font-semibold">Hero Name</label>
      <input
        className="input w-full mb-2"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Enter hero name"
      />

      <label className="block font-semibold">Category</label>
      <select
        className="select w-full mb-2"
        value={category}
        onChange={e => {
          setCategory(e.target.value);
          setHeroClass('');
          setSelectedCard('');
          setSelectedFaction('');
        }}
      >
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <label className="block font-semibold">Class</label>
      <select
        className="select w-full mb-2"
        value={heroClass}
        onChange={e => {
          setHeroClass(e.target.value);
          setSelectedCard('');
          setSelectedFaction('');
        }}
        disabled={!category}
      >
        <option value="">Select class</option>
        {classList.map(cls => (
          <option key={cls} value={cls}>{cls}</option>
        ))}
      </select>

      {classCards.length > 0 && (
        <>
          <label className="block font-semibold">Class Card</label>
          <select
            className="select w-full mb-2"
            value={selectedCard}
            onChange={e => setSelectedCard(e.target.value)}
          >
            <option value="">Choose class card</option>
            {classCards.map(card => (
              <option key={card.id} value={card.id}>{card.name}</option>
            ))}
          </select>
          {selectedClassCardObj?.description && (
            <div className="bg-[#fdf6e3] rounded p-2 text-sm mb-2 border border-[#e0cfa2]">
              {selectedClassCardObj.description}
            </div>
          )}
        </>
      )}

      {factions.length > 0 && (
        <>
          <label className="block font-semibold">Faction</label>
          <select
            className="select w-full mb-2"
            value={selectedFaction}
            onChange={e => setSelectedFaction(e.target.value)}
          >
            <option value="">Choose faction</option>
            {factions.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          {selectedFactionObj?.description && (
            <div className="bg-[#fdf6e3] rounded p-2 text-sm mb-2 border border-[#e0cfa2]">
              {selectedFactionObj.description}
            </div>
          )}
        </>
      )}

      <div className="flex gap-2">
        <button
          className="btn btn-primary flex-1"
          disabled={
            !name ||
            !heroClass ||
            (classCards.length > 0 && !selectedCard) ||
            (factions.length > 0 && !selectedFaction)
          }
          onClick={handleCreate}
        >
          Create Hero
        </button>
        <button className="btn btn-outline flex-1" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
