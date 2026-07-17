import React from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, size = 'md', closeButton = true }) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-gray-900 rounded-lg border border-gray-800 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto animate-in`}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {closeButton && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-800 rounded transition text-gray-400 hover:text-white"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
