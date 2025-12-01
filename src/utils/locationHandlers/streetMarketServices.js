// src/utils/locationHandlers/streetMarketServices.js
import { rollPeril, rollD6, rollND, sum } from '../diceHelpers';

// Optional: will no-op if your engine isn't wired yet for this location
import {
  getEventState as _getLocEventState,
  ensureEventRolled as _ensureLocEventRolled,
} from '../locationEventsEngine';

/* -------------------- small UI helpers (non-breaking) -------------------- */
// Use uiApi when present; otherwise fall back to window.* or params.

async function promptYesNo(ui, message, def = false, paramsKey, params = {}) {
  if (ui?.promptYesNo) return !!(await ui.promptYesNo({ message, defaultValue: def }));
  if (typeof window !== 'undefined' && window.confirm) return !!window.confirm(message);
  if (paramsKey in (params || {})) return !!params[paramsKey];
  return def;
}

async function promptNumber(
  ui,
  message,
  { min = 0, max = 999999, step = 1, def = 0 } = {},
  paramsKey,
  params = {}
) {
  if (ui?.promptNumber) {
    const v = await ui.promptNumber({ message, min, max, step, defaultValue: def });
    if (v == null || Number.isNaN(Number(v))) return def;
    return Math.max(min, Math.min(max, Math.round(Number(v) / step) * step));
  }
  if (typeof window !== 'undefined' && window.prompt) {
    const raw = window.prompt(message, String(def));
    if (raw == null) return def;
    const n = Number(raw);
    if (!Number.isFinite(n)) return def;
    return Math.max(min, Math.min(max, Math.round(n / step) * step));
  }
  if (paramsKey in (params || {})) {
    const v = Number(params[paramsKey]);
    if (!Number.isFinite(v)) return def;
    return Math.max(min, Math.min(max, Math.round(v / step) * step));
  }
  return def;
}

async function promptText(ui, message, def = '', paramsKey, params = {}) {
  if (ui?.promptText) {
    const v = await ui.promptText({ message, defaultValue: def });
    return (v ?? def).trim();
  }
  if (typeof window !== 'undefined' && window.prompt) {
    const raw = window.prompt(message, def);
    return (raw ?? def).trim();
  }
  if (paramsKey in (params || {})) return String(params[paramsKey]).trim();
  return def;
}

/* -------------------------- rules helpers -------------------------- */
function isFourOfAKind(dice) {
  const counts = new Map();
  dice.forEach((d) => counts.set(d, (counts.get(d) || 0) + 1));
  for (const [, cnt] of counts) if (cnt === 4) return true;
  return false;
}

function fourOfAKindFace(dice) {
  const counts = new Map();
  dice.forEach((d) => counts.set(d, (counts.get(d) || 0) + 1));
  for (const [face, cnt] of counts) if (cnt === 4) return face;
  return 0;
}

function isStraight4(dice) {
  const s = [...new Set(dice)].sort((a, b) => a - b);
  if (s.length !== 4) return false;
  return (s[0] + 1 === s[1]) && (s[1] + 1 === s[2]) && (s[2] + 1 === s[3]); // 1-2-3-4 / 2-3-4-5 / 3-4-5-6
}

/* -------------------- Bath House (Peril heal, optional parasites) -------------------- */
export async function performBathHouse({ hero, ui = {}, params = {} }) {
  const log = [];
  const actions = [];

  // Pay $50 entry
  const gold0 = Number(hero?.gold ?? 0);
  const gold = Math.max(0, gold0 - 50);

  // Peril heal (3,3,4,4,5,6 from diceHelpers.rollPeril)
  const peril = await rollPeril(ui);
  log.push(`Bath House — Peril heal: ${peril} total points.`);

  // Allocate split: Health vs Sanity (any mix)
  const maxHealH = Math.max(
    0,
    (hero?.health?.max ?? hero?.maxHealth ?? 0) - (hero?.health?.current ?? hero?.currentHealth ?? 0)
  );
  const maxHealS = Math.max(
    0,
    (hero?.sanity?.max ?? hero?.maxSanity ?? 0) - (hero?.sanity?.current ?? hero?.currentSanity ?? 0)
  );

  const takeH = await promptNumber(
    ui,
    `Allocate healing to HEALTH (0–${Math.min(peril, maxHealH)}). Remaining goes to SANITY (cap ${maxHealS}).`,
    { min: 0, max: Math.min(peril, maxHealH), step: 1, def: Math.min(peril, maxHealH) },
    'healHealth',
    params
  );
  const toSan = Math.min(peril - takeH, maxHealS);

  const newHCur = Math.min(
    (hero?.health?.max ?? hero?.maxHealth ?? 0),
    (hero?.health?.current ?? hero?.currentHealth ?? 0) + takeH
  );
  const newSCur = Math.min(
    (hero?.sanity?.max ?? hero?.maxSanity ?? 0),
    (hero?.sanity?.current ?? hero?.currentSanity ?? 0) + toSan
  );

  log.push(`Healed Health +${takeH}, Sanity +${toSan}.`);

  // Optional Parasite attempts: spend 1 Grit each, 2d6 >= 10 removes one.
  const tryParasites = await promptYesNo(
    ui,
    'Attempt to remove Parasites? (Spend 1 Grit per attempt; each 2d6 ≥ 10 removes one)',
    false,
    'tryParasites',
    params
  );
  let gritDelta = 0;
  if (tryParasites) {
    const grit0 = Number(hero?.grit ?? 0);
    const maxAttempts = grit0; // 1 grit each
    const attempts = await promptNumber(
      ui,
      `How many parasite attempts? (0–${maxAttempts})`,
      { min: 0, max: maxAttempts, step: 1, def: Math.min(1, maxAttempts) },
      'parasiteAttempts',
      params
    );
    let removed = 0;
    for (let i = 0; i < attempts; i++) {
      gritDelta -= 1;
      const r = sum(rollND(2, 6));
      if (r >= 10) removed += 1;
      log.push(`Parasite attempt ${i + 1}: roll ${r} — ${r >= 10 ? 'removed' : 'failed'}.`);
    }
    if (removed > 0) log.push(`Parasites removed: ${removed}.`);
  }

  // Single 'update' action
  actions.push({
    type: 'update',
    gold,
    grit: Math.max(0, (hero?.grit ?? 0) + gritDelta),
    health: { ...(hero?.health || {}), current: newHCur, max: hero?.health?.max ?? hero?.maxHealth },
    sanity: { ...(hero?.sanity || {}), current: newSCur, max: hero?.sanity?.max ?? hero?.maxSanity },
  });

  return {
    log,
    actions,
    ui: { title: 'Bath House', body: `Healed Health +${takeH}, Sanity +${toSan}.` },
  };
}

/* --------------------- Sell Dark Stone (Peril × $20 each) --------------------- */
export async function performSellDarkStone({ hero, ui = {}, params = {} }) {
  const log = [];
  const actions = [];
  const have = Number(hero?.darkStone || hero?.DarkStone || 0);
  const qty = await promptNumber(
    ui,
    `Sell how many Dark Stone shards? (You have ${have}. Blank/0 = sell all)`,
    { min: 0, max: Math.max(0, have), step: 1, def: 0 },
    'qty',
    params
  );
  const toSell = qty > 0 ? qty : have;

  if (toSell <= 0) {
    log.push('No Dark Stone sold.');
    return { log, actions, ui: { title: 'Sell Dark Stone', body: 'Canceled.' } };
  }

  let goldGain = 0;
  for (let i = 0; i < toSell; i++) {
    const p = await rollPeril(ui); // uses 3,3,4,4,5,6 mapping
    goldGain += p * 20;
    log.push(`Shard ${i + 1}: Peril ${p} → $${p * 20}`);
  }
  const nextGold = Math.max(0, (hero?.gold ?? 0) + goldGain);
  const nextDS = Math.max(0, (have - toSell));

  actions.push({ type: 'update', gold: nextGold, darkStone: nextDS });
  log.push(`Sold ${toSell} shards for $${goldGain} total.`);

  return {
    log,
    actions,
    ui: { title: 'Sell Dark Stone', body: `Sold ${toSell} shard(s) for $${goldGain}.` },
  };
}

/* ------------------------- Street Gambling (HOLD flow + mobile toggles) ------------------------- */
export async function performStreetGambling({ hero, townState, posseApi = {}, ui = {}, params = {} }) {
  const log = [];
  const actions = [];
  const locationId = 'streetMarket';

  log.push('Street Gambling (Limit 2 times per Visit).');

  // Ensure today’s event for #11
  let eventState = params?.eventState;
  try {
    await _ensureLocEventRolled?.({ locationId });
    eventState = eventState || _getLocEventState?.({ locationId });
  } catch {}
  const hasLuckyEvent = eventState && Number(eventState.roll) === 11;

  // Entry fee ($25)
  let gold = Math.max(0, (hero?.gold ?? 0) - 25);
  let grit = Math.max(0, (hero?.grit ?? 0));

  // Helper: mobile-friendly HOLD selector (toggle UI if available; fallback to CSV)
  const selectHeldIndexes = async (dice, label) => {
    // Try a multi-select UI if your app exposes one
    if (typeof ui?.promptMultiSelect === 'function') {
      const options = dice.map((d, i) => ({
        label: `Die ${i + 1}: ${d}`,
        value: i + 1,  // 1-based in UI
        selected: false,
      }));
      const chosen = await ui.promptMultiSelect({
        title: label,
        options,
        // subtitle helps on small screens
        description: 'Tap to HOLD dice. Continue to re-roll the rest.',
      });
      // Expecting an array of 1-based values
      const held = Array.isArray(chosen) ? chosen
        .map((v) => Number(v))
        .filter((n) => Number.isInteger(n) && n >= 1 && n <= 4)
        .map((n) => n - 1) : [];
      return held;
    }

    // Fallback: number entry (CSV)
    const lines = dice.map((d, i) => `${i + 1}: ${d}`).join('\n');
    const msg =
      `${label}\n` +
      `Indexes → values:\n${lines}\n\n` +
      `Enter the indexes to HOLD (comma-separated, 1-4). Leave blank to hold none.`;
    const heldCSV = await promptText(ui, msg, '', 'hold', params);
    return parseIndexes(heldCSV);
  };

  // Show dice vertically and ask which to HOLD; re-roll the others
  const showDiceAndHold = async (dice, label) => {
    const before = [...dice];
    const held = await selectHeldIndexes(dice, label);

    const next = [...dice];
    for (let i = 0; i < 4; i++) {
      if (!held.includes(i)) next[i] = rollD6();
    }

    // vertical delta log:
    const deltaLines = next
      .map((v, i) => (v === before[i] ? `${i + 1}: ${v} (held)` : `${i + 1}: ${before[i]} → ${v}`))
      .join('\n');

    log.push(`${label} result:\n${deltaLines}`);
    return next;
  };

  // Pay for a re-roll with Gold or Grit (player choice if possible)
  const payForReroll = async (costGold, label) => {
    let useGrit = false;
    const canUseGrit = grit > 0 && (ui?.allowGritForStreetGambling ?? true);

    if (canUseGrit) {
      if (typeof ui?.promptSelect === 'function') {
        const pick = await ui.promptSelect({
          title: label,
          options: [
            { label: `Pay $${costGold}`, value: 'gold' },
            { label: 'Spend 1 Grit', value: 'grit' },
          ],
          defaultValue: 'gold',
        });
        useGrit = String(pick).toLowerCase() === 'grit';
      } else {
        const ch = await promptText(
          ui,
          `${label}\nPay with GOLD ($${costGold}) or spend 1 GRIT?\nType "gold" or "grit".`,
          'gold',
          'payWith',
          params
        );
        useGrit = String(ch).toLowerCase().startsWith('grit');
      }
    }

    if (useGrit) {
      grit = Math.max(0, grit - 1);
      log.push(`Paid 1 Grit for ${label}.`);
    } else {
      gold = Math.max(0, gold - costGold);
      log.push(`Paid $${costGold} for ${label}.`);
    }
  };

  // Initial 4 dice
  let dice = rollND(4, 6);
  log.push(`Initial roll: [${dice.join(', ')}]`);
  dice = await showDiceAndHold(dice, 'Choose holds for the first re-roll');

  // First paid re-roll (optional)
  const want1 = await promptYesNo(ui, 'Re-roll again? (Cost $25 or 1 Grit)', false, 'reroll1', params);
  if (want1) {
    await payForReroll(25, 'Re-roll #1');
    dice = await showDiceAndHold(dice, 'Choose holds for Re-roll #1');
  }

  // Up to 3 more @ $50 or 1 Grit each
  for (let i = 2; i <= 4; i++) {
    const key = `reroll${i}`;
    const want = await promptYesNo(ui, `Re-roll again? (${i - 1}/3 so far) (Cost $50 or 1 Grit)`, false, key, params);
    if (!want) break;
    await payForReroll(50, `Re-roll #${i}`);
    dice = await showDiceAndHold(dice, `Choose holds for Re-roll #${i}`);
  }

  // Event 11: +/-1 to a single die if it converts to a winner, and Recover 1 Grit
  if (hasLuckyEvent) {
    grit = grit + 1;
    const adjusted = tryLuckyAdjust(dice);
    if (adjusted.changed) {
      dice = adjusted.dice;
      log.push('[Event 11] Adjusted one die by ±1 to complete a winner. (+1 Grit recovered.)');
    } else {
      log.push('[Event 11] (+1 Grit recovered.)');
    }
  }

  // Resolve outcome
  const straight = isStraight4(dice);
  const fourFace = fourOfAKindFace(dice);
  let goldDelta = 0;

  if (fourFace) {
    const payout = 100 * fourFace;
    goldDelta += payout;
    log.push(`WIN — 4 of a Kind (${fourFace}s). You gain $${payout}. Final: [${dice.join(', ')}]`);
  } else if (straight) {
    goldDelta += 300;
    log.push(`WIN — Straight! You gain $300. Final: [${dice.join(', ')}]`);
  } else {
    log.push(`No win. Final: [${dice.join(', ')}]`);
  }

  // Single 'update' action so your TownTab.applyActions merges cleanly
  actions.push({
    type: 'update',
    gold: Math.max(0, gold + goldDelta),
    grit: Math.max(0, grit),
  });

  return {
    log,
    actions,
    ui: {
      title: 'Street Gambling',
      body: `Final dice: [${dice.join(', ')}]`,
    },
  };
}

/* ----------------------- HOLD/adjust helpers ----------------------- */

function parseIndexes(csv) {
  if (!csv) return [];
  return csv
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 4)
    .map((n) => n - 1);
}

function tryLuckyAdjust(dice) {
  // Try +1/-1 on a single die if it converts to 4-kind or straight.
  for (let i = 0; i < 4; i++) {
    const d = dice[i];
    for (const delta of [+1, -1]) {
      const nv = d + delta;
      if (nv < 1 || nv > 6) continue;
      const cand = [...dice];
      cand[i] = nv;
      if (isFourOfAKind(cand) || isStraight4(cand)) {
        return { changed: true, dice: cand };
      }
    }
  }
  return { changed: false, dice };
}
