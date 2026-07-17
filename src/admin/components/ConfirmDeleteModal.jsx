import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export function ConfirmDeleteModal({ isOpen, title, message, onConfirm, onCancel, isLoading = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-800 w-full max-w-md p-6 animate-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-900 rounded-full flex items-center justify-center">
            <AlertCircle size={20} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>

        <p className="text-gray-300 mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
