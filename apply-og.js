/**
 * Bake absolute OG image URLs into HTML for crawlers (WhatsApp/Facebook).
 * Usage: node apply-og.js https://your-domain.pages.dev
 */
const fs = require("fs");
const path = require("path");

const siteUrl = (process.argv[2] || "").replace(/\/$/, "");
if (!siteUrl || !/^https?:\/\//i.test(siteUrl)) {
  console.error("Usage: node apply-og.js https://your-cloudflare-domain");
  process.exit(1);
}

const dir = __dirname;
const ogImage = siteUrl + "/og-image.jpg";

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith(".html")) continue;
  const full = path.join(dir, file);
  let html = fs.readFileSync(full, "utf8");

  html = html.replace(
    /(<meta[^>]+(?:property|name)="(?:og:image|twitter:image)"[^>]+content=")[^"]*(")/gi,
    "$1" + ogImage + "$2"
  );
  html = html.replace(
    /(<meta[^>]+content=")[^"]*("[^>]+(?:property|name)="(?:og:image|twitter:image)")/gi,
    "$1" + ogImage + "$2"
  );

  // Keep og:url empty/current page relative fixed to site root pages where useful
  if (file === "index.html") {
    html = html.replace(
      /(<meta[^>]+property="og:url"[^>]+content=")[^"]*(")/i,
      "$1" + siteUrl + "/$2"
    );
    if (!/property="og:url"/.test(html)) {
      html = html.replace(
        "</head>",
        '  <meta property="og:url" content="' + siteUrl + '/" />\n</head>'
      );
    }
  }

  fs.writeFileSync(full, html);
  console.log("updated", file);
}

// Also patch data.js siteUrl
const dataPath = path.join(dir, "data.js");
let data = fs.readFileSync(dataPath, "utf8");
data = data.replace(
  /siteUrl:\s*"[^"]*"/,
  'siteUrl: "' + siteUrl + '"'
);
fs.writeFileSync(dataPath, data);
console.log("siteUrl set to", siteUrl);
console.log("Done. Redeploy the html folder, then refresh WhatsApp cache.");
