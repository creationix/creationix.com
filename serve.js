#!/usr/bin/env node
// Dev server: builds (with drafts), serves dist/, rebuilds on change and
// reloads open browser tabs. Usage: node serve.js [port]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { watch } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "./build.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const dist = join(root, "dist");
const port = Number(process.argv[2]) || 8080;
const types = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif",
  ".svg": "image/svg+xml", ".webp": "image/webp", ".avif": "image/avif", ".ico": "image/x-icon",
};
const reload = `<script>new EventSource("/__reload").onmessage = () => location.reload()</script>`;
const clients = new Set();

async function rebuild() {
  try {
    await build({ drafts: true });
    for (const res of clients) res.write("data: reload\n\n");
  } catch (err) {
    console.error(err);
  }
}

let timer;
for (const dir of ["content", "theme", "lib", "site.config.js"]) {
  watch(join(root, dir), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 50);
  });
}

createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (url === "/__reload") {
    res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store" });
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }
  let file = join(dist, normalize(url));
  if (!file.startsWith(dist)) return res.writeHead(403).end();
  try {
    if ((await stat(file)).isDirectory()) {
      if (!url.endsWith("/")) return res.writeHead(301, { location: url + "/" }).end();
      file = join(file, "index.html");
    }
    send(res, 200, file, await readFile(file));
  } catch {
    const file404 = join(dist, "404.html");
    send(res, 404, file404, await readFile(file404).catch(() => "Not found"));
  }
}).listen(port, () => console.log(`http://localhost:${port}/`));

function send(res, status, file, body) {
  const type = types[extname(file)] || "application/octet-stream";
  if (type.startsWith("text/html")) body = String(body).replace("</body>", `${reload}</body>`);
  res.writeHead(status, { "content-type": type, "cache-control": "no-store" }).end(body);
}

await rebuild();
