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
import HeroSelector from '../components/HeroSelector';
import AdventureTrackView from '../components/AdventureTrackView';

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
  const TABS = ['Stats', 'Gear', 'Town', 'Upgrade', 'Conditions', 'Posse', 'Misc', 'DM'];
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
      <div className="p-8 text-center">
        <p className="text-blood font-bold mb-6 text-xl text-shadow-lg">
          No hero loaded. Please create or select a hero.
        </p>
        <HeroSelector placeholder="Choose a hero…" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Name Header */}
      <div className="text-center font-bold text-2xl pt-3 pb-4 bg-gradient-to-b from-leather-dark to-leather text-parchment-light text-shadow-lg border-b-2 border-brass">
        {activeHero.name || 'Unnamed Hero'}
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center items-center gap-1 border-y-2 border-leather bg-gradient-to-b from-parchment-dark to-parchment py-2 px-2 shadow-inner-dark">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`
              relative px-3 py-2 font-semibold text-sm rounded-md
              transition-all duration-200 transform
              ${selectedTab === tab
                ? 'bg-leather text-parchment-light shadow-horror border-2 border-brass scale-105 text-shadow'
                : 'bg-parchment-dark text-leather-dark hover:bg-leather-light hover:text-parchment hover:scale-105 border-2 border-leather-light shadow-sm'
              }
            `}
            onClick={() => setSelectedTab(tab)}
          >
            {selectedTab === tab && (
              <div className="absolute inset-0 bg-brass/20 rounded-md animate-pulse" />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        ))}
      </div>

      {/* Adventure Track (visible to all players when active) */}
      <div className="px-3 pt-2">
        <AdventureTrackView />
      </div>


      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-3">
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

        {selectedTab === 'Posse' && <PosseTab />}

        {selectedTab === 'Misc' && (
          <MiscTab hero={activeHero} updateHero={updateHeroEverywhere} />
        )}

        {selectedTab === 'DM' && <DMTab />}
      </div>
    </div>
  );
}
