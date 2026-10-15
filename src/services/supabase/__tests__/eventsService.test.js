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

import { getFeaturedEvents } from '../eventsService';

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
});
