(function () {
  function render() {
    var grid = document.getElementById("customers-grid");
    var empty = document.getElementById("customers-empty");
    if (!grid) return;

    var items = Array.isArray(window.CUSTOMERS) ? window.CUSTOMERS : [];
    if (!items.length) {
      grid.innerHTML = "";
      if (empty) empty.classList.remove("hidden");
      return;
    }

    if (empty) empty.classList.add("hidden");
    grid.innerHTML = items
      .map(function (item, i) {
        var caption = item.caption || "Our customer";
        return (
          '<button type="button" class="customer-card" data-index="' +
          i +
          '" aria-label="' +
          caption.replace(/"/g, "&quot;") +
          '">' +
          '<img src="' +
          item.image +
          '" alt="' +
          caption.replace(/"/g, "&quot;") +
          '" loading="lazy" />' +
          '<span class="customer-card-glow"></span>' +
          (item.caption
            ? '<span class="customer-card-caption">' + item.caption + "</span>"
            : "") +
          "</button>"
        );
      })
      .join("");

    bindLightbox(items);
  }

  function bindLightbox(items) {
    var lightbox = document.getElementById("customer-lightbox");
    var img = document.getElementById("customer-lightbox-img");
    var caption = document.getElementById("customer-lightbox-caption");
    var closeBtn = document.getElementById("customer-lightbox-close");
    var prevBtn = document.getElementById("customer-lightbox-prev");
    var nextBtn = document.getElementById("customer-lightbox-next");
    if (!lightbox || !img) return;

    var current = 0;

    function openAt(index) {
      current = (index + items.length) % items.length;
      var item = items[current];
      img.src = item.image;
      img.alt = item.caption || "Our customer";
      if (caption) caption.textContent = item.caption || "";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.documentElement.classList.add("lightbox-open");
    }

    function close() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("lightbox-open");
    }

    document.querySelectorAll(".customer-card").forEach(function (card) {
      card.addEventListener("click", function () {
        openAt(parseInt(card.getAttribute("data-index"), 10) || 0);
      });
    });

    if (closeBtn) closeBtn.onclick = close;
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });
    if (prevBtn) {
      prevBtn.onclick = function (e) {
        e.stopPropagation();
        openAt(current - 1);
      };
    }
    if (nextBtn) {
      nextBtn.onclick = function (e) {
        e.stopPropagation();
        openAt(current + 1);
      };
    }
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") openAt(current - 1);
      if (e.key === "ArrowRight") openAt(current + 1);
    });
  }

  document.addEventListener("DOMContentLoaded", render);
})();
