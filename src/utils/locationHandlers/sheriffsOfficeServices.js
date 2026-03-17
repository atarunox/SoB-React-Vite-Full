// src/utils/locationHandlers/sheriffsOfficeServices.js
import { loadTownState, saveTownState } from '../../utils/townState';
import { calculateCurrentStats } from '../../utils/calculateStats';

import { d6 as D6, rollND } from '../../utils/diceHelpers';
const D8 = () => rollND(1, 8)[0];

/* -------------------------------- totals helpers -------------------------------- */
function getDerivedTotals(hero, posseApi) {
  // Prefer a PosseContext-provided totals getter (fast/no recompute)
  if (posseApi?.getTotalsForHero) {
    const id = hero?.id || hero?.localId;
    try {
      const t = posseApi.getTotalsForHero(id);
      if (t && typeof t === 'object') return t; // must already be a flat { StatName: value } map
    } catch {}
  }
  // Fallback: compute from hero on the fly
  try {
    const t = calculateCurrentStats?.(hero);
    if (t && typeof t === 'object' && t.stats) return t.stats; // ✅ return .stats (not the wrapper)
  } catch {}
  // Last resort: use baked-in totals/stats if present
  return hero?.totals || hero?.stats || {};
}

function getStat(hero, statName, totalsLike) {
  const totals = totalsLike || hero?.totals || hero?.stats || {};
  // numeric totals (e.g., Initiative 4, Cunning 3)
  const fromTotals = Number(totals?.[statName]);
  if (Number.isFinite(fromTotals)) return fromTotals;

  // handle "X+" style strings (Armor "5+", Defense "4+")
  const raw = totals?.[statName] ?? hero?.[statName] ?? hero?.core?.[statName] ?? hero?.stats?.[statName];
  if (typeof raw === 'string') {
    const m = raw.match(/\d+/);
    if (m) return Number(m[0]);
  }

  const direct = Number(hero?.[statName]) || Number(hero?.core?.[statName]) || Number(hero?.stats?.[statName]);
  return Number.isFinite(direct) ? direct : 0;
}

function pushUpdate(actions, patch) {
  actions.push({ type: 'update', ...patch });
}

/* ---------- Defense-per-hit, Armor-per-wound resolver (auto-detect Armor) ---------- */
function parsePlusTarget(v) {
  if (v == null) return NaN;
  if (typeof v === 'string') {
    const m = v.match(/\d+/);
    return m ? Number(m[0]) : NaN;
  }
  if (typeof v === 'number') return v;
  return NaN;
}

/**
 * Resolve damage when Defense is rolled per Hit (each success ignores 1 hit),
 * and Armor is rolled per Wound (each success ignores 1 wound).
 * - Auto-detects Armor target from totals (no "Do you have Armor?" prompt)
 */
export async function resolveDefensePerHitThenArmorPerWound({
  ui, hero, hits, woundsPerHit, getStat,
}) {
  let incomingHits = Math.max(0, Math.floor(hits));

  // ----- DEFENSE (per hit) -----
  if (incomingHits > 0) {
    const defTargetGuess =
      parsePlusTarget(getStat(hero, 'Defense')) ||
      parsePlusTarget(hero?.defense) ||
      parsePlusTarget(hero?.stats?.Defense) ||
      NaN;

    const doAutoDef = await ui.promptYesNo?.({
      message:
        `Defense (per Hit): ${incomingHits} incoming hit${incomingHits === 1 ? '' : 's'}.\n` +
        `Auto-roll Defense now${Number.isFinite(defTargetGuess) ? ` (target ${defTargetGuess}+)` : ''}?`,
    });

    if (doAutoDef) {
      const target = Number.isFinite(defTargetGuess)
        ? defTargetGuess
        : (Number(await ui.promptNumber?.({
            title: 'Defense Target',
            message: 'Enter your Defense target number (e.g., 4 for 4+):',
            min: 2, max: 6, defaultValue: 4,
          })) || 4);

      const rolls = await ui.roll(incomingHits, 6, `Defense — ${incomingHits}d6 vs ${target}+ (1 success ignores 1 hit)`);
      const arr = Array.isArray(rolls) ? rolls : [rolls];
      const blocks = arr.filter(n => n >= target).length;
      incomingHits = Math.max(0, incomingHits - blocks);
      await ui.toast?.(`Defense blocked ${blocks} hit(s). Hits getting through: ${incomingHits}.`);
    } else {
      // Manual: ask how many Defense FAILED (i.e., hits that still get through)
      const fails = Number(await ui.promptNumber?.({
        title: 'Manual Defense',
        message: `How many Defense rolls FAILED (of ${incomingHits})?`,
        min: 0, max: incomingHits, defaultValue: incomingHits,
      })) || incomingHits;
      incomingHits = Math.max(0, Math.min(incomingHits, fails));
      await ui.toast?.(`Manual Defense: Hits getting through = ${incomingHits}.`);
    }
  }

  // Convert remaining hits into wounds
  let pendingWounds = incomingHits * Math.max(0, Math.floor(woundsPerHit));

  // ----- ARMOR (per wound) — auto-detect presence/target -----
  if (pendingWounds > 0) {
    // Pull Armor from derived totals first (e.g., "5+"); fall back to hero fields.
    const armorTargetGuess =
      parsePlusTarget(getStat(hero, 'Armor')) ||
      parsePlusTarget(hero?.armor) ||
      parsePlusTarget(hero?.stats?.Armor) ||
      NaN;

    if (Number.isFinite(armorTargetGuess)) {
      const doAutoArmor = await ui.promptYesNo?.({
        message: `Armor detected (${armorTargetGuess}+). Auto-roll Armor for ${pendingWounds} wound(s)?`,
      });

      if (doAutoArmor) {
        const rolls = await ui.roll(pendingWounds, 6, `Armor — ${pendingWounds}d6 vs ${armorTargetGuess}+ (each success ignores 1 wound)`);
        const arr = Array.isArray(rolls) ? rolls : [rolls];
        const ignores = arr.filter(n => n >= armorTargetGuess).length;
        pendingWounds = Math.max(0, pendingWounds - ignores);
        await ui.toast?.(`Armor ignored ${ignores} wound(s). Final Wounds: ${pendingWounds}.`);
      } else {
        const armorBlocks = Number(await ui.promptNumber?.({
          title: 'Manual Armor',
          message: `How many Armor rolls SUCCEEDED (of ${pendingWounds})?`,
          min: 0, max: pendingWounds, defaultValue: 0,
        })) || 0;
        pendingWounds = Math.max(0, pendingWounds - armorBlocks);
        await ui.toast?.(`Manual Armor: Final Wounds = ${pendingWounds}.`);
      }
    } else {
      // No Armor detected; continue without asking.
      await ui.toast?.('No Armor detected on your sheet. Skipping Armor rolls.');
    }
  }

  return pendingWounds;
}


/* -------------------------------- main executor -------------------------------- */
export async function performSheriffsOfficeService({ hero, svc, ui, posseApi }) {
  const meId = hero?.id || hero?.localId;
  const totals = getDerivedTotals(hero, posseApi); // ✅ now a flat { Stat: value } map

  const actions = [];
  const log = [];
  let endsVisit = !!svc?.endsVisit;

  // Result prompt helper (same pattern as handler showResult but uses ui)
  const showResult = async (title, lines) => {
    const body = Array.isArray(lines) ? lines.join('\n') : lines;
    await ui.promptChoice?.(`${title}\n\n${body}`, [{ label: 'Continue' }]);
  };

  const addGold = (delta, why) => {
    if (!Number.isFinite(delta) || delta === 0) return;
    const now = Number(hero?.gold ?? 0);
    pushUpdate(actions, { gold: Math.max(0, now + delta) });
    log.push(`${delta >= 0 ? 'Gained' : 'Paid'} $${Math.abs(delta)}${why ? ` — ${why}` : ''}.`);
  };
  const addXP = (delta, why) => {
    if (!Number.isFinite(delta) || delta === 0) return;
    const now = Number(hero?.xp ?? 0);
    pushUpdate(actions, { xp: Math.max(0, now + delta) });
    log.push(`${delta >= 0 ? 'Gained' : 'Spent'} ${Math.abs(delta)} XP${why ? ` — ${why}` : ''}.`);
  };

  const chooseStat = async (title, a, b) => {
    const av = getStat(hero, a, totals);
    const bv = getStat(hero, b, totals);
    const pick = await ui.promptChoice?.(title, [
      { label: `${a} (${av})` },
      { label: `${b} (${bv})` },
    ]);
    return pick === 1 ? { name: b, value: bv } : { name: a, value: av };
  };

  switch (svc?.id) {
    /* ---------------- Sheriff's Bounty ---------------- */
    case 'so_sheriffs_bounty': {
      // Draw Low Threat enemy if your UI supports it
      let target = null;
      if (typeof ui?.drawFromDeck === 'function') {
        try {
          const card = await ui.drawFromDeck({ deck: 'Enemy', tier: 'Low' });
          if (card && card.name) {
            target = {
              name: card.name,
              printedXP: Number(card.printedXP ?? card.xp ?? 0),
              xpPerWound: Number(card.xpPerWound ?? 0),
              fixedXpBonus: Number(card.fixedXpBonus ?? 0),
            };
          }
        } catch {}
      }
      // Fallback prompt
      if (!target) {
        const name = await ui.promptText?.({
          message: 'Bounty Target (Low Threat) — enter Enemy name:',
          defaultValue: '',
        });
        const printedXP = Number(
          await ui.promptText?.({ message: 'Printed XP on target?', defaultValue: '10' })
        );
        const perWound = Number(
          await ui.promptText?.({ message: 'XP per wound (if any)? Enter 0 if none.', defaultValue: '0' })
        );
        const fixed = Number(
          await ui.promptText?.({ message: 'Fixed XP bonus at bottom (if any)?', defaultValue: '0' })
        );
        target = { name: name || 'Unknown Enemy', printedXP: printedXP || 0, xpPerWound: perWound || 0, fixedXpBonus: fixed || 0 };
      }

      // Value: printed XP; if variable XP, use base + fixed (ignore per-wound scaling)
      const valueGold = Number.isFinite(target.xpPerWound) && target.xpPerWound > 0
        ? Math.max(0, Number(target.printedXP || 0) + Number(target.fixedXpBonus || 0))
        : Math.max(0, Number(target.printedXP || 0));

      // Add poster to inventory (expires after next Adventure)
      const poster = {
        id: `bounty_${Date.now()}`,
        name: 'Bounty Poster',
        type: 'Gear',
        slot: 'Misc',
        weight: 0,
        tags: ['Bounty', 'Temporary'],
        description: `Target: ${target.name}. Worth $${valueGold} when killed (converts from printed XP rule).`,
        bounty: {
          target: target.name,
          goldOnKill: valueGold,
          rule: target.xpPerWound > 0 ? 'baseXP + fixed bonus; ignore per-wound' : 'printed XP',
        },
        expires: 'endOfAdventure',
      };
      const inventory = Array.isArray(hero?.inventory) ? hero.inventory.slice() : [];
      inventory.push(poster);
      pushUpdate(actions, { inventory });

      // Persist in town stay modifiers for convenience
      const s = loadTownState() || {};
      s.stayMods = s.stayMods || {};
      s.stayMods.sheriffsBounty = {
        target: poster.bounty.target,
        goldOnKill: poster.bounty.goldOnKill,
        posterId: poster.id,
        expires: 'endOfAdventure',
      };
      saveTownState(s);

      log.push(`Bounty set on <b>${target.name}</b> — value $${poster.bounty.goldOnKill}. A Bounty Poster was added to your inventory (expires after the next Adventure).`);
      return { actions, log, ui: { title: svc.name, outcome: log.slice() } };
    }

    /* ---------------- Pay Off Your Warrants ---------------- */
    case 'so_pay_off_warrants': {
      const level = Math.max(1, Number(hero?.level ?? 1));
      const isMostWanted =
        !!hero?.status?.mostWanted ||
        (Array.isArray(hero?.keywords) && hero.keywords.some(k => String(k).toLowerCase() === 'most wanted'));
      const cost = (isMostWanted ? 750 : 500) * level;

      const desc = [
        'Cost: <b>$500 × Hero Level</b>. If <b>Most Wanted</b>, the cost is <b>$750 × Hero Level</b>.',
        `Computed for you: <b>$${cost}</b> (Level ${level}${isMostWanted ? ', Most Wanted' : ''}).`,
      ];

      if ((hero?.gold ?? 0) < cost) {
        log.push(`Insufficient funds. Need $${cost}.`);
        return { actions, log, ui: { title: svc.name, description: desc, outcome: log.slice() } };
      }

      addGold(-cost, 'Paid Off Warrants');
      // Clear wanted flags/keywords
      const nextKeywords = Array.isArray(hero?.keywords)
        ? hero.keywords.filter(k => {
            const low = String(k).toLowerCase();
            return low !== 'wanted' && low !== 'most wanted';
          })
        : hero?.keywords;

      pushUpdate(actions, {
        status: { ...(hero?.status || {}), wanted: false, mostWanted: false },
        keywords: nextKeywords,
      });

      log.push('All warrants cleared. Wanted status removed.');
      return { actions, log, ui: { title: svc.name, description: desc, outcome: log.slice() } };
    }

    /* ---------------- Interrogate Prisoner ---------------- */
    case 'so_interrogate_prisoner': {
      const pick = await chooseStat('Interrogate — choose stat', 'Strength', 'Cunning');
      const dice = Math.max(1, Number(pick.value || 0));
      const rolls = await ui.roll(dice, 6, `Interrogate (${pick.name} ${pick.value}) — roll ${dice}d6`);
      const arr = Array.isArray(rolls) ? rolls : [rolls];
      const sixes = arr.filter(n => n === 6).length;
      const ones = arr.filter(n => n === 1).length;

      if (sixes > 0) {
        const s = loadTownState() || {};
        s.stayMods = s.stayMods || {};
        s.stayMods.interrogateRerolls = (s.stayMods.interrogateRerolls || 0) + sixes;
        saveTownState(s);
        log.push(`Insight! You gain ${sixes} re-draw(s) for the next Adventure.`);
      } else {
        log.push('No useful intel gained.');
      }

      if (ones > 0) {
        const s = loadTownState() || {};
        s.stayMods = s.stayMods || {};
        s.stayMods.interrogateDarknessSteps = (s.stayMods.interrogateDarknessSteps || 0) + ones;
        saveTownState(s);
        log.push(`The prisoner misleads you. Darkness will advance ${ones} step(s) at the start of the next Adventure.`);
      }

      return { actions, log, ui: { title: svc.name, outcome: log.slice() } };
    }

    /* ---------------- Become Deputized ---------------- */
    case 'so_become_deputized': {
      // Not available to Law or Holy heroes
      const heroKw = Array.isArray(hero?.keywords) ? hero.keywords : [];
      if (heroKw.includes('Law') || heroKw.includes('Holy')) {
        log.push('Not available to Law or Holy Heroes.');
        return { actions, log, ui: { title: svc.name, outcome: log.slice() } };
      }

      if ((hero?.xp ?? 0) < 50) {
        log.push('Not enough XP (need 50).');
        return { actions, log, ui: { title: svc.name, outcome: log.slice() } };
      }

      addXP(-50, 'Deputized fee');

      const kw = [...heroKw];
      if (!kw.includes('Law')) kw.push('Law');

      const cond = hero?.conditions || {};
      const temporary = Array.isArray(cond.temporary) ? [...cond.temporary] : [];
      temporary.push({
        id: 'deputized_cunning_plus1',
        name: 'Deputized',
        type: 'temporary',
        effect: '+1 Cunning and Keyword Law. At end of each Adventure, roll D6 — on 1-3 lose this bonus.',
        statMods: { Cunning: +1 },
        active: true,
        expires: 'endOfAdventureCheck',
        expiryRoll: { die: 6, loseOn: [1, 2, 3] },
        addedAt: Date.now(),
      });

      pushUpdate(actions, { keywords: kw, conditions: { ...cond, temporary } });
      log.push('You are now Deputized: gained the Law keyword and +1 Cunning. At the end of each Adventure, roll D6 — on 1, 2, or 3 you lose this bonus.');
      return { actions, log, ui: { title: svc.name, outcome: log.slice() } };
    }

    /* ---------------- Join a Manhunt (verbatim + full shootout/defense/armor) ---------------- */
    case 'so_join_manhunt': {
      // Check if "We need Six Men!" event doubled rewards today
      const tsManhunt = loadTownState() || {};
      const doubleRewards = !!(tsManhunt.sheriffsOfficeFlags?.manhuntDoubleRewardsToday);
      const rewardMult = doubleRewards ? 2 : 1;

      const flavor = [
        'You ride with the Law through the badlands, tracking sign and asking questions at lonely ranches.',
        'Rumors lead to a canyon hideout — the posse circles wide as the sun dips low…',
      ];
      if (doubleRewards) flavor.push('"We need Six Men!" — Double XP & Gold rewards today!');
      log.push(...flavor);

      // Show intro prompt
      await showResult('JOIN A MANHUNT', [
        ...flavor,
        '',
        `Make a Cunning 5+ test. For each 5+ rolled, gain 20 XP${doubleRewards ? ' (doubled!)' : ''}.`,
        'If at least one 6 is rolled, you track down the Outlaw for a shootout!',
      ]);

      const C = getStat(hero, 'Cunning', totals);
      const dice = Math.max(1, C);
      const huntRolls = await ui.roll(dice, 6, `Manhunt — Cunning ${C} (roll ${dice}d6 vs 5+)`);
      const arr = Array.isArray(huntRolls) ? huntRolls : [huntRolls];
      const successes = arr.filter((n) => n >= 5).length;
      const hasSix = arr.some((n) => n === 6);

      const rollLine = `Rolled [${arr.join(', ')}] — ${successes} success${successes !== 1 ? 'es' : ''} (5+).`;
      log.push(rollLine);

      if (successes > 0) {
        const xp = successes * 20 * rewardMult;
        addXP(xp, `Manhunt reward${doubleRewards ? ' (doubled)' : ''}`);
        log.push(`You ran down ${successes} of the outlaw's crew: +${xp} XP${doubleRewards ? ' (doubled!)' : ''}.`);
      } else {
        log.push('You comb the hills to no avail — the trail goes cold.');
      }

      if (!hasSix) {
        const outcome = 'No sign of the main outlaw himself this time — you return to town.';
        log.push(outcome);
        await showResult('MANHUNT — Result', [rollLine, '', successes > 0 ? `+${successes * 20 * rewardMult} XP from tracking.` : 'No XP earned.', '', outcome]);
        endsVisit = true;
        return { actions, log, ui: { title: svc.name, outcome: log.slice() }, endsVisit };
      }

      // ---- SHOOTOUT TRIGGERED (rolled at least one 6) ----
      await showResult('MANHUNT — Shootout!', [
        rollLine,
        '',
        'You tracked the outlaw to his hideout — but he springs an ambush!',
        'A gunfight erupts among the rocks.',
      ]);

      log.push('The outlaw springs the ambush! A gunfight erupts among the rocks.');
      const shootoutRolls = await ui.roll(2, 6, 'Manhunt Shootout — 2D6 hits');
      const total = Array.isArray(shootoutRolls)
        ? shootoutRolls.reduce((a, b) => a + b, 0)
        : shootoutRolls;

      const initiative = getStat(hero, 'Initiative', totals);
      const hits = Math.max(0, total - initiative);

      const level = Number(hero?.level ?? 1);
      const perHit = level >= 5 ? 8 : 4;

      const shootLine = `Shootout: rolled [${Array.isArray(shootoutRolls) ? shootoutRolls.join(', ') : shootoutRolls}] = ${total}. Subtract Initiative ${initiative} → ${hits} hit(s).`;
      log.push(shootLine);

      let finalWounds = 0;
      if (hits > 0) {
        log.push(`Each hit deals ${perHit} Wounds (pre-Defense).`);

        finalWounds = await resolveDefensePerHitThenArmorPerWound({
          ui, hero,
          hits,
          woundsPerHit: perHit,
          getStat: (h, s) => getStat(h, s, totals),
        });

        if (finalWounds > 0) {
          log.push(`Damage taken: ${finalWounds} Wounds after Defense/Armor.`);
          const hpNow = Number(hero?.currentHealth ?? 0);
          pushUpdate(actions, { currentHealth: Math.max(0, hpNow - finalWounds) });
        } else {
          log.push('No damage after Defense/Armor — you shrug off the ambush!');
        }
      } else {
        log.push('You duck behind cover — no hits get through!');
      }

      // Unless KO'd, you capture the Outlaw! Gain 25 XP and D6 × $100.
      const hpAfter = Number(hero?.currentHealth ?? 0) - finalWounds;
      const knockedOut = hpAfter <= 0;
      if (!knockedOut) {
        const bountyRoll = D6();
        const bountyGold = bountyRoll * 100 * rewardMult;
        const captureXP = 25 * rewardMult;
        addXP(captureXP, `Captured the outlaw${doubleRewards ? ' (doubled)' : ''}`);
        addGold(bountyGold, `Outlaw bounty (${bountyRoll} × $100${doubleRewards ? ' × 2' : ''})`);
        const captureLine = `Captured! +${captureXP} XP and $${bountyGold} (rolled [${bountyRoll}] × $100${doubleRewards ? ' × 2' : ''}).${doubleRewards ? ' (Doubled!)' : ''}`;
        log.push(captureLine);
        await showResult('MANHUNT — Victory!', [shootLine, '', `Wounds taken: ${finalWounds}`, '', captureLine]);
      } else {
        const koLine = 'You were knocked out in the shootout — the outlaw escapes!';
        log.push(koLine);
        await showResult('MANHUNT — Knocked Out', [shootLine, '', `Wounds taken: ${finalWounds}`, '', koLine]);
      }

      endsVisit = true;
      return { actions, log, ui: { title: svc.name, outcome: log.slice() }, endsVisit };
    }

    /* ---------------- Escort Prisoner Transfer ---------------- */
    case 'so_escort_prisoner': {
      // Check if Legendary Outlaw event (roll 12) upgraded this service today
      const tsEscort = loadTownState() || {};
      const legendaryBonus = !!(tsEscort.sheriffsOfficeFlags?.escortLegendaryBonusToday);
      const escortTarget = legendaryBonus ? 6 : 5;
      const escortPayPerPip = legendaryBonus ? 100 : 25;

      // Show intro prompt
      await showResult('ESCORT PRISONER TRANSFER', [
        legendaryBonus
          ? 'Legendary Outlaw "Sparky" Scafford is your prisoner today! Lore 6+ test required, but the reward is D8×$100.'
          : 'You are escorting a prisoner to the federal Marshals. Make a Lore 5+ test to follow the best roads.',
        '',
        `Lore ${escortTarget}+ test. Success: D8 × $${escortPayPerPip}. Failure: lose all Grit.`,
        'For each 1 rolled, roll a Travel Hazard.',
      ]);

      const L = getStat(hero, 'Lore', totals);
      const dice = Math.max(1, L);
      const rolls = await ui.roll(dice, 6, `Escort — Lore ${L} (roll ${dice}d6 vs ${escortTarget}+)${legendaryBonus ? ' [Legendary Outlaw!]' : ''}`);
      const arr = Array.isArray(rolls) ? rolls : [rolls];
      const successes = arr.filter(n => n >= escortTarget).length;
      const ones = arr.filter(n => n === 1).length;

      const rollLine = `Rolled [${arr.join(', ')}] — ${successes} success${successes !== 1 ? 'es' : ''} (Lore ${escortTarget}+).`;
      log.push(rollLine);

      if (successes > 0) {
        let d8 = D8();
        if (typeof ui.promptText === 'function') {
          const raw = await ui.promptText({
            message: `Escort success! Enter your D8 roll for payout (blank for auto = ${d8}).`,
            defaultValue: '',
          });
          const n = Math.floor(Number(raw));
          if (Number.isFinite(n) && n >= 1 && n <= 8) d8 = n;
        }
        const payout = d8 * escortPayPerPip;
        addGold(payout, `Escort payoff (${d8} × $${escortPayPerPip})`);
        const successLine = `You safely delivered the prisoner. Gained $${payout} (D8 [${d8}] × $${escortPayPerPip}).${legendaryBonus ? ' (Legendary Outlaw bonus!)' : ''}`;
        log.push(successLine);
        await showResult('ESCORT — Success!', [rollLine, '', successLine]);
      } else {
        // Failed: ambushed by the prisoner's gang. Lose all Grit.
        pushUpdate(actions, { currentGrit: 0 });
        const failLine = 'Ambushed by the prisoner\'s gang! Surrounded, you have no choice but to let him Escape and return to Town empty-handed. You lose all Grit you currently have.';
        log.push(failLine);
        await showResult('ESCORT — Failed!', [rollLine, '', failLine]);
      }

      if (ones > 0) {
        for (let i = 0; i < ones; i++) {
          await showResult('ESCORT — Travel Hazard', [
            `A die showed 1 (${i + 1} of ${ones}).`,
            '',
            'Roll a Travel Hazard for the escort route.',
          ]);
          log.push('DM: Roll a Travel Hazard for the escort route (due to a 1).');
        }
      }

      endsVisit = true;
      return { actions, log, ui: { title: svc.name, outcome: log.slice() }, endsVisit };
    }

    default:
      log.push('Service not implemented yet.');
      return { actions, log, ui: { title: svc?.name || 'Service', outcome: log.slice() } };
  }
}

export default { performSheriffsOfficeService };
