(function () {
  // iOS Safari standalone (Add to Home Screen)
  if (window.navigator.standalone === true) {
    document.documentElement.classList.add("ios-standalone");
  }

  var DISMISS_KEY = "orabyher-install-dismissed";
  var MIGRATE_KEY = "orabyher-sw-migrate-v4";
  var deferredPrompt = null;

  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  function isIos() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  }

  function hideInstallBanner() {
    var el = document.getElementById("pwa-install-banner");
    if (el) el.remove();
  }

  function dismissInstallBanner() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch (e) {}
    hideInstallBanner();
  }

  function wasDismissedRecently() {
    try {
      var raw = localStorage.getItem(DISMISS_KEY);
      if (!raw) return false;
      // Show again after 14 days
      return Date.now() - Number(raw) < 14 * 24 * 60 * 60 * 1000;
    } catch (e) {
      return false;
    }
  }

  function showInstallBanner(mode) {
    if (isStandalone() || wasDismissedRecently()) return;
    if (document.getElementById("pwa-install-banner")) return;

    var banner = document.createElement("div");
    banner.id = "pwa-install-banner";
    banner.className = "pwa-install-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Install Orabyher app");

    var text =
      mode === "ios"
        ? 'Install Orabyher: tap <strong>Share</strong> then <strong>Add to Home Screen</strong>'
        : "Install Orabyher for faster shopping";

    banner.innerHTML =
      '<div class="pwa-install-inner">' +
      '<img class="pwa-install-icon" src="icon-192.png" alt="" width="40" height="40" />' +
      '<p class="pwa-install-text">' +
      text +
      "</p>" +
      (mode === "android"
        ? '<button type="button" class="pwa-install-btn" id="pwa-install-btn">Install</button>'
        : "") +
      '<button type="button" class="pwa-install-close" id="pwa-install-close" aria-label="Dismiss">&times;</button>' +
      "</div>";

    document.body.appendChild(banner);
    requestAnimationFrame(function () {
      banner.classList.add("is-visible");
    });

    var closeBtn = document.getElementById("pwa-install-close");
    if (closeBtn) closeBtn.addEventListener("click", dismissInstallBanner);

    var installBtn = document.getElementById("pwa-install-btn");
    if (installBtn) {
      installBtn.addEventListener("click", function () {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function () {
          deferredPrompt = null;
          hideInstallBanner();
        });
      });
    }
  }

  // Chrome/Edge/Android: catch install event and show our banner
  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredPrompt = event;
    showInstallBanner("android");
  });

  window.addEventListener("appinstalled", function () {
    deferredPrompt = null;
    hideInstallBanner();
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch (e) {}
  });

  // iOS has no beforeinstallprompt — show Add to Home Screen tip
  window.addEventListener("load", function () {
    if (isStandalone() || wasDismissedRecently()) return;
    if (isIos() && "serviceWorker" in navigator) {
      setTimeout(function () {
        showInstallBanner("ios");
      }, 1800);
    }
  });

  if (!("serviceWorker" in navigator)) return;

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
