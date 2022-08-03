const CACHE_KEY = 'budget-tracker';

const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/index.js',
    '/indexedDb.js',
    '/styles.css',
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_KEY).then(function (cache) {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (e) => {
    if (e.request.url.includes('/api/')) {
        e.respondWith(
            caches
                .open(CACHE_KEY)
                .then((cachedResponse) => {
                    return fetch(e.request).then((response) => {
                        cachedResponse.put(e.request.url, response.clone());

                        return response;
                    });
                })
                .catch((err) => console.log(err))
        );
    }

    e.respondWith(
        fetch(e.request).catch(() => {
            return caches.match(e.request).then(response => {
                if(response) {
                    return response
                } else if (e.request.headers.get('accept').includes('text/html')){
                    return caches.match('/')
                }
            })
        })
    );

});