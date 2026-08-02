/**
 * Cloudflare Worker — serves static assets and injects product OG tags
 * so shared product links show that product's image in WhatsApp / social previews.
 */
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return response;
    }

    const requestUrl = new URL(request.url);
    const origin = requestUrl.origin;
    let html = await response.text();

    // Absolute og/twitter image URLs
    html = html.replace(
      /(<meta[^>]+(?:property|name)="(?:og:image|twitter:image)"[^>]+content=")(?!https?:\/\/)([^"]+)(")/gi,
      "$1" + origin + "/$2$3"
    );
    html = html.replace(
      /(<meta[^>]+content=")(?!https?:\/\/)([^"]+)("[^>]+(?:property|name)="(?:og:image|twitter:image)")/gi,
      "$1" + origin + "/$2$3"
    );

    const pageUrl = requestUrl.href.split("#")[0];
    if (/property="og:url"/.test(html)) {
      html = html.replace(
        /(<meta[^>]+property="og:url"[^>]+content=")[^"]*(")/i,
        "$1" + pageUrl + "$2"
      );
    } else {
      html = html.replace(
        "</head>",
        '  <meta property="og:url" content="' + pageUrl + '" />\n</head>'
      );
    }

    const path = requestUrl.pathname.replace(/\/$/, "") || "/";
    const isProduct =
      path === "/product" ||
      path.endsWith("/product") ||
      path.endsWith("/product.html") ||
      path.endsWith("product.html");
    const productId = requestUrl.searchParams.get("id");

    if (isProduct && productId) {
      try {
        const ogRes = await env.ASSETS.fetch(new URL("/products-og.json", origin));
        if (ogRes.ok) {
          const data = await ogRes.json();
          const product = (data.products || []).find(function (p) {
            return p.id === productId;
          });
          if (product) {
            const title = product.name + " | Orabyher";
            const desc =
              product.description ||
              product.name + " — ₹" + product.price + " | Orabyher";
            const image =
              origin +
              "/" +
              String(product.image || "og-image.jpg").replace(/^\//, "");
            html = upsertMeta(html, "property", "og:type", "product");
            html = upsertMeta(html, "property", "og:title", title);
            html = upsertMeta(html, "property", "og:description", desc);
            html = upsertMeta(html, "property", "og:image", image);
            html = upsertMeta(html, "property", "og:image:alt", product.name);
            html = upsertMeta(html, "name", "twitter:card", "summary_large_image");
            html = upsertMeta(html, "name", "twitter:title", title);
            html = upsertMeta(html, "name", "twitter:description", desc);
            html = upsertMeta(html, "name", "twitter:image", image);
            html = upsertMeta(html, "name", "description", desc);
            html = html.replace(
              /<title>[^<]*<\/title>/i,
              "<title>" + escapeHtml(title) + "</title>"
            );
          }
        }
      } catch (e) {
        // keep default tags
      }
    }

    html = html.replace(
      new RegExp(origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "/logo\\.png", "g"),
      origin + "/og-image.jpg"
    );

    const headers = new Headers(response.headers);
    headers.set("content-type", "text/html; charset=utf-8");
    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers: headers,
    });
  },
};

function upsertMeta(html, attr, key, value) {
  const safe = escapeHtml(value);
  const re = new RegExp("<meta[^>]+" + attr + '="' + key + '"[^>]*>', "i");
  const tag = "<meta " + attr + '="' + key + '" content="' + safe + '" />';
  if (re.test(html)) return html.replace(re, tag);
  return html.replace("</head>", "  " + tag + "\n</head>");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
