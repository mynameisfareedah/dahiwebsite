import { describe, expect, it } from 'vitest';
import { EVENT_TYPE_OPTIONS, PUBLIC_EVENT_FILTER_OPTIONS } from '../eventTypes';
import { getPublicEventType } from '../../utils/publicEventType';

describe('public Event Types', () => {
  it('exposes exactly the four approved public filters', () => {
    expect(PUBLIC_EVENT_FILTER_OPTIONS).toEqual([
      { value: 'all', label: 'All Activities' },
      { value: 'webinar', label: 'Webinars' },
      { value: 'masterclass', label: 'Masterclasses' },
      { value: 'outreach_community', label: 'Outreach & Community' },
    ]);
    expect(EVENT_TYPE_OPTIONS).toHaveLength(3);
  });

  it('uses stored Event Types before legacy classification', () => {
    expect(getPublicEventType({
      id: '29b2918a-e0af-492e-9f29-48fbb167ab86',
      event_type: 'masterclass',
      category: 'health',
    })).toBe('masterclass');
    expect(getPublicEventType({
      event_type: 'not-approved',
      category: 'webinar',
    })).toBeNull();
  });

  it('classifies approved legacy records without guessing from titles', () => {
    expect(getPublicEventType({
      id: '34eb0aa4-60e1-499e-8486-dfd569fac37a',
      title: 'Community Outreach',
      category: 'health',
    })).toBe('outreach_community');
    expect(getPublicEventType({
      title: 'A webinar in the title only',
      category: 'health',
    })).toBeNull();
  });
});
