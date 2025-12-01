// src/data/townLocations/sheriffsOffice.js
export default {
  id: 'sheriffs_office',
  name: "Sheriff's Office",
  type: 'Shop',
  description:
    'Seat of law in town. Outlaw Heroes may not visit the Sheriff’s Office, except to use Pay Off Your Warrants.',

  events: [
    {
      roll: 2,
      name: 'Jailbreak',
      effect:
        'For all Heroes, the current Town Stay ends at the end of this day (still roll for Town Event). The next Adventure is the Town Adventure “Jailbreak”, unless all Heroes agree to flee town before the trouble starts (beginning that Adventure with no Grit).',
      lore:
        'A band of outlaws storms the jail to free their friend, and bullets start flying through the streets.',
    },
    {
      roll: 3,
      name: 'Corrupt Sheriff',
      effect:
        'Each Law Hero here must either Flee Town immediately or challenge the sheriff: make a Spirit 5+ test. Pass: gain 50 XP and D6×$50 and the sheriff is driven out. Fail: he guns you down; roll once on the Injury chart. If no Law Hero defeats him, all Heroes in Town are considered Wanted! for the rest of this Town Stay.',
      lore:
        'The sheriff has gone bad, shaking down citizens and abusing his badge for profit.',
    },
    {
      roll: 4,
      name: 'Insane Ramblings',
      effect:
        'Take 2D6 Horror Hits. If the roll is doubles, also move the Darkness marker 2 spaces forward on the Town Event Track.',
      lore:
        'A prisoner babbles about the Void and the insignificance of mankind, and the madness seeps into your mind.',
    },
    {
      roll: 5,
      name: 'Cold, Hard Justice',
      effect: 'No Event.',
      lore:
        'The cells rattle, the lawmen pace, and justice marches on with grim efficiency.',
    },
    {
      roll: 6,
      name: 'Cold, Hard Justice',
      effect: 'No Event.',
      lore:
        'The cells rattle, the lawmen pace, and justice marches on with grim efficiency.',
    },
    {
      roll: 7,
      name: 'Cold, Hard Justice',
      effect: 'No Event.',
      lore:
        'The cells rattle, the lawmen pace, and justice marches on with grim efficiency.',
    },
    {
      roll: 8,
      name: 'Cold, Hard Justice',
      effect: 'No Event.',
      lore:
        'The cells rattle, the lawmen pace, and justice marches on with grim efficiency.',
    },
    {
      roll: 9,
      name: 'Telegraph',
      effect:
        'You may Recover 1 Grit and Heal up to D6 Wounds and/or Sanity (any mix).',
      lore:
        'An urgent wire brings news of a looming Void storm, stiffening your resolve for what’s ahead.',
    },
    {
      roll: 10,
      name: 'Telegraph',
      effect:
        'You may Recover 1 Grit and Heal up to D6 Wounds and/or Sanity (any mix).',
      lore:
        'An urgent wire brings news of a looming Void storm, stiffening your resolve for what’s ahead.',
    },
    {
      roll: 11,
      name: '“We need Six Men!”',
      effect:
        'Every Hero here that is not Law or Holy immediately gains the Become Deputized bonus for free. Any Hero that Joins a Manhunt today gains double XP and Gold from it.',
      lore:
        'The sheriff calls for volunteers to ride out and deal with a new threat on the horizon.',
    },
    {
      roll: 12,
      name: 'Legendary Outlaw',
      effect:
        "If you Escort a Prisoner today, it requires a Lore 6+ test instead of the normal roll, but you gain D8×$100 instead of the usual reward if successful.",
      lore:
        'A notorious outlaw named “Sparky” waits in a cell, hinting at a very profitable transfer if you can keep him alive.',
    },
  ],
};
