import React from 'react';

export function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} border-3 border-gray-700 border-t-blue-500 rounded-full animate-spin`}></div>
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  );
}

export function SkeletonLoader({ rows = 3, columns = 4 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={`skeleton-row-${rowIdx}`} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div
              key={`skeleton-col-${rowIdx}-${colIdx}`}
              className="flex-1 h-10 bg-gray-800 rounded animate-pulse"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}
