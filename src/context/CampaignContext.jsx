import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

export const CampaignContext = createContext(null);
const KEY = 'sob_campaign_id';

export function CampaignProvider({ children }) {
  const [campaignId, setCampaignId] = useState(() => {
    try { return localStorage.getItem(KEY) || 'default'; } catch { return 'default'; }
  });
  useEffect(() => { try { localStorage.setItem(KEY, campaignId); } catch {} }, [campaignId]);
  const value = useMemo(() => ({ campaignId, setCampaignId }), [campaignId]);
  return <CampaignContext.Provider value={value}>{children}</CampaignContext.Provider>;
}

export function useCampaign() {
  const ctx = useContext(CampaignContext);
  if (!ctx) throw new Error('useCampaign must be used within CampaignProvider');
  return ctx;
}


export function useOptionalCampaign() {
  // Returns a default campaign if no provider is present
  try {
    const ctx = React.useContext(CampaignContext);
    if (!ctx) return { campaignId: 'default', setCampaignId: () => {} };
    return ctx;
  } catch {
    return { campaignId: 'default', setCampaignId: () => {} };
  }
}
