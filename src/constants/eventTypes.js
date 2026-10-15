export const EVENT_TYPE_OPTIONS = Object.freeze([
  { value: 'webinar', label: 'Webinars' },
  { value: 'masterclass', label: 'Masterclasses' },
  { value: 'outreach_community', label: 'Outreach & Community' },
]);

export const PUBLIC_EVENT_FILTER_OPTIONS = Object.freeze([
  { value: 'all', label: 'All Activities' },
  ...EVENT_TYPE_OPTIONS,
]);

export const EVENT_TYPE_VALUES = Object.freeze(
  EVENT_TYPE_OPTIONS.map(({ value }) => value)
);

export function isEventType(value) {
  return EVENT_TYPE_VALUES.includes(value);
}

export function getEventTypeLabel(value) {
  return EVENT_TYPE_OPTIONS.find((option) => option.value === value)?.label || 'Not assigned';
}
