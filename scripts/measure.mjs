// Measures the same shopping journey on the legacy store and on the modern build
// with Lighthouse (mobile, simulated slow 4G, the default), and writes the medians.
// Usage: node scripts/measure.mjs [legacy|modern|all] [--runs=3]
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import puppeteer from "puppeteer-core";

const root = join(import.meta.dirname, "..");
const which = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "all";
const runs = Number(process.argv.find((a) => a.startsWith("--runs="))?.split("=")[1] ?? 3);

// The same five steps of the journey on both sides.
const TARGETS = {
  legacy: {
    folder: "legacy",
    port: 5191,
    githubPages: false,
    pages: {
      home: "/index.html",
      shop: "/shop.html",
      product: "/product-single.html",
      cart: "/cart.html",
      checkout: "/checkout.html",
    },
  },
  modern: {
    folder: "dist",
    port: 4173,
    githubPages: true,
    pages: {
      home: "/",
      shop: "/shop",
      product: "/product/186/calvin-klein-heel-shoes",
      cart: "/cart",
      checkout: "/checkout",
    },
    // The legacy cart and checkout show hard-coded items. The modern ones read the
    // real cart, and an empty cart sends /checkout back to /cart, so the cart is
    // filled first. Lighthouse clears the HTTP cache between runs but not localStorage.
    localStorage: { "aviato-cart": JSON.stringify([{ productId: 186, quantity: 2 }, { productId: 90, quantity: 1 }]) },
  },
};

async function seedLocalStorage(chromePort, origin, entries) {
  const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${chromePort}` });
  const page = await browser.newPage();
  await page.goto(origin);
  await page.evaluate((items) => Object.entries(items).forEach(([k, v]) => localStorage.setItem(k, v)), entries);
  await page.close();
  await browser.disconnect();
}

const METRICS = {
  lcp: "largest-contentful-paint",
  fcp: "first-contentful-paint",
  tbt: "total-blocking-time",
  cls: "cumulative-layout-shift",
  si: "speed-index",
};

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

function serve({ folder, port, githubPages }) {
  const args = [join(root, "scripts", "serve.mjs"), join(root, folder), String(port), ...(githubPages ? ["--pages"] : [])];
  const child = spawn(process.execPath, args, { stdio: ["ignore", "pipe", "inherit"] });
  return new Promise((resolve) => child.stdout.once("data", () => resolve(child)));
}

async function measure(name) {
  const target = TARGETS[name];
  if (!existsSync(join(root, target.folder, "index.html"))) {
    throw new Error(`${target.folder}/ not found. Run ${name === "legacy" ? "npm run legacy:fetch" : "npm run build"} first.`);
  }
  const server = await serve(target);
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new"] });
  const result = {};
  try {
    if (target.localStorage) await seedLocalStorage(chrome.port, `http://localhost:${target.port}/`, target.localStorage);
    for (const [page, path] of Object.entries(target.pages)) {
      const samples = [];
      for (let i = 0; i < runs; i++) {
        const url = `http://localhost:${target.port}${path}`;
        const { lhr } = await lighthouse(url, { port: chrome.port, output: "json", logLevel: "error", onlyCategories: ["performance", "accessibility", "best-practices", "seo"] });
        const network = lhr.audits["network-requests"].details?.items ?? [];
        samples.push({
          performance: Math.round(lhr.categories.performance.score * 100),
          accessibility: Math.round(lhr.categories.accessibility.score * 100),
          bestPractices: Math.round(lhr.categories["best-practices"].score * 100),
          seo: Math.round(lhr.categories.seo.score * 100),
          ...Object.fromEntries(Object.entries(METRICS).map(([key, id]) => [key, lhr.audits[id].numericValue])),
          requests: network.length,
          transferKB: Math.round(network.reduce((sum, r) => sum + (r.transferSize ?? 0), 0) / 1024),
        });
        if (i === 0) {
          mkdirSync(join(root, "reports", "raw"), { recursive: true });
          writeFileSync(join(root, "reports", "raw", `${name}-${page}.json`), JSON.stringify(lhr));
        }
      }
      // Median of each number independently: one slow run does not decide the result.
      result[page] = Object.fromEntries(Object.keys(samples[0]).map((key) => [key, median(samples.map((s) => s[key]))]));
      console.log(name, page, result[page]);
    }
  } finally {
    await chrome.kill();
    server.kill();
  }
  writeFileSync(join(root, "reports", `${name}.json`), JSON.stringify({ measuredAt: new Date().toISOString(), runs, pages: result }, null, 2) + "\n");
}

function compare() {
  const load = (name) => JSON.parse(readFileSync(join(root, "reports", `${name}.json`), "utf8"));
  const [before, after] = [load("legacy"), load("modern")];
  const ms = (v) => `${(v / 1000).toFixed(1)} s`;
  const rows = [
    ["Performance", "performance", (v) => String(v)],
    ["Accessibility", "accessibility", (v) => String(v)],
    ["Best practices", "bestPractices", (v) => String(v)],
    ["SEO", "seo", (v) => String(v)],
    ["LCP", "lcp", ms],
    ["FCP", "fcp", ms],
    ["Total blocking time", "tbt", (v) => `${Math.round(v)} ms`],
    ["CLS", "cls", (v) => v.toFixed(3)],
    ["Requests", "requests", (v) => String(v)],
    ["Transferred", "transferKB", (v) => `${v} KB`],
  ];
  const pages = Object.keys(before.pages);
  let md = `# Lighthouse: before and after\n\nMobile profile, simulated slow 4G, median of ${before.runs} runs per page, both sites served by the same static server with gzip (\`scripts/serve.mjs\`). The modern cart and checkout are measured with 3 items in the cart, like the hard-coded legacy pages.\n\n`;
  md += `| Metric | ${pages.map((p) => `${p} before → after`).join(" | ")} |\n| --- | ${pages.map(() => "---").join(" | ")} |\n`;
  for (const [label, key, format] of rows) {
    md += `| ${label} | ${pages.map((p) => `${format(before.pages[p][key])} → **${format(after.pages[p][key])}**`).join(" | ")} |\n`;
  }
  writeFileSync(join(root, "reports", "COMPARISON.md"), md);
  console.log(md);
}

mkdirSync(join(root, "reports"), { recursive: true });
for (const name of which === "all" ? ["legacy", "modern"] : [which]) await measure(name);
if (existsSync(join(root, "reports", "legacy.json")) && existsSync(join(root, "reports", "modern.json"))) compare();
