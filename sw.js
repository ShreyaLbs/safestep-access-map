const CACHE_NAME = 'safestep-cache-v9';
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './data/seed-reports.js',
  './icon.svg',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  
  // Only intercept same-origin requests (our static files)
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        // Return cached response if found, else fetch from network
        return cachedResponse || fetch(e.request);
      })
    );
  }
  // All other requests (like Leaflet tiles, CDN scripts) go straight to network naturally
});
