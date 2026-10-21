import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WebSocket from 'ws';

vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn() }));

import { createClient } from '@supabase/supabase-js';
import handler from '../community-subscribers.js';

const originalEnv = {
  EMAILOCTOPUS_API_KEY: process.env.EMAILOCTOPUS_API_KEY,
  EMAILOCTOPUS_LIST_ID: process.env.EMAILOCTOPUS_LIST_ID,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
};
const originalProcess = globalThis.process;

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

function configureRuntime({ nodeVersion = '24.18.0', webSocketAvailable = true } = {}) {
  vi.stubGlobal('process', {
    env: process.env,
    versions: nodeVersion ? { node: nodeVersion } : {},
  });
  vi.stubGlobal('WebSocket', webSocketAvailable ? class MockWebSocket {} : undefined);
}

function makeRealtimeWebSocketError(nodeMajor) {
  if (nodeMajor === 'unknown') {
    return new Error(
      'Unknown JavaScript runtime without WebSocket support.\n\n'
      + "Suggested solution: Ensure you're running in a supported environment "
      + '(browser, Node.js, Deno) or provide a custom WebSocket implementation.',
    );
  }
  if (nodeMajor >= 22) {
    return new Error(
      `Node.js ${nodeMajor} detected but native WebSocket not found.\n\n`
      + 'Suggested solution: Provide a WebSocket implementation via the transport option.',
    );
  }
  return new Error(
    `Node.js ${nodeMajor} detected without native WebSocket support.\n\n`
    + 'Suggested solution: For Node.js < 22, install "ws" package and provide it via the transport option:\n'
    + 'import ws from "ws"\n'
    + 'new RealtimeClient(url, { transport: ws })',
  );
}

function configureAdmin({
  userError = null,
  isAdmin = true,
  adminError = null,
  getUserThrows = false,
  adminCheckThrows = false,
  createClientThrows = false,
  createClientError = new Error('private Supabase credential detail'),
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
      throw createClientError;
    });
    return;
  }

  createClient.mockReturnValue({
    auth: { getUser },
    rpc: checkAdmin,
  });
}

function expectSanitizedDiagnostic(expectedFields, privateValues = []) {
  expect(console.error).toHaveBeenCalledOnce();
  const [entry] = console.error.mock.calls[0];
  const diagnostic = JSON.parse(entry);
  const defaultRuntimeFields = expectedFields.stage === 'supabase_client_creation'
    ? {
      nodeMajor: 24,
      webSocketAvailable: true,
      exceptionType: 'Error',
      runtimeFailureCategory: 'unknown_constructor_error',
    }
    : {};

  expect(diagnostic).toEqual({
    event: 'subscriber_authorization_failure',
    ...defaultRuntimeFields,
    ...expectedFields,
    timestamp: expect.any(String),
  });
  expect(Number.isNaN(Date.parse(diagnostic.timestamp))).toBe(false);
  [
    ...privateValues,
    'valid-test-token',
    'test-anon-key',
    'vite-test-anon-key',
    'test-emailoctopus-key',
    'subscriber@example.test',
    'private-project',
    'Test',
  ].forEach((value) => expect(entry).not.toContain(value));
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  process.env.EMAILOCTOPUS_API_KEY = 'test-emailoctopus-key';
  process.env.EMAILOCTOPUS_LIST_ID = 'test-list-id';
  process.env.SUPABASE_URL = 'https://supabase.example.test';
  process.env.SUPABASE_ANON_KEY = 'test-anon-key';
  process.env.VITE_SUPABASE_URL = 'https://vite-supabase.example.test';
  process.env.VITE_SUPABASE_ANON_KEY = 'vite-test-anon-key';
  configureRuntime();
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
  it('constructs the real Supabase client without a global WebSocket using the explicit transport', async () => {
    const { createClient: createRealClient } = await vi.importActual('@supabase/supabase-js');
    vi.stubGlobal('process', originalProcess);
    vi.stubGlobal('WebSocket', undefined);

    const client = createRealClient(
      'https://example.supabase.test',
      'dummy-anon-key',
      {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        realtime: { transport: WebSocket },
      },
    );

    expect(globalThis.WebSocket).toBeUndefined();
    expect(client.realtime.getChannels()).toHaveLength(0);
  });

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
    expectSanitizedDiagnostic({
      stage: 'supabase_client_creation',
      category: 'client_initialization_failed',
      urlSource: 'SUPABASE_URL',
      apiKeySource: 'SUPABASE_ANON_KEY',
      urlValidation: 'valid_https_url',
      constructorFailure: 'unexpected_constructor_exception',
    }, [
      'private Supabase credential detail',
      'https://supabase.example.test',
    ]);
    expect(createClient).toHaveBeenCalledWith(
      'https://supabase.example.test',
      'test-anon-key',
      expect.any(Object),
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it('identifies the exact Realtime WebSocket failure on Node 20 without WebSocket', async () => {
    configureRuntime({ nodeVersion: '20.19.0', webSocketAvailable: false });
    const privateMessage = makeRealtimeWebSocketError(20).message;
    configureAdmin({
      createClientThrows: true,
      createClientError: new Error(privateMessage),
    });

    const result = await handler(makeRequest());

    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ error: 'authorization_unavailable' });
    expectSanitizedDiagnostic({
      stage: 'supabase_client_creation',
      category: 'client_initialization_failed',
      urlSource: 'SUPABASE_URL',
      apiKeySource: 'SUPABASE_ANON_KEY',
      urlValidation: 'valid_https_url',
      constructorFailure: 'unexpected_constructor_exception',
      nodeMajor: 20,
      webSocketAvailable: false,
      exceptionType: 'Error',
      runtimeFailureCategory: 'websocket_runtime_unavailable',
    }, [privateMessage, 'https://supabase.example.test']);
  });

  it.each([
    ['22.0.0', 22],
    ['24.18.0', 24],
  ])('does not label unrelated Node %s errors as WebSocket failures when WebSocket exists', async (nodeVersion, nodeMajor) => {
    configureRuntime({ nodeVersion, webSocketAvailable: true });
    configureAdmin({
      createClientThrows: true,
      createClientError: new TypeError('private unrelated constructor detail'),
    });

    const result = await handler(makeRequest());

    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ error: 'authorization_unavailable' });
    expectSanitizedDiagnostic({
      stage: 'supabase_client_creation',
      category: 'client_initialization_failed',
      urlSource: 'SUPABASE_URL',
      apiKeySource: 'SUPABASE_ANON_KEY',
      urlValidation: 'valid_https_url',
      constructorFailure: 'unexpected_constructor_exception',
      nodeMajor,
      webSocketAvailable: true,
      exceptionType: 'TypeError',
      runtimeFailureCategory: 'unknown_constructor_error',
    }, ['private unrelated constructor detail']);
  });

  it.each([
    [new ReferenceError('private reference detail'), 'ReferenceError', 'private reference detail'],
    [{ message: 'private object detail', token: 'private exception token' }, 'other', 'private object detail', 'private exception token'],
  ])('restricts exception types to the diagnostic allowlist', async (exception, exceptionType, ...privateValues) => {
    configureAdmin({
      createClientThrows: true,
      createClientError: exception,
    });

    const result = await handler(makeRequest());

    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ error: 'authorization_unavailable' });
    expectSanitizedDiagnostic({
      stage: 'supabase_client_creation',
      category: 'client_initialization_failed',
      urlSource: 'SUPABASE_URL',
      apiKeySource: 'SUPABASE_ANON_KEY',
      urlValidation: 'valid_https_url',
      constructorFailure: 'unexpected_constructor_exception',
      nodeMajor: 24,
      webSocketAvailable: true,
      exceptionType,
      runtimeFailureCategory: 'unknown_constructor_error',
    }, privateValues);
  });

  it('identifies the known Node 24 WebSocket-unavailable signature when the global is missing', async () => {
    configureRuntime({ nodeVersion: '24.18.0', webSocketAvailable: false });
    const privateMessage = makeRealtimeWebSocketError(24).message;
    configureAdmin({
      createClientThrows: true,
      createClientError: new Error(privateMessage),
    });

    const result = await handler(makeRequest());

    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ error: 'authorization_unavailable' });
    expectSanitizedDiagnostic({
      stage: 'supabase_client_creation',
      category: 'client_initialization_failed',
      urlSource: 'SUPABASE_URL',
      apiKeySource: 'SUPABASE_ANON_KEY',
      urlValidation: 'valid_https_url',
      constructorFailure: 'unexpected_constructor_exception',
      nodeMajor: 24,
      webSocketAvailable: false,
      exceptionType: 'Error',
      runtimeFailureCategory: 'websocket_runtime_unavailable',
    }, [privateMessage]);
  });

  it('reports an unknown runtime and recognizes its exact WebSocket error signature', async () => {
    configureRuntime({ nodeVersion: null, webSocketAvailable: false });
    const privateMessage = makeRealtimeWebSocketError('unknown').message;
    configureAdmin({
      createClientThrows: true,
      createClientError: new Error(privateMessage),
    });

    const result = await handler(makeRequest());

    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ error: 'authorization_unavailable' });
    expectSanitizedDiagnostic({
      stage: 'supabase_client_creation',
      category: 'client_initialization_failed',
      urlSource: 'SUPABASE_URL',
      apiKeySource: 'SUPABASE_ANON_KEY',
      urlValidation: 'valid_https_url',
      constructorFailure: 'unexpected_constructor_exception',
      nodeMajor: 'unknown',
      webSocketAvailable: false,
      exceptionType: 'Error',
      runtimeFailureCategory: 'websocket_runtime_unavailable',
    }, [privateMessage]);
  });

  it('classifies invalid Supabase URLs without logging their values', async () => {
    const privateUrl = 'not a URL private-project';
    process.env.SUPABASE_URL = privateUrl;
    configureAdmin({
      createClientThrows: true,
      createClientError: new Error('Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.'),
    });

    const result = await handler(makeRequest());

    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ error: 'authorization_unavailable' });
    expectSanitizedDiagnostic({
      stage: 'supabase_client_creation',
      category: 'client_initialization_failed',
      urlSource: 'SUPABASE_URL',
      apiKeySource: 'SUPABASE_ANON_KEY',
      urlValidation: 'invalid_url',
      constructorFailure: 'invalid_url',
    }, [privateUrl]);
  });

  it('classifies malformed Supabase URLs without logging their values', async () => {
    const privateUrl = 'https://';
    process.env.SUPABASE_URL = privateUrl;
    configureAdmin({
      createClientThrows: true,
      createClientError: new Error('Invalid supabaseUrl: Provided URL is malformed.'),
    });

    const result = await handler(makeRequest());

    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ error: 'authorization_unavailable' });
    expectSanitizedDiagnostic({
      stage: 'supabase_client_creation',
      category: 'client_initialization_failed',
      urlSource: 'SUPABASE_URL',
      apiKeySource: 'SUPABASE_ANON_KEY',
      urlValidation: 'invalid_url',
      constructorFailure: 'invalid_url',
    }, [privateUrl]);
  });

  it('classifies URLs that are empty after trimming as missing or invalid input', async () => {
    process.env.SUPABASE_URL = '   ';
    configureAdmin({
      createClientThrows: true,
      createClientError: new Error('supabaseUrl is required.'),
    });

    const result = await handler(makeRequest());

    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ error: 'authorization_unavailable' });
    expectSanitizedDiagnostic({
      stage: 'supabase_client_creation',
      category: 'client_initialization_failed',
      urlSource: 'SUPABASE_URL',
      apiKeySource: 'SUPABASE_ANON_KEY',
      urlValidation: 'missing_or_invalid_input',
      constructorFailure: 'missing_or_invalid_input',
    });
  });

  it('classifies valid HTTP URLs without logging their values', async () => {
    const privateUrl = 'http://private-project.example.test';
    process.env.SUPABASE_URL = privateUrl;
    configureAdmin({ createClientThrows: true });

    const result = await handler(makeRequest());

    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ error: 'authorization_unavailable' });
    expectSanitizedDiagnostic({
      stage: 'supabase_client_creation',
      category: 'client_initialization_failed',
      urlSource: 'SUPABASE_URL',
      apiKeySource: 'SUPABASE_ANON_KEY',
      urlValidation: 'valid_http_url',
      constructorFailure: 'unexpected_constructor_exception',
    }, [privateUrl, 'private-project']);
  });

  it('reports selected VITE variable names without logging their values', async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    process.env.VITE_SUPABASE_URL = 'https://private-project.supabase.example.test';
    process.env.VITE_SUPABASE_ANON_KEY = 'private-vite-anon-key';
    configureAdmin({ createClientThrows: true });

    const result = await handler(makeRequest());

    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ error: 'authorization_unavailable' });
    expectSanitizedDiagnostic({
      stage: 'supabase_client_creation',
      category: 'client_initialization_failed',
      urlSource: 'VITE_SUPABASE_URL',
      apiKeySource: 'VITE_SUPABASE_ANON_KEY',
      urlValidation: 'valid_https_url',
      constructorFailure: 'unexpected_constructor_exception',
    }, ['private-project', 'private-vite-anon-key']);
    expect(createClient).toHaveBeenCalledWith(
      'https://private-project.supabase.example.test',
      'private-vite-anon-key',
      expect.any(Object),
    );
  });

  it('preserves the service response when a required Supabase input is missing', async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.VITE_SUPABASE_URL;

    const result = await handler(makeRequest());

    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ error: 'service_unavailable' });
    expect(createClient).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('preserves the service response when the Supabase API key is missing', async () => {
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.VITE_SUPABASE_ANON_KEY;

    const result = await handler(makeRequest());

    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ error: 'service_unavailable' });
    expect(createClient).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('returns a safe service error when Supabase token verification is unavailable', async () => {
    configureAdmin({ getUserThrows: true });

    const result = await handler(makeRequest());

    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ error: 'authorization_unavailable' });
    expectSanitizedDiagnostic({
      stage: 'supabase_auth_exception',
      category: 'auth_request_failed',
    }, ['private auth network detail']);
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
    expectSanitizedDiagnostic({
      stage: 'supabase_admin_rpc_exception',
      category: 'rpc_invocation_failed',
    }, ['private admin network detail']);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('logs a safe stage when the admin RPC returns an error', async () => {
    const privateError = 'private RPC SQL detail';
    configureAdmin({ adminError: { message: privateError } });

    const result = await handler(makeRequest());

    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ error: 'authorization_unavailable' });
    expectSanitizedDiagnostic({
      stage: 'supabase_admin_rpc_error',
      category: 'rpc_returned_error',
    }, [privateError]);
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
        realtime: { transport: WebSocket },
        global: { headers: { Authorization: 'Bearer valid-test-token' } },
      }),
    );
    expect(result.headers.get('cache-control')).toContain('private');
    expect(result.headers.get('vary')).toBe('Authorization');
    expect(console.error).not.toHaveBeenCalled();
  });

  it.each([
    ['pending', 'PENDING'],
    ['subscribed', 'SUBSCRIBED'],
    ['unsubscribed', 'UNSUBSCRIBED'],
  ])('maps the v2 %s status while preserving subscriber fields', async (providerStatus, expectedStatus) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(200, {
      data: [{ ...providerContact, status: providerStatus }],
      paging: { next: null },
    })));

    const result = await handler(makeRequest());
    const payload = await result.json();

    expect(result.status).toBe(200);
    expect(payload.contacts).toEqual([expect.objectContaining({
      id: 'fixture-contact-id',
      email: 'subscriber@example.test',
      fields: {
        FirstName: 'Test',
        LastName: 'Subscriber',
        UpdateCategories: ['Webinars and events'],
        HealthInterests: ['Menopause'],
      },
      status: expectedStatus,
      createdAt: '2026-10-01T10:00:00Z',
    })]);
  });

  it.each([
    ['missing', undefined],
    ['unsupported', 'bounced'],
  ])('retains UNKNOWN for %s v2 contact status', async (_description, providerStatus) => {
    const contact = { ...providerContact };
    if (providerStatus === undefined) delete contact.status;
    else contact.status = providerStatus;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(200, {
      data: [contact],
      paging: { next: null },
    })));

    const result = await handler(makeRequest());
    const payload = await result.json();

    expect(result.status).toBe(200);
    expect(payload.contacts).toHaveLength(1);
    expect(payload.contacts[0].status).toBe('UNKNOWN');
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
