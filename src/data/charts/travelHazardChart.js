// src/data/charts/travelHazardChart.js
// Frontier Travel Hazard Chart — D36 (36 entries, 11–66)
// Used when traveling between missions in Frontier Town settings.
// Roll D36 (D6×10 + D6) once per travel hazard rolled during the Travel Phase.

export const travelHazardChart = [
  {
    roll: 11,
    name: 'Bandit Ambush',
    flavor: "Riders crest the ridge, guns already blazing.",
    effect: "Each Hero takes 2 Wounds, ignoring Defense. Each Hero also loses D6×$10 Gold (minimum $0).",
  },
  {
    roll: 12,
    name: 'Rattlesnake Strike',
    flavor: "A coiled diamondback strikes without warning from the tall grass.",
    effect: "Each Hero must make an Agility 5+ test. If failed, take 1 Wound ignoring Defense and gain a Poison Marker. At the end of each turn, a Hero with a Poison Marker takes 1 Wound ignoring Defense until healed (spend 1 Grit to remove).",
  },
  {
    roll: 13,
    name: 'Dust Storm',
    flavor: "A wall of red dust rolls across the plains, blotting out the sun for hours.",
    effect: "Each Hero loses D3 Grit from the exhausting conditions. Heroes with 0 Grit after this loss take 1 Wound ignoring Defense instead.",
  },
  {
    roll: 14,
    name: 'Flash Flood',
    flavor: "Storm water surges down a dry canyon with terrifying speed.",
    effect: "Each Hero must make a Strength 4+ test. If failed, take D3 Wounds ignoring Defense and lose all Side Bag Tokens from one randomly chosen Side Bag slot.",
  },
  {
    roll: 15,
    name: 'Dark Stone Vein',
    flavor: "The trail cuts through a ridge thick with glittering dark purple ore.",
    effect: "Each Hero may collect 1 Dark Stone. However, each Hero within range takes 1 Corruption Hit (Willpower save applies).",
  },
  {
    roll: 16,
    name: 'Wanted Poster',
    flavor: "Nailed to every fence post and barn door — that face looks awfully familiar.",
    effect: "Roll D6. On 1–2, a Hero with the Outlaw keyword (or the Hero with most Gold if none) must pay $50 or take D3 Wounds. On 3–6, nothing happens.",
  },
  {
    roll: 21,
    name: 'Broken Wheel',
    flavor: "A spoke cracks, then another — the cart lurches and the supplies go everywhere.",
    effect: "The Posse loses 1 Travel Day. Each Hero loses 1 Side Bag Token of their choice (if they have any).",
  },
  {
    roll: 22,
    name: 'Coyote Pack',
    flavor: "Howling fills the night and the animals circle closer, eyes reflecting firelight.",
    effect: "Each Hero must make a Luck 4+ test. If failed, take D3 Wounds as the coyotes scatter gear and bite at heels. Each failed Hero also loses D6×$10 Gold.",
  },
  {
    roll: 23,
    name: 'Fever Sweats',
    flavor: "Someone picked up something nasty at the last watering hole.",
    effect: "Each Hero must make a Spirit 5+ test. If failed, the Hero starts the next Adventure with D3 Wounds already suffered (cannot be healed before the mission begins).",
  },
  {
    roll: 24,
    name: 'Unmarked Graves',
    flavor: "A field of weathered wooden crosses stretches to the horizon. No names. No dates.",
    effect: "Each Hero takes 2 Horror Hits (Willpower save applies). On a Willpower success, gain 5 XP instead.",
  },
  {
    roll: 25,
    name: 'Crow Flock',
    flavor: "Thousands of black wings descend in a shrieking mass, drawn by the dark stone you carry.",
    effect: "Each Hero carrying 1 or more Dark Stone takes D3 Corruption Hits (Willpower save applies per hit). Heroes carrying no Dark Stone are unaffected.",
  },
  {
    roll: 26,
    name: 'Scorching Heat',
    flavor: "The sun beats down without mercy and the canteens run dry by midday.",
    effect: "Each Hero loses 2 Grit. Each Hero with 0 Grit after this loss takes 1 Wound ignoring Defense.",
  },
  {
    roll: 31,
    name: 'Friendly Trader',
    flavor: "A merchant's wagon creaks to a halt alongside you, the driver grinning under a battered hat.",
    effect: "Each Hero may immediately purchase 1 item from the General Store at normal cost (DM draws 3 random Gear Cards; each player chooses one to buy or passes).",
  },
  {
    roll: 32,
    name: 'Hidden Cache',
    flavor: "Beneath a flat rock marked with an X scratched in charcoal, someone left something behind.",
    effect: "Roll D6. On 1–3: find D6×$25 Gold split evenly among the Posse. On 4–5: find 1 random Gear Card. On 6: find 1 Mine Artifact.",
  },
  {
    roll: 33,
    name: 'Traveling Preacher',
    flavor: "A dust-caked circuit rider offers words of comfort and his last strip of dried beef.",
    effect: "One Hero of your choice may Heal D6 Wounds or D6 Sanity Damage (their choice). The whole Posse gains 5 XP each.",
  },
  {
    roll: 34,
    name: 'Clear Skies',
    flavor: "The trail opens onto a long flat plain under a brilliant blue sky. No trouble today.",
    effect: "No harmful effect. Each Hero recovers 1 Grit.",
  },
  {
    roll: 35,
    name: 'Roadside Spring',
    flavor: "Cold clean water bubbles up through dark stone, tasting faintly of minerals.",
    effect: "Each Hero Heals D3 Wounds. Each Hero also takes 1 Corruption Hit from the tainted water (Willpower save applies).",
  },
  {
    roll: 36,
    name: 'Cattle Drive',
    flavor: "A thousand longhorns and the cowboys driving them block the road for hours.",
    effect: "The Posse loses 1 Travel Day. However, the drovers share their camp and food — each Hero Heals 1 Wound and recovers 1 Grit.",
  },
  {
    roll: 41,
    name: 'Outlaws on the Run',
    flavor: "A gang of riders tears past at full gallop, shooting indiscriminately behind them.",
    effect: "Each Hero makes a Luck 4+ test. If failed, take D3 Wounds ignoring Defense from stray shots. On a natural 6, find $50 dropped by the fleeing outlaws.",
  },
  {
    roll: 42,
    name: 'Sinkhole',
    flavor: "The ground gives way without warning and someone goes down hard.",
    effect: "One random Hero falls in: take D3 Wounds ignoring Defense. Roll D6 for each equipped Gear item — on a 1, that item is lost in the hole.",
  },
  {
    roll: 43,
    name: 'Dark Stone Tremors',
    flavor: "The earth shakes and cracks open in a line of glowing purple fissures.",
    effect: "Each Hero takes 1 Corruption Hit (Willpower save applies) and must make a Strength 4+ test or take D3 Wounds ignoring Defense as debris falls.",
  },
  {
    roll: 44,
    name: 'Haunted Crossroads',
    flavor: "At a lonely crossroads a figure waits — and it is not alive.",
    effect: "Each Hero takes D3 Horror Hits (Willpower save applies per hit). Any Hero who fails all their saves also rolls once on the Madness Chart at the end of the Travel Phase.",
  },
  {
    roll: 45,
    name: 'Bounty Hunters',
    flavor: "Apparently someone has a price on their head.",
    effect: "Each Hero takes D3 Wounds ignoring Armor. If the Posse includes any Hero with the Outlaw keyword, that Hero additionally loses $100 Gold (minimum $0) as the hunters collect their fee.",
  },
  {
    roll: 46,
    name: 'Mine Collapse',
    flavor: "A nearby shaft gives out in a roar of dust and splintered timber.",
    effect: "Each Hero makes an Agility 4+ test. If failed, take D6 Wounds ignoring Defense. Each Hero takes 2 Corruption Hits from the dark stone dust cloud (Willpower save applies per hit).",
  },
  {
    roll: 51,
    name: 'Wild Mustangs',
    flavor: "A free-running herd thunders across the trail and through the camp.",
    effect: "Each Hero makes a Strength 4+ test. If failed, take D3 Wounds as they are knocked aside. Each Hero that succeeds may roll D6 — on 5+ they wrangle a horse worth $50 (gain a Side Bag Token).",
  },
  {
    roll: 52,
    name: 'Tainted Campfire',
    flavor: "The wood burns with an eerie purple flame — someone threw dark stone on the fire.",
    effect: "Each Hero takes D3 Corruption Hits (Willpower save applies per hit). Any Hero who fails at least 1 save also Heals D3 Wounds as the unnatural energy courses through them.",
  },
  {
    roll: 53,
    name: 'Thunder Run',
    flavor: "A storm rolls in fast, thunder shaking the ground, lightning splitting trees all around you.",
    effect: "Each Hero must make a Luck 5+ test. If failed, take D3 Wounds ignoring Defense. All Heroes lose 1 Grit from the harrowing experience.",
  },
  {
    roll: 54,
    name: 'Mysterious Stranger',
    flavor: "A figure in black sits by a fire off the trail, offering nothing but a knowing smile.",
    effect: "One Hero of your choice must make a Spirit 4+ test. If passed, the stranger provides useful information — the Posse gains 20 XP and the DM reveals the threat tier for the next Adventure. If failed, that Hero takes D3 Horror Hits.",
  },
  {
    roll: 55,
    name: 'Easy Riding',
    flavor: "The trail is wide, the weather is fair, and for once nothing goes wrong.",
    effect: "No harmful effect. The Posse may choose one of: each Hero gains 10 XP, OR the Posse gains 1 extra Travel Day.",
  },
  {
    roll: 56,
    name: 'Shallow Graves',
    flavor: "Boot Hill on the open plain — dozens of fresh mounds with no markers.",
    effect: "Each Hero takes 1 Horror Hit (Willpower save applies). Each Hero rolls D6 — on 6, they find a piece of Gear from one of the dead (draw 1 random Gear Card).",
  },
  {
    roll: 61,
    name: 'Runaway Mine Cart',
    flavor: "A driverless ore cart crashes through the camp, scattering everything.",
    effect: "Each Hero makes an Agility 4+ test. If failed, take D3 Wounds ignoring Defense. Each failed Hero also loses 1 randomly chosen Side Bag Token (roll D6 — on 4+ it is recovered).",
  },
  {
    roll: 62,
    name: 'Drifter Camp',
    flavor: "A handful of weathered men share their camp and their stories.",
    effect: "The Posse rests in safety. Each Hero Heals D3 Wounds and recovers 1 Grit. One Hero of your choice gains 10 XP from tales of the frontier.",
  },
  {
    roll: 63,
    name: 'Lost Trail',
    flavor: "The map is wrong, the stars are hidden, and no one agrees on which direction is north.",
    effect: "The Posse loses 1 Travel Day. Each Hero makes a Luck 4+ test — if failed, lose 1 Side Bag Token of your choice.",
  },
  {
    roll: 64,
    name: 'Corrupt Sheriff',
    flavor: "A badge doesn't make a man honest.",
    effect: "A corrupt lawman demands a 'tax.' The Posse must collectively pay $100 or each Hero takes D3 Wounds from the lawman's deputies. Heroes with the Law keyword reduce this cost to $50.",
  },
  {
    roll: 65,
    name: 'Brimstone Shrine',
    flavor: "Someone has been worshipping here. The dark stone idol pulses with sickly light.",
    effect: "Each Hero takes D3 Corruption Hits (Willpower save applies per hit). Any Hero who fails 2 or more saves also gains 1 random Mutation — roll D36 on the Mutation Chart.",
  },
  {
    roll: 66,
    name: 'Good Fortune',
    flavor: "The trail is kind, and luck rides with you today.",
    effect: "Each Hero recovers all Grit to their Max Grit and Heals D3 Wounds. The Posse gains 1 extra Travel Day.",
  },
];

export default travelHazardChart;
