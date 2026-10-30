import type { Totals } from "../lib/cart";
import { formatCents } from "../lib/money";

export function Summary({ totals }: { totals: Totals }) {
  return (
    <div className="bg-wash p-6">
      <h2 id="summary" className="eyebrow">Order summary</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal ({totals.items} {totals.items === 1 ? "item" : "items"})</dt>
          <dd>{formatCents(totals.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd>{totals.shippingCents === 0 ? "Free" : formatCents(totals.shippingCents)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-2 text-base font-medium">
          <dt>Total</dt>
          <dd data-testid="total">{formatCents(totals.totalCents)}</dd>
        </div>
      </dl>
    </div>
  );
}
