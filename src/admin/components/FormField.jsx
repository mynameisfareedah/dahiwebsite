import React from 'react';
import { AlertCircle } from 'lucide-react';

export function FormField({ label, error, required, children, help }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 mt-1">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      {help && !error && <p className="text-xs text-gray-400 mt-1">{help}</p>}
    </div>
  );
}

export function FormInput({ label, error, required, help, ...props }) {
  return (
    <FormField label={label} error={error} required={required} help={help}>
      <input
        {...props}
        className={`w-full px-4 py-2 bg-gray-800 border rounded text-white focus:outline-none transition ${
          error ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-blue-500'
        }`}
      />
    </FormField>
  );
}

export function FormSelect({ label, error, required, help, children, options = [], ...props }) {
  return (
    <FormField label={label} error={error} required={required} help={help}>
      <select
        {...props}
        className={`w-full px-4 py-2 bg-gray-800 border rounded text-white focus:outline-none transition ${
          error ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-blue-500'
        }`}
      >
        {options.length > 0
          ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : children}
      </select>
    </FormField>
  );
}

export function FormTextarea({ label, error, required, help, ...props }) {
  return (
    <FormField label={label} error={error} required={required} help={help}>
      <textarea
        {...props}
        className={`w-full px-4 py-2 bg-gray-800 border rounded text-white focus:outline-none transition resize-none ${
          error ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-blue-500'
        }`}
      />
    </FormField>
  );
}

export function FormCheckbox({ label, error, help, ...props }) {
  return (
    <FormField error={error} help={help}>
      <div className="flex items-center gap-3">
        <input
          {...props}
          type="checkbox"
          className="w-4 h-4 bg-gray-800 border border-gray-700 rounded cursor-pointer focus:outline-none focus:border-blue-500"
        />
        {label && <label className="text-sm text-gray-300">{label}</label>}
      </div>
    </FormField>
  );
}
