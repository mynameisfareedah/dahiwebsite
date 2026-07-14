export function loadCollection(key, fallback = []) {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.warn('Unable to read admin storage', error);
    return fallback;
  }
}

export function saveCollection(key, value) {
  if (typeof window === 'undefined') return value;
  window.localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function createCollectionItem(key, item, fallback = []) {
  const collection = loadCollection(key, fallback);
  const nextItem = { ...item, id: item.id || `${Date.now()}-${Math.random().toString(16).slice(2)}` };
  const nextCollection = [nextItem, ...collection];
  saveCollection(key, nextCollection);
  return nextCollection;
}

export function updateCollectionItem(key, id, updates, fallback = []) {
  const collection = loadCollection(key, fallback);
  const nextCollection = collection.map((item) => (item.id === id ? { ...item, ...updates } : item));
  saveCollection(key, nextCollection);
  return nextCollection;
}

export function deleteCollectionItem(key, id, fallback = []) {
  const collection = loadCollection(key, fallback);
  const nextCollection = collection.filter((item) => item.id !== id);
  saveCollection(key, nextCollection);
  return nextCollection;
}

export function exportCsv(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
