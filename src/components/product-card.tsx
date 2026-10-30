import { Link } from "react-router";
import type { Product } from "../lib/catalog";
import { Price } from "./price";

export function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  return (
    <article className="group relative">
      <div className="aspect-square overflow-hidden bg-wash">
        <img
          src={product.thumbnail}
          alt=""
          width={300}
          height={300}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <h3 className="mt-3 text-sm font-normal">
        {/* The whole card is clickable through this one link: one tab stop, one accessible name. */}
        <Link to={`/product/${product.id}/${product.slug}`} className="after:absolute after:inset-0">
          {product.title}
        </Link>
      </h3>
      <Price product={product} className="mt-1 text-sm" />
    </article>
  );
}
