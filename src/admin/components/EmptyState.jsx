import React from 'react';

export function EmptyState({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && <Icon size={48} className="text-gray-400 mb-4" />}
      <h3 className="text-lg font-semibold text-gray-300 mb-2">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-md">{description}</p>
      {action && (
        <button
          onClick={action}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
