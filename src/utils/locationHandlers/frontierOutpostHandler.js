// src/utils/locationHandlers/frontierOutpostHandler.js
//
// Frontier Outpost – Location Event handler (2d6 table)
//
// Matches effects from src/data/townLocations/frontierOutpost.js:
//  2  Mad with Power        – daily Agility/Cunning 5+ gate; on fail pay D6×$50 or leave
//  3  Dark Stone Explosion  – Strength 5+; pass: +20 XP; fail: lose D6 Dark Stone; Outpost destroyed
//  4  Ambushed Caravan      – -1 to Town Event & Camp Site Hazard rolls
//  5  Dark Stone Glut       – Dark Stone sold worth D6×$10 per shard (auto-roll, ask to sell now)
//  6  Hanging               – lose 1 Grit (current)
//  7  Trading Post          – auto “World Card” + Artifact; D6×$100 offer stored in stayMods
//  8  The Banners Yet Wave  – fully heal Health/Sanity +1 Grit
//  9  Dark Stone Shortage   – Dark Stone sold worth D6×$50 per shard (auto-roll, ask to sell now)
// 10  The Sound of Bugles   – skip next Town Event
// 11  War Stories           – add a Buff entry for one Damage reroll next Adventure
// 12  Deputized             – Gain Law; if Outlaw, choose which to keep
//
// NOTE: flags for disabling Training with Soldiers (#2) and destroying the Outpost (#3)
//       are still handled by locationEventsEngine.applyFrontierOutpostEventSideEffects.
//       Here we handle tests, XP, Dark Stone, gold, grit, healing, buffs, etc.

import { calculateCurrentStats } from '../calculateStats';
import { otherWorldArtifacts } from '../../data/items/otherWorldArtifacts.js';

const d6 = () => Math.floor(Math.random() * 6) + 1;

/* ------------------------------ small helpers ------------------------------ */

const safeNumber = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

function updateStayMods(townStateApi, mutate) {
  if (!townStateApi || typeof townStateApi.get !== 'function' || typeof townStateApi.set !== 'function') return;

  const state = townStateApi.get() || {};
  const stayMods = { ...(state.stayMods || {}) };

  mutate(stayMods);

  townStateApi.set({ ...state, stayMods });
}

function getActiveHero(ctx) {
  if (ctx.hero) return ctx.hero;

  const posseApi = ctx.posseApi || ctx.io?.posseApi;
  const id = posseApi?.getActiveHeroId?.() || posseApi?.getCurrentHeroId?.();
  if (!id || !posseApi?.getHero) return null;
  return posseApi.getHero(id) || null;
}

// Patch-style helper – prefers posseApi helpers but falls back to updateHero
function addGold(posseApi, hero, amount) {
  const hid = hero?.id || hero?.localId;
  const delta = Number(amount) || 0;
  if (!hid || !delta) return;

  if (typeof posseApi?.addGold === 'function') {
    posseApi.addGold(hid, delta);
    return;
  }

  const cur = safeNumber(hero.gold ?? hero.Gold ?? 0, 0);
  posseApi?.updateHero?.(hid, { gold: cur + delta });
}

function spendGold(posseApi, hero, amount) {
  const cost = Math.abs(Number(amount) || 0);
  if (!cost) return;
  addGold(posseApi, hero, -cost);
}

function spendDarkStone(posseApi, hero, amount) {
  const hid = hero?.id || hero?.localId;
  const loss = Math.abs(Number(amount) || 0);
  if (!hid || !loss) return;

  if (typeof posseApi?.spendDarkStone === 'function') {
    posseApi.spendDarkStone(hid, loss);
    return;
  }

  const cur =
    safeNumber(hero.darkStone, null) ??
    safeNumber(hero.darkstone, null) ??
    safeNumber(hero.DarkStone, 0);
  const next = Math.max(0, cur - loss);
  const patch = {};

  if (Object.prototype.hasOwnProperty.call(hero, 'darkStone')) patch.darkStone = next;
  else if (Object.prototype.hasOwnProperty.call(hero, 'darkstone')) patch.darkstone = next;
  else patch.DarkStone = next;

  posseApi?.updateHero?.(hid, patch);
}

function sellAllDarkStone(posseApi, hero, ratePerShard, noteFn) {
  const hid = hero?.id || hero?.localId;
  if (!hid) return;

  const cur =
    safeNumber(hero.darkStone, null) ??
    safeNumber(hero.darkstone, null) ??
    safeNumber(hero.DarkStone, 0);

  if (cur <= 0) {
    noteFn?.(`${hero.name || 'Hero'} has no Dark Stone to sell.`);
    return;
  }

  const totalGold = cur * ratePerShard;

  // Zero out Dark Stone
  const patch = {};
  if (Object.prototype.hasOwnProperty.call(hero, 'darkStone')) patch.darkStone = 0;
  else if (Object.prototype.hasOwnProperty.call(hero, 'darkstone')) patch.darkstone = 0;
  else patch.DarkStone = 0;

  // Apply Dark Stone removal
  posseApi?.updateHero?.(hid, patch);

  // Add gold
  addGold(posseApi, hero, totalGold);
  noteFn?.(
    `${hero.name || 'Hero'} sells ${cur} Dark Stone shard(s) for $${totalGold} ($${ratePerShard} each).`
  );
}

// Prefer uiApi.choose (buttons), then io.promptChoice, then window.prompt.
async function chooseOption(uiApi, io, { title, message, options }) {
  // 1) Modern button modal
  if (uiApi && typeof uiApi.choose === 'function') {
    try {
      const res = await uiApi.choose({ title, message, options });
      if (res?.id) {
        const found = options.find((o) => o.id === res.id);
        if (found) return found;
      }
    } catch (e) {
      console.warn('FrontierOutpost uiApi.choose error:', e);
    }
  }

  // 2) Legacy promptChoice
  if (io && typeof io.promptChoice === 'function') {
    try {
      const idx = await io.promptChoice(title, options);
      if (Number.isInteger(idx) && idx >= 0 && idx < options.length) {
        return options[idx];
      }
    } catch (e) {
      console.warn('FrontierOutpost io.promptChoice error:', e);
    }
  }

  // 3) Fallback: window.prompt with numbered options
  if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
    const lines = [
      title || 'Choose an option',
      '',
      message || '',
      '',
      ...options.map((opt, i) => `${i + 1}. ${opt.label}`),
      '',
      'Enter the number of your choice:',
    ].join('\n');

    const raw = window.prompt(lines, '1');
    if (raw == null) return options[0];
    const n = Number(raw);
    if (Number.isInteger(n) && n >= 1 && n <= options.length) {
      return options[n - 1];
    }
    return options[0];
  }

  // 4) Absolute last resort
  return options[0];
}

// Use uiApi.roll if available, otherwise io.roll, otherwise Math.random.
async function rollDice(uiApi, io, count, sides = 6, label = '') {
  const n = Math.max(0, Number(count || 0));
  if (n <= 0) return [];

  if (uiApi && typeof uiApi.roll === 'function') {
    try {
      const out = await uiApi.roll(n, sides, label);
      if (Array.isArray(out) && out.length === n) return out;
    } catch (e) {
      console.warn('FrontierOutpost uiApi.roll error:', e);
    }
  }

  if (io && typeof io.roll === 'function') {
    try {
      const out = await io.roll(n, sides, label);
      if (Array.isArray(out) && out.length === n) return out;
    } catch (e) {
      console.warn('FrontierOutpost io.roll error:', e);
    }
  }

  return Array.from({ length: n }, () => Math.floor(Math.random() * sides) + 1);
}

// Generic “stat test with autoroll” helper: returns { passed, rolls? }
async function promptTestWithAutoRoll({
  uiApi,
  io,
  note,
  heroName,
  statLabel,
  diceCount,
  target = 5,
  title,
}) {
  const dice = Math.max(0, Number(diceCount || 0));

  if (dice <= 0) {
    note(
      `${heroName} has ${statLabel} 0 and automatically fails the ${statLabel} test (needs ${target}+).`
    );
    return { passed: false, rolls: [] };
  }

  const choice = await chooseOption(uiApi, io, {
    title: title || `${statLabel} Test`,
    message:
      `${heroName} (${statLabel} ${dice}) must roll ${dice}d6, succeeding on any ${target}+.\n\n` +
      'Did they pass, fail, or let the app roll?',
    options: [
      { id: 'pass', label: 'I rolled and passed' },
      { id: 'fail', label: 'I rolled and failed' },
      { id: 'auto', label: `Auto-roll ${dice}d6 now` },
    ],
  });

  const mode = choice?.id || 'auto';

  if (mode === 'pass') {
    note(`${heroName} passed the ${statLabel} test (player-rolled).`);
    return { passed: true, rolls: [] };
  }
  if (mode === 'fail') {
    note(`${heroName} failed the ${statLabel} test (player-rolled).`);
    return { passed: false, rolls: [] };
  }

  // Autoroll branch
  const rolls = await rollDice(
    uiApi,
    io,
    dice,
    6,
    `${statLabel} Test (${target}+)`
  );
  const success = rolls.some((r) => r >= target);
  note(
    `${heroName} auto-rolls ${statLabel}: [${rolls.join(', ')}] → ${
      success ? 'Success' : 'Fail'
    }.`
  );
  return { passed: success, rolls };
}

/* ------------------------------- main handler ------------------------------- */

export async function handleFrontierOutpostEvent(ctx = {}) {
  const io = ctx.io || {};
  const posseApi = ctx.posseApi || io.posseApi || {};
  const townStateApi = ctx.townStateApi || io.townStateApi;
  const uiApi = ctx.uiApi || io.uiApi || io;

  const toastFn =
    (uiApi && typeof uiApi.toast === 'function'
      ? uiApi.toast.bind(uiApi)
      : typeof io.toast === 'function'
      ? io.toast.bind(io)
      : null);

  const log = [];
  const actions = [];

  const note = (msg) => {
    log.push(msg);
    if (toastFn) toastFn(msg);
  };

  const roll = ctx.forcedRoll ?? (d6() + d6());

  const hero = getActiveHero(ctx);
  const heroId = hero?.id || hero?.localId;

  // --------------------------------------------------------------------------
  // 2 – Mad with Power
  // --------------------------------------------------------------------------
  if (roll === 2) {
    // Engine already flags: fo_training_disabled = true
    updateStayMods(townStateApi, (mods) => {
      mods.foDailyGateTest = true; // so your start-of-day code can enforce it later if desired
    });

    const allHeroes =
      posseApi.listHeroes?.() ||
      posseApi.getAllHeroes?.() ||
      (hero ? [hero] : []) ||
      [];

    if (!allHeroes.length) {
      note('Frontier Outpost (#2): No heroes in the posse to test.');
    } else {
      note(
        'Frontier Outpost (#2): Mad with Power – Training with Soldiers is disabled, and at the start of each day each hero must pass an Agility/Cunning gate test or pay/leave.'
      );
    }

    for (const h of allHeroes) {
      const hid = h.id || h.localId;
      if (!hid) continue;

      const merged = calculateCurrentStats ? calculateCurrentStats(h || {}) : null;
      const stats = merged?.stats || {};

      const agi =
        safeNumber(stats['Agility'] ?? h.stats?.Agility ?? h.Agility ?? 0, 0);
      const cun =
        safeNumber(stats['Cunning'] ?? h.stats?.Cunning ?? h.Cunning ?? 0, 0);

      // Step 1: choose Agility or Cunning via buttons
      const statChoice = await chooseOption(uiApi, io, {
        title: 'Frontier Outpost (#2) — Gate Test',
        message:
          `${h.name || 'Hero'} must take a gate test at the start of the day.\n\n` +
          `Agility: ${agi}\n` +
          `Cunning: ${cun}\n\n` +
          'Choose which stat to roll (5+ on any die succeeds).',
        options: [
          { id: 'agi', label: `Use Agility (${agi}d6, 5+)` },
          { id: 'cun', label: `Use Cunning (${cun}d6, 5+)` },
        ],
      });

      const which = statChoice?.id === 'cun' ? 'cun' : 'agi';
      const statLabel = which === 'cun' ? 'Cunning' : 'Agility';
      const diceCount = which === 'cun' ? cun : agi;

      // Step 2: Pass / Fail / Autoroll
      const { passed } = await promptTestWithAutoRoll({
        uiApi,
        io,
        note,
        heroName: h.name || 'Hero',
        statLabel,
        diceCount,
        target: 5,
        title: `Frontier Outpost (#2) — ${statLabel} 5+`,
      });

      if (passed) {
        note(
          `Frontier Outpost (#2): ${h.name || 'Hero'} passes and may continue the day as normal.`
        );
        continue;
      }

      // Step 3: failed → auto D6×$50 then Pay vs Leave
      const cost = d6() * 50;

      const payChoice = await chooseOption(uiApi, io, {
        title: 'Frontier Outpost (#2) — Pay or Leave',
        message:
          `${h.name || 'Hero'} failed the gate test.\n\n` +
          `They must either:\n` +
          `• Leave town immediately\n` +
          `• Or pay $${cost} (D6 × $50) to stay.`,
        options: [
          { id: 'pay', label: `Pay $${cost} and stay in town` },
          { id: 'leave', label: 'Leave town immediately' },
        ],
      });

      if (payChoice?.id === 'pay') {
        spendGold(posseApi, h, cost);
        note(
          `Frontier Outpost (#2): ${h.name || 'Hero'} pays $${cost} and may remain in town.`
        );
      } else {
        note(
          `Frontier Outpost (#2): ${h.name || 'Hero'} leaves town immediately. ` +
            'Move them out of town using your usual campaign controls.'
        );
      }
    }
  }

  // --------------------------------------------------------------------------
  // 3 – Dark Stone Explosion
  // --------------------------------------------------------------------------
  if (roll === 3) {
    // Engine already flags: fo_closed = true
    if (!hero) {
      note(
        'Frontier Outpost (#3): Dark Stone Explosion – no active hero, resolve effects manually.'
      );
    } else {
      const merged = calculateCurrentStats ? calculateCurrentStats(hero || {}) : null;
      const stats = merged?.stats || {};
      const str =
        safeNumber(
          stats['Strength'] ?? hero.stats?.Strength ?? hero.Strength ?? 0,
          0
        );

      const { passed } = await promptTestWithAutoRoll({
        uiApi,
        io,
        note,
        heroName: hero.name || 'Hero',
        statLabel: 'Strength',
        diceCount: str,
        target: 5,
        title: 'Frontier Outpost (#3) — Strength 5+ vs Tentacles',
      });

      if (passed) {
        // +20 XP – helper if present; else patch
        if (typeof posseApi.addXP === 'function') {
          posseApi.addXP(heroId, 20);
        } else {
          const curXP = safeNumber(hero.xp ?? hero.XP ?? 0, 0);
          posseApi.updateHero?.(heroId, { xp: curXP + 20 });
        }
        note(
          `Frontier Outpost (#3): ${hero.name || 'Hero'} passes and gains 20 XP, escaping with their life!`
        );
      } else {
        const loss = d6();
        spendDarkStone(posseApi, hero, loss);
        note(
          `Frontier Outpost (#3): ${hero.name || 'Hero'} fails – the tentacles steal D6 Dark Stone (rolled ${loss}).`
        );
      }
    }

    note(
      'Frontier Outpost (#3): The Outpost is destroyed and may no longer be visited for the rest of this Town Stay.'
    );
  }

  // --------------------------------------------------------------------------
  // 4 – Ambushed Caravan
  // --------------------------------------------------------------------------
  if (roll === 4) {
    updateStayMods(townStateApi, (mods) => {
      const cur = safeNumber(mods.hazardRollMod || 0, 0);
      mods.hazardRollMod = Math.min(cur, -1);
    });
    note(
      'Frontier Outpost (#4): Ambushed Caravan – All Town Event and Camp Site Hazard rolls are –1 for the rest of this Town Stay.'
    );
  }

  // --------------------------------------------------------------------------
  // 5 – Dark Stone Glut (auto D6, then ask if hero wants to sell now)
  // --------------------------------------------------------------------------
  if (roll === 5) {
    const rate = d6() * 10;

    updateStayMods(townStateApi, (mods) => {
      mods.foDarkStoneRate = {
        rate,
        mode: 'glut',
        source: 'FrontierOutpost#5',
      };
    });

    note(
      `Frontier Outpost (#5): Dark Stone Glut – Dark Stone sold to the Outpost Bank is worth $${rate} per shard today.`
    );

    if (hero) {
      const choice = await chooseOption(uiApi, io, {
        title: 'Dark Stone Glut — Sell Now?',
        message:
          `${hero.name || 'Hero'} may immediately sell all their Dark Stone for ` +
          `$${rate} per shard.\n\nDo you want to sell now or keep it?`,
        options: [
          { id: 'sell', label: `Sell all Dark Stone at $${rate} each` },
          { id: 'keep', label: 'Keep it for later' },
        ],
      });

      if (choice?.id === 'sell') {
        sellAllDarkStone(posseApi, hero, rate, note);
      } else {
        note(
          `${hero.name || 'Hero'} keeps their Dark Stone but may still use the $${rate}/shard rate today when visiting the Outpost Bank.`
        );
      }
    }
  }

  // --------------------------------------------------------------------------
  // 6 – Hanging (lose 1 Grit from current pool)
  // --------------------------------------------------------------------------
  if (roll === 6) {
    if (!heroId) {
      note(
        'Frontier Outpost (#6): Hanging – the visiting hero loses 1 Grit (no active hero found; adjust manually).'
      );
    } else {
      const curGrit =
        safeNumber(hero.currentGrit, null) ??
        safeNumber(hero.grit, null) ??
        safeNumber(hero.Grit, 0);

      const next = Math.max(0, curGrit - 1);
      const patch = {};

      if (Object.prototype.hasOwnProperty.call(hero, 'currentGrit')) patch.currentGrit = next;
      else if (Object.prototype.hasOwnProperty.call(hero, 'grit')) patch.grit = next;
      else patch.currentGrit = next;

      posseApi.updateHero?.(heroId, patch);

      note(
        `Frontier Outpost (#6): Hanging – ${hero?.name || 'Hero'} loses 1 Grit (now ${next}).`
      );
    }
  }

  // --------------------------------------------------------------------------
  // 7 – Trading Post (auto World Card + Artifact, D6×$100 offer)
  // --------------------------------------------------------------------------
  // 7 – Trading Post (auto World Card + Artifact, D6×$150 offer)
if (roll === 7) {
  // Group artifacts by world
  const byWorld = otherWorldArtifacts.reduce((acc, art) => {
    const w = art.world || 'Unknown';
    if (!acc[w]) acc[w] = [];
    acc[w].push(art);
    return acc;
  }, {});

  const worlds = Object.keys(byWorld);
  if (!worlds.length) {
    note(
      'Frontier Outpost (#7): Trading Post – No OtherWorld Artifacts found in data; resolve manually.'
    );
  } else {
    const world = worlds[Math.floor(Math.random() * worlds.length)];
    const pool = byWorld[world] || [];
    const artifact =
      pool[Math.floor(Math.random() * pool.length)] || pool[0];

    // ⭐ Correct price: D6 × $150
    const price = d6() * 150;

    updateStayMods(townStateApi, (mods) => {
      mods.foWorldArtifactOffer = {
        id: 'fo_world_artifact',
        world,
        artifactId: artifact.id,
        artifactName: artifact.name,
        price,
        purchasedBy: mods.foWorldArtifactOffer?.purchasedBy || null,
        locationId: 'frontierOutpost',
      };
    });

    note(
      `Frontier Outpost (#7): Trading Post – World Card drawn: ${world}. Artifact: ${artifact.name}. ` +
        `The party may purchase it for $${price} (D6 × $150).`
    );
  }
}


  // --------------------------------------------------------------------------
  // 8 – The Banners Yet Wave (heal +1 Grit)
  // --------------------------------------------------------------------------
  if (roll === 8) {
    if (!heroId) {
      note(
        'Frontier Outpost (#8): The Banners Yet Wave – the visiting hero fully heals Health/Sanity and gains +1 Grit (no active hero found; adjust manually).'
      );
    } else {
      const merged = calculateCurrentStats ? calculateCurrentStats(hero || {}) : null;
      const stats = merged?.stats || {};

      const maxHealth =
        safeNumber(
          stats['Health'] ?? hero.stats?.Health ?? hero.maxHealth ?? hero.health,
          0
        );
      const maxSanity =
        safeNumber(
          stats['Sanity'] ?? hero.stats?.Sanity ?? hero.maxSanity ?? hero.sanity,
          0
        );

      // Heal to full
      const patch = {
        currentHealth: maxHealth,
        currentSanity: maxSanity,
      };

      // +1 Grit
      const curGrit =
        safeNumber(hero.currentGrit, null) ??
        safeNumber(hero.grit, null) ??
        safeNumber(hero.Grit, 0);
      const nextGrit = curGrit + 1;

      if (Object.prototype.hasOwnProperty.call(hero, 'currentGrit')) patch.currentGrit = nextGrit;
      else if (Object.prototype.hasOwnProperty.call(hero, 'grit')) patch.grit = nextGrit;
      else patch.currentGrit = nextGrit;

      posseApi.updateHero?.(heroId, patch);

      note(
        `Frontier Outpost (#8): ${hero?.name || 'Hero'} fully heals Health (${maxHealth}) and Sanity (${maxSanity}) and gains +1 Grit (now ${nextGrit}).`
      );
    }
  }

  // --------------------------------------------------------------------------
  // 9 – Dark Stone Shortage (auto D6, then ask if hero wants to sell now)
  // --------------------------------------------------------------------------
  if (roll === 9) {
    const rate = d6() * 50;

    updateStayMods(townStateApi, (mods) => {
      mods.foDarkStoneRate = {
        rate,
        mode: 'shortage',
        source: 'FrontierOutpost#9',
      };
    });

    note(
      `Frontier Outpost (#9): Dark Stone Shortage – you may sell Dark Stone shards for $${rate} each today.`
    );

    if (hero) {
      const choice = await chooseOption(uiApi, io, {
        title: 'Dark Stone Shortage — Sell Now?',
        message:
          `${hero.name || 'Hero'} may immediately sell all their Dark Stone for ` +
          `$${rate} per shard.\n\nDo you want to sell now or keep it?`,
        options: [
          { id: 'sell', label: `Sell all Dark Stone at $${rate} each` },
          { id: 'keep', label: 'Keep it for later' },
        ],
      });

      if (choice?.id === 'sell') {
        sellAllDarkStone(posseApi, hero, rate, note);
      } else {
        note(
          `${hero.name || 'Hero'} keeps their Dark Stone but may still use the $${rate}/shard rate today when visiting the Outpost Bank.`
        );
      }
    }
  }

  // --------------------------------------------------------------------------
  // 10 – The Sound of Bugles (skip next Town Event)
  // --------------------------------------------------------------------------
  if (roll === 10) {
    updateStayMods(townStateApi, (mods) => {
      mods.skipNextTownEvent = true;
    });
    note(
      'Frontier Outpost (#10): The Sound of Bugles – Do not roll for a Town Event at the end of this day in Town.'
    );
  }

  // --------------------------------------------------------------------------
  // 11 – War Stories (add Buff for Damage reroll)
  // --------------------------------------------------------------------------
 if (roll === 11) {
  // However your engine exposes the current hero:
  const hero =
    ctx.hero ||
    ctx.getActiveHero?.() ||
    (ctx.getActiveHeroId && ctx.getHero?.(ctx.getActiveHeroId())) ||
    null;

  if (hero) {
    const heroId = hero.id || hero.localId;
    const updateHero = ctx.posseApi?.updateHero || ctx.updateHero;

    if (updateHero && heroId) {
      updateHero(heroId, (prev) => {
        const prevBuffs = Array.isArray(prev.oncePerAdventure)
          ? prev.oncePerAdventure
          : [];

        // Avoid duplicate entries if it somehow fires twice for same hero
        if (prevBuffs.some(b => b.id === 'war_stories_damage_reroll')) {
          return prev;
        }

        const nextBuffs = [
          ...prevBuffs,
          {
            id: 'war_stories_damage_reroll',
            name: 'War Stories (Damage Reroll)',
            used: false,
            notes: 'Once during the next Adventure, you may reroll a Damage roll.',
            source: 'Frontier Outpost (#11)',
            usesRemaining: 1, // optional, your Buffs tab will just ignore this for now
          },
        ];

        return {
          ...prev,
          oncePerAdventure: nextBuffs,
          updatedAt: Date.now(),
        };
      });

      const heroName = hero.name || 'the hero';
      ctx.note?.(
        `Frontier Outpost (#11): ${heroName} gains a Buff – "War Stories (Damage Reroll)" (1 use, next Adventure).`
      );
    }
  }
}



  // --------------------------------------------------------------------------
  // 12 – Deputized (Law / Outlaw keyword choice)
  // --------------------------------------------------------------------------
  if (roll === 12) {
    if (!heroId) {
      note(
        'Frontier Outpost (#12): Deputized – Gain Law. If the hero already has Outlaw, choose which to keep. Adjust keywords manually.'
      );
    } else {
      const kws = Array.isArray(hero.keywords) ? [...hero.keywords] : [];
      const hasLaw = kws.includes('Law');
      const hasOutlaw = kws.includes('Outlaw');

      if (!hasLaw && !hasOutlaw) {
        const next = [...kws, 'Law'];
        posseApi?.updateHero?.(heroId, { keywords: next });
        note(
          `Frontier Outpost (#12): ${hero.name || 'Hero'} gains the Law keyword.`
        );
      } else if (hasLaw && !hasOutlaw) {
        note(
          `Frontier Outpost (#12): ${hero.name || 'Hero'} already has Law. No change.`
        );
      } else if (!hasLaw && hasOutlaw) {
        const keepChoice = await chooseOption(uiApi, io, {
          title: 'Frontier Outpost (#12) — Law vs Outlaw',
          message:
            `${hero.name || 'Hero'} already has Outlaw.\n` +
            'Choose which keyword to keep:',
          options: [
            { id: 'law', label: 'Keep Law (remove Outlaw)' },
            { id: 'outlaw', label: 'Keep Outlaw (no Law)' },
          ],
        });

        const keep = keepChoice?.id === 'outlaw' ? 'Outlaw' : 'Law';

        let next = kws.filter((kw) => kw !== 'Law' && kw !== 'Outlaw');
        next.push(keep);

        posseApi?.updateHero?.(heroId, { keywords: next });
        note(
          `Frontier Outpost (#12): ${hero.name || 'Hero'} keeps the ${keep} keyword.`
        );
      } else {
        // Already somehow has both
        note(
          `Frontier Outpost (#12): ${hero.name || 'Hero'} already has both Law and Outlaw; no keyword change.`
        );
      }
    }
  }

  return {
    log,
    actions,
    townState: ctx.townState,
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}
