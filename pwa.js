(function () {
  // iOS Safari standalone (Add to Home Screen)
  if (window.navigator.standalone === true) {
    document.documentElement.classList.add("ios-standalone");
  }

  if (!("serviceWorker" in navigator)) return;

  var MIGRATE_KEY = "orabyher-sw-migrate-v4";

  function clearBrowserCaches() {
    if (!window.caches) return Promise.resolve();
    return caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          return caches.delete(key);
        })
      );
    });
  }

  // One-time: wipe old cache-first SW data that forced repeated hard refreshes
  if (!localStorage.getItem(MIGRATE_KEY)) {
    localStorage.setItem(MIGRATE_KEY, "1");
    Promise.all([
      navigator.serviceWorker.getRegistrations().then(function (regs) {
        return Promise.all(
          regs.map(function (reg) {
            return reg.unregister();
          })
        );
      }),
      clearBrowserCaches(),
    ]).then(function () {
      window.location.reload();
    });
    return;
  }

  var refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", function () {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  function registerAndUpdate() {
    return navigator.serviceWorker
      .register("sw.js", { updateViaCache: "none" })
      .then(function (reg) {
        try {
          reg.update();
        } catch (e) {}

        function activateWaiting(worker) {
          if (!worker) return;
          worker.postMessage({ type: "SKIP_WAITING" });
        }

        if (reg.waiting) activateWaiting(reg.waiting);

        reg.addEventListener("updatefound", function () {
          var worker = reg.installing;
          if (!worker) return;
          worker.addEventListener("statechange", function () {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              activateWaiting(worker);
            }
          });
        });

        return reg;
      })
      .catch(function () {});
  }

  window.addEventListener("load", function () {
    registerAndUpdate();
  });

  // Pick up deploys when user returns to the tab
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState !== "visible") return;
    if (!navigator.serviceWorker.controller) return;
    navigator.serviceWorker.getRegistration().then(function (reg) {
      if (reg) {
        try {
          reg.update();
        } catch (e) {}
      }
    });
  });
})();
