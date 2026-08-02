export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  const requestUrl = new URL(context.request.url);
  const origin = requestUrl.origin;
  let html = await response.text();

  // Force absolute OG / Twitter image URLs (crawlers need https://...)
  html = html.replace(
    /(<meta[^>]+(?:property|name)="(?:og:image|twitter:image)"[^>]+content=")(?!https?:\/\/)([^"]+)(")/gi,
    "$1" + origin + "/$2$3"
  );
  html = html.replace(
    /(<meta[^>]+content=")(?!https?:\/\/)([^"]+)("[^>]+(?:property|name)="(?:og:image|twitter:image)")/gi,
    "$1" + origin + "/$2$3"
  );

  // Absolute og:url
  if (/property="og:url"/.test(html)) {
    html = html.replace(
      /(<meta[^>]+property="og:url"[^>]+content=")[^"]*(")/i,
      "$1" + requestUrl.href.split("#")[0] + "$2"
    );
  } else {
    html = html.replace(
      "</head>",
      '  <meta property="og:url" content="' +
        requestUrl.href.split("#")[0] +
        '" />\n</head>'
    );
  }

  // Product-specific OG for /product?id=... (Cloudflare may strip .html)
  const path = requestUrl.pathname.replace(/\/$/, "") || "/";
  const isProduct =
    path === "/product" ||
    path.endsWith("/product") ||
    path.endsWith("/product.html") ||
    path.endsWith("product.html");
  const productId = requestUrl.searchParams.get("id");

  if (isProduct && productId) {
    try {
      const ogRes = await fetch(new URL("/products-og.json", origin).toString());
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
          const image = origin + "/" + String(product.image || "og-image.jpg").replace(/^\//, "");
          html = upsertMeta(html, "property", "og:type", "product");
          html = upsertMeta(html, "property", "og:title", title);
          html = upsertMeta(html, "property", "og:description", desc);
          html = upsertMeta(html, "property", "og:image", image);
          html = upsertMeta(html, "name", "twitter:title", title);
          html = upsertMeta(html, "name", "twitter:description", desc);
          html = upsertMeta(html, "name", "twitter:image", image);
          html = upsertMeta(html, "name", "description", desc);
          html = html.replace(/<title>[^<]*<\/title>/i, "<title>" + escapeHtml(title) + "</title>");
        }
      }
    } catch (e) {
      // keep default tags
    }
  }

  // Ensure default image points at optimized og-image.jpg when still logo.png
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
}

function upsertMeta(html, attr, key, value) {
  const safe = escapeHtml(value);
  const re = new RegExp(
    "<meta[^>]+" + attr + '="' + key + '"[^>]*>',
    "i"
  );
  const tag =
    "<meta " + attr + '="' + key + '" content="' + safe + '" />';
  if (re.test(html)) {
    return html.replace(re, tag);
  }
  return html.replace("</head>", "  " + tag + "\n</head>");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
