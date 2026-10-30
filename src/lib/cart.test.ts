import { describe, expect, it } from "vitest";
import { cartReducer, cartTotals, FREE_SHIPPING_FROM_CENTS, MAX_PER_LINE, parseSavedCart, SHIPPING_CENTS, type CartLine } from "./cart";
import { formatCents, toCents } from "./money";

const prices: Record<number, number> = { 1: 29_99, 2: 4_50 };
const priceOf = (id: number) => prices[id];

describe("cartReducer", () => {
  it("adds a new line and merges repeated adds", () => {
    let lines = cartReducer([], { type: "add", productId: 1, quantity: 1, stock: 50 });
    lines = cartReducer(lines, { type: "add", productId: 1, quantity: 2, stock: 50 });
    expect(lines).toEqual([{ productId: 1, quantity: 3 }]);
  });

  it("never goes above the stock or the per-line limit", () => {
    expect(cartReducer([], { type: "add", productId: 1, quantity: 5, stock: 3 })).toEqual([{ productId: 1, quantity: 3 }]);
    expect(cartReducer([], { type: "add", productId: 1, quantity: 99, stock: 500 })).toEqual([{ productId: 1, quantity: MAX_PER_LINE }]);
  });

  it("removes the line when the quantity reaches zero", () => {
    const lines: CartLine[] = [{ productId: 1, quantity: 2 }, { productId: 2, quantity: 1 }];
    expect(cartReducer(lines, { type: "setQuantity", productId: 1, quantity: 0, stock: 50 })).toEqual([{ productId: 2, quantity: 1 }]);
  });

  it("ignores fractional and negative quantities", () => {
    expect(cartReducer([], { type: "setQuantity", productId: 1, quantity: 2.7, stock: 50 })).toEqual([{ productId: 1, quantity: 2 }]);
    expect(cartReducer([{ productId: 1, quantity: 2 }], { type: "setQuantity", productId: 1, quantity: -4, stock: 50 })).toEqual([]);
  });

  it("does not mutate the previous state", () => {
    const lines: CartLine[] = [{ productId: 1, quantity: 1 }];
    cartReducer(lines, { type: "setQuantity", productId: 1, quantity: 4, stock: 50 });
    expect(lines).toEqual([{ productId: 1, quantity: 1 }]);
  });
});

describe("cartTotals", () => {
  it("sums in cents, without floating point drift", () => {
    const totals = cartTotals([{ productId: 1, quantity: 3 }], priceOf);
    expect(totals.subtotalCents).toBe(89_97);
    expect(formatCents(totals.totalCents)).toBe("$99.87"); // 89.97 + 9.90 shipping
  });

  it("charges shipping below the threshold and not from it", () => {
    expect(cartTotals([{ productId: 2, quantity: 1 }], priceOf).shippingCents).toBe(SHIPPING_CENTS);
    const atThreshold = cartTotals([{ productId: 1, quantity: 1 }], () => FREE_SHIPPING_FROM_CENTS);
    expect(atThreshold.shippingCents).toBe(0);
  });

  it("charges nothing for an empty cart, and skips products no longer in the catalog", () => {
    expect(cartTotals([], priceOf)).toEqual({ items: 0, subtotalCents: 0, shippingCents: 0, totalCents: 0 });
    expect(cartTotals([{ productId: 999, quantity: 2 }], priceOf).items).toBe(0);
  });
});

describe("parseSavedCart", () => {
  it("keeps valid lines and drops anything else", () => {
    const raw = JSON.stringify([
      { productId: 1, quantity: 2 },
      { productId: "2", quantity: 1 },
      { productId: 3, quantity: 0 },
      { productId: 4, quantity: 1000 },
      null,
    ]);
    expect(parseSavedCart(raw)).toEqual([{ productId: 1, quantity: 2 }]);
  });

  it("survives broken or hostile storage", () => {
    expect(parseSavedCart(null)).toEqual([]);
    expect(parseSavedCart("{not json")).toEqual([]);
    expect(parseSavedCart('{"productId":1}')).toEqual([]);
  });
});

describe("money", () => {
  it("rounds dollars to cents", () => {
    expect(toCents(19.99)).toBe(1999);
    expect(toCents(0.1 + 0.2)).toBe(30);
  });
});
