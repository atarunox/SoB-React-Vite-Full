// src/utils/locationHandlers/streetMarketServices.js
import { rollPeril, rollD6, rollND, sum } from '../diceHelpers';
import { loadTownState } from '../townState';

// Optional: will no-op if your engine isn't wired yet for this location
import {
  getEventState as _getLocEventState,
  ensureEventRolled as _ensureLocEventRolled,
} from '../locationEventsEngine';

/* -------------------- small UI helpers (non-breaking) -------------------- */
// Use uiApi when present; otherwise fall back to params or sensible defaults.

async function promptYesNo(ui, message, def = false, paramsKey, params = {}) {
  if (ui?.promptYesNo) return !!(await ui.promptYesNo({ message, defaultValue: def }));
  if (paramsKey && paramsKey in (params || {})) return !!params[paramsKey];
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
  if (paramsKey && paramsKey in (params || {})) {
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
  if (paramsKey && paramsKey in (params || {})) return String(params[paramsKey]).trim();
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
    const grit0 = Number(hero?.currentGrit ?? hero?.grit ?? 0);
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
    currentGrit: Math.max(0, (hero?.currentGrit ?? hero?.grit ?? 0) + gritDelta),
    currentHealth: newHCur,
    currentSanity: newSCur,
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

/* ------------------------- Street Gambling (improved UX) ------------------------- */
export async function performStreetGambling({ hero, townState, posseApi = {}, ui = {}, params = {} }) {
  const log = [];
  const actions = [];
  const heroName = hero?.name || 'Hero';

  log.push('Street Gambling (Limit 2 times per Visit).');

  // Check Lucky Streak via globalRules (set by event #11 handler)
  let hasLuckyEvent = false;
  try {
    const ts = loadTownState();
    hasLuckyEvent = !!ts?.globalRules?.streetGamblingLuckyStreak;
  } catch {}
  // Also check event state as fallback
  if (!hasLuckyEvent) {
    try {
      const eventState = params?.eventState || _getLocEventState?.('streetMarket');
      hasLuckyEvent = eventState && Number(eventState.roll) === 11;
    } catch {}
  }

  // Entry fee ($25)
  let gold = Math.max(0, (hero?.gold ?? 0) - 25);
  let grit = Math.max(0, (hero?.currentGrit ?? hero?.grit ?? 0));

  // Format dice for display
  const fmtDice = (d) => d.map((v, i) => `  Die ${i + 1}: [${v}]`).join('\n');
  const fmtDiceInline = (d) => `[${d.join('] [')}]`;

  // Prompt to select which dice to RE-ROLL (not hold), more intuitive
  const selectRerollIndexes = async (dice, label, costInfo) => {
    const diceDisplay = fmtDice(dice);
    const straightHint = checkNearWin(dice);
    const msg =
      `STREET GAMBLING — ${label}\n\n` +
      `Your dice:\n${diceDisplay}\n\n` +
      (straightHint ? `${straightHint}\n\n` : '') +
      (costInfo ? `Cost: ${costInfo}\n\n` : '') +
      `Enter which dice to RE-ROLL (1-4, comma-separated).\n` +
      `Leave blank to keep all dice as they are.`;
    const raw = await promptText(ui, msg, '');
    if (raw == null || raw.trim() === '') return [];
    return raw.split(',')
      .map(s => Number(s.trim()))
      .filter(n => Number.isInteger(n) && n >= 1 && n <= 4)
      .map(n => n - 1);
  };

  // Reroll selected dice
  const rerollDice = (dice, indexes) => {
    const next = [...dice];
    for (const i of indexes) {
      if (i >= 0 && i < 4) next[i] = rollD6();
    }
    return next;
  };

  // Show near-win hints
  function checkNearWin(dice) {
    const sorted = [...new Set(dice)].sort((a, b) => a - b);
    const counts = {};
    dice.forEach(d => counts[d] = (counts[d] || 0) + 1);

    // Check if already a winning hand
    if (isStraight4(dice)) return 'Hint: You already have a Straight!';
    if (fourOfAKindFace(dice)) return `Hint: You already have a Set (four ${fourOfAKindFace(dice)}s)!`;

    const hints = [];
    // Check for 3-of-a-kind
    for (const [face, cnt] of Object.entries(counts)) {
      if (cnt === 3) hints.push(`3 of a Kind (${face}s) — one more ${face} for a Set!`);
    }
    // Check for 3-in-a-row
    if (sorted.length >= 3) {
      for (let i = 0; i <= sorted.length - 3; i++) {
        if (sorted[i+1] === sorted[i]+1 && sorted[i+2] === sorted[i]+2) {
          const lo = sorted[i] - 1;
          const hi = sorted[i+2] + 1;
          const needs = [];
          if (lo >= 1) needs.push(lo);
          if (hi <= 6) needs.push(hi);
          if (needs.length) hints.push(`3 in a row (${sorted[i]}-${sorted[i+1]}-${sorted[i+2]}) — need a ${needs.join(' or ')} for Straight!`);
        }
      }
    }
    return hints.length ? `Hint: ${hints.join(' ')}` : '';
  }

  // Initial 4 dice
  let dice = rollND(4, 6);
  log.push(`Initial roll: ${fmtDiceInline(dice)}`);

  // Show initial dice and rules in log
  log.push(`Entry fee: $25 paid. Gold remaining: $${gold}`);
  log.push(`Goal: Straight (4 in a row) = $300, Set (4 of a kind) = $100 × face value.`);
  if (hasLuckyEvent) log.push('★ LUCKY STREAK ACTIVE — After all re-rolls, you may add or subtract 1 from one die!');

  // First re-roll opportunity (free — part of the initial roll)
  let rerollIdxs = await selectRerollIndexes(dice, 'Initial Re-roll (free)', 'Free');
  if (rerollIdxs.length > 0) {
    dice = rerollDice(dice, rerollIdxs);
    log.push(`Free re-roll: ${fmtDiceInline(dice)}`);
  }

  // Second re-roll: $25 or 1 Grit
  let keepGoing = true;
  if (keepGoing) {
    const canGrit = grit > 0;
    const costLabel = canGrit ? '$25 or 1 Grit' : '$25';
    const wantMore = await promptYesNo(
      ui,
      `STREET GAMBLING\n\n` +
      `Current dice:\n${fmtDice(dice)}\n\n` +
      (checkNearWin(dice) ? `${checkNearWin(dice)}\n\n` : '') +
      `Re-roll again? (Cost: ${costLabel})\n` +
      `Gold: $${gold} | Grit: ${grit}`,
      false
    );
    if (wantMore) {
      let useGrit = false;
      if (canGrit) {
        useGrit = await promptYesNo(
          ui,
          `Pay with Grit instead of Gold?\n\nSpend 1 Grit instead of $25 Gold?`,
          false
        );
      }
      if (useGrit) {
        grit = Math.max(0, grit - 1);
        log.push('Paid 1 Grit for Re-roll #1.');
      } else {
        gold = Math.max(0, gold - 25);
        log.push('Paid $25 for Re-roll #1.');
      }
      rerollIdxs = await selectRerollIndexes(dice, 'Re-roll #1', useGrit ? '1 Grit' : '$25');
      if (rerollIdxs.length > 0) {
        dice = rerollDice(dice, rerollIdxs);
        log.push(`Re-roll #1: ${fmtDiceInline(dice)}`);
      }
    } else {
      keepGoing = false;
    }
  }

  // Up to 3 more re-rolls @ $50 or 1 Grit each
  for (let r = 2; r <= 4 && keepGoing; r++) {
    const canGrit = grit > 0;
    const costLabel = canGrit ? '$50 or 1 Grit' : '$50';
    const wantMore = await promptYesNo(
      ui,
      `STREET GAMBLING\n\n` +
      `Current dice:\n${fmtDice(dice)}\n\n` +
      (checkNearWin(dice) ? `${checkNearWin(dice)}\n\n` : '') +
      `Re-roll #${r}? (${r - 1}/3 extra re-rolls used)\nCost: ${costLabel}\n` +
      `Gold: $${gold} | Grit: ${grit}`,
      false
    );
    if (!wantMore) break;

    let useGrit = false;
    if (canGrit) {
      useGrit = await promptYesNo(
        ui,
        `Pay with Grit instead of Gold?\n\nSpend 1 Grit instead of $50 Gold?`,
        false
      );
    }
    if (useGrit) {
      grit = Math.max(0, grit - 1);
      log.push(`Paid 1 Grit for Re-roll #${r}.`);
    } else {
      gold = Math.max(0, gold - 50);
      log.push(`Paid $50 for Re-roll #${r}.`);
    }
    rerollIdxs = await selectRerollIndexes(dice, `Re-roll #${r}`, useGrit ? '1 Grit' : '$50');
    if (rerollIdxs.length > 0) {
      dice = rerollDice(dice, rerollIdxs);
      log.push(`Re-roll #${r}: ${fmtDiceInline(dice)}`);
    }
  }

  // Event 11 Lucky Streak: player may manually adjust one die by ±1
  if (hasLuckyEvent) {
    const luckyMsg =
      `★ LUCKY STREAK ★\n\n` +
      `Current dice:\n${fmtDice(dice)}\n\n` +
      `You may add or subtract 1 from ANY one die.\n\n` +
      `Enter which die to adjust (1-4), or leave blank to skip:`;
    const dieChoice = await promptText(ui, luckyMsg, '');
    if (dieChoice && dieChoice.trim() !== '') {
      const dieIdx = Number(dieChoice.trim()) - 1;
      if (dieIdx >= 0 && dieIdx < 4) {
        const curVal = dice[dieIdx];
        const dirMsg =
          `Die ${dieIdx + 1} is currently [${curVal}].\n\n` +
          (curVal > 1 && curVal < 6
            ? `Enter "+" to make it ${curVal + 1}, or "-" to make it ${curVal - 1}:`
            : curVal === 1
            ? `Enter "+" to make it 2:`
            : `Enter "-" to make it 5:`);
        const dir = await promptText(ui, dirMsg, '+');
        if (dir != null) {
          const delta = dir.trim().startsWith('-') ? -1 : 1;
          const newVal = curVal + delta;
          if (newVal >= 1 && newVal <= 6) {
            dice[dieIdx] = newVal;
            log.push(`[Lucky Streak] Die ${dieIdx + 1}: ${curVal} → ${newVal}`);
          } else {
            log.push(`[Lucky Streak] Can't adjust Die ${dieIdx + 1} (${curVal}) by ${delta > 0 ? '+1' : '-1'} — out of range.`);
            ui.toast?.(`Can't adjust Die ${dieIdx + 1} (${curVal}) by ${delta > 0 ? '+1' : '-1'} — out of range.`);
          }
        }
      }
    }
    log.push('[Lucky Streak] Active.');
  }

  // Resolve outcome
  const straight = isStraight4(dice);
  const fourFace = fourOfAKindFace(dice);
  let goldDelta = 0;
  let resultMsg;

  if (fourFace) {
    const payout = 100 * fourFace;
    goldDelta += payout;
    resultMsg = `WIN — Set! Four ${fourFace}s!\nYou win $${payout}!`;
    log.push(`WIN — 4 of a Kind (${fourFace}s). +$${payout}. Final: ${fmtDiceInline(dice)}`);
  } else if (straight) {
    goldDelta += 300;
    resultMsg = `WIN — Straight! ${fmtDiceInline(dice)}\nYou win $300!`;
    log.push(`WIN — Straight! +$300. Final: ${fmtDiceInline(dice)}`);
  } else {
    resultMsg = `No win. Better luck next time.`;
    log.push(`No win. Final: ${fmtDiceInline(dice)}`);
  }

  const finalGold = Math.max(0, gold + goldDelta);
  log.push(`Result: ${resultMsg}`);
  log.push(`Gold: $${finalGold} | Grit: ${grit}`);
  ui.toast?.(`Street Gambling — ${resultMsg}`);

  // Single 'update' action
  actions.push({
    type: 'update',
    gold: finalGold,
    currentGrit: Math.max(0, grit),
  });

  return {
    log,
    actions,
    ui: {
      title: 'Street Gambling',
      outcome: [resultMsg, `Final dice: ${fmtDiceInline(dice)}`, `Gold: $${finalGold}`],
    },
  };
}
