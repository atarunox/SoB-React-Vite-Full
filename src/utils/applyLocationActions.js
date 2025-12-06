// src/utils/applyLocationActions.js
export async function applyLocationActions(actions = [], { posseApi, townState, saveTownState }) {
  if (!Array.isArray(actions) || !actions.length) return;

  const getHero = (id) => posseApi.getHeroById?.(id) || posseApi.getHero?.(id) || null;
  const updateHero = (id, patch) => posseApi.updateHero?.(id, patch);

  const ensureShopMods = (loc) => {
    const s = loadFreshTownState(townState);
    if (!s.shopMods[loc]) s.shopMods[loc] = {};
    return s.shopMods[loc];
  };
  const loadFreshTownState = (s) => (typeof s === 'function' ? s() : s);
  const writeTown = (mutator) => {
    const s = loadFreshTownState(townState);
    mutator(s);
    saveTownState?.(s);
  };

  for (const a of actions) {
    switch (a.type) {
      case 'ADD_GRIT': {
        const h = getHero(a.heroId);
        if (!h) break;
        const grit = Math.max(0, (h.grit ?? 0) + (a.amount ?? 0));
        updateHero?.(a.heroId, { grit });
        break;
      }

      case 'HEAL_TO_FULL': {
        const h = getHero(a.heroId);
        if (!h) break;
        updateHero?.(a.heroId, { health: h.maxHealth ?? h.health, sanity: h.maxSanity ?? h.sanity });
        break;
      }

      case 'MODIFY_GOLD': {
        const h = getHero(a.heroId);
        if (!h) break;
        updateHero?.(a.heroId, { gold: Math.max(0, (h.gold ?? 0) + (a.delta ?? 0)) });
        break;
      }

      case 'MODIFY_DARK_STONE': {
        const h = getHero(a.heroId);
        if (!h) break;
        updateHero?.(a.heroId, { darkStone: Math.max(0, (h.darkStone ?? 0) + (a.delta ?? 0)) });
        break;
      }

      case 'LOSE_ALL_DARK_STONE': {
        const h = getHero(a.heroId);
        if (!h) break;
        updateHero?.(a.heroId, { darkStone: 0 });
        break;
      }

      case 'APPLY_WOUNDS': {
        const h = getHero(a.heroId);
        if (!h) break;
        const health = Math.max(0, (h.health ?? 0) - (a.amount ?? 0));
        updateHero?.(a.heroId, { health });
        break;
      }

      case 'SET_SELL_RATE': { // (#5 / #9)
        writeTown((s) => {
          const mods = ensureShopMods(a.locationId || 'frontierOutpostBank');
          mods.darkStoneSellRateCents = a.centsPerShard;
        });
        break;
      }

      case 'REPLACE_KEYWORD': { // (#12)
        const h = getHero(a.heroId);
        if (!h) break;
        const kw = new Set([...(h.keywords || [])].map(String));
        if (a.from) kw.delete(String(a.from));
        if (a.to) kw.add(String(a.to));
        updateHero?.(a.heroId, { keywords: Array.from(kw) });
        break;
      }

      case 'ADD_KEYWORD': { // (#12)
        const h = getHero(a.heroId);
        if (!h) break;
        const kw = new Set([...(h.keywords || [])].map(String));
        if (a.keyword) kw.add(String(a.keyword));
        updateHero?.(a.heroId, { keywords: Array.from(kw) });
        break;
      }

      case 'GRANT_REROLL_TAG': { // (#11)
        // store as a temporary condition so it appears on ConditionsTab
        const h = getHero(a.heroId);
        if (!h) break;
        const cond = {
          id: `war_stories_${Date.now()}`,
          type: 'temporary',
          name: 'War Stories',
          source: 'Frontier Outpost',
          active: true,
          duration: a.scope || 'nextAdventure',
          rules: { rerollTags: [{ tag: a.tag || 'damage', charges: a.charges || 1 }] },
          effectText: 'Re-roll 1 Damage roll for one Hit during the next adventure.',
        };
        const conditions = h.conditions || {};
        const temp = Array.isArray(conditions.temporary) ? conditions.temporary.slice() : [];
        temp.push(cond);
        updateHero?.(a.heroId, { conditions: { ...conditions, temporary: temp } });
        break;
      }

      case 'DRAW_WORLD_ARTIFACT_OFFER': { // (#7)
        // Save a pending offer; your Shop UI can render/buy it.
        writeTown((s) => {
          s.dayMods = s.dayMods || {};
          s.dayMods.pendingArtifactOffer = {
            heroId: a.heroId,
            price: a.price,
            createdAt: Date.now(),
          };
        });
        break;
      }

      case 'SET_DAY_MOD': {
        // Set a day modifier (used by General Store events #11, #12)
        writeTown((s) => {
          s.dayMods = s.dayMods || {};
          s.dayMods[a.key] = a.value;
        });
        break;
      }

      case 'FLAG_STAY_MOD': {
        // Set a stay modifier (lasts entire town stay)
        writeTown((s) => {
          s.stayMods = s.stayMods || {};
          s.stayMods[a.key] = a.value;
        });
        break;
      }

      case 'CLOSE_LOCATION': {
        // Close a location (used by General Store event #2)
        writeTown((s) => {
          s.stayMods = s.stayMods || {};
          s.stayMods[`${a.locationId}Closed`] = true;
        });
        break;
      }

      case 'ADVANCE_DARKNESS': {
        // Advance the Darkness marker (used by Indian Trading Post event #2)
        // This would need integration with your darkness tracking system
        // For now, we'll log it as a pending action
        writeTown((s) => {
          s.pendingActions = s.pendingActions || [];
          s.pendingActions.push({
            type: 'ADVANCE_DARKNESS',
            steps: a.steps,
            reason: a.reason,
            timestamp: Date.now(),
          });
        });
        break;
      }

      case 'TAKE_HITS': {
        const h = getHero(a.heroId);
        if (!h) break;

        // Apply hits based on hit type
        const hits = a.hits || 0;
        if (a.hitType === 'horror' || a.hitType === 'madness') {
          // Horror/Madness hits affect Sanity
          const sanity = Math.max(0, (h.sanity ?? h.maxSanity ?? 0) - hits);
          updateHero?.(a.heroId, { sanity });
        } else {
          // Default: physical hits affect Health
          const health = Math.max(0, (h.health ?? h.maxHealth ?? 0) - hits);
          updateHero?.(a.heroId, { health });
        }
        break;
      }

      case 'ADD_XP': {
        const h = getHero(a.heroId);
        if (!h) break;
        const xp = Math.max(0, (h.xp ?? 0) + (a.amount ?? 0));
        updateHero?.(a.heroId, { xp });
        break;
      }

      case 'MODIFY_SANITY': {
        const h = getHero(a.heroId);
        if (!h) break;
        const maxSanity = h.maxSanity ?? 6;
        const sanity = Math.max(0, Math.min(maxSanity, (h.sanity ?? maxSanity) + (a.delta ?? 0)));
        updateHero?.(a.heroId, { sanity });
        break;
      }

      case 'GRANT_TEMP_CONDITION': {
        // Add a temporary condition to a hero
        const h = getHero(a.heroId);
        if (!h) break;
        const conditions = h.conditions || {};
        const temp = Array.isArray(conditions.temporary) ? conditions.temporary.slice() : [];
        temp.push(a.condition);
        updateHero?.(a.heroId, { conditions: { ...conditions, temporary: temp } });
        break;
      }

      case 'GRANT_PERMANENT_CONDITION': {
        // Add a permanent condition to a hero
        const h = getHero(a.heroId);
        if (!h) break;
        const conditions = h.conditions || {};
        const perm = Array.isArray(conditions.permanent) ? conditions.permanent.slice() : [];
        perm.push(a.condition);
        updateHero?.(a.heroId, { conditions: { ...conditions, permanent: perm } });
        break;
      }

      case 'TAKE_WOUNDS': {
        // Apply wounds (damage after defense/armor)
        const h = getHero(a.heroId);
        if (!h) break;
        const health = Math.max(0, (h.health ?? h.maxHealth ?? 0) - (a.wounds ?? 0));
        updateHero?.(a.heroId, { health });
        break;
      }

      case 'TAKE_HORROR_HITS': {
        // Apply horror hits to sanity (after willpower/spirit armor)
        const h = getHero(a.heroId);
        if (!h) break;
        const sanity = Math.max(0, (h.sanity ?? h.maxSanity ?? 0) - (a.hits ?? 0));
        updateHero?.(a.heroId, { sanity });
        break;
      }

      case 'HEAL_SANITY': {
        // Heal sanity (up to max)
        const h = getHero(a.heroId);
        if (!h) break;
        const maxSanity = h.maxSanity ?? 6;
        const sanity = Math.min(maxSanity, (h.sanity ?? 0) + (a.amount ?? 0));
        updateHero?.(a.heroId, { sanity });
        break;
      }

      case 'ROLL_ON_CHART': {
        // Roll on an injury/madness chart
        // Store as a pending action for the UI to handle
        writeTown((s) => {
          s.pendingChartRolls = s.pendingChartRolls || [];
          s.pendingChartRolls.push({
            heroId: a.heroId,
            chart: a.chart, // 'injury' or 'madness'
            die: a.die || 1,
            reason: a.reason,
            timestamp: Date.now(),
          });
        });
        break;
      }

      default:
        // no-op; add handlers here as needed
        break;
    }
  }
}
