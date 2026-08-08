const slides = [
  {
    title: "White Pearl Jhumka",
    image: "banner_images-white-pearl-jhumka.webp",
    href: "product.html?id=white-pearl-jhumka-380",
  },
  {
    title: "Temple Jhumkas",
    image: "banner_images-temple-jhumkas.webp",
    href: "product.html?id=temple-jhumkas-380",
  },
  {
    title: "10% Off For Nagas Collections",
    image: "banner_images-17700529852896.webp",
    href: "shop.html",
  },
  {
    title: "10% Off For Nagas Collections",
    image: "banner_images-17700532806776.webp",
    href: "shop.html",
  },
];

const titleEl = document.getElementById("hero-title");
const slidesEl = document.getElementById("hero-slides");
const slidesMobileEl = document.getElementById("hero-slides-mobile");

function slideHtml(s, i, imgClass) {
  // Only the first slide loads immediately; others hydrate on show()
  var imgAttrs =
    i === 0
      ? 'src="' + s.image + '" fetchpriority="high"'
      : 'data-src="' + s.image + '" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"';
  return (
    '<div class="hero-slide' +
    (i === 0 ? " active" : "") +
    '"><img ' +
    imgAttrs +
    ' alt="' +
    s.title +
    '" class="' +
    imgClass +
    '" decoding="async" /></div>'
  );
}

function hydrateSlideImages(slideEl) {
  if (!slideEl) return;
  var img = slideEl.querySelector("img[data-src]");
  if (!img) return;
  img.src = img.getAttribute("data-src");
  img.removeAttribute("data-src");
}

if (slidesEl) {
  slidesEl.innerHTML = slides
    .map(function (s, i) {
      return slideHtml(s, i, "hero-slide-img-desktop");
    })
    .join("");
}

if (slidesMobileEl) {
  slidesMobileEl.innerHTML = slides
    .map(function (s, i) {
      return slideHtml(s, i, "hero-slide-img-mobile");
    })
    .join("");
}

function splitTitle(title) {
  var words = title.split(" ");
  if (words.length <= 3) return { first: words.join(" "), second: "" };
  var mid = Math.ceil(words.length / 2);
  return {
    first: words.slice(0, mid).join(" "),
    second: words.slice(mid).join(" "),
  };
}

var current = 0;

function show(i) {
  current = (i + slides.length) % slides.length;
  document.querySelectorAll(".hero-slide").forEach(function (el) {
    el.classList.remove("active");
  });
  if (slidesEl && slidesEl.children[current]) {
    hydrateSlideImages(slidesEl.children[current]);
    slidesEl.children[current].classList.add("active");
  }
  if (slidesMobileEl && slidesMobileEl.children[current]) {
    hydrateSlideImages(slidesMobileEl.children[current]);
    slidesMobileEl.children[current].classList.add("active");
  }
  var t = splitTitle(slides[current].title);
  if (titleEl) {
    titleEl.innerHTML =
      t.first +
      (t.second
        ? '<span class="block mt-2 text-white/90">' + t.second + "</span>"
        : "");
  }
}

show(0);

var nextBtn = document.getElementById("hero-next");
var prevBtn = document.getElementById("hero-prev");
if (nextBtn) {
  nextBtn.onclick = function () {
    show(current + 1);
  };
}
if (prevBtn) {
  prevBtn.onclick = function () {
    show(current - 1);
  };
}
setInterval(function () {
  show(current + 1);
}, 4000);

var header = document.getElementById("site-header");
var categoryBar = document.getElementById("category-sticky-bar");
var categorySentinel = document.querySelector(".category-pin-sentinel");

function syncHeaderHeight() {
  if (!header) return;
  var h = Math.ceil(header.getBoundingClientRect().height);
  if (h > 0) {
    document.documentElement.style.setProperty("--site-header-height", h + "px");
  }
  return h || 72;
}

function updatePinnedCategory() {
  if (!categoryBar || !categorySentinel) return;

  // Desktop keeps the normal grid — no pin
  if (window.innerWidth >= 768) {
    categoryBar.classList.remove("is-fixed");
    categorySentinel.style.height = "0px";
    return;
  }

  var headerH = syncHeaderHeight();
  var sentinelTop = categorySentinel.getBoundingClientRect().top;
  var shouldFix = sentinelTop <= headerH;

  if (shouldFix) {
    if (!categoryBar.classList.contains("is-fixed")) {
      categorySentinel.style.height = categoryBar.offsetHeight + "px";
      categoryBar.classList.add("is-fixed");
    }
    categoryBar.style.top = headerH + "px";
  } else {
    categoryBar.classList.remove("is-fixed");
    categoryBar.style.top = "";
    categorySentinel.style.height = "0px";
  }
}

function onScrollOrResize() {
  if (header) {
    var scrolled = window.scrollY > 50;
    header.classList.toggle("absolute", !scrolled);
    header.classList.toggle("fixed", scrolled);
    header.classList.toggle("is-scrolled", scrolled);
  }
  syncHeaderHeight();
  updatePinnedCategory();
}

window.addEventListener("scroll", onScrollOrResize, { passive: true });
window.addEventListener("resize", onScrollOrResize);
onScrollOrResize();

UI.renderCategoryGrid("#category-grid");

function renderHomeCategorySections() {
  var root = document.getElementById("home-category-sections");
  if (!root || !window.STORE) return;

  var alts = ["bg-cream", "bg-white"];
  root.innerHTML = STORE.categories
    .map(function (cat, idx) {
      var products = getProductsByCategory(cat.id);
      var gridId = "cat-grid-" + cat.id;
      var sectionId = "cat-" + cat.id;
      var bg = alts[idx % 2];
      var body =
        products.length > 0
          ? '<div id="' +
            gridId +
            '" class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6"></div>'
          : '<p class="text-stone-500 text-sm py-4">Products coming soon.</p>';

      return (
        '<section id="' +
        sectionId +
        '" class="home-cat-section py-10 ' +
        bg +
        ' relative overflow-hidden">' +
        (bg === "bg-cream"
          ? '<div class="absolute inset-0 opacity-[0.03] pointer-events-none pattern-bg"></div>'
          : "") +
        '<div class="container mx-auto px-4 relative z-10">' +
        '<div class="home-cat-head flex items-center justify-between">' +
        '<div class="home-cat-head-text min-w-0">' +
        '<span class="home-cat-eyebrow text-accent uppercase tracking-[0.4em] text-[10px] font-medium mb-2 block">Collection</span>' +
        '<h2 class="home-cat-title text-2xl md:text-4xl font-light text-primary font-serif italic tracking-tight">' +
        cat.name +
        "</h2>" +
        "</div>" +
        '<a href="category.html?id=' +
        cat.id +
        '" class="home-cat-viewall text-primary font-medium text-xs uppercase tracking-[0.2em] hover:text-accent transition-colors shrink-0">View all</a>' +
        "</div>" +
        body +
        "</div></section>"
      );
    })
    .join("");

  STORE.categories.forEach(function (cat) {
    var products = getProductsByCategory(cat.id);
    if (products.length) {
      UI.renderGrid("#cat-grid-" + cat.id, products);
    }
  });

  // Sticky category chips jump to in-page sections
  document.querySelectorAll("#category-grid .category-card").forEach(function (a) {
    var href = a.getAttribute("href") || "";
    var match = href.match(/[?&]id=([^&]+)/);
    if (!match) return;
    a.setAttribute("href", "#cat-" + match[1]);
  });
}

renderHomeCategorySections();

// Re-measure after category cards render
requestAnimationFrame(updatePinnedCategory);
