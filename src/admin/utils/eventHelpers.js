import { formatEventDate as formatCalendarDate } from '../../utils/eventSchedule';

export function formatEventDate(dateString) {
  return formatCalendarDate(dateString);
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
