import { useEffect, useRef } from "react";
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from "react-router";
import { useCart } from "../lib/cart-store";
import { GROUPS } from "../lib/catalog";

function CartLink() {
  const { totals } = useCart();
  return (
    // One explicit accessible name ("Cart, 2 items") instead of one stitched from spans.
    <Link to="/cart" aria-label={`Cart, ${totals.items} ${totals.items === 1 ? "item" : "items"}`} className="eyebrow flex items-center gap-2 hover:underline">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6.2" />
        <circle cx="9" cy="20" r="1.2" />
        <circle cx="17" cy="20" r="1.2" />
      </svg>
      <span>Cart</span>
      <span className="grid min-w-5 place-items-center rounded-full bg-ink px-1.5 text-[10px] leading-5 tracking-normal text-paper">
        {totals.items}
      </span>
    </Link>
  );
}

const navClass = ({ isActive }: { isActive: boolean }) => `eyebrow py-2 hover:underline ${isActive ? "underline underline-offset-8" : ""}`;

/** Moves focus to the page heading after client-side navigation, so screen readers announce the new page. */
function useFocusOnNavigate() {
  const { pathname } = useLocation();
  const previous = useRef(pathname);
  useEffect(() => {
    if (previous.current === pathname) return; // first load: leave focus where the browser put it
    previous.current = pathname;
    document.querySelector<HTMLElement>("main h1")?.focus({ preventScroll: true });
  }, [pathname]);
}

export function Layout() {
  useFocusOnNavigate();
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-paper focus:p-3">
        Skip to content
      </a>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <p className="hidden text-xs text-muted sm:block">Free shipping from $100</p>
          <Link to="/" className="font-display text-3xl tracking-wide sm:absolute sm:left-1/2 sm:-translate-x-1/2">
            AVIATO
          </Link>
          <CartLink />
        </div>
        <nav aria-label="Main" className="border-t border-line">
          <ul className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-6 gap-y-1 px-4 py-2 sm:gap-x-10">
            <li><NavLink to="/" end className={navClass}>Home</NavLink></li>
            <li><NavLink to="/shop" end className={navClass}>Shop</NavLink></li>
            {GROUPS.map((g) => (
              <li key={g.id}>
                <NavLink to={`/category/${g.id}`} className={navClass}>{g.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-line bg-wash">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-10 text-center text-xs text-muted">
          <p className="font-display text-xl text-ink">AVIATO</p>
          <p>
            Modernized from the{" "}
            <a className="underline" href="https://github.com/themefisher/aviato-bootstrap">Aviato theme by Themefisher</a> (MIT).
            Product data and photos from <a className="underline" href="https://dummyjson.com">DummyJSON</a>. A demo store: nothing is sold.
          </p>
        </div>
      </footer>
      {/* Keyed by URL: with the default key every fresh page load shares the key "default",
          so opening /shop in a new load restored the scroll position of the home page. */}
      <ScrollRestoration getKey={(location) => location.pathname + location.search} />
    </div>
  );
}
