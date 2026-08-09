import { handler } from '../functions/fetch-substack-feed.js';
import fs from 'fs';

(async () => {
  try {
    const res = await handler({}, {});
    const body = typeof res.body === 'string' ? res.body : JSON.stringify(res.body);
    fs.writeFileSync('tmp-fetch-result.json', body);
    console.log('WROTE tmp-fetch-result.json');
  } catch (err) {
    console.error('Invocation error', err);
    process.exit(2);
  }
})();
