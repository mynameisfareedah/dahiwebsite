import React, { createContext, useContext, useState, useCallback } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 max-w-md">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

function Toast({ message, type, onClose }) {
  const colors = {
    success: 'bg-green-900 border-green-700',
    error: 'bg-red-900 border-red-700',
    warning: 'bg-yellow-900 border-yellow-700',
    info: 'bg-blue-900 border-blue-700',
  };

  const icons = {
    success: <Check size={18} className="text-green-400" />,
    error: <AlertCircle size={18} className="text-red-400" />,
    warning: <AlertCircle size={18} className="text-yellow-400" />,
    info: <AlertCircle size={18} className="text-blue-400" />,
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${colors[type]} text-white animate-in slide-in-from-right`}
      role="alert"
    >
      {icons[type]}
      <span className="flex-1 text-sm">{message}</span>
      <button
        onClick={onClose}
        className="text-gray-300 hover:text-white transition"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
