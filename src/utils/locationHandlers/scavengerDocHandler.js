// src/utils/locationHandlers/scavengerDocHandler.js
import { loadTownState, saveTownState } from '../../utils/townState';
import { d6 as _d6 } from '../../utils/diceHelpers';
import { mineArtifacts } from '../../data/items/mineArtifacts';

// Use ctx.d6 when available (respects manual roll mode); fallback to auto-roll
const ctxD6 = async (ctx, label) => (typeof ctx?.d6 === 'function') ? ctx.d6(label) : _d6();

const shopId = 'scavengerDoc';

// ---------- townState helpers ----------
function getShopFlags() {
  const s = loadTownState() || {};
  return s[shopId] || {};
}
function patchShopFlags(patch) {
  const s = loadTownState() || {};
  saveTownState({ ...s, [shopId]: { ...getShopFlags(), ...patch } });
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

// ---------- helper: draw a Mine Artifact card ----------
function drawMineArtifact() {
  const pool = Array.isArray(mineArtifacts) ? mineArtifacts : [];
  if (!pool.length) return null;

  const i = Math.floor(Math.random() * pool.length);
  const raw = pool[i] || {};

  const safeId =
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

  const effects = Array.isArray(raw.effects)
    ? raw.effects
    : raw.effect
    ? [String(raw.effect)]
    : [];

  return {
    ...raw,
    id: safeId,
    type: raw.type || 'Artifact',
    tags: Array.isArray(raw.tags) ? raw.tags : ['Artifact'],
    upgradeSlots: Number.isFinite(raw.upgradeSlots) ? raw.upgradeSlots : 0,
    weight: Number.isFinite(raw.weight) ? raw.weight : 1,
    cost,
    effects,
    source: 'Mine Artifacts Deck',
  };
}

// ---------- helper: get all heroes in town ----------
function getAllTownHeroes(ctx) {
  const heroes = ctx.listAllTownHeroes?.() || ctx.getAllHeroes?.() || [];
  return heroes.filter(Boolean);
}

// ---------- display (title / lore / effect) ----------
export function display(roll) {
  switch (roll) {
    case 2:
      return {
        title: 'Vile Experiments',
        lore: "Entering the Doc's hut, you find him hunched over a surgery table, working on unnatural experiments! Seeing that you've discovered him, he hits a button on a console and the door to the hut slams shut! Turning to face you, he picks up a vicious looking saw and attacks!",
        effect: 'Make a Strength 6+ test to overpower the mad Doc and avoid becoming the subject of his next vile experiment! If passed, gain 25 XP. If failed, roll once on the Injury Table. Either way, the Scavenger Doc is closed and may not be visited for the remainder of the Town Stay.',
      };
    case 3:
      return {
        title: 'No Understanding of Human Anatomy',
        lore: "The Scavenger Doc takes one look at you and scratches his alien head. Poking you in the belly and then in the thigh, it becomes clear that he has no idea where to even begin with your anatomy.",
        effect: 'Heroes may NOT purchase any Surgery at the Scavenger Doc during this Town Stay.',
      };
    case 4:
      return {
        title: 'Alien Virus',
        lore: "An alien virus has been spreading through the camp like wildfire. Bodies of the sick and the dead litter the streets, and the Doc's shack is overflowing.",
        effect: 'Every Hero in Town must immediately make a Luck 5+ test to avoid getting sick. If failed, during the next Adventure you are -3 Health and -1 Max Grit.',
      };
    case 5:
      return {
        title: 'Rusty Tools and Hungry Leeches',
        lore: "Dried gore is baked onto the floor here, and the Doc's assortment of tools and specimens seem filthy.",
        effect: 'Any Surgery performed here today is -1 to the roll, and Xanthar Leech Treatments do Wounds on rolls of 1 or 2.',
      };
    case 6:
    case 7:
    case 8:
      return {
        title: 'Screams of Pain and Suffering',
        lore: '"I\'m sure they\'ll be fine in the morning...Next!"',
        effect: 'No Event.',
      };
    case 9:
      return {
        title: 'An Actual Doctor',
        lore: "It's a miracle! The Scavenger Doc actually has some amount of medical training.",
        effect: 'Any Surgery performed here today is +1 to the roll.',
      };
    case 10:
      return {
        title: 'Dying Patient',
        lore: 'A dying alien patient lays on an old bed in a dark corner of the room. Motioning you over, he hacks and coughs telling you that he has failed in his mission. With his dying breath, he hands you something and says, "I can do no more. Take this... When the time is right, you\'ll know what to do..." And with that, he dies.',
        effect: 'Draw a Mine Artifact card that he gives you as he dies.',
      };
    case 11:
      return {
        title: 'Alien Technology',
        lore: 'The Scavenger Doc has an alien device that mends bones and regenerates flesh.',
        effect: 'You may choose any one Injury or Mutation you have to immediately Heal for free.',
      };
    case 12:
      return {
        title: 'Research Library',
        lore: 'The Scavenger Doc has an extensive library of ragged books, pads, and fungus samples.',
        effect: 'You may immediately gain 1 Fungus Research or Alien Research marker, as though you had engaged in Scientific Research here.',
      };
    default:
      return { title: 'Scavenger Doc', lore: '', effect: 'No Event.' };
  }
}

// ---------- mechanics (Resolve) ----------
export async function apply(roll, ctx) {
  const id = ctx.getActiveHeroId?.();
  if (!id) return { log: [] };

  const info = display(roll);
  const log = [];

  log.push(`[Scavenger Doc] (${roll}) ${info.title} — ${info.lore}`);
  log.push(`Effect: ${info.effect}`);

  // 2: Vile Experiments — Strength 6+ or Injury Table; Doc closed either way
  if (roll === 2) {
    const lore2 = `VILE EXPERIMENTS\n${info.lore}\nYou must overpower the mad Doc!`;
    const result = await ctx.doSkillCheck(id, {
      stat: 'Strength', target: 6, returnDetails: true,
      message: `${lore2}\nMake a Strength 6+ test to fight off the Scavenger Doc.`,
    });
    const checkLine = formatCheckResult(result, 'Strength', 6);
    if (checkLine) log.push(checkLine);
    const passed = result?.passed ?? result;

    // Close the Scavenger Doc for the rest of the Town Stay regardless
    patchShopFlags({ closed: true });

    if (passed) {
      ctx.updateHero?.(id, (h) => ({ ...h, xp: (h.xp || 0) + 25 }));
      const outcome = 'You overpower the mad Doc and escape his vile laboratory! Gain 25 XP. The Scavenger Doc is closed for the remainder of the Town Stay.';
      log.push(outcome);
      await showResult(ctx, 'VILE EXPERIMENTS — Result', [checkLine, '', outcome]);
      ctx.toast?.('Vile Experiments: +25 XP. Scavenger Doc closed.');
    } else {
      const outcome = 'The mad Doc overpowers you and straps you to his table! Roll once on the Injury Table. The Scavenger Doc is closed for the remainder of the Town Stay.';
      log.push(outcome);
      await showResult(ctx, 'VILE EXPERIMENTS — Result', [checkLine, '', outcome]);
      ctx.toast?.('Vile Experiments: Roll on the Injury Table. Scavenger Doc closed.');
      await ctx.enqueueChartRoll?.(id, 'injury');
    }
    return { log };
  }

  // 3: No Understanding of Human Anatomy — Surgery disabled this Town Stay
  if (roll === 3) {
    patchShopFlags({ surgeryDisabled: true });
    const outcome = 'The Scavenger Doc has no understanding of human anatomy. Heroes may NOT purchase any Surgery at the Scavenger Doc during this Town Stay.';
    log.push(outcome);
    await showResult(ctx, 'NO UNDERSTANDING OF HUMAN ANATOMY — Result', [outcome]);
    ctx.toast?.('No Surgery available at Scavenger Doc this Town Stay.');
    return { log };
  }

  // 4: Alien Virus — Every Hero in Town: Luck 5+ or -3 Health / -1 Max Grit next Adventure
  if (roll === 4) {
    const allHeroes = getAllTownHeroes(ctx);
    if (!allHeroes.length) {
      // Fallback: just test the active hero
      const hero = (ctx.getHeroById ?? ctx.getHero)?.(id);
      if (hero) allHeroes.push(hero);
    }

    for (const hero of allHeroes) {
      const hid = hero.id || hero.localId;
      if (!hid) continue;

      const lore4 = `ALIEN VIRUS\n${info.lore}\n${hero.name || 'Hero'} must make a Luck 5+ test to avoid getting sick!`;
      const result = await ctx.doSkillCheck(hid, {
        stat: 'Luck', target: 5, returnDetails: true,
        message: lore4,
      });
      const checkLine = formatCheckResult(result, 'Luck', 5);
      if (checkLine) log.push(`${hero.name || 'Hero'}: ${checkLine}`);
      const passed = result?.passed ?? result;

      if (passed) {
        const outcome = `${hero.name || 'Hero'} avoids the alien virus!`;
        log.push(outcome);
        await showResult(ctx, `ALIEN VIRUS — ${hero.name || 'Hero'}`, [checkLine, '', outcome]);
      } else {
        ctx.updateHero?.(hid, (h) => ({
          ...h,
          adventureDebuffs: {
            ...(h.adventureDebuffs || {}),
            alienVirusHealthPenalty: -3,
            alienVirusGritPenalty: -1,
          },
        }));
        const outcome = `${hero.name || 'Hero'} catches the alien virus! During the next Adventure: -3 Health and -1 Max Grit.`;
        log.push(outcome);
        await showResult(ctx, `ALIEN VIRUS — ${hero.name || 'Hero'}`, [checkLine, '', outcome]);
        ctx.toast?.(`${hero.name || 'Hero'}: Alien Virus! Next Adventure -3 Health, -1 Max Grit.`);
      }
    }
    return { log };
  }

  // 5: Rusty Tools and Hungry Leeches — Surgery -1 and Leeches wound on 1-2
  if (roll === 5) {
    patchShopFlags({ surgeryMod: -1, leechWoundThreshold: 2 });
    const outcome = 'The filthy conditions affect all services today. Surgery rolls are -1, and Xanthar Leech Treatments do Wounds on rolls of 1 or 2 (instead of just 1).';
    log.push(outcome);
    await showResult(ctx, 'RUSTY TOOLS AND HUNGRY LEECHES — Result', [outcome]);
    ctx.toast?.('Rusty Tools: Surgery -1 today. Leeches wound on 1-2.');
    return { log };
  }

  // 6-8: Screams of Pain and Suffering — No Event
  if (roll >= 6 && roll <= 8) {
    const outcome = '"I\'m sure they\'ll be fine in the morning...Next!" No Event.';
    log.push(outcome);
    await showResult(ctx, 'SCREAMS OF PAIN AND SUFFERING — Result', [outcome]);
    return { log };
  }

  // 9: An Actual Doctor — Surgery +1
  if (roll === 9) {
    patchShopFlags({ surgeryMod: 1 });
    const outcome = "It's a miracle! The Scavenger Doc actually has some medical training. Any Surgery performed here today is +1 to the roll.";
    log.push(outcome);
    await showResult(ctx, 'AN ACTUAL DOCTOR — Result', [outcome]);
    ctx.toast?.('An Actual Doctor: Surgery +1 today!');
    return { log };
  }

  // 10: Dying Patient — Draw a Mine Artifact
  if (roll === 10) {
    const artifact = drawMineArtifact();
    if (artifact) {
      ctx.updateHero?.(id, (h) => {
        const inv = Array.isArray(h.inventory) ? [...h.inventory] : [];
        inv.push({ ...artifact, id: `${artifact.id}_${Date.now()}` });
        return { ...h, inventory: inv };
      });
      const outcome = `The dying patient hands you a ${artifact.name || 'Mine Artifact'} with his last breath. It has been added to your inventory.`;
      log.push(outcome);
      await showResult(ctx, 'DYING PATIENT — Result', [outcome]);
      ctx.toast?.(`Dying Patient: received ${artifact.name || 'Mine Artifact'}.`);
    } else {
      const outcome = 'The dying patient hands you something, but the Mine Artifacts deck is empty. No item gained.';
      log.push(outcome);
      await showResult(ctx, 'DYING PATIENT — Result', [outcome]);
      ctx.toast?.('Dying Patient: Mine Artifacts deck is empty.');
    }
    return { log };
  }

  // 11: Alien Technology — Free heal of one Injury or Mutation
  if (roll === 11) {
    const hero = (ctx.getHeroById ?? ctx.getHero)?.(id);
    // Collect injuries and mutations from hero conditions
    const conditions = hero?.conditions || {};
    const injuries = Array.isArray(conditions.injury) ? conditions.injury : (Array.isArray(hero?.injuries) ? hero.injuries : []);
    const mutations = Array.isArray(conditions.mutation) ? conditions.mutation : (Array.isArray(hero?.mutations) ? hero.mutations : []);

    const options = [];
    injuries.forEach((c, i) => {
      if (c && c.active !== false && c.removed !== true) {
        options.push({ label: `Injury: ${c.name || 'Unknown'}`, value: { type: 'injury', idx: i } });
      }
    });
    mutations.forEach((c, i) => {
      if (c && c.active !== false && c.removed !== true) {
        options.push({ label: `Mutation: ${c.name || 'Unknown'}`, value: { type: 'mutation', idx: i } });
      }
    });

    if (!options.length) {
      const outcome = 'The alien device hums to life, but you have no Injuries or Mutations to heal.';
      log.push(outcome);
      await showResult(ctx, 'ALIEN TECHNOLOGY — Result', [outcome]);
      ctx.toast?.('Alien Technology: No conditions to heal.');
      return { log };
    }

    options.push({ label: 'Decline (do not heal anything)', value: null });

    const choice = await ctx.promptChoice?.(
      `ALIEN TECHNOLOGY\n${info.lore}\n\nChoose one Injury or Mutation to Heal for free:`,
      options
    );

    const picked = typeof choice === 'number' ? options[choice]?.value : choice?.value ?? choice;

    if (picked && picked.type) {
      ctx.updateHero?.(id, (h) => {
        const conds = { ...(h.conditions || {}) };
        const bucketKey = picked.type;
        const arr = Array.isArray(conds[bucketKey]) ? [...conds[bucketKey]] : [];
        if (picked.idx >= 0 && picked.idx < arr.length) {
          arr.splice(picked.idx, 1);
        }
        conds[bucketKey] = arr;
        return { ...h, conditions: conds };
      });
      const removedName = (picked.type === 'injury' ? injuries : mutations)[picked.idx]?.name || 'condition';
      const outcome = `The alien device whirs and glows as it heals your ${removedName}! Condition removed for free.`;
      log.push(outcome);
      await showResult(ctx, 'ALIEN TECHNOLOGY — Result', [outcome]);
      ctx.toast?.(`Alien Technology: Healed ${removedName} for free!`);
    } else {
      const outcome = 'You decline the alien treatment.';
      log.push(outcome);
      await showResult(ctx, 'ALIEN TECHNOLOGY — Result', [outcome]);
    }
    return { log };
  }

  // 12: Research Library — Gain 1 Fungus Research or Alien Research marker
  if (roll === 12) {
    const choice = await ctx.promptChoice?.(
      `RESEARCH LIBRARY\n${info.lore}\n\nChoose which research marker to gain:`,
      [
        { label: 'Fungus Research marker' },
        { label: 'Alien Research marker' },
      ]
    );

    const isFungus = choice === 0 || choice === undefined;
    const markerType = isFungus ? 'fungusResearch' : 'alienResearch';
    const markerName = isFungus ? 'Fungus Research' : 'Alien Research';

    ctx.updateHero?.(id, (h) => ({
      ...h,
      [markerType]: (h[markerType] || 0) + 1,
    }));

    const outcome = `The Scavenger Doc's library yields fascinating results. You gain 1 ${markerName} marker.`;
    log.push(outcome);
    await showResult(ctx, 'RESEARCH LIBRARY — Result', [outcome]);
    ctx.toast?.(`Research Library: +1 ${markerName} marker.`);
    return { log };
  }

  return { log };
}

// --------- Dispatcher compatible with locationEventsEngine ---------------
export async function handleScavengerDocEvent(ctx = {}) {
  const roll = ctx.forcedRoll ?? (_d6() + _d6());
  const result = await apply(roll, ctx);
  return {
    actions: [],
    townState: ctx.townState,
    log: result?.log || [`Scavenger Doc Event Roll: ${roll}`],
    eventRoll: roll,
    eventIndex: Math.max(0, roll - 2),
  };
}

export const scavengerDocHandler = { display, apply };
export default scavengerDocHandler;
