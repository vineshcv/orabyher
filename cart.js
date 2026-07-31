(function () {
  var CART_KEY = "multimart_cart_v1";
  var WHATSAPP = "919686516174";

  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function writeCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartBadge();
    window.dispatchEvent(new CustomEvent("cart:updated"));
  }

  function findProduct(id) {
    return window.getProductById ? getProductById(id) : null;
  }

  function getCart() {
    return readCart();
  }

  function getCartCount() {
    return readCart().reduce(function (sum, item) {
      return sum + (item.qty || 0);
    }, 0);
  }

  function addToCart(productId, qty) {
    qty = qty || 1;
    var product = findProduct(productId);
    if (!product) return;
    if (
      window.isProductOutOfStock
        ? isProductOutOfStock(product)
        : product.inStock === false
    ) {
      showToast("This product is out of stock");
      return;
    }
    var items = readCart();
    var existing = items.find(function (i) {
      return i.id === productId;
    });
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: qty,
      });
    }
    writeCart(items);
    showToast(product.name + " added to cart");
  }

  function setQty(productId, qty) {
    var items = readCart();
    items = items
      .map(function (i) {
        if (i.id === productId) i.qty = Math.max(1, qty);
        return i;
      })
      .filter(function (i) {
        return i.qty > 0;
      });
    writeCart(items);
  }

  function removeFromCart(productId) {
    writeCart(
      readCart().filter(function (i) {
        return i.id !== productId;
      })
    );
  }

  function clearCart() {
    writeCart([]);
  }

  function cartTotal() {
    return readCart().reduce(function (sum, i) {
      return sum + i.price * i.qty;
    }, 0);
  }

  function productWhatsAppMessage(product, qty) {
    qty = qty || 1;
    var pageUrl =
      window.location.origin +
      window.location.pathname.replace(/[^/]*$/, "") +
      "product.html?id=" +
      product.id;
    return [
      "Hello! I am interested in this product:",
      "",
      "*" + product.name + "*",
      "Price: *" + formatINR(product.price) + "*",
      "Qty: " + qty,
      "Link: " + pageUrl,
    ].join("\n");
  }

  function openWhatsAppForProduct(productId, qty) {
    var product = findProduct(productId);
    if (!product) return;
    var text = encodeURIComponent(productWhatsAppMessage(product, qty));
    window.open("https://wa.me/" + WHATSAPP + "?text=" + text, "_blank");
  }

  function notifyWhatsAppMessage(product) {
    var pageUrl =
      window.location.origin +
      window.location.pathname.replace(/[^/]*$/, "") +
      "product.html?id=" +
      product.id;
    return [
      "Hello! Please *NOTIFY* me when this product is back in stock:",
      "",
      "*" + product.name + "*",
      "Price: *" + formatINR(product.price) + "*",
      "Status: Out of stock",
      "Link: " + pageUrl,
    ].join("\n");
  }

  function openNotifyForProduct(productId) {
    var product = findProduct(productId);
    if (!product) return;
    var text = encodeURIComponent(notifyWhatsAppMessage(product));
    window.open("https://wa.me/" + WHATSAPP + "?text=" + text, "_blank");
  }

  function openWhatsAppForCart() {
    var items = readCart();
    if (!items.length) {
      showToast("Cart is empty");
      return;
    }
    var lines = ["Hello! I would like to order the following items:", ""];
    items.forEach(function (item, idx) {
      lines.push(
        idx +
          1 +
          ". " +
          item.name +
          " x " +
          item.qty +
          " = " +
          formatINR(item.price * item.qty)
      );
    });
    lines.push("");
    lines.push("Total: " + formatINR(cartTotal()));
    lines.push("");
    lines.push("Please share payment & delivery details.");
    var text = encodeURIComponent(lines.join("\n"));
    window.open("https://wa.me/" + WHATSAPP + "?text=" + text, "_blank");
  }

  function updateCartBadge() {
    var count = getCartCount();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = String(count);
      el.classList.toggle("hidden", count === 0);
      el.classList.toggle("inline-flex", count > 0);
    });
  }

  function showToast(message) {
    var existing = document.getElementById("store-toast");
    if (existing) existing.remove();
    var toast = document.createElement("div");
    toast.id = "store-toast";
    toast.className = "store-toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.add("show");
    });
    setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () {
        toast.remove();
      }, 250);
    }, 2200);
  }

  function bindGlobalActions() {
    document.addEventListener("click", function (e) {
      var addBtn = e.target.closest("[data-add-cart]");
      if (addBtn) {
        e.preventDefault();
        e.stopPropagation();
        addToCart(addBtn.getAttribute("data-add-cart"), 1);
        return;
      }
      var waBtn = e.target.closest("[data-whatsapp]");
      if (waBtn) {
        e.preventDefault();
        e.stopPropagation();
        openWhatsAppForProduct(waBtn.getAttribute("data-whatsapp"), 1);
        return;
      }
      var notifyBtn = e.target.closest("[data-notify]");
      if (notifyBtn) {
        e.preventDefault();
        e.stopPropagation();
        openNotifyForProduct(notifyBtn.getAttribute("data-notify"));
        return;
      }
    });
    updateCartBadge();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindGlobalActions);
  } else {
    bindGlobalActions();
  }

  window.Cart = {
    getCart: getCart,
    getCartCount: getCartCount,
    addToCart: addToCart,
    setQty: setQty,
    removeFromCart: removeFromCart,
    clearCart: clearCart,
    cartTotal: cartTotal,
    openWhatsAppForProduct: openWhatsAppForProduct,
    openNotifyForProduct: openNotifyForProduct,
    openWhatsAppForCart: openWhatsAppForCart,
    updateCartBadge: updateCartBadge,
    showToast: showToast,
    WHATSAPP: WHATSAPP,
  };
})();
