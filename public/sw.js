const CACHE_NAME = 'reptronome-cache-v1';
// Cache the essential files: The HTML file itself (represented by the root path) and the external Tailwind CSS dependency.
const urlsToCache = [
    '/', // Caches the main HTML file (or root context)
    'https://cdn.tailwindcss.com',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching critical resources.');
                return cache.addAll(urlsToCache).catch(err => {
                    console.error('Service Worker: Failed to cache resources', err);
                });
            })
    );
    self.skipWaiting(); // Immediately activate the new service worker
});

self.addEventListener('activate', (event) => {
    // Clean up old caches
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    event.waitUntil(clients.claim()); // Take control of clients
});

self.addEventListener('fetch', (event) => {
    // Serve cached content first
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // Fallback to network request (e.g., for speech API)
                return fetch(event.request);
            }
        )
    );
});