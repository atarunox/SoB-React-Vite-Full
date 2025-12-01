import { db } from './firebaseConfig';
import {
  addDoc, collection, doc, setDoc, serverTimestamp, updateDoc
} from 'firebase/firestore';

/** Create a new hero in top-level `heroes` collection */
export async function createHero(hero) {
  const base = {
    name: hero?.name || 'Unnamed Hero',
    level: Number(hero?.level) || 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...hero,
  };
  const ref = await addDoc(collection(db, 'heroes'), base);
  return ref.id;
}

/** Upsert hero by ID (creates doc if it does not exist) */
export async function upsertHero(heroId, partial) {
  if (!heroId) throw new Error('upsertHero: heroId required');
  const ref = doc(db, 'heroes', heroId);
  await setDoc(ref, { ...partial, updatedAt: serverTimestamp() }, { merge: true });
  return heroId;
}

/** Update hero (fails if missing) */
export async function updateHero(heroId, partial) {
  if (!heroId) throw new Error('updateHero: heroId required');
  const ref = doc(db, 'heroes', heroId);
  await updateDoc(ref, { ...partial, updatedAt: serverTimestamp() });
  return heroId;
}
