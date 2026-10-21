import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock('../../../lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: { auth: { getSession } },
}));

import { newsletterSubscriberService } from '../newsletterSubscriberService';

beforeEach(() => {
  getSession.mockResolvedValue({
    data: { session: { access_token: 'fixture-admin-token' } },
    error: null,
  });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ contacts: [], nextCursor: null }),
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('newsletterSubscriberService', () => {
  it('sends the current Supabase bearer token and cursor without caching', async () => {
    await newsletterSubscriberService.getSubscribers({ limit: 25, cursor: 'fixture/cursor' });

    expect(fetch).toHaveBeenCalledWith(
      '/.netlify/functions/community-subscribers?limit=25&starting_after=fixture%2Fcursor',
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer fixture-admin-token' },
        cache: 'no-store',
      }),
    );
  });

  it('preserves normalized EmailOctopus status values returned by the Function', async () => {
    const contacts = [
      { id: 'fixture-1', email: 'first@example.test', fields: {}, status: 'SUBSCRIBED', createdAt: null },
      { id: 'fixture-2', email: 'second@example.test', fields: {}, status: 'PENDING', createdAt: null },
      { id: 'fixture-3', email: 'third@example.test', fields: {}, status: 'UNSUBSCRIBED', createdAt: null },
    ];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ contacts, nextCursor: null }),
    });

    await expect(newsletterSubscriberService.getSubscribers()).resolves.toEqual({
      contacts,
      nextCursor: null,
    });
  });

  it('requires an active session before making the request', async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null });

    await expect(newsletterSubscriberService.getSubscribers()).rejects.toThrow('Your admin session has expired.');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not surface unexpected server response bodies', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => ({ error: 'provider failure', detail: 'private upstream diagnostic' }),
    });

    await expect(newsletterSubscriberService.getSubscribers()).rejects.toThrow(
      'Newsletter subscribers could not be loaded.',
    );
  });
});
