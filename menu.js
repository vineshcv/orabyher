(function () {
  var LINKS = [
    { href: "index.html", label: "Home", icon: "home" },
    { href: "shop.html", label: "Shop" },
    { href: "customers.html", label: "Our Customers" },
    { href: "contact.html", label: "Contact" },
    { href: "cart.html", label: "Cart" },
  ];

  var IG_URL = "https://www.instagram.com/ora_by_her/";

  function currentPage() {
    var path = (window.location.pathname || "").split("/").pop() || "index.html";
    return path.toLowerCase();
  }

  function openMenu() {
    document.documentElement.classList.add("nav-open");
    var btn = document.getElementById("nav-burger");
    var drawer = document.getElementById("nav-drawer");
    if (btn) btn.setAttribute("aria-expanded", "true");
    if (drawer) drawer.setAttribute("aria-hidden", "false");
  }

  function closeMenu() {
    document.documentElement.classList.remove("nav-open");
    var btn = document.getElementById("nav-burger");
    var drawer = document.getElementById("nav-drawer");
    if (btn) btn.setAttribute("aria-expanded", "false");
    if (drawer) drawer.setAttribute("aria-hidden", "true");
  }

  function toggleMenu() {
    if (document.documentElement.classList.contains("nav-open")) closeMenu();
    else openMenu();
  }

  function initMobileMenu() {
    if (document.getElementById("nav-drawer")) return;

    var header = document.querySelector("header");
    if (!header) return;

    var desktopNav = header.querySelector("nav");
    if (desktopNav) desktopNav.classList.add("desktop-nav");

    var cartLink =
      header.querySelector('a[aria-label="Cart"]') ||
      header.querySelector('a[href="cart.html"]');

    var burger = document.createElement("button");
    burger.type = "button";
    burger.id = "nav-burger";
    burger.className = "nav-burger icon-btn";
    burger.setAttribute("aria-label", "Open menu");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-controls", "nav-drawer");
    burger.innerHTML =
      '<span class="nav-burger-lines" aria-hidden="true">' +
      "<span></span><span></span><span></span>" +
      "</span>";

    if (cartLink && cartLink.parentNode) {
      cartLink.parentNode.insertBefore(burger, cartLink);
    } else {
      header.appendChild(burger);
    }

    var page = currentPage();
    var homeIcon =
      '<svg class="nav-home-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z"/></svg>';
    var linksHtml = LINKS.map(function (link) {
      var active =
        page === link.href.toLowerCase() ||
        (page === "" && link.href === "index.html");
      var label =
        link.icon === "home"
          ? homeIcon + "<span>" + link.label + "</span>"
          : link.label;
      return (
        '<a href="' +
        link.href +
        '" class="nav-drawer-link' +
        (active ? " is-active" : "") +
        (link.icon === "home" ? " nav-drawer-link-home" : "") +
        '">' +
        label +
        "</a>"
      );
    }).join("");

    var backdrop = document.createElement("div");
    backdrop.id = "nav-backdrop";
    backdrop.className = "nav-backdrop";
    backdrop.setAttribute("aria-hidden", "true");

    var drawer = document.createElement("aside");
    drawer.id = "nav-drawer";
    drawer.className = "nav-drawer";
    drawer.setAttribute("aria-hidden", "true");
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-label", "Menu");
    drawer.innerHTML =
      '<div class="nav-drawer-head">' +
      '<a href="index.html" class="nav-drawer-brand">' +
      '<img src="logo.png" alt="Orabyher" />' +
      "</a>" +
      '<button type="button" id="nav-drawer-close" class="nav-drawer-close" aria-label="Close menu">' +
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8">' +
      '<path stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/>' +
      "</svg>" +
      "</button>" +
      "</div>" +
      '<nav class="nav-drawer-nav">' +
      linksHtml +
      "</nav>";

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    burger.addEventListener("click", function (e) {
      e.preventDefault();
      toggleMenu();
    });
    backdrop.addEventListener("click", closeMenu);
    document
      .getElementById("nav-drawer-close")
      .addEventListener("click", closeMenu);
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  function initInstagramFab() {
    if (document.getElementById("ig-fab")) return;
    var fab = document.createElement("a");
    fab.id = "ig-fab";
    fab.className = "ig-fab";
    fab.href = IG_URL;
    fab.target = "_blank";
    fab.rel = "noopener noreferrer";
    fab.setAttribute("aria-label", "Instagram @ora_by_her");
    fab.title = "Instagram";
    fab.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">' +
      '<path d="M7.5 2h9A5.5 5.5 0 0122 7.5v9A5.5 5.5 0 0116.5 22h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2zm0 2A3.5 3.5 0 004 7.5v9A3.5 3.5 0 007.5 20h9a3.5 3.5 0 003.5-3.5v-9A3.5 3.5 0 0016.5 4h-9zm9.25 1.75a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6z"/>' +
      "</svg>";
    document.body.appendChild(fab);
  }

  function init() {
    initMobileMenu();
    initInstagramFab();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
