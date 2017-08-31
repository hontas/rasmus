const CACHE_NAME = 'rasmus-resa-v3';
let urlsToCache = [
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
  '/js/vendor/jquery-3.2.1.slim.min.js',
  '/js/vendor/moment.js',
  '/js/vendor/vue.js',
  '/js/resrobot.js',
  '/js/sl.js',
  '/js/trafikMeddelanden.js',
  '/js/tv.js',
  '/js/vt.js'
];

if (location.hostname !== 'localhost') {
  const pathName = location.pathname.match(/(\/[^/]+\/([^/]+\/)*)/)[1];
  urlsToCache = urlsToCache.map((str) => str.replace('/', pathName));
}

self.addEventListener('install', (event) => {
  event.waitUntil((async function aiife() {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urlsToCache);
    self.skipWaiting();
  }()));
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil((async function iife() {
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
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }

          return fetch(event.request);
        })
    );
  }
});
