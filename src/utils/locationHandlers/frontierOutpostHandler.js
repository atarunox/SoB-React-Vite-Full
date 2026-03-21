// src/utils/locationHandlers/frontierOutpostHandler.js
//
// Frontier Outpost – Location Event handler (2d6 table)
// Canonical ctx-pattern implementation.

import { loadTownState, saveTownState } from '../../utils/townState';
import { d6 as _d6 } from '../../utils/diceHelpers';
import { getEventDisplay } from '../locationEventText';
import { otherWorldArtifacts } from '../../data/items/otherWorldArtifacts.js';

const ctxD6 = async (ctx, label) => (typeof ctx?.d6 === 'function') ? ctx.d6(label) : _d6();

const shopId = 'frontierOutpost';

// ---------- formatting helpers ----------

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

// ---------- townState helpers ----------

function patchShopMods(patch) {
  const s = loadTownState();
  const cur = s.shopMods?.[shopId] || {};
  const next = { ...cur, ...patch };
  const updated = { ...s, shopMods: { ...(s.shopMods || {}), [shopId]: next } };
  saveTownState(updated);
}

function patchStayMods(patch) {
  const s = loadTownState();
  const cur = s.stayMods || {};
  const next = { ...cur, ...patch };
  saveTownState({ ...s, stayMods: next });
}

// ---------- display ----------

export function display(roll) {
  return getEventDisplay(shopId, roll) || { title: 'Frontier Outpost Event', lore: '', effect: 'No Event.' };
}

// ---------- Dark Stone sell helper ----------

function sellAllDarkStone(ctx, id, rate, log) {
  const hero = (ctx.getHeroById ?? ctx.getHero)?.(id);
  const cur = Number(hero?.darkStone ?? hero?.darkstone ?? hero?.DarkStone ?? 0);
  if (cur <= 0) { log.push('No Dark Stone to sell.'); return; }
  const total = cur * rate;
  ctx.updateHero?.(id, h => ({ ...h, darkStone: 0, gold: (h.gold || 0) + total }));
  log.push(`Sold ${cur} Dark Stone for $${total} ($${rate} each).`);
}

// ---------- mechanics (apply) ----------

export async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId?.();
  if (!id) return { log: [] };

  const info = display(roll);
  const log = [];

  log.push(`[Frontier Outpost] (${roll}) ${info.title} — ${info.lore}`);
  log.push(`Effect: ${info.effect}`);

  // ---- 2: Mad with Power ----
  if (roll === 2) {
    patchShopMods({ trainingDisabled: true });
    patchStayMods({ foDailyGateTest: true });

    log.push('Training with Soldiers is disabled for the rest of this Town Stay.');

    // Test each hero in the posse
    const allHeroes = ctx.getAllHeroes?.() || ctx.listHeroes?.() || [];
    for (const h of allHeroes) {
      const hid = h.id || h.localId;
      if (!hid) continue;
      const heroName = h.name || 'Hero';

      // Player chooses Agility or Cunning
      const statIdx = await ctx.promptChoice?.(
        `MAD WITH POWER — Gate Test\n\n${heroName} must pass an Agility 5+ or Cunning 5+ test to avoid the corrupt soldiers.\n\nChoose which stat to test:`,
        [
          { label: 'Agility 5+ test' },
          { label: 'Cunning 5+ test' },
        ]
      );

      const stat = statIdx === 1 ? 'Cunning' : 'Agility';
      const result = await ctx.doSkillCheck(hid, {
        stat, target: 5, returnDetails: true,
        message: `MAD WITH POWER\n${info.lore}\n${heroName} tries to out-maneuver the corrupt soldiers.`,
      });
      const checkLine = formatCheckResult(result, stat, 5);
      if (checkLine) log.push(checkLine);
      const passed = result?.passed ?? result;

      if (passed) {
        const outcome = `${heroName} passes the ${stat} test and may continue the day as normal.`;
        log.push(outcome);
        await showResult(ctx, `MAD WITH POWER — ${heroName}`, [checkLine, '', outcome]);
      } else {
        // Failed: pay D6×$50 or leave
        const costRoll = await ctxD6(ctx, 'Mad with Power — Roll D6 for cost (×$50)');
        const cost = costRoll * 50;
        const costLine = `Rolled [${costRoll}] × $50 = $${cost}.`;
        log.push(costLine);

        const payIdx = await ctx.promptChoice?.(
          `MAD WITH POWER — ${heroName} Failed\n\n${checkLine}\n${costLine}\n\n${heroName} failed the gate test. Choose:`,
          [
            { label: `Pay $${cost} to stay in town` },
            { label: 'Leave town immediately' },
          ]
        );

        if (payIdx === 0) {
          ctx.updateHero?.(hid, prev => ({ ...prev, gold: Math.max(0, (prev.gold || 0) - cost) }));
          const outcome = `${heroName} pays $${cost} and may remain in town.`;
          log.push(outcome);
          await showResult(ctx, `MAD WITH POWER — ${heroName}`, [checkLine, costLine, '', outcome]);
        } else {
          const outcome = `${heroName} leaves town immediately.`;
          log.push(outcome);
          await showResult(ctx, `MAD WITH POWER — ${heroName}`, [checkLine, costLine, '', outcome]);
        }
      }
    }
    return { log };
  }

  // ---- 3: Dark Stone Explosion ----
  if (roll === 3) {
    const lore3 = `DARK STONE EXPLOSION\n${info.lore}\nYou must fight off the tentacles!`;
    const result = await ctx.doSkillCheck(id, {
      stat: 'Strength', target: 5, returnDetails: true,
      message: `${lore3}\nMake a Strength 5+ test to fight off the tentacles.`,
    });
    const checkLine = formatCheckResult(result, 'Strength', 5);
    if (checkLine) log.push(checkLine);
    const passed = result?.passed ?? result;

    if (passed) {
      ctx.updateHero?.(id, h => ({ ...h, xp: (h.xp || 0) + 20 }));
      const outcome = 'You fight off the tentacles and escape with your life! +20 XP.';
      log.push(outcome);
      await showResult(ctx, 'DARK STONE EXPLOSION — Result', [checkLine, '', outcome]);
      ctx.toast?.('Dark Stone Explosion: Passed! +20 XP.');
    } else {
      const lossRoll = await ctxD6(ctx, 'Dark Stone Explosion — Roll D6 for Dark Stone lost');
      const lossLine = `Rolled [${lossRoll}] for Dark Stone lost.`;
      log.push(lossLine);
      ctx.updateHero?.(id, h => {
        const cur = Number(h.darkStone ?? h.darkstone ?? h.DarkStone ?? 0);
        return { ...h, darkStone: Math.max(0, cur - lossRoll) };
      });
      const outcome = `The tentacles wrap around your Dark Stone and pull it through the gate. Lose ${lossRoll} Dark Stone.`;
      log.push(outcome);
      await showResult(ctx, 'DARK STONE EXPLOSION — Result', [checkLine, lossLine, '', outcome]);
      ctx.toast?.(`Dark Stone Explosion: Failed — lose ${lossRoll} Dark Stone.`);
    }

    // Outpost destroyed either way
    patchShopMods({ destroyed: true });
    const destroyed = 'The Frontier Outpost is destroyed and may no longer be visited for the rest of this Town Stay.';
    log.push(destroyed);
    return { log };
  }

  // ---- 4: Ambushed Caravan ----
  if (roll === 4) {
    patchStayMods({ hazardRollMod: -1 });
    const outcome = 'Few survivors remain to protect the Town. All Town Event and Camp Site Hazard rolls are -1 for the rest of this Town Stay.';
    log.push(outcome);
    await showResult(ctx, 'AMBUSHED CARAVAN — Result', [outcome]);
    ctx.toast?.('Ambushed Caravan: Town Event & Hazard rolls -1.');
    return { log };
  }

  // ---- 5: Dark Stone Glut ----
  if (roll === 5) {
    const rateRoll = await ctxD6(ctx, 'Dark Stone Glut — Roll D6 for rate (×$10)');
    const rate = rateRoll * 10;
    const rateLine = `Rolled [${rateRoll}] × $10 = $${rate} per shard.`;
    log.push(rateLine);

    patchShopMods({ darkStoneRate: rate, darkStoneRateMode: 'glut' });

    const sellIdx = await ctx.promptChoice?.(
      `DARK STONE GLUT\n\n${rateLine}\n\nDark Stone sold to the Outpost Bank is only worth $${rate} per shard today.\n\nSell all your Dark Stone now?`,
      [
        { label: `Sell all Dark Stone at $${rate} each` },
        { label: 'Keep it for later' },
      ]
    );

    if (sellIdx === 0) {
      sellAllDarkStone(ctx, id, rate, log);
    } else {
      log.push(`Keeping Dark Stone. The $${rate}/shard rate is available at the Outpost Bank today.`);
    }
    await showResult(ctx, 'DARK STONE GLUT — Result', [rateLine, '', log[log.length - 1]]);
    ctx.toast?.(`Dark Stone Glut: $${rate}/shard today.`);
    return { log };
  }

  // ---- 6: Hanging ----
  if (roll === 6) {
    ctx.updateHero?.(id, h => {
      const curGrit = h.currentGrit ?? h.grit ?? 0;
      return { ...h, currentGrit: Math.max(0, curGrit - 1) };
    });
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id);
    const newGrit = hero?.currentGrit ?? '?';
    const outcome = `Shaken by the sight, you lose 1 Grit (now ${newGrit}).`;
    log.push(outcome);
    await showResult(ctx, 'HANGING — Result', [outcome]);
    ctx.toast?.('Hanging: -1 Grit.');
    return { log };
  }

  // ---- 7: Trading Post ----
  if (roll === 7) {
    // Draw random world + artifact
    const byWorld = otherWorldArtifacts.reduce((acc, art) => {
      const w = art.world || 'Unknown';
      if (!acc[w]) acc[w] = [];
      acc[w].push(art);
      return acc;
    }, {});

    const worlds = Object.keys(byWorld);
    if (!worlds.length) {
      const outcome = 'No OtherWorld Artifacts found in data. Resolve manually.';
      log.push(outcome);
      await showResult(ctx, 'TRADING POST — Result', [outcome]);
      return { log };
    }

    const world = worlds[Math.floor(Math.random() * worlds.length)];
    const pool = byWorld[world] || [];
    const artifact = pool[Math.floor(Math.random() * pool.length)] || pool[0];

    const priceRoll = await ctxD6(ctx, 'Trading Post — Roll D6 for price (×$150)');
    const price = priceRoll * 150;
    const priceLine = `Rolled [${priceRoll}] × $150 = $${price}.`;
    log.push(priceLine);

    patchShopMods({
      worldArtifactOffer: {
        world,
        artifactId: artifact.id,
        artifactName: artifact.name,
        price,
      },
    });

    const outcome = `World Card drawn: ${world}. Artifact: ${artifact.name}. The party may purchase it for $${price}.`;
    log.push(outcome);
    await showResult(ctx, 'TRADING POST — Result', [priceLine, '', outcome]);
    ctx.toast?.(`Trading Post: ${artifact.name} from ${world} — $${price}.`);
    return { log };
  }

  // ---- 8: The Banners Yet Wave ----
  if (roll === 8) {
    ctx.updateHero?.(id, h => {
      const maxHealth = h.maxHealth ?? h.max_health ?? 10;
      const maxSanity = h.maxSanity ?? h.SanityMax ?? 0;
      const curGrit = h.currentGrit ?? h.grit ?? 0;
      return {
        ...h,
        currentHealth: maxHealth,
        currentSanity: maxSanity,
        currentGrit: curGrit + 1,
      };
    });
    const outcome = 'Seeing the flags fly high fills your spirit with hope. Fully heal Health and Sanity, and recover 1 Grit.';
    log.push(outcome);
    await showResult(ctx, 'THE BANNERS YET WAVE — Result', [outcome]);
    ctx.toast?.('The Banners Yet Wave: Full heal + 1 Grit!');
    return { log };
  }

  // ---- 9: Dark Stone Shortage ----
  if (roll === 9) {
    const rateRoll = await ctxD6(ctx, 'Dark Stone Shortage — Roll D6 for rate (×$50)');
    const rate = rateRoll * 50;
    const rateLine = `Rolled [${rateRoll}] × $50 = $${rate} per shard.`;
    log.push(rateLine);

    patchShopMods({ darkStoneRate: rate, darkStoneRateMode: 'shortage' });

    const sellIdx = await ctx.promptChoice?.(
      `DARK STONE SHORTAGE\n\n${rateLine}\n\nThe Outpost Bank is willing to pay top dollar — $${rate} per shard today.\n\nSell all your Dark Stone now?`,
      [
        { label: `Sell all Dark Stone at $${rate} each` },
        { label: 'Keep it for later' },
      ]
    );

    if (sellIdx === 0) {
      sellAllDarkStone(ctx, id, rate, log);
    } else {
      log.push(`Keeping Dark Stone. The $${rate}/shard rate is available at the Outpost Bank today.`);
    }
    await showResult(ctx, 'DARK STONE SHORTAGE — Result', [rateLine, '', log[log.length - 1]]);
    ctx.toast?.(`Dark Stone Shortage: $${rate}/shard today.`);
    return { log };
  }

  // ---- 10: The Sound of Bugles ----
  if (roll === 10) {
    patchStayMods({ skipNextTownEvent: true });
    const outcome = 'The soldiers are running drills. Do not roll for a Town Event at the end of this day in Town.';
    log.push(outcome);
    await showResult(ctx, 'THE SOUND OF BUGLES — Result', [outcome]);
    ctx.toast?.('Sound of Bugles: Skip next Town Event.');
    return { log };
  }

  // ---- 11: War Stories ----
  if (roll === 11) {
    ctx.updateHero?.(id, h => {
      const prevBuffs = Array.isArray(h.oncePerAdventure) ? h.oncePerAdventure : [];
      if (prevBuffs.some(b => b.id === 'war_stories_damage_reroll')) return h;
      return {
        ...h,
        oncePerAdventure: [
          ...prevBuffs,
          {
            id: 'war_stories_damage_reroll',
            name: 'War Stories (Damage Reroll)',
            used: false,
            notes: 'Once during the next Adventure, you may reroll a Damage roll.',
            source: 'Frontier Outpost (#11)',
            usesRemaining: 1,
          },
        ],
      };
    });
    const outcome = 'You exchange stories with the soldiers. Buff applied: once during the next Adventure, you may reroll a Damage roll.';
    log.push(outcome);
    await showResult(ctx, 'WAR STORIES — Result', [outcome]);
    ctx.toast?.('War Stories: Damage reroll buff added!');
    return { log };
  }

  // ---- 12: Deputized ----
  if (roll === 12) {
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id);
    const kws = Array.isArray(hero?.keywords) ? [...hero.keywords] : [];
    const hasLaw = kws.includes('Law');
    const hasOutlaw = kws.includes('Outlaw');

    if (hasLaw) {
      const outcome = `${hero?.name || 'Hero'} already has Law. No change.`;
      log.push(outcome);
      await showResult(ctx, 'DEPUTIZED — Result', [outcome]);
    } else if (hasOutlaw) {
      const keepIdx = await ctx.promptChoice?.(
        `DEPUTIZED\n\n${hero?.name || 'Hero'} already has the Outlaw keyword.\n\nYou have been deputized! Choose which keyword to keep:`,
        [
          { label: 'Keep Law (remove Outlaw)' },
          { label: 'Keep Outlaw (decline Law)' },
        ]
      );
      const keep = keepIdx === 1 ? 'Outlaw' : 'Law';
      const next = kws.filter(kw => kw !== 'Law' && kw !== 'Outlaw');
      next.push(keep);
      ctx.updateHero?.(id, h => ({ ...h, keywords: next }));
      const outcome = `${hero?.name || 'Hero'} keeps the ${keep} keyword.`;
      log.push(outcome);
      await showResult(ctx, 'DEPUTIZED — Result', [outcome]);
    } else {
      const next = [...kws, 'Law'];
      ctx.updateHero?.(id, h => ({ ...h, keywords: next }));
      const outcome = `${hero?.name || 'Hero'} gains the Law keyword.`;
      log.push(outcome);
      await showResult(ctx, 'DEPUTIZED — Result', [outcome]);
    }
    ctx.toast?.('Deputized!');
    return { log };
  }

  return { log };
}

// --------- Dispatcher compatible with locationEventsEngine ---------------

export async function handleFrontierOutpostEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? (_d6() + _d6());
  const result = await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: result?.log || [`Frontier Outpost Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

export const frontierOutpostHandler = { display, apply };
export default frontierOutpostHandler;
