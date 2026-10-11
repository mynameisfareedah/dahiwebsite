import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let fetchSubstackPost;
let fetchSubstackPosts;

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    text: async () => JSON.stringify(data),
  };
}

function createArticle(slug, fullContent = '<p>Complete article body.</p>') {
  return {
    slug,
    title: `Article ${slug}`,
    link: `https://womenshealthwithdocadi.substack.com/p/${slug}`,
    fullContent,
  };
}

describe('Substack feed caching and requests', () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ fetchSubstackPost, fetchSubstackPosts } = await import('../substackFeed'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('reuses complete article data from a successfully fetched feed', async () => {
    const article = createArticle('feed-cache-hit');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ posts: [article] }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchSubstackPosts()).resolves.toEqual([article]);
    await expect(fetchSubstackPost(article.slug)).resolves.toEqual(article);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/.netlify/functions/fetch-substack-feed', expect.any(Object));
  });

  it('uses the article endpoint for direct visits and caches a complete result', async () => {
    const article = createArticle('direct-visit');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ post: article }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchSubstackPost(article.slug)).resolves.toEqual(article);
    await expect(fetchSubstackPost(article.slug)).resolves.toEqual(article);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `/.netlify/functions/fetch-substack-feed?slug=${article.slug}`,
      expect.any(Object)
    );
  });

  it('fetches the article again after its five-minute cache expires', async () => {
    vi.useFakeTimers();
    const article = createArticle('expired-cache');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ post: article }));
    vi.stubGlobal('fetch', fetchMock);

    await fetchSubstackPost(article.slug);
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000 + 1);
    await fetchSubstackPost(article.slug);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('deduplicates simultaneous feed requests', async () => {
    const article = createArticle('deduplicated-feed');
    let resolveResponse;
    const fetchMock = vi.fn(() => new Promise((resolve) => {
      resolveResponse = resolve;
    }));
    vi.stubGlobal('fetch', fetchMock);

    const requests = [fetchSubstackPosts(), fetchSubstackPosts()];
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    resolveResponse(jsonResponse({ posts: [article] }));
    await expect(Promise.all(requests)).resolves.toEqual([[article], [article]]);
  });

  it('deduplicates simultaneous requests for the same article', async () => {
    const article = createArticle('deduplicated-article');
    let resolveResponse;
    const fetchMock = vi.fn(() => new Promise((resolve) => {
      resolveResponse = resolve;
    }));
    vi.stubGlobal('fetch', fetchMock);

    const requests = [fetchSubstackPost(article.slug), fetchSubstackPost(article.slug)];
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    resolveResponse(jsonResponse({ post: article }));
    await expect(Promise.all(requests)).resolves.toEqual([article, article]);
  });

  it('does not cache failed requests', async () => {
    const article = createArticle('retry-after-failure');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ error: 'unavailable' }, 502))
      .mockResolvedValueOnce(jsonResponse({ post: article }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchSubstackPost(article.slug)).rejects.toThrow('Unable to load Substack article');
    await expect(fetchSubstackPost(article.slug)).resolves.toEqual(article);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not treat incomplete article bodies as cached full articles', async () => {
    const article = createArticle('incomplete-article', '');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ post: article }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchSubstackPost(article.slug)).resolves.toEqual(article);
    await expect(fetchSubstackPost(article.slug)).resolves.toEqual(article);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not treat incomplete feed content as a cached full article', async () => {
    const incompleteArticle = createArticle('incomplete-feed-article', '');
    const completeArticle = createArticle('incomplete-feed-article');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ posts: [incompleteArticle] }))
      .mockResolvedValueOnce(jsonResponse({ post: completeArticle }));
    vi.stubGlobal('fetch', fetchMock);

    await fetchSubstackPosts();
    await expect(fetchSubstackPost(completeArticle.slug)).resolves.toEqual(completeArticle);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toContain(`?slug=${completeArticle.slug}`);
  });

  it('rejects when an actual feed request exceeds its ten-second timeout', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((url, { signal }) => {
      expect(url).toBe('/.netlify/functions/fetch-substack-feed');
      return new Promise((_, reject) => {
        signal.addEventListener('abort', () => {
          const error = new Error('Aborted');
          error.name = 'AbortError';
          reject(error);
        }, { once: true });
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const request = fetchSubstackPosts();
    const rejection = expect(request).rejects.toThrow('Substack request timed out');
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await vi.advanceTimersByTimeAsync(10_000);
    await rejection;
  });
});
