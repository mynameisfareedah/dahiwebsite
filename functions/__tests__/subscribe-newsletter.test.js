import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import newsletterFunction, { config, handleNewsletterEvent } from '../subscribe-newsletter.js';

const originalApiKey = process.env.EMAILOCTOPUS_API_KEY;
const originalListId = process.env.EMAILOCTOPUS_LIST_ID;
let requestNumber = 0;
let testRun = 0;

function makeEvent(body, options = {}) {
  requestNumber += 1;
  const headers = {
    'content-type': options.contentType || 'application/json',
  };
  if (options.ip !== null) {
    headers['x-nf-client-connection-ip'] = options.ip || `192.0.${testRun}.${requestNumber}`;
  }

  return {
    httpMethod: options.method || 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  };
}

function mockProvider({
  listResponse,
  contactResponse,
  listStatus = 200,
  contactStatus = 201,
} = {}) {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify(listResponse ?? { double_opt_in: true }), { status: listStatus }))
    .mockResolvedValueOnce(new Response(JSON.stringify(contactResponse ?? { status: 'pending' }), { status: contactStatus }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(() => {
  requestNumber = 0;
  testRun += 1;
  process.env.EMAILOCTOPUS_API_KEY = 'test-api-key';
  process.env.EMAILOCTOPUS_LIST_ID = 'test-list-id';
});

afterEach(() => {
  if (originalApiKey === undefined) delete process.env.EMAILOCTOPUS_API_KEY;
  else process.env.EMAILOCTOPUS_API_KEY = originalApiKey;
  if (originalListId === undefined) delete process.env.EMAILOCTOPUS_LIST_ID;
  else process.env.EMAILOCTOPUS_LIST_ID = originalListId;
  vi.unstubAllGlobals();
});

describe('subscribe-newsletter Netlify Function', () => {
  it('declares Netlify per-IP rate limiting on the existing endpoint', () => {
    expect(config).toEqual({
      path: '/.netlify/functions/subscribe-newsletter',
      rateLimit: {
        action: 'rate_limit',
        aggregateBy: ['ip', 'domain'],
        windowSize: 60,
        windowLimit: 10,
      },
    });
  });

  it('adapts modern Netlify requests to the existing handler response semantics', async () => {
    const response = await newsletterFunction(new Request(
      'https://example.net/.netlify/functions/subscribe-newsletter',
      { method: 'GET' },
    ));

    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST');
    expect(await response.json()).toEqual({ error: 'method_not_allowed' });
  });

  it('rejects invalid request content through the deployed request handler', async () => {
    const response = await newsletterFunction(new Request(
      'https://example.net/.netlify/functions/subscribe-newsletter',
      {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: 'invalid',
      },
    ));

    expect(response.status).toBe(415);
    expect(await response.json()).toEqual({ error: 'unsupported_media_type' });
  });

  it('creates a consented contact on a double-opt-in list', async () => {
    const fetchMock = mockProvider();
    const response = await handleNewsletterEvent(makeEvent({
      email: '  READER@example.com ',
      firstName: ' Ada ',
      lastName: ' Lovelace ',
      consent: true,
    }));

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ accepted: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.emailoctopus.com/lists/test-list-id');
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer test-api-key');
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.emailoctopus.com/lists/test-list-id/contacts');
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      email_address: 'reader@example.com',
      fields: {
        FirstName: 'Ada',
        LastName: 'Lovelace',
      },
    });
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).status).toBeUndefined();
  });

  it.each([
    [{ firstName: ' Ada ' }, { FirstName: 'Ada' }],
    [{ lastName: ' Lovelace ' }, { LastName: 'Lovelace' }],
    [{}, undefined],
  ])('creates a contact with optional name values %s', async (names, expectedFields) => {
    const fetchMock = mockProvider();
    const response = await handleNewsletterEvent(makeEvent({
      email: 'reader@example.com',
      consent: true,
      ...names,
    }));

    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(fetchMock.mock.calls[1][1].body);
    if (expectedFields) expect(payload.fields).toEqual(expectedFields);
    else expect(payload).not.toHaveProperty('fields');
  });

  it('includes last name alongside both selected preference fields', async () => {
    const fetchMock = mockProvider();
    const response = await handleNewsletterEvent(makeEvent({
      email: 'reader@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      consent: true,
      updateCategories: ['Webinars and events'],
      healthInterests: ['Menstrual health'],
    }));

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).fields).toEqual({
      FirstName: 'Ada',
      LastName: 'Lovelace',
      UpdateCategories: ['Webinars and events'],
      HealthInterests: ['Menstrual health'],
    });
  });

  it('maps multiple approved preferences to the exact EmailOctopus fields', async () => {
    const fetchMock = mockProvider();
    const response = await handleNewsletterEvent(makeEvent({
      email: 'reader@example.com',
      consent: true,
      updateCategories: [
        'Webinars and events',
        'Community outreach updates',
      ],
      healthInterests: [
        'Menstrual health',
        'Nutrition and healthy living',
      ],
    }));

    expect(response.statusCode).toBe(200);
    expect(fetchMock.mock.calls[1][1].method).toBe('POST');
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      email_address: 'reader@example.com',
      fields: {
        UpdateCategories: ['Webinars and events', 'Community outreach updates'],
        HealthInterests: ['Menstrual health', 'Nutrition and healthy living'],
      },
    });
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).not.toHaveProperty('status');
  });

  it('omits optional preference fields when no choices are selected', async () => {
    const fetchMock = mockProvider();
    const response = await handleNewsletterEvent(makeEvent({
      email: 'reader@example.com',
      consent: true,
      updateCategories: [],
      healthInterests: [],
    }));

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      email_address: 'reader@example.com',
    });
  });

  it('sends a single selection as a one-item array and omits the other preference field', async () => {
    const fetchMock = mockProvider();
    const response = await handleNewsletterEvent(makeEvent({
      email: 'reader@example.com',
      consent: true,
      updateCategories: ['Webinars and events'],
      healthInterests: [],
    }));

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      email_address: 'reader@example.com',
      fields: {
        UpdateCategories: ['Webinars and events'],
      },
    });
  });

  it.each([
    [{ updateCategories: 'Webinars and events' }, 'string instead of an array'],
    [{ healthInterests: [null] }, 'non-string choices'],
    [{ updateCategories: ['Unknown category'] }, 'unknown categories'],
    [{ healthInterests: ['Unknown topic'] }, 'unknown health topics'],
    [{ updateCategories: ['Webinars and events', 'Webinars and events'] }, 'duplicate categories'],
    [{ healthInterests: ['Menstrual health', 'Menstrual health'] }, 'duplicate health topics'],
    [{
      updateCategories: [
        'Health tips and educational resources',
        'Webinars and events',
        'Community outreach updates',
        'Volunteering and participation opportunities',
        'extra',
      ],
    }, 'excessive category selections'],
    [{
      healthInterests: [
        'Menstrual health',
        'Fertility and conception',
        'Pregnancy and childbirth',
        'Breast health',
        'Family planning',
        'Menopause',
        'Mental health and wellbeing',
        'Nutrition and healthy living',
        'Sexual and reproductive health',
        'Preventive healthcare',
        'extra',
      ],
    }, 'excessive health selections'],
  ])('rejects %s', async (preferences) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const response = await handleNewsletterEvent(makeEvent({
      email: 'reader@example.com',
      consent: true,
      ...preferences,
    }));

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: 'invalid_preferences' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects unexpected request properties such as a caller-supplied status', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const response = await handleNewsletterEvent(makeEvent({
      email: 'reader@example.com',
      consent: true,
      status: 'subscribed',
    }));

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: 'invalid_request' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(['EMAILOCTOPUS_API_KEY', 'EMAILOCTOPUS_LIST_ID'])(
    'fails closed when %s is missing',
    async (credential) => {
      delete process.env[credential];
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      const response = await handleNewsletterEvent(makeEvent({
        email: 'reader@example.com',
        consent: true,
        updateCategories: ['Webinars and events'],
        healthInterests: ['Menstrual health'],
      }));

      expect(response.statusCode).toBe(503);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it('rejects invalid JSON', async () => {
    const response = await handleNewsletterEvent(makeEvent('{'));

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error: 'invalid_json' });
  });

  it('rejects a non-JSON content type', async () => {
    const response = await handleNewsletterEvent(makeEvent({}, { contentType: 'text/plain' }));

    expect(response.statusCode).toBe(415);
    expect(JSON.parse(response.body)).toEqual({ error: 'unsupported_media_type' });
  });

  it('rejects an oversized payload', async () => {
    const response = await handleNewsletterEvent(makeEvent('x'.repeat(4097)));

    expect(response.statusCode).toBe(413);
    expect(JSON.parse(response.body)).toEqual({ error: 'request_too_large' });
  });

  it('accepts honeypot submissions without calling EmailOctopus', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const response = await handleNewsletterEvent(makeEvent({
      email: 'reader@example.com',
      consent: true,
      website: 'https://spam.example',
    }));

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ accepted: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    [{ email: 'not-an-email', consent: true }, 'invalid_email'],
    [{ email: 'reader@example.com', consent: false }, 'consent_required'],
    [{ email: 'reader@example.com', consent: true, firstName: 7 }, 'invalid_first_name'],
    [{ email: 'reader@example.com', consent: true, lastName: 7 }, 'invalid_last_name'],
    [{ email: 'reader@example.com', consent: true, lastName: 'L'.repeat(81) }, 'invalid_last_name'],
  ])('rejects invalid request data %#', async (body, error) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const response = await handleNewsletterEvent(makeEvent(body));

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ error });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fails closed if double opt-in is not enabled on the configured list', async () => {
    const fetchMock = mockProvider({ listResponse: { double_opt_in: false } });

    const response = await handleNewsletterEvent(makeEvent({ email: 'reader@example.com', consent: true }));

    expect(response.statusCode).toBe(503);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not create a contact when the provider list response is unexpected', async () => {
    const fetchMock = mockProvider({ listResponse: { name: 'DAHI list' } });

    const response = await handleNewsletterEvent(makeEvent({ email: 'reader@example.com', consent: true }));

    expect(response.statusCode).toBe(503);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns a generic error when EmailOctopus times out', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ double_opt_in: true }), { status: 200 }))
      .mockRejectedValueOnce(new DOMException('The operation timed out', 'TimeoutError'));
    vi.stubGlobal('fetch', fetchMock);

    const response = await handleNewsletterEvent(makeEvent({ email: 'reader@example.com', consent: true }));

    expect(response.statusCode).toBe(502);
    expect(JSON.parse(response.body)).toEqual({ error: 'newsletter_unavailable' });
  });

  it('returns a generic error for invalid EmailOctopus credentials', async () => {
    const fetchMock = mockProvider({
      listResponse: { detail: 'Invalid API key value' },
      listStatus: 401,
    });
    const response = await handleNewsletterEvent(makeEvent({ email: 'reader@example.com', consent: true }));

    expect(response.statusCode).toBe(503);
    expect(response.body).not.toContain('Invalid API key value');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each(['pending', 'subscribed', 'unsubscribed'])(
    'does not change an existing %s contact',
    async () => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce(new Response(JSON.stringify({ double_opt_in: true }), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify({
          type: 'https://emailoctopus.com/api-documentation/v2#already-exists',
          title: 'An error occurred.',
          detail: 'A contact already exists with this email address.',
          status: 409,
        }), { status: 409 }));
      vi.stubGlobal('fetch', fetchMock);

      const response = await handleNewsletterEvent(makeEvent({
        email: 'reader@example.com',
        consent: true,
        updateCategories: ['Webinars and events'],
        healthInterests: ['Menstrual health'],
      }));

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({ accepted: true });
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][1].method).toBe('POST');
      expect(fetchMock.mock.calls[1][1].method).not.toBe('PUT');
      expect(JSON.parse(fetchMock.mock.calls[1][1].body).fields).toEqual({
        UpdateCategories: ['Webinars and events'],
        HealthInterests: ['Menstrual health'],
      });
    },
  );

  it('does not treat an unrelated conflict as an existing contact', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ double_opt_in: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        type: 'https://emailoctopus.com/api-documentation/v2#conflict',
        detail: 'The request conflicts with the system state.',
        status: 409,
      }), { status: 409 }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await handleNewsletterEvent(makeEvent({ email: 'reader@example.com', consent: true }));

    expect(response.statusCode).toBe(502);
    expect(JSON.parse(response.body)).toEqual({ error: 'newsletter_unavailable' });
  });

  it.each([
    [{ status: 'subscribed' }, 201],
    [{ status: 'pending' }, 200],
  ])('does not report unexpected contact creation as a confirmed signup', async (contactResponse, contactStatus) => {
    const fetchMock = mockProvider({ contactResponse, contactStatus });

    const response = await handleNewsletterEvent(makeEvent({ email: 'reader@example.com', consent: true }));

    expect(response.statusCode).toBe(502);
    expect(JSON.parse(response.body)).toEqual({ error: 'newsletter_unavailable' });
  });

  it('returns a generic provider error without leaking provider details', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ double_opt_in: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ detail: 'Sensitive provider diagnostic' }), { status: 500 }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await handleNewsletterEvent(makeEvent({ email: 'reader@example.com', consent: true }));

    expect(response.statusCode).toBe(502);
    expect(response.body).not.toContain('Sensitive provider diagnostic');
  });

  it('returns a generic error when EmailOctopus rejects preference fields', async () => {
    const fetchMock = mockProvider({
      contactResponse: {
        title: 'Invalid field value',
        detail: 'A private provider validation detail',
        status: 422,
      },
      contactStatus: 422,
    });
    const response = await handleNewsletterEvent(makeEvent({
      email: 'reader@example.com',
      consent: true,
      updateCategories: ['Webinars and events'],
      healthInterests: ['Menstrual health'],
    }));

    expect(response.statusCode).toBe(502);
    expect(JSON.parse(response.body)).toEqual({ error: 'newsletter_unavailable' });
    expect(response.body).not.toContain('private provider validation detail');
  });

});
