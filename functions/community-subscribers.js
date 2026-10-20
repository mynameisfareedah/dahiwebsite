import { createClient } from '@supabase/supabase-js';

const EMAILOCTOPUS_API = 'https://api.emailoctopus.com';
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const MAX_CURSOR_LENGTH = 2048;
const ALLOWED_CONTACT_FIELDS = ['FirstName', 'LastName', 'UpdateCategories', 'HealthInterests'];

export const config = {
  path: '/.netlify/functions/community-subscribers',
  rateLimit: {
    action: 'rate_limit',
    aggregateBy: ['ip'],
    windowSize: 60,
    windowLimit: 60,
  },
};

function jsonResponse(statusCode, payload) {
  return new Response(JSON.stringify(payload), {
    status: statusCode,
    headers: {
      'Cache-Control': 'private, no-store, max-age=0',
      'Content-Type': 'application/json; charset=utf-8',
      'Vary': 'Authorization',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function parsePagination(searchParams) {
  const keys = [...searchParams.keys()];
  if (keys.some((key) => !['limit', 'starting_after'].includes(key))) return null;
  if (keys.some((key) => searchParams.getAll(key).length > 1)) return null;

  const rawLimit = searchParams.get('limit');
  const limit = rawLimit === null ? DEFAULT_PAGE_SIZE : Number(rawLimit);
  const cursor = searchParams.get('starting_after');

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_SIZE) return null;
  if (cursor !== null && (!cursor || cursor.length > MAX_CURSOR_LENGTH || /[\u0000-\u001f\u007f]/.test(cursor))) {
    return null;
  }

  return { limit, cursor };
}

function normalizeContact(contact) {
  if (!contact || typeof contact !== 'object') return null;
  const fields = contact.fields && typeof contact.fields === 'object' ? contact.fields : {};
  const safeFields = {};

  for (const field of ALLOWED_CONTACT_FIELDS) {
    const value = fields[field];
    if (typeof value === 'string' || (Array.isArray(value) && value.every((item) => typeof item === 'string'))) {
      safeFields[field] = value;
    }
  }

  return {
    id: typeof contact.id === 'string' ? contact.id : '',
    email: typeof contact.email_address === 'string' ? contact.email_address : '',
    fields: safeFields,
    status: ['SUBSCRIBED', 'PENDING', 'UNSUBSCRIBED'].includes(contact.status)
      ? contact.status
      : 'UNKNOWN',
    createdAt: typeof contact.created_at === 'string' ? contact.created_at : null,
  };
}

export async function handleSubscriberRequest(request) {
  if (request.method !== 'GET') {
    return jsonResponse(405, { error: 'method_not_allowed' });
  }

  const authorization = request.headers.get('authorization') || '';
  const match = /^Bearer\s+([^\s]+)$/i.exec(authorization);
  if (!match) {
    return jsonResponse(401, { error: 'unauthorized' });
  }

  const pagination = parsePagination(new URL(request.url).searchParams);
  if (!pagination) {
    return jsonResponse(400, { error: 'invalid_pagination' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse(503, { error: 'service_unavailable' });
  }

  let supabase;
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { Authorization: `Bearer ${match[1]}` } },
    });
  } catch {
    return jsonResponse(503, { error: 'authorization_unavailable' });
  }

  let authData;
  let authError;
  try {
    ({ data: authData, error: authError } = await supabase.auth.getUser(match[1]));
  } catch {
    return jsonResponse(503, { error: 'authorization_unavailable' });
  }
  if (authError || !authData?.user?.id) {
    return jsonResponse(401, { error: 'unauthorized' });
  }

  let isAdmin;
  let adminError;
  try {
    ({ data: isAdmin, error: adminError } = await supabase.rpc('is_admin'));
  } catch {
    return jsonResponse(503, { error: 'authorization_unavailable' });
  }
  if (adminError) {
    return jsonResponse(503, { error: 'authorization_unavailable' });
  }
  if (isAdmin !== true) {
    return jsonResponse(403, { error: 'forbidden' });
  }

  const apiKey = process.env.EMAILOCTOPUS_API_KEY;
  const listId = process.env.EMAILOCTOPUS_LIST_ID;
  if (!apiKey || !listId) {
    return jsonResponse(503, { error: 'service_unavailable' });
  }

  const url = new URL(`${EMAILOCTOPUS_API}/lists/${encodeURIComponent(listId)}/contacts`);
  url.searchParams.set('limit', String(pagination.limit));
  if (pagination.cursor) url.searchParams.set('starting_after', pagination.cursor);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return jsonResponse(502, { error: 'subscriber_service_unavailable' });
    }

    const payload = await response.json();
    if (!Array.isArray(payload?.data)) {
      return jsonResponse(502, { error: 'subscriber_service_unavailable' });
    }

    const contacts = payload.data.map(normalizeContact).filter(Boolean);
    const nextCursor = typeof payload.paging?.next?.starting_after === 'string'
      ? payload.paging.next.starting_after
      : null;

    return jsonResponse(200, { contacts, nextCursor });
  } catch {
    return jsonResponse(502, { error: 'subscriber_service_unavailable' });
  }
}

export default handleSubscriberRequest;
