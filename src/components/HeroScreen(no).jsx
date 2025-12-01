// src/screens/HeroScreen.jsx
import React, { useState } from 'react';
import { usePosse } from '../context/PosseContext';
import StatsTab from '../components/StatsTab';
import GearTab from '../components/GearTab';
import TownTab from '../components/TownTab';
import UpgradeTab from '../components/UpgradeTab';
import ConditionsTab from '../components/ConditionsTab';
import DMTab from '../components/DM/DMTab';
import MiscTab from '../components/MiscTab';
import PosseTab from '../components/PosseTab';
import HeroSelector from '../components/HeroSelector';

export default function HeroScreen({
  dragLocked,
  setDragLocked = () => {},
  resetLayout = () => {},
  positions = {},
  setPositions = () => {}
}) {
  const { posse, activeHeroId, setActiveHeroId, updateHero } = usePosse(); // <— get setter here
  const [selectedTab, setSelectedTab] = useState('Stats');

  const hero = posse.find(h => (h.id || h.localId) === activeHeroId) || null;
  const resolvedHeroId = hero?.id || hero?.localId || activeHeroId;

  const updateHeroWithId = (changes) =>
    updateHero({ id: resolvedHeroId, ...changes });

  if (!hero) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600 font-bold mb-4">
          No hero loaded. Please create or select a hero.
        </p>
        {/* Ensure selection updates the context’s activeHeroId immediately */}
        <HeroSelector
          activeHeroId={activeHeroId || ''}
          onChangeActiveHero={(id) => setActiveHeroId(id)}
          placeholder="Choose a hero…"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[url('/assets/Parchment.jpg')] bg-cover bg-fixed bg-center text-black">
      <div className="text-center font-bold text-xl pt-2">
        {hero.name || 'Unnamed Hero'}
      </div>

      <div className="flex justify-around border-t border-[#5C3A21] bg-[#fdf6e3]/70 py-2">
        {['Stats', 'Gear', 'Town', 'Upgrade', 'Conditions', 'Posse', 'Misc', 'DM'].map(tab => (
          <button
            key={tab}
            className={`px-2 py-1 rounded ${selectedTab === tab ? 'bg-[#5C3A21] text-white' : 'bg-white text-black'}`}
            onClick={() => setSelectedTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-2">
        {selectedTab === 'Stats' && (
          <StatsTab
            heroId={resolvedHeroId}
            dragLocked={dragLocked}
            setDragLocked={setDragLocked}
            resetLayout={resetLayout}
            positions={positions}
            setPositions={setPositions}
          />
        )}

        {selectedTab === 'Gear' && <GearTab hero={hero} updateHero={updateHeroWithId} />}
        {selectedTab === 'Town' && <TownTab heroId={resolvedHeroId} />}
        {selectedTab === 'Upgrade' && <UpgradeTab hero={hero} updateHero={updateHeroWithId} />}
        {selectedTab === 'Conditions' && <ConditionsTab hero={hero} updateHero={updateHeroWithId} />}
        {selectedTab === 'Posse' && <PosseTab />}
        {selectedTab === 'Misc' && <MiscTab hero={hero} updateHero={updateHeroWithId} />}
        {selectedTab === 'DM' && <DMTab />}
      </div>
    </div>
  );
}
