// src/data/townLocations/streetMarket.js
export default {
  id: 'street_market',
  name: 'Street Market',
  type: 'Shop',
  description:
    'Crowded alleys of stalls and shady merchants selling potions, spices, and stranger things.',

  events: [
    {
      roll: 2,
      name: 'Blood Sacrifice',
      effect:
        'Choose: back out and end your current day in Town, or make a Spirit 6+ test. Pass: gain 25 XP and D6×$50. Fail: your current day ends and you must roll once on the Madness chart.',
      lore:
        'You stumble into a shed where a bloody occult ritual is underway, and the cultists are not happy to see you.',
    },
    {
      roll: 3,
      name: 'Swamp Slug Stampede',
      effect:
        'Every Hero in the Street Market must pass a Lore 5+ or Strength 6+ test or be trampled and roll once on the Injury chart. The Street Market is destroyed for the rest of this Town Stay.',
      lore:
        'A herd of slime-covered swamp slugs crashes through the stalls, flattening everything in their path.',
    },
    {
      roll: 4,
      name: 'Held Up',
      effect:
        'Either pay the robbers D6×$100 OR D6 Dark Stone, or roll 2D6: if the total is ≤ your Initiative, gain 50 XP; otherwise take 2D6 Wounds, ignoring Defense.',
      lore:
        'Two armed gunmen block the alley, demanding all you’ve got or a fight for your life.',
    },
    {
      roll: 5,
      name: 'Market Prices Up',
      effect: 'All prices at the Street Market today are +$50 more than normal.',
      lore:
        'Supplies are tight and every merchant seems to have the same story about why prices just went up.',
    },
    {
      roll: 6,
      name: 'Hogs and Horse Thieves',
      effect: 'No Event.',
      lore:
        'The back alleys reek of livestock and crime, but nothing out of the ordinary happens… for here.',
    },
    {
      roll: 7,
      name: 'Hogs and Horse Thieves',
      effect: 'No Event.',
      lore:
        'The back alleys reek of livestock and crime, but nothing out of the ordinary happens… for here.',
    },
    {
      roll: 8,
      name: 'Hogs and Horse Thieves',
      effect: 'No Event.',
      lore:
        'The back alleys reek of livestock and crime, but nothing out of the ordinary happens… for here.',
    },
    {
      roll: 9,
      name: 'Market Prices Down',
      effect:
        'All prices at the Street Market today are –$50 (to a minimum of $25).',
      lore:
        'Everyone is eager to deal, and even the tight-fisted merchants are lowering their prices.',
    },
    {
      roll: 10,
      name: 'Fortune Teller',
      effect:
        'Choose one path for your next Adventure: Glory – you may re-roll one Defense roll each turn; or Fortune – you start at half Max Health but gain a personal Revive Token. If you still have that token at the end of the Adventure, gain D6×$100 and D6×50 XP.',
      lore:
        'A fortune teller reads your future in cards and bones, offering either glory or risky riches.',
    },
    {
      roll: 11,
      name: 'Lucky Streak',
      effect:
        'When Street Gambling today, after all re-rolls you may add or subtract 1 from one die. Also, Recover 1 Grit.',
      lore:
        'Tonight luck seems to cling to you like a second skin, especially at the gambling tables.',
    },
    {
      roll: 12,
      name: 'Rare Deal',
      effect:
        'Draw a World card, then draw an Artifact from that World. You may buy that Artifact for half its listed price (round up to the nearest $5). If there is no price listed, re-draw.',
      lore:
        'Something rare and wonderful catches your eye on the highest shelf of a market stall.',
    },
  ],
};
