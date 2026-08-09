const CACHE_NAME = 'dahi-cache-v1';
const APP_SHELL = ['/', '/index.html', '/manifest.json', '/favicon.ico', '/logo.jpeg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  // Allow cross-origin requests to pass through
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  // Don't intercept Netlify Functions API requests - let them hit the network
  if (requestUrl.pathname.startsWith('/.netlify/functions/')) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/') )
    );
    return;
  }

  const shellFiles = APP_SHELL.concat(['/index.html']);
  if (!shellFiles.includes(requestUrl.pathname)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
