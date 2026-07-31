(function () {
  function productCard(product) {
    var oos = window.isProductOutOfStock
      ? isProductOutOfStock(product)
      : product.inStock === false;
    var actionBtn = oos
      ? '<button type="button" data-notify="' +
        product.id +
        '" class="notify-icon-btn" aria-label="Notify me" title="Notify me">' +
        notifySvg() +
        "</button>"
      : '<button type="button" data-whatsapp="' +
        product.id +
        '" class="wa-icon-btn-sm" aria-label="WhatsApp">' +
        whatsappSvg() +
        "</button>";
    var overlayAction = oos
      ? '<button type="button" data-notify="' +
        product.id +
        '" class="notify-icon-btn" aria-label="Notify me" title="Notify me">' +
        notifySvg() +
        "</button>"
      : '<button type="button" data-whatsapp="' +
        product.id +
        '" class="wa-icon-btn" aria-label="WhatsApp" title="WhatsApp">' +
        whatsappSvg() +
        "</button>";
    var cartBtn = oos
      ? '<span class="oos-pill">Out of stock</span>'
      : '<button type="button" data-add-cart="' +
        product.id +
        '" class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 hover:bg-primary hover:text-white transition-all" aria-label="Add to cart">' +
        cartSvg() +
        "</button>";

    return (
      '<div class="group block h-full">' +
      '<div class="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full border border-slate-100 flex flex-col">' +
      '<a href="product.html?id=' +
      product.id +
      '" class="relative aspect-square overflow-hidden bg-slate-50 block">' +
      '<img src="' +
      product.image +
      '" alt="' +
      product.name +
      '" class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110' +
      (oos ? " opacity-80" : "") +
      '" />' +
      (oos
        ? '<span class="absolute left-3 top-3 bg-stone-800 text-white text-[10px] font-semibold px-2 py-1 rounded uppercase tracking-wider">Sold out</span>'
        : "") +
      '<div class="absolute right-3 top-3 flex flex-col gap-2 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0 transition-all duration-300">' +
      '<button type="button" data-share="' +
      product.id +
      '" class="share-icon-btn" aria-label="Share" title="Share">' +
      shareSvg() +
      "</button>" +
      overlayAction +
      "</div>" +
      "</a>" +
      '<div class="p-4 flex-grow flex flex-col">' +
      '<a href="product.html?id=' +
      product.id +
      '">' +
      '<h3 class="text-slate-800 font-semibold text-sm mb-1 leading-snug line-clamp-2 group-hover:text-primary transition-colors">' +
      product.name +
      "</h3>" +
      "</a>" +
      '<div class="mt-auto pt-3 flex items-center justify-between gap-2">' +
      '<div class="flex flex-col">' +
      '<span class="text-lg font-bold text-slate-900">' +
      formatINR(product.price) +
      "</span>" +
      "</div>" +
      '<div class="flex items-center gap-2">' +
      '<button type="button" data-share="' +
      product.id +
      '" class="share-icon-btn" aria-label="Share" title="Share">' +
      shareSvg() +
      "</button>" +
      actionBtn +
      cartBtn +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>"
    );
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
  }

  function renderCategoryGrid(selector) {
    var el = document.querySelector(selector);
    if (!el || !window.STORE) return;
    el.innerHTML = STORE.categories
      .map(function (cat) {
        return (
          '<a href="category.html?id=' +
          cat.id +
          '" class="group relative h-64 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all">' +
          '<div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10"></div>' +
          '<img src="' +
          cat.image +
          '" alt="' +
          cat.name +
          '" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />' +
          '<div class="absolute bottom-0 left-0 p-6 z-20">' +
          '<h3 class="text-white text-xl font-bold mb-1 translate-y-2 group-hover:translate-y-0 transition-transform">' +
          cat.name +
          "</h3>" +
          '<span class="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity">Explore</span>' +
          "</div></a>"
        );
      })
      .join("");
  }

  window.UI = {
    productCard: productCard,
    renderGrid: renderGrid,
    renderCategoryGrid: renderCategoryGrid,
    whatsappSvg: whatsappSvg,
    notifySvg: notifySvg,
    shareSvg: shareSvg,
    cartSvg: cartSvg,
  };
})();
