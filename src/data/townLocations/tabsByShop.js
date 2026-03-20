// ============================================================================
// Frontier Town — Canonical Tab Builder
// One file to rule them all. 100% clean, ctx-aware, expansion-future-proof.
// ============================================================================

// ---------- Small helpers ----------
const asEntries = (modLike, ctx) => {
  if (Array.isArray(modLike)) return modLike;

  if (typeof modLike === 'function') {
    try {
      return asEntries(modLike(ctx), ctx);
    } catch {
      return [];
    }
  }

  if (modLike && typeof modLike === 'object') {
    if (Array.isArray(modLike.default)) return modLike.default;

    if (typeof modLike.default === 'function') {
      try {
        return asEntries(modLike.default(ctx), ctx);
      } catch {
        return [];
      }
    }

    const out = [];
    if (Array.isArray(modLike.entries)) out.push(...modLike.entries);
    if (Array.isArray(modLike.items)) out.push(...modLike.items);
    if (Array.isArray(modLike.services)) out.push(...modLike.services);
    if (out.length) return out;
  }
  return [];
};

const cat = (id, label, modLike, ctx) => {
  const entries = Array.isArray(modLike) ? modLike : asEntries(modLike, ctx);
  // NOTE: expose both `entries` and `items` so TownTab + helpers are compatible
  return entries.length ? { id, label, entries, items: entries } : null;
};

const catList = (...maybeCats) => maybeCats.filter(Boolean);

const hasTag = (tag) => (entry) =>
  Array.isArray(entry?.tags) && entry.tags.includes(tag);

const orTags = (...tags) => (entry) =>
  Array.isArray(entry?.tags) && tags.some((t) => entry.tags.includes(t));

// ============================================================================
// IMPORTS
// ============================================================================

// ====================== FRONTIER TOWN =======================================

// ---------------- Church ----------------
import churchRituals from './FrontierTown/Church/churchRituals.js';
import churchBlessedAuras from './FrontierTown/Church/churchBlessedAuras.js';
import churchItems from './FrontierTown/Church/churchItems.js';
import churchSacredOrderItems from './FrontierTown/Church/churchSacredOrderItems.js';

// ---------------- Doc's Office ----------------
import docsOfficeItems from './FrontierTown/DocsOffice/docsOfficeItems.js';
import docsOfficeMedical from './FrontierTown/DocsOffice/docsOfficeMedical.js';
import docsOfficeInjections from './FrontierTown/DocsOffice/docsOfficeInjections.js';

// ---------------- Blacksmith ----------------
import blacksmithItems from './FrontierTown/Blacksmith/blacksmithItems.js';
import blacksmithUpgrades from './FrontierTown/Blacksmith/blacksmithUpgrades.js';
import blacksmithTransport from './FrontierTown/Blacksmith/blacksmithTransport.js';

// ---------------- Gambling Hall ----------------
import gamblingHallGames from './FrontierTown/GamblingHall/gamblingHallGames.js';
import gamblingHallItems from './FrontierTown/GamblingHall/gamblingHallItems.js';
import gamblingHallClothing from './FrontierTown/GamblingHall/gamblingHallClothing.js';

// ---------------- Saloon ----------------
import saloonItems from './FrontierTown/Saloon/saloonItems.js';
import saloonServices from './FrontierTown/Saloon/saloonServices.js';

// ---------------- General Store ----------------
import generalStoreTokens from './FrontierTown/GeneralStore/generalStoreTokens.js';
import generalStoreAmmo from './FrontierTown/GeneralStore/generalStoreAmmo.js';
import generalStoreGuns from './FrontierTown/GeneralStore/generalStoreGuns.js';
import generalStoreClothing from './FrontierTown/GeneralStore/generalStoreClothing.js';
import generalStoreHats from './FrontierTown/GeneralStore/generalStoreHats.js';

// ---------------- Street Market ----------------
import streetMarketTokens from './FrontierTown/StreetMarket/streetMarketTokens.js';
import streetMarketItems from './FrontierTown/StreetMarket/streetMarketItems.js';
import streetMarketHorses from './FrontierTown/StreetMarket/streetMarketHorses.js';
import streetMarketEquipment from './FrontierTown/StreetMarket/streetMarketEquipment.js';
import streetMarketBackAlleys from './FrontierTown/StreetMarket/streetMarketBackAlleys.js';

// ---------------- Frontier Outpost ----------------
import frontierOutpostBank from './FrontierTown/FrontierOutpost/frontierOutpostBank.js';
import frontierOutpostTraining from './FrontierTown/FrontierOutpost/frontierOutpostTraining.js';
import frontierOutpostTradingPost from './FrontierTown/FrontierOutpost/frontierOutpostTradingPost.js';

// ---------------- Sheriff's Office ----------------
import sheriffsOfficeServices from './FrontierTown/SheriffsOffice/sheriffsOfficeServices.js';
import sheriffsOfficeItems from './FrontierTown/SheriffsOffice/sheriffsOfficeItems.js';
import sheriffsOfficeBounties from './FrontierTown/SheriffsOffice/sheriffsOfficeBounties.js';
import sheriffsOfficeLawOnly from './FrontierTown/SheriffsOffice/sheriffsOfficeLawOnly.js';

// ---------------- Smuggler's Den ----------------
import smugglersDenItems from './FrontierTown/SmugglersDen/smugglersDenItems.js';
import smugglersDenServices from './FrontierTown/SmugglersDen/smugglersDenServices.js';
import smugglersDenOutlawActions from './FrontierTown/SmugglersDen/smugglersDenOutlawActions.js';
import smugglersDenOutlawGear from './FrontierTown/SmugglersDen/smugglersDenOutlawGear.js';

// ---------------- Mutant Quarter ----------------
import mutantQuarterItems from './FrontierTown/MutantQuarter/mutantQuarterItems.js';
import mutantQuarterCommunity from './FrontierTown/MutantQuarter/mutantQuarterCommunity.js';
import mutantQuarterServices from './FrontierTown/MutantQuarter/mutantQuarterServices.js';

// ====================== BLASTED WASTES TOWN =================================

// ---------------- Mining Operation ----------------
import miningOperationItems from './BlastedWastesTown/MiningOperation/miningOperationItems.js';
import miningOperationFungus from './BlastedWastesTown/MiningOperation/miningOperationFungus.js';
import miningOperationServices from './BlastedWastesTown/MiningOperation/miningOperationServices.js';

// ---------------- Desert Marketplace ----------------
import desertMarketplaceTokens from './BlastedWastesTown/DesertMarketplace/desertMarketplaceTokens.js';
import desertMarketplaceBackAlleys from './BlastedWastesTown/DesertMarketplace/desertMarketplaceBackAlleys.js';
import desertMarketplaceItems from './BlastedWastesTown/DesertMarketplace/desertMarketplaceItems.js';
import desertMarketplaceTransports from './BlastedWastesTown/DesertMarketplace/desertMarketplaceTransports.js';

// ---------------- Scavenger Doc ----------------
import scavengerDocItems from './BlastedWastesTown/ScavengerDoc/scavengerDocItems.js';
import scavengerDocServices from './BlastedWastesTown/ScavengerDoc/scavengerDocServices.js';
import scavengerDocResearch from './BlastedWastesTown/ScavengerDoc/scavengerDocResearch.js';

// ---------------- Temple ----------------
import templeServices from './BlastedWastesTown/Temple/templeServices.js';

// ============================================================================
// MAKE TABS BY SHOP (ctx aware)
// ============================================================================
export const makeTabsByShop = (ctx) => ({
  church: catList(
    cat('rituals', 'Holy Rituals', churchRituals, ctx),
    cat('auras', 'Blessed Auras', churchBlessedAuras, ctx),
    cat('items', 'Holy Gear', churchItems, ctx),
    cat('sacred', 'Sacred Order (Holy Only)', churchSacredOrderItems, ctx),
  ),

  docsOffice: catList(
    cat('items', 'Healing Supplies', docsOfficeItems, ctx),
    cat('medical', 'Medical Attention', docsOfficeMedical, ctx),
    cat('injections', 'Injections', docsOfficeInjections, ctx),
  ),

  blacksmith: catList(
    cat('items', 'Dark Stone Gear', blacksmithItems, ctx),
    cat('upgrades', 'Dark Stone Forge — Upgrades', blacksmithUpgrades, ctx),
    cat('transport', 'Transport & Stage Coach', blacksmithTransport, ctx),
  ),

  gamblingHall: catList(
    cat('games', 'Entertainment', gamblingHallGames, ctx),
    cat('items', 'Tokens & Purchases', gamblingHallItems, ctx),
    cat('clothing', 'Fancy Clothing', gamblingHallClothing, ctx),
  ),

  saloon: (() => {
    const itemsTab = asEntries(saloonItems, ctx).filter(hasTag('Everyone'));
    const entertainmentTab = asEntries(saloonServices, ctx).filter(hasTag('Entertainment'));
    const troupeTab = [
      ...asEntries(saloonServices, ctx).filter(orTags('SaloonGirlOnly', 'Troupe')),
      ...asEntries(saloonItems, ctx).filter(orTags('SaloonGirlOnly', 'Troupe')),
    ];
    return catList(
      cat('saloon_items', 'Items', itemsTab, ctx),
      cat('saloon_entertainment', 'Entertainment', entertainmentTab, ctx),
      cat('saloon_troupe', 'Saloon Girl Troupe', troupeTab, ctx),
    );
  })(),

  generalStore: catList(
    cat('tokens', 'Side Bag Tokens', generalStoreTokens, ctx),
    cat('ammo', 'Specialty Ammo', generalStoreAmmo, ctx),
    cat('guns', 'Guns', generalStoreGuns, ctx),
    cat('clothing', 'Clothing & Equipment', generalStoreClothing, ctx),
    cat('hats', 'Hats', generalStoreHats, ctx),
  ),

  streetMarket: catList(
    cat('tokens', 'Potions & Spices', streetMarketTokens, ctx),
    cat('backalleys', 'Back Alley Services', streetMarketBackAlleys, ctx),
    cat('items', 'Charms & Accessories', streetMarketItems, ctx),
    cat('horses', 'Horses', streetMarketHorses, ctx),
    cat('equipment', 'Clothing & Equipment', streetMarketEquipment, ctx),
  ),

  frontierOutpost: catList(
    cat('fo_bank', 'Outpost Bank (Services)', frontierOutpostBank, ctx),
    cat('fo_training', 'Training & Bounties', frontierOutpostTraining, ctx),
    cat('fo_trading', 'Trading Post', frontierOutpostTradingPost, ctx),
  ),

  sheriffsOffice: catList(
    cat('so_services', 'Services', sheriffsOfficeServices, ctx),
    cat('so_bounties', 'Bounties & Wanted Posters', sheriffsOfficeBounties, ctx),
    cat('so_law', 'Law and Order', sheriffsOfficeLawOnly, ctx),
    cat('so_items', 'Clothing, Badges & Guns', sheriffsOfficeItems, ctx),
  ),

  smugglersDen: catList(
    cat('services', 'Services', smugglersDenServices, ctx),
    cat(
      'outlaw',
      'Smugglers & Thieves (Outlaw Only)',
      {
        entries: [
          ...asEntries(smugglersDenOutlawActions, ctx),
          ...asEntries(smugglersDenOutlawGear, ctx),
        ],
      },
      ctx,
    ),
    cat('items', 'Black Market Goods', smugglersDenItems, ctx),
  ),

  mutantQuarter: catList(
    cat('community', 'Community', mutantQuarterCommunity, ctx),
    cat('items', 'Mutant Gear', mutantQuarterItems, ctx),
    cat('services', 'Services', mutantQuarterServices, ctx),
  ),

  // ── Blasted Wastes Town ────────────────────────────────────────────────
  miningOperation: catList(
    cat('mo_items', 'Mining Gear & Explosives', miningOperationItems, ctx),
    cat('mo_fungus', 'Fungus Crops', miningOperationFungus, ctx),
    cat('mo_work', 'Work Down in the Tunnels', miningOperationServices, ctx),
  ),

  temple: catList(
    cat('temple_services', 'Blessings, Items, and Services', templeServices, ctx),
  ),

  scavengerDoc: catList(
    cat('scav_items', 'Medical Supplies', scavengerDocItems, ctx),
    cat('scav_services', 'Doc Services — Healing', scavengerDocServices, ctx),
    cat('scav_research', 'Scientific Research', scavengerDocResearch, ctx),
  ),

  desertMarketplace: catList(
    cat('dm_tokens', 'Side Bag Tokens', desertMarketplaceTokens, ctx),
    cat('dm_alleys', 'Market Back Alleys', desertMarketplaceBackAlleys, ctx),
    cat('dm_items', 'Alien Clothing & Equipment', desertMarketplaceItems, ctx),
    cat('dm_transports', 'Transports', desertMarketplaceTransports, ctx),
  ),
});

// Canonical default export
export const tabsByShop = makeTabsByShop();
export default tabsByShop;
