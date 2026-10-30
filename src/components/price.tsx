import type { Product } from "../lib/catalog";
import { formatCents } from "../lib/money";

export function Price({ product, className = "" }: { product: Product; className?: string }) {
  const onSale = product.listPriceCents > product.priceCents;
  return (
    <p className={className}>
      <span className={onSale ? "font-medium text-sale" : "font-medium"}>{formatCents(product.priceCents)}</span>
      {onSale && (
        <>
          {" "}
          <s className="text-muted">
            <span className="sr-only">was </span>
            {formatCents(product.listPriceCents)}
          </s>
        </>
      )}
    </p>
  );
}
