// src/components/TownTab/index.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  loadTownState,
  resetTownState,
  saveTownState,
  isLocationDestroyed,
} from '../../utils/townState';
import { usePosse } from '../../context/PosseContext';
import { calculateCurrentStats } from '../../utils/calculateStats';
import { shopDataById } from '../../data/shopDataByID';
import { otherWorldArtifacts } from '../../data/items/otherWorldArtifacts.js';
import { tabsByShop } from '../../data/townLocations/tabsByShop.js';
import { makeLocEventCtx } from '../../utils/locationEventContext';
// 🔧 FIXED PATH: now points into FrontierTown/Church
import { applyChurchRitual } from '../../data/townLocations/FrontierTown/Church/churchRituals.js';

import BlackMarketPanel from './BlackMarketPanel';
import { hasKeyword, removeKeyword } from '../../utils/keywords';

// --- Service Executors ---
import { performSaloonService } from '../../utils/locationHandlers/saloonServices.js';
import { performGamblingHallService } from '../../utils/locationHandlers/gamblingHallServices.js';
import { performSheriffsOfficeService } from '../../utils/locationHandlers/sheriffsOfficeServices.js';

import {
  canUseTribalTent,
  normalizeINDIAN_TP_Item,
} from '../../utils/locationHandlers/indianTradingPostHandler';
import {
  performSpiritCleansing,
  performVisionQuest,
} from '../../utils/locationHandlers/indianTradingPostServices';

import { performOutpostBankService } from '../../utils/locationHandlers/frontierOutpostBankServices';
import { performOutpostTrainingService } from '../../utils/locationHandlers/frontierOutpostTrainingServices';
import { performFrontierOutpostBounty } from "../../utils/locationHandlers/frontierOutpostBountiesHandler";



import {
  performStreetGambling,
  performBathHouse,
  performSellDarkStone,
} from '../../utils/locationHandlers/streetMarketServices';

import {
  ensureEventRolled as ensureLocEventRolled,
  getEventState as _getLocEventState,
  resolveEvent as resolveLocEvent,
  setEventRoll as setLocEventRoll,
} from '../../utils/locationEventsEngine';

import {
  performBackAlleyDoc,
  performBlackMarketGoods,
  performDownDarkRoad,
  performBuyRoundOfShots,
} from '../../utils/locationHandlers/smugglersDenServices';

import {
  performMqSurgeon,
  performMqProphet,
  performMqAid,
} from '../../utils/locationHandlers/mutantQuarterServices';

import {
  performSurgery,
  performTreatCorruption,
  performInjectionPurchase,
  performDocItemPurchase,
} from '../../utils/locationHandlers/docsOfficeServices';

// UI pieces
import TownEventCard from './TownEventCard';
import RareFindPanel from './RareFindPanel';

// icons / helpers
import {
  labelForCategory,
  buildCategoriesForShop,
  isInjection,
  isRitualService,
  isBanishCorruptionService,
  isResurrectionService,
  isTokenPurchase,
  willExceedCarryLikeGearTab,
  getCarryCapacityLikeGearTab,
  getTotalLoad,
  getItemWeight,
  getCost,
  normalizeCostObject,
  formatCost,
  deriveHandsRequired,
  ASSETS,
  IconRowComposite,
  IconRowRepeat,
  getInjuryList,
  getMutationList,
  nextSideBag,
} from './townTabHelpers';

// --- Derived stat reader (uses calculateCurrentStats, with debug logs)
function getStatTotal(hero, statName) {
  if (!hero) return 0;
  const totals = calculateCurrentStats(hero);

  const fromTotals =
    totals?.[statName] ??
    totals?.stats?.[statName] ??
    totals?.derived?.[statName];

  const fromHero =
    hero?.[statName] ??
    hero?.stats?.[statName] ??
    hero?.derived?.[statName];

  const resolved = Number.isFinite(fromTotals)
    ? fromTotals
    : Number.isFinite(fromHero)
    ? fromHero
    : 0;

  try {
    console.log('[TownTab:getStat]', {
      heroId: hero.id || hero.localId,
      statName,
      fromTotals,
      fromHero,
      resolved,
    });
  } catch {}

  return resolved;
}
function withTotalStatsView(hero) {
  if (!hero) return hero;
  return {
    ...hero,
    Luck: getStatTotal(hero, 'Luck'),
    Cunning: getStatTotal(hero, 'Cunning'),
    Agility: getStatTotal(hero, 'Agility'),
    Lore: getStatTotal(hero, 'Lore'),
    Grit: getStatTotal(hero, 'Grit'),
  };
}

// --- text safety helper (prevents [object Object]) ---
const safeText = (v, fallback = '') => {
  if (v == null) return fallback;
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (typeof v === 'object') {
    if (typeof v.text === 'string') return v.text;
    if (typeof v.label === 'string') return v.label;
    if (typeof v.name === 'string') return v.name;
  }
  try {
    return JSON.stringify(v);
  } catch {
    return fallback || String(v);
  }
};

// If staying at Camp, only these are available
const CAMP_SHOPS = ['campSite'];

// tiny helpers
const isObj = (v) => v && typeof v === 'object';
const getItemId = (item, idx = 0) => item?.id || item?.name || `item_${idx}`;

// Event read wrapper (engine is in-memory; takes a single shopId)
const getLocEventState = (shopId) => _getLocEventState(shopId);

// --- Frontier Outpost Dark Stone rate helpers ---
const getFoEvent = () => getLocEventState('frontierOutpost');
const foRateFromEvent = (ev) => {
  const roll = Number(ev?.roll);
  if (roll === 5) return 10; // D6 × $10
  if (roll === 9) return 50; // D6 × $50
  return 25; // default D6 × $25
};

// Per-hero Doc’s Office modifiers (4–5 : outcome −1 min 0, 9–10 : outcome +1)
function getDocsOfficeModsForHero() {
  const rec = getLocEventState('docsOffice');
  const r = Number(rec?.roll);

  const mods = {
    costMult: 1,
    outcomeDelta: 0,
    outcomeFloor: null,
  };

  if (Number.isFinite(r)) {
    if (r >= 4 && r <= 5) {
      mods.outcomeDelta = -1;
      mods.outcomeFloor = 0; // "min 0"
    } else if (r >= 9 && r <= 10) {
      mods.outcomeDelta = +1;
    }
  }

  try {
    console.log('[DocsOffice Mods]', { roll: r, mods });
  } catch {}
  return mods;
}

/**
 * Frontier Outpost Trading Post UI:
 * Shows the artifact offer from stayMods.foWorldArtifactOffer (event #7)
 * and lets the currently active hero purchase it once.
 */
function FrontierOutpostArtifactOfferPanel({ townStateApi, posseApi, uiApi }) {
  // Require minimal APIs
  if (!townStateApi?.get || !posseApi) return null;

  const state = townStateApi.get() || {};
  const stayMods = state.stayMods || {};
  const offer = stayMods.foWorldArtifactOffer;

  // No offer or already purchased → nothing to render
  if (!offer || offer.purchasedBy) return null;

  // Resolve active hero
  const getActiveHeroId =
    posseApi.getActiveHeroId ||
    posseApi.getCurrentHeroId ||
    (() => null);

  const activeHeroId = getActiveHeroId();
  const hero = activeHeroId ? posseApi.getHero(activeHeroId) : null;

  // If we somehow have no hero, just don't show the panel – consistent with other TownTab bits
  if (!hero) return null;

  const heroId = hero.id || hero.localId;

  // Look up full artifact data so we can show stats (slot/weight/dark stone/value/effects)
  const artifactFromOffer = offer.artifact || null;
  const artifactFromData =
    !artifactFromOffer && offer.artifactId
      ? (otherWorldArtifacts || []).find((a) => a.id === offer.artifactId)
      : null;

  const baseArtifact = {
    id: offer.artifactId,
    name: offer.artifactName,
    world: offer.world,
    type: 'Artifact',
    source: 'Frontier Outpost – Trading Post',
  };

  const art = {
    ...baseArtifact,
    ...(artifactFromData || {}),
    ...(artifactFromOffer || {}),
  };

  const price = Number(offer.price || 0);
  const gold = Number(hero.gold || 0);
  const hasVisited = hero.chosenLocation === (offer.locationId || 'frontierOutpost');
  const canAfford = gold >= price;

  // Normalize some display fields
  const slotLabel = art.slot || 'Artifact (no gear slot)';
  const weight = Number.isFinite(art.weight) ? art.weight : null;
  const isDarkStone = !!art.darkStone;
  const baseValue = Number.isFinite(art.value) ? art.value : null;
  const upgradeSlots = Number.isFinite(art.upgradeSlots) ? art.upgradeSlots : 0;
  const hands = deriveHandsRequired(art);

  // Convert effects object (stat modifiers) into a list
  const statEffectEntries =
    art.effects && !Array.isArray(art.effects)
      ? Object.entries(art.effects).filter(
          ([, v]) => v !== null && v !== undefined && v !== 0
        )
      : [];

  // Combine any rules/effects text lines
  const rulesLines = [
    ...(Array.isArray(art.rules) ? art.rules : []),
    ...(Array.isArray(art.effects) ? art.effects : []),
  ].filter(Boolean);

  const tags = Array.isArray(art.tags) ? art.tags : [];

  const handleBuy = () => {
    if (!heroId) return;

    if (!hasVisited) {
      if (uiApi?.toast) {
        uiApi.toast('Visit the Frontier Outpost before purchasing the Trading Post artifact.');
      } else if (typeof window !== 'undefined') {
        window.alert('Visit the Frontier Outpost before purchasing this artifact.');
      }
      return;
    }

    if (!canAfford) {
      if (uiApi?.toast) {
        uiApi.toast('Not enough gold to purchase this artifact.');
      } else if (typeof window !== 'undefined') {
        window.alert('Not enough gold to purchase this artifact.');
      }
      return;
    }

    // Build the item that will actually be stored in the hero inventory
    const artifactItem = {
      ...art,
      id: art.id || offer.artifactId || `fo_world_artifact_${Date.now()}`,
      name: art.name || offer.artifactName || 'OtherWorld Artifact',
      world: art.world || offer.world,
      type: art.type || 'Artifact',
      source: art.source || 'Frontier Outpost – Trading Post',
    };

    // 1) Update hero inventory + gold
    const inventory = Array.isArray(hero.inventory) ? [...hero.inventory] : [];
    inventory.push(artifactItem);

    const nextGold = Math.max(0, gold - price);

    posseApi.updateHero(heroId, {
      gold: nextGold,
      inventory,
      updatedAt: Date.now(),
    });

    // 2) Mark the offer as purchased in town state
    if (typeof townStateApi.set === 'function') {
      const prevState = townStateApi.get?.() || {};
      const prevStayMods = prevState.stayMods || {};
      const prevOffer = prevStayMods.foWorldArtifactOffer || offer;

      const nextStayMods = {
        ...prevStayMods,
        foWorldArtifactOffer: {
          ...prevOffer,
          ...offer,
          artifact: artifactItem,
          purchasedBy: heroId,
        },
      };

      townStateApi.set({
        ...prevState,
        stayMods: nextStayMods,
      });
    }

    if (uiApi?.toast) {
      uiApi.toast(`Purchased ${artifactItem.name} for $${price} at the Trading Post.`);
    }
  };

  return (
    <div className="mt-2 p-2 rounded border bg-amber-50">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-600">Trading Post Offer</div>
          <div className="font-semibold">
            {art.name || offer.artifactName || 'OtherWorld Artifact'}
          </div>
          <div className="text-[0.7rem] text-gray-600">
            World: {art.world || offer.world || 'Unknown'}
          </div>
        </div>
        <div className="text-sm font-semibold">
          Price: ${price || 0}
        </div>
      </div>

      {/* Stats row – icons, like a normal shop item */}
      <div className="mt-2 flex flex-wrap items-center gap-2 leading-none">
        {upgradeSlots > 0 && (
          <IconRowComposite
            map={ASSETS.slot}
            count={upgradeSlots}
            title={`Upgrade Slots: ${upgradeSlots}`}
          />
        )}
        {weight !== null && weight > 0 && (
          <IconRowRepeat
            src={ASSETS.weight}
            count={weight}
            title={`Weight: ${weight}`}
          />
        )}
        {isDarkStone && (
          <IconRowRepeat
            src={ASSETS.ds}
            count={1}
            title="Dark Stone Artifact"
          />
        )}
        {hands > 0 && (
          <IconRowComposite
            map={ASSETS.hand}
            count={hands}
            title={`Hands Required: ${hands}`}
          />
        )}
      </div>

      {/* Slot + base value */}
      <div className="mt-1 text-xs text-gray-800 space-y-0.5">
        <div>
          <span className="font-semibold">Slot:</span>{' '}
          {slotLabel}
        </div>
        {baseValue !== null && (
          <div>
            <span className="font-semibold">Base Value:</span>{' '}
            ${baseValue}
          </div>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-1">
          {tags.map((t, i) => (
            <span
              key={`fo_tag_${i}`}
              className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-gray-100 border text-gray-700 mr-1 mt-1"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Stat modifiers as readable text */}
      {statEffectEntries.length > 0 && (
        <div className="mt-2 text-xs text-gray-800">
          <div className="font-semibold">Stat Modifiers</div>
          <ul className="list-disc list-inside">
            {statEffectEntries.map(([k, v]) => (
              <li key={k}>
                {k}: {Number.isFinite(v) && v > 0 ? `+${v}` : String(v)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rules / effect text */}
      {rulesLines.length > 0 && (
        <div className="mt-2 text-xs text-gray-800">
          <div className="font-semibold">Effects</div>
          <ul className="list-disc list-inside">
            {rulesLines.map((line, idx) => (
              <li key={`fo_rule_${idx}`}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings + button */}
      <div className="mt-2 flex flex-col items-start gap-1">
        {!hasVisited && (
          <div className="text-[0.7rem] text-yellow-700">
            Choose <b>Visit</b> for the Frontier Outpost to purchase this artifact.
          </div>
        )}
        {!canAfford && hasVisited && (
          <div className="text-[0.7rem] text-red-700">
            Not enough gold to purchase this artifact.
          </div>
        )}
        <button
          className="btn btn-xs btn-primary mt-1"
          disabled={!hasVisited || !canAfford}
          title={
            !hasVisited
              ? 'Visit this location first'
              : !canAfford
              ? 'Not enough gold'
              : ''
          }
          onClick={handleBuy}
        >
          Buy Artifact
        </button>
      </div>
    </div>
  );
}


export default function TownTab({ heroId }) {
  const { posse, activeHeroId, updateHero } = usePosse();
  const resolvedHeroId = heroId ?? activeHeroId;

  const hero = useMemo(
    () =>
      posse.find((h) => (h.id || h.localId) === resolvedHeroId) ?? null,
    [posse, resolvedHeroId]
  );

  // debug: snapshot of totals when hero changes
  useEffect(() => {
    if (!hero) return;
    const totals = calculateCurrentStats(hero);
    try {
      console.log('[TownTab:totals snapshot]', {
        id: hero.id || hero.localId,
        Luck: getStatTotal(hero, 'Luck'),
        Cunning: getStatTotal(hero, 'Cunning'),
        Agility: getStatTotal(hero, 'Agility'),
        Lore: getStatTotal(hero, 'Lore'),
        totals,
      });
    } catch {}
  }, [hero?.id, hero?.localId, hero]);

  // ---- EFFECTIVE STAT RESOLVER ---------------------------------------------
  const effStatsRaw = useMemo(
    () => (hero ? calculateCurrentStats(hero) : {}),
    [hero]
  );

  const normalizeStatName = (s) => {
    const m = String(s || '').trim().toLowerCase();
    switch (m) {
      case 'agility':
      case 'agi':
        return 'Agility';
      case 'cunning':
      case 'cun':
        return 'Cunning';
      case 'spirit':
      case 'spr':
        return 'Spirit';
      case 'strength':
      case 'str':
        return 'Strength';
      case 'law':
      case 'lore':
      case 'lr':
        return 'Lore';
      case 'luck':
      case 'lck':
        return 'Luck';
      case 'combat':
        return 'Combat';
      case 'range':
      case 'ranged':
        return 'Range';
      default:
        return s;
    }
  };

  const pickNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const deepRead = (obj, key) => {
    if (!obj) return null;
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const n = pickNumber(obj[key]);
      if (n !== null) return n;
    }
    const containers = ['stats', 'effective', 'current', 'derived', 'merged', 'totals'];
    for (const c of containers) {
      const bucket = obj?.[c];
      if (!bucket) continue;
      if (Object.prototype.hasOwnProperty.call(bucket, key)) {
        const n = pickNumber(bucket[key]);
        if (n !== null) return n;
      }
    }
    return null;
  };

  const getStat = (name) => {
    const key = normalizeStatName(name);

    let n =
      deepRead(effStatsRaw, key) ??
      deepRead(effStatsRaw, String(key).toLowerCase());

    if (n === null) {
      n =
        deepRead(hero, key) ??
        deepRead(hero, String(key).toLowerCase());
    }

    return n ?? 0;
  };

  try {
    console.debug('[TownTab:getStat] sample', {
      Luck_from_calc: deepRead(effStatsRaw, 'Luck'),
      Luck_from_hero: deepRead(hero, 'Luck'),
      effStatsRawSample: effStatsRaw,
    });
  } catch {}

  // town state snapshot for this component
  const [state, setState] = useState(loadTownState());

const foWorldArtifactOffer =
  state?.stayMods?.foWorldArtifactOffer &&
  !state.stayMods.foWorldArtifactOffer.purchasedBy
    ? state.stayMods.foWorldArtifactOffer
    : null;

  // UI state
  const [openLocationId, setOpenLocationId] = useState(null);
  const [openSubshopId, setOpenSubshopId] = useState(null);
  const [openSubcatId, setOpenSubcatId] = useState(null);
  const [visitPurchases, setVisitPurchases] = useState({});
  const [eventNonce, setEventNonce] = useState(0);
  const [serviceUi, setServiceUi] = useState(null);

  // ---------- new-day rollover ----------
  useEffect(() => {
    const today = new Date().toDateString();
    const s = loadTownState();
    if (s.dayStamp !== today) {
      resetTownState(
        today,
        posse.map((h) => h.id || h.localId).filter(Boolean)
      );
      posse.forEach((h) => {
        const id = h.id || h.localId;
        if (!id) return;
        updateHero({ id, lodging: null, chosenLocation: null, isDone: false });
      });
      setVisitPurchases({});
    }
    setState(loadTownState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posse.length]);

  // listen for broadcast changes
  useEffect(() => {
    const onChange = () => setState(loadTownState());
    window.addEventListener('sobTownStateChanged', onChange);
    return () => window.removeEventListener('sobTownStateChanged', onChange);
  }, []);

  if (!hero) return <div className="p-4">Loading hero data…</div>;

  const canVisit = !hero.chosenLocation && !!hero.lodging;

  const handleOpenLocation = (shopId) => {
    setOpenLocationId(shopId);
    setOpenSubcatId(null);
    const shop = shopDataById[shopId];
    const child =
      Array.isArray(shop?.shops) && shop.shops.length
        ? shop.shops[0]?.id || null
        : null;
    setOpenSubshopId(child);
    ensureLocEventRolled(shopId);
    setState(loadTownState());
    setServiceUi(null);
  };

  const handleCloseLocation = () => {
    setOpenLocationId(null);
    setOpenSubcatId(null);
    setOpenSubshopId(null);
    setServiceUi(null);
  };

  const handleVisit = (shopId) => {
    if (hero.chosenLocation) return;

    // Destroyed locations cannot be visited
    if (isLocationDestroyed(shopId)) {
      window.alert('This location has been destroyed and cannot be visited this town stay.');
      return;
    }

    // Smuggler’s Den: Law heroes get a warning but can still visit (look only)
    if (shopId === ‘smugglersDen’ && hasKeyword(hero, ‘Law’)) {
      window.alert(
        ‘Law heroes are not welcome in the Smuggler’s Den.\n\nYou may look around, but you cannot buy anything or use its services.’
      );
    }

    // Saloon: Conversion check — D6 roll, on 1-2 lose the blessing
    const heroId = hero.id || hero.localId;
    if (shopId === ‘saloon’ && hero.gear?.[‘Blessing’]?.id === ‘ch_conversion’) {
      const goAhead = window.confirm(
        ‘You have been Converted (Holy).\n\n’ +
        ‘Visiting the Saloon means rolling a D6 — on a 1 or 2 you lose\n’ +
        ‘your Conversion bonus (+1 Spirit and the Holy keyword).\n\n’ +
        ‘Do you still want to visit the Saloon?’
      );
      if (!goAhead) return;

      const roll = Math.floor(Math.random() * 6) + 1;
      if (roll <= 2) {
        // Lost the Conversion
        const gear = { ...(hero.gear || {}) };
        delete gear[‘Blessing’];
        const keywords = removeKeyword(hero, ‘Holy’);
        updateHero({ id: heroId, gear, keywords });
        window.alert(
          `Saloon Conversion Check: Rolled ${roll}\n\n` +
          `You have lost your Conversion!\n` +
          `-1 Spirit and the Holy keyword removed.`
        );
      } else {
        window.alert(
          `Saloon Conversion Check: Rolled ${roll}\n\n` +
          `Your faith holds. You keep your Conversion blessing.`
        );
      }
    }

    const id = heroId;
    setVisitPurchases((v) => ({ ...v, [id]: v[id] || {} }));
    updateHero({ id, chosenLocation: shopId, isDone: true });

    // --- Show Location Event flavor/effect on Visit ---
    try {
      // Ensure the event is rolled
      ensureLocEventRolled(shopId);
      const ev = getLocEventState(shopId);
      if (typeof window === 'undefined' || !ev) return;

      const entry = ev.entry || ev.result || ev;
      const shopName = shopDataById[shopId]?.name || 'Location';
      const title =
        entry?.name ||
        entry?.title ||
        (ev.roll != null ? `Event Result (Roll: ${ev.roll})` : 'Event Result');

      const flavorParts = [];
      if (Array.isArray(entry?.flavor)) flavorParts.push(...entry.flavor);
      else if (entry?.flavor) flavorParts.push(entry.flavor);
      if (Array.isArray(entry?.lore)) flavorParts.push(...entry.lore);
      else if (entry?.lore) flavorParts.push(entry.lore);

      const effectParts = [];
      if (Array.isArray(entry?.effect)) effectParts.push(...entry.effect);
      else if (entry?.effect) effectParts.push(entry.effect);
      if (Array.isArray(entry?.rules)) effectParts.push(...entry.rules);
      else if (entry?.rules && typeof entry.rules === 'string')
        effectParts.push(entry.rules);
      if (Array.isArray(entry?.text)) effectParts.push(...entry.text);
      else if (entry?.text && typeof entry.text === 'string')
        effectParts.push(entry.text);

      const lines = [];
      lines.push(`${shopName} – Location Event`);
      if (title) lines.push('', title);
      if (flavorParts.length) {
        lines.push('', flavorParts.join('\n'));
      }
      if (effectParts.length) {
        lines.push('', 'Effect:', effectParts.join('\n'));
      }

      if (lines.length > 1) {
        window.alert(lines.join('\n'));
      }
    } catch (e) {
      console.error('[TownTab] Error showing Location Event popup', e);
    }
  };

  // Visit purchase counters
  const getVisitCount = (itemId) => {
    const id = hero.id || hero.localId;
    if (!id) return 0;
    return visitPurchases?.[id]?.[itemId] || 0;
  };
  const incVisitCount = (itemId) => {
    const id = hero.id || hero.localId;
    if (!id) return;
    setVisitPurchases((v) => {
      const prevForHero = v[id] || {};
      const prev = prevForHero[itemId] || 0;
      return {
        ...v,
        [id]: { ...prevForHero, [itemId]: prev + 1 },
      };
    });
  };

  // --------------------------------- helpers ---------------------------------
  const applyActions = (actions) => {
    if (!actions) return;

    const id = hero.id || hero.localId;
    if (!id) return;

    // Plain object of deltas (Gambling Hall mini-games, etc.)
    if (!Array.isArray(actions)) {
      if (typeof actions !== 'object') return;

      const patch = {};
      const asNum = (v, def = 0) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : def;
      };

      // ---- SPECIAL CASE: GRIT (delta) ----------------------------------
      let gritDelta = 0;

      if (typeof actions.currentGrit === 'number') {
        gritDelta += asNum(actions.currentGrit);
      }
      if (typeof actions.grit === 'number') {
        gritDelta += asNum(actions.grit);
      }

      if (gritDelta !== 0) {
        const baseGrit = asNum(
          hero.currentGrit ??
            hero.grit ??
            hero.stats?.Grit ??
            hero.derived?.Grit ??
            hero.totals?.Grit ??
            0,
          0
        );

        let nextGrit = baseGrit + gritDelta;
        if (!Number.isFinite(nextGrit)) nextGrit = 0;
        if (nextGrit < 0) nextGrit = 0;

        patch.currentGrit = nextGrit;
      }

      // ---- Everything else stays delta-based -------------------
      for (const [key, val] of Object.entries(actions)) {
        if (key === 'currentGrit' || key === 'grit') continue;

        if (typeof val === 'number') {
          const baseRaw = hero[key];
          const base = Number.isFinite(Number(baseRaw)) ? Number(baseRaw) : 0;
          patch[key] = base + val;
        } else {
          patch[key] = val;
        }
      }

      if (Object.keys(patch).length) {
        updateHero({ id, ...patch });
      }
      return;
    }

    // Array of { type: 'update', ...patch }
    if (!actions.length) return;

    const merged = {};
    for (const a of actions) {
      if (a?.type === 'update') {
        const { type, ...rest } = a;
        Object.assign(merged, rest);
      }
    }

    if (Object.keys(merged).length) {
      updateHero({ id, ...merged });
    }
  };

  // prompt helpers
  const promptNumber = async (
    label,
    { min = 0, max = 9999, step = 1, initial = 0 } = {}
  ) => {
    const raw = window.prompt(label, String(initial));
    if (raw == null) return 0;
    const v = Number(raw);
    if (Number.isNaN(v)) return 0;
    return Math.max(min, Math.min(max, Math.round(v / step) * step));
  };

  const promptRoll = async (n, sides, label) => {
    const choice = window.prompt(
      `${label || 'Roll'}:\n` +
        `- Enter ${n} value(s) 1–${sides} (comma-separated)\n` +
        `- Accepts "3+" → 3, "1d6" / "d6" → auto\n` +
        `- Leave blank for auto-roll`,
      ''
    );

    const auto = () =>
      Array.from(
        { length: n },
        () => Math.floor(Math.random() * sides) + 1
      );
    if (!choice) return auto();

    const rawParts = choice
      .split(',')
      .map((s) => String(s).trim())
      .filter(Boolean);

    const parsed = rawParts.map((tok) => {
      const lower = tok.toLowerCase();
      if (/^\d*d\d+$/.test(lower)) return NaN;
      const m = tok.match(/(\d+)/);
      if (!m) return NaN;
      const v = Number(m[1]);
      return Number.isFinite(v) ? v : NaN;
    });

    const out = [];
    for (let i = 0; i < n; i++) {
      const v = parsed[i];
      if (Number.isFinite(v) && v >= 1 && v <= sides) {
        out.push(Math.floor(v));
      } else {
        out.push(Math.floor(Math.random() * sides) + 1);
      }
    }
    return out;
  };

  const promptPay = async (_h, amount, label = 'Pay') =>
    !!window.confirm(`${label}\nHero pays $${amount}. Continue?`);

  // Posse & UI APIs for handlers
  const posseApi = {
    getActiveHeroId: () => resolvedHeroId,
    getHero: (id) =>
      posse.find((h) => (h.id || h.localId) === id) || null,
    updateHero: (id, patchOrFn) => {
      const target =
        posse.find((h) => (h.id || h.localId) === id) || {};
      const patch =
        typeof patchOrFn === 'function'
          ? patchOrFn(target)
          : patchOrFn || {};
      updateHero({ id, ...patch });
    },
    addToken: (id, tokenName) => {
      const target =
        posse.find((h) => (h.id || h.localId) === id) || {};
      const sideBag = nextSideBag(target, tokenName, 1);
      updateHero({ id, sideBag });
    },
    getHeroesAtShop: (sid) => {
      if (!sid) return [resolvedHeroId].filter(Boolean);
      return posse
        .filter(
          (h) =>
            (h.id || h.localId) && h.chosenLocation === sid
        )
        .map((h) => h.id || h.localId);
    },
    getTotalsForHero: (id) => {
      const target =
        posse.find(
          (h) => (h.id || h.localId) === (id || resolvedHeroId)
        ) || null;
      if (!target) return null;
      try {
        return calculateCurrentStats(target) || {};
      } catch {
        return {};
      }
    },
  };

  // ---------- Black Market price helpers ----------
  const _ensureBmPriceReg = (s) => {
    s.shopMods = s.shopMods || {};
    s.shopMods.smugglersDen = s.shopMods.smugglersDen || {};
    s.shopMods.smugglersDen.blackMarketPrices =
      s.shopMods.smugglersDen.blackMarketPrices || {};
    return s.shopMods.smugglersDen.blackMarketPrices;
  };
  function getBmPriceDieForToday(townState, itemId, dayStamp) {
    const s = townState || loadTownState() || {};
    const reg = _ensureBmPriceReg(s);
    const day = dayStamp || s.dayStamp || new Date().toDateString();
    reg[day] = reg[day] || {};
    if (!Number.isFinite(reg[day][itemId])) {
      reg[day][itemId] = Math.floor(Math.random() * 6) + 1;
      saveTownState(s);
    }
    return reg[day][itemId];
  }
  function priceForBlackMarketItem(item, townState) {
    const s = townState || loadTownState() || {};
    const day = s.dayStamp || new Date().toDateString();
    const die = getBmPriceDieForToday(s, item.id, day);
    const base = Number(item.baseGold ?? item.value ?? 0);
    return { die, total: base + die * 25, base };
  }

  const uiApi = {
    roll: (n, sides, label) => promptRoll(n, sides, label),
    rollPeril: async () => {
      const r = await promptRoll(1, 6, 'Peril die');
      return Array.isArray(r) ? r[0] : r;
    },
    promptChoice: async (title, options) => {
      const msg =
        `${title}\n\n${options
          .map((o, i) => `${i + 1}. ${o.label || o}`)
          .join('\n')}\n\nEnter a number:`;
      const pick = window.prompt(msg, '1');
      if (pick == null) return -1;
      const idx = Number.parseInt(pick, 10) - 1;
      if (!Number.isFinite(idx) || idx < 0 || idx >= options.length)
        return -1;
      return idx;
    },
    promptNumber: ({ title, message, min, max, defaultValue }) =>
      promptNumber(title || message || 'Enter a number', {
        min,
        max,
        initial: defaultValue,
      }),
    promptYesNo: async ({ message }) =>
      !!window.confirm(message || 'Are you sure?'),
    promptText: async ({ message, defaultValue }) => {
      const v = window.prompt(
        message || 'Enter text',
        defaultValue ?? ''
      );
      return v == null ? '' : String(v);
    },
    chooseRerollFlex: ({ result, dieSides, target, allowed }) => {
      const msg =
        `You may nudge the rerolled die by ±1\n\n` +
        `Result: ${result}/${dieSides}${
          target ? `  (target: ${target})` : ''
        }\n` +
        `Allowed: ${allowed.join(', ')}\n\nEnter -1, 0, or 1:`;
      const raw = window.prompt(msg, '0');
      if (raw == null) return 0;
      const n = Number(raw);
      return allowed.includes(n) ? n : 0;
    },
    toast: (msg) => {
      try {
        console.log('[Event]', msg);
      } catch {}
    },
  };

  const townStateApi = {
    get: () => loadTownState(),
    set: (next) => {
      saveTownState(next);
      setState(loadTownState());
      window.dispatchEvent(new Event('sobTownStateChanged'));
    },
  };

  // ---- Event action applier (used after resolveLocEvent) ----
  async function applyEventActions(payload) {
    const actions = Array.isArray(payload?.actions)
      ? payload.actions
      : [];
    const heroId = hero?.id || hero?.localId;

    for (const a of actions) {
      switch (a.type) {
        case 'LOSE_GRIT': {
          if (!heroId) break;
          const lose = Number.isFinite(a.amount) ? a.amount : 1;
          updateHero({
            id: heroId,
            grit: Math.max(0, (hero?.grit ?? 0) - lose),
          });
          break;
        }
        case 'ADD_GRIT': {
          if (!heroId) break;
          const add = Number.isFinite(a.amount) ? a.amount : 1;
          updateHero({
            id: heroId,
            grit: Math.max(0, (hero?.grit ?? 0) + add),
          });
          break;
        }
        case 'HEAL_TO_FULL': {
          if (!heroId) break;
          updateHero({
            id: heroId,
            health: {
              ...(hero?.health || {}),
              current:
                hero?.health?.max ??
                hero?.maxHealth ??
                0,
              max:
                hero?.health?.max ??
                hero?.maxHealth ??
                0,
            },
            sanity: {
              ...(hero?.sanity || {}),
              current:
                hero?.sanity?.max ??
                hero?.maxSanity ??
                0,
              max:
                hero?.sanity?.max ??
                hero?.maxSanity ??
                0,
            },
          });
          break;
        }
        case 'MODIFY_GOLD': {
          if (!heroId) break;
          const delta = Number(a.delta || 0);
          updateHero({
            id: heroId,
            gold: Math.max(0, (hero?.gold ?? 0) + delta),
          });
          break;
        }
        case 'GRANT_REROLL_TAG': {
          if (!heroId) break;
          updateHero(heroId, (prev) => {
            const temp = {
              id: 'war_stories_damage_reroll',
              name: 'War Stories',
              type: 'temporary',
              effect:
                'May reroll one Damage roll for one Hit during the next Adventure.',
              cap: 1,
              active: true,
              expires: 'nextAdventure',
              addedAt: Date.now(),
            };
            const cond = prev?.conditions || {};
            const tempList = Array.isArray(cond.temporary)
              ? cond.temporary.slice()
              : [];
            if (!tempList.find((x) => x.id === temp.id))
              tempList.push(temp);
            return {
              ...prev,
              conditions: { ...cond, temporary: tempList },
            };
          });
          break;
        }
        case 'ADD_KEYWORD': {
          if (!heroId || !a.keyword) break;
          updateHero(heroId, (prev) => {
            const kw = Array.isArray(prev?.keywords)
              ? prev.keywords.slice()
              : [];
            if (!kw.includes(a.keyword)) kw.push(a.keyword);
            return { ...prev, keywords: kw };
          });
          break;
        }
        case 'REPLACE_KEYWORD': {
          if (!heroId) break;
          updateHero(heroId, (prev) => {
            let kw = Array.isArray(prev?.keywords)
              ? prev.keywords.slice()
              : [];
            if (a.from) kw = kw.filter((k) => k !== a.from);
            if (a.to && !kw.includes(a.to)) kw.push(a.to);
            return { ...prev, keywords: kw };
          });
          break;
        }
        default:
          break;
      }
    }

    if (payload?.townState) {
      saveTownState(payload.townState);
    } else if (payload?.stayMods || payload?.shopMods) {
      const cur = loadTownState() || {};
      const next = {
        ...cur,
        stayMods: {
          ...(cur.stayMods || {}),
          ...(payload.stayMods || {}),
        },
        shopMods: {
          ...(cur.shopMods || {}),
          ...(payload.shopMods || {}),
        },
      };
      saveTownState(next);
    }

    setState(loadTownState());
    window.dispatchEvent(new Event('sobTownStateChanged'));
  }

  // ------- Perform (services) -------
  const handlePerform = async (shopId, svc, idx = 0) => {
    if (hero.chosenLocation !== shopId) return;
    if (!svc) return;

    // ---------- SALOON ----------
    if (shopId === 'saloon') {
      const heroView = withTotalStatsView(hero);

      const ctx = {
        getActiveHeroId: () => heroView.id || heroView.localId,
        getHeroById: (id) => {
          const h =
            posse.find((x) => (x.id || x.localId) === id) || null;
          return withTotalStatsView(h);
        },
        getHero: (id) => {
          const h =
            posse.find((x) => (x.id || x.localId) === id) || null;
          return withTotalStatsView(h);
        },
        updateHero: (id, patchOrFn) => {
          const target =
            posse.find((h) => (h.id || h.localId) === id) || {};
          const patch =
            typeof patchOrFn === 'function'
              ? patchOrFn(target)
              : patchOrFn || {};
          updateHero({ id, ...patch });
        },
        toast: (msg) => {
          try {
            console.log('[Saloon]', msg);
          } catch {}
        },

        ui: {
          ...uiApi,
          roll: async (n, sides, label) =>
            promptRoll(n, sides, label || 'Roll'),
          rollCunning: async () => {
            const n = Math.max(1, heroView.Cunning || 1);
            return promptRoll(
              n,
              6,
              `Cunning test (${n}d6) — Cunning: ${heroView.Cunning}`
            );
          },
          rollLuck: async () => {
            const n = Math.max(1, heroView.Luck || 1);
            return promptRoll(
              n,
              6,
              `Luck test (${n}d6) — Luck: ${heroView.Luck}`
            );
          },
          rollAgilityMany: async (count) => {
            const n = Number.isFinite(count)
              ? Math.max(1, count)
              : Math.max(1, heroView.Agility);
            return promptRoll(
              n,
              6,
              `Performance (Agility) — Agility: ${heroView.Agility} (rolling ${n}d6)`
            );
          },
          rollLoreMany: async (count) => {
            const n = Number.isFinite(count)
              ? Math.max(1, count)
              : Math.max(1, heroView.Lore);
            return promptRoll(
              n,
              6,
              `Storytelling (Lore) — Lore: ${heroView.Lore} (rolling ${n}d6)`
            );
          },
          rollAgility: async () => {
            const n = Math.max(1, heroView.Agility || 1);
            return promptRoll(
              n,
              6,
              `Agility test (${n}d6) — Agility: ${heroView.Agility}`
            );
          },
        },
      };

      const res = await performSaloonService(svc.id, {}, ctx);
      applyActions(res?.actions);
      setServiceUi({
        title: svc.name,
        description: Array.isArray(svc?.rules?.text)
          ? svc.rules.text
          : [],
        outcome: Array.isArray(res?.log) ? res.log : ['Performed.'],
      });
      setState(loadTownState());
      return;
    }

    // ---------- Street Market ----------
    if (shopId === 'streetMarket') {
      const ctx = {
        hero,
        townState: state,
        posseApi,
        ui: uiApi,
        params: {},
      };

      if (svc.id === 'sm_bath_house') {
        const res = await performBathHouse(ctx);
        applyActions(res?.actions);
        if (res?.log?.length) console.log(res.log.join('\n'));
        setServiceUi(
          res?.ui || { title: svc.name, outcome: ['Performed.'] }
        );
        setState(loadTownState());
        return;
      }

      if (svc.id === 'sm_sell_dark_stone') {
        const res = await performSellDarkStone(ctx);
        applyActions(res?.actions);
        if (res?.log?.length) console.log(res.log.join('\n'));
        setServiceUi(
          res?.ui || { title: svc.name, outcome: ['Performed.'] }
        );
        setState(loadTownState());
        return;
      }

      if (svc.id === 'sm_street_gambling') {
        const res = await performStreetGambling(ctx);
        applyActions(res?.actions);
        if (res?.log?.length) console.log(res.log.join('\n'));
        setServiceUi(
          res?.ui || { title: svc.name, outcome: ['Performed.'] }
        );
        setState(loadTownState());
        return;
      }
    }

    // ---------- Mutant Quarter ----------
    if (shopId === 'mutantQuarter') {
      const mqUi = {
        ...uiApi,
        promptInjuryOrMutation: (h) => {
          const rawInj =
            getInjuryList(h) ??
            h?.injuries ??
            h?.conditions?.injuries ??
            h?.status?.injuries ??
            [];
          const rawMut =
            getMutationList(h) ??
            h?.mutations ??
            h?.conditions?.mutations ??
            h?.status?.mutations ??
            [];

          const injuriesAll = Array.isArray(rawInj) ? rawInj : [];
          const mutationsAll = Array.isArray(rawMut) ? rawMut : [];

          const injuries = injuriesAll.filter(
            (c) => !c?.surgeryLocked
          );
          const mutations = mutationsAll.filter(
            (c) => !c?.surgeryLocked
          );

          const options = [
            ...injuries.map((c, i) => ({
              label: `Injury: ${
                c?.name || c?.title || 'Injury'
              }`,
              kind: 'injury',
              _idx: i,
            })),
            ...mutations.map((c, i) => ({
              label: `Mutation: ${
                c?.name || c?.title || 'Mutation'
              }`,
              kind: 'mutation',
              _idx: i,
            })),
          ];

          if (!options.length) {
            const lockedOnly =
              injuriesAll.length + mutationsAll.length > 0 &&
              injuries.length + mutations.length === 0;
            alert(
              lockedOnly
                ? 'All current Injuries/Mutations are “Too Far Gone”. None can be operated on.'
                : 'No Injuries or Mutations found on this hero.'
            );
            return null;
          }

          if (options.length === 1) return options[0];

          const promptMsg =
            'Choose a condition to operate on (enter a number):\n\n' +
            options
              .map((o, i) => `${i + 1}. ${o.label}`)
              .join('\n');
          const raw = window.prompt(promptMsg, '1');
          if (raw == null) return null;
          const idxPick = Number.parseInt(raw, 10) - 1;
          if (
            !Number.isFinite(idxPick) ||
            idxPick < 0 ||
            idxPick >= options.length
          )
            return null;
          return options[idxPick];
        },
      };

      if (svc?.id === 'mq_mutant_surgeon') {
        const res = await performMqSurgeon({ hero, ui: mqUi });
        applyActions(res?.actions);
        if (res?.patch)
          updateHero({
            id: hero.id || hero.localId,
            ...res.patch,
          });
        setServiceUi(
          res?.ui || { title: svc.name, outcome: res?.log || ['Performed.'] }
        );
        setState(loadTownState());
        return;
      }

      if (svc?.id === 'mq_visit_prophet') {
        const res = await performMqProphet({ hero, ui: mqUi });
        applyActions(res?.actions);
        if (res?.patch)
          updateHero({
            id: hero.id || hero.localId,
            ...res.patch,
          });
        setServiceUi(
          res?.ui || { title: svc.name, outcome: res?.log || ['Performed.'] }
        );
        setState(loadTownState());
        return;
      }

      if (svc?.id === 'mq_meet_revolutionaries') {
        const res = await performMqAid({
          hero,
          ui: mqUi,
          posseApi,
          shopId: 'mutantQuarter',
        });
        applyActions(res?.actions);
        if (res?.patch)
          updateHero({
            id: hero.id || hero.localId,
            ...res.patch,
          });
        setServiceUi(
          res?.ui || { title: svc.name, outcome: res?.log || ['Performed.'] }
        );
        setState(loadTownState());
        return;
      }
    }

    // ---------- Indian Trading Post ----------
    if (shopId === 'indianTradingPost' && svc) {
      const io = {
        roll: promptRoll,
        promptChoice: (title, options) =>
          uiApi.promptChoice(title, options),
        notify: (msg) => console.log('[Medicine Man]', msg),
      };
      const posseApiLocal = {
        getHero: posseApi.getHero,
        updateHero: (hid, patchOrFn) =>
          posseApi.updateHero(hid, patchOrFn),
      };

      if (svc.id === 'spirit_cleansing') {
        await performSpiritCleansing({
          hero,
          io,
          posseApi: posseApiLocal,
        });
        setServiceUi(null);
        setState(loadTownState());
        return;
      }
      if (svc.id === 'vision_quest') {
        await performVisionQuest({
          hero,
          io,
          posseApi: posseApiLocal,
        });
        setServiceUi(null);
        setState(loadTownState());
        return;
      }
    }

    // ---------- Doc's Office ----------
    if (shopId === 'docsOffice') {
      const io = {
        roll: promptRoll,
        pay: (amount, label) => promptPay(hero, amount, label),
        promptNumber: (label, opts) =>
          promptNumber(label, opts),
        promptInjuryOrMutation: (h) => {
          const rawInj =
            getInjuryList(h) ??
            h?.injuries ??
            h?.conditions?.injuries ??
            h?.status?.injuries ??
            [];
          const rawMut =
            getMutationList(h) ??
            h?.mutations ??
            h?.conditions?.mutations ??
            h?.status?.mutations ??
            [];

          const injuriesAll = Array.isArray(rawInj) ? rawInj : [];
          const mutationsAll = Array.isArray(rawMut) ? rawMut : [];

          const injuries = injuriesAll.filter(
            (c) => !c?.surgeryLocked
          );
          const mutations = mutationsAll.filter(
            (c) => !c?.surgeryLocked
          );

          const options = [
            ...injuries.map((c, i) => ({
              label: `Injury: ${
                c?.name || c?.title || 'Injury'
              }`,
              kind: 'injury',
              _idx: i,
            })),
            ...mutations.map((c, i) => ({
              label: `Mutation: ${
                c?.name || c?.title || 'Mutation'
              }`,
              kind: 'mutation',
              _idx: i,
            })),
          ];

          if (!options.length) {
            const lockedOnly =
              injuriesAll.length + mutationsAll.length > 0 &&
              injuries.length + mutations.length === 0;
            alert(
              lockedOnly
                ? 'All current Injuries/Mutations are marked as “Too Far Gone” (surgeryLocked). None can be operated on.'
                : 'No Injuries or Mutations found on this hero.'
            );
            return null;
          }

          if (options.length === 1) return options[0];

          const promptMsg =
            'Choose a condition to operate on (enter a number):\n\n' +
            options
              .map((o, i) => `${i + 1}. ${o.label}`)
              .join('\n');
          const raw = window.prompt(promptMsg, '1');
          if (raw == null) return null;
          const idxPick = Number.parseInt(raw, 10) - 1;
          if (
            !Number.isFinite(idxPick) ||
            idxPick < 0 ||
            idxPick >= options.length
          )
            return null;
          return options[idxPick];
        },
        notify: (msg) => console.log('[Doc]', msg),
      };

      if (svc?.id === 'doc_surgery') {
        const meId = hero.id || hero.localId;
        const mods = getDocsOfficeModsForHero();
        const res = await performSurgery({
          hero,
          townState: state,
          io,
          mods,
        });
        if (res?.patch) posseApi.updateHero(meId, res.patch);
        if (res?.ui) setServiceUi(res.ui);
        else setServiceUi(null);
        if (res?.log?.length) console.log(res.log.join('\n'));
        setState(loadTownState());
        return;
      }

      if (svc?.id === 'doc_treat_corruption') {
        const maxByCor = Math.max(
          0,
          Number(hero?.currentCorruption ?? 0)
        );
        const maxByGold = Math.floor(
          Math.max(0, Number(hero?.gold ?? 0)) / 100
        );
        const max = Math.min(maxByCor, maxByGold);
        if (max <= 0) {
          alert(
            'You either have no Corruption to remove or not enough gold ($100 per point).'
          );
          return;
        }

        const { actions, log, ui } = await performTreatCorruption({
          hero,
          io: {
            ...io,
            promptNumber: async (
              _label,
              { defaultValue = Math.min(1, max) } = {}
            ) => {
              const msg =
                `Treat Corruption\n\n` +
                `How many Corruption to remove? (0–${max})\n` +
                `Cost: $100 each (you can afford up to ${maxByGold})\n` +
                `Current: ${maxByCor}`;
              const raw = window.prompt(
                msg,
                String(defaultValue)
              );
              const n = Math.floor(Number(raw));
              return Number.isFinite(n)
                ? Math.max(0, Math.min(max, n))
                : 0;
            },
          },
        });
        applyActions(actions);
        if (log?.length) console.log(log.join('\n'));
        if (ui) setServiceUi(ui);
        else setServiceUi(null);
        setState(loadTownState());
        return;
      }

      if (isInjection(svc)) {
        const { actions, log, ui } =
          await performInjectionPurchase({
            hero,
            item: svc,
            townState: state,
            io,
          });
        applyActions(actions);
        if (log?.length) console.log(log.join('\n'));
        if (ui) setServiceUi(ui);
        else setServiceUi(null);
        setState(loadTownState());
        return;
      }
    }

    // ---------- Church rituals ----------
    const meId = hero.id || hero.localId;
    if (svc?.id === 'ch_ritual_exorcism_of_madness') {
      await applyChurchRitual(
        { posseApi, uiApi, heroId: meId },
        'ch_ritual_exorcism_of_madness'
      );
      setServiceUi(null);
      setState(loadTownState());
      return;
    }
    if (svc?.id === 'ch_ritual_banish_corruption') {
      await applyChurchRitual(
        { posseApi, uiApi, heroId: meId },
        'ch_ritual_banish_corruption'
      );
      setServiceUi(null);
      setState(loadTownState());
      return;
    }
    if (svc?.id === 'ch_ritual_resurrection') {
      await applyChurchRitual(
        { posseApi, uiApi, heroId: meId },
        'ch_ritual_resurrection'
      );
      setServiceUi(null);
      setState(loadTownState());
      return;
    }
    if (String(svc?.id || '').startsWith('ch_ritual_')) {
      await applyChurchRitual(
        { posseApi, uiApi, heroId: meId },
        String(svc.id)
      );
      setServiceUi(null);
      setState(loadTownState());
      return;
    }

       // ---------- Frontier Outpost ----------
    if (shopId === 'frontierOutpost') {
      const ctx = {
        hero,
        posseApi,
        townStateApi,
        io: {
          roll: promptRoll,
          promptNumber: (label, opts) => promptNumber(label, opts),
          toast: (msg) => console.log('[FO]', msg),
        },
      };

      const foEvent = getFoEvent();
      const foRate = foRateFromEvent(foEvent);
      const FO_TEXT = {
        fo_bank_sell_dark_stone: [
          `You may sell Dark Stone shards at the Outpost Bank for <b>D6 × $${foRate}</b> each.`,
          'Roll once <i>per shard</i> at the time of sale.',
        ],
        fo_bank_hold_up: [
          'Make an <b>Agility 5+</b> test to rob the Outpost Bank.',
          'For each success, gain <b>D6 × $50</b>.',
          'For each <b>1</b> rolled, take <b>D6 Damage</b> during the shootout (ignores Defense).',
          'If you score <b>0 successes</b>, you are arrested and set to hang in the morning — make a <b>Cunning 3+</b> test to escape (<b>gain 20 XP</b> and leave Town for the rest of this stay).',
          'If you fail the escape, you are <b>hung at dawn</b> — your Hero is <b>killed</b>.',
        ],
      };
      const getFoDescriptionForItem = (item) =>
        FO_TEXT[String(item?.id || '')] || null;

      // Bank services
      if (
        svc.id === 'fo_bank_sell_dark_stone' ||
        svc.id === 'fo_bank_hold_up'
      ) {
        const res = await performOutpostBankService({
          serviceId: svc.id,
          ...ctx,
          frontierOutpostEvent: foEvent,
        });

        if (res?.log?.length) console.log(res.log.join('\n'));
        const ui = res?.ui || {
          title: svc.name,
          description:
            getFoDescriptionForItem(svc) ||
            (Array.isArray(svc.rules?.text) ? svc.rules.text : []),
          outcome: Array.isArray(res?.log) ? res.log : ['Performed.'],
        };
        setServiceUi(ui);
        setState(loadTownState());
        return;
      }

      // Training with soldiers
      if (svc.id === 'fo_train_with_soldiers') {
        const res = await performOutpostTrainingService({
          serviceId: svc.id,
          ...ctx,
        });
        if (res?.log?.length) console.log(res.log.join('\n'));
        const ui = res?.ui || {
          title: svc.name,
          description: Array.isArray(svc.rules?.text)
            ? svc.rules.text
            : [],
          outcome: Array.isArray(res?.log) ? res.log : ['Performed.'],
        };
        setServiceUi(ui);
        setState(loadTownState());
        return;
      }

      // Bounty board (separate handler)
      if (svc.id === 'fo_bounty_board') {
        const result = await performFrontierOutpostBounty({
          ...ctx,
          hero,
          note: (msg) =>
            uiApi.toast?.(msg) ?? console.log('[FO Bounty]', msg),
        });

        setServiceUi({
          title: svc.name,
          description:
            getFoDescriptionForItem(svc) ||
            (Array.isArray(svc.rules?.text) ? svc.rules.text : []),
          outcome: Array.isArray(result?.log)
            ? result.log
            : [
                result?.name || 'Bounty Result',
                result?.reward || result?.note || '',
              ].filter(Boolean),
        });

        setState(loadTownState());
        return;
      }
    }


    // ---------- Smuggler's Den ----------
    if (shopId === 'smugglersDen') {
      // Heroes without access may look, but cannot use services
      if (hasKeyword(hero, 'Law')) {
        alert(
          'Law heroes may not make deals in the Smuggler’s Den. You can look around, but cannot use these services.'
        );
        return;
      }

      const io = {
        roll: promptRoll,
        pay: (amount, label) => promptPay(hero, amount, label),
        promptNumber: (label, opts) =>
          promptNumber(label, opts),
        promptInjuryOrMutation: (h) => {
          const rawInj =
            getInjuryList(h) ??
            h?.injuries ??
            h?.conditions?.injuries ??
            h?.status?.injuries ??
            [];
          const rawMut =
            getMutationList(h) ??
            h?.mutations ??
            h?.conditions?.mutations ??
            h?.status?.mutations ??
            [];

          const injuriesAll = Array.isArray(rawInj) ? rawInj : [];
          const mutationsAll = Array.isArray(rawMut) ? rawMut : [];

          const injuries = injuriesAll.filter(
            (c) => !c?.surgeryLocked
          );
          const mutations = mutationsAll.filter(
            (c) => !c?.surgeryLocked
          );

          const options = [
            ...injuries.map((c, i) => ({
              label: `Injury: ${
                c?.name || c?.title || 'Injury'
              }`,
              kind: 'injury',
              _idx: i,
            })),
            ...mutations.map((c, i) => ({
              label: `Mutation: ${
                c?.name || c?.title || 'Mutation'
              }`,
              kind: 'mutation',
              _idx: i,
            })),
          ];

          if (!options.length) {
            const lockedOnly =
              injuriesAll.length + mutationsAll.length > 0 &&
              injuries.length + mutations.length === 0;
            alert(
              lockedOnly
                ? 'All current Injuries/Mutations are “Too Far Gone”. None can be operated on.'
                : 'No Injuries or Mutations found on this hero.'
            );
            return null;
          }

          if (options.length === 1) return options[0];

          const promptMsg =
            'Choose a condition to operate on (enter a number):\n\n' +
            options
              .map((o, i) => `${i + 1}. ${o.label}`)
              .join('\n');
          const raw = window.prompt(promptMsg, '1');
          if (raw == null) return null;
          const idxPick = Number.parseInt(raw, 10) - 1;
          if (
            !Number.isFinite(idxPick) ||
            idxPick < 0 ||
            idxPick >= options.length
          )
            return null;
          return options[idxPick];
        },
        notify: (msg) => console.log('[Smugglers]', msg),
      };

      if (svc?.id === 'buy_round_of_shots') {
        const res = await performBuyRoundOfShots({
          hero,
          posseApi,
          ui: io,
        });
        applyActions(res?.actions);
        setServiceUi(
          res?.ui || {
            title: svc.name,
            outcome: [
              'Recovered +1 Grit and took D3 Wounds.',
            ],
          }
        );
        setState(loadTownState());
        return;
      }

      if (svc?.id === 'back_alley_doc') {
        const res = await performBackAlleyDoc({
          hero,
          posseApi,
          ui: io,
          svc,
        });
        applyActions(res?.actions);
        if (res?.patch)
          updateHero({
            id: hero.id || hero.localId,
            ...res.patch,
          });
        setServiceUi(
          res?.ui || { title: svc.name, outcome: res?.log || ['Performed.'] }
        );
        setState(loadTownState());
        return;
      }

      if (svc?.id === 'black_market_goods') {
        const res = await performBlackMarketGoods({
          hero,
          posseApi,
          ui: io,
          item: svc,
          shopId: 'smugglersDen',
        });
        applyActions(res?.actions);
        setServiceUi(
          res?.ui || { title: svc.name, outcome: res?.log || ['Performed.'] }
        );
        setState(loadTownState());
        return;
      }

      if (svc?.id === 'down_a_dark_road') {
        const res = await performDownDarkRoad({
          hero,
          posseApi,
          ui: io,
        });
        applyActions(res?.actions);
        setServiceUi(
          res?.ui || { title: svc.name, outcome: res?.log || ['Performed.'] }
        );
        setState(loadTownState());
        return;
      }

      setServiceUi({
        title: svc.name,
        description: Array.isArray(svc?.rules?.text)
          ? svc.rules.text
          : [],
        outcome: ['Performed.'],
      });
      setState(loadTownState());
      return;
    }

    // ---------- Gambling Hall ----------
    if (shopId === 'gamblingHall') {
      const heroView = withTotalStatsView(hero);

      // Context expected by gamblingHallServices.js
      const ghCtx = {
        // hero lookup
        getActiveHeroId: () => heroView.id || heroView.localId,
        getHeroById: (id) => {
          const h =
            posse.find((x) => (x.id || x.localId) === id) || null;
          return h ? withTotalStatsView(h) : null;
        },
        getHero: (id) => {
          const h =
            posse.find((x) => (x.id || x.localId) === id) || null;
          return h ? withTotalStatsView(h) : null;
        },

        // mutation-style updater
        updateHero: (id, patchOrFn) => {
          const target =
            posse.find((h) => (h.id || h.localId) === id) || {};
          const patch =
            typeof patchOrFn === 'function'
              ? patchOrFn(target)
              : patchOrFn || {};
          updateHero({ id, ...patch });
        },

        // UA markers → just bump unwantedAttention for now
        addCondition: (id, payload) => {
          if (payload?.type === 'UnwantedAttention') {
            const delta = Number(payload.delta || 1);
            posseApi.updateHero(id, (prev) => ({
              ...prev,
              unwantedAttention: (prev.unwantedAttention || 0) + delta,
            }));
          }
        },

        // "Heroes at this shop" (for Devil's Wheel jackpot)
        getHeroesAtShop: (sid) => posseApi.getHeroesAtShop(sid),

        // stat reader used by fallback doSkillCheck
        getEffectiveStat: (_id, stat) => getStat(stat),

        // logging
        toast: (msg) => {
          try {
            console.log('[GamblingHall]', msg);
          } catch {}
        },

        // simple numeric prompt helper, matches ctx.promptNumber(msg, key?)
        promptNumber: async (message /*, key */) => {
          const raw = window.prompt(message, '');
          if (raw == null) return null;
          const n = Number(raw);
          return Number.isFinite(n) ? n : null;
        },

        // yes/no prompt (used for "Did you win" / jackpot questions)
        promptYesNo: async ({ message, defaultValue }) => {
          const res = window.confirm(
            message || (defaultValue ? 'OK?' : 'Are you sure?')
          );
          return res;
        },

        // skill check — roll dice equal to the hero's stat value
        doSkillCheck: async (_heroId, { stat, target = 4 } = {}) => {
          const statVal = Math.max(1, getStat(stat) || 1);
          const label = `${stat} ${target}+ test (${statVal}d6) — ${stat}: ${statVal} (target ${target}+)`;
          const rolls = await promptRoll(statVal, 6, label);
          const arr = Array.isArray(rolls) ? rolls : [rolls];
          return arr.some((r) => r >= target);
        },
      };

      const res = await performGamblingHallService(
        svc.id || svc.name,
        {},
        ghCtx
      );

      applyActions(res?.actions);
      if (res?.log?.length) console.log(res.log.join('\n'));
      setServiceUi(
        res?.ui || {
          title: svc.name,
          description: Array.isArray(svc?.rules?.text)
            ? svc.rules.text
            : [],
          outcome: Array.isArray(res?.log)
            ? res.log
            : ['Performed.'],
        }
      );
      setState(loadTownState());
      return;
    }

    // ---------- Sheriff's Office ----------
    if (shopId === 'sheriffsOffice') {
      const getStatSheriff = (h, statName) => {
        try {
          const totals = window.__sobTotals?.(h);
          const fromTotals =
            totals?.[statName] ?? totals?.stats?.[statName];
          if (Number.isFinite(fromTotals)) return fromTotals;
        } catch {}
        const byFlat = h?.[statName];
        if (Number.isFinite(byFlat)) return byFlat;
        const byStats = h?.stats?.[statName];
        if (Number.isFinite(byStats)) return byStats;
        if (typeof byFlat === 'string') {
          const m = byFlat.match(/\d+/);
          if (m) return Number(m[0]);
        }
        if (typeof byStats === 'string') {
          const m = byStats.match(/\d+/);
          if (m) return Number(m[0]);
        }
        return NaN;
      };

      const res = await performSheriffsOfficeService({
        hero,
        svc,
        ui: uiApi,
        posseApi,
        getStat: getStatSheriff,
      });
      applyActions(res?.actions);
      if (res?.log?.length) console.log(res.log.join('\n'));
      setServiceUi(
        res?.ui || { title: svc.name, outcome: ['Performed.'] }
      );
      setState(loadTownState());
      return;
    }

    // ---------- Generic fallback ----------
    if (svc.resultTable) {
      setServiceUi({
        title: svc.name,
        description: Array.isArray(svc.rules?.text)
          ? svc.rules.text
          : [],
        outcome: ['Performed. Consult the result table below.'],
      });
    } else {
      setServiceUi({
        title: svc.name,
        description: Array.isArray(svc.rules?.text)
          ? svc.rules.text
          : [],
        outcome: ['Performed.'],
      });
    }
  };

  // ------- Buy (items/tokens/injections) -------
  const canAfford = (cost = {}) => {
    if (typeof cost === 'number') return (hero.gold ?? 0) >= cost;
    if (!cost || typeof cost !== 'object') return true;
    return (
      (hero.gold ?? 0) >= (cost.gold ?? 0) &&
      (hero.darkStone ?? 0) >= (cost.darkStone ?? 0) &&
      (hero.scrap ?? 0) >= (cost.scrap ?? 0) &&
      (hero.tech ?? 0) >= (cost.tech ?? 0)
    );
  };

  const isTransportItem = (item) =>
    item?.transport?.type ||
    (Array.isArray(item?.tags) &&
      item.tags.includes('Transport'));
  const isStageCoach = (item) =>
    item?.transport?.type === 'StageCoach' ||
    (Array.isArray(item?.tags) &&
      item.tags.includes('Stage Coach'));
  const posseHasStageCoach = (ps) =>
    ps.some(
      (h) =>
        Array.isArray(h?.inventory) &&
        h.inventory.some((it) => isStageCoach(it))
    );
  const heroHasTransport = (h) =>
    Array.isArray(h?.inventory) &&
    h.inventory.some((it) => it?.transport?.type);

  const handleBuy = async (shopId, item, idx = 0) => {
    if (
      shopId === 'docsOffice' &&
      (item?.id === 'doc_treat_corruption' ||
        item?.id === 'doc_surgery')
    ) {
      await handlePerform(shopId, item, idx);
      return;
    }

    if (hero.chosenLocation !== shopId) return;
    if (!item) return;

    // Smuggler's Den — heroes without access may look but cannot buy
    if (shopId === 'smugglersDen' && hasKeyword(hero, 'Law')) {
      alert(
        'Law heroes may not buy from the Smuggler’s Den. You can look around, but cannot purchase anything here.'
      );
      return;
    }

    // Indian Trading Post — Tribal Tent gating
    if (shopId === 'indianTradingPost') {
      const restricted =
        Array.isArray(item?.keywords) &&
        item.keywords.some(
          (k) =>
            String(k).toLowerCase() === 'restricted:tribalorscout'
        );
      if (restricted && !canUseTribalTent(hero)) {
        alert(
          'Only Tribal or Scout heroes may purchase from the Tribal Tent.'
        );
        return;
      }
    }

    // Doc's Office purchases
    if (shopId === 'docsOffice') {
      const io = {
        pay: (amount, label) => promptPay(hero, amount, label),
        roll: promptRoll,
        promptNumber: (label, opts) =>
          promptNumber(label, opts),
        notify: (msg) => console.log('[Doc]', msg),
      };

      if (isInjection(item)) {
        const { actions, log } = await performInjectionPurchase({
          hero,
          item,
          townState: state,
          io,
        });
        applyActions(actions);
        if (log?.length) console.log(log.join('\n'));
        setState(loadTownState());
        return;
      }

      const { actions, log } = await performDocItemPurchase({
        hero,
        item,
        io,
      });
      applyActions(actions);
      if (log?.length) console.log(log.join('\n'));
      setState(loadTownState());
      return;
    }

    // Rituals attempted via “Buy” -> route to Perform
    if (
      isRitualService(item) ||
      isBanishCorruptionService(item) ||
      isResurrectionService(item)
    ) {
      await handlePerform(shopId, item, idx);
      return;
    }

    // Restrictions — class gate via allowedClasses
    if (item?.restrictions?.allowedClasses) {
      const allowed = item.restrictions.allowedClasses.map(String);
      const heroClass = String(
        hero?.heroClass || hero?.class || hero?.name || ''
      );
      if (!allowed.includes(heroClass)) {
        alert(`Only ${allowed.join('/')} may purchase this.`);
        return;
      }
    }

    // One Mount per hero
    const isMount =
      item?.slot === 'Mount' ||
      (Array.isArray(item?.tags) &&
        item.tags.includes('Mount')) ||
      item?.transport?.type === 'Horse';
    const heroHasMount =
      Array.isArray(hero?.inventory) &&
      hero.inventory.some(
        (it) =>
          isMount &&
          (it?.slot === 'Mount' ||
            it?.tags?.includes('Mount'))
      );
    if (isMount && heroHasMount) {
      alert(
        'You already have a Mount. A hero can only own one Mount at a time.'
      );
      return;
    }

    const itemId = getItemId(item, idx);
    let costObj = normalizeCostObject(getCost(item));

    // Smuggler's Den — Black Market pricing (for tagged Black Market goods)
    if (openLocationId === 'smugglersDen') {
      const isBlackMarket =
        Array.isArray(item?.tags) &&
        item.tags.some((t) =>
          /black\s*market/i.test(String(t))
        );
      if (isBlackMarket) {
        const raw = window.prompt(
          'Black Market price die (D6)? Enter 1–6 or blank for auto-roll:',
          ''
        );
        const die = (() => {
          const n = Math.floor(Number(raw));
          if (!Number.isFinite(n) || n < 1 || n > 6)
            return Math.floor(Math.random() * 6) + 1;
          return n;
        })();
        const surcharge = die * 25;
        const goldBase = Number(costObj?.gold || 0);
        costObj = {
          ...(costObj || {}),
          gold: goldBase + surcharge,
        };
      }
    }

    if (!canAfford(costObj)) {
      alert('Cannot afford.');
      return;
    }

    // --- Transport limits ---
    if (isTransportItem(item)) {
      if (isStageCoach(item)) {
        if (posseHasStageCoach(posse)) {
          alert(
            'Your posse already owns a Stage Coach (limit 1 per posse).'
          );
          return;
        }
      } else {
        if (heroHasTransport(hero)) {
          alert(
            'You already own a Transport. A hero can only own one Transport at a time.'
          );
          return;
        }
      }
    }

    // Weight guard for regular gear (token buys have no weight)
    if (
      !isTokenPurchase(item) &&
      willExceedCarryLikeGearTab(hero, item)
    ) {
      const cap = getCarryCapacityLikeGearTab(hero);
      const cur = getTotalLoad(hero);
      const w = getItemWeight(item);
      alert(
        `Too heavy to carry. Capacity ${cur}/${cap}. Item weighs ${w}. Make room first.`
      );
      return;
    }

    // Token purchases
    if (isTokenPurchase(item)) {
      const perVisitLimit =
        item.purchaseLimitPerVisit ||
        item?.rules?.purchaseLimitPerVisit ||
        null;
      if (perVisitLimit) {
        const used = getVisitCount(itemId);
        if (used >= perVisitLimit) {
          alert(
            'You are at the per-visit limit for this token.'
          );
          return;
        }
      }

      const grant =
        item.grantsToken || {
          type: item.name,
          amount: 1,
        };
      const amount = Number(grant.amount || 1);
      const type = String(
        grant.type || item.name || 'Token'
      );

      const gold =
        (hero.gold ?? 0) - (costObj.gold ?? 0);
      const darkStone =
        (hero.darkStone ?? 0) -
        (costObj.darkStone ?? 0);
      const scrap =
        (hero.scrap ?? 0) - (costObj.scrap ?? 0);
      const tech =
        (hero.tech ?? 0) - (costObj.tech ?? 0);

      const sideBag = nextSideBag(hero, type, amount);
      updateHero({
        id: hero.id || hero.localId,
        gold,
        darkStone,
        scrap,
        tech,
        sideBag,
      });

      incVisitCount(itemId);
      return;
    }

    // Regular gear purchase
    const gold =
      (hero.gold ?? 0) - (costObj.gold ?? 0);
    const darkStone =
      (hero.darkStone ?? 0) -
      (costObj.darkStone ?? 0);
    const scrap =
      (hero.scrap ?? 0) -
      (costObj.scrap ?? 0);
    const tech =
      (hero.tech ?? 0) -
      (costObj.tech ?? 0);

    const inventory = Array.isArray(hero.inventory)
      ? [...hero.inventory]
      : [];
    inventory.push({ ...item, id: itemId });

    updateHero({
      id: hero.id || hero.localId,
      gold,
      darkStone,
      scrap,
      tech,
      inventory,
    });
  };

  // ---------- rare find helpers ----------
  const readRareFind = (shopId) => {
    const s = state || loadTownState();
    return s?.shopMods?.[shopId]?.rareFind || null;
  };
  const clearRareFind = (shopId) => {
    const s = loadTownState();
    const cur = s.shopMods?.[shopId] || {};
    const next = { ...cur };
    delete next.rareFind;
    s.shopMods = {
      ...(s.shopMods || {}),
      [shopId]: next,
    };
    saveTownState(s);
    setState(loadTownState());
  };
  const handleBuyRareFind = (shopId) => {
    if (hero.chosenLocation !== shopId) {
      alert('Visit this location first.');
      return;
    }
    const rf = readRareFind(shopId);
    if (!rf || !rf.artifact) return;

    const priceDS = Number(rf.priceDS || 0);
    const dsOnHero = Number(hero.darkStone ?? 0);
    if (dsOnHero < priceDS) {
      alert(`Not enough Dark Stone (need ${priceDS}).`);
      return;
    }

    if (
      willExceedCarryLikeGearTab(hero, rf.artifact)
    ) {
      const cap = getCarryCapacityLikeGearTab(hero);
      const cur = getTotalLoad(hero);
      const w = getItemWeight(rf.artifact);
      alert(
        `Too heavy to carry. Capacity ${cur}/${cap}. Artifact weighs ${w}. Make room first.`
      );
      return;
    }

    const inventory = Array.isArray(hero.inventory)
      ? [...hero.inventory]
      : [];
    const added = { ...rf.artifact };
    if (!added.id)
      added.id = `artifact_${Date.now()}`;
    inventory.push(added);

    const darkStone = dsOnHero - priceDS;
    updateHero({
      id: hero.id || hero.localId,
      darkStone,
      inventory,
    });

    clearRareFind(shopId);
    alert(
      `Purchased Artifact: ${rf.artifact.name} for ${priceDS} Dark Stone.`
    );
  };

  // allowed shops by lodging (Camp limitation only — Smuggler's Den always visible)
  const allowedShops = Object.entries(shopDataById).filter(([id]) =>
    hero.lodging === 'Camp' ? CAMP_SHOPS.includes(id) : true
  );

  // derive subshop + categories
  const shop = openLocationId
    ? shopDataById[openLocationId]
    : null;
  const subshops =
    shop && Array.isArray(shop.shops)
      ? shop.shops
      : null;
  const activeSubshop =
    subshops?.find((s) => s.id === openSubshopId) ||
    (subshops ? subshops[0] : null);

  const shopForCategories = activeSubshop
    ? activeSubshop.id
      ? activeSubshop
      : { ...activeSubshop, id: openLocationId }
    : shop
    ? shop.id
      ? shop
      : { ...shop, id: openLocationId }
    : null;
  const categories = buildCategoriesForShop(
    shopForCategories,
    tabsByShop
  );
  const activeCat =
    categories.find((c) => c.id === openSubcatId) ||
    categories[0];
  const entries = activeCat?.entries || [];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">
        Town Visit
      </h2>
      <p className="italic text-sm mb-2">
        {hero.name
          ? `Welcome, ${hero.name}. `
          : null}
        Staying at:{' '}
        <strong>
          {hero.lodging || 'Undecided'}
        </strong>
        {hero.gold !== undefined && (
          <span> | Gold: ${hero.gold}</span>
        )}
        {hero.darkStone !== undefined && (
          <span>
            {' '}
            | Dark Stone: {hero.darkStone}
          </span>
        )}
        {hero.scrap !== undefined && (
          <span> | Scrap: {hero.scrap}</span>
        )}
        {hero.tech !== undefined && (
          <span> | Tech: {hero.tech}</span>
        )}
        {(hero.currentGrit != null ||
          hero.grit != null ||
          hero.stats?.Grit != null) && (
          <span>
            {' '}
            | Grit:{' '}
            {hero.currentGrit ??
              hero.grit ??
              hero.stats?.Grit ??
              hero.derived?.Grit ??
              0}
          </span>
        )}
        {(hero.unwantedAttention != null ||
          hero.unwanted != null) && (
          <span>
            {' '}
            | Unwanted:{' '}
            {hero.unwantedAttention ??
              hero.unwanted}
          </span>
        )}
      </p>

      {/* Lodging selection */}
      {!hero.lodging && (
        <div className="border p-3 rounded bg-yellow-50 shadow mb-3">
          <h3 className="font-bold mb-2">
            Choose Lodging for the Day
          </h3>
          <p className="text-sm mb-2">
            <b>Hotel</b>: Visit any Town
            location.
            <br />
            <b>Camp</b>: Next day you’re
            limited to the Camp Site, but
            you’ll roll Camp Events.
          </p>
          <div className="flex gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                const id =
                  hero.id || hero.localId;
                if (!id) return;
                updateHero({
                  id,
                  lodging: 'Hotel',
                });
              }}
            >
              Stay at Hotel
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                const id =
                  hero.id || hero.localId;
                if (!id) return;
                updateHero({
                  id,
                  lodging: 'Camp',
                });
              }}
            >
              Camp Outside
            </button>
          </div>
        </div>
      )}

      {/* Locations */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {allowedShops.map(([sid, s]) => {
          const isVisited = hero.chosenLocation === sid;
          const isSmugglers = sid === 'smugglersDen';
          const lawWarning = isSmugglers && hasKeyword(hero, 'Law');
          const isDestroyed = isLocationDestroyed(sid);

          return (
            <button
              key={sid}
              className={`btn justify-between ${
                isDestroyed
                  ? 'btn-outline opacity-50 line-through'
                  : isVisited
                  ? 'btn-success'
                  : lawWarning
                  ? 'btn-outline border-red-400 text-red-700'
                  : 'btn-outline'
              }`}
              onClick={() => handleOpenLocation(sid)}
              title={
                isDestroyed
                  ? 'This location is destroyed and cannot be visited this town stay.'
                  : lawWarning
                  ? 'Law heroes are not welcome here. You may look around, but cannot buy anything or use services.'
                  : ''
              }
            >
              <span>{s.name}</span>
              {isDestroyed && (
                <span className="ml-2 text-xs text-red-600">
                  (Closed)
                </span>
              )}
              {isVisited && !isDestroyed && (
                <span className="ml-2 text-xs">
                  (Visited)
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Location panel */}
      {openLocationId && (
        <div className="border rounded p-3 bg-white shadow">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-lg">
                {safeText(
                  shop?.name,
                  'Location'
                )}
              </h3>

              {hero.chosenLocation ===
                openLocationId && (
                <span className="text-green-600 text-sm">
                  (Chosen)
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-secondary"
                onClick={handleCloseLocation}
              >
                Close
              </button>
              {!hero.chosenLocation && (
                <button
                  className="btn btn-primary"
                  disabled={!canVisit}
                  onClick={() =>
                    handleVisit(
                      openLocationId
                    )
                  }
                >
                  Visit
                </button>
              )}
            </div>
          </div>

          {/* Description / rules */}
          {shop?.description && (
            <p className="italic text-sm mb-2 mt-2">
              {shop.description}
            </p>
          )}
          {Array.isArray(shop?.rules) &&
            shop.rules.length > 0 && (
              <ul className="list-disc list-inside mb-2">
                {shop.rules.map(
                  (rule, idx) => (
                    <li
                      key={idx}
                      className="text-sm"
                    >
                      {rule}
                    </li>
                  )
                )}
              </ul>
            )}

                           {/* Event Card */}
                   <TownEventCard
            key={`${openLocationId}-${eventNonce}`}
            shopId={openLocationId}
            onSetRoll={(n) => {
              setLocEventRoll(openLocationId, n);
              setState(loadTownState());
              window.dispatchEvent(new Event('sobTownStateChanged'));
              setEventNonce((x) => x + 1);
            }}
            onResolve={async () => {
              const ctx = makeLocEventCtx({
                posseApi,
                uiApi,
                townStateApi, // ✅ passes everything your event engine needs
              });
              const payload = await resolveLocEvent(openLocationId, ctx);
              await applyEventActions(payload);
              setState(loadTownState());
            }}
          />




          {/* Service result card (rules + outcome) */}
          {serviceUi && (
            <div className="mt-3 border rounded bg-amber-50 p-3">
              <div className="font-bold text-sm mb-1">
                {serviceUi.title}
              </div>

              {Array.isArray(
                serviceUi.description
              ) &&
                serviceUi.description.length >
                  0 && (
                  <ul className="list-disc list-inside text-xs text-gray-800 mb-2">
                    {serviceUi.description.map(
                      (t, i) => (
                        <li
                          key={`desc_${i}`}
                          dangerouslySetInnerHTML={{
                            __html: t,
                          }}
                        />
                      )
                    )}
                  </ul>
                )}

              {Array.isArray(
                serviceUi.outcome
              ) &&
                serviceUi.outcome.length >
                  0 && (
                  <>
                    <div className="font-semibold text-xs mt-1 mb-1">
                      Outcome
                    </div>
                    <ul className="list-disc list-inside text-xs text-gray-900">
                      {serviceUi.outcome.map(
                        (t, i) => (
                          <li
                            key={`out_${i}`}
                            dangerouslySetInnerHTML={{
                              __html: t,
                            }}
                          />
                        )
                      )}
                    </ul>
                  </>
                )}
            </div>
          )}

          {/* Subshops */}
          {Array.isArray(subshops) &&
            subshops.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {subshops.map((s) => (
                  <button
                    key={s.id}
                    className={`btn btn-sm ${
                      openSubshopId === s.id
                        ? 'btn-primary'
                        : 'btn-outline'
                    }`}
                    onClick={() => {
                      setOpenSubshopId(
                        s.id
                      );
                      setOpenSubcatId(null);
                    }}
                  >
                    {safeText(
                      s.name,
                      s.id
                    )}
                  </button>
                ))}
              </div>
            )}

          {/* Categories */}
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((cat) => {
              const outlawCat =
                openLocationId ===
                  'smugglersDen' &&
                cat.id === 'outlaw';
              const heroIsOutlaw =
                hasKeyword(hero, 'Outlaw');
              const catDisabled =
                outlawCat && !heroIsOutlaw;
              const label = safeText(
                cat.label ||
                  labelForCategory(cat.id),
                cat.id
              );
              return (
                <button
                  key={cat.id}
                  className={`btn btn-sm ${
                    activeCat.id === cat.id
                      ? 'btn-primary'
                      : 'btn-outline'
                  } ${
                    catDisabled
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  onClick={() => {
                    if (!catDisabled)
                      setOpenSubcatId(
                        cat.id
                      );
                  }}
                  title={
                    catDisabled
                      ? 'Outlaw only.'
                      : ''
                  }
                  disabled={catDisabled}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Entries grid */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            {entries.length === 0 && (
              <div className="text-sm text-gray-500">
                No entries in this
                category.
              </div>
            )}

            {(openLocationId ===
            'indianTradingPost'
              ? entries.map((it) =>
                  normalizeINDIAN_TP_Item(
                    it
                  )
                )
              : entries
            ).map((item, idx) => {
              if (!item) return null;

              const isSmugs =
                openLocationId ===
                'smugglersDen';
              const heroIsLaw =
                hasKeyword(hero, 'Law');
              const heroIsOutlaw =
                hasKeyword(hero, 'Outlaw');

              const outlawTagged =
                (Array.isArray(item?.tags) &&
                  item.tags.some((t) =>
                    /outlaw\s*only/i.test(
                      String(t)
                    )
                  )) ||
                !!item?.restrictions
                  ?.outlawOnly;

              const gatedByLaw =
                isSmugs && heroIsLaw;
              const gatedOutlaw =
                isSmugs &&
                outlawTagged &&
                !heroIsOutlaw;

              const costRaw = getCost(item);
              const costObj =
                typeof costRaw ===
                  'number' ||
                (costRaw &&
                  typeof costRaw ===
                    'object')
                  ? typeof costRaw ===
                    'number'
                    ? { gold: costRaw }
                    : costRaw
                  : null;

              const isDocMedical =
                item?.id === 'doc_surgery' ||
                item?.id ===
                  'doc_treat_corruption';

              let looksService =
                String(item?.type || '')
                  .toLowerCase() ===
                  'service' ||
                (Array.isArray(item?.tags) &&
                  item.tags
                    .map(String)
                    .includes('Service')) ||
                isDocMedical ||
                isInjection(item) ||
                (!isTokenPurchase(item) &&
                  !item.slot &&
                  !(
                    item.type &&
                    String(
                      item.type
                    )
                      .toLowerCase()
                      .includes('gear')
                  ) &&
                  !item.value &&
                  (isRitualService(item) ||
                    isBanishCorruptionService(
                      item
                    ) ||
                    (typeof item.cost !==
                      'number' &&
                      (typeof item.cost !==
                        'object' ||
                        item.cost ===
                          null)) ||
                    'resultTable' in item ||
                    'requirement' in item ||
                    String(
                      item?.name || ''
                    )
                      .toLowerCase()
                      .includes(
                        'surgery'
                      )));

              const afford = costObj
                ? canAfford(costObj)
                : true;
              const canBuy =
                hero.chosenLocation ===
                  openLocationId &&
                afford &&
                !gatedByLaw &&
                !gatedOutlaw;

              const idForCount = getItemId(
                item,
                idx
              );
              const perVisitLimit =
                item.purchaseLimitPerVisit ||
                item?.rules
                  ?.purchaseLimitPerVisit ||
                null;
              const usedCount =
                isTokenPurchase(item)
                  ? getVisitCount(
                      idForCount
                    ) || 0
                  : 0;
              const atLimit =
                isTokenPurchase(item) &&
                perVisitLimit &&
                usedCount >=
                  perVisitLimit;

              const hands =
                deriveHandsRequired(item);
              const weight = Number(
                item?.weight || 0
              );
              const dsCost =
                typeof costObj === 'object'
                  ? Number(
                      costObj?.darkStone ||
                        0
                    )
                  : 0;

              // Dark Stone contained vs cost
              let dsCarry = Number(
                item?.grantsCurrency?.darkStone ||
                  item?.carries?.darkStone ||
                  0
              );
              if (!dsCarry && item?.darkStone === true) {
                dsCarry = 1;
              }
              const dsShown =
                dsCarry > 0
                  ? dsCarry
                  : dsCost > 0
                  ? dsCost
                  : 0;

              // Decide which action is primary
              const showBuyPrimary =
                !(
                  String(item?.type || '')
                    .toLowerCase() ===
                  'service'
                ) &&
                (!looksService ||
                  isTokenPurchase(item) ||
                  !!item.slot ||
                  String(
                    item?.type || ''
                  )
                    .toLowerCase()
                    .includes('gear'));

              // Restrictions label for display
              const restrictionsLabel = (() => {
                const lines = [];

                if (
                  Array.isArray(
                    item.restrictions
                  )
                ) {
                  lines.push(
                    item.restrictions.join(
                      ' | '
                    )
                  );
                } else if (
                  item.restrictions &&
                  typeof item.restrictions ===
                    'object'
                ) {
                  if (
                    Array.isArray(
                      item.restrictions
                        .allowedClasses
                    )
                  ) {
                    lines.push(
                      `Only ${item.restrictions.allowedClasses.join(
                        '/'
                      )}`
                    );
                  }
                  if (
                    item.restrictions
                      .outlawOnly
                  ) {
                    lines.push(
                      'Outlaw Only'
                    );
                  }
                  if (
                    item.restrictions
                      .note
                  ) {
                    lines.push(
                      String(
                        item
                          .restrictions
                          .note
                      )
                    );
                  }
                }

                if (
                  Array.isArray(item.tags)
                ) {
                  const tagText = [];
                  if (
                    item.tags.includes(
                      'PerformerOnly'
                    ) &&
                    item.tags.includes(
                      'ShowmanOnly'
                    )
                  ) {
                    tagText.push(
                      'Performer/Showman Only'
                    );
                  } else if (
                    item.tags.includes(
                      'PerformerOnly'
                    )
                  ) {
                    tagText.push(
                      'Performer Only'
                    );
                  } else if (
                    item.tags.includes(
                      'ShowmanOnly'
                    )
                  ) {
                    tagText.push(
                      'Showman Only'
                    );
                  }
                  if (
                    item.tags.includes(
                      'NoHoly'
                    )
                  ) {
                    tagText.push(
                      'No Holy Heroes'
                    );
                  }
                  if (
                    item.tags.includes(
                      'NoTribal'
                    )
                  ) {
                    tagText.push(
                      'No Tribal Heroes'
                    );
                  }
                  if (tagText.length) {
                    lines.push(tagText.join(' | '));
                  }
                }

                return lines.length
                  ? lines.join(' | ')
                  : null;
              })();

              return (
                <div
                  key={item.id || idx}
                  className="border p-2 rounded shadow-sm"
                >
                  {/* Header */}
                  <div className="font-bold flex items-center justify-between gap-2">
                    <span>
                      {item.name}
                    </span>
                    {isTokenPurchase(item) &&
                      perVisitLimit !=
                        null && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            atLimit
                              ? 'bg-red-100 text-red-700 border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {usedCount}/
                          {
                            perVisitLimit
                          }{' '}
                          this visit
                        </span>
                      )}
                  </div>

                  {/* Cost */}
                  <div className="text-xs text-gray-600 mt-0.5">
                    Cost:{' '}
                    <b>
                      {formatCost(
                        costRaw
                      )}
                    </b>
                  </div>

                  {/* Stats icons row */}
                  <div className="mt-2 flex flex-wrap items-center gap-2 leading-none">
                    {typeof item.upgradeSlots ===
                      'number' && (
                      <IconRowComposite
                        map={ASSETS.slot}
                        count={
                          item.upgradeSlots
                        }
                        title={`Upgrade Slots: ${item.upgradeSlots}`}
                      />
                    )}
                    {weight > 0 && (
                      <IconRowRepeat
                        src={ASSETS.weight}
                        count={weight}
                        title={`Weight: ${weight}`}
                      />
                    )}
                    {dsShown > 0 && (
                      <IconRowRepeat
                        src={ASSETS.ds}
                        count={dsShown}
                        title={
                          dsCarry &&
                          dsCost
                            ? `Dark Stone: ${dsCarry} contained, ${dsCost} cost`
                            : dsCarry
                            ? `Dark Stone Contained: ${dsCarry}`
                            : `Dark Stone Cost: ${dsCost}`
                        }
                      />
                    )}
                    {hands > 0 && (
                      <IconRowComposite
                        map={ASSETS.hand}
                        count={hands}
                        title={`Hands Required: ${hands}`}
                      />
                    )}
                  </div>

                  {/* Tags */}
                  {Array.isArray(
                    item.tags
                  ) &&
                    item.tags.length > 0 && (
                      <div className="mt-1">
                        {item.tags.map(
                          (t, i) => (
                            <span
                              key={`tag_${i}`}
                              className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-gray-100 border text-gray-700 mr-1 mt-1"
                            >
                              {t}
                            </span>
                          )
                        )}
                      </div>
                    )}

                  {/* Effects / description */}
                  {Array.isArray(
                    item?.rules?.text
                  ) &&
                    item.rules.text.length >
                      0 && (
                      <div className="text-xs text-gray-800 mt-1 space-y-1">
                        {item.rules.text.map(
                          (line, i) => (
                            <p
                              key={`rt_${i}`}
                            >
                              {line}
                            </p>
                          )
                        )}
                      </div>
                    )}
                  {item?.rules?.description && (
                    <div className="text-xs text-gray-700 mt-1">
                      {
                        item.rules
                          .description
                      }
                    </div>
                  )}
                  {item?.note && (
                    <div className="text-[11px] text-gray-600 mt-1 italic">
                      {item.note}
                    </div>
                  )}
                  {item?.rules?.note && (
                    <div className="text-[11px] text-gray-600 mt-1 italic">
                      {item.rules.note}
                    </div>
                  )}
                  {item?.effects &&
                    Array.isArray(
                      item.effects
                    ) &&
                    item.effects.length >
                      0 && (
                      <ul className="text-xs list-disc list-inside mt-1 text-gray-800">
                        {item.effects.map(
                          (e, i) => (
                            <li
                              key={`eff_${i}`}
                            >
                              {typeof e ===
                              'string'
                                ? e
                                : JSON.stringify(
                                    e
                                  )}
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  {item?.effect && (
                    <div className="text-xs text-gray-700 mt-1">
                      {item.effect}
                    </div>
                  )}
                  {item?.description && (
                    <div className="text-xs text-gray-700 mt-1">
                      {item.description}
                    </div>
                  )}

                  {/* Result table preview for services */}
                  {!showBuyPrimary &&
                    item.resultTable && (
                      <details
                        className="mt-2"
                        open={
                          item?.rules
                            ?.showTableOpen
                        }
                      >
                        <summary className="text-xs cursor-pointer">
                          Result Table
                        </summary>
                        <div className="text-xs bg-gray-50 border rounded p-2 mt-1">
                          {Object.entries(
                            item.resultTable
                          ).map(
                            ([
                              roll,
                              out,
                            ]) => (
                              <div
                                key={
                                  roll
                                }
                              >
                                <b>
                                  {roll}:
                                </b>{' '}
                                {String(out)}
                              </div>
                            )
                          )}
                        </div>
                      </details>
                    )}

                  {/* Actions + restrictions line */}
                  <div className="mt-2 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {showBuyPrimary ? (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() =>
                            handleBuy(
                              openLocationId,
                              item,
                              idx
                            )
                          }
                          disabled={
                            !canBuy ||
                            (isTokenPurchase(
                              item
                            ) &&
                              atLimit)
                          }
                          title={
                            gatedByLaw
                              ? 'Law heroes may not use the Smuggler’s Den.'
                              : gatedOutlaw
                              ? 'Outlaw only.'
                              : !hero
                                  .chosenLocation
                              ? 'Visit this location first'
                              : !afford
                              ? 'Cannot afford'
                              : isTokenPurchase(
                                  item
                                ) &&
                                atLimit
                              ? 'At per-visit limit'
                              : ''
                          }
                        >
                          Buy
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-primary"
                          disabled={
                            hero.chosenLocation !==
                              openLocationId ||
                            gatedByLaw ||
                            gatedOutlaw
                          }
                          title={
                            gatedByLaw
                              ? 'Law heroes may not use the Smuggler’s Den.'
                              : gatedOutlaw
                              ? 'Outlaw only.'
                              : ''
                          }
                          onClick={() =>
                            handlePerform(
                              openLocationId,
                              item,
                              idx
                            )
                          }
                        >
                          Perform
                        </button>
                      )}

                      {restrictionsLabel && (
                        <span className="text-[10px] text-red-700 bg-red-50 border border-red-200 rounded px-2 py-0.5">
                          {restrictionsLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

         {/* Blacksmith Rare Find */}
          {openLocationId === 'blacksmith' && (
            <RareFindPanel
              shopId={openLocationId}
              readRareFind={readRareFind}
              hero={hero}
              onBuy={() =>
                handleBuyRareFind(openLocationId)
              }
            />
          )}

          {/* Frontier Outpost — Trading Post Artifact Offer */}
          {openLocationId === 'frontierOutpost' && (
            <FrontierOutpostArtifactOfferPanel
              townStateApi={townStateApi}
              posseApi={posseApi}
              uiApi={uiApi}
            />
          )}

          {(openLocationId === 'smugglersDen' ||
            openLocationId === 'frontierOutpost') && (
            <BlackMarketPanel
              shopId={openLocationId}
              hero={hero}
              computePrice={(it, s) =>
                priceForBlackMarketItem(it, s)
              }
              onBuy={(it, total) =>
                handleBuyBlackMarketItem(
                  openLocationId,
                  it,
                  total
                )
              }
            />
          )}

        </div>
      )}
    </div>
  );

  // --- Black Market panel buy helper ---
  function handleBuyBlackMarketItem(shopId, item, totalCost) {
    if (!hero || hero.chosenLocation !== shopId) {
      alert('Visit this location first.');
      return;
    }

    // Smuggler's Den: Law heroes may look but cannot buy
    if (shopId === 'smugglersDen' && hasKeyword(hero, 'Law')) {
      alert(
        'Law heroes may not buy from the Smuggler’s Den. You can look around, but cannot purchase anything here.'
      );
      return;
    }

    if ((hero.gold ?? 0) < totalCost) {
      alert('Cannot afford.');
      return;
    }

    const inventory = Array.isArray(hero.inventory)
      ? [...hero.inventory]
      : [];
    const added = { ...item };

    // Strip runtime/market-only flags
    delete added.forSaleAtSmugglers;
    delete added.shop;
    delete added.remainsInPool;
    delete added.drawnFor;
    delete added._source;
    delete added.soldOut;

    if (!added.id) added.id = `loot_${Date.now()}`;
    inventory.push(added);

    const newGold = (hero.gold ?? 0) - totalCost;
    const hid = hero.id || hero.localId;
    updateHero({
      id: hid,
      gold: newGold,
      inventory,
    });

    // Mark that instance as SOLD OUT in the shared lootPool
    const s = loadTownState() || {};
    const idx = (s.lootPool || []).findIndex((x) => x.id === item.id);
    if (idx >= 0) {
      s.lootPool[idx] = {
        ...s.lootPool[idx],
        soldOut: true,
      };
    }
    saveTownState(s);

    setState(loadTownState());
    alert(`Purchased: ${item.name} for $${totalCost}.`);
  }
}
