import { Link } from "react-router";
import { Quantity } from "../components/quantity";
import { useCart } from "../lib/cart-store";
import { FREE_SHIPPING_FROM_CENTS, MAX_PER_LINE } from "../lib/cart";
import { getProduct } from "../lib/catalog";
import { formatCents } from "../lib/money";
import { Summary } from "./summary";

export function CartPage() {
  const { lines, totals, setQuantity, remove } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 pt-16 text-center">
        <h1 tabIndex={-1} className="font-display text-4xl outline-none">Your cart is empty</h1>
        <p className="mt-4 text-muted">Nothing here yet. The good stuff is one click away.</p>
        <Link to="/shop" className="btn mt-8">Go shopping</Link>
      </div>
    );
  }

  const missing = FREE_SHIPPING_FROM_CENTS - totals.subtotalCents;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <h1 tabIndex={-1} className="font-display text-4xl outline-none">Cart</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <ul className="divide-y divide-line border-y border-line">
          {lines.map((line) => {
            const product = getProduct(line.productId)!;
            return (
              <li key={line.productId} className="flex gap-4 py-5">
                <img src={product.thumbnail} alt="" width={300} height={300} className="size-24 shrink-0 bg-wash object-contain" />
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link to={`/product/${product.id}/${product.slug}`} className="hover:underline">{product.title}</Link>
                    <p className="text-sm text-muted">{formatCents(product.priceCents)} each</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Quantity
                      id={`qty-${product.id}`}
                      label={`Quantity of ${product.title}`}
                      value={line.quantity}
                      max={Math.min(product.stock, MAX_PER_LINE)}
                      onChange={(q) => setQuantity(product.id, q)}
                    />
                    <p className="w-20 text-right font-medium">{formatCents(product.priceCents * line.quantity)}</p>
                    <button type="button" onClick={() => remove(product.id)} className="text-xs text-muted underline hover:text-ink">
                      Remove<span className="sr-only"> {product.title}</span>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside aria-labelledby="summary">
          <Summary totals={totals} />
          <p className="mt-3 text-sm text-muted">
            {missing > 0 ? `Add ${formatCents(missing)} more for free shipping.` : "Your order ships for free."}
          </p>
          <Link to="/checkout" className="btn mt-6 w-full">Checkout</Link>
          <Link to="/shop" className="mt-4 block text-center text-sm underline">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
