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

  const heroClass = activeHero.heroClass || activeHero.class || '';
  const heroLevel = activeHero.level || activeHero.Level || 1;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Name Header */}
      <div className="relative bg-gradient-to-b from-[#2a1a0e] via-leather-dark to-leather border-b-2 border-brass/60 shadow-horror-lg">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(184,134,11,0.3) 4px, rgba(184,134,11,0.3) 5px)' }} />
        <div className="relative text-center py-3 px-4">
          <h1 className="font-bold text-2xl sm:text-3xl text-parchment-light text-shadow-lg tracking-wide leading-tight">
            {activeHero.name || 'Unnamed Hero'}
          </h1>
          {heroClass && (
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-brass/50 max-w-[60px]" />
              <span className="text-brass-light text-xs font-semibold tracking-widest uppercase">
                {heroClass.replace(/([A-Z])/g, ' $1').trim()} · Lvl {heroLevel}
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-brass/50 max-w-[60px]" />
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gradient-to-b from-[#3a2814] to-leather-dark border-b border-brass/30 px-2 py-1.5 overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-1 min-w-max mx-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`
                relative px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full whitespace-nowrap
                transition-all duration-200 border
                ${selectedTab === tab
                  ? 'bg-brass text-shadow-dark border-brass-light text-[#1a0e00] shadow-md'
                  : 'bg-transparent border-brass/30 text-parchment/70 hover:text-parchment hover:border-brass/60 hover:bg-white/5'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>
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
            onSwitchTab={setSelectedTab}
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
