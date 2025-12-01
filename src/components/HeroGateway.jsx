import React, { useEffect } from 'react';
import { useHero } from '../context/HeroContext';
import { usePosse } from '../context/PosseContext';
import HeroSelector from './HeroSelector';
import { useNavigate } from 'react-router-dom';

export default function HeroGateway() {
  const { hero, setHero } = useHero();
  const { posse } = usePosse();
  const navigate = useNavigate();

  // When a hero is selected/created in HeroSelector, set it in HeroContext
  const handleChangeActiveHero = (id) => {
    const picked = (posse || []).find(h => (h.id || h.localId) === id);
    if (picked) setHero(picked);
  };

  useEffect(() => {
    if (hero?.name) {
      const t = setTimeout(() => navigate('/hero'), 100);
      return () => clearTimeout(t);
    }
  }, [hero, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/assets/Parchment.jpg')] bg-cover text-black">
      <h1 className="text-3xl font-bold mb-4">Select or Create a Hero</h1>
      <HeroSelector
        activeHeroId={hero?.id || hero?.localId || ''}
        onChangeActiveHero={handleChangeActiveHero}
      />
    </div>
  );
}
