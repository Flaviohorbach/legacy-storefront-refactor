# Rules for coding agents in this repository

This file is read by Claude Code at the start of every session (Cursor reads `.cursor/rules`, Gemini CLI reads `GEMINI.md`; the content would be the same). It holds what an agent cannot guess from the code.

## What this project is

A rebuild of the Aviato e-commerce theme (Bootstrap 3 + jQuery) in React 19, TypeScript and Vite, measured with Lighthouse before and after. The legacy code is **not** in the repository: `npm run legacy:fetch` downloads it into `legacy/` at a pinned commit, because its demo photos are not licensed for redistribution. Never commit `legacy/`.

## Commands

- `npm run dev`: dev server (client-rendered; prerendering only happens in `build`)
- `npm run build`: client build, server build of `src/entry-server.tsx`, then `scripts/prerender.mjs`
- `npm test`: Vitest unit tests (`src/**/*.test.ts`)
- `npm run test:e2e`: Playwright against the production build, desktop and mobile
- `npm run lint` and `npm run typecheck`: both must be clean before a commit
- `npm run measure`: Lighthouse on both versions; takes several minutes and overwrites `reports/`

## Conventions

- Money is integer cents (`src/lib/money.ts`). Never add dollar floats.
- Business rules are pure functions in `src/lib/` with unit tests: cart, checkout validation, catalog filtering. Components stay thin.
- The cart is an external store (`useSyncExternalStore`). Do not move it into React state or context: prerendered pages must hydrate with an empty cart and update after.
- Routes are shared by the browser and the prerender (`src/routes.tsx`). A page that depends on the visitor (cart, checkout, order) must not be added to `prerenderPaths`.
- No path may be both a page and a folder (`/shop` and `/shop/x`): static hosts cannot serve both.
- Accessibility is part of done: every control has a label, every page has one `h1`, and Playwright selects by role and accessible name, not by CSS class.
- No jQuery and no new runtime dependency without a reason written in the pull request.

## Before saying something works

Run the tests, and for anything visual open it in a browser. For performance claims, run `npm run measure` and quote the numbers from `reports/COMPARISON.md`; do not estimate them.
