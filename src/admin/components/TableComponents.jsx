import React from 'react';
import { Edit2, Trash2, Eye, ChevronUp, ChevronDown } from 'lucide-react';

/**
 * Reusable table header component
 */
export function TableHeader({ columns, sortBy, sortOrder, onSort }) {
  return (
    <thead className="bg-gray-800 border-b border-gray-700">
      <tr>
        {columns.map((col) => (
          <th
            key={col.key}
            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition"
            onClick={() => onSort && onSort(col.key)}
          >
            <div className="flex items-center gap-2">
              {col.label}
              {sortBy === col.key && (
                sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
              )}
            </div>
          </th>
        ))}
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  );
}

/**
 * Reusable table row component
 */
export function TableRow({ item, columns, onEdit, onDelete, onView }) {
  return (
    <tr className="border-b border-gray-700 hover:bg-gray-800 transition">
      {columns.map((col) => (
        <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
          {col.render ? col.render(item) : item[col.key]}
        </td>
      ))}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
        {onView && (
          <button
            onClick={() => onView(item)}
            className="text-blue-400 hover:text-blue-300 transition p-1"
            title="View details"
          >
            <Eye size={16} />
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(item)}
            className="text-amber-400 hover:text-amber-300 transition p-1"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(item)}
            className="text-red-400 hover:text-red-300 transition p-1"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        )}
      </td>
    </tr>
  );
}

/**
 * Reusable data table component
 */
export function DataTable({ columns, data, onEdit, onDelete, onView, loading = false }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700">
      <table className="min-w-full divide-y divide-gray-700 bg-gray-900">
        <TableHeader columns={columns} />
        <tbody className="divide-y divide-gray-700">
          {data.map((item, idx) => (
            <TableRow
              key={item.id || idx}
              item={item}
              columns={columns}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Reusable list card component
 */
export function ListCard({ title, items, renderItem, onAdd, addButtonText = 'Add New' }) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-800 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {onAdd && (
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
          >
            {addButtonText}
          </button>
        )}
      </div>
      <div className="divide-y divide-gray-800">
        {items && items.length > 0 ? (
          items.map((item, idx) => (
            <div key={item.id || idx} className="p-4 hover:bg-gray-800 transition">
              {renderItem(item)}
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-400">
            <p>No items available</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Status badge component
 */
export function StatusBadge({ status }) {
  const statusStyles = {
    active: 'bg-green-900 text-green-200',
    inactive: 'bg-gray-700 text-gray-200',
    pending: 'bg-yellow-900 text-yellow-200',
    completed: 'bg-blue-900 text-blue-200',
    cancelled: 'bg-red-900 text-red-200',
    draft: 'bg-purple-900 text-purple-200',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.inactive}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/**
 * Page header component for admin pages
 */
export function PageHeader({ title, subtitle, action, actionLabel = 'Add New' }) {
  return (
    <div className="mb-6 flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        {subtitle && <p className="text-gray-400">{subtitle}</p>}
      </div>
      {action && (
        <button
          onClick={action}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Filter bar component
 */
export function FilterBar({ filters, onFilterChange, onReset }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6 flex gap-4 flex-wrap items-end">
      {filters.map((filter) => (
        <div key={filter.key} className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300">{filter.label}</label>
          {filter.type === 'select' ? (
            <select
              value={filter.value || ''}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={filter.type || 'text'}
              value={filter.value || ''}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              placeholder={filter.placeholder}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            />
          )}
        </div>
      ))}
      {onReset && (
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition text-sm font-medium"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
