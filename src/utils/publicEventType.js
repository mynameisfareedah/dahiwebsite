import { isEventType } from '../constants/eventTypes';

const LEGACY_EVENT_TYPES_BY_ID = Object.freeze({
  '34eb0aa4-60e1-499e-8486-dfd569fac37a': 'outreach_community',
  '29b2918a-e0af-492e-9f29-48fbb167ab86': 'webinar',
  'c70f5971-5f47-4385-a55a-24ae43037ecf': 'webinar',
  '1e6c7ffb-c1ef-419c-b155-2e9350f3ce5d': 'webinar',
  'cf359a73-80cb-4412-bcf7-3b26300e4b6a': 'webinar',
  '8b96ebd9-5a5c-4644-9dfc-49da2caeee5b': 'masterclass',
});

/**
 * Legacy event categories are broad, so reviewed records use stable IDs rather
 * than guessing their public type from titles. Stored database types take precedence.
 */
export function getPublicEventType(event) {
  if (!event) return null;

  if (event.event_type != null) {
    return isEventType(event.event_type) ? event.event_type : null;
  }

  const legacyType = LEGACY_EVENT_TYPES_BY_ID[event.id];
  if (legacyType) return legacyType;

  const category = typeof event.category === 'string' ? event.category.trim().toLowerCase() : '';
  if (category === 'webinar' || category === 'masterclass') return category;
  if (category === 'outreach') return 'outreach_community';
  return null;
}

export function matchesPublicEventFilter(event, filter) {
  if (filter === 'all') return true;
  return getPublicEventType(event) === filter;
}
