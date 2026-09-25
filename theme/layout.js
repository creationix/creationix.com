// The whole theme: plain functions that return HTML strings.
// Edit freely; there is no template language to learn.
import { readFileSync } from "node:fs";
import { escapeHtml as e } from "../lib/markdown.js";

// Inlined into every page: one request per page, no render-blocking CSS fetch.
const css = readFileSync(new URL("style.css", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  .replace(/\s*([{}:;,>])\s*/g, "$1")
  .trim();

const date = (d) => d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
const time = (d) => `<time datetime="${d.toISOString().slice(0, 10)}">${date(d)}</time>`;
const abs = (site, path) => new URL(path, site.url).href;

export function page(site, { title, description, path, image, type = "website", body, head = "" }) {
  const fullTitle = title ? `${title} · ${site.title}` : site.title;
  const desc = description || site.description;
  const nav = site.nav
    .map(([label, href]) => `<a href="${e(href)}"${href === path ? ' aria-current="page"' : ""}>${e(label)}</a>`)
    .join("");
  return `<!doctype html>
<html lang="${site.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(fullTitle)}</title>
<meta name="description" content="${e(desc)}">
<link rel="canonical" href="${abs(site, path)}">
<link rel="alternate" type="application/atom+xml" title="${e(site.title)}" href="${site.feeds[0]}">
<link rel="icon" href="/favicon.ico">
<meta name="color-scheme" content="light dark">
<meta property="og:site_name" content="${e(site.title)}">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${e(title || site.title)}">
<meta property="og:description" content="${e(desc)}">
<meta property="og:url" content="${abs(site, path)}">
<meta property="og:image" content="${abs(site, image || site.image)}">
<meta name="twitter:card" content="summary_large_image">
${head}<style>${css}</style>
</head>
<body>
<header class="site">
<a class="brand" href="/">${e(site.title)}</a>
<nav>${nav}</nav>
</header>
<main>
${body}
</main>
<footer class="site">© ${new Date().getUTCFullYear()} ${e(site.author.name)}</footer>
</body>
</html>
`;
}

const tagLinks = (tags) =>
  tags.length ? ` · ${tags.map((t) => `<a href="/tag/${t.slug}/">${e(t.name)}</a>`).join(", ")}` : "";

export function post(site, p) {
  return page(site, {
    title: p.title,
    description: p.excerpt,
    path: p.path,
    image: p.image,
    type: "article",
    head: `<meta property="article:published_time" content="${p.date.toISOString()}">\n`,
    body: `<article>
<header>
<h1>${e(p.title)}</h1>
<p class="meta">${time(p.date)}${tagLinks(p.tags)}</p>
</header>
${p.html}
</article>`,
  });
}

export function list(site, { title, description, path, posts, intro = "" }) {
  const items = posts
    .map((p) => `<li>
<h2><a href="${p.path}">${e(p.title)}</a></h2>
<p class="meta">${time(p.date)}${tagLinks(p.tags)}</p>
<p>${e(p.excerpt)}</p>
</li>`)
    .join("\n");
  return page(site, { title, description, path, body: `${intro}<ol class="posts">\n${items}\n</ol>` });
}

export function notFound(site) {
  return page(site, {
    title: "Not found",
    path: "/404.html",
    body: `<h1>Not found</h1>\n<p>That page doesn't exist. Try the <a href="/">list of posts</a>.</p>`,
  });
}

export function redirect(site, to) {
  const href = e(abs(site, to));
  return `<!doctype html><meta charset="utf-8"><title>Moved</title><link rel="canonical" href="${href}">` +
    `<meta http-equiv="refresh" content="0; url=${href}"><a href="${href}">Moved here</a>\n`;
}

export function feed(site, posts) {
  const x = (s) => e(s).replace(/'/g, "&apos;");
  const updated = posts.reduce((a, p) => (p.updated > a ? p.updated : a), new Date(0));
  const entries = posts.map((p) => `<entry>
<title>${x(p.title)}</title>
<link href="${abs(site, p.path)}"/>
<id>${abs(site, p.path)}</id>
<published>${p.date.toISOString()}</published>
<updated>${p.updated.toISOString()}</updated>
${p.tags.map((t) => `<category term="${x(t.name)}"/>`).join("")}
<summary>${x(p.excerpt)}</summary>
<content type="html">${x(p.html.replace(/(src|href)="\//g, `$1="${site.url}/`))}</content>
</entry>`);
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<title>${x(site.title)}</title>
<subtitle>${x(site.description)}</subtitle>
<link href="${abs(site, site.feeds[0])}" rel="self"/>
<link href="${site.url}/"/>
<id>${site.url}/</id>
<updated>${updated.toISOString()}</updated>
<author><name>${x(site.author.name)}</name></author>
${entries.join("\n")}
</feed>
`;
}

export function sitemap(site, paths) {
  return `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `<url><loc>${abs(site, p)}</loc></url>`).join("\n")}
</urlset>
`;
}
