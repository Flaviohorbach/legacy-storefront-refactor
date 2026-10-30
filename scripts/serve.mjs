// Minimal static server, so the legacy store and the modern build are served
// the same way when measured: gzip for text like any real host (GitHub Pages
// included), no cache tricks on either side.
// Usage: node scripts/serve.mjs <folder> <port> [--pages]
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { createGzip } from "node:zlib";

const [folder = "dist", port = "4173"] = process.argv.slice(2);
const pages = process.argv.includes("--pages");
const root = resolve(folder);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".ico": "image/x-icon",
};

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
  let file = normalize(join(root, path));
  if (!file.startsWith(root)) return res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  let status = 200;
  if (!existsSync(file)) {
    if (!pages) return res.writeHead(404).end("Not found");
    // Like GitHub Pages: /shop is served from shop.html, anything else gets 404.html.
    if (existsSync(`${file}.html`)) file = `${file}.html`;
    else [file, status] = [join(root, "404.html"), 404];
  }
  const type = TYPES[extname(file)] ?? "application/octet-stream";
  const compressible = /^(text\/|application\/(json|vnd\.ms-fontobject)|image\/svg|font\/ttf)/.test(type);
  if (compressible && /\bgzip\b/.test(req.headers["accept-encoding"] ?? "")) {
    res.writeHead(status, { "Content-Type": type, "Content-Encoding": "gzip", Vary: "Accept-Encoding" });
    createReadStream(file).pipe(createGzip()).pipe(res);
  } else {
    res.writeHead(status, { "Content-Type": type });
    createReadStream(file).pipe(res);
  }
}).listen(Number(port), () => console.log(`Serving ${root} on http://localhost:${port}`));
