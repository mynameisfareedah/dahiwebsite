import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

export function SearchBar({ placeholder = 'Search...', onSearch, value = '', clearable = true }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
      />
      {clearable && value && (
        <button
          onClick={() => onSearch('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
