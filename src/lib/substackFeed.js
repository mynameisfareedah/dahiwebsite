const netlifyDevOrigin = import.meta.env.VITE_NETLIFY_DEV_ORIGIN || (typeof window !== 'undefined' && window.location.port === '3001' ? 'http://localhost:8888' : '');
const substackFeedProxyUrl = (netlifyDevOrigin ? `${netlifyDevOrigin}` : '') + '/.netlify/functions/fetch-substack-feed';

function isHtmlResponse(responseText, contentType) {
  return contentType?.includes('text/html') || responseText.trim().startsWith('<!doctype html') || responseText.trim().startsWith('<html');
}

export async function fetchSubstackPosts() {
  const response = await fetch(substackFeedProxyUrl, { cache: 'no-store' });
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

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

  return data.posts;
}
