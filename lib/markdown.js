// A small Markdown renderer covering the parts of CommonMark/GFM a blog needs:
// ATX headings, paragraphs, lists (nested), blockquotes, fenced code, rules,
// tables, images, links, emphasis, code spans, hard breaks and raw HTML.
// It is intentionally not a complete CommonMark implementation. When you need
// something it doesn't do, write the HTML inline; it is passed through as-is.

export function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

export function slugify(s) {
  return s
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z0-9#]+;/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

// Tags that start a raw HTML block when they open a line.
const BLOCK_TAGS = new Set(
  ("address article aside audio blockquote details dialog div dl fieldset figcaption figure footer form " +
    "h1 h2 h3 h4 h5 h6 header hr iframe main nav ol p picture pre script section style summary table ul video")
    .split(" "),
);

const RE = {
  blank: /^\s*$/,
  fence: /^ {0,3}(`{3,}|~{3,})\s*([^`\s]*)/,
  heading: /^ {0,3}(#{1,6})(?:\s+(.*?))?(?:\s+#+)?\s*$/,
  rule: /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/,
  quote: /^ {0,3}> ?/,
  item: /^( {0,3})([-*+]|\d{1,9}[.)])( +|$)/,
  html: /^ {0,3}<(\/?)([a-zA-Z][a-zA-Z0-9-]*)[\s/>]|^ {0,3}<!--/,
  tableSep: /^ {0,3}\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/,
};

function isHtmlBlock(line) {
  const m = line.match(RE.html);
  return m && (!m[2] || BLOCK_TAGS.has(m[2].toLowerCase()));
}

function interrupts(line) {
  return RE.fence.test(line) || RE.heading.test(line) || RE.rule.test(line) ||
    RE.quote.test(line) || isHtmlBlock(line) || /^ {0,3}([-*+]|1[.)]) +\S/.test(line);
}

const splitRow = (row) => row.trim().replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map((c) => c.trim());

// ---------------------------------------------------------------------------
// Blocks

export function render(src, opts = {}) {
  return blocks(src.replace(/\r\n?/g, "\n").replace(/\t/g, "    ").split("\n"), opts).join("\n");
}

function blocks(lines, opts) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    let m;

    if (RE.blank.test(line)) { i++; continue; }

    if ((m = line.match(RE.fence))) {
      const close = new RegExp(`^ {0,3}${m[1][0]}{${m[1].length},}\\s*$`);
      const body = [];
      for (i++; i < lines.length && !close.test(lines[i]); i++) body.push(lines[i]);
      i++;
      const cls = m[2] ? ` class="language-${escapeHtml(m[2])}"` : "";
      out.push(`<pre><code${cls}>${escapeHtml(body.join("\n"))}${body.length ? "\n" : ""}</code></pre>`);
      continue;
    }

    if ((m = line.match(RE.heading))) {
      const n = m[1].length, html = inline(m[2] || "", opts);
      out.push(`<h${n} id="${slugify(html)}">${html}</h${n}>`);
      i++;
      continue;
    }

    if (RE.rule.test(line)) { out.push("<hr>"); i++; continue; }

    if (RE.quote.test(line)) {
      const body = [];
      while (i < lines.length && !RE.blank.test(lines[i])) body.push(lines[i++].replace(RE.quote, ""));
      out.push(`<blockquote>\n${blocks(body, opts).join("\n")}\n</blockquote>`);
      continue;
    }

    if (isHtmlBlock(line)) {
      const body = [];
      while (i < lines.length && !RE.blank.test(lines[i])) body.push(lines[i++]);
      out.push(body.join("\n"));
      continue;
    }

    if ((m = line.match(RE.item))) { i = list(lines, i, out, opts); continue; }

    if (line.includes("|") && i + 1 < lines.length && RE.tableSep.test(lines[i + 1])) {
      const head = splitRow(line);
      const align = splitRow(lines[i + 1]).map((c) =>
        c.endsWith(":") ? (c.startsWith(":") ? "center" : "right") : c.startsWith(":") ? "left" : "");
      const cell = (tag, c, j) => `<${tag}${align[j] ? ` style="text-align:${align[j]}"` : ""}>${inline(c, opts)}</${tag}>`;
      const rows = [];
      for (i += 2; i < lines.length && lines[i].includes("|") && !RE.blank.test(lines[i]); i++) {
        rows.push(`<tr>${splitRow(lines[i]).map((c, j) => cell("td", c, j)).join("")}</tr>`);
      }
      out.push(`<table>\n<thead><tr>${head.map((c, j) => cell("th", c, j)).join("")}</tr></thead>\n` +
        `<tbody>\n${rows.join("\n")}\n</tbody>\n</table>`);
      continue;
    }

    // Paragraph
    const body = [line];
    for (i++; i < lines.length && !RE.blank.test(lines[i]) && !interrupts(lines[i]); i++) body.push(lines[i]);
    const text = body.join("\n").trim();
    // A paragraph holding only an image becomes a figure; its title is the caption.
    const fig = text.match(/^!\[([^\]]*)\]\(\s*<?([^\s)>]+)>?(?:\s+"([^"]*)")?\s*\)$/);
    if (fig) {
      const cap = fig[3] ? `<figcaption>${inline(fig[3], opts)}</figcaption>` : "";
      out.push(`<figure>${image(fig[1], fig[2], "", opts)}${cap}</figure>`);
    } else {
      out.push(`<p>${inline(text, opts)}</p>`);
    }
  }
  return out;
}

function list(lines, i, out, opts) {
  const first = lines[i].match(RE.item);
  const ordered = /\d/.test(first[2]);
  const marker = first[2].slice(-1);
  const start = ordered ? parseInt(first[2], 10) : 1;
  const items = [];
  let loose = false;

  while (i < lines.length) {
    const m = lines[i].match(RE.item);
    if (!m || /\d/.test(m[2]) !== ordered || m[2].slice(-1) !== marker) break;
    const indent = m[1].length + m[2].length + Math.min(m[3].length || 1, 4);
    const body = [lines[i].slice(indent)];
    let sawBlank = false;
    for (i++; i < lines.length; i++) {
      const l = lines[i];
      if (RE.blank.test(l)) { sawBlank = true; body.push(""); continue; }
      const dent = l.match(/^ */)[0].length;
      if (dent >= indent) { body.push(l.slice(indent)); if (sawBlank) loose = true; sawBlank = false; continue; }
      if (sawBlank || RE.item.test(l) || interrupts(l)) break;
      body.push(l.trim()); // lazy continuation
    }
    while (body.length && body[body.length - 1] === "") body.pop();
    items.push(body);
    if (sawBlank && i < lines.length && RE.item.test(lines[i])) loose = true;
  }

  const lis = items.map((body) => {
    let html = blocks(body, opts).join("\n");
    if (!loose) html = html.replace(/^<p>([\s\S]*?)<\/p>(?=\n|$)/, "$1");
    return `<li>${html}</li>`;
  });
  const tag = ordered ? "ol" : "ul";
  const attr = ordered && start !== 1 ? ` start="${start}"` : "";
  out.push(`<${tag}${attr}>\n${lis.join("\n")}\n</${tag}>`);
  return i;
}

// ---------------------------------------------------------------------------
// Inline

const url = (u) => escapeHtml(u.replace(/\\([()])/g, "$1"));

function image(alt, src, title, opts) {
  const t = title ? ` title="${escapeHtml(title)}"` : "";
  return `<img src="${url(opts.resolve ? opts.resolve(src) : src)}" alt="${escapeHtml(alt)}"${t} loading="lazy" decoding="async">`;
}

// Each rule is a sticky regex tried at the current position, plus a renderer.
const DEST = String.raw`\(\s*<?((?:[^\s()<>\\]|\\.|\([^\s()]*\))+)>?(?:\s+"([^"]*)")?\s*\)`;
const RULES = [
  [/(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/y, (m) => `<code>${escapeHtml(m[2].replace(/\n/g, " ").replace(/^ (.*) $/, "$1"))}</code>`],
  [new RegExp(String.raw`!\[([^\]]*)\]` + DEST, "y"), (m, o) => image(m[1], m[2], m[3], o)],
  [new RegExp(String.raw`\[((?:[^\[\]\\]|\\.|\[[^\]]*\])*)\]` + DEST, "y"), (m, o) =>
    `<a href="${url(o.resolve ? o.resolve(m[2]) : m[2])}"${m[3] ? ` title="${escapeHtml(m[3])}"` : ""}>${inline(m[1], o)}</a>`],
  [/<((?:https?|mailto):[^\s<>]+)>/y, (m) => `<a href="${url(m[1])}">${escapeHtml(m[1].replace(/^mailto:/, ""))}</a>`],
  [/<!--[\s\S]*?-->|<\/?[a-zA-Z][a-zA-Z0-9-]*(?:\s+[^<>]*?)?\/?>/y, (m) => m[0]],
  [/&(?:#\d{1,7}|#x[\da-fA-F]{1,6}|[a-zA-Z][a-zA-Z\d]{1,31});/y, (m) => m[0]],
  [/\\([!-/:-@[-`{-~])/y, (m) => escapeHtml(m[1])],
  [/(?: {2,}|\\)\n/y, () => "<br>\n"],
  [/(\*\*|__)(?=\S)([\s\S]*?[^\s\\])\1/y, (m, o) => `<strong>${inline(m[2], o)}</strong>`],
  [/(\*|_)(?=[^\s*_])([\s\S]*?[^\s\\*_])\1(?![*_])/y, (m, o) => `<em>${inline(m[2], o)}</em>`],
];
const TRIGGERS = new Set("`![<&\\ *_");

export function inline(src, opts = {}) {
  let out = "", i = 0;
  outer: while (i < src.length) {
    const c = src[i];
    if (TRIGGERS.has(c)) {
      // No intraword emphasis with underscores (snake_case stays intact).
      const intraword = c === "_" && /[\p{L}\p{N}]/u.test(src[i - 1] || "");
      for (const [re, fn] of RULES) {
        if (intraword && re.source.startsWith("(\\*")) continue;
        re.lastIndex = i;
        const m = re.exec(src);
        if (m) { out += fn(m, opts); i = re.lastIndex; continue outer; }
      }
    }
    out += escapeHtml(c);
    i++;
  }
  return out;
}
