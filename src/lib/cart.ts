// The cart as pure functions: no DOM, no storage, no React. The legacy cart
// page was static HTML; this is the behavior it only pretended to have.

export interface CartLine {
  productId: number;
  quantity: number;
}

export type CartAction =
  | { type: "add"; productId: number; quantity: number; stock: number }
  | { type: "setQuantity"; productId: number; quantity: number; stock: number }
  | { type: "remove"; productId: number }
  | { type: "clear" };

export const MAX_PER_LINE = 10;
export const FREE_SHIPPING_FROM_CENTS = 100_00;
export const SHIPPING_CENTS = 9_90;

const clamp = (quantity: number, stock: number) => Math.max(0, Math.min(Math.floor(quantity), stock, MAX_PER_LINE));

export function cartReducer(lines: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case "add": {
      const current = lines.find((l) => l.productId === action.productId)?.quantity ?? 0;
      return cartReducer(lines, { type: "setQuantity", productId: action.productId, quantity: current + action.quantity, stock: action.stock });
    }
    case "setQuantity": {
      const quantity = clamp(action.quantity, action.stock);
      if (quantity === 0) return lines.filter((l) => l.productId !== action.productId);
      const exists = lines.some((l) => l.productId === action.productId);
      return exists
        ? lines.map((l) => (l.productId === action.productId ? { ...l, quantity } : l))
        : [...lines, { productId: action.productId, quantity }];
    }
    case "remove":
      return lines.filter((l) => l.productId !== action.productId);
    case "clear":
      return [];
  }
}

export interface Totals {
  items: number;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
}

export function cartTotals(lines: CartLine[], priceOf: (productId: number) => number | undefined): Totals {
  let items = 0;
  let subtotalCents = 0;
  for (const line of lines) {
    const price = priceOf(line.productId);
    if (price === undefined) continue; // a product that left the catalog does not get charged
    items += line.quantity;
    subtotalCents += price * line.quantity;
  }
  const shippingCents = items === 0 || subtotalCents >= FREE_SHIPPING_FROM_CENTS ? 0 : SHIPPING_CENTS;
  return { items, subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents };
}

/** Reads a saved cart defensively: storage is user-controlled and may hold anything. */
export function parseSavedCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter(
      (l): l is CartLine =>
        typeof l === "object" && l !== null && Number.isInteger(l.productId) && Number.isInteger(l.quantity) && l.quantity > 0 && l.quantity <= MAX_PER_LINE,
    );
  } catch {
    return [];
  }
}
