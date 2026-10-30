# AI log: what the agent got wrong, and how it was caught

This project was built with a coding agent (Claude Code). This log records every mistake that reached a file or a measurement, who or what caught it, and the fix. None of these were planted: they happened in the session that built the project.

The pattern is the point. **Most errors were caught by a test, a browser check or a measurement, not by reading the code.** An agent writes plausible code quickly; what makes it trustworthy is the loop that checks it.

## The prompts that drove the work

The work started from short prompts, plus two decisions taken by the human:

1. "Módulo 5": the brief from the learning plan: modernize a legacy storefront with agents, TypeScript, Vitest + Playwright, Core Web Vitals measured before and after, and a log of what the AI got wrong.
2. Decision: **a real open-source legacy theme**, not a legacy store written for the occasion. The agent had recommended writing one in the style of VTEX's legacy CMS; the human chose the more honest option.
3. Decision: **React + Vite + TypeScript** as the target.

The rules the agent follows in this repository are in [`CLAUDE.md`](../CLAUDE.md).

## Mistakes, in the order they happened

### 1. Nearly committing images the project had no right to distribute

The first plan was to copy the theme into the repository as the "before" commit. The theme's README says its demo photos "are only for demonstration purposes". **Caught by:** reading the license section before copying anything. **Fix:** `scripts/fetch-legacy.mjs` downloads the theme at a pinned commit into an ignored folder; the modern version uses DummyJSON photos.

**Lesson:** "MIT" on a repository does not mean every file in it is MIT.

### 2. A checkout that would have bounced the customer back to an empty cart

The first version of "place order" navigated to the confirmation page and then cleared the cart. But clearing the cart re-renders the checkout, and the checkout redirects to `/cart` when the cart is empty: two navigations racing. **Caught by:** reviewing the code before running it. **Fix:** a `placed` flag, set in the same event as the clear, so the redirect never fires after a successful order.

### 3. Opening the shop scrolled to the middle of the page

`<ScrollRestoration />` with its default key restored the home page's scroll position when `/shop` was opened in a fresh load: every first load shares the key `"default"`. **Caught by:** the browser check (`window.scrollY` was 500 on a page just opened). **Fix:** key the saved positions by URL.

### 4. A unit test that asserted something false about the data

The catalog test asserted that product slugs are unique. They are not: "Off White & Red" and "Off White Red" both become `off-white-red`. **Caught by:** the test itself, on its first run. **Fix:** the test, not the code: product URLs already carry the id (`/product/91/off-white-red`), so slugs do not need to be unique. The test now documents that.

**Lesson:** when a test fails, the first question is whether the test is right.

### 5. A screen reader would have announced "Cart , 2 items"

The cart link's accessible name was stitched together from several spans, with a stray space. **Caught by:** a Playwright test selecting the link by its accessible name. **Fix:** one explicit `aria-label`.

This is the argument for selecting elements by role and name in end-to-end tests: the test sees the page the way assistive technology does.

### 6. The first "after" measurement of the checkout measured a different page

Lighthouse opened `/checkout` in a fresh browser profile, with an empty cart, so the app redirected to `/cart`, and the checkout's score was really the empty cart's score. The legacy checkout always shows a form with hard-coded items. **Caught by:** questioning a result that looked too good (LCP 0.9 s on a page with a form and a summary). **Fix:** `measure.mjs` fills the cart before measuring the cart and checkout pages.

### 7. Measuring without compression, which no real host does

The first measurement server sent files uncompressed, to "treat both sides the same". That penalized the side with more JavaScript and matched no real host (GitHub Pages compresses). **Caught by:** looking at transfer sizes next to the bundle report. **Fix:** gzip on both sides. Legacy numbers were measured again under the same conditions, so the comparison stays fair.

### 8. The rewrite was faster, but its LCP still missed the target

After the rewrite, LCP was around 3 s on the home, shop and product pages: better than the legacy 6 to 9 s, but above the 2.5 s "good" threshold. The cause: a client-rendered app shows nothing until its JavaScript downloads and runs, so the browser cannot find the main image early. **Caught by:** the measurement, not by the agent's expectations. **Fix:** static prerendering at build time (`src/entry-server.tsx`, `scripts/prerender.mjs`): pages that are the same for every visitor ship as HTML, and React hydrates them.

**Lesson:** "rewrite it in React" is not automatically faster. A naive single-page app can lose to server-rendered jQuery on LCP.

### 9. A rename that silently broke the measurement script

Renaming the server flag `spa` to `pages` with a text substitution produced an object with two `pages` keys: the flag silently replaced the list of pages to measure. **Caught by:** reading the diff after the substitution. **Fix:** a distinct name, `githubPages`.

**Lesson:** a search-and-replace across files is a refactor without a compiler; read what it did.

### 10. A URL design that static hosts cannot serve

Categories were first at `/shop/shoes`, which makes `shop.html` and a `shop/` folder exist side by side. The local server, like many static hosts, picked the folder and answered 404 for `/shop`. **Caught by:** the Playwright test that fails on any console error. **Fix:** categories moved to `/category/shoes`, and the rule went into `CLAUDE.md`.

### Smaller ones

- Two test-authoring mistakes: a selector that matched both the menu and the filter, and a click on a visually hidden radio button that its label covered. Both were fixed in the test, by selecting what a user would click.

## What the agent was good at

- Reading 3,000 lines of legacy HTML and a 270 KB stylesheet and producing an accurate inventory in minutes: plugins, dead integrations, fonts referenced but never loaded, the `action="post"` form.
- Writing the boring, valuable parts fast: test cases for edge cases (fractional quantities, hostile `localStorage`), the measurement script, workflows.
- Fixing its own mistakes once a check pointed at them.

## What still needed a human

- Choosing a real legacy theme over a convenient fake one.
- Deciding what counts as a fair comparison (same server, compression, same cart contents).
- Refusing a result that looked too good.
