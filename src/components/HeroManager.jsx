// src/components/HeroManager.jsx
import React, { useEffect, useMemo, useState } from 'react';
import Library from './Library';
import CardDrawTab from './CardDrawTab';
import CustomItemCreator from './CustomItemCreator';
import HeroSaveLoad from './HeroSaveLoad';
import HeroSelector from './HeroSelector';
import StatsTab from './StatsTab';
import ConditionsTab from './ConditionsTab';
import { loadAndSanitizeHero } from '../utils/heroUtils';
import { calculateCurrentStats } from '../utils/calculateStats';
import { usePosse } from '../context/PosseContext';

export default function HeroManager({ selectedHero, setSelectedHero }) {
  const { posse, updateHero: updateHeroInPosse } = usePosse();

  // Resolve initial hero: prop -> posse[0] -> empty
  const initialHero = useMemo(() => {
    if (selectedHero && (selectedHero.id || selectedHero.localId)) {
      return loadAndSanitizeHero(selectedHero);
    }
    if (Array.isArray(posse) && posse.length > 0) {
      return loadAndSanitizeHero(posse[0]);
    }
    return loadAndSanitizeHero({});
  }, [selectedHero, posse]);

  const [hero, setHero] = useState(initialHero);
  const [modifiedStats, setModifiedStats] = useState({});
  const [bonusBreakdown, setBonusBreakdown] = useState({});
  const [showRef, setShowRef] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [showSaveLoad, setShowSaveLoad] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  // Track currently selected id for HeroSelector
  const activeHeroId = hero?.id || hero?.localId || '';

  // Recompute derived stats when hero changes
  useEffect(() => {
    if (!hero) return;
    const { stats, breakdown } = calculateCurrentStats(hero);
    setModifiedStats(stats);
    setBonusBreakdown(breakdown);
  }, [hero]);

  // Whenever posse changes (e.g., new hero created), keep current selection valid
  useEffect(() => {
    if (!Array.isArray(posse) || posse.length === 0) return;

    const id = hero?.id || hero?.localId;
    if (!id) {
      // if nothing selected yet, prefer first hero
      setHero(loadAndSanitizeHero(posse[0]));
      return;
    }
    const found = posse.find(h => (h.id || h.localId) === id);
    if (found) {
      setHero(loadAndSanitizeHero(found));
    }
  }, [posse]); // eslint-disable-line react-hooks/exhaustive-deps

  // Switch hero handler from the selector (id string)
  const handleChangeActiveHero = (id) => {
    if (!id) return;
    const found = (posse || []).find(h => (h.id || h.localId) === id);
    if (found) {
      const cleaned = loadAndSanitizeHero(found);
      setHero(cleaned);
      if (setSelectedHero) setSelectedHero(cleaned);
    }
  };

  // Update the current hero (local + Firestore)
  const updateHero = (newHero) => {
    const cleaned = loadAndSanitizeHero({ ...hero, ...newHero });
    setHero(cleaned);
    if (setSelectedHero) setSelectedHero(cleaned);

    // Persist to Firestore via PosseContext
    const persistId = cleaned.id || cleaned.localId;
    if (persistId) {
      updateHeroInPosse({ ...cleaned, id: persistId });
    }
  };

  return (
    <div className="p-4 space-y-4 bg-parchment min-h-screen">
      {/* Toggleable hero selector */}
      {showSelector && (
        <HeroSelector
          activeHeroId={activeHeroId}
          onChangeActiveHero={handleChangeActiveHero}
          // legacy prop still works if some parents pass it:
          setActiveHeroId={handleChangeActiveHero}
        />
      )}

      <StatsTab
        hero={hero}
        updateHero={updateHero}
        modifiedStats={modifiedStats}
        breakdown={bonusBreakdown}
      />

      <ConditionsTab
        hero={hero}
        updateHero={updateHero}
      />

      {showRef && <Library />}
      {showCards && <CardDrawTab />}
      {showCreator && <CustomItemCreator hero={hero} updateHero={updateHero} enhanced />}
      {showSaveLoad && <HeroSaveLoad hero={hero} updateHero={updateHero} />}

      <div className="flex gap-2 pt-4">
        <button className="btn btn-sm" onClick={() => setShowRef(!showRef)}>📚 Library</button>
        <button className="btn btn-sm" onClick={() => setShowCards(!showCards)}>🃏 Cards</button>
        <button className="btn btn-sm" onClick={() => setShowCreator(!showCreator)}>🎨 Add Item</button>
        <button className="btn btn-sm" onClick={() => setShowSaveLoad(!showSaveLoad)}>💾 Save/Load</button>
        <button className="btn btn-sm" onClick={() => setShowSelector(!showSelector)}>🧍 Switch Hero</button>
      </div>
    </div>
  );
}
