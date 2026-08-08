(function () {
  function getQueryId() {
    var params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  function render() {
    var id = getQueryId();
    var product = getProductById(id);
    var root = document.getElementById("product-root");

    if (!product) {
      root.innerHTML =
        '<div class="p-10 text-center"><p class="text-stone-500 mb-4">Product not found.</p><a href="index.html" class="text-primary underline">Back to home</a></div>';
      return;
    }

    document.title = product.name + " | Orabyher";
    if (window.Share && Share.setProductOg) Share.setProductOg(product);
    var category = getCategoryById(product.categoryId);
    var images = product.images && product.images.length ? product.images : [product.image];
    var oos = window.isProductOutOfStock
      ? isProductOutOfStock(product)
      : product.inStock === false;
    var contactPrice = window.isContactForPricing
      ? isContactForPricing(product)
      : !!product.contactForPricing;
    var premium = window.isPremiumProduct
      ? isPremiumProduct(product)
      : !!product.premium;
    var primaryAction = oos
      ? '<button type="button" id="btn-notify" class="fk-btn fk-btn-notify fk-btn-icon">' +
        UI.notifySvg("w-5 h-5") +
        "<span>Notify</span></button>"
      : '<button type="button" id="btn-whatsapp" class="fk-btn fk-btn-wa fk-btn-icon">' +
        UI.whatsappSvg("w-5 h-5") +
        "<span>WhatsApp</span></button>";
    var cartAction = oos
      ? '<button type="button" id="btn-add-cart" class="fk-btn fk-btn-cart fk-btn-icon fk-btn-disabled" disabled aria-disabled="true">' +
        UI.cartSvg("w-5 h-5") +
        "<span>Sold out</span></button>"
      : '<button type="button" id="btn-add-cart" class="fk-btn fk-btn-cart fk-btn-icon">' +
        UI.cartSvg("w-5 h-5") +
        "<span>Add to Cart</span></button>";

    var carouselSlides = images
      .map(function (src, i) {
        return (
          '<div class="product-carousel-slide" data-index="' +
          i +
          '">' +
          '<img src="' +
          src +
          '" alt="' +
          product.name +
          (images.length > 1 ? " — image " + (i + 1) : "") +
          '" loading="' +
          (i === 0 ? "eager" : "lazy") +
          '" decoding="async" />' +
          "</div>"
        );
      })
      .join("");

    var carouselDots =
      images.length > 1
        ? '<div class="product-carousel-dots" id="carousel-dots">' +
          images
            .map(function (_src, i) {
              return (
                '<button type="button" class="product-carousel-dot' +
                (i === 0 ? " active" : "") +
                '" data-index="' +
                i +
                '" aria-label="Go to image ' +
                (i + 1) +
                '"></button>'
              );
            })
            .join("") +
          "</div>"
        : "";

    root.innerHTML =
      '<div class="grid grid-cols-1 lg:grid-cols-12 gap-0">' +
      '<div class="lg:col-span-5 p-3 sm:p-4 md:p-6 border-b lg:border-b-0 lg:border-r border-slate-100">' +
      // Mobile carousel
      '<div class="product-carousel-wrap sm:hidden">' +
      '<div class="product-carousel" id="product-carousel" tabindex="0">' +
      carouselSlides +
      "</div>" +
      carouselDots +
      '<div class="product-thumbs-row" id="thumb-list-mobile"></div>' +
      "</div>" +
      // Desktop thumbs + zoom
      '<div class="hidden sm:flex gap-3">' +
      '<div class="flex flex-col gap-2 w-16 shrink-0" id="thumb-list"></div>' +
      '<div class="flex-1">' +
      '<div class="zoom-stage">' +
      '<div class="zoom-wrap" id="zoom-wrap">' +
      '<img id="main-image" src="' +
      images[0] +
      '" alt="' +
      product.name +
      '" class="zoom-img" />' +
      '<div class="zoom-lens" id="zoom-lens"></div>' +
      "</div>" +
      '<div class="zoom-result" id="zoom-result"></div>' +
      "</div>" +
      "</div>" +
      "</div>" +
      '<div class="mt-4 grid grid-cols-1 ' +
      (oos ? "sm:grid-cols-2" : "sm:grid-cols-3") +
      ' gap-3">' +
      cartAction +
      primaryAction +
      '<button type="button" id="btn-share" class="fk-btn fk-btn-share fk-btn-icon" data-share="' +
      product.id +
      '">' +
      UI.shareSvg("w-5 h-5") +
      "<span>Share</span></button>" +
      "</div>" +
      "</div>" +
      '<div class="lg:col-span-7 p-5 md:p-8">' +
      '<nav class="text-xs text-stone-400 mb-3 flex flex-wrap gap-1">' +
      '<a href="index.html" class="hover:text-primary">Home</a><span>/</span>' +
      (category
        ? '<a href="category.html?id=' +
          category.id +
          '" class="hover:text-primary">' +
          category.name +
          "</a><span>/</span>"
        : "") +
      '<span class="text-stone-600">' +
      product.name +
      "</span>" +
      "</nav>" +
      '<div class="flex items-start justify-between gap-3 mb-4">' +
      '<h1 class="text-2xl md:text-3xl font-medium text-slate-900 leading-snug">' +
      product.name +
      "</h1>" +
      '<button type="button" data-share="' +
      product.id +
      '" class="share-text-btn shrink-0" aria-label="Share product">' +
      UI.shareSvg() +
      "<span>Share</span></button>" +
      "</div>" +
      '<div class="flex items-end gap-3 mb-2">' +
      (contactPrice
        ? window.formatProductPriceHtml
          ? formatProductPriceHtml(product)
          : '<span class="small">Contact for pricing</span>'
        : '<span class="text-3xl font-bold text-slate-900">' +
          formatINR(product.price) +
          "</span>") +
      (premium
        ? '<span class="premium-status-badge">Premium</span>'
        : "") +
      (oos
        ? '<span class="oos-status-badge">Sold out</span>'
        : "") +
      "</div>" +
      (contactPrice
        ? '<p class="text-xs text-stone-500 mb-6">Message us on WhatsApp for current pricing and availability.</p>'
        : '<p class="text-xs text-stone-500 mb-6">Inclusive of all taxes · Prices in INR</p>') +
      (oos
        ? ""
        : '<div class="mb-6">' +
          '<label class="text-sm font-medium text-slate-700 mb-2 block">Quantity</label>' +
          '<div class="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden">' +
          '<button type="button" id="qty-minus" class="px-3 py-2 hover:bg-slate-50">−</button>' +
          '<input id="qty-input" type="number" min="1" value="1" class="w-14 text-center border-x border-slate-200 py-2 outline-none" />' +
          '<button type="button" id="qty-plus" class="px-3 py-2 hover:bg-slate-50">+</button>' +
          "</div>" +
          "</div>") +
      '<div class="mb-8">' +
      '<h2 class="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Highlights</h2>' +
      '<ul class="grid sm:grid-cols-2 gap-2 text-sm text-slate-700">' +
      product.highlights
        .map(function (h) {
          return (
            '<li class="flex gap-2"><span class="text-accent">•</span><span>' +
            h +
            "</span></li>"
          );
        })
        .join("") +
      "</ul>" +
      "</div>" +
      '<div class="mb-8">' +
      '<h2 class="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Description</h2>' +
      '<p class="text-stone-600 leading-relaxed">' +
      product.description +
      "</p>" +
      "</div>" +
      '<div class="border border-slate-100 rounded-xl overflow-hidden">' +
      '<h2 class="text-sm font-semibold uppercase tracking-wider text-primary px-4 py-3 bg-cream border-b border-slate-100">Specifications</h2>' +
      '<table class="w-full text-sm">' +
      Object.keys(product.specs)
        .map(function (key) {
          return (
            '<tr class="border-b border-slate-50">' +
            '<td class="px-4 py-3 text-stone-500 w-1/3">' +
            key +
            "</td>" +
            '<td class="px-4 py-3 text-slate-800">' +
            product.specs[key] +
            "</td>" +
            "</tr>"
          );
        })
        .join("") +
      "</table>" +
      "</div>" +
      "</div>" +
      "</div>";

    function thumbHtml(src, i) {
      return (
        '<button type="button" class="thumb-btn' +
        (i === 0 ? " active" : "") +
        '" data-src="' +
        src +
        '" data-index="' +
        i +
        '"><img src="' +
        src +
        '" alt="" /></button>'
      );
    }

    var thumbList = document.getElementById("thumb-list");
    if (thumbList) {
      thumbList.innerHTML = images.map(thumbHtml).join("");
    }
    var thumbListMobile = document.getElementById("thumb-list-mobile");
    if (thumbListMobile) {
      thumbListMobile.innerHTML =
        images.length > 1 ? images.map(thumbHtml).join("") : "";
    }

    setupGallery(images);
    setupActions(product);

    var similar = getProductsByCategory(product.categoryId)
      .filter(function (p) {
        return p.id !== product.id;
      })
      .slice(0, 4);
    if (!similar.length) similar = getProductsBySection("popular").slice(0, 4);
    UI.renderGrid("#similar-grid", similar);
  }

  function setupGallery(images) {
    images = images || [];
    var mainImage = document.getElementById("main-image");
    var wrap = document.getElementById("zoom-wrap");
    var lens = document.getElementById("zoom-lens");
    var result = document.getElementById("zoom-result");
    var carousel = document.getElementById("product-carousel");
    var currentIndex = 0;

    function setActiveThumbs(index) {
      document.querySelectorAll(".thumb-btn").forEach(function (b) {
        var i = parseInt(b.getAttribute("data-index"), 10);
        b.classList.toggle("active", i === index);
      });
      document.querySelectorAll(".product-carousel-dot").forEach(function (d) {
        var i = parseInt(d.getAttribute("data-index"), 10);
        d.classList.toggle("active", i === index);
      });
    }

    function setDesktopImage(src) {
      if (!mainImage) return;
      mainImage.src = src;
      if (result) result.style.backgroundImage = "url('" + src + "')";
    }

    function goToIndex(index, smooth) {
      if (!images.length) return;
      currentIndex = Math.max(0, Math.min(images.length - 1, index));
      setActiveThumbs(currentIndex);
      setDesktopImage(images[currentIndex]);

      if (carousel) {
        var slide = carousel.children[currentIndex];
        if (slide) {
          carousel.scrollTo({
            left: slide.offsetLeft,
            behavior: smooth === false ? "auto" : "smooth",
          });
        }
      }

      // Keep active mobile thumb in view
      var activeMobile = document.querySelector(
        "#thumb-list-mobile .thumb-btn.active"
      );
      if (activeMobile && activeMobile.scrollIntoView) {
        activeMobile.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }

    goToIndex(0, false);

    document.querySelectorAll(".thumb-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var index = parseInt(btn.getAttribute("data-index"), 10);
        if (isNaN(index)) {
          var src = btn.getAttribute("data-src");
          index = images.indexOf(src);
        }
        goToIndex(index);
      });
    });

    document.querySelectorAll(".product-carousel-dot").forEach(function (dot) {
      dot.addEventListener("click", function () {
        goToIndex(parseInt(dot.getAttribute("data-index"), 10));
      });
    });

    if (carousel) {
      var scrollTimer;
      carousel.addEventListener(
        "scroll",
        function () {
          clearTimeout(scrollTimer);
          scrollTimer = setTimeout(function () {
            var width = carousel.clientWidth || 1;
            var idx = Math.round(carousel.scrollLeft / width);
            if (idx !== currentIndex) {
              currentIndex = Math.max(0, Math.min(images.length - 1, idx));
              setActiveThumbs(currentIndex);
              setDesktopImage(images[currentIndex]);
            }
          }, 60);
        },
        { passive: true }
      );
    }

    if (wrap && lens && result) {
      function moveLens(e) {
        var rect = wrap.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var lensW = lens.offsetWidth / 2;
        var lensH = lens.offsetHeight / 2;

        if (x < lensW) x = lensW;
        if (x > rect.width - lensW) x = rect.width - lensW;
        if (y < lensH) y = lensH;
        if (y > rect.height - lensH) y = rect.height - lensH;

        lens.style.left = x - lensW + "px";
        lens.style.top = y - lensH + "px";

        var fx = (x / rect.width) * 100;
        var fy = (y / rect.height) * 100;
        result.style.backgroundPosition = fx + "% " + fy + "%";
      }

      wrap.addEventListener("mouseenter", function () {
        if (window.innerWidth < 1024) return;
        lens.classList.add("show");
        result.classList.add("show");
      });
      wrap.addEventListener("mouseleave", function () {
        lens.classList.remove("show");
        result.classList.remove("show");
      });
      wrap.addEventListener("mousemove", function (e) {
        if (window.innerWidth < 1024) return;
        moveLens(e);
      });
    }
  }

  function setupActions(product) {
    var oos = window.isProductOutOfStock
      ? isProductOutOfStock(product)
      : product.inStock === false;
    var qtyInput = document.getElementById("qty-input");
    if (qtyInput) {
      document.getElementById("qty-minus").onclick = function () {
        qtyInput.value = Math.max(1, parseInt(qtyInput.value || "1", 10) - 1);
      };
      document.getElementById("qty-plus").onclick = function () {
        qtyInput.value = Math.max(1, parseInt(qtyInput.value || "1", 10) + 1);
      };
    }
    var addBtn = document.getElementById("btn-add-cart");
    if (addBtn && !oos) {
      addBtn.onclick = function () {
        Cart.addToCart(product.id, parseInt((qtyInput && qtyInput.value) || "1", 10));
      };
    }
    var waBtn = document.getElementById("btn-whatsapp");
    if (waBtn) {
      waBtn.onclick = function () {
        Cart.openWhatsAppForProduct(
          product.id,
          parseInt((qtyInput && qtyInput.value) || "1", 10)
        );
      };
    }
    var notifyBtn = document.getElementById("btn-notify");
    if (notifyBtn) {
      notifyBtn.onclick = function () {
        Cart.openNotifyForProduct(product.id);
      };
    }
  }

  document.addEventListener("DOMContentLoaded", render);
})();
