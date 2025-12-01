// src/data/getSkillTree.js
import skillTree_Bandido from './skillTrees/skillTree_Bandido.js';
import skillTree_Cowboy from './skillTrees/skillTree_Cowboy.js';
import skillTree_Drifter from './skillTrees/skillTree_Drifter.js';
import skillTree_DarkStoneShaman from './skillTrees/skillTree_DarkStoneShaman.js';
import skillTree_JargonoNative from './skillTrees/skillTree_JargonoNative.js';
import skillTree_TrederranVeteran from './skillTrees/skillTree_TrederranVeteran.js';
import skillTree_Outlaw from './skillTrees/skillTree_Outlaw.js';
import skillTree_Prospector from './skillTrees/skillTree_Prospector.js';
import skillTree_SaloonGirl from './skillTrees/skillTree_SaloonGirl.js';
import skillTree_USMarshall from './skillTrees/skillTree_USMarshall.js';
import skillTree_Gunslinger from './skillTrees/skillTree_Gunslinger.js';
import skillTree_Gambler from './skillTrees/skillTree_Gambler.js';
import skillTree_FrontierDoc from './skillTrees/skillTree_FrontierDoc.js';
import skillTree_IndianScout from './skillTrees/skillTree_IndianScout.js';
import skillTree_Orphan from './skillTrees/skillTree_Orphan.js';
import skillTree_WanderingSamurai from './skillTrees/skillTree_WanderingSamurai.js';

const baseMap = {
  Bandido: skillTree_Bandido,
  Cowboy: skillTree_Cowboy,
  Drifter: skillTree_Drifter,
  DarkStoneShaman: skillTree_DarkStoneShaman,
  JargonoNative: skillTree_JargonoNative,
  TrederranVeteran: skillTree_TrederranVeteran,
  Outlaw: skillTree_Outlaw,
  Prospector: skillTree_Prospector,
  SaloonGirl: skillTree_SaloonGirl,
  USMarshall: skillTree_USMarshall,
  Gunslinger: skillTree_Gunslinger,
  Gambler: skillTree_Gambler,
  FrontierDoc: skillTree_FrontierDoc,
  IndianScout: skillTree_IndianScout,
  Orphan: skillTree_Orphan,
  WanderingSamurai: skillTree_WanderingSamurai,
};

// Map common variants → canonical keys used above
const aliases = {
  Bandida: 'Bandido',
  USMarshal: 'USMarshall',   // no “second l” in your heroClass string
  'US Marshal': 'USMarshall',
  'US Marshall': 'USMarshall',
};

function resolveClassKey(heroClass = '') {
  const noSpace = String(heroClass).replace(/\s+/g, '');
  return aliases[heroClass] || aliases[noSpace] || noSpace;
}

export default function getSkillTree(heroClass) {
  const key = resolveClassKey(heroClass);
  return baseMap[key] || [];
}
