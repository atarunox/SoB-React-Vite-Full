// Example global function to reset once-per-fight flags for all heroes import { getHeroes, updateHero } from './heroManager'; // Replace with your actual hero state management

export function resetOncePerFightAbilities() { const heroes = getHeroes(); heroes.forEach(hero => { const updated = { ...hero, abilities: hero.abilities?.map(ability => ability.oncePerFight ? { ...ability, used: false } : ability), gear: hero.gear?.map(item => item.oncePerFight ? { ...item, used: false } : item) }; updateHero(hero.name, updated); }); }

// Attach to global for DM tools to call if (typeof window !== 'undefined') { window.resetOncePerFightAbilities = resetOncePerFightAbilities; }


export default function Placeholder() { return null; }
