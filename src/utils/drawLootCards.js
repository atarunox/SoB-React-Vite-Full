// src/utils/drawLootCards.js
// // // import { collection, doc, setDoc, getDocs, writeBatch, deleteDoc } // Removed Firestore for local mode;
// import { db } // Removed Firebase for local mode;
// import { lootCards } from '../data/lootCards';
// 
// function drawGearCard() {
//   return {
//     name: "Random Gear",
//     type: "Gear",
//     effects: ["+1 Agility"],
//     value: 500
//   };
// }

function drawWorldArtifact(currentWorld) {
  const worlds = ["Jargono", "Targa Plateau", "Caverns of Cynder", "Derelict Ship", "Blasted Wastes"];
  const world = worlds[Math.floor(Math.random() * worlds.length)];
  return {
    name: `${world} Artifact`,
    type: "Artifact",
    effects: ["+1 Spirit", "Ignore 1 Corruption Hit per Adventure"],
    value: 1200,
    originWorld: world
  };
}

export async function drawLootCardsForPosse(gameId, posse, currentWorld = "Mines") {
  if (!gameId || typeof gameId !== 'string') {
    throw new Error(`drawLootCardsForPosse: Invalid or missing gameId: ${gameId}`);
  }
const batch = writeBatch(db);
  const lootCollectionRef = collection(db, 'games', gameId, 'lootPool');
  const now = Date.now();

  const drawn = posse
    .filter(hero => hero && (hero.name || hero.id))
    .map((hero, index) => {
      const baseCard = lootCards[Math.floor(Math.random() * lootCards.length)];
      const resolvedCard = { ...baseCard };

      if (baseCard.worldConditional && baseCard.worldConditional[currentWorld]) {
        const worldEffect = baseCard.worldConditional[currentWorld];

        if (worldEffect.action === "drawGearCard") {
          Object.assign(resolvedCard, drawGearCard());
        } else if (worldEffect.action === "drawWorldArtifact") {
          Object.assign(resolvedCard, drawWorldArtifact(currentWorld));
        }

        resolvedCard.resolvedFrom = baseCard.name;
      }

      return {
        ...resolvedCard,
        id: `loot_${now + index}_${Math.random().toString(36).substr(2, 5)}`,
        claimedBy: null,
        drawnFor: hero.name || hero.id || `Hero_${index}`,
        remainsInPool: resolvedCard.remainsInPool ?? false,
        timestamp: now + index
      };
    });

  for (const card of drawn) {
    const cardRef = doc(lootCollectionRef, card.id);
    batch.set(cardRef, card);
  }

  await batch.commit();
}



export async function clearClaimedLoot(gameId) {
  if (!gameId || typeof gameId !== 'string') {
    throw new Error(`clearClaimedLoot: Invalid or missing gameId: ${gameId}`);
  }

  const lootCollectionRef = collection(db, 'games', gameId, 'lootPool');
  const snapshot = await getDocs(lootCollectionRef);
  const batch = writeBatch(db);

  snapshot.forEach(docSnap => {
    if (docSnap.data().claimedBy) {
      batch.delete(docSnap.ref);
    }
  });

  await batch.commit();
}

export default function Placeholder() { return null; }
