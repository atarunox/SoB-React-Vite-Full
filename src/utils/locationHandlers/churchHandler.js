// src/utils/locationHandlers/churchHandler.js
import { loadTownState, saveTownState } from '../../utils/townState';
import { makeMaxChangeNote, pushConditionNote } from '../../utils/conditionNotes';
import { getEventDisplay } from '../locationEventText';
import churchData from '../../data/townLocations/FrontierTown/Church/church.js';
import { mineArtifacts } from '../../data/items/mineArtifacts';
import churchBlessedAuras from '../../data/townLocations/FrontierTown/Church/churchBlessedAuras.js';

import { d6 as _d6, roll2d6 } from '../../utils/diceHelpers';

// Use ctx.d6/ctx.d3 when available (respects manual roll mode); fallback to auto-roll
const ctxD6 = async (ctx, label) => (typeof ctx?.d6 === 'function') ? ctx.d6(label) : _d6();
const ctxD3 = async (ctx, label) => (typeof ctx?.d3 === 'function') ? ctx.d3(label) : Math.ceil(_d6() / 2);

const shopId = churchData?.id || 'church';

// ---------- result formatting helpers ----------
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

// Light "bus" notifier for UI panels that want to react to state changes.
function dispatchUI(name, detail) {
  try { window.dispatchEvent(new CustomEvent(name, { detail })); } catch {}
}

// ----------------------------- small helpers ------------------------------

function patchStayMods(patch) {
  const s = loadTownState();
  const next = { ...(s.stayMods || {}), ...patch };
  const updated = { ...s, stayMods: next };
  saveTownState(updated);
  dispatchUI('townstate:changed', updated);
}

export function display(roll) {
  return (
    getEventDisplay(shopId, roll) || { title: 'Church Event', lore: '', effect: 'No Event.' }
  );
}

function drawMineArtifact() {
  const pool = Array.isArray(mineArtifacts) ? mineArtifacts : [];
  if (!pool.length) return null;
  const i = Math.floor(Math.random() * pool.length);
  const raw = pool[i] || {};
  const id =
    raw.id ||
    `mine_art_${i}_${String(raw.name || 'artifact')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')}`;
  const cost =
    raw.cost && typeof raw.cost === 'object'
      ? { ...raw.cost }
      : Number.isFinite(raw.value)
      ? { gold: Number(raw.value) }
      : { gold: 0 };
  const effects = Array.isArray(raw.effects) ? raw.effects : raw.effect ? [String(raw.effect)] : [];
  return {
    ...raw,
    id,
    type: raw.type || 'Artifact',
    tags: Array.isArray(raw.tags) ? raw.tags : ['Artifact'],
    upgradeSlots: Number.isFinite(raw.upgradeSlots) ? raw.upgradeSlots : 0,
    weight: Number.isFinite(raw.weight) ? raw.weight : 1,
    cost,
    effects,
    source: raw.source || 'Mine Artifacts Deck',
  };
}

// --------- artifact collection (inventory + equipped slots) ---------------

function isArtifact(it) {
  if (!it) return false;
  const t = String(it?.type || '').toLowerCase();
  const hasTag = Array.isArray(it?.tags) && it.tags.includes('Artifact');
  return hasTag || t === 'artifact' || t.startsWith('artifact ');
}

function collectArtifactsFromHero(hero) {
  const results = [];

  const inv = Array.isArray(hero?.inventory) ? hero.inventory : [];
  inv.forEach((it, idx) => {
    if (isArtifact(it)) {
      results.push({ source: 'inventory', idx, it, label: it?.name || it?.id || 'Artifact' });
    }
  });

  const pushEquipped = (slotKey, it) => {
    if (!isArtifact(it)) return;
    results.push({
      source: 'slot',
      slot: slotKey,
      it,
      label: `${it?.name || it?.id || 'Artifact'} (equipped: ${slotKey})`,
    });
  };

  if (hero?.equipped && typeof hero.equipped === 'object') {
    Object.entries(hero.equipped).forEach(([k, it]) => pushEquipped(k, it));
  }
  if (hero?.gear && typeof hero.gear === 'object') {
    Object.entries(hero.gear).forEach(([k, it]) => pushEquipped(k, it));
  }
  if (hero?.gearSlots && typeof hero.gearSlots === 'object') {
    Object.entries(hero.gearSlots).forEach(([k, it]) => pushEquipped(k, it));
  }
  if (Array.isArray(hero?.slots)) {
    hero.slots.forEach((entry) => {
      const slotKey = entry?.slot || entry?.name || 'Slot';
      const it = entry?.item || entry?.equipped || null;
      pushEquipped(slotKey, it);
    });
  } else if (hero?.slots && typeof hero.slots === 'object') {
    Object.entries(hero.slots).forEach(([slotKey, maybe]) => {
      const it = maybe && typeof maybe === 'object' && 'item' in maybe ? maybe.item : maybe;
      pushEquipped(slotKey, it);
    });
  }

  return results;
}

// ------------------------------- core apply -------------------------------

async function apply(roll, ctx) {
  const activeId = ctx.getActiveHeroId?.();
  if (!activeId) return { log: [] };

  const getHero = ctx.getHero || ctx.getHeroById;
  const updateHero = ctx.updateHero;
  const toast = ctx.toast;
  const _getHeroesAtShop = ctx.getHeroesAtShop;

  const info = display(roll);
  const log = [];

  log.push(`[Church] (${roll}) ${info.title} — ${info.lore}`);
  log.push(`Effect: ${info.effect}`);

  switch (roll) {
    // 2: Cult Worshippers — STR 6+; pass: draw Mine Artifact. Fail: choose an Artifact to discard. Church closes.
    case 2: {
      const hero = getHero?.(activeId);
      const heroName = hero?.name || 'Hero';
      const lore2 = `CULT WORSHIPPERS\n"The Order here is not the Sacred Order, but the Order of the Crimson Hand! You struggle with the Inquisitor as he tries to use an artifact on you."`;

      const result = await ctx.doSkillCheck(activeId, {
        stat: 'Strength', target: 6, returnDetails: true,
        message: `${lore2}\n${heroName} struggles with the Inquisitor!\nPass: Draw a Mine Artifact. Fail: Lose one Artifact.`,
      });
      const checkLine = formatCheckResult(result, 'Strength', 6);
      if (checkLine) log.push(checkLine);
      const passed = result?.passed ?? result;

      if (passed) {
        const card = drawMineArtifact();
        if (card) {
          updateHero?.(activeId, (h) => {
            const inv = Array.isArray(h.inventory) ? [...h.inventory] : [];
            inv.push(card);
            return { ...h, inventory: inv };
          });
          const lines = [`${heroName} seized a Mine Artifact: ${card.name}`];
          if (card.type) lines.push(`Type: ${card.type}`);
          const fx = Array.isArray(card.effects) ? card.effects : [];
          if (fx.length) lines.push(`Effects: ${fx.join('; ')}`);
          const outcome = lines.join('\n');
          log.push(outcome);
          await showResult(ctx, 'CULT WORSHIPPERS — Result', [checkLine, '', outcome]);
          toast?.(`Cult Worshippers — ${heroName} passed! Drew ${card.name}.`);
          dispatchUI('inventory:received', { heroId: activeId, item: card });
        } else {
          const outcome = 'No artifact deck available.';
          log.push(outcome);
          await showResult(ctx, 'CULT WORSHIPPERS — Result', [checkLine, '', 'Pass! ' + outcome]);
          toast?.('Cult Worshippers — success! (No artifact deck available.)');
        }
      } else {
        // Failed — choose an Artifact to discard
        const arts = collectArtifactsFromHero(hero);
        if (!arts.length) {
          const outcome = 'Failed, but you have no Artifacts to lose.';
          log.push(outcome);
          await showResult(ctx, 'CULT WORSHIPPERS — Result', [checkLine, '', outcome]);
          toast?.('Cult Worshippers — failed, but no Artifacts to lose.');
        } else {
          const options = arts.map((a) => {
            const it = a.it || {};
            const fx = Array.isArray(it.effects) ? it.effects : [];
            let desc = a.label;
            if (it.type) desc += ` (${it.type})`;
            if (fx.length) desc += ` — ${fx.join('; ')}`;
            return { label: desc };
          });

          const pickIdx = await ctx.promptChoice?.(
            `CULT WORSHIPPERS — Failed!\n${checkLine}\n\nThe Inquisitor steals one of your Artifacts.\nChoose which Artifact to lose:`,
            options
          );
          const sel = arts[pickIdx ?? 0];
          if (sel) {
            updateHero?.(activeId, (h) => {
              if (sel.source === 'inventory') {
                const inv2 = Array.isArray(h.inventory) ? [...h.inventory] : [];
                if (sel.idx >= 0 && sel.idx < inv2.length) inv2.splice(sel.idx, 1);
                return { ...h, inventory: inv2 };
              }
              const next = { ...h };
              if (next.equipped && typeof next.equipped === 'object' && sel.slot in next.equipped) {
                next.equipped = { ...next.equipped, [sel.slot]: null };
              }
              if (next.gear && typeof next.gear === 'object' && sel.slot in next.gear) {
                next.gear = { ...next.gear, [sel.slot]: null };
              }
              if (next.gearSlots && typeof next.gearSlots === 'object' && sel.slot in next.gearSlots) {
                next.gearSlots = { ...next.gearSlots, [sel.slot]: null };
              }
              if (Array.isArray(next.slots)) {
                next.slots = next.slots.map((entry) => {
                  const slotKey = entry?.slot || entry?.name;
                  if (slotKey === sel.slot) return { ...entry, item: null, equipped: null };
                  return entry;
                });
              }
              if (next.slots && typeof next.slots === 'object' && !Array.isArray(next.slots)) {
                const cur = next.slots[sel.slot];
                if (cur && typeof cur === 'object' && 'item' in cur) {
                  next.slots = { ...next.slots, [sel.slot]: { ...cur, item: null } };
                } else if (sel.slot in next.slots) {
                  next.slots = { ...next.slots, [sel.slot]: null };
                }
              }
              return next;
            });
            const lostName = sel.it?.name || 'an Artifact';
            const outcome = `You lost: ${lostName}`;
            log.push(outcome);
            await showResult(ctx, 'CULT WORSHIPPERS — Result', [checkLine, '', outcome]);
            toast?.(`Cult Worshippers — ${heroName} lost ${lostName}.`);
          }
        }
      }
      patchStayMods({ churchClosed: true });
      log.push('The Church is closed until after the next Adventure.');
      toast?.('The Church is closed until after the next Adventure.');
      return { log };
    }

    // 3: Possession — D6 Horror Hits; any Sanity lost is permanent. Church closes.
    case 3: {
      const hero = getHero?.(activeId);
      const heroName = hero?.name || 'Hero';

      const horrorHits = await ctxD6(ctx, 'Possession — Roll 1d6 for Horror Hits');
      const hitsLine = `Rolled [${horrorHits}] for Horror Hits.`;
      log.push(hitsLine);

      let sanityLost = 0;
      updateHero?.(activeId, (h) => {
        const curSanity = Number(h.currentSanity ?? h.sanity ?? 0);
        const prevMax = Number(h.maxSanity ?? h.SanityMax ?? 0);
        sanityLost = Math.min(horrorHits, curSanity);
        const nextCur = Math.max(0, curSanity - horrorHits);
        const newMax = Math.max(0, prevMax - sanityLost);
        const next = { ...h, currentSanity: nextCur, maxSanity: newMax };
        const note = makeMaxChangeNote({
          stat: 'Max Sanity',
          delta: newMax - prevMax,
          newMax,
          source: 'Church Event 3',
          reason: `Possession; took ${horrorHits} Horror Hits, lost ${sanityLost} Sanity permanently`,
        });
        return pushConditionNote(next, note);
      });

      const outcome = `${heroName} took ${horrorHits} Horror Hits.\nSanity lost: ${sanityLost}\nMax Sanity permanently reduced by ${sanityLost}.`;
      log.push(outcome);
      await showResult(ctx, 'POSSESSION — Result', [
        '"A Preacher collapses as a demonic force overwhelms him. Rising once more, he stares into your soul."',
        '', hitsLine, '', outcome,
      ]);
      toast?.(`Possession — ${heroName} took ${horrorHits} Horror Hits, lost ${sanityLost} Sanity permanently.`);
      patchStayMods({ churchClosed: true });
      log.push('The Church is closed until after the next Adventure.');
      toast?.('The Church is closed until after the next Adventure.');
      return { log };
    }

    // 4–5: Dark Stone Altar — all Rituals cost +1 Dark Stone (whole Stay).
    case 4:
    case 5: {
      patchStayMods({ churchRitualExtraDarkStone: 1 });
      const outcome = 'Dark Stone Altar — all Church Rituals cost +1 Dark Stone this Town Stay.';
      log.push(outcome);
      await showResult(ctx, 'DARK STONE ALTAR', [info.effect]);
      toast?.(outcome);
      try { window.dispatchEvent(new CustomEvent('rituals:costOverride', { detail: { extraDarkStone: 1, scope: 'church' } })); } catch {}
      return { log };
    }

    // 6–8: No event
    case 6:
    case 7:
    case 8: {
      log.push('Faith to the Forsaken — No event.');
      await showResult(ctx, 'FAITH TO THE FORSAKEN', ['No event.']);
      toast?.('Faith to the Forsaken — No event.');
      return { log };
    }

    // 9–10: Gift of Blessing — choose any Blessed Aura for free (no test).
    case 9:
    case 10: {
      const catalog = Array.isArray(churchBlessedAuras) ? churchBlessedAuras : [];
      if (!catalog.length) {
        log.push('A Gift of Blessing — no auras are available.');
        toast?.('A Gift of Blessing — no auras are available.');
        return { log };
      }

      const options = catalog.map((a) => {
        const name = a.name.replace(/\s*\(.*\)$/, '');
        return { label: `${name} — ${a.effect}` };
      });

      const pickIdx = await ctx.promptChoice?.(
        `A GIFT OF BLESSING\n\n"Recognized as a champion of light, the Preacher bestows a blessing."\n\nChoose any Blessed Aura to gain for free (no test required):`,
        options
      );

      const sel = catalog[pickIdx ?? 0];
      if (!sel) return { log };

      const auraName = sel.name.replace(/\s*\(.*\)$/, '');
      const auraItem = {
        id: sel.id,
        name: auraName,
        type: 'Aura',
        slot: 'Blessed Aura',
        tags: Array.isArray(sel.tags) ? [...sel.tags] : ['Blessed Aura'],
        description: sel.effect || '',
        mods: sel.mods ? { ...sel.mods } : {},
        rules: sel.rules ? { ...sel.rules } : {},
        oneUse: true,
        scope: 'nextAdventure',
      };

      updateHero?.(activeId, (h) => {
        const inv = Array.isArray(h.inventory) ? [...h.inventory] : [];
        inv.push(auraItem);
        const gear = { ...(h.gear || {}) };
        gear['Blessed Aura'] = auraItem;
        const buffs = Array.isArray(h.oncePerAdventure) ? [...h.oncePerAdventure] : [];
        buffs.push({
          id: `${sel.id}_${Date.now()}`,
          name: auraName,
          used: false,
          notes: sel.effect || 'Blessed Aura (free from Church event)',
        });
        return { ...h, inventory: inv, gear, oncePerAdventure: buffs };
      });

      const outcome = `${auraName} equipped to Blessed Aura slot and added to Buffs.`;
      log.push(outcome);
      await showResult(ctx, 'A GIFT OF BLESSING — Result', [outcome]);
      toast?.(`A Gift of Blessing — ${auraName} equipped to Blessed Aura slot and added to Buffs.`);
      dispatchUI('inventory:received', { heroId: activeId, item: auraItem });
      return { log };
    }

    // 11: Protective Shield — add to Buffs tab (oncePerAdventure).
    case 11: {
      const hereIds = _getHeroesAtShop?.(shopId) || (activeId ? [activeId] : []);
      for (const hid of hereIds) {
        const buffId = `protective_shield_${Date.now()}_${hid}`;
        updateHero?.(hid, (h) => {
          const buffs = Array.isArray(h.oncePerAdventure) ? [...h.oncePerAdventure] : [];
          buffs.push({
            id: buffId,
            name: 'Protective Shield',
            used: false,
            notes: 'Next Adventure: cancel one Darkness or one Growing Dread card. (Church Event)',
          });
          return { ...h, oncePerAdventure: buffs };
        });
        const heroName = getHero?.(hid)?.name || 'A hero';
        log.push(`Protective Shield — ${heroName} gains a buff.`);
        toast?.(`Protective Shield — ${heroName} gains a buff (check Buffs tab on Gear).`);
      }
      await showResult(ctx, 'PROTECTIVE SHIELD', [
        'Next Adventure: cancel one Darkness or one Growing Dread card.',
        '', 'Buff added to all heroes at the Church.',
      ]);
      return { log };
    }

    // 12: Divine Fortitude — Gain D3 Sanity (permanent).
    case 12: {
      const heroName = getHero?.(activeId)?.name || 'Hero';

      const gain = await ctxD3(ctx, 'Divine Fortitude — Roll D3 for Sanity gain');
      const gainLine = `Rolled [${gain}] for Sanity gain (D3).`;
      log.push(gainLine);

      updateHero?.(activeId, (h) => {
        const max = Number(h.maxSanity ?? h.SanityMax ?? 0);
        const cur = Number(h.currentSanity ?? h.sanity ?? 0);
        const newMax = max + gain;
        const newCur = Math.min(newMax, cur + gain);
        const next = { ...h, maxSanity: newMax, currentSanity: newCur };
        const note = makeMaxChangeNote({
          stat: 'Max Sanity',
          delta: gain,
          newMax,
          source: 'Church Event 12',
          reason: 'Divine Fortitude',
        });
        return pushConditionNote(next, note);
      });

      const outcome = `${heroName} gains +${gain} Max Sanity (and heals ${gain}).`;
      log.push(outcome);
      await showResult(ctx, 'DIVINE FORTITUDE — Result', [
        '"Your soul is fortified through divine reflection."',
        '', gainLine, '', outcome,
      ]);
      toast?.(`Divine Fortitude — ${heroName} gains +${gain} Max Sanity.`);
      return { log };
    }

    default:
      toast?.('Church: No matching event branch.');
      return { log };
  }
}

export async function handleChurchEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? roll2d6();
  const result = await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: result?.log || [`Church Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

export const churchHandler = { display, apply };
