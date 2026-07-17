export function formatEventDate(dateString) {
  return dateString ? new Date(dateString).toLocaleDateString() : '-';
}

export function formatEventTime(timeString) {
  return timeString || '-';
}

export function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
