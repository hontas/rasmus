const CACHE_NAME = 'rasmus-resa-v5';
const pathName = location.pathname.match(/(\/[^/]+\/([^/]+\/)*)/)[1];
const urlsToCache = [
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/assets/launcher-icon-1x.png',
  '/assets/launcher-icon-2x.png',
  '/assets/launcher-icon-4x.png',
  '/css/style.css',
  '/css/font-awesome.css',
  '/css/fonts/fontawesome-webfont.eot',
  '/css/fonts/fontawesome-webfont.svg',
  '/css/fonts/fontawesome-webfont.ttf',
  '/css/fonts/fontawesome-webfont.woff',
  '/css/fonts/fontawesome-webfont.woff2',
  '/js/vendor/leaflet@1.3.3.js',
  '/js/vendor/vue@2.5.17.js',
  '/js/googleDriveAPI.js',
  '/js/map.js',
  '/js/resrobot.js',
  '/js/sl.js',
  '/js/trafikverket.js',
  '/js/vasttrafik.js'
].map((str) => str.replace('/', pathName));

self.addEventListener('install', (event) => {
  event.waitUntil((async function aiife() {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urlsToCache);
    self.skipWaiting();
  }()));
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil((async function aiife() {
    const cacheNames = await caches.keys();
    const cachesToDelete = cacheNames
      .filter((cacheName) => !cacheWhitelist.includes(cacheName))
      .map((cacheName) => caches.delete(cacheName));
    await Promise.all(cachesToDelete);
    self.clients.claim();
  }()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith(self.location.origin)) {
    // update static cache
    event.respondWith((async function aiife() {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(event.request);
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });

      return response || fetchPromise;
    }()));
  }
});
