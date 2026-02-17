// src/utils/locationHandlers/frontierOutpostBountiesHandler.js
import frontierOutpostBounties from '../../data/townLocations/FrontierTown/FrontierOutpost/frontierOutpostBounties.js';

const POSSE_BUFFS_KEY = 'sob:posseBuffs';
const FO_BOUNTY_FLAG = 'fo_bounty_board_selected';

// --- small helpers ----------------------------------------------------------

const hasBrowserStorage =
  typeof window !== 'undefined' && typeof localStorage !== 'undefined';

import { d6 as D6 } from '../../utils/diceHelpers';

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `fo_bounty_${Date.now()}_${Math.floor(Math.random() * 9999)}`;

function addPosseBuff(entry) {
  if (!hasBrowserStorage) return;
  try {
    const raw = localStorage.getItem(POSSE_BUFFS_KEY) || '[]';
    const prev = JSON.parse(raw);
    const safePrev = Array.isArray(prev) ? prev : [];
    const next = [...safePrev, entry];
    localStorage.setItem(POSSE_BUFFS_KEY, JSON.stringify(next));
  } catch (err) {
    console.error('[FO Bounty] Failed to save posse buff:', err);
  }
}

function getTownState(townStateApi) {
  return townStateApi?.get?.() || {};
}

function setTownState(townStateApi, next) {
  townStateApi?.set?.(next);
}

function getTownFlag(townStateApi, key) {
  const state = getTownState(townStateApi);
  return !!(state.flags && state.flags[key]);
}

function setTownFlag(townStateApi, key, value = true) {
  const state = getTownState(townStateApi);
  const flags = { ...(state.flags || {}), [key]: value };
  setTownState(townStateApi, { ...state, flags });
}

function pickBountyResult(roll) {
  const svc = frontierOutpostBounties.services?.find(
    (s) => s.id === 'bounty_roll'
  );
  const table = svc?.rules?.table || {};

  return (
    table[roll] ||
    table[1] || {
      name: 'No Bounty',
      reward: null,
      note: 'No current Bounty available.',
    }
  );
}

// --- main executor ----------------------------------------------------------

export async function performFrontierOutpostBounty(ctx = {}) {
  const { hero, townStateApi, io = {}, note } = ctx;
  const heroName = hero?.name || hero?.Name || 'Hero';

  // Once per Town Stay for ALL Heroes
  if (getTownFlag(townStateApi, FO_BOUNTY_FLAG)) {
    const msg = 'Bounty already set for this Town Stay.';
    const log = [`[Frontier Outpost Bounty] ${msg}`];
    io.toast?.(msg);
    note?.(msg);
    return {
      name: 'Existing Bounty',
      reward: null,
      note: msg,
      log,
    };
  }

  // Roll (use UI roll helper if available so "auto roll" works)
  let roll = 0;
  if (typeof io.roll === 'function') {
    try {
      const res = await io.roll(1, 6, 'Frontier Outpost Bounty');
      roll = Array.isArray(res) ? Number(res[0]) : Number(res);
    } catch {
      roll = 0;
    }
  }
  if (!Number.isFinite(roll) || roll < 1 || roll > 6) {
    roll = D6();
  }

  const result = pickBountyResult(roll);

  // Mark bounty in town state so other logic can see it
  const state = getTownState(townStateApi);
  setTownState(townStateApi, {
    ...state,
    flags: { ...(state.flags || {}), [FO_BOUNTY_FLAG]: true },
    frontierOutpostBounty: {
      roll,
      name: result.name,
      reward: result.reward || null,
      note: result.note || '',
    },
  });

  const line = `[Frontier Outpost Bounty] ${heroName} rolled a ${roll}: ${
    result.name
  }. ${result.reward || result.note || ''}`;
  const log = [line];

  io.toast?.(line);
  note?.(line);

  // Create a posse-wide buff so PosseTab can show it
  if (result.name && result.name !== 'No Bounty') {
    const buff = {
      id: uid(),
      name: `Frontier Outpost Bounty – ${result.name}`,
      source: 'Frontier Outpost (Bounty Board)',
      notes: result.reward || result.note || '',
      used: false,
    };
    addPosseBuff(buff);
  }

  return {
    roll,
    ...result,
    log,
  };
}
