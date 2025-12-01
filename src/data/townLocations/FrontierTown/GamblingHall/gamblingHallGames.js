// src/data/townLocations/gamblingHallGames.js
// Entertainment: Poker, Craps, Devil’s Wheel

import { rollD6, rollND } from '../../../../utils/diceHelpers.js';

export default [
  // ===============================
  // 🎴 FIVE CARD DRAW POKER — PLAY
  // ===============================
  {
    id: 'gh_poker_play',
    type: 'service',
    name: 'Five Card Draw Poker',
    cost: { gold: 50 },
    tags: ['Entertainment', 'Gambling'],
    description: 'Gambling • Limit Three Times per Visit',
    effects: [
      'Pay $50 to sit down at the Poker table.',
      'Roll 5d6 to form your “hand” (you may auto-roll or enter the dice manually).',
      'After seeing your hand, you must either place an Extra Bet of $50–$250 or Fold, losing only your $50 table cost.',
      'If you place the Extra Bet, you may then re-roll any number of your hand dice once, by selecting which dice to HOLD from a list (the rest are re-rolled).',
      'After that, you may spend 1 Grit to add an additional $0–$250 to your Extra Bet.',
      'Your final hand quality determines the difficulty of a Cunning Test.',
      'If any dice in that Cunning Test are re-rolled, you gain +1 Unwanted Attention.',
      'On a successful Cunning Test, gain D6 × $25 and double the total Extra Bet. On a failure, you lose all bets.',
    ],
    async exec(hero, posseApi, uiApi, params = {}) {
      const log = [];
      const actions = {};

      const promptYesNo = async (message, def = false) =>
        (await uiApi.promptYesNo?.({ message, defaultValue: def })) ?? def;

      const promptNumber = async (message, def = 0) =>
        (await uiApi.promptNumber?.({ message, defaultValue: def })) ?? def;

      const promptText = async (message, def = '') =>
        (await uiApi.promptText?.({ message, defaultValue: def })) ?? def;

      // Generic helper: let the player select dice indices from a list.
      async function promptSelectPositions(label, dice, mode = 'hold') {
        if (uiApi.promptMultiSelect) {
          const options = dice.map((v, idx) => ({
            value: String(idx + 1), // 1-based for display
            label: `Die ${idx + 1}: ${v}`,
          }));
          const selected = await uiApi.promptMultiSelect({
            message: `${label}\nTap dice to ${mode.toUpperCase()}.`,
            options,
            defaultValues: [],
          });
          const set = new Set();
          (selected || []).forEach((val) => {
            const n = Number(val);
            if (Number.isFinite(n) && n >= 1 && n <= dice.length) {
              set.add(n); // keep 1-based
            }
          });
          return set;
        }

        // Fallback: typed positions (single prompt)
        const lines = [
          `${label}`,
          '',
          'Current dice:',
          ...dice.map((v, i) => `${i + 1}) - ${v}`),
          '',
          `Enter positions of dice to ${mode.toUpperCase()} (1–${dice.length}), separated by commas.`,
          `Example: "1,3,5". Leave blank for none.`,
        ];
        const text = await promptText(lines.join('\n'), '');

        const set = new Set();
        if (typeof text === 'string' && text.trim()) {
          text
            .split(',')
            .map((s) => s.trim())
            .forEach((s) => {
              const n = Number(s);
              if (Number.isFinite(n) && n >= 1 && n <= dice.length) {
                set.add(n);
              }
            });
        }
        return set;
      }

      // Read "current" spendable Grit for this hero
      const getCurrentGrit = () => {
        const direct =
          hero.currentGrit ??
          hero.grit ??
          hero.stats?.Grit ??
          hero.derived?.Grit ??
          hero.totals?.Grit;

        if (Number.isFinite(Number(direct))) return Number(direct);

        try {
          const id = hero.id || hero.localId;
          if (posseApi?.getTotalsForHero && id) {
            const totals = posseApi.getTotalsForHero(id);
            const t = totals?.Grit ?? totals?.grit;
            if (Number.isFinite(Number(t))) return Number(t);
          }
        } catch {
          // ignore
        }

        return 0;
      };

      // --------- Setup & table fee ---------
      hero.gold = hero.gold ?? 0;
      const startingGold = hero.gold;

      if (startingGold < 50) {
        return { log: ['Not enough gold to play Poker (need at least $50).'], actions: {} };
      }

      const availableAfterTable = startingGold - 50;

      log.push(
        `RULES SUMMARY:
• Pay $50 to sit down at the table.
• Roll 5d6 for your hand, then either place an Extra Bet of $50–$250 or Fold.
• If you place the Extra Bet, you select which dice to HOLD; unheld dice are re-rolled once.
• You may then spend 1 Grit to add another $0–$250 to your Extra Bet (if you have the gold).
• Hand type sets your Cunning Test difficulty.
• You roll a number of dice equal to your Cunning. "Anything Else" hands require 2 successes; all others require 1.
• If any Cunning dice are re-rolled, you gain +1 Unwanted Attention.
• Success → Gain D6 × $25 and double your total Extra Bet. Failure → Lose all bets.`
      );

      // Pay the $50 table cost (delta; TownTab applyActions will merge)
      actions.gold = (actions.gold ?? 0) - 50;
      log.push('You pay $50 to sit down at the Poker table.');

      // --------- Roll 5d6 for initial hand ---------
      const autoRoll = await promptYesNo(
        'AUTO-ROLL 5d6 for your Poker hand? (No = enter each die manually)',
        true
      );

      let hand = [];
      if (autoRoll) {
        hand = rollND(5, 6);
        log.push(`You auto-roll 5d6 for your hand: [${hand.join(', ')}].`);
      } else {
        log.push('Enter the results for each die of your 5d6 Poker hand (values 1–6).');
        for (let i = 1; i <= 5; i++) {
          let val = await promptNumber(`Hand die ${i} (1–6):`, 1);
          val = Math.max(1, Math.min(6, Math.floor(val || 1)));
          hand.push(val);
        }
        log.push(`Your manually-entered hand is: [${hand.join(', ')}].`);
      }

      // --------- Extra Bet or Fold ---------
      if (availableAfterTable < 50) {
        log.push(
          'You do not have at least $50 remaining after the table cost, so you cannot make an Extra Bet. You are forced to Fold, losing only your $50.'
        );
        return { log, actions };
      }

      const wantsExtra = await promptYesNo(
        `Your starting hand is [${hand.join(
          ', '
        )}]. Place an Extra Bet of $50–$250 and continue, instead of Folding (and losing just your $50 table cost)?`,
        true
      );

      if (!wantsExtra) {
        log.push('You decide to Fold and walk away from the table, losing your $50 table cost.');
        return { log, actions };
      }

      const maxExtraBet = Math.min(250, availableAfterTable);
      let extraBet = await promptNumber(
        `How much do you place as your Extra Bet on this hand? (Between $50 and $${maxExtraBet})`,
        Math.min(50, maxExtraBet)
      );
      extraBet = Math.max(50, Math.min(maxExtraBet, Math.floor(extraBet || 50)));

      actions.gold = (actions.gold ?? 0) - extraBet;
      log.push(`You push an Extra Bet of $${extraBet} into the pot.`);

      // --------- Reroll any number of hand dice (select which to HOLD) ---------
      const wantsHandReroll = await promptYesNo(
        [
          `Your current hand is [${hand.join(', ')}].`,
          '',
          'Do you want to re-roll any of these dice?',
          'You will select which dice to HOLD; all others will be re-rolled once.',
        ].join('\n'),
        false
      );

      if (wantsHandReroll) {
        const holdSet = await promptSelectPositions(
          'Select which dice to HOLD for your final Poker hand.',
          hand,
          'hold'
        );

        const newHand = [];
        const heldPositions = [];
        const rerolledPositions = [];

        for (let i = 0; i < 5; i++) {
          const pos = i + 1;
          if (holdSet.has(pos)) {
            newHand.push(hand[i]);
            heldPositions.push(pos);
          } else {
            const v = rollD6();
            newHand.push(v);
            rerolledPositions.push(pos);
          }
        }

        if (rerolledPositions.length > 0) {
          log.push(
            `You HOLD dice at positions [${heldPositions.join(
              ', '
            )}] and re-roll positions [${rerolledPositions.join(', ')}].`
          );
        } else {
          log.push('You chose to hold all dice; no re-rolls were made.');
        }

        hand = newHand;
        log.push(`After re-rolling, your final hand is: [${hand.join(', ')}].`);
      } else {
        log.push('You keep your original hand with no re-rolls.');
      }

      // --------- Optional Grit side-bet ---------
      let gritBet = 0;
      const grit = getCurrentGrit();
      const remainingGoldAfterExtra = availableAfterTable - extraBet;

      if (grit > 0 && remainingGoldAfterExtra > 0) {
        const wantsGrit = await promptYesNo(
          [
            `You currently have ${grit} Grit and $${remainingGoldAfterExtra} still available.`,
            '',
            'Spend **1 Grit** to add $0–$250 more to your Extra Bet?',
          ].join('\n'),
          false
        );
        if (wantsGrit) {
          const gritMax = Math.min(250, remainingGoldAfterExtra);
          gritBet = await promptNumber(
            `How much additional do you add using 1 Grit? (0–${gritMax})`,
            0
          );
          gritBet = Math.max(0, Math.min(gritMax, Math.floor(gritBet || 0)));

          if (gritBet > 0) {
            // Deduct 1 Grit — these are deltas; TownTab applyActions merges them
            actions.currentGrit = (actions.currentGrit ?? 0) - 1;
            actions.grit = (actions.grit ?? 0) - 1;

            actions.gold = (actions.gold ?? 0) - gritBet;
            log.push(`You spend 1 Grit and add another $${gritBet} to your Extra Bet.`);
          } else {
            log.push('You spend no extra gold with your Grit after all.');
          }
        } else {
          log.push('You hold onto your Grit for now.');
        }
      } else if (grit <= 0) {
        log.push('You have no Grit to fuel an additional side bet.');
      } else {
        log.push('You lack the extra gold to add more to your bet, even with Grit.');
      }

      // --------- Evaluate hand quality → Cunning difficulty ---------
      const sorted = [...hand].sort((a, b) => a - b);
      const counts = {};
      hand.forEach((v) => (counts[v] = (counts[v] ?? 0) + 1));

      const isSequential = sorted.slice(1).every((v, i) => v === sorted[i] + 1);
      const has4 = Object.values(counts).includes(4);
      const has3 = Object.values(counts).includes(3);
      const has2 = Object.values(counts).includes(2);
      const isFullHouse = has3 && has2;
      const is3Kind = has3 && !has2;

      let target = 6; // Cunning X+ target
      let requiredSuccesses = 1;
      let handLabel = 'Anything Else';

      if (isSequential && sorted.length === 5) {
        target = 3;
        handLabel = 'Royal Flush (5 in sequence)';
      } else if (has4) {
        target = 3;
        handLabel = 'Four of a Kind';
      } else if (isFullHouse) {
        target = 4;
        handLabel = 'Full House';
      } else if (isSequential) {
        target = 5;
        handLabel = 'Straight (4 in sequence)';
      } else if (is3Kind) {
        target = 6;
        handLabel = 'Three of a Kind';
      } else {
        target = 6;
        requiredSuccesses = 2;
        handLabel = 'Anything Else';
      }

      log.push(
        `Your final hand is evaluated as: **${handLabel}**. This sets your Cunning Test to ${target}+ with ${requiredSuccesses} required success(es).`
      );

      // --------- Cunning Test (manual/auto) ---------
      const rawCunning =
        Number(hero.Cunning ?? hero.cunning ?? hero.stats?.Cunning ?? 1) || 1;
      const cunningDice = Math.max(1, Math.floor(rawCunning));

      const autoCunning = await promptYesNo(
        `CUNNING TEST:\nYou roll ${cunningDice}d6 (your Cunning), needing ${target}+ with ${requiredSuccesses} success(es).\n\nAUTO-ROLL these dice? (No = enter each die manually)`,
        true
      );

      let cunningRolls = [];
      if (autoCunning) {
        cunningRolls = rollND(cunningDice, 6);
        log.push(
          `You auto-roll your Cunning test (${cunningDice}d6): [${cunningRolls.join(', ')}].`
        );
      } else {
        log.push(
          `Enter the results for your Cunning Test (${cunningDice}d6). You need ${target}+ with ${requiredSuccesses} success(es).`
        );
        for (let i = 1; i <= cunningDice; i++) {
          let val = await promptNumber(`Cunning die ${i} (1–6):`, 1);
          val = Math.max(1, Math.min(6, Math.floor(val || 1)));
          cunningRolls.push(val);
        }
        log.push(
          `Your manually-entered Cunning dice are: [${cunningRolls.join(', ')}].`
        );
      }

      let successCount = cunningRolls.filter((r) => r >= target).length;

      log.push(
        `Initial Cunning rolls: [${cunningRolls.join(
          ', '
        )}] → ${successCount} success(es) (you need ${requiredSuccesses}).`
      );

      // Optional Cunning re-roll → list selection, adds Unwanted Attention
      const wantsCunningReroll = await promptYesNo(
        [
          'CUNNING TEST RESULT:',
          `• Rolls: [${cunningRolls.join(', ')}]`,
          `• Successes: ${successCount} (need ${requiredSuccesses} at ${target}+)`,
          '',
          'Re-roll any of these dice? If you do, you’ll select which dice to re-roll and gain +1 Unwanted Attention.',
        ].join('\n'),
        false
      );

      if (wantsCunningReroll) {
        const rerollSet = await promptSelectPositions(
          'Select which Cunning dice to RE-ROLL (others will be kept).',
          cunningRolls,
          're-roll'
        );

        let rerolled = 0;
        const newCunning = [];
        for (let i = 0; i < cunningDice; i++) {
          const pos = i + 1;
          if (rerollSet.has(pos)) {
            const v = rollD6();
            newCunning.push(v);
            rerolled++;
          } else {
            newCunning.push(cunningRolls[i]);
          }
        }

        if (rerolled > 0) {
          actions.unwanted = (actions.unwanted ?? 0) + 1;
          cunningRolls = newCunning;
          successCount = cunningRolls.filter((r) => r >= target).length;
          log.push(
            `You re-roll ${rerolled} Cunning die/dice, gaining +1 Unwanted Attention. New Cunning dice: [${cunningRolls.join(
              ', '
            )}] → ${successCount} success(es).`
          );
        } else {
          log.push('You chose not to re-roll any of your Cunning dice after all.');
        }
      }

      const totalExtraBet = extraBet + gritBet;

      if (successCount >= requiredSuccesses) {
        const winnings = rollD6() * 25;
        const payout = winnings + totalExtraBet * 2;
        actions.gold = (actions.gold ?? 0) + payout;
        log.push(
          `🎉 SUCCESS! You win the Poker game. You gain D6 × $25 → $${winnings}, and your total Extra Bet of $${totalExtraBet} is doubled for an additional $${totalExtraBet *
            2}.`
        );
        log.push(`Total payout from this hand: **$${payout}**.`);
      } else {
        log.push(
          `❌ FAILURE. You do not meet the Cunning requirement and lose the Poker game, along with your Extra Bet${
            totalExtraBet ? ` of $${totalExtraBet}` : ''
          }.`
        );
      }

      return { log, actions };
    },
  },

  // ===============================
  // 🎲 BRIMSTONE CRAPS — PLAY
  // ===============================
  {
    id: 'gh_craps_play',
    type: 'service',
    name: 'Brimstone Craps',
    cost: { gold: 100 },
    tags: ['Entertainment', 'Gambling'],
    description: 'Gambling • Limit Once per Visit',
    effects: [
      'Pay $100 to roll your luck at Brimstone Craps.',
      'Make a Luck 5+ test using your full Luck value (number of dice = Luck).',
      'For each die that rolls 5 or 6, gain $100.',
      'If you roll no 5+ results, you lose your $100 stake.',
    ],
    async exec(hero, posseApi, uiApi) {
      const log = [];
      const actions = {};

      const promptYesNo = async (message, def = true) =>
        (await uiApi.promptYesNo?.({ message, defaultValue: def })) ?? def;

      const promptNumber = async (message, def = 1) =>
        (await uiApi.promptNumber?.({
          message,
          min: 1,
          max: 6,
          defaultValue: def,
        })) ?? def;

      log.push(
        `RULES SUMMARY:
• Pay $100 to play Brimstone Craps.
• Make a Luck 5+ test using a number of dice equal to your Luck.
• You gain $100 for each die that rolls 5 or 6.
• If you roll no 5+ results, you lose your $100 buy-in.`
      );

      if ((hero.gold ?? 0) < 100) {
        return { log: ['Not enough gold to play Brimstone Craps (need $100).'], actions };
      }

      // Pay the stake (delta; TownTab will merge onto hero.gold)
      actions.gold = (actions.gold ?? 0) - 100;
      log.push('You slide $100 across the table to place your bet at the Craps table.');

      // How many dice? Luck test → #dice = Luck
      const rawLuck =
        Number(hero.Luck ?? hero.luck ?? hero.stats?.Luck ?? hero.derived?.Luck ?? 1) || 1;
      const luckDice = Math.max(1, Math.floor(rawLuck));

      const auto = await promptYesNo(
        `BRIMSTONE CRAPS\nYou roll ${luckDice}d6 (Luck ${rawLuck}), each 5+ is a success worth $100.\n\nAUTO-ROLL these dice? (No = enter each die manually)`,
        true
      );

      let rolls = [];
      if (auto) {
        rolls = rollND(luckDice, 6);
        log.push(
          `You auto-roll your Luck test (${luckDice}d6): [${rolls.join(', ')}].`
        );
      } else {
        log.push(
          `Enter the results for your Luck Test (${luckDice}d6). Each 5+ will earn you $100.`
        );
        for (let i = 1; i <= luckDice; i++) {
          let v = await promptNumber(`Luck die ${i} (1–6):`, 1);
          v = Math.max(1, Math.min(6, Math.floor(v || 1)));
          rolls.push(v);
        }
        log.push(`Your manually-entered Luck dice are: [${rolls.join(', ')}].`);
      }

      const successes = rolls.filter((r) => r >= 5).length;

      log.push(
        `Your Luck dice show: [${rolls.join(', ')}]. That gives you ${successes} success(es) at 5+.`
      );

      if (successes === 0) {
        log.push('❌ No dice come up 5 or 6. You lose your $100 stake and leave the table empty-handed.');
      } else {
        const payout = successes * 100;
        actions.gold = (actions.gold ?? 0) + payout;
        log.push(
          `🎉 You have ${successes} success(es), winning **$${payout}** from the house!`
        );
      }

      return { log, actions };
    },
  },

  // ===============================
  // 🎡 THE DEVIL’S WHEEL — PLAY
  // ===============================
  {
    id: 'gh_wheel_play',
    type: 'service',
    name: "The Devil's Wheel",
    cost: { gold: 25 },
    tags: ['Entertainment', 'Gambling'],
    description: 'Gambling • Limit Three Times per Visit',
    effects: [
      'Pay $25 to spin the Devil’s Wheel.',
      'Set up and play The Devil’s Wheel mini-game as detailed in the Rulebook.',
      'After resolving the mini-game, total your points and consult this Reward Table:',
      '• 0–9   → No Reward',
      '• 10–12 → $50',
      '• 13–17 → $100',
      '• 18–24 → $250',
      '• 25–30 → $500',
      '• 31–35 → $1,000',
      '• 36    → $5,000',
      'Any time an Artifact is collected from The Devil’s Wheel, it also triggers a jackpot, giving D6 × $25 to each other Hero currently at the Gambling Hall.',
    ],
    async exec(hero, posseApi, uiApi) {
      const log = [];
      const actions = {};

      const promptNumber = async (message, def = 0) =>
        (await uiApi.promptNumber?.({
          message,
          min: 0,
          max: 36,
          defaultValue: def,
        })) ?? def;

      const promptYesNo = async (message, def = false) =>
        (await uiApi.promptYesNo?.({ message, defaultValue: def })) ?? def;

      log.push(
        `RULES SUMMARY:
• Pay $25 to spin the Devil’s Wheel.
• Set up and play The Devil’s Wheel mini-game exactly as described in the Rulebook.
• When finished, total your points and compare to the Reward Table:
  0–9  → No Reward
  10–12 → $50
  13–17 → $100
  18–24 → $250
  25–30 → $500
  31–35 → $1,000
  36    → $5,000
• If you also collect an Artifact from The Devil’s Wheel, every other Hero at the Gambling Hall gains D6 × $25.`
      );

      if ((hero.gold ?? 0) < 25) {
        return { log: ['Not enough gold to spin the Devil’s Wheel (need $25).'], actions: {} };
      }

      // Pay the spin cost (delta)
      actions.gold = (actions.gold ?? 0) - 25;
      log.push('You place $25 on the table as the croupier sends the Devil’s Wheel spinning.');

      // Manual: player resolves the mini-game using the Rulebook, then enters total points
      let total = await promptNumber(
        'Enter your final Total Points from The Devil’s Wheel mini-game (0–36):',
        0
      );
      total = Math.max(0, Math.min(36, Math.floor(total || 0)));

      log.push(`Your final Devil’s Wheel total is **${total}**.`);

      let reward = 0;

      if (total <= 9) reward = 0;
      else if (total <= 12) reward = 50;
      else if (total <= 17) reward = 100;
      else if (total <= 24) reward = 250;
      else if (total <= 30) reward = 500;
      else if (total <= 35) reward = 1000;
      else if (total === 36) reward = 5000;

      if (reward > 0) {
        actions.gold = (actions.gold ?? 0) + reward;
        log.push(`🎉 The Wheel rewards you with **$${reward}** based on your score of ${total}.`);
      } else {
        log.push('The Devil’s Wheel offers you nothing this time… no reward.');
      }

      // Optional Artifact jackpot hook (manual confirmation)
      const gotArtifact = await promptYesNo(
        'Did you also collect an Artifact from The Devil’s Wheel on this spin? (Check the Rulebook result.)',
        false
      );

      if (gotArtifact) {
        const d = rollD6();
        const jackpot = d * 25;
        log.push(
          `Artifact collected! Rolling D6 × $25 for the jackpot → rolled ${d}, so each other Hero at the Gambling Hall gains **$${jackpot}**.`
        );

        // Give jackpot to other heroes at this location, if your posseApi supports it
        const meId = hero.id || hero.localId;
        const atHall = posseApi?.getHeroesAtShop?.('gamblingHall') || [];
        for (const hid of atHall) {
          if (!hid || hid === meId) continue;
          if (posseApi.queueHeroGold) {
            posseApi.queueHeroGold(hid, jackpot);
          }
        }
      }

      return { log, actions };
    },
  },
];
