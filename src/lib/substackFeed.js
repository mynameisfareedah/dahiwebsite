const substackFeedProxyUrl = '/.netlify/functions/fetch-substack-feed';
const requestTimeoutMs = 10_000;
const cacheTtlMs = 5 * 60 * 1000;

let feedCache = null;
const articleCache = new Map();
const inFlightRequests = new Map();

function isHtmlResponse(responseText, contentType) {
  return contentType?.includes('text/html') || responseText.trim().startsWith('<!doctype html') || responseText.trim().startsWith('<html');
}

function isValidArticle(post) {
  return Boolean(
    post
      && typeof post === 'object'
      && typeof post.slug === 'string'
      && post.slug
      && typeof post.title === 'string'
      && post.title
      && typeof post.link === 'string'
      && post.link
  );
}

function hasFullContent(post) {
  return isValidArticle(post) && typeof post.fullContent === 'string' && post.fullContent.trim().length > 0;
}

function deduplicateRequest(key, request) {
  const existingRequest = inFlightRequests.get(key);
  if (existingRequest) {
    return existingRequest;
  }

  const pendingRequest = Promise.resolve().then(request);
  inFlightRequests.set(key, pendingRequest);
  const clearRequest = () => {
    if (inFlightRequests.get(key) === pendingRequest) {
      inFlightRequests.delete(key);
    }
  };
  pendingRequest.then(clearRequest, clearRequest);
  return pendingRequest;
}

function getCachedArticle(slug) {
  const cachedArticle = articleCache.get(slug);
  if (!cachedArticle) {
    return null;
  }
  if (cachedArticle.expiresAt <= Date.now()) {
    articleCache.delete(slug);
    return null;
  }
  return cachedArticle.post;
}

function cacheCompleteArticle(post, expiresAt = Date.now() + cacheTtlMs) {
  if (hasFullContent(post)) {
    articleCache.set(post.slug, { post, expiresAt });
  }
}

function cacheFeedPosts(posts) {
  const validPosts = posts.filter(isValidArticle);
  if (validPosts.length > 0) {
    const expiresAt = Date.now() + cacheTtlMs;
    if (validPosts.length === posts.length) {
      feedCache = { posts, expiresAt };
    }
    validPosts.forEach((post) => cacheCompleteArticle(post, expiresAt));
  }
}

function getCachedFeedPosts() {
  if (!feedCache) {
    return null;
  }
  if (feedCache.expiresAt <= Date.now()) {
    feedCache = null;
    return null;
  }
  return feedCache.posts;
}

async function fetchSubstackResponse(url) {
  const controller = new window.AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
    const text = await response.text();
    return { response, text };
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('Substack request timed out');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function loadSubstackPosts() {
  const { response, text } = await fetchSubstackResponse(substackFeedProxyUrl);
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    console.error('Netlify function returned non-OK status', { status: response.status, text });
    throw new Error('Unable to load Substack feed');
  }

  if (isHtmlResponse(text, contentType)) {
    console.error('Netlify function returned HTML instead of JSON', { contentType, textSnippet: text.slice(0, 200) });
    throw new Error('Invalid response from feed proxy');
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse JSON from Netlify function', err, { textSnippet: text.slice(0, 200) });
    throw new Error('Invalid JSON from feed proxy');
  }

  if (!data || !Array.isArray(data.posts)) {
    console.error('[Blog] Invalid function response:', text);
    throw new Error('Unexpected feed data shape');
  }

  cacheFeedPosts(data.posts);
  return data.posts;
}

export function fetchSubstackPosts() {
  const cachedPosts = getCachedFeedPosts();
  if (cachedPosts) {
    return Promise.resolve(cachedPosts);
  }
  return deduplicateRequest('feed', loadSubstackPosts);
}

async function loadSubstackPost(slug) {
  const { response, text } = await fetchSubstackResponse(`${substackFeedProxyUrl}?slug=${encodeURIComponent(slug)}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    console.error('Netlify function returned non-OK status', { status: response.status, text });
    throw new Error('Unable to load Substack article');
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse article JSON from Netlify function', err, { textSnippet: text.slice(0, 200) });
    throw new Error('Invalid JSON from article proxy');
  }

  if (!data || !Object.prototype.hasOwnProperty.call(data, 'post')) {
    console.error('[Blog] Invalid article function response:', text);
    throw new Error('Unexpected article data shape');
  }

  if (data.post !== null && !isValidArticle(data.post)) {
    console.error('[Blog] Invalid article data:', text);
    throw new Error('Unexpected article data shape');
  }

  if (data.post?.slug === slug) {
    cacheCompleteArticle(data.post);
  }

  return data.post;
}

export function fetchSubstackPost(slug) {
  const cachedArticle = getCachedArticle(slug);
  if (cachedArticle) {
    return Promise.resolve(cachedArticle);
  }
  return deduplicateRequest(`article:${slug}`, () => loadSubstackPost(slug));
}
