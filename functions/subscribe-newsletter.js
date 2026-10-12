const EMAILOCTOPUS_API = 'https://api.emailoctopus.com';
const MAX_BODY_BYTES = 4096;

export const config = {
  path: '/.netlify/functions/subscribe-newsletter',
  rateLimit: {
    action: 'rate_limit',
    aggregateBy: ['ip', 'domain'],
    windowSize: 60,
    windowLimit: 10,
  },
};

function jsonResponse(statusCode, payload, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
    body: JSON.stringify(payload),
  };
}

function headerValue(headers, name) {
  const matchingKey = Object.keys(headers || {}).find((key) => key.toLowerCase() === name);
  return matchingKey ? headers[matchingKey] : '';
}

function getDuplicateContact(error, details) {
  const duplicateText = `${details?.type || ''} ${details?.title || ''} ${details?.detail || ''}`.toLowerCase();
  const isConflict = error.status === 409 || details?.status === 409;
  if (isConflict && duplicateText.includes('already-exists')) return true;

  return duplicateText.includes('already exists')
    || duplicateText.includes('duplicate contact')
    || duplicateText.includes('member_exists_with_email_address');
}

async function readProviderResponse(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export const handleNewsletterEvent = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'method_not_allowed' }, { Allow: 'POST' });
  }

  const contentType = headerValue(event.headers, 'content-type');
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    return jsonResponse(415, { error: 'unsupported_media_type' });
  }

  const bodyText = event.body || '';
  if (Buffer.byteLength(bodyText, 'utf8') > MAX_BODY_BYTES) {
    return jsonResponse(413, { error: 'request_too_large' });
  }

  let body;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonResponse(400, { error: 'invalid_request' });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse(400, { error: 'invalid_email' });
  }
  if (firstName.length > 80 || (body.firstName !== undefined && typeof body.firstName !== 'string')) {
    return jsonResponse(400, { error: 'invalid_first_name' });
  }
  if (body.consent !== true) {
    return jsonResponse(400, { error: 'consent_required' });
  }

  if (typeof body.website === 'string' && body.website.trim()) {
    return jsonResponse(200, { accepted: true });
  }

  const apiKey = process.env.EMAILOCTOPUS_API_KEY;
  const listId = process.env.EMAILOCTOPUS_LIST_ID;
  if (!apiKey || !listId) {
    return jsonResponse(503, { error: 'newsletter_unavailable' });
  }

  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  const listUrl = `${EMAILOCTOPUS_API}/lists/${encodeURIComponent(listId)}`;
  const contactsUrl = `${listUrl}/contacts`;

  try {
    const listResponse = await fetch(listUrl, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10000),
    });
    const list = await readProviderResponse(listResponse);
    if (!listResponse.ok || list?.double_opt_in !== true) {
      return jsonResponse(503, { error: 'newsletter_unavailable' });
    }

    const contact = { email_address: email };
    if (firstName) contact.fields = { FirstName: firstName };

    const contactResponse = await fetch(contactsUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(contact),
      signal: AbortSignal.timeout(10000),
    });

    const createdContact = await readProviderResponse(contactResponse);
    if (contactResponse.status === 201 && createdContact?.status === 'pending') {
      return jsonResponse(200, { accepted: true });
    }

    if (getDuplicateContact(contactResponse, createdContact)) {
      return jsonResponse(200, { accepted: true });
    }

    return jsonResponse(502, { error: 'newsletter_unavailable' });
  } catch {
    return jsonResponse(502, { error: 'newsletter_unavailable' });
  }
};

export default async (request) => {
  const event = {
    httpMethod: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.text(),
  };
  const result = await handleNewsletterEvent(event);

  return new Response(result.body, {
    status: result.statusCode,
    headers: result.headers,
  });
};
