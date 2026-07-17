import React from 'react';

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="p-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-8 text-white">
        <p className="text-lg font-semibold">{message}</p>
        <p className="mt-2 text-slate-400">Please wait while we load events.</p>
      </div>
    </div>
  );
}
