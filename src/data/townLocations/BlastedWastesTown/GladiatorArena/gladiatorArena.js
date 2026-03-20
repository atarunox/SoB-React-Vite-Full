// src/data/townLocations/BlastedWastesTown/GladiatorArena/gladiatorArena.js

export default {
  id: 'gladiatorArena',
  name: 'Gladiator Arena',
  town: 'BlastedWastesTown',
  type: 'Shop',
  description:
    'A blood-soaked arena of sport where crowds roar for violence and gold changes hands on every fight.',

  events: [
    {
      roll: 2,
      name: 'Warden Raid',
      lore:
        'Without warning, explosions tear through the arena walls and three Mk IV Warden robots burst in, blasting away at the crowds and mechanically announcing in an alien tongue what must be orders to disperse.',
      effect:
        'Make a Cunning 6+ test to escape from the ruthless kill bots. If successful, gain 15 XP. If failed, you are struck by one of their shock prods, taking D8 Wounds, ignoring Defense. Either way, the Gladiator Arena is shut down (destroyed) for the rest of this Town Stay.',
    },
    {
      roll: 3,
      name: 'Pulled From the Crowd',
      lore:
        'Singled out by a local warlord that is viewing the fights from his personal box, you are dragged out of the stands and thrown onto the arena floor. Now you must fight... or die.',
      effect:
        'You must immediately resolve a Fight in the Arena, even if you have already done so this Town Stay.',
    },
    {
      roll: 4,
      name: 'Wounded Trainer',
      lore:
        'It looks like the veteran trainer here has seen better days, what with his one arm and no legs.',
      effect:
        'All rolls to Train with an Arena Veteran today are -1 to the result.',
    },
    {
      roll: 5,
      name: 'Fight in the Stands',
      lore:
        'A nasty fight breaks out in the stands as rival fans go crazy!',
      effect:
        'Make a Strength 5+ test to push your way through to safety. If failed, take D6 Wounds, ignoring Defense, from the bumps and bruises.',
    },
    {
      roll: 6,
      name: 'Low Attendance',
      lore:
        'The stands are nearly empty and the fighters here seem beaten down.',
      effect:
        'The Bet on a Match event is Limit Once for this Location Visit.',
    },
    {
      roll: 7,
      name: 'Blood and Sand',
      lore:
        'The cheering crowd and mindless violence make you forget about the dreary desert wasteland outside these walls.',
      effect: 'No Effect.',
    },
    {
      roll: 8,
      name: 'Carnage',
      lore:
        'The pit fighters are using more deadly weapons than normal.',
      effect:
        'During any Bet on a Match event, if two or more 3s are rolled, the fighters tear each other apart! All bets are lost, but you may Recover a Grit.',
    },
    {
      roll: 9,
      name: 'Roaring Crowd',
      lore:
        'Your heart thumps in your chest as the roar of the crowd electrifies the room.',
      effect: 'You may Recover a Grit.',
    },
    {
      roll: 10,
      name: 'Singing and Chanting',
      lore:
        'The crowd is extra wild tonight, and they are chanting the names of their favorite competitors.',
      effect:
        'During any Fight in the Arena today, a Hero may ignore the first Injury roll they would have to make.',
    },
    {
      roll: 11,
      name: 'Black Smoke and Spinning Wheels',
      lore:
        'Crude vehicles have been constructed from the wreckage and scraps in the desert wastes, and are now used to battle on the arena floor!',
      effect:
        'Roll an extra 3 dice for all Bet on a Match events today. Heroes gain an extra $50 for every 6 (or 1) rolled by their chosen fighter during the Match, if their side wins. Also, any Hero participating in a Fight in the Arena must use Luck as one of their 3 chosen Skills.',
    },
    {
      roll: 12,
      name: 'Expert Trainer',
      lore:
        "Renowned veteran Kor'talay the Krusher is at the arena today, giving tips and tricks on how he has survived this long in the pits.",
      effect:
        'All rolls to Train with an Arena Veteran today are +2 to the result.',
    },
  ],
};
