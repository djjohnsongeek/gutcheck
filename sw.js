const CACHE_NAME = 'pwa-cache-v000021';
const urlsToCache = [
    './',
    './favicon.ico',
    './index.html',
    './summary.html',
    './manifest.json',
    './styles/site.css',
    './img/icon192.png',
    './img/icon512.png',
    './lib/idb.js',
    "./lib/chart.js",
    './lib/pico.css',
    './lib/pico.colors.css',
    './src/FoodChoicesRepo.js',
    './src/index.js',
    './src/summary.js',
    "./src/Alerts.js",
    "./src/UserSettings.js"
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                return response;
            })
            .catch(() => caches.open(CACHE_NAME).then(cache => cache.match(event.request)))
    );
});