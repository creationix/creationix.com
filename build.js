#!/usr/bin/env node
// Builds content/ into dist/. No dependencies beyond Node itself.
//
//   content/<name>/index.md  ->  /<name>/        (a post if it has a `date`, else a page)
//   content/<name>.md        ->  /<name>/
//   content/index.md         ->  intro shown above the post list on /
//   anything else            ->  copied to the same path
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { escapeHtml, render, slugify } from "./lib/markdown.js";
import * as theme from "./theme/layout.js";

const root = dirname(fileURLToPath(import.meta.url));
const CONTENT = join(root, "content");
const DIST = join(root, "dist");

// "---\nkey: value\n---" at the top of a file. Values are strings; `tags` is a list.
function frontMatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const data = {};
  if (!m) return { data, body: src };
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w-]+):\s*(.*?)\s*$/);
    if (kv) data[kv[1]] = kv[2].replace(/^(["'])(.*)\1$/, "$2");
  }
  return { data, body: src.slice(m[0].length) };
}

function excerpt(html, max = 180) {
  const first = html.match(/<p>([\s\S]*?)<\/p>/)?.[1] ?? "";
  const text = first.replace(/<[^>]+>/g, "").replace(/&(amp|lt|gt|quot|#39);/g,
    (_, c) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" })[c]).replace(/\s+/g, " ").trim();
  return text.length <= max ? text : text.slice(0, text.lastIndexOf(" ", max)).replace(/[,.;:]$/, "") + "…";
}

function load(file) {
  const rel = relative(CONTENT, file).split(sep).join("/");
  const dir = rel.replace(/(^|\/)index\.md$/, "").replace(/\.md$/, "");
  const path = dir ? `/${dir}/` : "/";
  const { data, body } = frontMatter(readFileSync(file, "utf8"));
  // Relative links and images resolve against the page's own folder.
  const base = new URL(rel.endsWith("index.md") ? path : `/${rel}`, "http://x");
  const resolve = (u) => /^([a-z][a-z0-9+.-]*:|\/|#)/i.test(u) ? u : new URL(u, base).pathname;
  const html = render(body, { resolve });
  const date = data.date ? new Date(data.date) : null;
  if (date && isNaN(date)) throw new Error(`${rel}: bad date "${data.date}"`);
  return {
    ...data,
    path,
    html,
    date,
    updated: data.updated ? new Date(data.updated) : date,
    draft: data.draft === "true",
    image: data.image && resolve(data.image),
    excerpt: data.description || excerpt(html),
    tags: (data.tags || "").split(",").map((t) => t.trim()).filter(Boolean)
      .map((name) => ({ name, slug: slugify(name) })),
  };
}

function walk(dir, files = []) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    ent.isDirectory() ? walk(p, files) : files.push(p);
  }
  return files;
}

export async function build({ drafts = false, quiet = false } = {}) {
  const t0 = performance.now();
  // Re-import config each build so the dev server picks up edits.
  const site = (await import(`${pathToFileURL(join(root, "site.config.js"))}?${Date.now()}`)).default;
  site.url = site.url.replace(/\/$/, "");

  rmSync(DIST, { recursive: true, force: true });
  const write = (path, data) => {
    const file = join(DIST, path.endsWith("/") ? path + "index.html" : path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, data);
  };

  const docs = [];
  for (const file of walk(CONTENT)) {
    if (file.endsWith(".md")) docs.push(load(file));
    else cpSync(file, join(DIST, relative(CONTENT, file)));
  }

  const visible = docs.filter((d) => drafts || !d.draft);
  const home = visible.find((d) => d.path === "/");
  const pages = visible.filter((d) => !d.date && d !== home);
  const posts = visible.filter((d) => d.date).sort((a, b) => b.date - a.date);

  for (const p of posts) write(p.path, theme.post(site, p));
  for (const p of pages) {
    write(p.path, theme.page(site, {
      title: p.title, description: p.description, path: p.path, image: p.image,
      body: `<article>\n${p.title ? `<header><h1>${escapeHtml(p.title)}</h1></header>\n` : ""}${p.html}\n</article>`,
    }));
  }
  write("/", theme.list(site, { path: "/", posts, intro: home?.html ?? "" }));

  const tags = new Map();
  for (const p of posts) for (const t of p.tags) {
    if (!tags.has(t.slug)) tags.set(t.slug, { ...t, posts: [] });
    tags.get(t.slug).posts.push(p);
  }
  for (const t of tags.values()) {
    const path = `/tag/${t.slug}/`;
    write(path, theme.list(site, {
      title: t.name, path, posts: t.posts,
      description: `Posts tagged “${t.name}”`, intro: `<h1>Tagged “${t.name}”</h1>\n`,
    }));
  }

  const published = posts.filter((p) => !p.draft);
  for (const f of site.feeds) write(f, theme.feed(site, published));
  for (const [from, to] of Object.entries(site.redirects || {})) write(from, theme.redirect(site, to));
  write("/404.html", theme.notFound(site));
  const listed = ["/", ...posts.map((p) => p.path), ...pages.map((p) => p.path), ...[...tags.keys()].map((s) => `/tag/${s}/`)];
  write("/sitemap.xml", theme.sitemap(site, listed));

  if (!quiet) {
    console.log(`built ${posts.length} posts, ${pages.length} pages, ${tags.size} tags in ${(performance.now() - t0).toFixed(0)}ms`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await build({ drafts: process.argv.includes("--drafts") });
}
