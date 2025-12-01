// src/components/DM/DrawerOverlay.jsx
import { createPortal } from 'react-dom';
import React from 'react';

export default function DrawerOverlay({ open, onClose, title, children }) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      {/* dimmed backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      {/* the drawer panel */}
      <div className="relative ml-auto w-full sm:w-1/2 md:w-1/3 h-full bg-white overflow-y-auto shadow-lg">
        <header className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </header>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
