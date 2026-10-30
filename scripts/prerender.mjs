// Static site generation: renders the pages that are the same for every visitor
// into HTML files, so the browser can paint them (and find the main image)
// before any JavaScript runs. The layout follows GitHub Pages: /shop is served
// from shop.html, and unknown paths get 404.html, the client-rendered shell.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const root = join(import.meta.dirname, "..");
const dist = join(root, "dist");
const { render, prerenderPaths } = await import(pathToFileURL(join(root, "dist-ssr", "entry-server.js")).href);

const shell = readFileSync(join(dist, "index.html"), "utf8");
if (!shell.includes('<div id="root"></div>')) throw new Error("dist/index.html has no empty #root");

// User-specific pages (cart, checkout, order) are the shell: rendered in the browser.
writeFileSync(join(dist, "404.html"), shell);
for (const page of ["cart", "checkout"]) writeFileSync(join(dist, `${page}.html`), shell);

for (const path of prerenderPaths) {
  const html = shell.replace('<div id="root"></div>', `<div id="root">${await render(path)}</div>`);
  const file = path === "/" ? join(dist, "index.html") : join(dist, `${path.slice(1)}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

rmSync(join(root, "dist-ssr"), { recursive: true, force: true });
console.log(`prerendered ${prerenderPaths.length} pages`);
