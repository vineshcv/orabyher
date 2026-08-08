(function () {
  // iOS Safari standalone (Add to Home Screen)
  if (window.navigator.standalone === true) {
    document.documentElement.classList.add("ios-standalone");
  }

  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", function () {
    var swUrl = "sw.js";
    navigator.serviceWorker
      .register(swUrl)
      .then(function (reg) {
        if (reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }
        reg.addEventListener("updatefound", function () {
          var worker = reg.installing;
          if (!worker) return;
          worker.addEventListener("statechange", function () {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              // New version ready; activate on next visit via skipWaiting in install.
            }
          });
        });
      })
      .catch(function () {
        // Registration can fail on file:// or restricted hosts — ignore.
      });
  });
})();
