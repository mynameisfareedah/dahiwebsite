import React from 'react';

export function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-8 text-white">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-slate-400">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-6 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
