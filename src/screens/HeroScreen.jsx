// src/screens/HeroScreen.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { usePosse } from '../context/PosseContext';
import { useHero } from '../context/HeroContext';

import StatsTab from '../components/StatsTab';
import GearTab from '../components/GearTab';
import UpgradeTab from '../components/UpgradeTab';
import TownTab from '../components/TownTab/index.jsx';
import ConditionsTab from '../components/ConditionsTab';
import DMTab from '../components/DM/DMTab';
import MiscTab from '../components/MiscTab';
import PosseTab from '../components/PosseTab';
import EnemiesTab from '../components/EnemiesTab';
import HeroSelector from '../components/HeroSelector';

export default function HeroScreen({
  dragLocked,
  setDragLocked = () => {},
  resetLayout = () => {},
  positions = {},
  setPositions = () => {}
}) {
  const { posse, activeHeroId: posseActiveHeroId, updateHero: updateHeroPosse } = usePosse();
  const { hero: activeHeroCtx, setActiveHeroId, updateHero: updateHeroCtx } = useHero();

  const activeHero =
    activeHeroCtx ||
    posse.find(h => (h.id || h.localId) === posseActiveHeroId) ||
    null;

  const resolvedHeroId =
    activeHero?.id || activeHero?.localId || posseActiveHeroId || '';

  // ---------------- Tabs ----------------
  const TABS = ['Stats', 'Gear', 'Town', 'Upgrade', 'Conditions', 'Enemies', 'Posse', 'Misc', 'DM'];
  const tabKey = resolvedHeroId ? `sob:lastTab:${resolvedHeroId}` : 'sob:lastTab';

  const [selectedTab, setSelectedTab] = useState(() => {
    try {
      return localStorage.getItem(tabKey) || 'Stats';
    } catch {
      return 'Stats';
    }
  });

  // When switching heroes, restore their last tab (fallback to Stats)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(tabKey);
      setSelectedTab(saved || 'Stats');
    } catch {
      setSelectedTab('Stats');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedHeroId]);

  // Persist tab choice per-hero
  useEffect(() => {
    try {
      if (selectedTab) localStorage.setItem(tabKey, selectedTab);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab]);

  // Helper to patch hero everywhere (Posse + HeroContext)
  const updateHeroEverywhere = (changes) => {
    if (!resolvedHeroId) return;
    const payload = { id: resolvedHeroId, ...changes, updatedAt: Date.now() };
    try { typeof updateHeroPosse === 'function' && updateHeroPosse(payload); } catch {}
    try { typeof updateHeroCtx   === 'function' && updateHeroCtx(payload);   } catch {}
  };

  if (!activeHero) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600 font-bold mb-4">
          No hero loaded. Please create or select a hero.
        </p>
        <HeroSelector placeholder="Choose a hero…" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[url('/assets/Parchment.jpg')] bg-cover bg-fixed bg-center text-black">
      <div className="text-center font-bold text-xl pt-2">
        {activeHero.name || 'Unnamed Hero'}
      </div>

      <div className="flex justify-around border-t border-[#5C3A21] bg-[#fdf6e3]/70 py-2">
        {TABS.map(tab => (
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

        {selectedTab === 'Gear' && (
          <GearTab
            hero={activeHero}
            updateHero={updateHeroEverywhere}
          />
        )}

        {selectedTab === 'Town' && (
          <TownTab heroId={resolvedHeroId} />
        )}

        {selectedTab === 'Upgrade' && (
          <UpgradeTab hero={activeHero} updateHero={updateHeroEverywhere} />
        )}

        {selectedTab === 'Conditions' && (
          <ConditionsTab hero={activeHero} />
        )}

        {selectedTab === 'Enemies' && <EnemiesTab />}

        {selectedTab === 'Posse' && <PosseTab />}

        {selectedTab === 'Misc' && (
          <MiscTab hero={activeHero} updateHero={updateHeroEverywhere} />
        )}

        {selectedTab === 'DM' && <DMTab />}
      </div>
    </div>
  );
}
