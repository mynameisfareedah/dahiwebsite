import { describe, expect, it } from 'vitest';
import { EVENT_TYPE_OPTIONS, PUBLIC_EVENT_FILTER_OPTIONS } from '../eventTypes';
import { getPublicEventType, matchesPublicEventFilter } from '../../utils/publicEventType';

describe('public Event Types', () => {
  it('exposes exactly the five approved public filters', () => {
    expect(PUBLIC_EVENT_FILTER_OPTIONS).toEqual([
      { value: 'all', label: 'All Activities' },
      { value: 'webinar', label: 'Webinars' },
      { value: 'masterclass', label: 'Masterclasses' },
      { value: 'outreach_community', label: 'Outreach & Community' },
      { value: 'quiz_challenge', label: 'Quizzes & Challenges' },
    ]);
    expect(EVENT_TYPE_OPTIONS).toHaveLength(4);
    expect(EVENT_TYPE_OPTIONS.map(({ value }) => value)).toEqual([
      'webinar',
      'masterclass',
      'outreach_community',
      'quiz_challenge',
    ]);
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

  it('classifies and filters quiz events while retaining the All Activities view', () => {
    const quizEvent = {
      id: 'quiz-event',
      event_type: 'quiz_challenge',
      status: 'published',
    };

    expect(getPublicEventType(quizEvent)).toBe('quiz_challenge');
    expect(matchesPublicEventFilter(quizEvent, 'quiz_challenge')).toBe(true);
    expect(matchesPublicEventFilter(quizEvent, 'all')).toBe(true);
    expect(matchesPublicEventFilter(quizEvent, 'webinar')).toBe(false);
  });
});
