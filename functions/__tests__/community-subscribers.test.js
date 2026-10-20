import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn() }));

import { createClient } from '@supabase/supabase-js';
import handler from '../community-subscribers.js';

const originalEnv = {
  EMAILOCTOPUS_API_KEY: process.env.EMAILOCTOPUS_API_KEY,
  EMAILOCTOPUS_LIST_ID: process.env.EMAILOCTOPUS_LIST_ID,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
};

const providerContact = {
  id: 'fixture-contact-id',
  email_address: 'subscriber@example.test',
  fields: {
    FirstName: 'Test',
    LastName: 'Subscriber',
    UpdateCategories: ['Webinars and events'],
    HealthInterests: ['Menopause'],
    PrivateField: 'must not be returned',
  },
  status: 'SUBSCRIBED',
  created_at: '2026-10-01T10:00:00Z',
  last_updated_at: '2026-10-02T10:00:00Z',
  tags: ['private-tag'],
};

function response(status, body) {
  return new Response(JSON.stringify(body), { status });
}

function makeRequest({ method = 'GET', token = 'valid-test-token', query = '' } = {}) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return new Request(`https://example.test/.netlify/functions/community-subscribers${query}`, {
    method,
    headers,
  });
}

function configureAdmin({
  userError = null,
  isAdmin = true,
  adminError = null,
  getUserThrows = false,
  adminCheckThrows = false,
  createClientThrows = false,
} = {}) {
  const getUser = getUserThrows
    ? vi.fn().mockRejectedValue(new Error('private auth network detail'))
    : vi.fn().mockResolvedValue({
      data: { user: { id: 'fixture-user-id' } },
      error: userError,
    });
  const checkAdmin = adminCheckThrows
    ? vi.fn().mockRejectedValue(new Error('private admin network detail'))
    : vi.fn().mockResolvedValue({ data: isAdmin, error: adminError });

  if (createClientThrows) {
    createClient.mockImplementation(() => {
      throw new Error('private Supabase credential detail');
    });
    return;
  }

  createClient.mockReturnValue({
    auth: { getUser },
    rpc: checkAdmin,
  });
}

function expectSanitizedDiagnostic(stage, category, privateValue) {
  expect(console.error).toHaveBeenCalledOnce();
  const [entry] = console.error.mock.calls[0];
  const diagnostic = JSON.parse(entry);

  expect(diagnostic).toEqual({
    event: 'subscriber_authorization_failure',
    stage,
    category,
    timestamp: expect.any(String),
  });
  expect(Number.isNaN(Date.parse(diagnostic.timestamp))).toBe(false);
  expect(entry).not.toContain(privateValue);
  expect(entry).not.toContain('valid-test-token');
  expect(entry).not.toContain('test-anon-key');
  expect(entry).not.toContain('test-emailoctopus-key');
  expect(entry).not.toContain('subscriber@example.test');
  expect(entry).not.toContain('Test');
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  process.env.EMAILOCTOPUS_API_KEY = 'test-emailoctopus-key';
  process.env.EMAILOCTOPUS_LIST_ID = 'test-list-id';
  process.env.SUPABASE_URL = 'https://supabase.example.test';
  process.env.SUPABASE_ANON_KEY = 'test-anon-key';
  configureAdmin();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(200, {
    data: [providerContact],
    paging: { next: { starting_after: 'fixture-next-cursor' } },
  })));
});

afterEach(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('community subscribers endpoint', () => {
  it('rejects missing bearer tokens without accessing Supabase or EmailOctopus', async () => {
    const result = await handler(makeRequest({ token: '' }));

    expect(result.status).toBe(401);
    expect(createClient).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(result.headers.get('cache-control')).toContain('no-store');
  });

  it('rejects invalid Supabase tokens', async () => {
    configureAdmin({ userError: { message: 'invalid token' } });

    const result = await handler(makeRequest());

    expect(result.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('logs a safe stage when Supabase client creation throws', async () => {
    configureAdmin({ createClientThrows: true });

    const result = await handler(makeRequest());

    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ error: 'authorization_unavailable' });
    expectSanitizedDiagnostic('supabase_client_creation', 'client_initialization_failed', 'private Supabase credential detail');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('returns a safe service error when Supabase token verification is unavailable', async () => {
    configureAdmin({ getUserThrows: true });

    const result = await handler(makeRequest());

    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ error: 'authorization_unavailable' });
    expectSanitizedDiagnostic('supabase_auth_exception', 'auth_request_failed', 'private auth network detail');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects authenticated non-admin users before contacting EmailOctopus', async () => {
    configureAdmin({ isAdmin: false });

    const result = await handler(makeRequest());

    expect(result.status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('returns a safe service error when the admin check is unavailable', async () => {
    configureAdmin({ adminCheckThrows: true });

    const result = await handler(makeRequest());

    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ error: 'authorization_unavailable' });
    expectSanitizedDiagnostic('supabase_admin_rpc_exception', 'rpc_invocation_failed', 'private admin network detail');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('logs a safe stage when the admin RPC returns an error', async () => {
    const privateError = 'private RPC SQL detail';
    configureAdmin({ adminError: { message: privateError } });

    const result = await handler(makeRequest());

    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ error: 'authorization_unavailable' });
    expectSanitizedDiagnostic('supabase_admin_rpc_error', 'rpc_returned_error', privateError);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('returns only allowlisted EmailOctopus contact fields for an administrator', async () => {
    const result = await handler(makeRequest());
    const payload = await result.json();

    expect(result.status).toBe(200);
    expect(payload).toEqual({
      contacts: [{
        id: 'fixture-contact-id',
        email: 'subscriber@example.test',
        fields: {
          FirstName: 'Test',
          LastName: 'Subscriber',
          UpdateCategories: ['Webinars and events'],
          HealthInterests: ['Menopause'],
        },
        status: 'SUBSCRIBED',
        createdAt: '2026-10-01T10:00:00Z',
      }],
      nextCursor: 'fixture-next-cursor',
    });
    expect(fetch.mock.calls[0][0].toString()).toBe(
      'https://api.emailoctopus.com/lists/test-list-id/contacts?limit=25',
    );
    expect(fetch.mock.calls[0][1]).toEqual(expect.objectContaining({
      method: 'GET',
      headers: expect.objectContaining({ Authorization: 'Bearer test-emailoctopus-key' }),
    }));
    expect(createClient).toHaveBeenCalledWith(
      'https://supabase.example.test',
      'test-anon-key',
      expect.objectContaining({
        global: { headers: { Authorization: 'Bearer valid-test-token' } },
      }),
    );
    expect(result.headers.get('cache-control')).toContain('private');
    expect(result.headers.get('vary')).toBe('Authorization');
    expect(console.error).not.toHaveBeenCalled();
  });

  it('forwards a bounded page size and provider cursor', async () => {
    const result = await handler(makeRequest({
      query: '?limit=50&starting_after=fixture-cursor',
    }));

    expect(result.status).toBe(200);
    expect(fetch.mock.calls[0][0].toString()).toBe(
      'https://api.emailoctopus.com/lists/test-list-id/contacts?limit=50&starting_after=fixture-cursor',
    );
  });

  it.each(['?limit=0', '?limit=101', '?limit=1.5', '?unknown=x'])(
    'rejects unsafe pagination input %s',
    async (query) => {
      const result = await handler(makeRequest({ query }));
      expect(result.status).toBe(400);
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it('returns a generic error when EmailOctopus fails', async () => {
    fetch.mockResolvedValueOnce(response(500, { detail: 'provider diagnostic must remain private' }));

    const result = await handler(makeRequest());
    const payload = await result.json();

    expect(result.status).toBe(502);
    expect(payload).toEqual({ error: 'subscriber_service_unavailable' });
  });

  it('allows only read-only GET requests', async () => {
    const result = await handler(makeRequest({ method: 'DELETE' }));

    expect(result.status).toBe(405);
    expect(fetch).not.toHaveBeenCalled();
  });
});
