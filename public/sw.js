/**
 * Radiant Spark Global Mobile PWA Service Worker
 */
const CACHE_NAME = 'radiant-spark-v5';
const ASSETS_TO_CACHE = [
  './manifest.json',
  './lifespark-manifest.json',
  './icon.svg',
  './radiant-sparkle-logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = event.request.url || '';
  if (url.includes('/api/') || url.endsWith('.zip')) return;

  const isHtmlOrFeed =
    event.request.mode === 'navigate' ||
    url.endsWith('/') ||
    url.endsWith('.html') ||
    url.includes('deals-feed.json');

  if (isHtmlOrFeed) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(event.request).then((c) => c || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => caches.match('./index.html'))
      );
    })
  );
});
