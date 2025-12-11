// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { CombatProvider } from './hooks/useCombatState';
import { WorldProvider } from './context/WorldContext';
import { PosseProvider, usePosse } from './context/PosseContext';
import { DeckRegistryProvider } from './context/DeckRegistryContext';
import { HeroProvider, useHero } from './context/HeroContext'; // ⬅️ use HeroContext for active hero

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

export default function App() {
  return (
    <Router>
      <DeckRegistryProvider>
        <WorldProvider>
          <CombatProvider>
            <PosseProvider>
              <HeroProvider>
                <div className="min-h-screen bg-[url('/assets/Parchment.jpg')] bg-cover bg-fixed bg-center text-black">
                  {/* Dark vignette overlay for atmosphere */}
                  <div className="fixed inset-0 pointer-events-none bg-gradient-radial from-transparent via-transparent to-black/30" />

                  <div className="relative bg-parchment/50 backdrop-blur-sm min-h-screen px-4 py-6 border-4 border-leather shadow-horror-lg rounded-lg w-full max-w-4xl mx-auto">
                    {/* Decorative corner accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brass rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brass rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brass rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brass rounded-br-lg" />

                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/dm" element={<DMTab />} />
                      <Route path="/active-enemies" element={<ActiveEnemyStatsPage />} />
                      <Route path="/enemies" element={<EnemyStatsPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                </div>
              </HeroProvider>
            </PosseProvider>
          </CombatProvider>
        </WorldProvider>
      </DeckRegistryProvider>
    </Router>
  );
}
