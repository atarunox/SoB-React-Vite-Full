import { DEPTH_EVENTS_MINES }   from './depthEvents_Mines';
import { DEPTH_EVENTS_TARGA }   from './depthEvents_TargaPlateau';
import { DEPTH_EVENTS_JARGONO } from './depthEvents_Jargono';
import { DEPTH_EVENTS_DERELICT } from './depthEvents_DerelictShip';
import { DEPTH_EVENTS_CANYONS } from './depthEvents_Canyons';
import { DEPTH_EVENTS_BLASTED } from './depthEvents_BlastedWastes';

const CHART_BY_WORLD = {
  'Mines':            DEPTH_EVENTS_MINES,
  'Targa Plateau':    DEPTH_EVENTS_TARGA,
  'Swamps of Jargono': DEPTH_EVENTS_JARGONO,
  'Derelict Ship':    DEPTH_EVENTS_DERELICT,
  'Canyons':          DEPTH_EVENTS_CANYONS,
  'Blasted Wastes':   DEPTH_EVENTS_BLASTED,
};

/**
 * Look up a Depth Event given a world name and the value shown on both dice
 * when doubles were rolled (1–6).
 */
export function getDepthEvent(world, dieValue) {
  const chart = CHART_BY_WORLD[world] ?? DEPTH_EVENTS_MINES;
  return chart.find(e => e.roll === dieValue) ?? chart[0];
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
