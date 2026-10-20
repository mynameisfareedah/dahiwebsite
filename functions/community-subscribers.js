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

function logAuthorizationFailure(stage, category) {
  console.error(JSON.stringify({
    event: 'subscriber_authorization_failure',
    stage,
    category,
    timestamp: new Date().toISOString(),
  }));
}

function classifySupabaseUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return 'missing_or_invalid_input';

  const trimmedUrl = url.trim();
  if (!/^https?:\/\//i.test(trimmedUrl)) return 'invalid_url';

  try {
    const parsedUrl = new URL(trimmedUrl.endsWith('/') ? trimmedUrl : `${trimmedUrl}/`);
    if (parsedUrl.protocol === 'https:') return 'valid_https_url';
    if (parsedUrl.protocol === 'http:') return 'valid_http_url';
  } catch {
    return 'invalid_url';
  }

  return 'invalid_url';
}

function classifySupabaseClientInitializationError(error) {
  const message = error instanceof Error ? error.message : '';

  if (message === 'supabaseUrl is required.' || message === 'supabaseKey is required.') {
    return 'missing_or_invalid_input';
  }
  if (
    message === 'Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.'
    || message === 'Invalid supabaseUrl: Provided URL is malformed.'
  ) {
    return 'invalid_url';
  }

  return 'unexpected_constructor_exception';
}

function getNodeMajor() {
  const nodeVersion = globalThis.process?.versions?.node;
  if (typeof nodeVersion !== 'string') return 'unknown';

  const match = /^v?(\d+)\./.exec(nodeVersion);
  if (!match) return 'unknown';

  const major = Number(match[1]);
  return Number.isSafeInteger(major) ? major : 'unknown';
}

function classifyRuntimeFailure(error, nodeMajor) {
  if (!(error instanceof Error)) return 'unknown_constructor_error';

  let expectedMessage;
  if (typeof nodeMajor !== 'number') {
    expectedMessage = 'Unknown JavaScript runtime without WebSocket support.\n\n'
      + "Suggested solution: Ensure you're running in a supported environment "
      + '(browser, Node.js, Deno) or provide a custom WebSocket implementation.';
  } else if (nodeMajor >= 22) {
    expectedMessage = `Node.js ${nodeMajor} detected but native WebSocket not found.\n\n`
      + 'Suggested solution: Provide a WebSocket implementation via the transport option.';
  } else {
    expectedMessage = `Node.js ${nodeMajor} detected without native WebSocket support.\n\n`
      + 'Suggested solution: For Node.js < 22, install "ws" package and provide it via the transport option:\n'
      + 'import ws from "ws"\n'
      + 'new RealtimeClient(url, { transport: ws })';
  }

  return error.message === expectedMessage
    ? 'websocket_runtime_unavailable'
    : 'unknown_constructor_error';
}

function classifyConstructorExceptionType(error) {
  if (error instanceof TypeError) return 'TypeError';
  if (error instanceof ReferenceError) return 'ReferenceError';
  if (error instanceof Error) return 'Error';
  return 'other';
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

  const supabaseUrlSource = process.env.SUPABASE_URL ? 'SUPABASE_URL' : 'VITE_SUPABASE_URL';
  const supabaseAnonKeySource = process.env.SUPABASE_ANON_KEY
    ? 'SUPABASE_ANON_KEY'
    : 'VITE_SUPABASE_ANON_KEY';
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
  } catch (error) {
    const nodeMajor = getNodeMajor();
    console.error(JSON.stringify({
      event: 'subscriber_authorization_failure',
      stage: 'supabase_client_creation',
      category: 'client_initialization_failed',
      urlSource: supabaseUrlSource,
      apiKeySource: supabaseAnonKeySource,
      urlValidation: classifySupabaseUrl(supabaseUrl),
      constructorFailure: classifySupabaseClientInitializationError(error),
      nodeMajor,
      webSocketAvailable: typeof globalThis.WebSocket === 'function',
      exceptionType: classifyConstructorExceptionType(error),
      runtimeFailureCategory: classifyRuntimeFailure(error, nodeMajor),
      timestamp: new Date().toISOString(),
    }));
    return jsonResponse(503, { error: 'authorization_unavailable' });
  }

  let authData;
  let authError;
  try {
    ({ data: authData, error: authError } = await supabase.auth.getUser(match[1]));
  } catch {
    logAuthorizationFailure('supabase_auth_exception', 'auth_request_failed');
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
    logAuthorizationFailure('supabase_admin_rpc_exception', 'rpc_invocation_failed');
    return jsonResponse(503, { error: 'authorization_unavailable' });
  }
  if (adminError) {
    logAuthorizationFailure('supabase_admin_rpc_error', 'rpc_returned_error');
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
