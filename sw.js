/* Orabyher SW — images only. Never caches HTML/JS/CSS (avoids stale updates). */
var CACHE_VERSION = "orabyher-v4";
var IMAGE_CACHE = CACHE_VERSION + "-images";

self.addEventListener("install", function (event) {
  // Take over immediately so stuck old SWs are replaced
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys.map(function (key) {
            // Drop every previous cache (shell/runtime/old versions)
            if (key !== IMAGE_CACHE) return caches.delete(key);
            return null;
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data && event.data.type === "CLEAR_CACHES") {
    event.waitUntil(
      caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (key) {
          return caches.delete(key);
        }));
      })
    );
  }
});

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isImage(pathname) {
  return /\.(?:png|jpg|jpeg|webp|gif|svg)$/i.test(pathname);
}

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

  // Critical: do NOT intercept HTML / JS / CSS / JSON / SW / manifest.
  // Browser + Worker Cache-Control handle freshness.
  if (
    url.pathname.endsWith("/sw.js") ||
    /\.(?:html|js|css|webmanifest|json)$/i.test(url.pathname) ||
    url.pathname === "/" ||
    !url.pathname.split("/").pop().includes(".")
  ) {
    return;
  }

  // Only help offline for product/category images
  if (!isImage(url.pathname)) return;

  event.respondWith(
    caches.open(IMAGE_CACHE).then(function (cache) {
      return cache.match(request).then(function (cached) {
        var network = fetch(request)
          .then(function (response) {
            if (response && response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(function () {
            return cached;
          });
        // Prefer network so new product images show; fall back to cache offline
        return network.then(function (response) {
          return response || cached;
        });
      });
    })
  );
});
