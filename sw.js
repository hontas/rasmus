const CACHE_NAME = 'rasmus-resa-v1';
let urlsToCache = [
  '/',
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
  console.log('prefixing url path');
  urlsToCache = urlsToCache.map((str) => `/rasmus${str}`);
}


self.addEventListener('install', (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        cache.addAll(urlsToCache)
          .then(self.skipWaiting);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.map((cacheName) => {
        if (cacheWhitelist.indexOf(cacheName) === -1) {
          return caches.delete(cacheName);
        }
      })
    ))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
