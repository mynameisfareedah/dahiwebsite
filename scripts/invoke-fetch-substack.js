import { handler } from '../functions/fetch-substack-feed.js';

(async () => {
  try {
    const res = await handler({}, {});
    console.log('STATUS:', res.statusCode);
    console.log('HEADERS:', res.headers);
    // Print small preview of body
    const body = typeof res.body === 'string' ? res.body : JSON.stringify(res.body);
    console.log('BODY PREVIEW:', body.slice(0, 1000));
    // Try to parse JSON
    try {
      const data = JSON.parse(body);
      console.log('posts.length =', Array.isArray(data.posts) ? data.posts.length : 'no posts');
    } catch (err) {
      console.error('Failed to parse body as JSON', err);
    }
  } catch (err) {
    console.error('Invocation error', err);
  }
})();
