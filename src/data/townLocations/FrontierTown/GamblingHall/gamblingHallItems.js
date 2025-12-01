// src/data/townLocations/gamblingHallItems.js
import { rollD6 } from '../../../../utils/diceHelpers.js';
import { calculateCurrentStats } from '../../../../utils/calculateStats.js';

export default [

  // ===============================
  // Side Bag Tokens
  // ===============================
  {
    id: 'gh_whiskey',
    type: 'item',
    name: 'Whiskey',
    cost: { gold: 50 },
    tags: ['Token', 'Gear', 'Whiskey'],
    weight: 0,
    effects: ['Gain 1 Whiskey Token.'],
  },

  {
    id: 'gh_cigar',
    type: 'item',
    name: 'Fine Cigar',
    cost: { gold: 25 },
    tags: ['Token', 'Gear', 'Cigar'],
    weight: 0,
    effects: ['Gain 1 Fine Cigar Token.'],
  },

  // ===============================
  // Cashier — Sell Dark Stone
  // ===============================
  {
    id: 'gh_cash_ds',
    type: 'service',
    name: 'Cash in Dark Stone',
    tags: ['Service'],
    description: 'Sell any number of Dark Stone shards for $50 each.',
    async exec(hero, posseApi, uiApi) {
      const log = [];
      const actions = {};

      const current = hero.darkStone ?? 0;
      if (current <= 0) {
        return { log: ['You have no Dark Stone to sell.'], actions };
      }

      const amt = await uiApi.promptNumber?.({
        message: `Sell how many Dark Stone? (0–${current})`,
        defaultValue: current,
      });

      const sell = Math.max(0, Math.min(current, Number(amt) || 0));

      if (sell > 0) {
        actions.darkStone = -(sell);
        actions.gold = sell * 50;
        log.push(`Sold ${sell} Dark Stone → +$${sell * 50}`);
      } else {
        log.push('Sold none.');
      }

      return { log, actions };
    },
  },

  // ===============================
  // Rob the Cashier (RAW, but fixed)
  // ===============================
  {
    id: 'gh_rob_cashier',
    type: 'service',
    name: 'Rob the Cashier',
    tags: ['Service', 'OutlawOnly', 'Limit:OncePerTown'],
    description:
      'Cunning 6+ test. Each 6 = D6×$100 +1 UA. Each 1 = 1 Hit. If fail, arrested → Lore 4+ escape or die.',

    async exec(hero, posseApi, uiApi) {
      const log = [];
      const actions = {};
      const heroId = hero.id;

      // -------------------------------------------------------
      // Get REAL computed stats (DefenseTarget, ArmorTarget, etc.)
      // -------------------------------------------------------
      let totals = null;

      if (posseApi?.getTotalsForHero) {
        try {
          totals = posseApi.getTotalsForHero(heroId);
        } catch {
          totals = null;
        }
      }

      if (!totals) {
        try {
          totals = calculateCurrentStats(hero);
        } catch {
          totals = {};
        }
      }

      totals = totals || {};

      const cunningVal =
        totals.Cunning ?? hero.Cunning ?? hero.stats?.Cunning ?? 3;
      const loreVal =
        totals.Lore ?? hero.Lore ?? hero.stats?.Lore ?? 2;

      // ---- helper to parse things like "4+" or numeric 4 ----
      const extractThreshold = (v) => {
        if (!v && v !== 0) return null;
        if (typeof v === 'number') return v;
        if (typeof v === 'string') {
          const m = v.match(/(\d)\s*\+/);
          if (m) return Number(m[1]);
          const n = Number(v);
          if (Number.isFinite(n)) return n;
        }
        return null;
      };

      const defenseTarget =
        extractThreshold(totals.DefenseTarget) ??
        extractThreshold(totals.Defense) ??
        extractThreshold(totals.DefenseValue) ??
        extractThreshold(totals.defense) ??
        extractThreshold(hero.stats?.Defense) ??
        extractThreshold(hero.Defense) ??
        null;

      const armorTarget =
        extractThreshold(totals.ArmorTarget) ??
        extractThreshold(totals.Armor) ??
        extractThreshold(totals.ArmorValue) ??
        extractThreshold(totals.armor) ??
        extractThreshold(hero.stats?.Armor) ??
        extractThreshold(hero.Armor) ??
        null;

      // -------------------------------------------------------
      // CUNNING TEST
      // -------------------------------------------------------
      const autoCunning =
        (await uiApi.promptYesNo?.({
          message:
            `Rob the Cashier\n\n` +
            `Roll ${cunningVal} Cunning dice.\n` +
            `Need at least one 6 to succeed.\n\n` +
            `Auto-roll?`,
          defaultValue: true,
        })) ?? true;

      let cunningRolls = [];

      if (autoCunning) {
        cunningRolls = Array.from({ length: cunningVal }, () => rollD6());
      } else {
        for (let i = 0; i < cunningVal; i++) {
          const d = await uiApi.promptNumber?.({
            message: `Manual Cunning roll ${i + 1} of ${cunningVal}:`,
            defaultValue: 1,
          });
          cunningRolls.push(Math.max(1, Math.min(6, Number(d) || 1)));
        }
      }

      log.push(`Cunning Rolls: [${cunningRolls.join(', ')}]`);

      const sixes = cunningRolls.filter((v) => v === 6).length;
      const ones = cunningRolls.filter((v) => v === 1).length;
      const success = sixes > 0;

      // -------------------------------------------------------
      // PROCESS 1s → HITS → DEFENSE → ARMOR
      // -------------------------------------------------------
      if (ones > 0) {
        log.push(`${ones} Hit(s) from rolling 1s.`);

        for (let i = 0; i < ones; i++) {
          log.push(`Hit ${i + 1}: 1 incoming damage.`);

          let prevented = false;

          // ---------- DEFENSE ----------
          if (defenseTarget) {
            const autoDef =
              (await uiApi.promptYesNo?.({
                message:
                  `Hit ${i + 1}\n` +
                  `Incoming Damage: 1\n` +
                  `Defense: ${defenseTarget}+` +
                  `\nAuto-roll Defense?`,
                defaultValue: true,
              })) ?? true;

            const r = autoDef
              ? rollD6()
              : Math.max(
                  1,
                  Math.min(
                    6,
                    Number(
                      await uiApi.promptNumber?.({
                        message: `Roll Defense (1–6):`,
                        defaultValue: 1,
                      }),
                    ) || 1,
                  ),
                );

            log.push(`Defense roll: ${r} (need ${defenseTarget}+)`);

            if (r >= defenseTarget) {
              prevented = true;
              log.push(`Defense prevented the damage.`);
            }
          }

          if (prevented) continue;

          // ---------- ARMOR ----------
          if (armorTarget) {
            const autoArm =
              (await uiApi.promptYesNo?.({
                message:
                  `Hit ${i + 1}\n` +
                  `Defense failed.\n` +
                  `Armor: ${armorTarget}+` +
                  `\nAuto-roll Armor?`,
                defaultValue: true,
              })) ?? true;

            const r = autoArm
              ? rollD6()
              : Math.max(
                  1,
                  Math.min(
                    6,
                    Number(
                      await uiApi.promptNumber?.({
                        message: `Roll Armor (1–6):`,
                        defaultValue: 1,
                      }),
                    ) || 1,
                  ),
                );

            log.push(`Armor roll: ${r} (need ${armorTarget}+)`);

            if (r >= armorTarget) {
              prevented = true;
              log.push(`Armor prevented the damage.`);
            }
          }

          if (!prevented) {
            log.push(`Took 1 Wound.`);
            if (posseApi?.applyHits) {
              await posseApi.applyHits(heroId, 1);
            } else {
              actions.health = (actions.health ?? 0) - 1;
            }
          }
        }
      }

      // -------------------------------------------------------
      // SUCCESS → PAYOUT
      // -------------------------------------------------------
      if (success) {
        let payout = 0;

        for (let i = 0; i < sixes; i++) {
          const r = rollD6();
          const gain = r * 100;
          payout += gain;

          log.push(
            `Cunning die ${i + 1} was a 6 → payout = ${r} × $100 = $${gain}.`,
          );

          // +1 Unwanted Attention for each 6
          actions.unwantedAttention = (actions.unwantedAttention ?? 0) + 1;
        }

        actions.gold = (actions.gold ?? 0) + payout;
        log.push(`Total Robbery Payout: $${payout}`);

        return { log, actions };
      }

      // -------------------------------------------------------
      // FAILURE → ARREST → LORE ESCAPE TEST
      // -------------------------------------------------------
      log.push(`No 6 rolled → Arrested.`);

      const autoLore =
        (await uiApi.promptYesNo?.({
          message:
            `Lore Escape Test\n\n` +
            `Lore: ${loreVal}\n` +
            `Roll ${loreVal} Lore dice, need at least one 4+.\n\n` +
            `Auto-roll?`,
          defaultValue: true,
        })) ?? true;

      // Lore test = roll loreVal dice, need >= 4 on ANY die
      let loreRolls = [];

      if (autoLore) {
        loreRolls = Array.from({ length: loreVal }, () => rollD6());
      } else {
        for (let i = 0; i < loreVal; i++) {
          const d = await uiApi.promptNumber?.({
            message: `Manual Lore roll ${i + 1} of ${loreVal}:`,
            defaultValue: 1,
          });
          loreRolls.push(Math.max(1, Math.min(6, Number(d) || 1)));
        }
      }

      log.push(`Lore Rolls: [${loreRolls.join(', ')}]`);

      const escaped = loreRolls.some((v) => v >= 4);

      if (escaped) {
        log.push(`You escaped! +20 XP. (Wanted) Town stay ends.`);
        actions.xp = (actions.xp ?? 0) + 20;
        actions.wanted = true;
        actions.isDone = true;
        return { log, actions };
      }

      // ---------- FAIL ESCAPE = DEAD ----------
      log.push(
        `Escape failed → HERO DEAD.\n` +
          `The Posse may attempt the Hanging High scenario to rescue.`,
      );

      actions.dead = true;
      actions.wanted = true;
      actions.isDone = true;

      return { log, actions };
    },
  },

  // ===============================
  // Gear
  // ===============================

  {
    id: 'gh_devils_own',
    type: 'gear',
    name: "The Devil's Own",
    slot: 'Charm',
    cost: { gold: 600 },
    tags: ['Gear', 'Charm', 'Hell', 'DarkStone', 'NoHoly', 'NoTribal'],
    darkStone: true, // contains a Dark Stone
    weight: 1,
    upgradeSlots: 0,
    restrictions: [
      'No Holy Heroes',
      'No Tribal Heroes',
    ],
    effects: [
      'No Holy or Tribal Heroes.',
      'Once per Adventure/Town Stay, take D3 Corruption Hits (ignore Willpower) to Recover that many Grit.',
    ],
  },

  {
    id: 'gh_cheaters_holdout',
    type: 'gear',
    name: "Cheater's Hold-Out Pistol",
    slot: 'Gun',
    cost: { gold: 1250 },
    weight: 1,
    upgradeSlots: 1,
    tags: ['Gear', 'Gun', 'Light', 'PerformerOnly', 'ShowmanOnly'],
    effects: [
      'Free Attack (Once per Fight).',
      'Range: 4',
      'Shots: 1',
      'Critical Hit on 5 or 6.',
      'This Free Attack may be made at +3 Initiative.',
    ],
  },

  {
    id: 'gh_gamblers_gun',
    type: 'gear',
    name: "Gambler's Gun",
    slot: 'Gun',
    cost: { gold: 1400 },
    weight: 1,
    upgradeSlots: 2,
    tags: ['Gear', 'Gun', 'PerformerOnly', 'ShowmanOnly'],
    effects: [
      'Range: 7',
      'Shots: 2',
      'Once per Turn, you may add D6–3 Damage to a single Hit from this gun.',
    ],
  },

  {
    id: 'gh_ds_poker_chip',
    type: 'gear',
    name: 'Dark Stone Poker Chip',
    slot: 'Charm',
    cost: { gold: 800, darkStone: 1 },
    weight: 1,
    darkStone: true,
    upgradeSlots: 0,
    tags: ['Gear', 'Charm', 'Dark Stone'],
    effects: [
      '+1 Luck while Gambling.',
      'Any time you gain Gold while Gambling, gain an extra +$50. (Limit One)',
    ],
  },

];
