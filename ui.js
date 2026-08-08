(function () {
  function productCard(product) {
    var oos = window.isProductOutOfStock
      ? isProductOutOfStock(product)
      : product.inStock === false;
    var contactPrice = window.isContactForPricing
      ? isContactForPricing(product)
      : !!product.contactForPricing;
    var premium = window.isPremiumProduct
      ? isPremiumProduct(product)
      : !!product.premium;
    var badgeStack =
      (premium
        ? '<span class="product-badge product-badge-premium">Premium</span>'
        : "") +
      (oos
        ? '<span class="product-badge product-badge-soldout">Sold out</span>'
        : "");
    var actionBtn = oos
      ? '<button type="button" data-notify="' +
        product.id +
        '" class="notify-icon-btn product-card-action" aria-label="Notify me" title="Notify me">' +
        notifySvg() +
        "</button>"
      : '<button type="button" data-whatsapp="' +
        product.id +
        '" class="wa-icon-btn-sm product-card-action" aria-label="WhatsApp">' +
        whatsappSvg() +
        "</button>";
    var cartBtn = oos
      ? '<span class="oos-pill">Sold out</span>'
      : '<button type="button" data-add-cart="' +
        product.id +
        '" class="product-card-cart product-card-action" aria-label="Add to cart">' +
        cartSvg() +
        "</button>";

    var images =
      product.images && product.images.length
        ? product.images.slice(0, 6)
        : [product.image];
    var productUrl = "product.html?id=" + product.id;
    var mediaHtml;

    if (images.length > 1) {
      mediaHtml =
        '<div class="product-card-media relative aspect-square overflow-hidden bg-slate-50">' +
        '<div class="card-carousel" data-card-carousel data-href="' +
        productUrl +
        '">' +
        images
          .map(function (src, i) {
            return (
              '<div class="card-carousel-slide">' +
              '<img src="' +
              src +
              '" alt="' +
              product.name +
              '" loading="' +
              (i === 0 ? "lazy" : "lazy") +
              '" decoding="async" class="' +
              (oos ? "opacity-80" : "") +
              '" />' +
              "</div>"
            );
          })
          .join("") +
        "</div>" +
        '<div class="card-carousel-dots" aria-hidden="true">' +
        images
          .map(function (_src, i) {
            return (
              '<span class="card-carousel-dot' +
              (i === 0 ? " active" : "") +
              '"></span>'
            );
          })
          .join("") +
        "</div>" +
        (badgeStack
          ? '<div class="absolute left-3 top-3 z-20 flex flex-col gap-1">' +
            badgeStack +
            "</div>"
          : "") +
        '<div class="absolute right-2 top-2 z-20 flex flex-col gap-2">' +
        '<button type="button" data-share="' +
        product.id +
        '" class="share-icon-btn product-card-share" aria-label="Share" title="Share">' +
        shareSvg() +
        "</button>" +
        "</div>" +
        "</div>";
    } else {
      mediaHtml =
        '<a href="' +
        productUrl +
        '" class="product-card-media relative aspect-square overflow-hidden bg-slate-50 block">' +
        '<img src="' +
        images[0] +
        '" alt="' +
        product.name +
        '" loading="lazy" decoding="async" class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110' +
        (oos ? " opacity-80" : "") +
        '" />' +
        (badgeStack
          ? '<div class="absolute left-3 top-3 z-20 flex flex-col gap-1">' +
            badgeStack +
            "</div>"
          : "") +
        '<div class="absolute right-2 top-2 flex flex-col gap-2 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0 transition-all duration-300">' +
        '<button type="button" data-share="' +
        product.id +
        '" class="share-icon-btn product-card-share" aria-label="Share" title="Share">' +
        shareSvg() +
        "</button>" +
        "</div>" +
        "</a>";
    }

    return (
      '<div class="group block h-full product-card">' +
      '<div class="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full border border-slate-100 flex flex-col">' +
      mediaHtml +
      '<div class="product-card-body flex-grow flex flex-col">' +
      '<a href="' +
      productUrl +
      '" class="product-card-title-link">' +
      '<h3 class="product-card-title text-slate-800 font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">' +
      product.name +
      "</h3>" +
      "</a>" +
      '<div class="product-card-footer mt-auto flex items-center justify-between">' +
      '<div class="product-card-price min-w-0">' +
      (contactPrice
        ? window.formatProductPriceHtml
          ? formatProductPriceHtml(product)
          : '<span class="small">Contact for pricing</span>'
        : '<span class="product-card-amount">' +
          formatINR(product.price) +
          "</span>") +
      "</div>" +
      '<div class="product-card-actions flex items-center shrink-0">' +
      actionBtn +
      cartBtn +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function bindCardCarousels(root) {
    var scope = root || document;
    scope.querySelectorAll("[data-card-carousel]").forEach(function (carousel) {
      if (carousel.getAttribute("data-bound") === "1") return;
      carousel.setAttribute("data-bound", "1");

      var dots = carousel.parentElement
        ? carousel.parentElement.querySelectorAll(".card-carousel-dot")
        : [];
      var startX = 0;
      var startY = 0;
      var moved = false;

      function syncDots() {
        var width = carousel.clientWidth || 1;
        var idx = Math.round(carousel.scrollLeft / width);
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === idx);
        });
      }

      carousel.addEventListener(
        "scroll",
        function () {
          window.requestAnimationFrame(syncDots);
        },
        { passive: true }
      );

      carousel.addEventListener(
        "touchstart",
        function (e) {
          var t = e.changedTouches[0];
          startX = t.clientX;
          startY = t.clientY;
          moved = false;
        },
        { passive: true }
      );

      carousel.addEventListener(
        "touchmove",
        function (e) {
          var t = e.changedTouches[0];
          if (
            Math.abs(t.clientX - startX) > 8 ||
            Math.abs(t.clientY - startY) > 8
          ) {
            moved = true;
          }
        },
        { passive: true }
      );

      carousel.addEventListener("click", function (e) {
        if (e.target.closest("[data-share]")) return;
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        var href = carousel.getAttribute("data-href");
        if (href) window.location.href = href;
      });
    });
  }

  function whatsappSvg(cls) {
    cls = cls || "w-4 h-4";
    return (
      '<svg viewBox="0 0 24 24" class="' +
      cls +
      '" fill="currentColor" aria-hidden="true">' +
      '<path d="M20.52 3.48A11.78 11.78 0 0012.04 0C5.5 0 .2 5.3.2 11.82c0 2.08.55 4.11 1.6 5.9L0 24l6.45-1.69a11.8 11.8 0 005.58 1.42h.01c6.54 0 11.84-5.3 11.84-11.82 0-3.16-1.23-6.13-3.36-8.43zM12.04 21.2h-.01a9.8 9.8 0 01-5-1.37l-.36-.21-3.83 1 1.02-3.73-.24-.38a9.8 9.8 0 01-1.5-5.23c0-5.42 4.42-9.83 9.86-9.83a9.78 9.78 0 016.97 16.8 9.8 9.8 0 01-6.91 2.95zm5.4-7.36c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.74-1.64-2.03-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.49s1.07 2.89 1.22 3.09c.15.2 2.11 3.22 5.11 4.51.71.31 1.27.49 1.7.63.72.23 1.37.2 1.89.12.58-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z"/>' +
      "</svg>"
    );
  }

  function notifySvg(cls) {
    cls = cls || "w-4 h-4";
    return (
      '<svg class="' +
      cls +
      '" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0"/>' +
      "</svg>"
    );
  }

  function shareSvg(cls) {
    cls = cls || "w-4 h-4";
    return (
      '<svg class="' +
      cls +
      '" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v13"/>' +
      "</svg>"
    );
  }

  function cartSvg(cls) {
    cls = cls || "w-5 h-5";
    return (
      '<svg class="' +
      cls +
      '" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>' +
      "</svg>"
    );
  }

  function renderGrid(selector, products) {
    var el = document.querySelector(selector);
    if (!el) return;
    if (!products.length) {
      el.innerHTML =
        '<p class="col-span-full text-center text-stone-500 py-10">No products found.</p>';
      return;
    }
    el.innerHTML = products.map(productCard).join("");
    bindCardCarousels(el);
  }

  function renderCategoryGrid(selector) {
    var el = document.querySelector(selector);
    if (!el || !window.STORE) return;
    el.innerHTML = STORE.categories
      .map(function (cat) {
        return (
          '<a href="category.html?id=' +
          cat.id +
          '" class="category-card group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all">' +
          '<div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10"></div>' +
          '<img src="' +
          cat.image +
          '" alt="' +
          cat.name +
          '" loading="lazy" decoding="async" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />' +
          '<div class="category-card-label absolute bottom-0 left-0 z-20">' +
          '<h3 class="text-white font-bold mb-1">' +
          cat.name +
          "</h3>" +
          '<span class="category-card-explore text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity">Explore</span>' +
          "</div></a>"
        );
      })
      .join("");
  }

  window.UI = {
    productCard: productCard,
    renderGrid: renderGrid,
    renderCategoryGrid: renderCategoryGrid,
    bindCardCarousels: bindCardCarousels,
    whatsappSvg: whatsappSvg,
    notifySvg: notifySvg,
    shareSvg: shareSvg,
    cartSvg: cartSvg,
  };
})();
