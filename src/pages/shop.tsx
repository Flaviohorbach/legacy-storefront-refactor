import { NavLink, useParams, useSearchParams } from "react-router";
import { ProductCard } from "../components/product-card";
import { useHydrated } from "../lib/cart-store";
import { GROUPS, SORTS, isGroup, isSort, listProducts } from "../lib/catalog";
import { NotFound } from "./not-found";

// Each category is its own page (/category/shoes), prerendered at build time.
// The sort order is a URL parameter (?sort=price-asc): shareable and bookmarkable.
// The legacy shop page was a static grid of nine items.
export function Shop() {
  const { group: groupParam } = useParams();
  const [params, setParams] = useSearchParams();
  // Prerendered HTML is sorted "featured"; the URL's sort applies once hydrated,
  // so the first client render matches the HTML it takes over.
  const hydrated = useHydrated();
  const sortParam = hydrated ? params.get("sort") : null;

  if (groupParam !== undefined && !isGroup(groupParam)) return <NotFound />;
  const group = groupParam ?? null;
  const sort = isSort(sortParam) ? sortParam : "featured";
  const items = listProducts({ group, sort });
  const title = group ? GROUPS.find((g) => g.id === group)!.label : "Shop";

  const chip = ({ isActive }: { isActive: boolean }) =>
    `border px-3 py-1.5 text-xs tracking-wider uppercase ${isActive ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"}`;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <h1 tabIndex={-1} className="text-center font-display text-4xl outline-none">{title}</h1>

      <div className="mt-8 flex flex-col gap-4 border-y border-line py-4 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Categories">
          <ul className="flex flex-wrap gap-2">
            <li><NavLink to="/shop" end className={chip}>All</NavLink></li>
            {GROUPS.map((g) => (
              <li key={g.id}><NavLink to={`/category/${g.id}`} className={chip}>{g.label}</NavLink></li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <label htmlFor="sort" className="text-muted">Sort by</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              if (e.currentTarget.value === "featured") next.delete("sort");
              else next.set("sort", e.currentTarget.value);
              setParams(next, { replace: true, preventScrollReset: true });
            }}
            className="border border-line bg-paper px-3 py-2"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted" aria-live="polite">{items.length} products</p>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
        {items.map((p, i) => (
          <ProductCard key={p.id} product={p} eager={i < 4} />
        ))}
      </div>
    </div>
  );
}
