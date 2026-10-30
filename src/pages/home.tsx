import { Link } from "react-router";
import { ProductCard } from "../components/product-card";
import { GROUPS, getProduct, products } from "../lib/catalog";

// The legacy home opened with a three-slide jQuery carousel of 190 KB photos;
// the first slide was the page's LCP and only rendered after slick.js ran.
// Here the hero is one image, in the HTML from the first render, fetched with high priority.
const HERO = getProduct(177)!;
const CATEGORY_COVERS = { clothing: 179, shoes: 90, accessories: 174 } as const;
const TRENDING = products.filter((p) => p.rating >= 4.5).slice(0, 8);

export function Home() {
  return (
    <>
      <section className="bg-wash">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:py-16">
          <div className="order-2 text-center md:order-1 md:text-left">
            <p className="eyebrow text-muted">New season</p>
            <h1 tabIndex={-1} className="mt-4 font-display text-4xl leading-tight outline-none sm:text-5xl">
              The beauty of nature is hidden in details.
            </h1>
            <p className="mt-4 text-muted">Clothing, shoes and accessories picked for the way you dress every day.</p>
            <Link to="/shop" className="btn mt-8">Shop now</Link>
          </div>
          <img
            src={HERO.images[0]}
            srcSet={`${HERO.thumbnail} 300w, ${HERO.images[0]} 1000w`}
            sizes="(min-width: 768px) 512px, 80vw"
            alt={HERO.title}
            width={1000}
            height={1000}
            fetchPriority="high"
            className="order-1 mx-auto aspect-square w-4/5 object-contain md:order-2 md:w-full"
          />
        </div>
      </section>

      <section aria-labelledby="categories" className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <h2 id="categories" className="text-center font-display text-3xl">Shop by category</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {GROUPS.map((group) => {
            const cover = getProduct(CATEGORY_COVERS[group.id])!;
            return (
              <li key={group.id} className="group relative bg-wash p-6">
                <img src={cover.thumbnail} alt="" width={300} height={300} loading="lazy" className="mx-auto aspect-square w-2/3 object-contain transition-transform group-hover:scale-105" />
                <h3 className="mt-4 text-lg font-normal">
                  <Link to={`/category/${group.id}`} className="after:absolute after:inset-0">{group.label}</Link>
                </h3>
                <p className="text-sm text-muted">{group.blurb}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="trending" className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <h2 id="trending" className="text-center font-display text-3xl">Trendy products</h2>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {TRENDING.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
