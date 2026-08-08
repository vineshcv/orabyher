/* Orabyher service worker — offline shell + runtime asset cache */
var CACHE_VERSION = "orabyher-v2";
var SHELL_CACHE = CACHE_VERSION + "-shell";
var RUNTIME_CACHE = CACHE_VERSION + "-runtime";

var SHELL_URLS = [
  "./",
  "./index.html",
  "./shop.html",
  "./cart.html",
  "./product.html",
  "./category.html",
  "./contact.html",
  "./customers.html",
  "./app.js",
  "./site.css",
  "./manifest.webmanifest",
  "./logo.png",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then(function (cache) {
        return cache.addAll(SHELL_URLS);
      })
      .then(function () {
        return self.skipWaiting();
      })
      .catch(function () {
        // Partial precache is fine; runtime cache fills gaps.
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) {
              return key.indexOf("orabyher-") === 0 && key.indexOf(CACHE_VERSION) !== 0;
            })
            .map(function (key) {
              return caches.delete(key);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isNavigate(request) {
  return (
    request.mode === "navigate" ||
    (request.method === "GET" &&
      request.headers.get("accept") &&
      request.headers.get("accept").indexOf("text/html") !== -1)
  );
}

function networkFirst(request) {
  return fetch(request)
    .then(function (response) {
      if (response && response.ok) {
        var copy = response.clone();
        caches.open(RUNTIME_CACHE).then(function (cache) {
          cache.put(request, copy);
        });
      }
      return response;
    })
    .catch(function () {
      return caches.match(request).then(function (cached) {
        if (cached) return cached;
        return caches.match("./index.html");
      });
    });
}

function cacheFirst(request) {
  return caches.match(request).then(function (cached) {
    if (cached) return cached;
    return fetch(request).then(function (response) {
      if (response && response.ok) {
        var copy = response.clone();
        caches.open(RUNTIME_CACHE).then(function (cache) {
          cache.put(request, copy);
        });
      }
      return response;
    });
  });
}

self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;

  var url;
  try {
    url = new URL(request.url);
  } catch (e) {
    return;
  }

  if (!isSameOrigin(url)) return;

  // Never cache service worker or API-ish paths
  if (url.pathname.endsWith("/sw.js")) return;

  if (isNavigate(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets: cache-first
  if (
    /\.(?:js|css|png|jpg|jpeg|webp|gif|svg|woff2?|webmanifest|json)$/i.test(
      url.pathname
    )
  ) {
    event.respondWith(cacheFirst(request));
  }
});
