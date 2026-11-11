/* Bangaliana Masala - service worker (standalone hosting) */
var CACHE = "bangaliana-v1";
var CORE = ["./", "./index.html", "./manifest.json", "./icon.svg", "./icon-maskable.svg"];
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(CORE).catch(function () {});
    }).then(function () { return self.skipWaiting(); })
  );
});
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).then(function (res) {
      if (res && res.status === 200 && event.request.url.indexOf(self.location.origin) === 0) {
        var copy = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); }).catch(function () {});
      }
      return res;
    }).catch(function () { return caches.match(event.request); })
  );
});
