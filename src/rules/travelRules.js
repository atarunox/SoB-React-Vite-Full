// Travel to Town:
// Each hero rolls 1D6; on 1-2 -> Travel Hazard.
export function travelRoll() {
  return Math.ceil(Math.random()*6);
}

export function computeTravelHazardsForPosse(posse) {
  const results = posse.map(h => {
    const roll = travelRoll();
    const hazard = roll <= 2;
    return { id: (h.id ?? h.localId), name: h.name || 'Unnamed', roll, hazard };
  });
  return results;
}
