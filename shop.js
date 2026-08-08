(function () {
  var filterId = "all";

  function sortPrice(a, b, dir) {
    var ap =
      a.contactForPricing || a.price == null ? null : Number(a.price);
    var bp =
      b.contactForPricing || b.price == null ? null : Number(b.price);
    if (ap == null && bp == null) return 0;
    if (ap == null) return 1;
    if (bp == null) return -1;
    return dir * (ap - bp);
  }

  function sortProducts(list, mode) {
    var items = list.slice();
    if (mode === "price-asc") {
      items.sort(function (a, b) {
        return sortPrice(a, b, 1);
      });
    } else if (mode === "price-desc") {
      items.sort(function (a, b) {
        return sortPrice(a, b, -1);
      });
    } else if (mode === "rating") {
      items.sort(function (a, b) {
        return b.rating - a.rating;
      });
    }
    return items;
  }

  function renderPills() {
    var el = document.getElementById("shop-pills");
    var pills = [{ id: "all", name: "All Products" }].concat(STORE.categories);
    el.innerHTML = pills
      .map(function (c) {
        var active = c.id === filterId;
        return (
          '<button type="button" data-filter="' +
          c.id +
          '" class="px-4 py-2 rounded-full text-xs uppercase tracking-wider border transition-all ' +
          (active
            ? "bg-primary text-white border-primary"
            : "bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary") +
          '">' +
          c.name +
          "</button>"
        );
      })
      .join("");
  }

  function paint() {
    var products =
      filterId === "all" ? STORE.products.slice() : getProductsByCategory(filterId);
    var sorted = sortProducts(products, document.getElementById("shop-sort").value);
    document.getElementById("shop-count").textContent =
      sorted.length +
      " product" +
      (sorted.length === 1 ? "" : "s") +
      " · Prices in INR";
    UI.renderGrid("#shop-grid", sorted);
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderPills();
    paint();

    document.getElementById("shop-pills").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-filter]");
      if (!btn) return;
      filterId = btn.getAttribute("data-filter");
      renderPills();
      paint();
    });

    document.getElementById("shop-sort").onchange = paint;
  });
})();
