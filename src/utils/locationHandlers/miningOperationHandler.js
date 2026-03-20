// src/utils/locationHandlers/miningOperationHandler.js

import { d6 as _d6, d3 as _d3 } from '../../utils/diceHelpers';
import { loadTownState, saveTownState } from '../../utils/townState';

// Use ctx.d6/ctx.d3 when available (respects manual roll mode); fallback to auto-roll
const ctxD6 = async (ctx, label) => (typeof ctx?.d6 === 'function') ? ctx.d6(label) : _d6();
const ctxD3 = async (ctx, label) => (typeof ctx?.d3 === 'function') ? ctx.d3(label) : _d3();

const shopId = 'miningOperation';

// ---------- townState helpers ----------
function patchTownState(patch) {
  const s = loadTownState() || {};
  saveTownState({ ...s, ...patch });
}

// ---------- result formatting helper ----------
function formatCheckResult(result, stat, target) {
  if (result && typeof result === 'object' && Array.isArray(result.rolls)) {
    const diceStr = result.rolls.join(', ');
    const sCount = result.successes ?? result.rolls.filter(r => r >= target).length;
    return `Rolled [${diceStr}] — ${result.passed ? 'PASSED' : 'FAILED'} (${stat} ${target}+, ${sCount} success${sCount !== 1 ? 'es' : ''})`;
  }
  return null;
}

async function showResult(ctx, title, lines) {
  const body = Array.isArray(lines) ? lines.join('\n') : lines;
  await ctx.promptChoice?.(`${title}\n\n${body}`, [{ label: 'Continue' }]);
}

// ---------- display (title / lore / effect) ----------
export function display(roll) {
  switch (roll) {
    case 2:
      return {
        title: 'Refinery Explosion',
        lore: 'A massive explosion rips through the tunnels and Barter Town as the Refinery explodes in a ball of fire and billowing black smoke!',
        effect: 'The Mining Operation is Destroyed. Also, roll a D6 for each of the 1 or 2 other Town Locations adjacent to it on the Town Map. On the roll of 1 or 2, that Location is also Destroyed. Any Hero at one of these Destroyed Locations also takes 2D6 Wounds, ignoring Defense.',
      };
    case 3:
      return {
        title: 'Mining Accident',
        lore: 'Digging through the rock and sand, the miners have struck the hull of an unstable old ship, accidentally detonating its Warp Drive!',
        effect: 'All Heroes at the Mining Operation immediately take D6 Corruption Hits from the Dark Stone radiation, and Heroes may not Work the Mines today.',
      };
    case 4:
      return {
        title: 'Fungus Revolt',
        lore: 'The Fungus Farm Workers have started an uprising!',
        effect: 'All Heroes at the Mining Operation immediately take D6 Hits from the malnourished workers rioting, and Heroes may not Work the Fungus Farms today.',
      };
    case 5:
    case 6:
      return {
        title: 'The Dark Beneath the Surface',
        lore: 'What evil lurks in the dark beneath the surface is sometimes released by those digging too deep.',
        effect: 'Move the Darkness marker 1 Day forward on the Town Event Track.',
      };
    case 7:
      return {
        title: 'Toxic Fumes and a Cavern of Spores',
        lore: "It wouldn't be a day down in the tunnels without a few deaths to keep you on your toes.",
        effect: 'No Event.',
      };
    case 8:
    case 9:
      return {
        title: 'Worker Shortage',
        lore: 'There has been a shortage of people to work down in the tunnels ever since the last Warden Raid.',
        effect: 'Heroes gain an extra $100 for any Work Down in the Tunnels they do today.',
      };
    case 10:
      return {
        title: 'Good Harvest',
        lore: 'The Fungus harvest has been particularly good this season and there is a surplus of many of the crops.',
        effect: 'All Heroes at the Mining Operation today may purchase any of the Fungus Crops for -$25 each.',
      };
    case 11:
      return {
        title: 'Buried Town',
        lore: 'Digging in the tunnels, the workers have discovered the ruins of an old Barter Town that once stood here, now consumed by the desert wastes.',
        effect: 'Draw 2 Gear cards and 2 Blasted Wastes Artifacts to see what has been unearthed. Any Heroes at the Mining Operation today may purchase any of these Items for their listed Gold value +$100 (Heroes get first pick of purchasing based on highest to lowest Lore — roll off if tied).',
      };
    case 12:
      return {
        title: 'Astounding Discovery',
        lore: 'Whispered rumors abound about something astounding discovered down in the mines. They say that the workers have found part of an ancient ship buried in the rock that pre-dates anything else discovered in this region.',
        effect: 'You may draw an Artifact from the Derelict Ship OtherWorld (if you do not have the Derelict Ship Expansion, instead draw a World card and an Artifact from that World).',
      };
    default:
      return { title: 'Mining Operation', lore: '', effect: 'No Event.' };
  }
}

// ---------- mechanics (Resolve) ----------
export async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId?.();
  if (!id) return { log: [] };

  const info = display(roll);
  const log = [];

  // Every event starts with its title and lore/flavor text
  log.push(`[Mining Operation] (${roll}) ${info.title} — ${info.lore}`);
  log.push(`Effect: ${info.effect}`);

  // 2: Refinery Explosion — Mining Operation Destroyed + adjacent check + 2D6 Wounds
  if (roll === 2) {
    // Mark Mining Operation as destroyed
    const ts = loadTownState() || {};
    const destroyed = new Set(ts.destroyedLocations || []);
    destroyed.add(shopId);
    saveTownState({ ...ts, destroyedLocations: Array.from(destroyed) });

    const lines = ['The Mining Operation is Destroyed!'];
    log.push('The Mining Operation is Destroyed!');

    // Roll D6 for 1-2 adjacent town locations
    const adjCount = await ctx.promptChoice?.(
      `REFINERY EXPLOSION\n${info.lore}\n\nHow many Town Locations are adjacent to the Mining Operation on your Town Map?`,
      [
        { label: '1 adjacent Location' },
        { label: '2 adjacent Locations' },
      ]
    );
    const numAdj = (adjCount ?? 0) + 1;

    for (let i = 0; i < numAdj; i++) {
      const adjRoll = await ctxD6(ctx, `Refinery Explosion — Roll D6 for adjacent Location ${i + 1} (1-2 = Destroyed)`);
      const adjLine = `Adjacent Location ${i + 1}: Rolled [${adjRoll}] — ${adjRoll <= 2 ? 'DESTROYED!' : 'Safe.'}`;
      log.push(adjLine);
      lines.push(adjLine);
    }

    // Heroes at destroyed locations take 2D6 Wounds ignoring Defense
    const heroIds = ctx.getHeroesAtShop?.(shopId) || [id];
    for (const hid of heroIds) {
      const w1 = await ctxD6(ctx, 'Refinery Explosion — Roll first D6 for Wounds');
      const w2 = await ctxD6(ctx, 'Refinery Explosion — Roll second D6 for Wounds');
      const totalWounds = w1 + w2;
      const woundLine = `Rolled [${w1}, ${w2}] = ${totalWounds} Wounds (ignoring Defense).`;
      log.push(woundLine);
      lines.push(woundLine);
      ctx.updateHero?.(hid, (h) => ({
        ...h,
        currentHealth: Math.max(0, (h.currentHealth ?? h.health ?? h.maxHealth ?? 10) - totalWounds),
      }));
    }

    await showResult(ctx, 'REFINERY EXPLOSION — Result', lines);
    ctx.toast?.('Refinery Explosion! Mining Operation Destroyed!');
    return { log };
  }

  // 3: Mining Accident — All Heroes take D6 Corruption Hits, no Work the Mines
  if (roll === 3) {
    const corruptionRoll = await ctxD6(ctx, 'Mining Accident — Roll D6 for Corruption Hits');
    const corruptLine = `Rolled [${corruptionRoll}] for Corruption Hits.`;
    log.push(corruptLine);

    const heroIds = ctx.getHeroesAtShop?.(shopId) || [id];
    for (const hid of heroIds) {
      ctx.updateHero?.(hid, (h) => ({
        ...h,
        corruption: (h.corruption ?? 0) + corruptionRoll,
      }));
    }

    // Block Work the Mines today
    const ts = loadTownState() || {};
    const blocked = { ...(ts.blockedServices || {}) };
    blocked.mo_work_mines = true;
    saveTownState({ ...ts, blockedServices: blocked });

    const outcome = `All Heroes at the Mining Operation take ${corruptionRoll} Corruption Hits from the Dark Stone radiation. Heroes may not Work the Mines today.`;
    log.push(outcome);
    await showResult(ctx, 'MINING ACCIDENT — Result', [corruptLine, '', outcome]);
    ctx.toast?.(`Mining Accident: ${corruptionRoll} Corruption Hits! No Work the Mines today.`);
    return { log };
  }

  // 4: Fungus Revolt — All Heroes take D6 Hits, no Work the Fungus Farms
  if (roll === 4) {
    const hitRoll = await ctxD6(ctx, 'Fungus Revolt — Roll D6 for Hits');
    const hitLine = `Rolled [${hitRoll}] for Hits.`;
    log.push(hitLine);

    const heroIds = ctx.getHeroesAtShop?.(shopId) || [id];
    for (const hid of heroIds) {
      ctx.updateHero?.(hid, (h) => ({
        ...h,
        currentHealth: Math.max(0, (h.currentHealth ?? h.health ?? h.maxHealth ?? 10) - hitRoll),
      }));
    }

    // Block Work the Fungus Farms today
    const ts = loadTownState() || {};
    const blocked = { ...(ts.blockedServices || {}) };
    blocked.mo_work_fungus_farms = true;
    saveTownState({ ...ts, blockedServices: blocked });

    const outcome = `All Heroes at the Mining Operation take ${hitRoll} Hits from the rioting workers. Heroes may not Work the Fungus Farms today.`;
    log.push(outcome);
    await showResult(ctx, 'FUNGUS REVOLT — Result', [hitLine, '', outcome]);
    ctx.toast?.(`Fungus Revolt: ${hitRoll} Hits! No Work the Fungus Farms today.`);
    return { log };
  }

  // 5-6: The Dark Beneath the Surface — Move Darkness marker 1 Day forward
  if (roll === 5 || roll === 6) {
    const ts = loadTownState() || {};
    const curDarkness = Number(ts.darknessAdvance || 0);
    saveTownState({ ...ts, darknessAdvance: curDarkness + 1 });

    const outcome = 'The Darkness marker moves 1 Day forward on the Town Event Track. What evil lurks in the dark beneath the surface...';
    log.push(outcome);
    await showResult(ctx, 'THE DARK BENEATH THE SURFACE — Result', [outcome]);
    ctx.toast?.('Darkness advances 1 Day on the Town Event Track.');
    return { log };
  }

  // 7: Toxic Fumes and a Cavern of Spores — No Event
  if (roll === 7) {
    const outcome = "It wouldn't be a day down in the tunnels without a few deaths to keep you on your toes. No Event.";
    log.push(outcome);
    await showResult(ctx, 'TOXIC FUMES AND A CAVERN OF SPORES — Result', [outcome]);
    ctx.toast?.('No Event.');
    return { log };
  }

  // 8-9: Worker Shortage — Extra $100 for Work Down in the Tunnels
  if (roll === 8 || roll === 9) {
    const ts = loadTownState() || {};
    const miningFlags = { ...(ts.miningOperationFlags || {}) };
    miningFlags.workerShortageBonus = 100;
    saveTownState({ ...ts, miningOperationFlags: miningFlags });

    const outcome = 'There has been a shortage of workers. Heroes gain an extra $100 for any Work Down in the Tunnels they do today.';
    log.push(outcome);
    await showResult(ctx, 'WORKER SHORTAGE — Result', [outcome]);
    ctx.toast?.('Worker Shortage: +$100 bonus for Work Down in the Tunnels today!');
    return { log };
  }

  // 10: Good Harvest — Fungus Crops -$25 each
  if (roll === 10) {
    const ts = loadTownState() || {};
    const miningFlags = { ...(ts.miningOperationFlags || {}) };
    miningFlags.fungusDiscount = 25;
    saveTownState({ ...ts, miningOperationFlags: miningFlags });

    const outcome = 'The Fungus harvest has been particularly good this season! All Heroes at the Mining Operation today may purchase any of the Fungus Crops for -$25 each.';
    log.push(outcome);
    await showResult(ctx, 'GOOD HARVEST — Result', [outcome]);
    ctx.toast?.('Good Harvest: Fungus Crops are $25 cheaper today!');
    return { log };
  }

  // 11: Buried Town — Draw 2 Gear + 2 Blasted Wastes Artifacts, purchase at Gold Value + $100
  if (roll === 11) {
    const outcome = 'The workers have discovered the ruins of an old Barter Town! Draw 2 Gear cards and 2 Blasted Wastes Artifacts. Any Heroes at the Mining Operation today may purchase any of these Items for their listed Gold value +$100 (Heroes get first pick based on highest to lowest Lore — roll off if tied).';
    log.push(outcome);
    await showResult(ctx, 'BURIED TOWN — Result', [outcome]);
    ctx.toast?.('Buried Town: Draw 2 Gear + 2 Blasted Wastes Artifacts to purchase!');
    return { log };
  }

  // 12: Astounding Discovery — Draw Artifact from Derelict Ship (or World card + Artifact)
  if (roll === 12) {
    const choice = await ctx.promptChoice?.(
      `ASTOUNDING DISCOVERY\n${info.lore}\n\nDo you have the Derelict Ship Expansion?`,
      [
        { label: 'Yes — Draw an Artifact from the Derelict Ship OtherWorld' },
        { label: 'No — Draw a World card and an Artifact from that World' },
      ]
    );
    let outcome;
    if (choice === 0) {
      outcome = 'Draw an Artifact from the Derelict Ship OtherWorld! The ancient ship holds untold treasures.';
    } else {
      outcome = 'Draw a World card and an Artifact from that World. Who knows what ancient relics await!';
    }
    log.push(outcome);
    await showResult(ctx, 'ASTOUNDING DISCOVERY — Result', [outcome]);
    ctx.toast?.('Astounding Discovery!');
    return { log };
  }

  return { log };
}

// --------- Dispatcher compatible with locationEventsEngine ---------------
export async function handleMiningOperationEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? (_d6() + _d6());
  const result = await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: result?.log || [`Mining Operation Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

export const miningOperationHandler = { display, apply };
export default miningOperationHandler;
