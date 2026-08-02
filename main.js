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
const heroCta = document.querySelector(".hero-section a.px-10");
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
  if (heroCta) {
    heroCta.setAttribute("href", slides[current].href || "shop.html");
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

window.addEventListener("scroll", function () {
  if (!header) return;
  var scrolled = window.scrollY > 50;
  header.classList.toggle("absolute", !scrolled);
  header.classList.toggle("fixed", scrolled);
  header.classList.toggle("is-scrolled", scrolled);
});

UI.renderCategoryGrid("#category-grid");
UI.renderGrid("#trending-grid", getProductsBySection("trending").slice(0, 4));
UI.renderGrid("#bestsellers-grid", getProductsBySection("bestsellers").slice(0, 4));
UI.renderGrid("#new-grid", getProductsBySection("new").slice(0, 4));
UI.renderGrid("#popular-grid", getProductsBySection("popular").slice(0, 8));
