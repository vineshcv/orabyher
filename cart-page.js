(function () {
  function render() {
    var items = Cart.getCart();
    var root = document.getElementById("cart-items");
    document.getElementById("summary-count").textContent = String(Cart.getCartCount());
    document.getElementById("summary-total").textContent = formatINR(Cart.cartTotal());

    if (!items.length) {
      root.innerHTML =
        '<div class="bg-white rounded-2xl border border-slate-100 p-10 text-center">' +
        '<p class="text-stone-500 mb-4">Your cart is empty.</p>' +
        '<a href="shop.html" class="text-primary underline text-sm">Browse products</a>' +
        "</div>";
      return;
    }

    root.innerHTML = items
      .map(function (item) {
        return (
          '<div class="bg-white rounded-2xl border border-slate-100 p-4 flex gap-4 items-center">' +
          '<a href="product.html?id=' +
          item.id +
          '" class="w-24 h-24 rounded-xl overflow-hidden bg-slate-50 shrink-0">' +
          '<img src="' +
          item.image +
          '" alt="' +
          item.name +
          '" class="w-full h-full object-cover" />' +
          "</a>" +
          '<div class="flex-1 min-w-0">' +
          '<a href="product.html?id=' +
          item.id +
          '" class="font-semibold text-slate-800 hover:text-primary line-clamp-2">' +
          item.name +
          "</a>" +
          '<div class="text-lg font-bold mt-1">' +
          formatINR(item.price) +
          "</div>" +
          '<div class="flex items-center gap-3 mt-3">' +
          '<div class="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden">' +
          '<button type="button" class="px-2 py-1 hover:bg-slate-50" data-qty-minus="' +
          item.id +
          '">−</button>' +
          '<span class="px-3 text-sm">' +
          item.qty +
          "</span>" +
          '<button type="button" class="px-2 py-1 hover:bg-slate-50" data-qty-plus="' +
          item.id +
          '">+</button>' +
          "</div>" +
          '<button type="button" class="text-xs text-stone-400 hover:text-red-600" data-remove="' +
          item.id +
          '">Remove</button>' +
          '<button type="button" class="wa-icon-btn-sm" data-whatsapp="' +
          item.id +
          '" aria-label="WhatsApp">' +
          UI.whatsappSvg() +
          "</button>" +
          "</div>" +
          "</div>" +
          '<div class="text-right font-semibold text-slate-900 shrink-0">' +
          formatINR(item.price * item.qty) +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();

    document.getElementById("cart-items").addEventListener("click", function (e) {
      var minus = e.target.closest("[data-qty-minus]");
      var plus = e.target.closest("[data-qty-plus]");
      var remove = e.target.closest("[data-remove]");
      if (minus) {
        var id = minus.getAttribute("data-qty-minus");
        var item = Cart.getCart().find(function (i) {
          return i.id === id;
        });
        if (item) {
          if (item.qty <= 1) Cart.removeFromCart(id);
          else Cart.setQty(id, item.qty - 1);
        }
        render();
      }
      if (plus) {
        var pid = plus.getAttribute("data-qty-plus");
        var found = Cart.getCart().find(function (i) {
          return i.id === pid;
        });
        if (found) Cart.setQty(pid, found.qty + 1);
        render();
      }
      if (remove) {
        Cart.removeFromCart(remove.getAttribute("data-remove"));
        render();
      }
    });

    document.getElementById("btn-wa-bulk").onclick = function () {
      Cart.openWhatsAppForCart();
    };
    document.getElementById("btn-clear").onclick = function () {
      Cart.clearCart();
      render();
    };

    window.addEventListener("cart:updated", render);
  });
})();
