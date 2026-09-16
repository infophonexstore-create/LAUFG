// Flixly — simple offline cache. Everything the tool needs (HTML/CSS/JS) is in one file,
// so caching just that file (plus the manifest/icons) is enough for it to open offline too.
// Bump CACHE_NAME whenever you re-upload index.html so visitors get the new version instead
// of a stuck old one.
const CACHE_NAME = 'flixly-cache-v1';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Network-first: always try to get the latest version when online; fall back to the
// cached copy only when there's no connection (so an update you push doesn't get stuck
// behind an old cached copy for people who already installed it).
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
