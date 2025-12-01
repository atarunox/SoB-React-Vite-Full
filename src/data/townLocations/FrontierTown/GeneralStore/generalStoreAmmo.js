// src/data/townLocations/generalStoreAmmo.js
const generalStoreAmmo = {
  id: 'generalStoreAmmo',
  name: 'Specialty Ammo',
  type: 'shop',
  items: [
    {
      id: 'ammo_demon_shot',
      name: 'Demon Shot',
      type: 'Gear',
      slot: 'Ammo',
      cost: { gold: 50 },
      tags: ['Ammo', 'Special'],
      effects: ['+1 Damage against Demon Enemies (one Adventure)'],
    },
    {
      id: 'ammo_void_shot',
      name: 'Void Shot',
      type: 'Gear',
      slot: 'Ammo',
      cost: { gold: 50 },
      tags: ['Ammo', 'Special', 'Void'],
      effects: ['+1 Damage against Void Enemies (one Adventure)'],
    },
    {
      id: 'ammo_silver_shot',
      name: 'Silver Shot',
      type: 'Gear',
      slot: 'Ammo',
      cost: { gold: 50 },
      tags: ['Ammo', 'Special'],
      effects: ['+1 Damage against Beast Enemies (one Adventure)'],
    },
    {
      id: 'ammo_holy_shot',
      name: 'Holy Shot',
      type: 'Gear',
      slot: 'Ammo',
      cost: { gold: 50 },
      tags: ['Ammo', 'Special'],
      effects: ['+1 Damage against Undead Enemies (one Adventure)'],
    },
  ],
};

export default generalStoreAmmo;
