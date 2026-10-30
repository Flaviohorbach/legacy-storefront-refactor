# Legacy storefront refactor: jQuery to React, measured

A real open-source e-commerce theme from the Bootstrap 3 + jQuery era, [Aviato by Themefisher](https://github.com/themefisher/aviato-bootstrap), rebuilt with React 19, TypeScript and Vite, with a coding agent, and **measured with Lighthouse before and after**.

**Live demo:** _coming soon_

The rebuild is not a reskin. The legacy cart and checkout were static HTML; this one has a working cart (persisted, synced across tabs), checkout validation, real filtering and sorting, accessible markup, and pages prerendered to static HTML.

## Before and after

Lighthouse, mobile profile (simulated slow 4G), median of 3 runs per page. Both versions served by the same static server with gzip; the modern cart and checkout measured with items in the cart, like the hard-coded legacy pages. Full table and method: [`reports/COMPARISON.md`](reports/COMPARISON.md).

| | Home | Shop | Product | Cart | Checkout |
| --- | --- | --- | --- | --- | --- |
| **Performance** | 70 → **97** | 83 → **97** | 87 → **96** | 88 → **96** | 93 → **100** |
| **Accessibility** | 87 → **100** | 82 → **98** | 77 → **100** | 84 → **100** | 73 → **100** |
| **LCP** | 6.9 s → **2.6 s** | 4.5 s → **2.5 s** | 3.9 s → **2.7 s** | 3.7 s → **2.7 s** | 3.0 s → **0.8 s** |
| **First paint (FCP)** | 1.9 s → **0.8 s** | 1.9 s → **0.8 s** | 1.9 s → **0.8 s** | 1.9 s → **0.8 s** | 1.9 s → **0.8 s** |
| **Blocking time** | 164 ms → **0 ms** | 49 ms → **12 ms** | 7 ms → **0 ms** | 24 ms → **0 ms** | 8 ms → **4 ms** |
| **Transferred** | 1057 KB → **348 KB** | 547 KB → **446 KB** | 838 KB → **470 KB** | 384 KB → **175 KB** | 383 KB → **160 KB** |
| **Requests** | 47 → **17** | 38 → **33** | 42 → **10** | 29 → **8** | 29 → **7** |

**What is not solved:** LCP sits right at the 2.5 s "good" threshold on four pages, slightly above it on three. What remains is the product photo itself: it comes from a third-party CDN that offers only 300 px and 1000 px versions, so phones download the 1000 px one. An image CDN with resizing (or self-hosted, resized photos) is the next step. Layout shift (CLS) went from 0.000 to at most 0.007: worse on paper, still far below the 0.1 limit.

## What was wrong with the legacy store

An inventory before touching anything:

- **10 jQuery plugins on every page** (slider, lightbox, countdown, touchspin, Instagram feed...), whether the page used them or not.
- **Google Maps loaded on the home page**, which has no map: 103 KB and an API key in the HTML.
- **An Instagram access token in the HTML**, for an API that no longer exists.
- **A countdown hard-coded to 2022.**
- **Fonts referenced but never loaded** (Playfair Display, Roboto Condensed): the design rendered in fallback fonts.
- **A 190 KB icon font in TTF**: the heaviest file on the home page.
- **A search form with `action="post"`**: it submits to the URL `/post`.
- **The cart and checkout were hard-coded HTML.** There was no cart.

## How it was rebuilt

| Legacy | Modern |
| --- | --- |
| jQuery plugins on every page | React 19 components: one 110 KB gzipped bundle for the whole store, catalog included |
| Bootstrap 3 + 270 KB of CSS | Tailwind CSS 4, ~5 KB gzipped |
| Hard-coded cart page | Cart as pure functions (`src/lib/cart.ts`) + an external store, prices in integer cents |
| Form with no validation | Validation with messages that say how to fix, focus moved to the first error |
| Static grid of nine products | Categories as pages, sort order in the URL |
| Every page is HTML | Pages that are the same for everyone are **prerendered** at build time; cart and checkout render in the browser |
| Carousel of 190 KB photos as the LCP | One hero image in the HTML, fetched with high priority |
| Fonts from Google Fonts via `@import` | Self-hosted fonts, Latin subset only |

### The lesson in the middle

The first React version was faster than the legacy store, but its LCP was still around 3 s: a client-rendered app shows nothing until its JavaScript runs, so the browser cannot discover the main image early. **"Rewrite it in React" is not automatically faster.** Static prerendering ([`src/entry-server.tsx`](src/entry-server.tsx), [`scripts/prerender.mjs`](scripts/prerender.mjs)) fixed it: home, shop, categories and all 44 product pages ship as HTML, and React hydrates them.

The cart lives in `localStorage`, which does not exist at build time. It is an external store read with `useSyncExternalStore`, whose server snapshot is an empty cart: React hydrates exactly what the HTML shows, then swaps in the saved cart. A Playwright test checks there are no hydration errors.

## Built with an agent, reviewed by a human

[`docs/AI-LOG.md`](docs/AI-LOG.md) lists every mistake the agent made that reached a file or a measurement, and what caught it. Ten of them, including:

- a checkout that would have redirected the customer to an empty cart after a successful order;
- a "too good" measurement of the checkout that was really measuring the empty cart page;
- a URL design (`/shop` and `/shop/shoes`) that static hosts cannot serve.

Seven of the ten were caught by a test, the browser or a measurement, not by reading the code. The rules the agent follows in this repository are in [`CLAUDE.md`](CLAUDE.md).

## Running it

Requires Node.js 22+.

```bash
npm install
npm run dev              # http://localhost:5173 (client-rendered in dev)
npm test                 # unit tests: cart, checkout validation, catalog
npx playwright install chromium
npm run test:e2e         # builds, prerenders, and tests the shopping journey on desktop and mobile
```

Reproducing the measurement:

```bash
npm run legacy:fetch     # downloads the legacy theme at a pinned commit into legacy/
npm run build
npm run measure          # Lighthouse, 3 runs per page per version; writes reports/
```

The legacy theme is not in this repository: its demo photos are not licensed for redistribution, so it is downloaded only for measurement. The modern store uses product data and photos from [DummyJSON](https://dummyjson.com), snapshotted in `src/data/catalog.json`.

---

Project 5 of my Applied AI Engineering learning path (front-end focus). Concepts explained in Portuguese in [`docs/CONCEITOS.md`](docs/CONCEITOS.md).
