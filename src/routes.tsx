import type { RouteObject } from "react-router";
import { Layout } from "./components/layout";
import { CartPage } from "./pages/cart";
import { Checkout } from "./pages/checkout";
import { Confirmation } from "./pages/confirmation";
import { Home } from "./pages/home";
import { NotFound } from "./pages/not-found";
import { ProductPage } from "./pages/product";
import { Shop } from "./pages/shop";

// Shared by the browser (src/main.tsx) and the build-time prerender (src/entry-server.tsx).
// No lazy routes: all pages together are about 15 KB, and prerendered pages
// hydrate without waiting for a chunk.
export const routes: RouteObject[] = [
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "shop", Component: Shop },
      // Not /shop/:group: shop.html and a shop/ folder side by side confuse static hosts.
      { path: "category/:group", Component: Shop },
      { path: "product/:id/:slug?", Component: ProductPage },
      { path: "cart", Component: CartPage },
      { path: "checkout", Component: Checkout },
      { path: "order/:number", Component: Confirmation },
      { path: "*", Component: NotFound },
    ],
  },
];

export const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";
