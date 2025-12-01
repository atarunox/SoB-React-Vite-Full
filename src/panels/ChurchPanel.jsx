// src/panels/ChurchPanel.jsx
import React, { useMemo } from 'react';
import GenericShop from '../components/GenericShop';
import church from '../data/townLocations/church.js';
import { applyChurchRitual } from '../data/townLocations/churchRituals.js';
import { usePosse } from '../context/PosseContext';

export default function ChurchPanel({ heroId: propHeroId }) {
  const { posse, activeHeroId } = usePosse();
  const hero = useMemo(() => {
    const id = propHeroId || activeHeroId;
    return Array.isArray(posse) ? posse.find(h => (h.id === id || h.localId === id)) : null;
  }, [posse, propHeroId, activeHeroId]);

  const ritualCtx = useMemo(() => ({
    heroId: hero?.id || hero?.localId || null,
    posse,
  }), [hero, posse]);

  return (
    <GenericShop
      shopKey={church.id}
      title={church.name}
      hero={hero}
      visited
      onBuy={(_, service) => {
        const id = String(service?.id || '');
        // Only Church rituals trigger here. Typical IDs include:
        //   ch_ritual_exorcism_of_madness
        //   ch_ritual_resurrection
        if (id === 'ch_ritual_exorcism_of_madness' || id === 'ch_ritual_resurrection' || id.startsWith('ch_ritual_')) {
          applyChurchRitual(ritualCtx, id);
          return;
        }
        // Any other service/items at Church (if present) would fall through.
      }}
    />
  );
}
