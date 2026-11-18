const CACHE_NAME = 'gemmoney-cache-v36'; // v36に更新
const REQUIRED_FILES = [
  './',
  './index.html',
  './manifest.json'
];
const OPTIONAL_FILES = [
  './icon.png'
];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async function(cache) {
        await cache.addAll(REQUIRED_FILES);
        await Promise.allSettled(
          OPTIONAL_FILES.map(function(url) {
            return cache.add(url).catch(function() {});
          })
        );
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// キャッシュを即座に返しつつ、裏で最新ファイルがあればキャッシュを更新（Stale-While-Revalidate）
self.addEventListener('fetch', function(event) {
  if (!event.request.url.startsWith('http')) return;
  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(event.request).then(function(cachedResponse) {
        const fetchPromise = fetch(event.request).then(function(networkResponse) {
          if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(function() {
          return cachedResponse || new Response('', { status: 404, statusText: 'Offline' });
        });
        return cachedResponse || fetchPromise;
      });
    })
  );
});