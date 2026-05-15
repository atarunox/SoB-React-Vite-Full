import React, { useState } from 'react';
import DMDeckExplorer from './DMDeckExplorer';
import DMItemGenerator from './DMItemGenerator';
import DMScanCards from './DMScanCards';
import { WORLD_CARDS_BY_CAMPAIGN } from '../../data/worldCards';

const SUB_TABS = [
  { id: 'settings',     label: 'Settings' },
  { id: 'deckExplorer', label: 'Deck Explorer' },
  { id: 'itemGen',      label: 'Item Generator' },
  { id: 'scan',         label: 'Scan Cards' },
];

function SettingsPanel({ selectedCampaigns, setSelectedCampaigns, mergedWorldsCount }) {
  const ALL_KEYS = Object.keys(WORLD_CARDS_BY_CAMPAIGN);

  const isChecked = (k) => selectedCampaigns.includes(k);
  const toggle = (k) => {
    const next = isChecked(k)
      ? selectedCampaigns.filter(x => x !== k)
      : [...selectedCampaigns, k];
    setSelectedCampaigns(next);
  };

  const selectAll  = () => setSelectedCampaigns([...ALL_KEYS]);
  const selectNone = () => setSelectedCampaigns([]);

  const nicename = (k) => ({
    cityOfTheAncients: 'City of the Ancients',
    forbiddenFortress: 'Forbidden Fortress',
    adventures:        'Adventures',
  }[k] || k);

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-[#3b2f1d]">Settings</h3>

      <div className="rounded-md border border-[#8b6b46]/40 p-3 bg-white/80">
        <div className="font-semibold mb-2 text-[#3b2f1d]">World Sources (Campaigns)</div>
        <div className="flex flex-col gap-2">
          {ALL_KEYS.map((k) => {
            const count = (WORLD_CARDS_BY_CAMPAIGN[k] || []).length;
            return (
              <label key={k} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={isChecked(k)}
                  onChange={() => toggle(k)}
                />
                <span className="font-medium text-[#3b2f1d]">{nicename(k)}</span>
                <span className="text-xs text-gray-600">({count} worlds)</span>
              </label>
            );
          })}
        </div>
        <div className="mt-3 flex gap-2">
          <button className="btn btn-sm" onClick={selectAll}>Select All</button>
          <button className="btn btn-sm btn-ghost" onClick={selectNone}>Clear</button>
        </div>
        <div className="mt-3 text-sm text-gray-700">
          Using <b>{mergedWorldsCount}</b> world{mergedWorldsCount === 1 ? '' : 's'} from selected campaigns.
        </div>
        <p className="mt-2 text-xs text-gray-500">
          These selections are saved locally and restrict what shows up in World/Encounter drawers.
        </p>
      </div>
    </div>
  );
}

export default function DMOptionsPanel(props) {
  const {
    selectedCampaigns,
    setSelectedCampaigns,
    mergedWorldsCount,
    posse,
    updateHero,
    addGroup,
    combatGroups,
    mergedWorlds,
  } = props;

  const [subTab, setSubTab] = useState(() => {
    try { return localStorage.getItem('dm_options_subtab') || 'settings'; } catch { return 'settings'; }
  });

  const switchSubTab = (id) => {
    setSubTab(id);
    try { localStorage.setItem('dm_options_subtab', id); } catch {}
  };

  return (
    <div className="space-y-3">
      {/* Sub-tab bar */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#8b6b46]/30 pb-2">
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => switchSubTab(t.id)}
            className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
              subTab === t.id
                ? 'bg-[#3d2c1a] text-amber-200 border-[#8b6b46]'
                : 'bg-transparent text-[#5c3a1e] border-[#8b6b46]/40 hover:bg-[#f5ebd8]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      {subTab === 'settings' && (
        <SettingsPanel
          selectedCampaigns={selectedCampaigns}
          setSelectedCampaigns={setSelectedCampaigns}
          mergedWorldsCount={mergedWorldsCount}
        />
      )}

      {subTab === 'deckExplorer' && <DMDeckExplorer />}

      {subTab === 'itemGen' && (
        <DMItemGenerator
          posse={posse}
          updateHero={updateHero}
          addGroup={addGroup}
          combatGroups={combatGroups}
          mergedWorlds={mergedWorlds}
        />
      )}

      {subTab === 'scan' && (
        <DMScanCards
          posse={posse}
          updateHero={updateHero}
          addGroup={addGroup}
          combatGroups={combatGroups}
        />
      )}
    </div>
  );
}
