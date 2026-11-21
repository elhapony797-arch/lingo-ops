self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request.url, {cache: 'no-cache'})
      .then(r => {
        const copy = r.clone();
        caches.open('lingo-v1').then(c => c.put(e.request.url, copy));
        return r;
      })
      .catch(() => caches.match(e.request.url))
  );
});
