import { useState } from "react";
import { Link, useParams } from "react-router";
import { Price } from "../components/price";
import { Quantity } from "../components/quantity";
import { useCart } from "../lib/cart-store";
import { getProduct } from "../lib/catalog";
import { MAX_PER_LINE } from "../lib/cart";
import { NotFound } from "./not-found";

export function ProductPage() {
  const { id } = useParams();
  const product = getProduct(Number(id));
  // Keyed by product, so moving between products resets the gallery and quantity.
  return product ? <ProductDetails key={product.id} productId={product.id} /> : <NotFound />;
}

function ProductDetails({ productId }: { productId: number }) {
  const product = getProduct(productId)!;
  const { lines, add } = useCart();
  const [image, setImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const inCart = lines.find((l) => l.productId === product.id)?.quantity ?? 0;
  const max = Math.max(0, Math.min(product.stock, MAX_PER_LINE) - inCart);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <ol className="flex flex-wrap gap-2">
          <li><Link to="/" className="hover:underline">Home</Link> /</li>
          <li><Link to={`/category/${product.group}`} className="capitalize hover:underline">{product.group}</Link> /</li>
          <li aria-current="page">{product.title}</li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div>
          <div className="aspect-square bg-wash">
            <img src={product.images[image]} alt={product.title} width={1000} height={1000} fetchPriority="high" className="size-full object-contain" />
          </div>
          {product.images.length > 1 && (
            <ul className="mt-3 grid grid-cols-4 gap-3" aria-label="Product photos">
              {product.images.map((src, i) => (
                <li key={src}>
                  <button
                    type="button"
                    onClick={() => setImage(i)}
                    aria-label={`Show photo ${i + 1} of ${product.images.length}`}
                    aria-pressed={i === image}
                    className={`aspect-square w-full bg-wash ${i === image ? "outline-1 outline-ink" : ""}`}
                  >
                    <img src={src} alt="" width={1000} height={1000} loading="lazy" className="size-full object-contain" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          {product.brand && <p className="eyebrow text-muted">{product.brand}</p>}
          <h1 tabIndex={-1} className="mt-2 font-display text-3xl outline-none sm:text-4xl">{product.title}</h1>
          <Price product={product} className="mt-4 text-xl" />
          <p className="mt-2 text-sm text-muted">
            Rated {product.rating.toFixed(1)} of 5 · {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>
          <p className="mt-6 leading-relaxed">{product.description}</p>

          {max > 0 ? (
            <form
              className="mt-8 flex flex-wrap items-center gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                add(product.id, quantity);
                setQuantity(1);
                setAdded(true);
              }}
            >
              <Quantity id="quantity" label="Quantity" value={Math.min(quantity, max)} max={max} onChange={setQuantity} />
              <button type="submit" className="btn">Add to cart</button>
            </form>
          ) : (
            <p className="mt-8 text-sm">{product.stock > 0 ? `You already have the maximum of this item in your cart.` : "This product is out of stock."}</p>
          )}
          <p role="status" className="mt-4 min-h-6 text-sm">
            {added && (
              <>
                Added to your cart. <Link to="/cart" className="underline">View cart</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
