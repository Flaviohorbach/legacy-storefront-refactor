import { useSyncExternalStore } from "react";
import { cartReducer, cartTotals, parseSavedCart, type CartAction, type CartLine, type Totals } from "./cart";
import { getProduct } from "./catalog";

// The cart lives outside React, in a tiny external store:
//  - pages prerendered at build time render with an empty cart (getServerSnapshot),
//    and React swaps in the saved cart right after hydration, without a mismatch;
//  - the cart stays in sync across tabs through the "storage" event.

const STORAGE_KEY = "aviato-cart";
const EMPTY: CartLine[] = [];
const isBrowser = typeof window !== "undefined";

function loadCart(): CartLine[] {
  if (!isBrowser) return EMPTY;
  try {
    // Lines whose product left the catalog are dropped on load.
    return parseSavedCart(localStorage.getItem(STORAGE_KEY)).filter((l) => getProduct(l.productId));
  } catch {
    return EMPTY; // storage blocked (private mode, disabled cookies): the cart still works, it just does not persist
  }
}

let lines = loadCart();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

function dispatch(action: CartAction) {
  lines = cartReducer(lines, action);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // see loadCart
  }
  notify();
}

if (isBrowser) {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    lines = loadCart();
    notify();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const stockOf = (productId: number) => getProduct(productId)?.stock ?? 0;

export const cartActions = {
  add: (productId: number, quantity = 1) => dispatch({ type: "add", productId, quantity, stock: stockOf(productId) }),
  setQuantity: (productId: number, quantity: number) => dispatch({ type: "setQuantity", productId, quantity, stock: stockOf(productId) }),
  remove: (productId: number) => dispatch({ type: "remove", productId }),
  clear: () => dispatch({ type: "clear" }),
};

export function useCart(): { lines: CartLine[]; totals: Totals } & typeof cartActions {
  const current = useSyncExternalStore(subscribe, () => lines, () => EMPTY);
  return { lines: current, totals: cartTotals(current, (id) => getProduct(id)?.priceCents), ...cartActions };
}

const noop = () => () => {};
/** False while hydrating prerendered HTML, true afterwards. */
export const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);
