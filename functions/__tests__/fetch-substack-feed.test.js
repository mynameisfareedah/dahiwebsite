import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handler } from '../fetch-substack-feed.js';

const originalFeedUrl = process.env.SUBSTACK_FEED_URL;

function makeFeed(links) {
  return `<?xml version="1.0" encoding="UTF-8"?><rss xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel>${links.map((link, index) => `
    <item>
      <title><![CDATA[Same title]]></title>
      <link>${link}</link>
      <pubDate>Sun, 12 Sep 2026 00:00:00 GMT</pubDate>
      <description><![CDATA[Short summary]]></description>
      <content:encoded><![CDATA[<h2>Full article</h2><p>Complete article text ${index}</p><img src="https://substackcdn.com/image.jpg">]]></content:encoded>
    </item>`).join('')}</channel></rss>`;
}

function mockFeedResponse(links) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/rss+xml' }),
    text: async () => makeFeed(links),
  }));
}

beforeEach(() => {
  process.env.SUBSTACK_FEED_URL = 'https://womenshealthwithdocadi.substack.com/feed';
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  if (originalFeedUrl === undefined) {
    delete process.env.SUBSTACK_FEED_URL;
  } else {
    process.env.SUBSTACK_FEED_URL = originalFeedUrl;
  }
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Substack feed article lookup', () => {
  it('assigns stable distinct slugs and returns the complete body by slug', async () => {
    const links = [
      'https://womenshealthwithdocadi.substack.com/p/article-one',
      'https://womenshealthwithdocadi.substack.com/p/article-two',
    ];
    mockFeedResponse(links);
    const feedResponse = await handler({ httpMethod: 'GET', queryStringParameters: {} });
    const posts = JSON.parse(feedResponse.body).posts;

    expect(posts[0].slug).not.toBe(posts[1].slug);
    expect(posts[0].slug).toMatch(/^[a-z0-9-]+$/);
    expect(posts[0].fullContent).toContain('Complete article text');
    expect(posts[0].fullContent).toContain('<img');

    mockFeedResponse(links.slice().reverse());
    const reorderedResponse = await handler({ httpMethod: 'GET', queryStringParameters: {} });
    const reorderedPosts = JSON.parse(reorderedResponse.body).posts;
    expect(reorderedPosts.find((post) => post.link === posts[0].link).slug).toBe(posts[0].slug);

    mockFeedResponse(links);
    const articleResponse = await handler({
      httpMethod: 'GET',
      queryStringParameters: { slug: posts[0].slug },
    });
    expect(articleResponse.statusCode).toBe(200);
    expect(JSON.parse(articleResponse.body).post.fullContent).toBe(posts[0].fullContent);
  });

  it('returns not-found for slugs that are no longer in the feed', async () => {
    mockFeedResponse(['https://womenshealthwithdocadi.substack.com/p/current-post']);
    const response = await handler({
      httpMethod: 'GET',
      queryStringParameters: { slug: 'missing-article' },
    });

    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body).post).toBeNull();
  });

  it('does not treat descriptions as full article content', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/rss+xml' }),
      text: async () => '<rss><channel><item><title>Summary only</title><link>https://womenshealthwithdocadi.substack.com/p/summary-only</link><description>Only a short excerpt</description></item></channel></rss>',
    }));
    const response = await handler({ httpMethod: 'GET', queryStringParameters: {} });

    expect(JSON.parse(response.body).posts[0].fullContent).toBe('');
  });
});
