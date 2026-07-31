(function () {
  var currentId = null;

  function getQueryId() {
    return new URLSearchParams(window.location.search).get("id");
  }

  function renderPills() {
    var el = document.getElementById("cat-pills");
    el.innerHTML = STORE.categories
      .map(function (c) {
        var active = c.id === currentId;
        return (
          '<a href="category.html?id=' +
          c.id +
          '" class="px-4 py-2 rounded-full text-xs uppercase tracking-wider border transition-all ' +
          (active
            ? "bg-primary text-white border-primary"
            : "bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary") +
          '">' +
          c.name +
          "</a>"
        );
      })
      .join("");
  }

  function sortProducts(list, mode) {
    var items = list.slice();
    if (mode === "price-asc") {
      items.sort(function (a, b) {
        return a.price - b.price;
      });
    } else if (mode === "price-desc") {
      items.sort(function (a, b) {
        return b.price - a.price;
      });
    } else if (mode === "rating") {
      items.sort(function (a, b) {
        return b.rating - a.rating;
      });
    }
    return items;
  }

  function render() {
    currentId = getQueryId() || STORE.categories[0].id;
    var category = getCategoryById(currentId);
    if (!category) {
      document.getElementById("cat-title").textContent = "Category not found";
      document.getElementById("category-grid").innerHTML =
        '<p class="col-span-full text-center text-stone-500 py-10">Invalid category.</p>';
      return;
    }

    document.title = category.name + " | Multimart";
    document.getElementById("cat-title").textContent = category.name;
    document.getElementById("cat-crumb").textContent = category.name;
    document.getElementById("cat-hero-img").src = category.image;
    document.getElementById("cat-hero-img").alt = category.name;

    renderPills();

    var products = getProductsByCategory(currentId);
    document.getElementById("cat-count").textContent =
      products.length + " product" + (products.length === 1 ? "" : "s") + " · Prices in INR";

    function paint() {
      var sorted = sortProducts(
        products,
        document.getElementById("sort-select").value
      );
      UI.renderGrid("#category-grid", sorted);
    }

    document.getElementById("sort-select").onchange = paint;
    paint();
  }

  document.addEventListener("DOMContentLoaded", render);
})();
