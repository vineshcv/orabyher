(function () {
  var LOADER_MIN_MS = 900;

  function ensureLoader() {
    var existing = document.getElementById("page-loader");
    if (existing) return existing;

    var loader = document.createElement("div");
    loader.id = "page-loader";
    loader.className = "page-loader";
    loader.setAttribute("aria-hidden", "true");
    loader.innerHTML =
      '<div class="page-loader-inner">' +
      '<img src="logo.png" alt="Orabyher" class="page-loader-logo" />' +
      '<div class="page-loader-ring"></div>' +
      '<p class="page-loader-text">Loading</p>' +
      "</div>";
    document.body.appendChild(loader);
    return loader;
  }

  function hideLoader() {
    var loader = document.getElementById("page-loader");
    if (loader) {
      loader.classList.add("is-done");
      setTimeout(function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 450);
    }
    document.documentElement.classList.remove("is-loading");
    document.documentElement.classList.remove("is-booting");
  }

  document.documentElement.classList.add("is-loading");
  ensureLoader();

  var started = Date.now();
  function finish() {
    var wait = Math.max(0, LOADER_MIN_MS - (Date.now() - started));
    setTimeout(hideLoader, wait);
  }

  if (document.readyState === "complete") {
    finish();
  } else {
    window.addEventListener("load", finish);
  }
})();
