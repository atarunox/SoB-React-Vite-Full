// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { CombatProvider } from './hooks/useCombatState';
import { WorldProvider } from './context/WorldContext';
import { PosseProvider, usePosse } from './context/PosseContext';
import { DeckRegistryProvider } from './context/DeckRegistryContext';
import { HeroProvider, useHero } from './context/HeroContext'; // ⬅️ use HeroContext for active hero
import { UIScaleProvider, useUIScale } from './context/UIScaleContext';

import PossePanel from './components/PossePanel';
import HeroScreen from './screens/HeroScreen';
import DMTab from './components/DM/DMTab';
import EnemyStatsPage from './components/EnemyReferencePage';
import ActiveEnemyStatsPage from './components/ActiveEnemyStatsPage';

function Home() {
  const { posse } = usePosse();                 // only posse data here
  const { activeHeroId, setActiveHeroId } = useHero(); // ⬅️ selection lives in HeroContext
  const hero = posse.find(h => (h.id || h.localId) === activeHeroId) || null;

  React.useEffect(() => {
    if (!hero && posse.length) {
      const first = posse[0];
      setActiveHeroId(first.id || first.localId);
    }
  }, [hero, posse, setActiveHeroId]);

  return <HeroScreen hero={hero} />;
}

function AppShell() {
  const { scale } = useUIScale();
  return (
    <div className="min-h-screen bg-[url('/assets/Parchment.jpg')] bg-cover bg-fixed bg-center text-black">
      <div
        className="bg-[#fdf6e3]/40 min-h-screen px-2 py-4 border-[3px] border-[#5C3A21] shadow-lg rounded-lg w-full max-w-4xl mx-auto origin-top"
        style={{ zoom: scale }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dm" element={<DMTab />} />
          <Route path="/active-enemies" element={<ActiveEnemyStatsPage />} />
          <Route path="/enemies" element={<EnemyStatsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <DeckRegistryProvider>
        <WorldProvider>
          <CombatProvider>
            <PosseProvider>
              <HeroProvider>
                <UIScaleProvider>
                  <AppShell />
                </UIScaleProvider>
              </HeroProvider>
            </PosseProvider>
          </CombatProvider>
        </WorldProvider>
      </DeckRegistryProvider>
    </Router>
  );
}
