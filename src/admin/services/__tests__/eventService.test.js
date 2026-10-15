import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
  isSupabaseConfigured: true,
  handleSupabaseError: (error) => error,
}));

import { eventService } from '../eventService';
import { supabase } from '../../../lib/supabase';

function buildListQueryResult({ data = [], count = 0, error = null } = {}) {
  const query = {
    or: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnValue({ data, count, error }),
  };

  return {
    select: vi.fn().mockReturnValue(query),
    query,
  };
}

describe('eventService - Real Implementation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_SUPABASE_EVENT_TYPE_SCHEMA_READY', 'true');
  });

  it('creates an event successfully', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
      data: { user: { id: 'admin-1' } },
      error: null,
    });

    const single = vi.fn().mockResolvedValueOnce({
      data: {
        id: 'evt-1',
        title: 'Health Talk',
        event_date: '2026-08-01',
        start_time: '10:00',
        attendees_count: 0,
        status: 'draft',
      },
      error: null,
    });

    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });

    vi.mocked(supabase.from).mockReturnValueOnce({ insert });

    const result = await eventService.createEvent({
      title: 'Health Talk',
      description: 'Community event',
      date: '2026-08-01',
      time: '10:00',
      location: 'Hall A',
      capacity: 100,
      status: 'draft',
      eventType: 'webinar',
      featured: true,
    });

    expect(result.success).toBe(true);
    expect(result.error).toBeNull();
    expect(result.data.title).toBe('Health Talk');
    expect(supabase.from).toHaveBeenCalledWith('events');
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      event_type: 'webinar',
      featured: true,
    }));
    expect(insert.mock.calls[0][0]).not.toHaveProperty('category');
    expect(insert.mock.calls[0][0]).not.toHaveProperty('capacity');
  });

  it('returns error when create fails with Supabase error', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
      data: { user: { id: 'admin-1' } },
      error: null,
    });

    const single = vi.fn().mockResolvedValueOnce({
      data: null,
      error: { message: 'Insert failed' },
    });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });

    vi.mocked(supabase.from).mockReturnValueOnce({ insert });

    const result = await eventService.createEvent({ title: 'Bad Event', eventType: 'webinar' });

    expect(result.success).toBe(false);
    expect(result.error.message).toBe('Insert failed');
  });

  it('rejects unapproved Event Types before writing', async () => {
    const result = await eventService.createEvent({ title: 'Health Talk', eventType: 'quiz' });

    expect(result.success).toBe(false);
    expect(result.error.message).toMatch(/valid Event Type/i);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('creates a multi-day quiz with TBA sessions without sending Capacity', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
      data: { user: { id: 'admin-1' } },
      error: null,
    });

    const single = vi.fn().mockResolvedValueOnce({
      data: {
        id: 'quiz-1',
        title: 'DAHI Quiz',
        event_type: 'quiz_challenge',
        event_date: '2026-10-17',
        event_end_date: '2026-10-18',
        event_schedule: [
          { date: '2026-10-17', time: null },
          { date: '2026-10-18', time: null },
        ],
        status: 'draft',
      },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    vi.mocked(supabase.from).mockReturnValueOnce({ insert });

    const result = await eventService.createEvent({
      title: 'DAHI Quiz',
      eventType: 'quiz_challenge',
      date: '2026-10-17',
      event_end_date: '2026-10-18',
      start_time: null,
      event_schedule: [
        { date: '2026-10-17', time: null },
        { date: '2026-10-18', time: null },
      ],
      status: 'draft',
    });

    expect(result.success).toBe(true);
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      event_type: 'quiz_challenge',
      event_date: '2026-10-17',
      event_end_date: '2026-10-18',
      start_time: null,
      event_schedule: [
        { date: '2026-10-17', time: null },
        { date: '2026-10-18', time: null },
      ],
    }));
    expect(insert.mock.calls[0][0]).not.toHaveProperty('capacity');
  });

  it('updates an event successfully', async () => {
    const single = vi.fn().mockResolvedValueOnce({
      data: {
        id: 'evt-1',
        title: 'Updated Event',
        event_date: '2026-08-02',
        start_time: '12:00',
        attendees_count: 0,
        status: 'published',
      },
      error: null,
    });

    const select = vi.fn().mockReturnValue({ single });
    const eq = vi.fn().mockReturnValue({ select });
    const update = vi.fn().mockReturnValue({ eq });

    vi.mocked(supabase.from).mockReturnValueOnce({ update });

    const result = await eventService.updateEvent('evt-1', {
      title: 'Updated Event',
      date: '2026-08-02',
      time: '12:00',
      endDate: '2026-08-03',
      event_schedule: [
        { date: '2026-08-02', time: '12:00' },
        { date: '2026-08-03', time: null },
      ],
      status: 'published',
      eventType: 'masterclass',
      featured: true,
    });

    expect(result.success).toBe(true);
    expect(result.data.title).toBe('Updated Event');
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      event_type: 'masterclass',
      featured: true,
      event_end_date: '2026-08-03',
      event_schedule: [
        { date: '2026-08-02', time: '12:00' },
        { date: '2026-08-03', time: null },
      ],
    }));
    expect(update.mock.calls[0][0]).not.toHaveProperty('category');
    expect(update.mock.calls[0][0]).not.toHaveProperty('capacity');
  });

  it('deletes an event successfully', async () => {
    const eq = vi.fn().mockResolvedValueOnce({ error: null });
    const del = vi.fn().mockReturnValue({ eq });

    vi.mocked(supabase.from).mockReturnValueOnce({ delete: del });

    const result = await eventService.deleteEvent('evt-1');

    expect(result.success).toBe(true);
    expect(result.data).toBe(true);
  });

  it('returns error on delete API failure', async () => {
    const eq = vi.fn().mockResolvedValueOnce({ error: { message: 'Delete failed' } });
    const del = vi.fn().mockReturnValue({ eq });

    vi.mocked(supabase.from).mockReturnValueOnce({ delete: del });

    const result = await eventService.deleteEvent('evt-1');

    expect(result.success).toBe(false);
    expect(result.error.message).toBe('Delete failed');
  });

  it('handles getEvents with successful list fetch', async () => {
    const table = buildListQueryResult({
      data: [
        {
          id: 'evt-1',
          title: 'Event 1',
          event_date: '2026-08-01',
          start_time: '11:00',
          attendees_count: 3,
          status: 'draft',
        },
      ],
      count: 1,
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValueOnce(table);

    const result = await eventService.getEvents({ page: 1, pageSize: 10, search: 'Event' });

    expect(result.success).toBe(true);
    expect(result.data.count).toBe(1);
    expect(result.data.items).toHaveLength(1);
    expect(table.query.or).toHaveBeenCalled();
  });

  it('returns error from getEvents query failure', async () => {
    const table = buildListQueryResult({
      data: null,
      count: 0,
      error: { message: 'Query failed' },
    });

    vi.mocked(supabase.from).mockReturnValueOnce(table);

    const result = await eventService.getEvents({ page: 1, pageSize: 10 });

    expect(result.success).toBe(false);
    expect(result.error.message).toBe('Query failed');
  });

  it('returns validation-style error for invalid getEventById UUID format', async () => {
    const result = await eventService.getEventById('not-a-uuid');

    expect(result.success).toBe(false);
    expect(result.error.message).toContain('Invalid event ID format');
  });
});
