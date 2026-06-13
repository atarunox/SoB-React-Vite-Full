import { DEPTH_EVENTS_MINES }   from './depthEvents_Mines';
import { DEPTH_EVENTS_TARGA }   from './depthEvents_TargaPlateau';
import { DEPTH_EVENTS_JARGONO } from './depthEvents_Jargono';
import { DEPTH_EVENTS_DERELICT } from './depthEvents_DerelictShip';
import { DEPTH_EVENTS_CANYONS } from './depthEvents_Canyons';
import { DEPTH_EVENTS_BLASTED } from './depthEvents_BlastedWastes';
import { DEPTH_EVENTS_CYNDER } from './depthEvents_CavernsOfCynder';
import { DEPTH_EVENTS_TREDERRA } from './depthEvents_Trederra';

const CHART_BY_WORLD = {
  'Mines':            DEPTH_EVENTS_MINES,
  'Targa Plateau':    DEPTH_EVENTS_TARGA,
  // World-card names use 'Jargono' / 'The Canyons'; keep the longer aliases too
  'Jargono':          DEPTH_EVENTS_JARGONO,
  'Swamps of Jargono': DEPTH_EVENTS_JARGONO,
  'Derelict Ship':    DEPTH_EVENTS_DERELICT,
  'The Canyons':      DEPTH_EVENTS_CANYONS,
  'Canyons':          DEPTH_EVENTS_CANYONS,
  'Blasted Wastes':   DEPTH_EVENTS_BLASTED,
  'Caverns of Cynder': DEPTH_EVENTS_CYNDER,
  'Trederra':         DEPTH_EVENTS_TREDERRA,
};

// Worlds that legitimately have no dedicated depth-event chart yet. When one of
// these is the active world, callers should know the Mines fallback is expected
// (no warning) rather than a typo. Anything NOT here and NOT in CHART_BY_WORLD
// logs a one-time console warning so missing wiring is visible in dev.
const KNOWN_FALLBACK_WORLDS = new Set([
  'Frontier Town',
]);
const _warnedWorlds = new Set();

/**
 * Look up a Depth Event given a world name and the value shown on both dice
 * when doubles were rolled (1–6). Falls back to the Mines chart for any world
 * without its own chart.
 */
export function getDepthEvent(world, dieValue) {
  let chart = CHART_BY_WORLD[world];
  if (!chart) {
    if (world && !KNOWN_FALLBACK_WORLDS.has(world) && !_warnedWorlds.has(world)) {
      _warnedWorlds.add(world);
      console.warn(`[depthEvents] No Depth Event chart for world "${world}" — using Mines chart as fallback.`);
    }
    chart = DEPTH_EVENTS_MINES;
  }
  return chart.find(e => e.roll === dieValue) ?? chart[0];
}

/** True if the given world has its own dedicated Depth Event chart. */
export function hasDepthEventChart(world) {
  return !!CHART_BY_WORLD[world];
}

/**
 * Return the HBtD target number (7, 8, or 9) for the current depth.
 *   Stage 1 (depth  1–4):  7+
 *   Stage 2 (depth  5–9):  8+
 *   Stage 3 (depth 10–15): 9+
 */
export function getHBtDThreshold(depth) {
  if (depth >= 10) return 9;
  if (depth >= 5)  return 8;
  return 7;
}
