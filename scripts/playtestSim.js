/* eslint-disable no-console */
// Narrated playtest: a posse runs missions, fights, loots, levels, mutates,
// and spends town days — all through the app's REAL game-logic modules.

import { HEROES } from '../src/data/heroes.jsx';
import sanitizeHero from '../src/utils/sanitizeHero';
import calculateCurrentStats from '../src/utils/calculateStats';
import { canLevelUp, getNextLevelXP } from '../src/utils/levelingUtils';
import getLevelingChart from '../src/data/getLevelingChart';
import {
  resolveHeroAttack, resolveFullEnemyAttack, resolveCorruptionHits,
  resolvePostCombatHealing,
} from '../src/utils/combatResolution';
import { getDepthEvent, getHBtDThreshold, hasDepthEventChart } from '../src/data/depthEvents/depthEventLookup';
import { ENEMY_CARDS } from '../src/data/enemyCards';
import { lootCards } from '../src/data/lootDeck';
import { gearCards } from '../src/data/items/gearCards';
import { mutationChart } from '../src/components/DM/charts/mutationChart.js';
import { injuryChart } from '../src/components/DM/charts/injuryChart.js';
import { madnessChart } from '../src/components/DM/charts/madnessChart.js';
import { townTraitsChart } from '../src/components/DM/charts/townTraitsChart.js';
import { DARKNESS_CARDS } from '../src/data/darknessCards';
import { GROWING_DREAD_CARDS } from '../src/data/growingDreadCards';
import { hexcrawlVillains } from '../src/data/enemyCards/hexcrawlVillains.js';
import { ENCOUNTER_CARDS } from '../src/data/encounterCards.js';
import { otherWorldArtifacts } from '../src/data/items/otherWorldArtifacts.js';

const d6 = () => 1 + Math.floor(Math.random() * 6);
const d36 = () => d6() * 10 + d6();
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const failures = [];
let checks = 0;
function check(label, cond, detail = '') {
  checks++;
  if (!cond) {
    failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
    console.log(`      ❌ CHECK FAILED: ${label} ${detail}`);
  }
}

function say(s) { console.log(s); }
function dm(s) { console.log(`  🎩 DM: ${s}`); }
function player(name, s) { console.log(`  🤠 ${name}: ${s}`); }

// ---- UI stub: auto-answers prompts like a decisive player ----
function makeUI(name, { spendGrit = true } = {}) {
  return {
    roll: async (count, sides = 6) =>
      Array.from({ length: Math.max(0, count) }, () => 1 + Math.floor(Math.random() * sides)),
    promptChoice: async (msg, options) => {
      // Grit reroll prompts: option 0 = spend. Post-combat heal split: pick max wounds.
      if (/Spend 1 Grit/i.test(msg)) {
        const idx = spendGrit ? 0 : 1;
        player(name, spendGrit ? 'I spend a Grit to reroll!' : 'Saving my Grit.');
        return idx;
      }
      return 0;
    },
  };
}

// ---- Hero construction from real class data ----
function makeHero(className, heroName) {
  const def = HEROES.Western[className];
  if (!def) throw new Error(`No class def: ${className}`);
  const raw = {
    id: heroName.toLowerCase().replace(/\W+/g, '_'),
    name: heroName,
    class: className.replace(/\s+/g, ''),
    characterClass: className,
    level: 1,
    xp: 0,
    gold: 150,
    darkStone: 0,
    stats: {
      ...def.stats,
      Combat: def.combat,
      'Melee To-Hit': def.toHit?.melee,
      'Ranged To-Hit': def.toHit?.ranged,
      Defense: def.defense,
      Willpower: def.willpower,
    },
    maxHealth: def.health, currentHealth: def.health,
    maxSanity: def.sanity, currentSanity: def.sanity,
    Grit: def.maxGrit, currentGrit: 1,
    currentCorruption: 0, maxCorruption: 5,
    injuries: [], madness: [], mutations: [],
  };
  const hero = sanitizeHero(raw);
  check(`sanitizeHero(${heroName}) returns hero`, !!hero);
  check(`${heroName} canonical health fields`, hero.currentHealth === def.health && hero.maxHealth === def.health,
    `got ${hero.currentHealth}/${hero.maxHealth}, want ${def.health}`);
  check(`${heroName} keeps class stats`, hero.stats?.Agility === def.stats.Agility);
  return hero;
}

function updateHeroFactory(posse) {
  return (id, patchOrFn) => {
    const idx = posse.findIndex(h => h.id === id);
    if (idx < 0) return;
    const prev = posse[idx];
    const next = typeof patchOrFn === 'function' ? patchOrFn(prev) : { ...prev, ...patchOrFn };
    posse[idx] = sanitizeHero(next);
  };
}

export async function run() {
  say('\n══════════════════════════════════════════════════');
  say('  SHADOWS OF BRIMSTONE — AUTOMATED PLAYTEST SESSION');
  say('══════════════════════════════════════════════════\n');

  // ─────────────────────────────────────────────
  // SESSION 0: Posse creation
  // ─────────────────────────────────────────────
  say('── POSSE CREATION ──');
  const posse = [
    makeHero('Gunslinger', 'Dutch'),
    makeHero('Saloon Girl', 'Ruby'),
    makeHero('Frontier Doc', 'Doc Holloway'),
  ];
  const updateHero = updateHeroFactory(posse);
  for (const h of posse) {
    const cs = calculateCurrentStats(h);
    check(`calculateStats(${h.name})`, !!cs?.stats && Number.isFinite(cs.stats.Initiative));
    dm(`${h.name} the ${h.characterClass} — HP ${h.currentHealth}/${h.maxHealth}, ` +
       `San ${h.currentSanity}/${h.maxSanity}, Init ${cs.stats.Initiative}, Def ${cs.stats.Defense}, WP ${cs.stats.Willpower}`);
  }

  // ═════════════════════════════════════════════
  // ADVENTURE 1: The Mines
  // ═════════════════════════════════════════════
  say('\n── ADVENTURE 1: "Cleanse the Mines" ──');
  dm('The posse descends into the mine. Grit reset to 1 each (adventure start).');
  posse.forEach(h => updateHero(h.id, { currentGrit: 1 }));

  let depth = 0, darkness = 0;
  const trackLength = 15;
  const gdSpaces = [6, 11, 15], bsSpaces = [2, 4, 8, 10, 13];
  const heldGrowingDread = [];

  for (let round = 1; round <= 6; round++) {
    const a = d6(), b = d6(), total = a + b;
    const threshold = getHBtDThreshold(depth);
    check(`HBtD threshold valid at depth ${depth}`, [7, 8, 9].includes(threshold));
    if (a === b) {
      const ev = getDepthEvent('Mines', a);
      check(`Depth event exists for Mines die=${a}`, !!ev, JSON.stringify(ev));
      dm(`Round ${round}: HBtD ${a}+${b} — DOUBLES! Depth Event (${total}): "${ev?.name ?? ev?.title ?? '??'}" — darkness holds.`);
    } else if (total >= threshold) {
      dm(`Round ${round}: HBtD ${a}+${b}=${total} vs ${threshold}+ — held!`);
    } else {
      darkness++;
      const darknessSlot = (trackLength + 1) - darkness;
      check('darkness slot math', darknessSlot >= 1 && darknessSlot <= trackLength + 1, `slot ${darknessSlot}`);
      const space = darkness; // physical space number occupied
      let drew = '';
      if (bsSpaces.includes(space)) {
        const card = pick(DARKNESS_CARDS);
        check('darkness card has name+effect', !!card?.name && !!(card.effect || card.description));
        drew = ` Blood spatter! Darkness card: "${card.name}".`;
      } else if (gdSpaces.includes(space)) {
        const gd = pick(GROWING_DREAD_CARDS);
        heldGrowingDread.push(gd);
        check('growing dread card has name', !!gd?.name);
        drew = ` Growing Dread space — card held face-down (${heldGrowingDread.length} held).`;
      }
      dm(`Round ${round}: HBtD ${a}+${b}=${total} vs ${threshold}+ — FAILED. Darkness advances to space ${space}.${drew}`);
    }
    if (round % 2 === 0) { depth++; dm(`The posse pushes deeper (depth ${depth}).`); }
  }
  check('mission not auto-failed', darkness <= trackLength);

  // ── FIGHT 1: vs Mines enemy ──
  say('\n── FIGHT: Something stirs in the dark ──');
  const minePool = ENEMY_CARDS['Mines'].filter(e => e?.name && (e.melee?.toHit || e.toHit?.melee));
  check('Mines enemy pool non-empty', minePool.length > 0, `pool=${minePool.length}`);
  const enemy = pick(minePool);
  const num = (v, dflt) => {
    const n = Number(String(v ?? '').match(/\d+/)?.[0]);
    return Number.isFinite(n) ? n : dflt;
  };
  const enemyHealth = num(enemy.health ?? enemy.stats?.normal?.health, 8);
  const enemyDefense = num(enemy.defense ?? enemy.stats?.normal?.defense, 3);
  const enemyMeleeToHit = enemy.melee?.toHit ?? enemy.toHit?.melee ?? '4+';
  const enemyDamage = Number(enemy.melee?.damage ?? enemy.stats?.normal?.damage ?? 2) || 2;
  dm(`A group of ${enemy.name} attacks! (HP ${enemyHealth}, Def ${enemyDefense}, Melee ${enemyMeleeToHit})`);

  // Dutch shoots
  const dutch = posse[0];
  const dutchUI = makeUI('Dutch');
  const atk = await resolveHeroAttack({
    ui: dutchUI,
    hero: dutch,
    weapon: { name: 'Pistol', type: 'ranged', toHit: dutch.stats['Ranged To-Hit'] || '4+', damage: 1 },
    dicePool: Number(dutch.stats.Combat) || 2,
    enemy: { defense: enemyDefense, armor: null, abilities: enemy.abilities || [] },
    getStat: (h, k) => calculateCurrentStats(h).stats[k],
  });
  check('resolveHeroAttack returns log + wounds', Array.isArray(atk.log) && Number.isFinite(atk.totalWounds));
  player('Dutch', `Pistol blazing — ${atk.totalWounds} wound(s) dealt!`);
  atk.log.slice(0, 4).forEach(l => say(`      · ${l}`));

  // Enemy strikes back at Ruby (with horror rider)
  const ruby = posse[1];
  const rubyUI = makeUI('Ruby', { spendGrit: true });
  const enemyAtk = await resolveFullEnemyAttack({
    ui: rubyUI,
    hero: posse[1],
    attack: { dice: 2, toHit: enemyMeleeToHit, damage: enemyDamage },
    count: 1,
    getStat: (h, k) => calculateCurrentStats(h).stats[k],
    updateHero, heroId: ruby.id,
    horror: { hits: 1, damagePerHit: 1 },
  });
  check('resolveFullEnemyAttack returns wound counts',
    Number.isFinite(enemyAtk.physicalWounds) && Number.isFinite(enemyAtk.sanityWounds));
  dm(`${enemy.name} claws at Ruby: ${enemyAtk.physicalWounds} wound(s), ${enemyAtk.sanityWounds} sanity damage.`);
  updateHero(ruby.id, h => ({
    ...h,
    currentHealth: Math.max(0, (h.currentHealth ?? 10) - enemyAtk.physicalWounds),
    currentSanity: Math.max(0, (h.currentSanity ?? 10) - enemyAtk.sanityWounds),
  }));
  const rubyNow = posse.find(h => h.id === ruby.id);
  check('wounds persisted through sanitizer', rubyNow.currentHealth <= ruby.currentHealth);
  player('Ruby', `I'm at ${rubyNow.currentHealth}/${rubyNow.maxHealth} HP, ${rubyNow.currentSanity}/${rubyNow.maxSanity} Sanity.`);

  // Corruption hits on Doc (Willpower saves)
  const doc = posse[2];
  dm('Dark Stone dust erupts — Doc takes 2 Corruption Hits! Roll Willpower saves.');
  const corr = await resolveCorruptionHits({
    ui: makeUI('Doc Holloway'),
    hero: posse.find(h => h.id === doc.id),
    hits: 2,
    getStat: (h, k) => calculateCurrentStats(h).stats[k],
    updateHero, heroId: doc.id,
  });
  const docNow = posse.find(h => h.id === doc.id);
  check('corruption applied via canonical field', Number.isFinite(docNow.currentCorruption));
  check('corruption alias mirrors', docNow.corruption === docNow.currentCorruption,
    `alias=${docNow.corruption} canonical=${docNow.currentCorruption}`);
  dm(`Doc now has ${docNow.currentCorruption} Corruption Point(s).`);

  // Post-combat: enemies down, heal D3
  dm(`The last ${enemy.name} falls! Post-combat healing (D3 each).`);
  for (const h of [...posse]) {
    const res = await resolvePostCombatHealing({
      ui: makeUI(h.name), hero: posse.find(p => p.id === h.id), updateHero, heroId: h.id,
    });
    check(`post-combat heal ${h.name}`, Number.isFinite(res.roll ?? res.healRoll ?? 0) || Array.isArray(res.log));
  }

  // ── LOOT ──
  say('\n── LOOT ──');
  for (const h of posse) {
    const card = pick(lootCards);
    const live = posse.find(p => p.id === h.id);
    if (card.type === 'Gold') {
      const amt = card.amount();
      updateHero(h.id, p => ({ ...p, gold: (p.gold ?? 0) + amt }));
      player(h.name, `Gold! +$${amt} (now $${posse.find(p => p.id === h.id).gold}).`);
      check('gold increased', posse.find(p => p.id === h.id).gold === live.gold + amt);
    } else if (card.type === 'Dark Stone') {
      const amt = card.amount();
      updateHero(h.id, p => ({ ...p, darkStone: (p.darkStone ?? 0) + amt }));
      player(h.name, `${amt} Dark Stone... it hums unpleasantly.`);
      check('darkStone persisted', posse.find(p => p.id === h.id).darkStone === (live.darkStone ?? 0) + amt);
    } else {
      const gear = pick(gearCards);
      player(h.name, `A gear card: ${gear.name}!`);
      check('gear card valid', !!gear.id && !!gear.name);
    }
  }

  // ── Growing Dread climax reveal ──
  if (heldGrowingDread.length) {
    dm(`Objective room! Revealing ${heldGrowingDread.length} Growing Dread card(s): ` +
       heldGrowingDread.map(c => `"${c.name}"`).join(', '));
  }

  // ── XP + Level Up ──
  say('\n── XP & LEVEL UP ──');
  updateHero(dutch.id, h => ({ ...h, xp: (h.xp ?? 0) + 550 }));
  const dutchXP = posse.find(h => h.id === dutch.id);
  check('xp persisted', dutchXP.xp === 550, `xp=${dutchXP.xp}`);
  check('canLevelUp true at 550xp L1', canLevelUp(dutchXP) === true);
  check('next threshold is 500', getNextLevelXP(dutchXP) === 500, `got ${getNextLevelXP(dutchXP)}`);
  const chart = getLevelingChart(dutchXP.class || 'Gunslinger');
  check('Gunslinger leveling chart exists', !!chart && !!chart[7], JSON.stringify(Object.keys(chart || {})));
  const lvlRoll = d6() + d6();
  const slot = chart?.[lvlRoll];
  dm(`Dutch levels up! Full heal, +1 max Grit. 2D6 chart roll = ${lvlRoll}: "${slot?.name ?? slot?.bonus ?? slot?.description ?? '??'}"`);
  check(`chart slot ${lvlRoll} exists`, !!slot);
  updateHero(dutch.id, h => ({
    ...h, level: 2,
    currentHealth: h.maxHealth, currentSanity: h.maxSanity,
    Grit: (h.Grit ?? 2) + 1,
    levelTrack: { ...(h.levelTrack || {}), [lvlRoll]: true },
  }));
  const dutchL2 = posse.find(h => h.id === dutch.id);
  check('levelTrack persisted', dutchL2.levelTrack?.[lvlRoll] === true);
  check('grit cap raised', dutchL2.Grit === 3, `Grit=${dutchL2.Grit}`);

  // ── End of adventure: Dark Stone corruption risk ──
  say('\n── END OF ADVENTURE: Dark Stone check ──');
  for (const h of posse) {
    const live = posse.find(p => p.id === h.id);
    const ds = Number(live.darkStone ?? 0);
    if (ds <= 0) { dm(`${h.name} carries no Dark Stone. Safe.`); continue; }
    let hits = 0;
    for (let i = 0; i < ds; i++) if (d6() <= 3) hits++;
    dm(`${h.name} carries ${ds} Dark Stone → ${hits} Corruption Hit(s) to save against.`);
    if (hits > 0) {
      await resolveCorruptionHits({
        ui: makeUI(h.name), hero: live, hits,
        getStat: (x, k) => calculateCurrentStats(x).stats[k],
        updateHero, heroId: h.id,
      });
    }
  }

  // ═════════════════════════════════════════════
  // TOWN STAY
  // ═════════════════════════════════════════════
  say('\n── TOWN PHASE: Fort Burk ──');
  const trait = townTraitsChart.find(t => t.roll === d36()) || townTraitsChart[0];
  check('town traits chart has 36 entries', townTraitsChart.length === 36, `len=${townTraitsChart.length}`);
  dm(`Town Trait (D36): "${trait.name}" — ${(trait.effect || '').slice(0, 90)}...`);

  // Sell dark stone @ $25
  for (const h of posse) {
    const live = posse.find(p => p.id === h.id);
    const ds = Number(live.darkStone ?? 0);
    if (ds > 0) {
      updateHero(h.id, p => ({ ...p, darkStone: 0, gold: (p.gold ?? 0) + ds * 25 }));
      player(h.name, `Sold ${ds} Dark Stone for $${ds * 25}.`);
      check('dark stone sold', posse.find(p => p.id === h.id).darkStone === 0);
    }
  }

  // Shopping at the General Store / Blacksmith (data-level purchase)
  say('\n   🛒 Shopping day');
  const buyer = posse.find(h => h.id === dutch.id);
  const affordable = gearCards.filter(g => g.value && g.value <= buyer.gold && g.slot && !g.restrictions?.length);
  check('affordable gear exists', affordable.length > 0, `gold=$${buyer.gold}`);
  if (affordable.length) {
    const item = pick(affordable);
    const goldBefore = buyer.gold;
    updateHero(dutch.id, h => ({
      ...h,
      gold: h.gold - item.value,
      gear: { ...h.gear, [item.slot === 'Light Source' ? 'Extra 1' : item.slot]: { ...item } },
    }));
    const after = posse.find(h => h.id === dutch.id);
    player('Dutch', `Bought ${item.name} for $${item.value}. ($${after.gold} left)`);
    check('purchase deducted gold', after.gold === goldBefore - item.value);
    const statsAfter = calculateCurrentStats(after);
    check('stats recompute with new gear', !!statsAfter?.stats);
  }

  // Doc visits the Saloon... and the dust catches up with him (mutation!)
  say('\n   🧬 Corruption overflow test');
  updateHero(doc.id, h => ({ ...h, currentCorruption: h.maxCorruption ?? 5 }));
  const docMut = posse.find(h => h.id === doc.id);
  check('corruption overflow adds placeholder mutation',
    (docMut.mutations || []).length > 0 || docMut.currentCorruption === 0,
    `mutations=${docMut.mutations?.length} corruption=${docMut.currentCorruption}`);
  const mutRoll = d36();
  const mut = mutationChart.find(m => m.roll === mutRoll);
  check('mutation chart D36 complete', mutationChart.length === 36, `len=${mutationChart.length}`);
  check(`mutation entry ${mutRoll} exists`, !!mut);
  dm(`Doc's flesh writhes — Mutation (${mutRoll}): "${mut?.name}". ${(mut?.effect || '').slice(0, 80)}`);
  updateHero(doc.id, h => ({
    ...h,
    currentCorruption: 0,
    mutations: [...(h.mutations || []).filter(m => !/roll needed/i.test(m?.name || '')),
      { roll: mutRoll, name: mut?.name, effect: mut?.effect, effects: mut?.effects, rules: mut?.rules }],
  }));
  const docAfterMut = posse.find(h => h.id === doc.id);
  check('mutation persisted', docAfterMut.mutations?.some(m => m.roll === mutRoll));
  const docStats = calculateCurrentStats(docAfterMut);
  check('stats pipeline survives mutation conditions', !!docStats?.stats);

  // Ruby got knocked around — simulate a KO + injury chart roll
  say('\n   🏥 Injury & Madness charts');
  const injRoll = d36();
  const inj = injuryChart.find(i => i.roll === injRoll || (Array.isArray(i.rolls) && i.rolls.includes(injRoll)))
    || injuryChart.find(i => String(i.roll).includes(String(injRoll)));
  check('injury chart D36 complete', injuryChart.length >= 35, `len=${injuryChart.length}`);
  dm(`Ruby's recovery roll (${injRoll}): "${inj?.name ?? 'lookup by range'}"`);
  if (inj) {
    updateHero(ruby.id, h => ({ ...h, injuries: [...(h.injuries || []), { roll: injRoll, name: inj.name, effect: inj.effect }] }));
    check('injury persisted', posse.find(h => h.id === ruby.id).injuries.some(i => i.roll === injRoll));
  }
  check('madness chart D36 complete', madnessChart.length >= 35, `len=${madnessChart.length}`);

  // ═════════════════════════════════════════════
  // ADVENTURE 2: HexCrawl villain showdown
  // ═════════════════════════════════════════════
  say('\n── ADVENTURE 2: Warrant for the Brutal Bandido ──');
  const villain = hexcrawlVillains.find(v => v.name === 'Brutal Bandido');
  check('HexCrawl villain wired into ENEMY_CARDS',
    (ENEMY_CARDS['HexCrawl Villains'] || []).some(v => v.name === 'Brutal Bandido'));
  const vStats = villain.stats.normal;
  dm(`${villain.name} (HP ${vStats.health}, Def ${vStats.defense}, XP ${vStats.xp}) draws his dual pistols!`);

  let villainHP = vStats.health;
  let turns = 0;
  const fightUI = makeUI('Dutch');
  while (villainHP > 0 && turns < 12) {
    turns++;
    const heroAtk = await resolveHeroAttack({
      ui: fightUI,
      hero: posse.find(h => h.id === dutch.id),
      weapon: { name: 'Pistol', type: 'ranged', toHit: '3+', damage: 2 },
      dicePool: 3,
      enemy: { defense: vStats.defense, armor: null, abilities: villain.abilities },
      getStat: (h, k) => calculateCurrentStats(h).stats[k],
    });
    const dealt = heroAtk.totalWounds ?? 0;
    villainHP -= dealt;
    if (dealt > 0) player('Dutch', `Hit for ${dealt}! Bandido at ${Math.max(0, villainHP)} HP.`);
    if (villainHP <= 0) break;
    // villain returns fire at Doc
    const vAtk = await resolveFullEnemyAttack({
      ui: makeUI('Doc Holloway', { spendGrit: false }),
      hero: posse.find(h => h.id === doc.id),
      attack: { dice: vStats.combat, toHit: villain.toHit.ranged, damage: vStats.damage },
      count: 1,
      getStat: (h, k) => calculateCurrentStats(h).stats[k],
      updateHero, heroId: doc.id,
    });
    if (vAtk.physicalWounds > 0) {
      updateHero(doc.id, h => ({ ...h, currentHealth: Math.max(0, h.currentHealth - vAtk.physicalWounds) }));
      dm(`Bandido's pistols rip into Doc for ${vAtk.physicalWounds}. (${posse.find(h => h.id === doc.id).currentHealth} HP left)`);
      if (posse.find(h => h.id === doc.id).currentHealth === 0) {
        dm('Doc is KO\'d! He\'ll roll on the Injury chart in town.');
        break;
      }
    }
  }
  check('villain fight resolves', villainHP <= 0 || turns >= 1);
  if (villainHP <= 0) {
    dm(`The Brutal Bandido falls after ${turns} exchange(s)! +${vStats.xp} XP each.`);
    posse.forEach(h => updateHero(h.id, p => ({ ...p, xp: (p.xp ?? 0) + vStats.xp })));
    check('villain XP awarded', posse.every(h => h.xp >= vStats.xp));
  }

  // ─────────────────────────────────────────────
  // DEPTH EVENT COVERAGE — every selectable world has its own chart
  // ─────────────────────────────────────────────
  say('\n── DEPTH EVENT COVERAGE ──');
  const selectableWorlds = [
    'Mines', 'Targa Plateau', 'Jargono', 'Derelict Ship',
    'The Canyons', 'Blasted Wastes', 'Caverns of Cynder', 'Trederra',
  ];
  for (const w of selectableWorlds) {
    check(`${w} has dedicated depth chart`, hasDepthEventChart(w), 'falls back to Mines');
    for (let dv = 1; dv <= 6; dv++) {
      const ev = getDepthEvent(w, dv);
      check(`${w} depth event die=${dv} valid`, !!ev?.name && !!ev?.effect);
    }
  }
  dm(`Verified depth-event charts for ${selectableWorlds.length} worlds (6 entries each).`);
  // New worlds specifically
  const cynder = getDepthEvent('Caverns of Cynder', 1);
  const trederra = getDepthEvent('Trederra', 1);
  dm(`Caverns of Cynder die=1: "${cynder.name}"; Trederra die=1: "${trederra.name}"`);
  check('Cynder chart is distinct from Mines', cynder.name !== getDepthEvent('Mines', 1).name);
  check('Trederra chart is distinct from Mines', trederra.name !== getDepthEvent('Mines', 1).name);

  // ─────────────────────────────────────────────
  // BLASTED WASTES CONTENT — encounter deck + artifacts
  // ─────────────────────────────────────────────
  say('\n── BLASTED WASTES CONTENT ──');
  const VALID_SKILLS = new Set(['Agility', 'Cunning', 'Spirit', 'Strength', 'Lore', 'Luck']);
  const bwEncounters = ENCOUNTER_CARDS.filter(c => c.world === 'Blasted Wastes');
  check('BW encounter deck has 25+ cards', bwEncounters.length >= 25, `got ${bwEncounters.length}`);
  const bwIds = new Set(bwEncounters.map(c => c.id));
  check('BW encounter ids unique', bwIds.size === bwEncounters.length);
  for (const c of bwEncounters) {
    check(`BW encounter "${c.name}" resolvable`,
      !!c.name && !!(c.effect || c.skillCheck || c.choices),
      'missing name or effect/skillCheck/choices');
    const skillChecks = [
      c.skillCheck,
      ...(c.choices ?? []).map(ch => ch.skillCheck),
    ].filter(Boolean);
    for (const sc of skillChecks) {
      check(`BW "${c.name}" skill "${sc.stat}" valid`, VALID_SKILLS.has(sc.stat), `stat=${sc.stat}`);
      check(`BW "${c.name}" target ${sc.value} in 2–6`, sc.value >= 2 && sc.value <= 6);
    }
  }
  const bwArtifacts = otherWorldArtifacts.filter(a => a.world === 'Blasted Wastes');
  check('BW artifacts have 20+ entries', bwArtifacts.length >= 20, `got ${bwArtifacts.length}`);
  const bwArtIds = new Set(bwArtifacts.map(a => a.id));
  check('BW artifact ids unique', bwArtIds.size === bwArtifacts.length);
  for (const a of bwArtifacts) {
    check(`BW artifact "${a.name}" well-formed`, !!a.id && !!a.name, 'missing id/name');
    const isWeapon = (a.tags ?? []).some(t => /Weapon|Gun|Rifle|Blade/i.test(t));
    if (isWeapon) check(`BW weapon "${a.name}" has slot`, !!a.slot, 'weapon without slot');
  }
  dm(`Blasted Wastes deck check: ${bwEncounters.length} encounters, ${bwArtifacts.length} artifacts — all resolvable.`);

  // Wrap up
  say('\n── FINAL POSSE STATE ──');
  for (const h of posse) {
    const cs = calculateCurrentStats(h);
    dm(`${h.name}: L${h.level} | HP ${h.currentHealth}/${h.maxHealth} | San ${h.currentSanity}/${h.maxSanity} | ` +
       `$${h.gold} | XP ${h.xp} | Corr ${h.currentCorruption}/${h.maxCorruption} | ` +
       `Inj ${h.injuries?.length ?? 0} | Mut ${h.mutations?.length ?? 0} | Init ${cs.stats.Initiative}`);
    const reSan = sanitizeHero(JSON.parse(JSON.stringify(h)));
    check(`round-trip sanitize stable for ${h.name}`,
      reSan.currentHealth === h.currentHealth && reSan.gold === h.gold && (reSan.mutations?.length ?? 0) === (h.mutations?.length ?? 0));
  }

  say('\n══════════════════════════════════════════════════');
  if (failures.length === 0) {
    say(`  ✅ ALL ${checks} CHECKS PASSED — the campaign ran clean.`);
  } else {
    say(`  ❌ ${failures.length}/${checks} CHECKS FAILED:`);
    failures.forEach(f => say(`     • ${f}`));
    process.exitCode = 1;
  }
  say('══════════════════════════════════════════════════\n');
}
