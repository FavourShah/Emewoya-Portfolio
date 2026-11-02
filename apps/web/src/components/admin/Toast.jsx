import React from 'react';

/**
 * A simple toast notification component.
 * @param {{ message: string, type: 'success'|'error', onClose: () => void }} props
 */
export default function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-lg font-sans text-sm font-medium transition-all ${
        type === 'success'
          ? 'bg-ink text-surface'
          : 'bg-red-600 text-white'
      }`}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        aria-label="Close notification"
        className="text-white/60 hover:text-white ml-2 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

