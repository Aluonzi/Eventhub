var CACHE = 'eventhub-v2';
var SHELL = ['./'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) {
    return c.addAll(SHELL).catch(function() {});
  }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    }).then(function() { return clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  // Never cache Supabase API calls
  if (url.hostname.includes('supabase.co')) return;
  e.respondWith(
    fetch(e.request).then(function(r) {
      var rc = r.clone();
      caches.open(CACHE).then(function(c) { c.put(e.request, rc); });
      return r;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});
