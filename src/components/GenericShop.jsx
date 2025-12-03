import React, { useMemo, useState, useEffect } from 'react';
import { tabsByShop, makeTabsByShop } from '../data/townLocations/tabsByShop.js';
import { shopDataById } from '../data/shopDataByID';

// Events + shop mods
import {
  loadTownState,
  applyShopPriceMods,
  isLocationDestroyed,
} from '../utils/townState';
import {
  ensureEventRolled,
  resolveEvent,
  getEventState as getLocEventState,
} from '../utils/locationEventsEngine';
import { makeLocEventCtx } from '../utils/locationEventContext';
import { getEventDisplay } from '../utils/locationEventText';

// ---------- small helpers ----------
const toLabel = (raw) => {
  if (!raw) return 'Category';
  const map = {
    items: 'Shop Items',
    services: 'Services',
    saloonGirlOnly: 'Saloon Girl Only',
    lawHeroesOnly: 'Law Heroes Only',
    outlaw: 'Outlaw',
    backAlleys: 'Back Alleys',
  };
  if (map[raw]) return map[raw];
  return String(raw)
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, s => s.toUpperCase());
};

// items vs services
const isItem = (obj) => {
  if (!obj || typeof obj !== 'object') return false;
  if (obj.type === 'Service') return false;
  if ('slot' in obj || 'value' in obj) return true;
  if ('mods' in obj) return true;
  if (obj?.category === 'TokenPurchase' || obj?.grantsToken) return true;
  if ('cost' in obj && 'name' in obj && 'effect' in obj) return true;
  return false;
};
const isService = (obj) => obj?.type === 'Service' || !isItem(obj);
const isTokenPurchase = (item) =>
  item?.category === 'TokenPurchase' || !!item?.grantsToken;

const getItemId = (item, idx) => item?.id || item?.name || `item_${idx}`;
const norm = (s) => (s ?? '').toString().trim().toLowerCase();
const hasKeyword = (hero, key) => {
  if (!hero) return false;
  const kws = Array.isArray(hero?.keywords) ? hero.keywords.map(norm) : [];
  return kws.includes(norm(key));
};

// reqs
const meetsRequirements = (hero, obj, shopRequires = null) => {
  const convenienceReq = {};
  if (obj?.outlawOnly) convenienceReq.hasKeywordAnyOf = [...(convenienceReq.hasKeywordAnyOf || []), 'Outlaw'];
  if (obj?.lawOnly) convenienceReq.hasKeywordAnyOf = [...(convenienceReq.hasKeywordAnyOf || []), 'Law'];
  if (obj?.notOutlawOnly) convenienceReq.hasKeywordNoneOf = [...(convenienceReq.hasKeywordNoneOf || []), 'Outlaw'];

  const req = { ...(shopRequires || {}), ...(obj?.requires || {}), ...convenienceReq };
  if (!req || Object.keys(req).length === 0) return true;

  const heroClass = norm(hero?.class || hero?.heroClass || hero?.nameClass);
  const heroKeywords = Array.isArray(hero?.keywords) ? hero.keywords.map(norm) : [];
  const heroStatuses = Array.isArray(hero?.statuses) ? hero.statuses.map(norm) : [];

  if (Array.isArray(req.heroClassAnyOf) && req.heroClassAnyOf.length) {
    if (!req.heroClassAnyOf.some(c => norm(c) === heroClass)) return false;
  }
  if (Array.isArray(req.notHeroClassAnyOf) && req.notHeroClassAnyOf.length) {
    if (req.notHeroClassAnyOf.some(c => norm(c) === heroClass)) return false;
  }
  if (Array.isArray(req.hasKeywordAnyOf) && req.hasKeywordAnyOf.length) {
    if (!req.hasKeywordAnyOf.some(k => heroKeywords.includes(norm(k)))) return false;
  }
  if (Array.isArray(req.hasKeywordNoneOf) && req.hasKeywordNoneOf.length) {
    if (req.hasKeywordNoneOf.some(k => heroKeywords.includes(norm(k)))) return false;
  }
  if (Array.isArray(req.hasStatusAnyOf) && req.hasStatusAnyOf.length) {
    if (!req.hasStatusAnyOf.some(s => heroStatuses.includes(norm(s)))) return false;
  }
  if (Array.isArray(req.hasStatusNoneOf) && req.hasStatusNoneOf.length) {
    if (req.hasStatusNoneOf.some(s => heroStatuses.includes(norm(s)))) return false;
  }
  return true;
};

// cost normalization
const normalizeCost = (item) => {
  const raw = item?.cost ?? item?.value ?? 0;
  const cost = { gold: 0, darkStone: 0, scrap: 0, tech: 0 };
  if (typeof raw === 'number') {
    cost.gold = raw;
  } else if (raw && typeof raw === 'object') {
    cost.gold = raw.gold ?? 0;
    cost.darkStone = raw.darkStone ?? 0;
    cost.scrap = raw.scrap ?? 0;
    cost.tech = raw.tech ?? 0;
  }
  if (typeof item?.dsCost === 'number') cost.darkStone += item.dsCost;
  if (typeof item?.darkStoneCost === 'number') cost.darkStone += item.darkStoneCost;
  return cost;
};
const costTextOf = (cost) =>
  [
    cost.gold ? `$${Number(cost.gold)}` : null,
    cost.darkStone ? `${cost.darkStone} Dark Stone` : null,
    cost.scrap ? `${cost.scrap} Scrap` : null,
    cost.tech ? `${cost.tech} Tech` : null,
  ].filter(Boolean).join(', ');

// -- service cost helpers (for "each" display) --
const formatCurrencyParts = (c) => {
  if (!c || typeof c !== 'object') return '';
  const parts = [];
  if (c.gold) parts.push(`$${Number(c.gold)}`);
  if (c.darkStone) parts.push(`${Number(c.darkStone)} Dark Stone`);
  if (c.scrap) parts.push(`${Number(c.scrap)} Scrap`);
  if (c.tech) parts.push(`${Number(c.tech)} Tech`);
  return parts.join(', ');
};

const formatServiceCost = (svc) => {
  const raw = svc?.cost;

  // Dice/range strings like "D6 × $50"
  if (typeof raw === 'string') return raw;

  // Numeric or object currencies
  const base =
    typeof raw === 'number'
      ? `$${raw}`
      : formatCurrencyParts(raw) || '—';

  // Append "each" if service charges per unit
  const hasEach = !!svc?.rules?.pricePerPoint || svc?.each === true;
  return hasEach ? `${base} each` : base;
};

// ---------- UI atoms ----------
const Chip = ({ children }) => (
  <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-gray-100 border text-gray-700 mr-1 mt-1">
    {children}
  </span>
);

const EffectBlock = ({ effect, effects }) => {
  const list = Array.isArray(effects) ? effects : (effect ? [effect] : []);
  if (!list.length) return null;
  return (
    <ul className="text-xs text-gray-800 mt-2 list-disc list-inside space-y-1">
      {list.map((line, i) => <li key={i}>{line}</li>)}
    </ul>
  );
};

// ---------- Location Event panel ----------
const LocationEventPanel = ({ shopKey, posseApi, uiApi, onAfterResolve }) => {
  const [rolled, setRolled] = useState(null);
  const [display, setDisplay] = useState(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    const { result } = ensureEventRolled(shopKey);
    setRolled(result);
    setDisplay(getEventDisplay(shopKey, result?.roll || 0));
  }, [shopKey]);

  const evState = getLocEventState(shopKey);
  const resolved = !!evState?.resolved;

  const onResolve = async () => {
    setResolving(true);
    try {
      const ctx = makeLocEventCtx({ posseApi: posseApi || {}, uiApi: uiApi || {} });
      await resolveEvent(shopKey, ctx);
      onAfterResolve?.();
    } finally {
      setResolving(false);
    }
  };

  if (!rolled) return null;

  return (
    <div className="border rounded-xl p-3 bg-indigo-50/60 border-indigo-200">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-500">Roll: {rolled.roll}</div>
          <div className="text-base font-semibold mt-0.5">
            {display?.title || 'Location Event'}
          </div>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${resolved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
          {resolved ? 'Resolved' : 'Pending'}
        </span>
      </div>

      {display?.lore && <div className="text-xs italic text-gray-700 mt-1">{display.lore}</div>}
      {display?.effect && (
        <div className="text-xs text-gray-900 mt-1">
          <span className="font-semibold">Effect:</span> {display.effect}
        </div>
      )}

      {!resolved && (
        <div className="mt-2">
          <button
            className="btn btn-xs btn-primary"
            onClick={onResolve}
            disabled={resolving}
          >
            {resolving ? 'Applying…' : 'Resolve'}
          </button>
        </div>
      )}
    </div>
  );
};

// ---------- Cards ----------
const ItemCard = ({ item, disabled, visitPurchasesCount = 0, onBuy, adjustGold }) => {
  const baseCost = useMemo(() => normalizeCost(item), [item]);
  const cost = useMemo(() => {
    const gold = typeof adjustGold === 'function' ? adjustGold(baseCost.gold) : baseCost.gold;
    return { ...baseCost, gold };
  }, [baseCost, adjustGold]);
  const costText = costTextOf(cost);

  const slot = item?.slot;
  const tags = Array.isArray(item?.tags) ? item.tags : [];
  const limit = item?.purchaseLimitPerVisit || item?.rules?.purchaseLimitPerVisit || null;
  const atLimit = !!limit && visitPurchasesCount >= limit;
  const btnDisabled = disabled || atLimit;

  const weight = item?.weight;
  const up = item?.upgradeSlots ?? item?.upgradeslots;
  const twoH = item?.twoHanded === true;
  const range = item?.range;
  const shots = item?.shots;
  const dsContain = item?.containsDarkStone ?? item?.containsDS;
  const isDS = !!item?.darkStone;

  return (
    <div className="border rounded p-3 bg-white shadow-sm">
      {/* Title & limit */}
      <div className="flex items-start justify-between gap-2">
        <div className="font-semibold">{item?.name || 'Item'}</div>
        {limit ? (
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${atLimit ? 'bg-red-100 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'} border`}>
            {visitPurchasesCount}/{limit} this visit
          </span>
        ) : null}
      </div>

      {/* Lore / description */}
      {item?.lore && <div className="text-xs italic text-gray-700 mt-1">{item.lore}</div>}
      {item?.description && <div className="text-xs italic text-emerald-700 mt-1">{item.description}</div>}

      {/* Main effects only */}
      <EffectBlock effect={item?.effect} effects={item?.effects} />

      {/* Small chips (no verbose meta list) */}
      <div className="mt-2 flex flex-wrap">
        {slot && <Chip>{slot}</Chip>}
        {isTokenPurchase(item) && <Chip>Token Purchase</Chip>}
        {typeof weight === 'number' && <Chip>Weight {weight}</Chip>}
        {typeof up === 'number' && <Chip>{up} Upgrade Slot{up === 1 ? '' : 's'}</Chip>}
        {twoH && <Chip>Two-Handed</Chip>}
        {range != null && <Chip>Range {range}</Chip>}
        {shots != null && <Chip>Shots {shots}</Chip>}
        {isDS && <Chip>Dark Stone</Chip>}
        {dsContain && <Chip>Contains {dsContain} DS</Chip>}
        {tags.map((t, i) => <Chip key={i}>{t}</Chip>)}
      </div>

      {/* Cost */}
      <div className="text-xs mt-2">
        <span className="font-semibold">Cost:</span> {costText || '—'}
      </div>

      {/* BUY only (no "Mark Day Done") */}
      <button
        className={`btn btn-xs mt-2 ${btnDisabled ? 'btn-disabled' : ''}`}
        disabled={btnDisabled}
        onClick={() => onBuy?.(item)}
        title={!disabled ? (atLimit ? 'Reached per-visit limit' : '') : 'Visit required to purchase'}
      >
        {isTokenPurchase(item) ? 'Buy Token' : 'Buy'}
      </button>
    </div>
  );
};

const ServiceCard = ({ service, disabled, onBuy }) => (
  <div className="border rounded p-3 bg-yellow-50 shadow-sm">
    <div className="font-semibold">{service?.name || service?.label || 'Service'}</div>
    {service?.lore && <div className="text-xs italic text-gray-700 mt-1">{service.lore}</div>}
    {service?.description && <div className="text-xs italic text-gray-700 mt-1">{service.description}</div>}
    <EffectBlock effect={service?.effect} effects={service?.effects} />

    {/* Rules text (array) */}
    {Array.isArray(service?.rules?.text) && service.rules.text.length > 0 && (
      <div className="text-xs text-gray-800 mt-2 space-y-1">
        {service.rules.text.map((line, i) => (
          <p key={`svc_rt_${i}`}>{line}</p>
        ))}
      </div>
    )}
    {/* Rules description */}
    {service?.rules?.description && (
      <div className="text-xs text-gray-700 mt-1">{service.rules.description}</div>
    )}
    {/* Notes */}
    {service?.note && (
      <div className="text-[11px] text-gray-600 mt-1 italic">{service.note}</div>
    )}
    {service?.rules?.note && (
      <div className="text-[11px] text-gray-600 mt-1 italic">{service.rules.note}</div>
    )}
    

    {/* Cost line for services, with "each" support */}
    <div className="text-xs mt-2">
      <span className="font-semibold">Cost:</span> {formatServiceCost(service)}
    </div>

    {/* Perform/Buy button so services can call through */}
    <button
      type="button"
      className={`btn btn-xs mt-2 ${disabled ? 'btn-disabled' : ''}`}
      disabled={disabled}
      onClick={() => onBuy?.(service)}
    >
      {service?.type === 'Ritual' ? 'Perform Ritual' : 'Buy Service'}
    </button>
  </div>
);


// ---------- Main ----------
/**
 * Props:
 * - shopKey (string, required)
 * - title (string)
 * - hero (object)
 * - visited (boolean) -> when false, Buy disabled
 * - onBuy(shopKey, itemOrService)
 * - visitPurchases?: { [itemId: string]: number }
 * - posseApi?, uiApi? (for event handlers)
 */
const GenericShop = ({
  shopKey,
  title,
  hero,
  visited = false,
  onBuy,
  visitPurchases = null,
  posseApi = null,
  uiApi = null,
}) => {
  const [, force] = useState(0);
  const refresh = () => force(n => n + 1);

  // Load town state and dynamically generate tabs (for event items)
  const dynamicTabsByShop = useMemo(() => {
    const townState = loadTownState();
    return makeTabsByShop({ townState });
  }, [force, shopKey]);

  const legacyTabs = dynamicTabsByShop?.[shopKey] || tabsByShop?.[shopKey];
  const shopData = shopDataById?.[shopKey];
  const shopRequires = shopData?.requires || null;
  const bannedKeywords = shopData?.visitRestrictions?.bannedKeywords || [];
  const heroIsBanned = Array.isArray(bannedKeywords) && bannedKeywords.some(k => hasKeyword(hero, k));

  const destroyed = isLocationDestroyed(shopKey);
  const minFloor = shopKey === 'streetMarket' ? 25 : undefined;

  const categories = useMemo(() => {
    if (Array.isArray(legacyTabs) && legacyTabs.length) {
      return legacyTabs.map(t => {
        const items = (Array.isArray(t.items) ? t.items : []).filter(it => meetsRequirements(hero, it, shopRequires));
        const services = (Array.isArray(t.services) ? t.services : []).filter(svc => meetsRequirements(hero, svc, shopRequires));
        return { id: t.id, label: t.label || toLabel(t.id), items, services };
      }).filter(cat => (cat.items.length || cat.services.length));
    }

    if (!shopData) return [];
    const cats = [];

    if (shopData.categories && typeof shopData.categories === 'object') {
      const catObj = shopData.categories;

      if (Array.isArray(catObj.items) && catObj.items.length) {
        const filteredItems = catObj.items.filter(it => meetsRequirements(hero, it, shopRequires));
        if (filteredItems.length) cats.push({ id: 'items', label: toLabel('items'), items: filteredItems, services: [] });
      }

      for (const [key, arr] of Object.entries(catObj)) {
        if (key === 'items' || !Array.isArray(arr) || !arr.length) continue;
        const items = arr.filter(isItem).filter(it => meetsRequirements(hero, it, shopRequires));
        const services = arr.filter(isService).filter(svc => meetsRequirements(hero, svc, shopRequires));
        if (items.length || services.length) cats.push({ id: key, label: toLabel(key), items, services });
      }
      return cats;
    }

    if (Array.isArray(shopData.items) && shopData.items.length) {
      const filteredItems = shopData.items.filter(it => meetsRequirements(hero, it, shopRequires));
      if (filteredItems.length) cats.push({ id: 'items', label: 'Shop Items', items: filteredItems, services: [] });
    }

    if (shopData.services && typeof shopData.services === 'object') {
      for (const [key, arr] of Object.entries(shopData.services)) {
        if (!Array.isArray(arr) || !arr.length) continue;
        const items = arr.filter(isItem).filter(it => meetsRequirements(hero, it, shopRequires));
        const services = arr.filter(isService).filter(svc => meetsRequirements(hero, svc, shopRequires));
        if (items.length || services.length) cats.push({ id: key, label: toLabel(key), items, services });
      }
    }

    return cats;
  }, [legacyTabs, shopData, hero, shopRequires]);

  const [activeCat, setActiveCat] = useState(categories[0]?.id || null);
  useEffect(() => {
    if (!activeCat && categories.length) setActiveCat(categories[0].id);
    if (activeCat && !categories.some(c => c.id === activeCat) && categories.length) {
      setActiveCat(categories[0].id);
    }
  }, [categories, activeCat]);

  const current = categories.find(c => c.id === activeCat);

  const getVisitCount = (item, idx) => visitPurchases?.[getItemId(item, idx)] || 0;

  // apply price mods to GOLD only (Street Market +/- $50, min $25)
  const adjustGold = (gold) =>
    applyShopPriceMods(Number(gold || 0), shopKey, typeof minFloor === 'number' ? { minFloor } : {});

  // Listen for town state changes to refresh tabs
  useEffect(() => {
    const handleTownStateChange = () => refresh();
    window.addEventListener('sobTownStateChanged', handleTownStateChange);
    return () => window.removeEventListener('sobTownStateChanged', handleTownStateChange);
  }, []);

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold">{title || 'Shop'}</h3>

      <LocationEventPanel shopKey={shopKey} posseApi={posseApi} uiApi={uiApi} onAfterResolve={refresh} />

      {isLocationDestroyed(shopKey) && (
        <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded">
          This location has been <b>destroyed</b> for this town stay.
        </div>
      )}

      {!destroyed && heroIsBanned && (
        <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded">
          This hero cannot visit this location.
        </div>
      )}

      {!destroyed && !heroIsBanned && (
        <>
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button
                  key={c.id}
                  className={`btn btn-sm ${c.id === activeCat ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setActiveCat(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}

          {categories.length === 1 && (
            <div className="text-sm text-gray-600 italic">{categories[0].label}</div>
          )}

          {current ? (
            <div className="space-y-3">
              {Array.isArray(current.items) && current.items.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {current.items.map((it, idx) => (
                    <ItemCard
                      key={getItemId(it, idx)}
                      item={it}
                      disabled={!visited}
                      visitPurchasesCount={getVisitCount(it, idx)}
                      onBuy={(item) => onBuy?.(shopKey, { ...item, id: getItemId(item, idx) })}
                      adjustGold={adjustGold}
                    />
                  ))}
                </div>
              )}

              {Array.isArray(current.services) && current.services.length > 0 && (
                <div className="space-y-2">
                  {current.services.map((svc, idx) => (
                    <ServiceCard
                      key={svc?.id || svc?.name || `svc_${idx}`}
                      service={svc}
                      disabled={!visited}
                      onBuy={(service) => onBuy?.(shopKey, service)}
                    />
                  ))}
                </div>
              )}

              {(!current.items?.length && !current.services?.length) && (
                <div className="text-sm text-gray-500">Nothing available in this category.</div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              {shopRequires ? 'Nothing here for this hero.' : 'No categories available.'}
            </div>
          )}

          {!visited && (
            <div className="text-xs text-gray-500">
              You can browse, but must <b>Visit</b> this location to purchase.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GenericShop;
