import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { createBrowserRouter, type HydrationState } from "react-router";
import { RouterProvider } from "react-router/dom";
import { basename, routes } from "./routes";
import "./styles.css";

declare global {
  interface Window {
    __staticRouterHydrationData?: HydrationState;
  }
}

const container = document.getElementById("root")!;
const router = createBrowserRouter(routes, { basename, hydrationData: window.__staticRouterHydrationData });
const app = (
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

// Prerendered pages (home, shop, products) arrive with HTML: hydrate it.
// The cart and checkout arrive as an empty shell: render from scratch.
if (container.hasChildNodes()) hydrateRoot(container, app);
else createRoot(container).render(app);
