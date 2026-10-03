const CACHE_NAME = 'gemmoney-cache-v1';
const urlsToCache = [
  './index.html', // お手元のHTMLファイル名に合わせる
  './manifest.json',
  './icon.png'
];

// インストール時にファイルをキャッシュに保存
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// オフライン時はキャッシュからファイルを返す
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response; // キャッシュがあればそれを返す（完全オフライン動作）
        }
        return fetch(event.request); // なければネットワークを取りに行く
      })
  );
});