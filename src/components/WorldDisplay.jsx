import React from 'react';
import { useWorld } from '../../context/WorldContext';

export default function WorldDisplay() {
  const { world } = useWorld();

  return (
    <div className="fixed top-0 left-0 w-full bg-yellow-200 border-b-2 border-yellow-700 text-center py-2 z-50 shadow-lg text-lg font-bold">
      Current World: <span className="text-orange-900">{world}</span>
    </div>
  );
}
