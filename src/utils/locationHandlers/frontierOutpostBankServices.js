// src/utils/locationHandlers/frontierOutpostBankServices.js
import { d6 as D6, rollND, sum } from '../../utils/diceHelpers';

// -------- Engine / town-state --------
import { getEventState as getLocEventState } from '../locationEventsEngine';

// -------- Derived stats (gear/upgrades/conditions applied) --------
import { calculateCurrentStats } from '../calculateStats';

// -------- Small helpers --------
const heroIdOf = (h) => h?.id || h?.localId || h?._id || null;

/** Read the current Frontier Outpost event roll (if any). */
function readFOEventRoll() {
  const rec = getLocEventState('frontierOutpost');
  const r = Number(rec?.roll);
  return Number.isFinite(r) ? r : null;
}

/** Price base at Outpost Bank, affected by location event roll.
 *  - default: D6 × $25
 *  - roll 5 : D6 × $10
 *  - roll 9 : D6 × $50
 */
function getFOPriceBase() {
  const r = readFOEventRoll();
  if (r === 5) return 10;
  if (r === 9) return 50;
  return 25;
}

/** calculateCurrentStats wrapper: returns an object with merged/derived fields. */
function getEffective(hero) {
  try {
    const out = calculateCurrentStats(hero);
    // Common shapes we've seen across versions:
    //  - out.stats.{Agility,Cunning,Defense...}
    //  - out.derived.{defenseTN,...}  (if you expose this)
    //  - or direct props on 'out'
    return out || {};
  } catch {
    return {};
  }
}

/** Safely read a stat by trying a list of likely keys (case-insensitive). */
function pickStat(obj, keys) {
  if (!obj || typeof obj !== 'object') return undefined;
  const map = new Map(
    Object.entries(obj).map(([k, v]) => [String(k).toLowerCase(), v])
  );
  for (const k of keys) {
    const v = map.get(String(k).toLowerCase());
    if (v != null) return v;
  }
  return undefined;
}

/** Parse "4+" → 4, or plain numbers. Returns null if not parseable. */
function parseTN(raw) {
  if (raw == null) return null;
  if (typeof raw === 'string') {
    const m = raw.match(/(\d+)\s*\+/);
    if (m) return Number(m[1]);
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** Resolve Defense X+ target number from effective stats with robust fallbacks. */
function clampTN(n) {
  // Defense TNs in SoB sensibly live in [2, 6]
  if (!Number.isFinite(n)) return 6;
  return Math.max(2, Math.min(6, Math.floor(n)));
}

function getDefenseTN(stats, hero) {
  // Try the most likely derived keys first (common in your app)
  const candidates = [
    stats?.defenseTN,
    stats?.DefenseTN,
    stats?.defenseRoll,
    stats?.DefenseRoll,
    stats?.Defense,      // sometimes "4+"
    stats?.defense,
    hero?.Defense,
    hero?.defense,
    hero?.stats?.Defense,
    hero?.stats?.defense,
  ];

  // Parse like "4+" or plain 4
  const parseTN = (raw) => {
    if (raw == null) return null;
    if (typeof raw === 'string') {
      const m = raw.match(/(\d+)\s*\+/);
      if (m) return Number(m[1]);
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    }
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };

  for (const c of candidates) {
    const tn = parseTN(c);
    if (tn != null) return clampTN(tn);
  }

  // final sane default
  return 6;
}


/** Read a numeric stat (e.g., Agility, Cunning) from effective stats with fallbacks. */
function getNumDice(hero, statName, fallback = 1) {
  const eff = getEffective(hero);

  // Try effective stats first
  let v =
    pickStat(eff.stats || {}, [statName]) ??
    pickStat(eff, [statName]);

  // Then raw hero shapes
  if (v == null) {
    v =
      pickStat(hero?.stats || {}, [statName]) ??
      pickStat(hero, [statName]);
  }

  // Some people encode weirdly like "3+" for counts; accept numbers only
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Sell Dark Stone shards at the Bank: D6 × $base per shard (each shard rolled independently). */
async function performBankSellShards({ hero, posseApi, io }) {
  const base = getFOPriceBase();
  const hid = heroIdOf(hero);

  // Only shards tracked on the hero.darkStone counter
  const shardsOnHero = Math.max(0, Number(hero?.darkStone ?? 0));
  if (shardsOnHero <= 0) {
    io?.toast?.('You have no Dark Stone shards to sell.');
    return {
      log: ['No shards to sell.'],
      ui: {
        title: 'Sell Dark Stone (Bank)',
        description: [
          `Sell Dark Stone <b>shards</b> for <b>D6 × $${base}</b> each.`,
          'Roll for each shard individually.',
          ...(readFOEventRoll() === 5 ? ['(Event effect: prices down to D6×$10)'] : []),
          ...(readFOEventRoll() === 9 ? ['(Event effect: prices up to D6×$50)'] : []),
        ],
        outcome: ['No sale.'],
      },
    };
  }

  const count =
    (await io?.promptNumber?.('Sell how many shards?', {
      min: 0,
      max: shardsOnHero,
      defaultValue: shardsOnHero,
    })) ?? shardsOnHero;

  const n = Math.max(0, Math.min(shardsOnHero, Number(count) || 0));
  if (n <= 0) {
    io?.toast?.('No shards selected.');
    return {
      log: ['No shards selected.'],
      ui: {
        title: 'Sell Dark Stone (Bank)',
        description: [
          `Sell Dark Stone <b>shards</b> for <b>D6 × $${base}</b> each.`,
          'Roll for each shard individually.',
        ],
        outcome: ['Canceled.'],
      },
    };
  }

  // Roll once per shard
  const rolls = (await io?.roll?.(n, 6, `Bank: ${n}× D6 for shard values`)) || rollND(n, 6);
  const perShard = rolls.map((r) => r * base);
  const payout = sum(perShard);

  const log = [
    `Bank rate: D6 × $${base} per shard.`,
    `Shard rolls: [${rolls.join(', ')}] → per-shard $ values: [${perShard.join(', ')}]`,
    `Total payout: $${payout}`,
  ];

  const actions = [];
  if (posseApi?.updateHero && hid) {
    actions.push(
      posseApi.updateHero(hid, (h) => {
        const gold = Math.max(0, Number(h.gold ?? 0)) + payout;
        const darkStone = Math.max(0, Number(h.darkStone ?? 0) - n);
        return { ...h, gold, darkStone };
      })
    );
  } else {
    actions.push({
      type: 'HERO_UPDATE',
      heroId: hid,
      patch: { $inc: { gold: payout, darkStone: -n } },
    });
  }

  const ui = {
    title: 'Sell Dark Stone (Bank)',
    description: [
      `Sell Dark Stone <b>shards</b> for <b>D6 × $${base}</b> each.`,
      'Rolled individually (values vary by shard).',
      ...(readFOEventRoll() === 5 ? ['(Event effect: prices down to D6×$10)'] : []),
      ...(readFOEventRoll() === 9 ? ['(Event effect: prices up to D6×$50)'] : []),
    ],
    outcome: log,
  };

  io?.toast?.(`Sold ${n} shard(s) for $${payout}.`);
  return { log, actions, ui };
}

/** Hold Up The Bank.
 *  Steps:
 *   1) Agility test: roll Agility dice; 5+ are successes. Each 1 = incoming hits later.
 *   2) For each success, roll D6; sum × $50 payout.
 *   3) For each “1” from step 1, roll 1D6 hits; each hit gets a Defense X+ save.
 *      Each failed save = 1 damage (applied to currentHealth/health).
 *   4) If zero Agility successes → arrested → roll Cunning 3+ to escape (+20 XP, flee town). Fail = killed.
 */
async function performBankHoldUp({ hero, posseApi, townStateApi, io, forcedRolls = {} }) {
  const hid = heroIdOf(hero);

  // One heist per town stay (simple flag)
  const flagOnce = (api, flag, val = true) => {
    if (!api?.set || !api?.get) return;
    const s = api.get();
    const cur = s?.shopMods?.frontierOutpost || {};
    const next = { ...cur, [flag]: val };
    s.shopMods = { ...(s.shopMods || {}), frontierOutpost: next };
    api.set(s);
  };
  flagOnce(townStateApi, 'bankHeistDone', true);

  // --- Step 1: Agility test (5+) ---
  const agilityDice = Math.max(1, getNumDice(hero, 'Agility', 1));
  const agiRolls =
    forcedRolls.agi ||
    (await io?.roll?.(agilityDice, 6, `Agility ${agilityDice}d6 (5+ succeeds)`)) ||
    rollND(agilityDice, 6);

  const successes = agiRolls.filter((r) => r >= 5).length;
  const ones = agiRolls.filter((r) => r === 1).length;

  if (successes > 0) {
    // --- Step 2: Payout (each success → D6 × $50) ---
    const payoutRolls =
      forcedRolls.payout ||
      (await io?.roll?.(successes, 6, `Payout: ${successes}× D6`)) ||
      rollND(successes, 6);
    const payout = sum(payoutRolls) * 50;

    // --- Step 3: Shootout damage from “1”s ---
    const defenseTN = getDefenseTN(hero);
    let totalHits = 0;
    let hitRolls = [];
    if (ones > 0) {
      hitRolls =
        forcedRolls.hits ||
        (await io?.roll?.(ones, 6, `Shootout: ${ones}× D6 hits (from rolled 1s)`)) ||
        rollND(ones, 6);
      totalHits = sum(hitRolls);
    }

    let defenseRolls = [];
    let defenseSaves = 0;
    if (totalHits > 0) {
      defenseRolls =
        forcedRolls.def ||
        (await io?.roll?.(totalHits, 6, `Defense ${defenseTN}+ : roll ${totalHits}d6`)) ||
        rollND(totalHits, 6);
      defenseSaves = defenseRolls.filter((r) => r >= defenseTN).length;
    }
    const damageTaken = Math.max(0, totalHits - defenseSaves);

    const actions = [];
    if (posseApi?.updateHero && hid) {
      actions.push(
        posseApi.updateHero(hid, (h) => {
          const gold = Math.max(0, Number(h.gold ?? 0)) + payout;
          const next = { ...h, gold };
          if (damageTaken > 0) {
            // Prefer currentHealth if you track it; otherwise 'health'
            const cur = Number(h.currentHealth ?? h.health ?? h.maxHealth ?? 0);
            const after = Math.max(0, cur - damageTaken);
            if ('currentHealth' in h || !('health' in h)) next.currentHealth = after;
            else next.health = after;
          }
          return next;
        })
      );
    } else {
      const patch = { $inc: { gold: payout } };
      if (damageTaken > 0) {
        // Use currentHealth if you store it, otherwise health
        patch.$inc = patch.$inc || {};
        patch.$inc.currentHealth = -(damageTaken);
      }
      actions.push({ type: 'HERO_UPDATE', heroId: hid, patch });
    }

    const out = [
      `Agility test: **[${agiRolls.join(', ')}]** → successes **${successes}**, ones **${ones}**`,
      `Payout rolls: **[${payoutRolls.join(', ')}]** → **$${payout}**`,
    ];
    if (totalHits > 0) {
      out.push(
        `Shootout hits (for ${ones} ones): **[${hitRolls.join(', ')}]** → **${totalHits} hits**`,
        `Defense ${defenseTN}+: **[${defenseRolls.join(', ')}]** → saves **${defenseSaves}**, damage **${damageTaken}**`
      );
    }

    const ui = {
      title: 'Hold Up the Bank',
      description: [
        'Make an <b>Agility 5+</b> test (roll Agility dice).',
        'Each success → gain <b>D6 × $50</b>.',
        'Each <b>1</b> rolled → take a Shootout: roll 1D6 hits; each hit has a Defense X+ save.',
        'Each failed save = 1 damage.',
      ],
      outcome: out,
    };

    io?.toast?.(`Heist succeeded! +$${payout}${damageTaken ? `, took ${damageTaken} damage` : ''}.`);
    return { log: out, actions, ui };
  }

  // --- Step 4: Arrested → Cunning 3+ to escape (+20 XP & flee town). Fail = killed. ---
  const cunningDice = Math.max(1, getNumDice(hero, 'Cunning', 1));
  const cunRolls =
    forcedRolls.cun ||
    (await io?.roll?.(cunningDice, 6, `Cunning ${cunningDice}d6 (3+ to escape)`)) ||
    rollND(cunningDice, 6);
  const escaped = cunRolls.some((r) => r >= 3);

  if (escaped) {
    const actions = [];
    if (posseApi?.updateHero && hid) {
      actions.push(
        posseApi.updateHero(hid, (h) => {
          const xp = Math.max(0, Number(h.xp ?? 0)) + 20;
          // End the town stay
          return { ...h, xp, chosenLocation: null, isDone: true, lodging: null };
        })
      );
    } else {
      actions.push({
        type: 'HERO_UPDATE',
        heroId: hid,
        patch: { $inc: { xp: 20 }, chosenLocation: null, isDone: true, lodging: null },
      });
    }

    const out = [
      `Agility test failed: **[${agiRolls.join(', ')}]** → arrested.`,
      `Cunning escape (3+): **[${cunRolls.join(', ')}]** → ESCAPED (+20 XP).`,
      'You flee town; your stay is over.',
    ];
    io?.toast?.('Escaped the noose! You flee town (+20 XP).');

    return {
      log: out,
      actions,
      ui: {
        title: 'Hold Up the Bank — Escape!',
        description: [
          'Arrested after failed heist.',
          'Make a <b>Cunning 3+</b> test to escape (+20 XP) and flee town.',
        ],
        outcome: out,
      },
    };
  }

  // Killed
  const out = [
    `Agility test failed: **[${agiRolls.join(', ')}]** → arrested.`,
    `Cunning escape (3+): **[${cunRolls.join(', ')}]** → FAILED.`,
    'Hero is <b>KILLED</b>.',
  ];

  const actions = [];
  if (posseApi?.updateHero && hid) {
    actions.push(posseApi.updateHero(hid, (h) => ({ ...h, health: 0, currentHealth: 0, isDead: true })));
  } else {
    actions.push({ type: 'HERO_UPDATE', heroId: hid, patch: { health: 0, currentHealth: 0, isDead: true } });
  }

  io?.toast?.('You failed to escape the noose. Hero is killed.');
  return {
    log: out,
    actions,
    ui: {
      title: 'Hold Up the Bank — Execution',
      description: [
        'Arrested after failed heist.',
        'Failed the <b>Cunning 3+</b> escape test.',
      ],
      outcome: out,
    },
  };
}

/** Router used by TownTab */
export async function performOutpostBankService({ serviceId, hero, posseApi, townStateApi, io }) {
  if (serviceId === 'fo_bank_sell_dark_stone') {
    return performBankSellShards({ hero, posseApi, io });
  }
  if (serviceId === 'fo_bank_hold_up') {
    return performBankHoldUp({ hero, posseApi, townStateApi, io });
  }
  return {
    log: ['[Bank] Service not implemented.'],
    ui: {
      title: 'Frontier Outpost Bank',
      description: [],
      outcome: ['Service not implemented.'],
    },
  };
}
