// src/utils/locationHandlers/smugglersDenServices.js
import { loadTownState, saveTownState } from '../../utils/townState';
import gearCards from '../../data/items/gearCards.js';
import { otherWorldArtifacts } from '../../data/items/otherWorldArtifacts.js';
import { addKeyword, hasKeyword } from '../keywords';
import { withConditionAppended, normalizeConditionsObject } from '../mergeConditions';
import { rollD3 } from '../diceHelpers';

// ---------- dice & small helpers ----------
const d6 = () => Math.floor(Math.random() * 6) + 1;
const rollND = (n, s = 6) => Array.from({ length: n }, () => Math.floor(Math.random() * s) + 1);
const randFrom = (arr) => (Array.isArray(arr) && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null);

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const num = (v, def = 0) => (Number.isFinite(+v) ? +v : def);
const asArr = (v) => (Array.isArray(v) ? v : []);

// --- stat helpers -----------------------------------------------------------
function getStat(hero, key) {
  const k = String(key);
  const lower = k.toLowerCase();
  const stats = hero?.stats || hero?.core || {};
  if (Number.isFinite(stats?.[k])) return +stats[k];
  if (Number.isFinite(hero?.[k])) return +hero[k];
  if (Number.isFinite(hero?.[lower])) return +hero[lower];
  return 0;
}

// Try to find a Defense X+ target on the hero; if not found, return null.
function parseXPlus(v) {
  if (typeof v === 'string') {
    const m = v.match(/(\d+)\s*\+/);
    if (m) return clamp(parseInt(m[1], 10) || 0, 2, 6);
  }
  if (Number.isFinite(v)) return clamp(v, 2, 6);
  return null;
}
function getDefenseTarget(hero) {
  // Common places this may live in your app
  return (
    parseXPlus(hero?.defense?.roll) ||
    parseXPlus(hero?.defenseRoll)     ||
    parseXPlus(hero?.Defense)         ||
    parseXPlus(hero?.defense)         ||
    null
  );
}

function setGoldPatch(prev, delta) {
  const gold = num(prev?.gold, 0) + num(delta, 0);
  return { gold: Math.max(0, gold) };
}
function decHealthIgnoringDefense(prev, wounds) {
  const cur = num(prev?.currentHealth ?? prev?.health?.current ?? prev?.health, 0);
  const next = Math.max(0, cur - Math.max(0, wounds));
  return {
    currentHealth: next,
    health: { ...(prev?.health || {}), current: next },
  };
}
function addPermanentCondition(prev, condObj) {
  const perm = asArr(prev?.conditions?.permanent);
  return {
    conditions: { ...(prev?.conditions || {}), permanent: [...perm, condObj] },
  };
}
function removeOneInventoryItemByPredicate(prev, pred) {
  const inv = asArr(prev?.inventory);
  const idx = inv.findIndex(pred);
  if (idx >= 0) {
    const next = inv.slice();
    const removedItem = inv[idx];
    next.splice(idx, 1);
    return { inventory: next, removed: true, removedItem };
  }
  return { inventory: inv, removed: false, removedItem: null };
}
function heroHasTransport(prev) {
  const inv = asArr(prev?.inventory);
  return inv.some((it) => {
    const name = String(it?.name || '').toLowerCase();
    const tags = (it?.tags || []).map((t) => String(t).toLowerCase());
    return tags.includes('transport') || /horse|camel|wagon|transport|mount/.test(name);
  });
}
function heroHasExplosive(prev) {
  const inv = asArr(prev?.inventory);
  return inv.some((it) => {
    const name = String(it?.name || '').toLowerCase();
    const tags = (it?.tags || []).map((t) => String(t).toLowerCase());
    return tags.includes('explosive') || /dynamite|shaped\s*charge|explosive/.test(name);
  });
}

// ---------- loot pool ----------
function ensureLootPool() {
  const s = loadTownState() || {};
  if (!Array.isArray(s.lootPool)) s.lootPool = [];
  return s;
}
function pushLootCards(cards = []) {
  if (!Array.isArray(cards) || !cards.length) return;
  const s = ensureLootPool();
  const now = Date.now();
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i] || {};
    const poolId = c.id ? `bm_${c.id}_${now}_${i}` : `loot_${now}_${i}_${Math.random().toString(36).slice(2, 7)}`;
    const effectsArray =
      Array.isArray(c.effects) ? c.effects.slice()
      : (c.effect ? [String(c.effect)]
      : (c.effects && typeof c.effects === 'object'
          ? Object.entries(c.effects).map(([k, v]) => `${k}: ${v}`)
          : []));
    s.lootPool.push({
      id: poolId,
      gearId: c.id || null,
      name: c.name || c.title || c.cardName || 'Unknown Item',
      type: c.type || (c.slot ? 'Gear' : 'Loot'),
      value: Number.isFinite(c.value) ? c.value : Number(c.baseGold ?? 0) || 0,
      effects: effectsArray,
      originWorld: c.originWorld || c.world || null,
      slot: c.slot ?? null,
      twoHanded: c.twoHanded ?? null,
      upgradeSlots: c.upgradeSlots ?? null,
      darkStone: c.darkStone ?? null,
      weight: c.weight ?? null,
      tags: Array.isArray(c.tags) ? c.tags.slice() : [],
      remainsInPool: c.remainsInPool ?? true,
      drawnFor: c.drawnFor || null,
      timestamp: now + i,
      _source: c._source || 'BlackMarket',
      shop: 'smugglersDen',
      forSaleAtSmugglers: true,
      soldOut: !!c.soldOut,
    });
  }
  saveTownState(s);
}
function mkLootFromItem(item, sourceTag = 'BlackMarket') {
  if (!item || typeof item !== 'object') {
    return { name: 'Unknown Item', type: 'Loot', value: 0, effects: [], remainsInPool: true, _source: sourceTag, forSaleAtSmugglers: true, shop: 'smugglersDen', soldOut: false };
  }
  const effectsArray =
    Array.isArray(item.effects) ? item.effects.slice()
    : (item.effect ? [String(item.effect)]
    : (item.effects && typeof item.effects === 'object'
        ? Object.entries(item.effects).map(([k, v]) => `${k}: ${v}`)
        : []));
  const inferredType = item.type || (item.slot ? 'Gear' : 'Loot');
  return { ...item, name: item.name || item.title || item.id || 'Unknown Item', type: inferredType, value: Number.isFinite(item.value) ? item.value : Number(item.baseGold ?? 0) || 0, effects: effectsArray, remainsInPool: item.remainsInPool ?? true, _source: sourceTag, forSaleAtSmugglers: true, shop: 'smugglersDen', soldOut: !!item.soldOut };
}

// ---------- world artifacts ----------
function normalizeOtherWorldArtifacts(db) {
  if (!db) return {};
  if (db && typeof db === 'object' && !Array.isArray(db)) {
    const out = {}; for (const [k, v] of Object.entries(db)) { if (Array.isArray(v)) out[k] = v; } return out;
  }
  if (Array.isArray(db)) {
    const out = {};
    for (const it of db) {
      const w = it?.tags?.find(t => /Jargono|Targa|Cynder|Trederra|Derelict Ship|Blasted Wastes|The Canyons/i.test(t))
             || it?.world || it?.originWorld || 'Unknown';
      const world =
        /jargono/i.test(w) ? 'Jargono' :
        /targa/i.test(w) ? 'Targa Plateau' :
        /cynder/i.test(w) ? 'Caverns of Cynder' :
        /trederra/i.test(w) ? 'Trederra' :
        /derelict/i.test(w) ? 'Derelict Ship' :
        /wastes/i.test(w) ? 'Blasted Wastes' :
        /canyon/i.test(w) ? 'The Canyons' : w;
      if (!out[world]) out[world] = [];
      out[world].push(it);
    }
    return out;
  }
  return {};
}
const OTHER_WORLD_ARTS = normalizeOtherWorldArtifacts(otherWorldArtifacts);
function chooseAnyWorld() {
  const worlds = Object.keys(OTHER_WORLD_ARTS).filter(w => OTHER_WORLD_ARTS[w]?.length);
  if (!worlds.length) return null;
  return worlds[Math.floor(Math.random() * worlds.length)];
}
function drawWorldArtifactRandom() {
  const world = chooseAnyWorld();
  if (!world) return null;
  const pool = OTHER_WORLD_ARTS[world] || [];
  const pick = randFrom(pool);
  return pick ? { ...pick, originWorld: world } : null;
}
function drawMinesGear() {
  const list = Array.isArray(gearCards) ? gearCards : [];
  if (!list.length) return null;
  return randFrom(list);
}

/* ======================  SERVICES / ACTION HANDLERS  ===================== */

// Back-Alley Doc (unchanged)
export async function performBackAlleyDoc({ hero, posseApi, ui }) {
  const log = [];
  const id = hero?.id || hero?.localId;
  if (!id) return { log: ['No active hero.'] };

  const s = loadTownState() || {};
  const day = s.dayStamp || new Date().toDateString();
  s._locks = s._locks || {};
  const lockKey = `smugglers_backAlleyDoc_${day}_${id}`;
  if (s._locks[lockKey]) {
    log.push('Back-Alley Doc already used by this hero today.');
    return { log, actions: [], ui: { title: 'Back-Alley Doc', outcome: log } };
  }
  s._locks[lockKey] = true; saveTownState(s);

  // pay $25
  posseApi.updateHero(id, (prev) => ({ ...prev, gold: Math.max(0, (prev.gold ?? 0) - 25) }));
  log.push('Paid $25 to the Back-Alley Doc.');

  // choose target
  let pick = null;
  if (typeof ui?.promptInjuryOrMutation === 'function') {
    pick = await ui.promptInjuryOrMutation(hero);
  } else {
    const inj = (hero?.conditions?.injuries || hero?.injuries || []).find((c) => !c?.surgeryLocked);
    const mut = (hero?.conditions?.mutations || hero?.mutations || []).find((c) => !c?.surgeryLocked);
    pick = inj ? { kind: 'injury', label: inj.name || inj.title || 'Injury' }
               : mut ? { kind: 'mutation', label: mut.name || mut.title || 'Mutation' }
               : null;
  }
  if (!pick) log.push('No Injury/Mutation selected; proceeding anyway (you still pay the $25).');

  const [r] = (await ui?.roll?.(1, 6, 'Back-Alley Doc (D6)')) || [d6()];
  log.push(`Back-Alley Doc roll: <b>${r}</b>`);

  const decMaxHealth = () => {
    posseApi.updateHero(id, (prev) => {
      const prevMax = prev?.health?.max ?? prev?.maxHealth ?? 0;
      const newMax = Math.max(0, prevMax - 1);
      const cur = prev?.health?.current ?? prev?.currentHealth ?? prev?.health ?? 0;
      const newCur = Math.min(cur, newMax);
      const perm = asArr(prev?.conditions?.permanent);
      return {
        ...prev,
        health: { ...(prev.health || {}), max: newMax, current: newCur },
        maxHealth: newMax,
        currentHealth: newCur,
        conditions: {
          ...(prev.conditions || {}),
          permanent: [
            ...perm,
            {
              id: `bad_surgery_perm_hp_${Date.now()}`,
              name: 'Back-Alley Scarring',
              type: 'Permanent',
              effects: { maxHealth: -1 },
              active: true,
              addedAt: Date.now(),
            },
          ],
        },
      };
    });
  };
  const removePickedCondition = () => {
    if (!pick) return false;
    let removed = false;
    posseApi.updateHero(id, (prev) => {
      const next = { ...prev, conditions: { ...(prev.conditions || {}) } };
      if (pick.kind === 'injury') {
        const list = Array.isArray(prev?.conditions?.injuries) ? prev.conditions.injuries.slice()
                   : (Array.isArray(prev?.injuries) ? prev.injuries.slice() : []);
        const idx = Number.isFinite(pick._idx)
          ? pick._idx
          : list.findIndex((c) => (c?.name || c?.title) === (pick.label || pick.name));
        if (idx >= 0) { list.splice(idx, 1); removed = true; }
        if (Array.isArray(prev?.conditions?.injuries)) next.conditions.injuries = list;
        else next.injuries = list;
      } else if (pick.kind === 'mutation') {
        const list = Array.isArray(prev?.conditions?.mutations) ? prev.conditions.mutations.slice()
                   : (Array.isArray(prev?.mutations) ? prev.mutations.slice() : []);
        const idx = Number.isFinite(pick._idx)
          ? pick._idx
          : list.findIndex((c) => (c?.name || c?.title) === (pick.label || pick.name));
        if (idx >= 0) { list.splice(idx, 1); removed = true; }
        if (Array.isArray(prev?.conditions?.mutations)) next.conditions.mutations = list;
        else next.mutations = list;
      }
      return next;
    });
    return removed;
  };

  if (r === 1) {
    log.push('<b>Dead!</b> Your hero dies on the table.');
    ui?.notify?.('Back-Alley Doc: Catastrophic failure — the hero has died.');
    const patch = { dead: true, currentHealth: 0, health: { ...(hero.health || {}), current: 0 } };
    return { log, actions: [{ type: 'update', ...patch }], ui: { title: 'Back-Alley Doc', outcome: log } };
  }
  if (r === 2 || r === 3) {
    decMaxHealth();
    ui?.notify?.('Back-Alley Doc: Failure — -1 Max Health (permanent).');
    log.push('Failed — Injury/Mutation is not healed. <b>−1 Max Health</b> permanently.');
    return { log, actions: [], ui: { title: 'Back-Alley Doc', outcome: log } };
  }
  if (r === 4) {
    const removed = removePickedCondition();
    decMaxHealth();
    if (removed) ui?.notify?.('Surgery success — condition removed.');
    else ui?.notify?.('Surgery partial — no condition found to remove, -1 Max Health.');
    log.push('Success… sort of — Condition healed, but <b>−1 Max Health</b> permanently.');
    return { log, actions: [], ui: { title: 'Back-Alley Doc', outcome: log } };
  }
  const removed = removePickedCondition();
  if (removed) ui?.notify?.('Surgery success — condition removed.');
  else ui?.notify?.('Surgery completed — no condition found to remove.');
  log.push('Well done! Condition healed with no negative effects.');
  return { log, actions: [], ui: { title: 'Back-Alley Doc', outcome: log } };
}

// Buy a Round of Shots (D3 Wounds ignore Defense, +1 current Grit)
export async function performBuyRoundOfShots({ hero, posseApi, ui }) {
  const id = hero?.id || hero?.localId;
  if (!id) {
    return { actions: [], ui: { title: 'Buy a Round of Shots', outcome: ['No active hero.'] } };
  }

  const wounds = rollD3();

  const curGrit = Number(hero?.grit ?? hero?.currentGrit ?? 0);
  const maxGrit = Number(hero?.maxGrit ?? 3);
  const nextGrit = Math.min(curGrit + 1, maxGrit);

  const curHP = Number(hero?.health?.current ?? hero?.currentHealth ?? hero?.health ?? 0);
  const maxHP = Number(hero?.health?.max ?? hero?.maxHealth ?? curHP);
  const nextHP = Math.max(0, curHP - wounds);

  const actions = [{
    type: 'update',
    grit: nextGrit,                                // current/usable grit
    currentHealth: nextHP,
    health: { ...(hero?.health || {}), current: nextHP, max: maxHP },
  }];

  ui?.notify?.(`Shots taken: +1 Grit (now ${nextGrit}/${maxGrit}); took ${wounds} Wounds (ignores Defense).`);

  return {
    actions,
    ui: {
      title: 'Buy a Round of Shots',
      outcome: [
        `Recovered <b>+1 Grit</b> (now ${nextGrit}/${maxGrit}).`,
        `Took <b>${wounds}</b> Wounds (ignores Defense).`,
      ],
    },
  };
}

// Down a Dark Road (perm +1 Luck + Outlaw)
export async function performDownDarkRoad({ hero, posseApi, ui }) {
  const meId = hero?.id || hero?.localId;
  if (!meId) return { actions: [], ui: { title: 'Down a Dark Road', outcome: ['No active hero.'] } };

  if (hasKeyword(hero, 'Outlaw')) {
    return {
      actions: [],
      ui: { title: 'Down a Dark Road', outcome: ['Already an Outlaw — this option is not available.'] },
    };
  }

  const cond = {
    id: 'cond_down_dark_road',
    name: 'Down a Dark Road',
    type: 'other',
    permanent: true,
    active: true,
    effects: { Luck: 1 },
    note: 'Gained at Smuggler’s Den. Also grants the Outlaw keyword.',
    addedAt: Date.now(),
  };

  const prevConds = normalizeConditionsObject(hero?.conditions);
  const nextConds = withConditionAppended(prevConds, 'other', cond);
  const nextKeywords = addKeyword(hero?.keywords || [], 'Outlaw');

  const actions = [{ type: 'update', conditions: nextConds, keywords: nextKeywords }];

  return {
    actions,
    ui: { title: 'Down a Dark Road', outcome: ['+1 Luck (permanent) added as a condition.', 'Keyword granted: Outlaw.'] },
  };
}

/* ------------------------- NEW: Outlaw Actions -------------------------- */

// Bank Heist — Agility 5+ test, 1’s cause D6 Hits (defendable), payout = successes × Luck × $50.
// If 0 successes: arrested; simple escape test (Agility 4+) → +25 XP & end stay; else mark “Awaiting Hanging”.
export async function performBankHeist({ hero, posseApi, ui }) {
  const log = [];
  const id = hero?.id || hero?.localId;
  if (!id) return { log: ['No active hero.'] };

  let bonus = 0;
  let consumedExplosive = false;
  if (heroHasExplosive(hero)) {
    const use = await (ui?.promptYesNo
      ? ui.promptYesNo({ message: 'Use an Explosive for +3 Cunning on the heist setup roll?', defaultValue: true })
      : Promise.resolve(true));
    if (use) { bonus += 3; consumedExplosive = true; }
  }

  const baseAgi = clamp(getStat(hero, 'Agility'), 0, 6);
  const diceCount = clamp(baseAgi, 0, 6);

  // Prompted initial skill test
  const dice = (await ui?.roll?.(diceCount, 6, 'Bank Heist — Agility 5+ test')) || rollND(diceCount, 6);

  const successes = dice.filter((v) => v >= 5).length;
  const ones = dice.filter((v) => v === 1).length;

  log.push(`Bank Heist — Agility dice (${diceCount}): [${dice.join(', ')}], successes (5+) = ${successes}, 1’s = ${ones}.`);

  // Consume explosive if used
  if (consumedExplosive) {
    posseApi.updateHero(id, (prev) => {
      const { inventory, removed, removedItem } =
        removeOneInventoryItemByPredicate(prev, (it) => {
          const name = String(it?.name || '').toLowerCase();
          const tags = (it?.tags || []).map((t) => String(t).toLowerCase());
          return tags.includes('explosive') || /dynamite|shaped\s*charge|explosive/.test(name);
        });
      if (removed) log.push(`Explosive consumed: ${removedItem?.name || 'Explosive'}.`);
      return removed ? { ...prev, inventory } : prev;
    });
  }

  // Shootout from rolled 1's → each 1 becomes D6 Hits (defendable)
  let totalHits = 0;
  if (ones > 0) {
    const hitRolls = [];
    for (let i = 0; i < ones; i++) {
      const [hits] = (await ui?.roll?.(1, 6, `Shootout — Hits from "1" #${i + 1} (D6)`)) || [d6()];
      totalHits += hits;
      hitRolls.push(hits);
    }
    log.push(`Shootout! D6 Hits per "1": [${hitRolls.join(', ')}] → Total Hits = <b>${totalHits}</b>.`);

    // Defendable: roll Defense per hit
    let target = getDefenseTarget(hero);
    if (!target && ui?.promptNumber) {
      // fallback prompt if not discoverable
      target = await ui.promptNumber({
        title: 'Defense roll target (X+)?',
        message: 'Enter your Defense target (e.g., "4" for 4+). Leave blank for 6.',
        min: 2, max: 6, defaultValue: 6
      });
    }
    if (!target) target = 6;

    const defendRolls = (await ui?.roll?.(totalHits, 6, `Defense vs Hits — need ${target}+`)) || rollND(totalHits, 6);
    const blocks = defendRolls.filter((v) => v >= target).length;
    const wounds = Math.max(0, totalHits - blocks);

    if (totalHits > 0) {
      log.push(`Defense rolls: [${defendRolls.join(', ')}] → Blocks = ${blocks}, Wounds taken = <b>${wounds}</b>.`);
      // Apply wounds that got through (defendable, so NOT the "ignores Defense" path)
      if (wounds > 0) {
        posseApi.updateHero(id, (prev) => {
          const cur = num(prev?.currentHealth ?? prev?.health?.current ?? prev?.health, 0);
          const next = Math.max(0, cur - wounds);
          return {
            ...prev,
            currentHealth: next,
            health: { ...(prev?.health || {}), current: next }
          };
        });
        ui?.notify?.(`Bank Heist: Took ${wounds} Wound(s) after defense (${blocks} blocked).`);
      } else {
        ui?.notify?.('Bank Heist: All incoming hits were defended.');
      }
    }
  }

  // Always end the town stay after attempting the heist
  const endStay = () => {
    posseApi.updateHero(id, (prev) => ({
      ...prev,
      townVisitEnded: true,
      isDone: true,
      chosenLocation: null,
    }));
  };

  if (successes > 0) {
    const luck = clamp(getStat(hero, 'Luck'), 0, 6);
    const payout = successes * (luck * 50);
    posseApi.updateHero(id, (prev) => ({ ...prev, ...setGoldPatch(prev, payout) }));
    endStay();
    ui?.notify?.(`Bank Heist success: +$${payout}. Your Town Stay ends.`);
    log.push(`Score! Gained <b>$${payout}</b> (${successes} successes × Luck(${luck}) × $50). <i>Town Stay ends.</i>`);
    return { log, actions: [], ui: { title: 'Bank Heist', outcome: log } };
  }

  // Arrested → simple escape test (Agility 4+ on Agility dice)
  const agi = clamp(getStat(hero, 'Agility'), 0, 6);
  const escapeRolls = (await ui?.roll?.(agi, 6, 'Escape the Noose — Agility 4+')) || rollND(agi, 6);
  const escaped = escapeRolls.some((v) => v >= 4);
  log.push(`Arrested! Escape test — Agility dice (${agi}): [${escapeRolls.join(', ')}] → ${escaped ? 'ESCAPED' : 'FAILED'}.`);

  if (escaped) {
    posseApi.updateHero(id, (prev) => ({ ...prev, xp: num(prev?.xp, 0) + 25 }));
    endStay();
    ui?.notify?.('Bank Heist: Escaped the noose! +25 XP. Your Town Stay ends.');
    log.push('Escaped the hanging: +25 XP. <i>Town Stay ends.</i>');
  } else {
    posseApi.updateHero(id, (prev) => {
      const note = { id: `awaiting_hanging_${Date.now()}`, name: 'Awaiting Hanging', type: 'Status', active: true, addedAt: Date.now() };
      return { ...prev, ...addPermanentCondition(prev, note) };
    });
    endStay();
    ui?.notify?.('Bank Heist: Caught — marked as "Awaiting Hanging". Your Town Stay ends.');
    log.push('Caught — marked with Status: Awaiting Hanging. <i>Town Stay ends.</i>');
  }
  return { log, actions: [], ui: { title: 'Bank Heist', outcome: log } };
}

// Rustle Cattle — Agility dice, 5’s pay $50, 6’s pay $200; fail → 2D6 Wounds (ignores Defense)
export async function performRustleCattle({ hero, posseApi, ui }) {
  const log = [];
  const id = hero?.id || hero?.localId;
  if (!id) return { log: ['No active hero.'] };

  const hasTransport = heroHasTransport(hero);
  const baseAgi = clamp(getStat(hero, 'Agility'), 0, 6);
  const diceCount = clamp(baseAgi + (hasTransport ? 2 : 0), 0, 6);

  // Prompted initial skill test
  const dice = (await ui?.roll?.(diceCount, 6, `Rustle Cattle — Agility dice (5+${hasTransport ? ' with +2 dice (Transport)' : ''})`)) || rollND(diceCount, 6);

  const fives = dice.filter((v) => v === 5).length;
  const sixes = dice.filter((v) => v === 6).length;
  const successes = fives + sixes;
  const payout = fives * 50 + sixes * 200;

  log.push(`Rustle Cattle — Agility dice (${diceCount}${hasTransport ? ' with +2 (Transport)' : ''}): [${dice.join(', ')}].`);

  // Always end the town stay after the rustle attempt
  const endStay = () => {
    posseApi.updateHero(id, (prev) => ({
      ...prev,
      townVisitEnded: true,
      isDone: true,
      chosenLocation: null,
    }));
  };

  if (successes > 0) {
    posseApi.updateHero(id, (prev) => ({ ...prev, ...setGoldPatch(prev, payout) }));
    endStay();
    ui?.notify?.(`Rustle Cattle success: +$${payout}. Your Town Stay ends.`);
    log.push(`Haul secured: <b>$${payout}</b> ($50×${fives} + $200×${sixes}). <i>Town Stay ends.</i>`);
    return { log, actions: [], ui: { title: 'Rustle Cattle', outcome: log } };
  }

  const wRolls = (await ui?.roll?.(2, 6, 'Rustle Cattle — Wounds on failure (2D6), ignores Defense')) || rollND(2, 6);
  const wounds = wRolls.reduce((a, b) => a + b, 0);
  posseApi.updateHero(id, (prev) => ({ ...prev, ...decHealthIgnoringDefense(prev, wounds) }));
  endStay();
  ui?.notify?.(`Rustle Cattle failed: took ${wounds} Wounds (ignores Defense). Your Town Stay ends.`);
  log.push(`The cattle scatter! 2D6 = [${wRolls.join(', ')}] → Took <b>${wounds}</b> Wounds (ignores Defense). <i>Town Stay ends.</i>`);
  return { log, actions: [], ui: { title: 'Rustle Cattle', outcome: log } };
}

// Shady Contacts (kept minimal)
export async function performShadyContacts({ hero, posseApi, ui }) {
  const log = [];
  const id = hero?.id || hero?.localId;
  if (!id) return { log: ['No active hero.'] };

  const r = d6();
  const n = Math.max(0, r - 2);
  log.push(`Shady Contacts — you may look at the top <b>${n}</b> Daily Event card(s) and reorder them. (+10 XP)`);
  posseApi.updateHero(id, (prev) => ({ ...prev, xp: num(prev?.xp, 0) + 10 }));

  const s = loadTownState() || {};
  s._shadyContactsPeek = { count: n, time: Date.now(), heroId: id };
  saveTownState(s);

  ui?.notify?.(`Shady Contacts: peek ${n} Daily Event card(s) & +10 XP.`);
  return { log, actions: [], ui: { title: 'Shady Contacts', outcome: log } };
}

// Black Market Goods (unchanged)
export async function performBlackMarketGoods({ hero, posseApi, ui }) {
  const log = [];
  const id = hero?.id || hero?.localId;
  if (!id) return { log: ['No active hero.'] };

  const dice = (await ui?.roll?.(3, 6, 'Black Market Goods (3×D6)')) || rollND(3, 6);
  const drawn = [];

  for (let i = 0; i < 3; i++) {
    const r = Number(dice[i] ?? d6());
    if (r <= 3) {
      const gear = drawMinesGear();
      const loot = mkLootFromItem(gear, 'BlackMarket:Gear');
      drawn.push(loot);
      log.push(`Die ${i + 1}: ${r} → <b>Mines Gear</b>: ${loot?.name || 'Unknown'}`);
    } else {
      const artifact = drawWorldArtifactRandom();
      if (artifact) {
        const art = mkLootFromItem({ ...artifact, type: 'Artifact' }, 'BlackMarket:Artifact');
        drawn.push(art);
        const world = art.originWorld || 'Unknown World';
        log.push(`Die ${i + 1}: ${r} → <b>${world} Artifact</b>: ${art.name}`);
      } else {
        const gear = drawMinesGear();
        const loot = mkLootFromItem(gear, 'BlackMarket:Gear(Fallback)');
        drawn.push(loot);
        log.push(`Die ${i + 1}: ${r} → World data unavailable; drew <b>Mines Gear</b>.`);
      }
    }
  }

  pushLootCards(drawn);
  return {
    log,
    actions: [],
    ui: {
      title: 'Black Market Goods',
      description: [
        'Roll 3 dice for the posse:',
        '1–3: Draw a Mines Gear card.',
        '4–6: Draw an Artifact from a random Other World.',
        'All items go to the shared Black Market stock.',
      ],
      outcome: log,
    },
  };
}

// alias
export async function performSmugglerSurgery(args) { return performBackAlleyDoc(args); }
