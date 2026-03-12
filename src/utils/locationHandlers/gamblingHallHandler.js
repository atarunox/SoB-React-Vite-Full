// src/utils/locationHandlers/gamblingHallHandler.js
//
// Modernized Gambling Hall Location Events handler.
// - Uses Frontier Town Gambling Hall event text
// - Compatible with locationEventsEngine (forcedRoll-based)
// - Safe with existing Poker/Craps/Devil’s Wheel services
// - Still exposes performGamblingHallHighStakes + highStakes flag
//

import { loadTownState, saveTownState } from '../townState.js';
import { performGamblingHallHighStakes } from './gamblingHallServices.js';
import { withConditionAppended } from '../mergeConditions.js';
import { d6 as D6 } from '../../utils/diceHelpers';
import gamblingHallData from '../../data/townLocations/FrontierTown/GamblingHall/gamblingHall.js';

/** Look up the event data (name, lore, effect) for a given 2d6 roll. */
function getEventData(roll) {
  const ev = gamblingHallData?.events?.find(e => e.roll === roll);
  return ev || { name: 'Unknown', lore: '', effect: '' };
}

/**
 * Try to figure out which heroes are actually at the Gambling Hall.
 * - Prefer posseApi.getHeroesAtShop(shopId)
 * - Fallback to active hero
 * - Last resort: whole posse
 */
function getHeroesAtGamblingHall(ctx = {}) {
  const { posseApi = {}, shopId } = ctx;

  // 1) Location-aware list (preferred)
  if (shopId && typeof posseApi.getHeroesAtShop === 'function') {
    const ids = posseApi.getHeroesAtShop(shopId) || [];
    return ids
      .map((id) =>
        typeof posseApi.getHero === 'function' ? posseApi.getHero(id) : null
      )
      .filter(Boolean);
  }

  // 2) Single active hero
  if (
    typeof posseApi.getActiveHeroId === 'function' &&
    typeof posseApi.getHero === 'function'
  ) {
    const id = posseApi.getActiveHeroId();
    const h = id ? posseApi.getHero(id) : null;
    if (h) return [h];
  }

  // 3) Whole posse as fallback
  if (typeof posseApi.listHeroes === 'function') {
    const list = posseApi.listHeroes() || [];
    return Array.isArray(list) ? list : [];
  }

  return [];
}

function updateHero(ctx = {}, heroId, patch) {
  const { posseApi = {} } = ctx;
  if (!heroId || typeof posseApi.updateHero !== 'function') return;

  posseApi.updateHero(heroId, {
    ...patch,
    updatedAt: patch.updatedAt ?? Date.now(),
  });
}

function addUnwantedAttention(ctx = {}, hero, count = 1) {
  const { posseApi = {}, uiApi = {} } = ctx;
  if (!hero || typeof posseApi.updateHero !== 'function') return;

  const id = hero.id || hero.localId;
  const cur = Number(hero.unwantedAttention || 0) || 0;

  posseApi.updateHero(id, {
    unwantedAttention: cur + count,
    updatedAt: Date.now(),
  });

  uiApi.toast?.(
    `${hero.name || 'Hero'} gains ${count} Unwanted Attention marker${
      count === 1 ? '' : 's'
    }.`
  );
}

// Generic "did the test pass?" helper.
// Player/DM rolls dice physically or via DM tools; we just capture result.
async function askPassFail(ctx = {}, { title, message }) {
  const { uiApi = {} } = ctx;
  if (typeof uiApi.choose !== 'function') return null;

  const pick = await uiApi.choose({
    title,
    message,
    options: [
      { id: 'pass', label: 'Passed' },
      { id: 'fail', label: 'Failed' },
    ],
  });

  if (!pick) return null;
  return pick.id === 'pass';
}

async function coreHandle(ctx = {}) {
  const { uiApi = {}, forcedRoll } = ctx;

  const roll = Number.isFinite(forcedRoll) ? Number(forcedRoll) : D6() + D6();
  const heroes = getHeroesAtGamblingHall(ctx);
  const log = [];

  if (!heroes.length) {
    log.push(
      `[Gambling Hall] Location Event roll ${roll}, but no hero was found at this location.`
    );
    return { actions: [], log, eventRoll: roll, eventIndex: Math.max(0, roll - 2) };
  }

  // Most events talk to "you" singular – treat first hero as primary.
  // Events that say "Every Hero at the Gambling Hall" iterate over `heroes`.
  const primary = heroes[0];
  const pname = primary.name || 'Hero';

  switch (roll) {
    // ---------------------------------------------------------
    // 2 — Assassination Attempt
    // ---------------------------------------------------------
    case 2: {
      const ev2 = getEventData(2);
      log.push(
        `[Gambling Hall] (2) ${ev2.name} — ${ev2.lore}`
      );
      log.push(`Effect: ${ev2.effect}`);

      const passed = await askPassFail(ctx, {
        title: 'Assassination Attempt',
        message:
          `${ev2.lore}\n\n` +
          `${pname} must make a Cunning 5+ or Lore 6+ test.\n\n` +
          `Resolve the roll at the table, then choose whether they Passed or Failed.`,
      });

      if (passed === false) {
        // Card: "If failed, roll once on the Injury Chart."
        // We append a pending Injury for the DM to resolve using the real chart UI.
        const nextConditions = withConditionAppended(
          primary.conditions,
          'injury',
          {
            id: `gh_assassination_${Date.now()}_${primary.id || primary.localId}`,
            type: 'injury',
            name: 'Pending Injury (Assassination Attempt)',
            text:
              'From Gambling Hall Location Event 2 — roll once on the Injury Chart and record the result.',
            pending: true,
            source: 'Gambling Hall Event #2',
          }
        );

        updateHero(ctx, primary.id || primary.localId, {
          conditions: nextConditions,
        });

        log.push(
          `→ ${pname} failed the test and now has a pending Injury from the Assassination Attempt.`
        );
      } else if (passed === true) {
        log.push(`→ ${pname} spotted/dodged the attack. No further effect.`);
      } else {
        log.push(
          `→ Pass/Fail was not chosen in UI. Remember: if ${pname} failed, they must roll once on the Injury Chart.`
        );
      }
      break;
    }

    // ---------------------------------------------------------
    // 3 — “I Say You’re Cheatin’ Me!”
    // ---------------------------------------------------------
    case 3: {
      const ev3 = getEventData(3);
      log.push(
        `[Gambling Hall] (3) ${ev3.name} — ${ev3.lore}`
      );
      log.push(`Effect: ${ev3.effect}`);

      const passed = await askPassFail(ctx, {
        title: `"I Say You're Cheatin' Me!"`,
        message:
          `${ev3.lore}\n\n` +
          `${pname} must make a Luck 4+ test.\n\n` +
          `Resolve the roll at the table, then choose whether they Passed or Failed.`,
      });

      if (passed === true) {
        // Pass: he ends his Location Visit taking an extra Unwanted Attention marker.
        addUnwantedAttention(ctx, primary, 1);
        log.push(
          `→ ${pname} passes the Luck 4+ test. The bandido storms off; ${pname} gains 1 Unwanted Attention and ends their Location Visit.`
        );
      } else if (passed === false) {
        // Fail: DM resolves the D6 vs Initiative and possible Injury.
        log.push(
          `→ ${pname} fails the Luck 4+ test.\n` +
            `Now roll 1D6 and compare to their Initiative:\n` +
            `  • If the roll is less than Initiative, they drop him with no further effect.\n` +
            `  • Otherwise, ${pname} must roll once on the Injury Chart.\n` +
            `Record any Injury result on the hero's Conditions tab.`
        );
      } else {
        log.push(
          `→ Pass/Fail was not chosen in UI. Remember to complete the Luck 4+ test and 1D6 vs Initiative check as per the card.`
        );
      }
      break;
    }

    // ---------------------------------------------------------
    // 4–5 — “Sorry Mister”
    // ---------------------------------------------------------
    case 4:
    case 5: {
      const ev45 = getEventData(roll);
      log.push(
        `[Gambling Hall] (${roll}) ${ev45.name} — ${ev45.lore}`
      );
      log.push(`Effect: ${ev45.effect}`);

      const pid = primary.id || primary.localId;

      if (typeof uiApi.choose === 'function') {
        const pick = await uiApi.choose({
          title: '"Sorry Mister"',
          message: `${ev45.lore}\n\n${pname} must lose ONE of the following:`,
          options: [
            { id: 'gold', label: 'Lose $200' },
            { id: 'ds', label: 'Lose 2 Dark Stone' },
            { id: 'gear', label: 'Lose 1 Gear or Artifact (remove manually)' },
          ],
        });

        const choice = pick?.id ?? 'gold';

        if (choice === 'gold') {
          const curGold = Number(primary.gold || 0);
          updateHero(ctx, pid, { gold: Math.max(0, curGold - 200) });
          uiApi.toast?.(`${pname} loses $200.`);
          log.push(`→ ${pname} loses $200.`);
        } else if (choice === 'ds') {
          const curDS = Number(primary.darkStone || 0);
          updateHero(ctx, pid, { darkStone: Math.max(0, curDS - 2) });
          uiApi.toast?.(`${pname} loses 2 Dark Stone.`);
          log.push(`→ ${pname} loses 2 Dark Stone.`);
        } else {
          uiApi.toast?.(`${pname} must remove 1 Gear or Artifact from inventory.`);
          log.push(`→ ${pname} must remove 1 Gear or Artifact manually.`);
        }
      } else {
        log.push(
          `→ ${pname} must lose ONE of the following (player's choice):\n` +
            `   • $200\n` +
            `   • 2 Dark Stone\n` +
            `   • 1 Gear or Artifact\n` +
            `Adjust the hero's gold / Dark Stone / inventory manually to match the choice.`
        );
      }
      break;
    }

    // ---------------------------------------------------------
    // 6–8 — Laughter, Cheers, and Sadness (No Event)
    // ---------------------------------------------------------
    case 6:
    case 7:
    case 8: {
      const ev678 = getEventData(roll);
      log.push(
        `[Gambling Hall] (${roll}) ${ev678.name} — ${ev678.lore}`
      );
      log.push(`Effect: ${ev678.effect}`);
      break;
    }

    // ---------------------------------------------------------
    // 9–10 — Everyone’s a Winner (Every hero at the Hall gains D6 × $25)
    // ---------------------------------------------------------
    case 9:
    case 10: {
      const ev910 = getEventData(roll);
      log.push(
        `[Gambling Hall] (${roll}) ${ev910.name} — ${ev910.lore}`
      );
      log.push(`Effect: ${ev910.effect}`);

      const { posseApi = {} } = ctx;

      for (const h of heroes) {
        const hName = h.name || 'Hero';
        const id = h.id || h.localId;

        let die = D6();
        if (typeof uiApi.roll === 'function') {
          try {
            const rolls = await uiApi.roll(
              1,
              6,
              `${ev910.lore}\n\nEveryone's a Winner (D6 x $25)`
            );
            if (Array.isArray(rolls) && rolls.length) {
              const n = Number(rolls[0]);
              if (Number.isFinite(n)) die = n;
            }
          } catch {
            // fall back to random D6
          }
        }

        const winnings = die * 25;
        const curGold = Number(h.gold || 0);
        const nextGold = curGold + winnings;

        updateHero(ctx, id, { gold: nextGold });

        uiApi.toast?.(
          `${hName} wins $${winnings} (rolled ${die}) — now at $${nextGold}.`
        );
        log.push(
          `→ ${hName} rolls ${die} and gains $${winnings}, for a new total of $${nextGold}.`
        );
      }
      break;
    }

    // ---------------------------------------------------------
    // 11 — Drinks and Cigars All Around
    // ---------------------------------------------------------
    case 11: {
      const ev11 = getEventData(11);
      log.push(
        `[Gambling Hall] (11) ${ev11.name} — ${ev11.lore}`
      );
      log.push(`Effect: ${ev11.effect}`);

      const { posseApi = {} } = ctx;
      const hasAddToken = typeof posseApi.addToken === 'function';

      for (const h of heroes) {
        const id = h.id || h.localId;
        const hName = h.name || 'Hero';

        if (hasAddToken) {
          try {
            posseApi.addToken(id, 'Whiskey');
            posseApi.addToken(id, 'Fine Cigar');
            uiApi.toast?.(
              `${hName} gains 1 Whiskey token and 1 Fine Cigar token.`
            );
          } catch {
            log.push(
              `→ Give ${hName}: 1 Whiskey token and 1 Fine Cigar token (manually, if needed).`
            );
          }
        } else {
          log.push(
            `→ Give ${hName}: 1 Whiskey token and 1 Fine Cigar token (add them manually to their Side Bag).`
          );
        }
      }
      break;
    }

    // ---------------------------------------------------------
    // 12 — High Stakes Bet
    // ---------------------------------------------------------
    case 12: {
      const ev12 = getEventData(12);
      log.push(
        `[Gambling Hall] (12) ${ev12.name} — ${ev12.lore}`
      );
      log.push(`Effect: ${ev12.effect}`);
      log.push(
        `→ For this Town Stay: If ${pname} (or another hero here) plays Five Card Draw Poker and wins during their FIRST game, they draw:\n` +
          `   • 1 World card\n` +
          `   • 1 Artifact card from that World\n` +
          `as an extra reward.`
      );

      // Keep the original behavior: flag this in townState so the Poker service can detect it.
      const state = loadTownState() || {};
      state.gamblingHallFlags = state.gamblingHallFlags || {};
      state.gamblingHallFlags.firstPokerWinAwardsArtifact = true;
      saveTownState(state);

      uiApi.toast?.(
        'High Stakes Bet is active: the first Poker win this visit grants a bonus World + Artifact draw.'
      );
      break;
    }

    // ---------------------------------------------------------
    // Fallback
    // ---------------------------------------------------------
    default: {
      log.push(
        `[Gambling Hall] Event roll ${roll} has no specialized handler; falling back to text-only behavior.`
      );
      break;
    }
  }

  return {
    actions: [],
    log,
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

// Backwards-compatible "apply" API (old code sometimes called gamblingHallHandler.apply)
async function apply(roll, ctx = {}) {
  return coreHandle({ ...ctx, forcedRoll: roll });
}

// Public handler used by locationEventsEngine
export async function handleGamblingHallEvent(ctx = {}) {
  return coreHandle(ctx);
}

export const gamblingHallHandler = {
  apply,
  handleGamblingHallEvent,
};

// Keep exporting this so Poker services can import it from here if needed
export { performGamblingHallHighStakes } from './gamblingHallServices.js';
