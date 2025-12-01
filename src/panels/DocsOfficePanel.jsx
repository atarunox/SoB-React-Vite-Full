// src/panels/DocsOfficePanel.jsx
import React, { useMemo } from 'react';
import GenericShop from '../components/GenericShop';
import docsOffice from '../data/townLocations/docsOffice.js';
import { usePosse } from '../context/PosseContext';
import {
  performSurgery,
  performTreatCorruption,
  performInjectionPurchase,
  performDocItemPurchase,
} from '../utils/locationHandlers/docsOfficeServices';

export default function DocsOfficePanel({ heroId: propHeroId }) {
  const { posse, activeHeroId, updateHero } = usePosse();

  const hero = useMemo(() => {
    const id = propHeroId || activeHeroId;
    return Array.isArray(posse) ? posse.find(h => (h.id === id || h.localId === id)) : null;
  }, [posse, propHeroId, activeHeroId]);

  const ctx = useMemo(() => ({
    heroId: hero?.id || hero?.localId || null,
    posse,
    posseApi: {
      updateHero,
      getHeroById: (hid) => Array.isArray(posse) ? posse.find(h => (h.id === hid || h.localId === hid)) : null,
    },
  }), [hero, posse, updateHero]);

  const routeService = async (service) => {
    const id = String(service?.id || '');
    const type = String(service?.type || '');
    const tagStr = Array.isArray(service?.tags) ? service.tags.join(',') : '';

    // Surgery
    if (id.includes('surgery') || type === 'surgery') {
      await performSurgery(ctx, service);
      return;
    }

    // Treat Corruption (Doc's Office only)
    if (id.includes('treat_corruption') || id.includes('treat-corruption') || type === 'treat_corruption') {
      await performTreatCorruption(ctx, service);
      return;
    }

    // Injections
    if (id.includes('injection') || type === 'injection' || tagStr.includes('Injection')) {
      await performInjectionPurchase(ctx, service);
      return;
    }

    // Doctor items / gear sold here
    await performDocItemPurchase(ctx, service);
  };

  return (
    <GenericShop
      shopKey={docsOffice.id}
      title={docsOffice.name}
      hero={hero}
      visited
      onBuy={async (_, service) => {
        await routeService(service);
      }}
    />
  );
}
