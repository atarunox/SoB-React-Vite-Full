// src/utils/keywords.js
export function getKeywords(hero) {
  const list = Array.isArray(hero?.keywords) ? hero.keywords : [];
  // normalize casing consistently
  return [...new Set(list.map(k => String(k).trim()))];
}

export function hasKeyword(hero, kw) {
  if (!kw) return false;
  const needle = String(kw).toLowerCase();
  return getKeywords(hero).some(k => String(k).toLowerCase() === needle);
}

export function addKeyword(listOrHero, kw) {
  const list = Array.isArray(listOrHero) ? listOrHero : getKeywords(listOrHero);
  const val = String(kw).trim();
  return list.includes(val) ? list : [...list, val];
}

export function removeKeyword(listOrHero, kw) {
  const list = Array.isArray(listOrHero) ? listOrHero : getKeywords(listOrHero);
  const needle = String(kw).toLowerCase();
  return list.filter(k => String(k).toLowerCase() !== needle);
}
