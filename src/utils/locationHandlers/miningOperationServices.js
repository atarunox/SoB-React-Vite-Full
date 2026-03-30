// src/utils/locationHandlers/miningOperationServices.js
// Work Down in the Tunnels — you may do 1 of the following per Location Visit.

import { d6, d3 } from '../../utils/diceHelpers';
import { loadTownState, saveTownState } from '../townState.js';
import { drawWorldCardAndArtifact } from './worldCardDraw.js';

async function rollND(ui, n, sides, label) {
  if (ui?.roll) {
    const r = await ui.roll(n, sides, label);
    if (Array.isArray(r) && r.length === n) {
      return r.map((x) => Number(x) || d6());
    }
  }
  return Array.from({ length: n }, () => Math.floor(Math.random() * sides) + 1);
}

async function roll1(ui, label) {
  const r = await rollND(ui, 1, 6, label);
  return Array.isArray(r) ? r[0] : Number(r) || d6();
}

async function roll1d3(ui, label) {
  const r = await rollND(ui, 1, 3, label);
  return Array.isArray(r) ? r[0] : Number(r) || d3();
}

// Worker Shortage bonus from location event (roll 8-9)
function getWorkerShortageBonus() {
  const ts = loadTownState() || {};
  return Number(ts.miningOperationFlags?.workerShortageBonus ?? 0);
}

/**
 * Perform a Mining Operation service by id.
 * ctx: { ui, getActiveHeroId, getHeroById|getHero, updateHero }
 */
export async function performMiningOperationService(serviceId, _params = {}, ctx = {}) {
  const { ui = {}, getActiveHeroId, getHeroById, getHero } = ctx;

  const hid = getActiveHeroId?.();
  const hero = (getHeroById?.(hid) || getHero?.(hid) || {}) ?? {};

  const actions = [];
  const log = [];
  const pushUpdate = (patch) => actions.push({ type: 'update', ...patch });

  // Check if this service is blocked by location events
  const ts = loadTownState() || {};
  const blocked = ts.blockedServices || {};

  const bonus = getWorkerShortageBonus();

  switch (String(serviceId)) {
    // ------------------- Work the Refinery -------------------
    case 'mo_work_refinery': {
      if (blocked.mo_work_refinery) {
        log.push('The Refinery is not operational today.');
        break;
      }

      // Cost: Discard 1 Grit
      const curGrit = Number(hero.currentGrit ?? hero.grit ?? 0);
      if (curGrit < 1) {
        log.push('You do not have enough Grit to work the Refinery (requires 1 Grit).');
        break;
      }
      pushUpdate({ currentGrit: curGrit - 1 });
      log.push('Discarded <b>1 Grit</b> to work the Refinery.');

      // Take D3 Corruption Hits
      const corruptRoll = await roll1d3(ui, 'Work the Refinery — D3 Corruption Hits');
      const curCorruption = Number(hero.corruption || 0);
      pushUpdate({ corruption: curCorruption + corruptRoll });
      log.push(`Took <b>${corruptRoll} Corruption Hit${corruptRoll !== 1 ? 's' : ''}</b> (D3) from the refinery work.`);

      // Gain D6 × $100
      const goldRoll = await roll1(ui, 'Work the Refinery — D6 × $100 pay');
      let pay = goldRoll * 100;
      if (bonus > 0) {
        pay += bonus;
        log.push(`Worker Shortage bonus: +$${bonus}`);
      }
      const curGold = Number(hero.gold || 0);
      pushUpdate({ gold: curGold + pay });
      log.push(`Earned <b>$${pay}</b> (rolled [${goldRoll}] × $100${bonus > 0 ? ` + $${bonus} bonus` : ''}).`);

      // Flash Powder discount
      log.push('Flash Powder costs $25 less today.');

      // Store the discount in town state
      const miningFlags = { ...(ts.miningOperationFlags || {}) };
      miningFlags.flashPowderDiscount = 25;
      saveTownState({ ...ts, miningOperationFlags: miningFlags });

      break;
    }

    // ------------------- Work the Fungus Farms -------------------
    case 'mo_work_fungus_farms': {
      if (blocked.mo_work_fungus_farms) {
        log.push('The Fungus Farms are in revolt and cannot be worked today.');
        break;
      }

      // Cost: Discard 1 Grit
      const curGrit = Number(hero.currentGrit ?? hero.grit ?? 0);
      if (curGrit < 1) {
        log.push('You do not have enough Grit to work the Fungus Farms (requires 1 Grit).');
        break;
      }
      pushUpdate({ currentGrit: curGrit - 1 });
      log.push('Discarded <b>1 Grit</b> to work the Fungus Farms.');

      // Gain D6 × $25
      const goldRoll = await roll1(ui, 'Work the Fungus Farms — D6 × $25 pay');
      let pay = goldRoll * 25;
      if (bonus > 0) {
        pay += bonus;
        log.push(`Worker Shortage bonus: +$${bonus}`);
      }
      const curGold = Number(hero.gold || 0);
      pushUpdate({ gold: curGold + pay });
      log.push(`Earned <b>$${pay}</b> (rolled [${goldRoll}] × $25${bonus > 0 ? ` + $${bonus} bonus` : ''}).`);

      // Fungus discount
      log.push('Any Fungus purchased today costs $25 less each.');

      const miningFlags = { ...(ts.miningOperationFlags || {}) };
      miningFlags.fungusDiscount = (miningFlags.fungusDiscount ?? 0) + 25;
      saveTownState({ ...ts, miningOperationFlags: miningFlags });

      break;
    }

    // ------------------- Work the Mines -------------------
    case 'mo_work_mines': {
      if (blocked.mo_work_mines) {
        log.push('A mining accident has made the mines too dangerous to work today.');
        break;
      }

      // Cost: Discard 1 Grit
      const curGrit = Number(hero.currentGrit ?? hero.grit ?? 0);
      if (curGrit < 1) {
        log.push('You do not have enough Grit to work the Mines (requires 1 Grit).');
        break;
      }
      pushUpdate({ currentGrit: curGrit - 1 });
      log.push('Discarded <b>1 Grit</b> to work the Mines.');

      // Take D6 Hits
      const hitRoll = await roll1(ui, 'Work the Mines — D6 Hits');
      const curHealth = Number(hero.currentHealth ?? hero.health ?? hero.maxHealth ?? 10);
      pushUpdate({ currentHealth: Math.max(0, curHealth - hitRoll) });
      log.push(`Took <b>${hitRoll} Hit${hitRoll !== 1 ? 's' : ''}</b> (D6) from a hard day in the mines.`);

      // Gain $50
      let pay = 50;
      if (bonus > 0) {
        pay += bonus;
        log.push(`Worker Shortage bonus: +$${bonus}`);
      }
      const curGold = Number(hero.gold || 0);
      pushUpdate({ gold: curGold + pay });
      log.push(`Earned <b>$${pay}</b>${bonus > 0 ? ` ($50 + $${bonus} bonus)` : ''}.`);

      // Roll on Mining Chart (D6)
      const chartRoll = await roll1(ui, 'Work the Mines — D6 Mining Chart');
      log.push(`Mining Chart roll: <b>${chartRoll}</b>`);

      switch (chartRoll) {
        case 1:
          log.push('<b>Buried Hulk</b> — Undead burst from the wreck and attack! One Random Building in Town is Destroyed.');
          break;
        case 2: {
          const woundRoll = await roll1(ui, 'Cave In — D6 Wounds (ignoring Defense)');
          const hpNow = Number(hero.currentHealth ?? hero.health ?? hero.maxHealth ?? 10) - hitRoll;
          pushUpdate({ currentHealth: Math.max(0, hpNow - woundRoll) });
          log.push(`<b>Cave In</b> — Rolled [${woundRoll}] Wounds (ignoring Defense).`);
          break;
        }
        case 3: {
          const scrapRoll = await roll1d3(ui, 'Scrap Pocket — D3+1 Scrap Tokens');
          const scrapGain = scrapRoll + 1;
          log.push(`<b>Scrap Pocket</b> — Gain ${scrapGain} Scrap Tokens (D3+1, rolled [${scrapRoll}]+1).`);
          break;
        }
        case 4: {
          const techRoll = await roll1d3(ui, 'Lost Tech — D3 Tech Tokens');
          log.push(`<b>Lost Tech</b> — Gain ${techRoll} Tech Token${techRoll !== 1 ? 's' : ''} (D3).`);
          break;
        }
        case 5: {
          const lootRoll = await roll1d3(ui, 'Buried Escape Pod — D3 Wasteland Loot cards');
          log.push(`<b>Buried Escape Pod</b> — Draw ${lootRoll} Wasteland Loot card${lootRoll !== 1 ? 's' : ''} (D3).`);
          break;
        }
        case 6: {
          const draw = drawWorldCardAndArtifact();
          const worldName = draw.worldName || 'Unknown World';
          const artifact = draw.artifact;
          log.push(`<b>"What's This?"</b> — World Card drawn: <b>${worldName}</b>`);
          if (artifact) {
            log.push(`Artifact drawn: <b>${artifact.name}</b> (${worldName})`);
            const effectsStr = artifact.effects
              ? (Array.isArray(artifact.effects) ? artifact.effects.join('; ') : JSON.stringify(artifact.effects))
              : '';
            const rulesStr = Array.isArray(artifact.rules) ? artifact.rules.join(' ') : '';
            if (effectsStr) log.push(`Effects: ${effectsStr}`);
            if (rulesStr) log.push(`Rules: ${rulesStr}`);

            // Add artifact to hero's items (free discovery from the mines)
            const items = Array.isArray(hero.items) ? [...hero.items] : [];
            items.push({
              ...artifact,
              id: artifact.id || `artifact_mines_${Date.now()}`,
              type: artifact.type || 'Artifact',
              acquiredFrom: `What's This? (Work the Mines) — ${worldName}`,
            });
            pushUpdate({ items });
            log.push(`Added <b>${artifact.name}</b> to inventory!`);
          } else {
            log.push(`No Artifacts found for ${worldName} in data. Draw the Artifact manually.`);
          }
          break;
        }
      }
      break;
    }

    default:
      log.push('Performed.');
  }

  return {
    actions,
    log,
    ui: {
      title: 'Mining Operation',
      outcome: log,
    },
  };
}

export default performMiningOperationService;
