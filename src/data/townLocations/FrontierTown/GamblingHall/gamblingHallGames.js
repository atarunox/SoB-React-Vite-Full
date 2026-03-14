// src/data/townLocations/gamblingHallGames.js
// Entertainment: Poker, Craps, Devil\'s Wheel

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
      'Pay $50 → 5d6 are rolled for your hand.',
      'Bet $50–$250 or Fold. Then select dice to HOLD (others re-rolled once).',
      'Optionally spend 1 Grit to increase your bet.',
      'Hand quality sets Cunning Test difficulty. Failed? You can re-roll for +1 Unwanted Attention.',
      'Pass → D6 × $25 + double your bet. Fail → lose all bets.',
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
            value: String(idx + 1),
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
              set.add(n);
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

      // Pay the $50 table cost
      actions.gold = (actions.gold ?? 0) - 50;

      // --------- Roll 5d6 for initial hand (auto-roll) ---------
      let hand = rollND(5, 6);
      log.push(`You pay $50 and are dealt your hand: [${hand.join(', ')}]`);

      // --------- Extra Bet or Fold (single prompt) ---------
      if (availableAfterTable < 50) {
        log.push(
          'You don\'t have enough gold remaining for an Extra Bet. You fold, losing your $50.'
        );
        return { log, actions };
      }

      const maxExtraBet = Math.min(250, availableAfterTable);
      const betOptions = [];
      for (let amt = 50; amt <= maxExtraBet; amt += 50) {
        betOptions.push({ label: `Bet $${amt}` });
      }
      betOptions.push({ label: 'Fold (lose $50)' });

      const betChoice = uiApi.promptChoice
        ? await uiApi.promptChoice(
            `Your hand: [${hand.join(', ')}]\nPlace your Extra Bet or Fold?`,
            betOptions
          )
        : 0;

      const foldIndex = betOptions.length - 1;
      if (betChoice === foldIndex || betChoice === undefined || betChoice === null) {
        log.push('You fold and walk away, losing your $50 table cost.');
        return { log, actions };
      }

      let extraBet = (betChoice + 1) * 50;
      extraBet = Math.min(extraBet, maxExtraBet);
      actions.gold = (actions.gold ?? 0) - extraBet;
      log.push(`You push $${extraBet} into the pot as your Extra Bet.`);

      // --------- Reroll: go straight to dice selector ---------
      // Selecting all dice = keep hand as-is (no separate yes/no prompt)
      const holdSet = await promptSelectPositions(
        `Hand: [${hand.join(', ')}]\nSelect dice to HOLD. Unselected dice are re-rolled once.\nSelect ALL to keep your hand as-is.`,
        hand,
        'hold'
      );

      // If they selected nothing, treat as holding all (no reroll)
      const holdAll = holdSet.size === 0 || holdSet.size === 5;
      if (!holdAll) {
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

        log.push(
          `Held [${heldPositions.join(', ')}], re-rolled [${rerolledPositions.join(', ')}].`
        );
        hand = newHand;
        log.push(`New hand: [${hand.join(', ')}]`);
      } else {
        log.push('You keep your hand with no re-rolls.');
      }

      // --------- Optional Grit side-bet (single prompt) ---------
      let gritBet = 0;
      const grit = getCurrentGrit();
      const remainingGoldAfterExtra = availableAfterTable - extraBet;

      if (grit > 0 && remainingGoldAfterExtra > 0) {
        const gritMax = Math.min(250, remainingGoldAfterExtra);
        gritBet = await promptNumber(
          `You have ${grit} Grit and $${remainingGoldAfterExtra} remaining.\nSpend 1 Grit to add to your bet? Enter amount ($0 to skip, max $${gritMax}):`,
          0
        );
        gritBet = Math.max(0, Math.min(gritMax, Math.floor(gritBet || 0)));

        if (gritBet > 0) {
          actions.currentGrit = (actions.currentGrit ?? 0) - 1;
          actions.grit = (actions.grit ?? 0) - 1;
          actions.gold = (actions.gold ?? 0) - gritBet;
          log.push(`You spend 1 Grit and add $${gritBet} to your bet.`);
        }
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

      let target = 6;
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
        `Hand: **${handLabel}** → Cunning ${target}+ (${requiredSuccesses} success needed)`
      );

      // --------- Cunning Test (auto-roll) ---------
      const rawCunning =
        Number(hero.Cunning ?? hero.cunning ?? hero.stats?.Cunning ?? 1) || 1;
      const cunningDice = Math.max(1, Math.floor(rawCunning));

      let cunningRolls = rollND(cunningDice, 6);
      let successCount = cunningRolls.filter((r) => r >= target).length;

      log.push(
        `Cunning Test (${cunningDice}d6): [${cunningRolls.join(', ')}] → ${successCount} success(es)`
      );

      // Offer Cunning re-roll only if they didn't already pass
      if (successCount < requiredSuccesses) {
        const rerollSet = await promptSelectPositions(
          [
            `Cunning: [${cunningRolls.join(', ')}] — ${successCount}/${requiredSuccesses} successes (need ${target}+)`,
            'Select dice to RE-ROLL for +1 Unwanted Attention.',
            'Select NONE to accept the result.',
          ].join('\n'),
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
            `Re-rolled ${rerolled} die/dice (+1 Unwanted Attention): [${cunningRolls.join(', ')}] → ${successCount} success(es)`
          );
        }
      }

      // --------- Resolution ---------
      const totalExtraBet = extraBet + gritBet;

      if (successCount >= requiredSuccesses) {
        const winnings = rollD6() * 25;
        const payout = winnings + totalExtraBet * 2;
        actions.gold = (actions.gold ?? 0) + payout;
        log.push(
          `SUCCESS! D6 x $25 = $${winnings} + doubled bet $${totalExtraBet * 2} = **$${payout} payout**`
        );
      } else {
        log.push(
          `FAILURE. You lose the hand and your $${totalExtraBet} bet.`
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
  // 🎡 THE DEVIL'S WHEEL — PLAY
  // ===============================
  {
    id: 'gh_wheel_play',
    type: 'service',
    name: "The Devil's Wheel",
    cost: { gold: 25 },
    tags: ['Entertainment', 'Gambling'],
    description: 'Gambling • Limit Three Times per Visit',
    effects: [
      'Pay $25 to spin the Devil\'s Wheel.',
      'Set up and play The Devil\'s Wheel mini-game as detailed in the Rulebook.',
      'After resolving the mini-game, total your points and consult this Reward Table:',
      '• 0–9   → No Reward',
      '• 10–12 → $50',
      '• 13–17 → $100',
      '• 18–24 → $250',
      '• 25–30 → $500',
      '• 31–35 → $1,000',
      '• 36    → $5,000',
      'Any time an Artifact is collected from The Devil\'s Wheel, it also triggers a jackpot, giving D6 × $25 to each other Hero currently at the Gambling Hall.',
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
• Pay $25 to spin the Devil\'s Wheel.
• Set up and play The Devil\'s Wheel mini-game exactly as described in the Rulebook.
• When finished, total your points and compare to the Reward Table:
  0–9  → No Reward
  10–12 → $50
  13–17 → $100
  18–24 → $250
  25–30 → $500
  31–35 → $1,000
  36    → $5,000
• If you also collect an Artifact from The Devil\'s Wheel, every other Hero at the Gambling Hall gains D6 × $25.`
      );

      if ((hero.gold ?? 0) < 25) {
        return { log: ['Not enough gold to spin the Devil\'s Wheel (need $25).'], actions: {} };
      }

      // Pay the spin cost (delta)
      actions.gold = (actions.gold ?? 0) - 25;
      log.push('You place $25 on the table as the croupier sends the Devil\'s Wheel spinning.');

      // Manual: player resolves the mini-game using the Rulebook, then enters total points
      let total = await promptNumber(
        'Enter your final Total Points from The Devil\'s Wheel mini-game (0–36):',
        0
      );
      total = Math.max(0, Math.min(36, Math.floor(total || 0)));

      log.push(`Your final Devil\'s Wheel total is **${total}**.`);

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
        log.push('The Devil\'s Wheel offers you nothing this time… no reward.');
      }

      // Optional Artifact jackpot hook (manual confirmation)
      const gotArtifact = await promptYesNo(
        'Did you also collect an Artifact from The Devil\'s Wheel on this spin? (Check the Rulebook result.)',
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
