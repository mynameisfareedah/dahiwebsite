import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const ENDPOINT = '/.netlify/functions/community-subscribers';

export const newsletterSubscriberService = {
  async getSubscribers({ limit = 25, cursor = null } = {}) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Admin authentication is not configured.');
    }

    const { data, error } = await supabase.auth.getSession();
    if (error || !data?.session?.access_token) {
      throw new Error('Your admin session has expired. Please sign in again.');
    }

    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set('starting_after', cursor);

    const response = await fetch(`${ENDPOINT}?${params}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${data.session.access_token}` },
      cache: 'no-store',
    });
    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error('Newsletter subscribers could not be loaded.');
    }

    if (!response.ok) {
      throw new Error(response.status === 401 || response.status === 403
        ? 'You are not authorized to view newsletter subscribers.'
        : 'Newsletter subscribers could not be loaded.');
    }

    if (!Array.isArray(payload?.contacts) || (payload.nextCursor !== null && typeof payload.nextCursor !== 'string')) {
      throw new Error('Newsletter subscribers could not be loaded.');
    }

    return payload;
  },
};
