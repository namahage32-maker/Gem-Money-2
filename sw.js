const CACHE_NAME = 'gemmoney-cache-v14'; // v14に更新
const urlsToCache = [
  './index.html',
  './manifest.json',
  './icon.png'
];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
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
  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(event.request).then(function(cachedResponse) {
        const fetchPromise = fetch(event.request).then(function(networkResponse) {
          if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(function() {
          return cachedResponse;
        });
        return cachedResponse || fetchPromise;
      });
    })
  );
});