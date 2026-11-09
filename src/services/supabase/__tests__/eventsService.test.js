import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  handleSupabaseError: vi.fn((error) => error),
  query: null,
}));

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: mocks.from,
    storage: {
      from: vi.fn(),
    },
  },
  isSupabaseConfigured: true,
  handleSupabaseError: mocks.handleSupabaseError,
}));

import { createEvent, getFeaturedEvents, updateEvent } from '../eventsService';

function buildWriteQuery({ data, error = null } = {}) {
  const query = {
    eq: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    select: vi.fn(),
    single: vi.fn().mockResolvedValue({ data, error }),
  };
  query.eq.mockReturnValue(query);
  query.insert.mockReturnValue(query);
  query.update.mockReturnValue(query);
  query.select.mockReturnValue(query);
  return query;
}

describe('getFeaturedEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      order: vi.fn(),
    };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.order.mockReturnValue(query);
    query.then = (resolve, reject) => Promise.resolve({
      data: [{
        id: 'featured-event',
        title: 'Featured webinar',
        status: 'published',
        featured: true,
        event_date: '2026-08-10',
      }],
      error: null,
    }).then(resolve, reject);
    mocks.query = query;
    mocks.from.mockReturnValue(query);
  });

  it('queries published featured events without excluding them by date or a small limit', async () => {
    const result = await getFeaturedEvents();

    expect(mocks.from).toHaveBeenCalledWith('events');
    expect(mocks.query.eq).toHaveBeenCalledWith('status', 'published');
    expect(mocks.query.eq).toHaveBeenCalledWith('featured', true);
    expect(mocks.query.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result.error).toBeNull();
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: 'featured-event',
      title: 'Featured webinar',
      featured: true,
      date: '2026-08-10',
    });
  });

  it('creates events with normalized required and optional dates', async () => {
    const query = buildWriteQuery({
      data: { id: 'new-event', event_date: '2026-08-10', event_end_date: null },
    });
    mocks.from.mockReturnValueOnce(query);

    const result = await createEvent({
      title: 'New event',
      date: '2026-08-10',
      endDate: '',
    });

    expect(result.error).toBeNull();
    expect(query.insert).toHaveBeenCalledWith([expect.objectContaining({
      event_date: '2026-08-10',
      event_end_date: null,
    })]);
  });

  it('rejects a missing required start date before creating an event', async () => {
    const result = await createEvent({ title: 'Undated event', date: '' });

    expect(result.error.message).toBe('Start Date is required.');
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('updates with null optional dates and preserves omitted date fields', async () => {
    const query = buildWriteQuery({
      data: { id: 'existing-event', event_date: '2026-08-10', event_end_date: null },
    });
    mocks.from.mockReturnValueOnce(query);

    const result = await updateEvent('existing-event', {
      date: '2026-08-10',
      endDate: '',
      event_end_date: null,
    });

    expect(result.error).toBeNull();
    expect(query.update).toHaveBeenCalledWith(expect.objectContaining({
      event_date: '2026-08-10',
      event_end_date: null,
    }));

    const preserveQuery = buildWriteQuery({
      data: { id: 'existing-event', event_date: '2026-08-10', event_end_date: '2026-08-11' },
    });
    mocks.from.mockReturnValueOnce(preserveQuery);

    const preserveResult = await updateEvent('existing-event', { title: 'Updated title' });

    expect(preserveResult.error).toBeNull();
    expect(preserveQuery.update.mock.calls[0][0]).not.toHaveProperty('event_date');
    expect(preserveQuery.update.mock.calls[0][0]).not.toHaveProperty('event_end_date');
  });
});
