import React from 'react';
import { WorldProvider } from './context/WorldContext';
import { CampaignProvider } from './context/CampaignContext';
import { CombatProvider } from './hooks/useCombatState';
import { PosseProvider } from './context/PosseContext';

export default function Providers({ children }) {
  return (
    <CampaignProvider>
      <WorldProvider>
      <CombatProvider>
        <PosseProvider>
          {children}
        </PosseProvider>
      </CombatProvider>
    </WorldProvider>
    </CampaignProvider>
  );
}
