// src/utils/locationHandlers/saloonServices.js
import gearCards from '../../data/items/gearCards.js';
import { d6, d3 } from '../../utils/diceHelpers';

// Read a stat off the hero, falling back across shapes
const readStat = (h, name, fallback = 1) => {
  const direct = Number(h?.[name]);
  if (Number.isFinite(direct)) return direct;
  const fromStats = Number(h?.stats?.[name]);
  if (Number.isFinite(fromStats)) return fromStats;
  const fromDerived = Number(h?.derived?.[name]);
  if (Number.isFinite(fromDerived)) return fromDerived;
  return fallback;
};

// Roll N dS using the UI roller when available (so prompts show stat numbers)
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

// Random Gear draw (fallback pool)
function drawRandomGear() {
  const pool = Array.isArray(gearCards)
    ? gearCards
    : Array.isArray(gearCards?.default)
    ? gearCards.default
    : [];

  if (!pool.length) return null;

  const src = pool[Math.floor(Math.random() * pool.length)];
  // Clone and ensure a unique id so inventory never collides
  const id = src.id
    ? `${src.id}_${Date.now()}_${Math.floor(Math.random() * 9999)}`
    : `gear_${Date.now()}_${Math.floor(Math.random() * 9999)}`;

  return { ...src, id };
}

/**
 * Perform a Saloon service by id.
 * ctx: { ui, getActiveHeroId, getHeroById|getHero, updateHero }
 */
export async function performSaloonService(serviceId, _params = {}, ctx = {}) {
  const { ui = {}, getActiveHeroId, getHeroById, getHero } = ctx;

  const hid = getActiveHeroId?.();
  const hero = (getHeroById?.(hid) || getHero?.(hid) || {}) ?? {};

  const actions = [];
  const log = [];
  const pushUpdate = (patch) => actions.push({ type: 'update', ...patch });

  // Convenience stat readers (these may be base values; UI prompt shows totals)
  const stat = (name, fb = 1) => readStat(hero, name, fb);

  switch (String(serviceId)) {
    // ------------------- Gambling -------------------
    case 'saloon_casual_poker': {
      const n = Math.max(1, stat('Cunning', 1));
      const rolls = await rollND(ui, n, 6, `Poker — Cunning ${n}d6`);
      const wins = rolls.filter((r) => r >= 5).length;
      log.push(`Cunning rolls: <b>${rolls.join(', ')}</b>`);

      if (wins > 0) {
        const take = wins * 50;
        const baseGold = Number(hero.gold || 0);
        pushUpdate({ gold: baseGold + take });
        log.push(`You leave the table up <b>$${take}</b>.`);
      } else {
        log.push('Cold cards tonight. You leave with nothing.');
      }
      break;
    }

    case 'saloon_brimstone_craps': {
      const n = Math.max(1, stat('Luck', 1));
      const rolls = await rollND(ui, n, 6, `Craps — Luck ${n}d6`);
      const wins = rolls.filter((r) => r >= 5).length;
      log.push(`Luck rolls: <b>${rolls.join(', ')}</b>`);

      if (wins > 0) {
        const take = wins * 100;
        const baseGold = Number(hero.gold || 0);
        pushUpdate({ gold: baseGold + take });
        log.push(`Hot streak! You pocket <b>$${take}</b>.`);
      } else {
        log.push('The dice turn against you. Nothing gained.');
      }
      break;
    }

    // ------------------- Saloon Girl Performance -------------------
    case 'saloon_girl_performance': {
      // +10 XP
      const baseXp = Math.max(0, Number(hero?.xp || 0));
      pushUpdate({ xp: baseXp + 10 });

      const r = await roll1(
        ui,
        'Saloon Girl Performance (1d6) — Grit on 4–6'
      );
      log.push(`Performance die: <b>${r}</b>`);

      if (r >= 4) {
        const maxGrit = Number.isFinite(hero?.maxGrit)
          ? hero.maxGrit
          : Number.isFinite(hero?.grit)
          ? hero.grit
          : 1;
        const cur = Number(
          hero?.currentGrit ?? hero?.grit ?? 0
        );
        const next = Math.min(maxGrit, cur + 1);
        pushUpdate({ currentGrit: next, grit: next });
        log.push('Recovered <b>+1 Grit</b> for use in Town.');
      } else {
        log.push('Applause… but no Grit this time.');
      }
      break;
    }

    // ------------------- Saloon Girl Troupe -------------------
    case 'saloon_troupe_entertain': {
      // Choose Performance (Agility) or Storytelling (Lore)
      const ag = stat('Agility', 1);
      const lo = stat('Lore', 1);

      const choiceIdx = ui?.promptChoice
        ? await ui.promptChoice('Entertain — choose a style', [
            { label: `Performance (Agility ${ag})` },
            { label: `Storytelling (Lore ${lo})` },
          ])
        : 0;

      const useAgility = choiceIdx === 0;
      const n = Math.max(1, useAgility ? ag : lo);
      const label = useAgility
        ? `Entertain — Performance (Agility ${n}d6)`
        : `Entertain — Storytelling (Lore ${n}d6)`;

      const rolls = await rollND(ui, n, 6, label);
      log.push(`Entertain rolls: <b>${rolls.join(', ')}</b>`);

      let cash = 0;
      for (const r of rolls) {
        if (r === 6) cash += 100;
        else if (r === 4 || r === 5) cash += 25;
      }

      if (cash > 0) {
        const baseGold = Number(hero.gold || 0);
        pushUpdate({ gold: baseGold + cash });
        log.push(`The crowd loved it — you earn <b>$${cash}</b>.`);
      } else {
        log.push('Tough audience. No tips tonight.');
      }
      break;
    }

    case 'saloon_troupe_pickpocket': {
      // Take D3 Corruption Hits first (cost of attempting)
      const corruptionHits = d3();
      const curCorruption = Number(hero.corruption || 0);
      pushUpdate({ corruption: curCorruption + corruptionHits });
      log.push(`Pickpocket costs <b>${corruptionHits} Corruption Hit(s)</b> (D3).`);

      // Agility 4+ test: per-die 4–5 = $10, per 6 = draw a Gear card
      const ag = Math.max(1, stat('Agility', 1));
      const rolls = await rollND(
        ui,
        ag,
        6,
        `Pickpocket — Agility ${ag}d6`
      );
      log.push(`Pickpocket rolls: <b>${rolls.join(', ')}</b>`);

      const tens = rolls.filter((r) => r === 4 || r === 5).length;
      const sixes = rolls.filter((r) => r === 6).length;
      const successes = tens + sixes;

      if (successes === 0) {
        // No penalty on failure per your rule — just flavor text
        log.push(
          'No luck — empty pockets and watchful eyes. You get nothing.'
        );
      } else {
        if (tens > 0) {
          const cash = tens * 10;
          const baseGold = Number(hero.gold || 0);
          pushUpdate({ gold: baseGold + cash });
          log.push(`You lift <b>$${cash}</b> (${tens}× $10).`);
        }
        if (sixes > 0) {
          const inv = Array.isArray(hero.inventory)
            ? hero.inventory.slice()
            : [];
          const names = [];
          for (let i = 0; i < sixes; i++) {
            const item = drawRandomGear();
            if (item) {
              inv.push(item);
              names.push(item.name || 'Gear');
            }
          }
          if (names.length) {
            pushUpdate({ inventory: inv });
            log.push(
              `Sticky fingers! You stole <b>${names.join(
                ', '
              )}</b> (added to inventory).`
            );
          } else {
            log.push('Nothing worth taking this time.');
          }
        }
      }
      break;
    }

    default:
      log.push('Performed.');
  }

  // NOTE: we do NOT call ctx.updateHero here.
  // TownTab.applyActions() will merge all type:'update' actions
  // and call updateHero({ id, ...patch }) once.

  return {
    actions,
    log,
    ui: {
      title: 'Saloon',
      outcome: log,
    },
  };
}

// Backwards-compat alias (if anything still calls the “Obj” form)
export const performSaloonServiceObj = performSaloonService;
export default performSaloonService;
