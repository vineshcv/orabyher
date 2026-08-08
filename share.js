(function () {
  function siteBase() {
    if (window.STORE && STORE.siteUrl) {
      return String(STORE.siteUrl).replace(/\/$/, "") + "/";
    }
    var path = window.location.pathname;
    var dir = path.endsWith("/")
      ? path
      : path.replace(/[^/]*$/, "");
    return window.location.origin + dir;
  }

  function absoluteUrl(path) {
    if (!path) return siteBase();
    if (/^https?:\/\//i.test(path)) return path;
    return siteBase() + path.replace(/^\//, "");
  }

  function productUrl(productId) {
    return absoluteUrl("product.html?id=" + encodeURIComponent(productId));
  }

  function setMeta(attr, key, value) {
    if (!value) return;
    var selector =
      attr === "property"
        ? 'meta[property="' + key + '"]'
        : 'meta[name="' + key + '"]';
    var el = document.querySelector(selector);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute("content", value);
  }

  function applyDefaultOg() {
    var title =
      document.querySelector('meta[property="og:title"]') &&
      document.querySelector('meta[property="og:title"]').getAttribute("content");
    if (!title) title = document.title || "Orabyher";

    var descEl = document.querySelector('meta[name="description"]');
    var desc = descEl
      ? descEl.getAttribute("content")
      : "Orabyher — heritage jewellery crafted with timeless care.";

    var image = absoluteUrl("og-image.jpg");
    var url = window.location.href.split("#")[0];

    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", "Orabyher");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:image", image);
    setMeta("property", "og:image:width", "800");
    setMeta("property", "og:image:height", "800");
    setMeta("property", "og:url", url);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", image);

    // Upgrade relative og:image if already present
    document
      .querySelectorAll(
        'meta[property="og:image"], meta[name="twitter:image"]'
      )
      .forEach(function (el) {
        var c = el.getAttribute("content") || "";
        if (c && !/^https?:\/\//i.test(c)) {
          el.setAttribute("content", absoluteUrl(c));
        }
      });
  }

  function setProductOg(product) {
    if (!product) return;
    var title = product.name + " | Orabyher";
    var desc =
      product.description ||
      product.name +
        " — " +
        (window.formatProductPrice
          ? formatProductPrice(product)
          : formatINR(product.price)) +
        " | Orabyher";
    var image = absoluteUrl(product.image || "logo.png");
    var url = productUrl(product.id);

    document.title = title;
    setMeta("name", "description", desc);
    setMeta("property", "og:type", "product");
    setMeta("property", "og:site_name", "Orabyher");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:image", image);
    setMeta("property", "og:url", url);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", image);
  }

  function canNativeShare() {
    return (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 1))
    );
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var input = document.createElement("textarea");
      input.value = text;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.left = "-9999px";
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand("copy");
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(input);
      }
    });
  }

  function shareProduct(productId) {
    var product = window.getProductById ? getProductById(productId) : null;
    var url = product ? productUrl(product.id) : window.location.href;
    var title = product ? product.name + " | Orabyher" : document.title;
    var text = product
      ? product.name +
        " — " +
        (window.formatProductPrice
          ? formatProductPrice(product)
          : formatINR(product.price))
      : title;

    // Ensure page meta uses this product image (for in-app browsers / previews)
    if (product) setProductOg(product);

    function fallbackCopy() {
      copyText(url)
        .then(function () {
          if (window.Cart && Cart.showToast) Cart.showToast("Link copied");
          else alert("Link copied");
        })
        .catch(function () {
          if (window.Cart && Cart.showToast) Cart.showToast("Could not copy link");
          else prompt("Copy this link:", url);
        });
    }

    if (!canNativeShare()) {
      fallbackCopy();
      return;
    }

    // Prefer sharing with the product image when the OS supports file shares
    if (product && product.image && navigator.canShare) {
      fetch(absoluteUrl(product.image))
        .then(function (res) {
          return res.blob();
        })
        .then(function (blob) {
          var ext = (blob.type || "").indexOf("png") !== -1 ? "png" : "jpg";
          var file = new File(
            [blob],
            (product.id || "product") + "." + ext,
            { type: blob.type || "image/jpeg" }
          );
          var withFiles = { title: title, text: text, url: url, files: [file] };
          if (navigator.canShare(withFiles)) {
            return navigator.share(withFiles);
          }
          return navigator.share({ title: title, text: text, url: url });
        })
        .catch(function () {
          navigator
            .share({ title: title, text: text, url: url })
            .catch(function () {});
        });
      return;
    }

    navigator
      .share({ title: title, text: text, url: url })
      .catch(function () {
        /* user cancelled */
      });
  }

  function shareCurrentPage() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    if (id) {
      shareProduct(id);
      return;
    }
    var url = window.location.href.split("#")[0];
    var title = document.title;
    if (canNativeShare()) {
      navigator.share({ title: title, url: url }).catch(function () {});
      return;
    }
    copyText(url).then(function () {
      if (window.Cart && Cart.showToast) Cart.showToast("Link copied");
    });
  }

  function bindShareClicks() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-share]");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      var id = btn.getAttribute("data-share");
      if (id) shareProduct(id);
      else shareCurrentPage();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      applyDefaultOg();
      bindShareClicks();
    });
  } else {
    applyDefaultOg();
    bindShareClicks();
  }

  window.Share = {
    shareProduct: shareProduct,
    shareCurrentPage: shareCurrentPage,
    setProductOg: setProductOg,
    productUrl: productUrl,
    absoluteUrl: absoluteUrl,
  };
})();
