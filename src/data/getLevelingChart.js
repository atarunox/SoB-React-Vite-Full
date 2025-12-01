// src/data/getLevelingChart.js
import bandido from './levelingCharts/bandidoLevelingChart';
import darkstoneshaman from './levelingCharts/darkstoneshamanLevelingChart';
import gunslinger from './levelingCharts/gunslingerLevelingChart';
import outlaw from './levelingCharts/outlawLevelingChart';
import saloongirl from './levelingCharts/saloongirlLevelingChart';
import trederranveteran from './levelingCharts/trederranveteranLevelingChart';
import wanderingsamurai from './levelingCharts/wanderingsamuraiLevelingChart';
import orphan from './levelingCharts/orphanLevelingChart';
import usmarshall from './levelingCharts/usmarshallLevelingChart';
import jargononative from './levelingCharts/jargononativeLevelingChart';
import cowboy from './levelingCharts/cowboyLevelingChart';
import drifter from './levelingCharts/drifterLevelingChart';
import frontierdoc from './levelingCharts/frontierdocLevelingChart';
import gambler from './levelingCharts/gamblerLevelingChart';
import indianscout from './levelingCharts/indianscoutLevelingChart';
import prospector from './levelingCharts/prospectorLevelingChart';

const baseMap = {
  Bandido: bandido,
  DarkStoneShaman: darkstoneshaman,
  Gunslinger: gunslinger,
  Outlaw: outlaw,
  SaloonGirl: saloongirl,
  TrederranVeteran: trederranveteran,
  WanderingSamurai: wanderingsamurai,
  Orphan: orphan,
  USMarshall: usmarshall,
  JargonoNative: jargononative,
  Cowboy: cowboy,
  Drifter: drifter,
  FrontierDoc: frontierdoc,
  Gambler: gambler,
  IndianScout: indianscout,
  Prospector: prospector,
};

const aliases = {
  Bandida: 'Bandido',
  USMarshal: 'USMarshall',
  'US Marshal': 'USMarshall',
  'US Marshall': 'USMarshall',
};

function resolveClassKey(heroClass = '') {
  const noSpace = String(heroClass).replace(/\s+/g, '');
  return aliases[heroClass] || aliases[noSpace] || noSpace;
}

export default function getLevelingChart(heroClass) {
  const key = resolveClassKey(heroClass);
  return baseMap[key] || [];
}
