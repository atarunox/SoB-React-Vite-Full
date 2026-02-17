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
  return hasTag || t === 'artifact';
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
        const ok = await doTest(activeId, { stat: 'Strength', target: 6 });
        if (ok) {
          const card = drawMineArtifact();
          if (card) {
            updateHero(activeId, (h) => {
              const inv = Array.isArray(h.inventory) ? [...h.inventory] : [];
              inv.push(card);
              return { ...h, inventory: inv };
            });
            const stats = summarizeItem(card);
            toast?.(`Cult Worshippers — success! You seize ${card.name}. ${stats}`);
            dispatchUI('inventory:received', { heroId: activeId, item: card });
          } else {
            toast?.('Cult Worshippers — success! (No artifact deck available.)');
          }
        } else {
          // Choose an Artifact to discard; prompt if available, else random.
          const hero = ctx.getHero?.(activeId);
          const arts = collectArtifactsFromHero(hero);
          if (!arts.length) {
            toast?.('Cult Worshippers — failed, but you have no Artifacts to lose.');
          } else {
            const opts = arts.map((a) => a.label);
            const pick = await promptChoice(ctx, 'Choose an Artifact to discard', opts);
            const sel = arts[Math.max(0, Math.min(arts.length - 1, (pick | 0)))];
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
              toast?.(`Cult Worshippers — failed. You discard ${sel.it.name || 'an Artifact'}.`);
            }
          }
        }
      }
      patchStayMods({ churchClosed: true });
      toast?.('The Church is closed until after the next Adventure.');
      return;
    }

    // 3: Possession — prompt a number for Horror Hits; then reduce Max Sanity by that amount (and apply note).
    case 3: {
      if (!activeId) return;
      const rolled = await promptNumber(
        ctx,
        'Possession — enter Horror Hits taken (D6)',
        { min: 0, max: 6, def: d6() }
      );
      updateHero(activeId, (h) => {
        const cur = Number(h.sanity ?? h.currentSanity ?? 0);
        const nextCur = Math.max(0, cur - rolled);
        const prevMax = Number(h.maxSanity ?? h.SanityMax ?? 0);
        const newMax = Math.max(0, prevMax - rolled);
        const next = { ...h, sanity: nextCur, maxSanity: newMax };
        const note = makeMaxChangeNote({
          stat: 'Max Sanity',
          delta: newMax - prevMax,
          newMax,
          source: 'Church Event 3',
          reason: `Possession; took ${rolled} Horror`,
        });
        return pushConditionNote(next, note);
      });
      toast?.(`Possession — you take ${rolled} Horror Hits and lose ${rolled} Max Sanity.`);
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

    // 9–10: Gift of Blessing — PROMPT to choose any Blessed Aura now; add directly to inventory (NO TEST).
case 9:
case 10: {
  if (!activeId) return;
  const catalog = Array.isArray(churchBlessedAuras) ? churchBlessedAuras : [];
  if (!catalog.length) {
    toast?.('A Gift of Blessing — no auras are available.');
    return;
  }

  // Choices: "Aura Name — <effect>"
  const options = catalog.map(a => `${a.name.replace(/\s*\(.*\)$/, '')} — ${a.effect}`);
  const pick = await (async () => {
    const fn = ctx?.promptChoice || ctx?.uiApi?.promptChoice;
    if (typeof fn === 'function') return await Promise.resolve(fn('A Gift of Blessing — choose an Aura (free)', options));
    // fallback prompt
    // eslint-disable-next-line no-alert
    const raw = window.prompt?.(
      `A Gift of Blessing — choose an Aura (free)\n\n${options.map((o, i) => `${i}: ${o}`).join('\n')}\n\nEnter number:`,
      '0'
    );
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  })();

  const sel = catalog[Math.max(0, Math.min(catalog.length - 1, (pick | 0)))];
  if (!sel) return;

  // NOTE: No Spirit test on the free one.

  // Grant selected Aura as a one-use item for next Adventure
  const auraItem = {
    id: sel.id,
    name: sel.name.replace(/\s*\(.*\)$/, ''), // drop "(Spirit 4+...)" from display
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

    // 12: Divine Fortitude — prompt a number (D3) to add to Max Sanity and heal that much.
    case 12: {
      if (!activeId) return;
      const def = Math.ceil(d6() / 2); // default D3
      const gain = await promptNumber(
        ctx,
        'Divine Fortitude — enter permanent Sanity gain (D3)',
        { min: 1, max: 3, def }
      );
      updateHero(activeId, (h) => {
        const max = Number(h.maxSanity ?? h.SanityMax ?? 0);
        const cur = Number(h.sanity ?? h.currentSanity ?? 0);
        const newMax = max + gain;
        const newCur = Math.min(newMax, cur + gain);
        const next = { ...h, maxSanity: newMax, sanity: newCur };
        const note = makeMaxChangeNote({
          stat: 'Max Sanity',
          delta: gain,
          newMax,
          source: 'Church Event 12',
          reason: 'Divine Fortitude',
        });
        return pushConditionNote(next, note);
      });
      toast?.(`Divine Fortitude — you gain +${gain} Max Sanity (and heal ${gain}).`);
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
