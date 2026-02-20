// src/utils/locationHandlers/churchHandler.js
import { loadTownState, saveTownState } from '../../utils/townState';
import { makeMaxChangeNote, pushConditionNote } from '../../utils/conditionNotes';
import { getEventDisplay } from '../locationEventText';
import churchData from '../../data/townLocations/FrontierTown/Church/church.js';
import { mineArtifacts } from '../../data/items/mineArtifacts';
import churchBlessedAuras from '../../data/townLocations/FrontierTown/Church/churchBlessedAuras.js';

import { d6, roll2d6 } from '../../utils/diceHelpers';
const shopId = churchData?.id || 'church';

// ----------------------------- UI helpers ---------------------------------

// Prefer a provided number-prompt; fall back to window.prompt
async function promptNumber(ctx, message, { min = -Infinity, max = Infinity, def = 0 } = {}) {
  const fn = ctx?.promptNumber || ctx?.uiApi?.promptNumber;
  if (typeof fn === 'function') {
    const val = await Promise.resolve(fn(message, { min, max, defaultValue: def }));
    const n = Number(val);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : def;
  }
  // Basic fallback
  // eslint-disable-next-line no-alert
  const raw = window.prompt?.(`${message} (${min}–${max})`, String(def));
  const n = Number(raw);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : def;
}

// Prefer a provided choice-prompt; fall back to window.prompt (index)
async function promptChoice(ctx, message, options = []) {
  const fn = ctx?.promptChoice || ctx?.uiApi?.promptChoice;
  if (typeof fn === 'function') {
    return await Promise.resolve(fn(message, options));
  }
  // eslint-disable-next-line no-alert
  const raw = window.prompt?.(
    `${message}\n\n${options.map((o, i) => `${i}: ${o}`).join('\n')}\n\nEnter number:`,
    '0'
  );
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

// Light “bus” notifier for UI panels that want to react to state changes.
function dispatchUI(name, detail) {
  try { window.dispatchEvent(new CustomEvent(name, { detail })); } catch {}
}

// ----------------------------- small helpers ------------------------------

function summarizeItem(it = {}) {
  const parts = [];
  const type = it.type || 'Item';
  const w = Number.isFinite(it.weight) ? it.weight : undefined;
  const up = Number.isFinite(it.upgradeSlots) ? it.upgradeSlots : undefined;
  const value =
    typeof it.cost === 'object' && Number.isFinite(it.cost.gold) ? it.cost.gold : undefined;
  const fx = Array.isArray(it.effects) ? it.effects : [];
  parts.push(`Type: ${type}`);
  if (w !== undefined) parts.push(`Wt ${w}`);
  if (up !== undefined) parts.push(`Upg ${up}`);
  if (value !== undefined) parts.push(`$${value}`);
  if (fx.length) parts.push(`Effects: ${fx.join('; ')}`);
  return parts.join(' | ');
}

function patchStayMods(patch) {
  const s = loadTownState();
  const next = { ...(s.stayMods || {}), ...patch };
  const updated = { ...s, stayMods: next };
  saveTownState(updated);
  dispatchUI('townstate:changed', updated);
}

function display(roll) {
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
  // Match type "Artifact", "Artifact - Scroll - Magik", etc. but NOT "Gear"
  return hasTag || t === 'artifact' || t.startsWith('artifact ');
}

function collectArtifactsFromHero(hero) {
  const results = [];

  // inventory
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

  // equipped shapes
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
  const updateHero = (id, patchOrFn) => ctx.updateHero?.(id, patchOrFn);
  const toast = (m) => ctx.toast?.(m);
  const doTest = (id, spec) => ctx.doSkillCheck?.(id, spec);

  switch (roll) {
    // 2: Cult Worshippers — STR 6+; pass: draw Mine Artifact. Fail: choose an Artifact to discard. Church closes.
    case 2: {
      if (activeId) {
        const hero = ctx.getHero?.(activeId);
        const heroName = hero?.name || 'Hero';

        // Prompt for the Strength roll
        const strRaw = window.prompt(
          `Cult Worshippers\n\n` +
          `"The Order here is not the Sacred Order, but the Order of the ` +
          `Crimson Hand! You struggle with the Inquisitor as he tries to ` +
          `use an artifact on you."\n\n` +
          `Make a Strength 6+ test.\n` +
          `  Pass: Draw a Mine Artifact\n` +
          `  Fail: Lose one Artifact\n\n` +
          `Enter your Strength roll result (1-6), or leave blank to auto-roll:`,
          ''
        );
        let strRoll;
        if (strRaw == null || strRaw.trim() === '') {
          strRoll = d6();
        } else {
          const n = Number(strRaw);
          strRoll = (Number.isFinite(n) && n >= 1 && n <= 6) ? n : d6();
        }
        const passed = strRoll >= 6;

        if (passed) {
          const card = drawMineArtifact();
          if (card) {
            updateHero(activeId, (h) => {
              const inv = Array.isArray(h.inventory) ? [...h.inventory] : [];
              inv.push(card);
              return { ...h, inventory: inv };
            });
            // Build full stats summary for the drawn artifact
            const lines = [`You rolled ${strRoll} — Pass!`, '', `You seize a Mine Artifact:`, `  ${card.name}`];
            if (card.type) lines.push(`  Type: ${card.type}`);
            if (card.slot && card.slot !== 'None') lines.push(`  Slot: ${card.slot}`);
            const val = typeof card.cost === 'object' && Number.isFinite(card.cost.gold) ? card.cost.gold : (Number.isFinite(card.value) ? card.value : null);
            if (val != null) lines.push(`  Value: $${val}`);
            if (Number.isFinite(card.weight)) lines.push(`  Weight: ${card.weight}`);
            if (Number.isFinite(card.upgradeSlots)) lines.push(`  Upgrade Slots: ${card.upgradeSlots}`);
            if (card.requires) lines.push(`  Requires: ${card.requires}`);
            const fx = Array.isArray(card.effects) ? card.effects : [];
            if (fx.length) {
              lines.push(`  Effects:`);
              fx.forEach((e) => lines.push(`    - ${e}`));
            }
            if (Array.isArray(card.tags) && card.tags.length) lines.push(`  Tags: ${card.tags.join(', ')}`);
            window.alert(lines.join('\n'));
            toast?.(`Cult Worshippers — ${heroName} passed (rolled ${strRoll}). Drew ${card.name}.`);
            dispatchUI('inventory:received', { heroId: activeId, item: card });
          } else {
            window.alert(`You rolled ${strRoll} — Pass!\n\nNo artifact deck available.`);
            toast?.('Cult Worshippers — success! (No artifact deck available.)');
          }
        } else {
          // Failed — choose an Artifact (not Gear) to discard
          const arts = collectArtifactsFromHero(hero);
          if (!arts.length) {
            window.alert(`You rolled ${strRoll} — Fail!\n\nBut you have no Artifacts to lose.`);
            toast?.('Cult Worshippers — failed, but you have no Artifacts to lose.');
          } else {
            const listing = arts.map((a, i) => {
              const it = a.it || {};
              const parts = [`${i + 1}. ${a.label}`];
              if (it.type) parts.push(`     Type: ${it.type}`);
              const val = typeof it.cost === 'object' && Number.isFinite(it.cost.gold) ? it.cost.gold : (Number.isFinite(it.value) ? it.value : null);
              if (val != null) parts.push(`     Value: $${val}`);
              const fx = Array.isArray(it.effects) ? it.effects : [];
              if (fx.length) parts.push(`     Effects: ${fx.join('; ')}`);
              return parts.join('\n');
            }).join('\n\n');

            const pickRaw = window.prompt(
              `You rolled ${strRoll} — Fail!\n\n` +
              `The Inquisitor steals one of your Artifacts.\n` +
              `Choose which Artifact to lose:\n\n` +
              listing + `\n\nEnter a number (1-${arts.length}):`,
              '1'
            );
            const pickIdx = pickRaw == null ? 0 : Math.max(0, Math.min(arts.length - 1, (Number(pickRaw) | 0) - 1));
            const sel = arts[pickIdx];
            if (sel) {
              updateHero(activeId, (h) => {
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
              window.alert(`You lost: ${sel.it?.name || 'an Artifact'}`);
              toast?.(`Cult Worshippers — ${heroName} failed (rolled ${strRoll}). Lost ${sel.it?.name || 'an Artifact'}.`);
            }
          }
        }
      }
      patchStayMods({ churchClosed: true });
      toast?.('The Church is closed until after the next Adventure.');
      return;
    }

    // 3: Possession — D6 Horror Hits; any Sanity lost is permanent (reduce Max Sanity). Church closes.
    case 3: {
      if (!activeId) return;
      const hero = ctx.getHero?.(activeId);
      const heroName = hero?.name || 'Hero';

      const raw = window.prompt(
        `Possession\n\n` +
        `"A Preacher collapses as a demonic force overwhelms him. ` +
        `Rising once more, he stares into your soul."\n\n` +
        `Take D6 Horror Hits. Any Sanity lost is permanent ` +
        `(your Max Sanity is reduced by the amount lost).\n\n` +
        `Enter your D6 Horror Hits roll (1-6), or leave blank to auto-roll:`,
        ''
      );
      let horrorHits;
      if (raw == null || raw.trim() === '') {
        horrorHits = d6();
      } else {
        const n = Number(raw);
        horrorHits = (Number.isFinite(n) && n >= 1 && n <= 6) ? n : d6();
      }

      let sanityLost = 0;
      updateHero(activeId, (h) => {
        const curSanity = Number(h.currentSanity ?? h.sanity ?? 0);
        const prevMax = Number(h.maxSanity ?? h.SanityMax ?? 0);
        // Sanity lost = however much current sanity actually drops (can't go below 0)
        sanityLost = Math.min(horrorHits, curSanity);
        const nextCur = Math.max(0, curSanity - horrorHits);
        // Max Sanity is permanently reduced by the amount of Sanity actually lost
        const newMax = Math.max(0, prevMax - sanityLost);
        const next = { ...h, sanity: nextCur, currentSanity: nextCur, maxSanity: newMax };
        const note = makeMaxChangeNote({
          stat: 'Max Sanity',
          delta: newMax - prevMax,
          newMax,
          source: 'Church Event 3',
          reason: `Possession; took ${horrorHits} Horror Hits, lost ${sanityLost} Sanity permanently`,
        });
        return pushConditionNote(next, note);
      });

      window.alert(
        `Possession — ${heroName} took ${horrorHits} Horror Hits.\n\n` +
        `Sanity lost: ${sanityLost}\n` +
        `Max Sanity permanently reduced by ${sanityLost}.`
      );
      toast?.(`Possession — ${heroName} took ${horrorHits} Horror Hits, lost ${sanityLost} Sanity permanently.`);
      patchStayMods({ churchClosed: true });
      toast?.('The Church is closed until after the next Adventure.');
      return;
    }

    // 4–5: Dark Stone Altar — all Rituals cost +1 Dark Stone (whole Stay).
    case 4:
case 5: {
  patchStayMods({ churchRitualExtraDarkStone: 1 });
  ctx.toast?.('Dark Stone Altar — all Church Rituals cost +1 Dark Stone this Town Stay.');
  // let the Rituals tab reactively show the surcharge
  try { window.dispatchEvent(new CustomEvent('rituals:costOverride', { detail: { extraDarkStone: 1, scope: 'church' } })); } catch {}
  return;
}

    // 6–8: No event
    case 6:
    case 7:
    case 8: {
      toast?.('Faith to the Forsaken — No event.');
      return;
    }

    // 9–10: Gift of Blessing — choose any Blessed Aura for free (no test).
    case 9:
    case 10: {
      if (!activeId) return;
      const catalog = Array.isArray(churchBlessedAuras) ? churchBlessedAuras : [];
      if (!catalog.length) {
        toast?.('A Gift of Blessing — no auras are available.');
        return;
      }

      const listing = catalog.map((a, i) => {
        const name = a.name.replace(/\s*\(.*\)$/, '');
        return `${i + 1}. ${name} — ${a.effect}`;
      }).join('\n');

      const pickRaw = window.prompt(
        `A Gift of Blessing\n\n` +
        `"Recognized as a champion of light, the Preacher bestows a blessing."\n\n` +
        `Choose any Blessed Aura to gain for free (no test required):\n\n` +
        listing + `\n\nEnter a number (1-${catalog.length}):`,
        '1'
      );

      const pickIdx = pickRaw == null
        ? 0
        : Math.max(0, Math.min(catalog.length - 1, (Number(pickRaw) | 0) - 1));
      const sel = catalog[pickIdx];
      if (!sel) return;

      const auraItem = {
        id: sel.id,
        name: sel.name.replace(/\s*\(.*\)$/, ''),
        type: 'Aura',
        tags: Array.isArray(sel.tags) ? sel.tags : ['Blessed Aura'],
        description: sel.effect,
        rules: sel.rules,
        oneUse: true,
        scope: 'nextAdventure',
      };

      updateHero(activeId, (h) => {
        const inv = Array.isArray(h.inventory) ? [...h.inventory] : [];
        inv.push(auraItem);
        return { ...h, inventory: inv };
      });

      toast?.(`A Gift of Blessing — ${auraItem.name} added to your inventory (free).`);
      dispatchUI('inventory:received', { heroId: activeId, item: auraItem });
      return;
    }


    // 11: Protective Shield — give explicit inventory notice per hero.
    case 11: {
      const hereIds = ctx.getHeroesAtShop?.(shopId) || (activeId ? [activeId] : []);
      for (const id of hereIds) {
        const item = {
          id: `protective_shield_${Date.now()}_${id}`,
          name: 'Protective Shield',
          type: 'One-Use',
          description: 'Next Adventure: cancel one Darkness or one Growing Dread card.',
          tags: ['Church', 'Consumable'],
          oneUse: true,
          scope: 'nextAdventure',
        };
        updateHero(id, (h) => {
          const inv = Array.isArray(h.inventory) ? [...h.inventory] : [];
          inv.push(item);
          return { ...h, inventory: inv };
        });
        const heroName = ctx.getHero?.(id)?.name || 'A hero';
        toast?.(`Protective Shield — ${heroName} received a temporary cancel item (check Inventory).`);
        dispatchUI('inventory:received', { heroId: id, item });
      }
      return;
    }

    // 12: Divine Fortitude — Gain D3 Sanity (permanent).
    case 12: {
      if (!activeId) return;
      const heroName = ctx.getHero?.(activeId)?.name || 'Hero';

      const raw = window.prompt(
        `Divine Fortitude\n\n` +
        `"Your soul is fortified through divine reflection."\n\n` +
        `Gain D3 Sanity (permanent Max Sanity increase).\n\n` +
        `Enter your D3 roll (1-3), or leave blank to auto-roll:`,
        ''
      );
      let gain;
      if (raw == null || raw.trim() === '') {
        gain = Math.ceil(d6() / 2); // D3
      } else {
        const n = Number(raw);
        gain = (Number.isFinite(n) && n >= 1 && n <= 3) ? n : Math.ceil(d6() / 2);
      }

      updateHero(activeId, (h) => {
        const max = Number(h.maxSanity ?? h.SanityMax ?? 0);
        const cur = Number(h.currentSanity ?? h.sanity ?? 0);
        const newMax = max + gain;
        const newCur = Math.min(newMax, cur + gain);
        const next = { ...h, maxSanity: newMax, sanity: newCur, currentSanity: newCur };
        const note = makeMaxChangeNote({
          stat: 'Max Sanity',
          delta: gain,
          newMax,
          source: 'Church Event 12',
          reason: 'Divine Fortitude',
        });
        return pushConditionNote(next, note);
      });
      window.alert(`Divine Fortitude — ${heroName} gains +${gain} Max Sanity (and heals ${gain}).`);
      toast?.(`Divine Fortitude — ${heroName} gains +${gain} Max Sanity (and heals ${gain}).`);
      return;
    }

    default:
      toast?.('Church: No matching event branch.');
  }
}

export async function handleChurchEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? roll2d6();
  await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: [`Church Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
    ui: display(roll),
  };
}

export const churchHandler = { display, apply };
