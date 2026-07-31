(function () {
  function render() {
    var grid = document.getElementById("ig-grid");
    var profileLink = document.getElementById("ig-profile-link");
    var handleEl = document.getElementById("ig-handle");
    if (!window.INSTAGRAM || !grid) return;

    if (profileLink) profileLink.href = INSTAGRAM.profileUrl;
    if (handleEl) handleEl.textContent = "@" + INSTAGRAM.profile;

    var posts = INSTAGRAM.posts || [];
    if (!posts.length) {
      grid.innerHTML =
        '<p class="col-span-full text-center text-stone-500 py-10">No Instagram posts listed yet.</p>';
      return;
    }

    grid.innerHTML = posts
      .map(function (post, index) {
        var url = post.url.replace(/\/?$/, "/");
        return (
          '<article class="ig-card">' +
          '<div class="ig-card-head">' +
          '<span class="ig-card-label">' +
          (post.type === "reel" ? "Reel" : "Video / Post") +
          " " +
          (index + 1) +
          "</span>" +
          '<a href="' +
          url +
          '" target="_blank" rel="noopener" class="ig-card-open">Open on Instagram</a>' +
          "</div>" +
          (post.title
            ? '<h3 class="ig-card-title">' + post.title + "</h3>"
            : "") +
          '<div class="ig-embed-wrap">' +
          '<blockquote class="instagram-media" data-instgrm-permalink="' +
          url +
          '" data-instgrm-version="14" style="background:#FFF;border:0;border-radius:12px;margin:0 auto;max-width:540px;min-width:260px;width:100%;">' +
          '<a href="' +
          url +
          '" target="_blank" rel="noopener">View this post on Instagram</a>' +
          "</blockquote>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    if (window.instgrm && window.instgrm.Embeds) {
      window.instgrm.Embeds.process();
    }
  }

  document.addEventListener("DOMContentLoaded", render);
})();
