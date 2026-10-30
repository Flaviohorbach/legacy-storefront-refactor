import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from "react-router";
import { GROUPS, products } from "./lib/catalog";
import { basename, routes } from "./routes";

/** Pages whose content is the same for every visitor, rendered to HTML at build time. */
export const prerenderPaths = [
  "/",
  "/shop",
  ...GROUPS.map((g) => `/category/${g.id}`),
  ...products.map((p) => `/product/${p.id}/${p.slug}`),
];

const { query, dataRoutes } = createStaticHandler(routes, { basename });

export async function render(path: string): Promise<string> {
  const url = new URL((basename === "/" ? "" : basename) + path, "http://localhost");
  const context = await query(new Request(url));
  if (context instanceof Response) throw new Error(`${path} answered with a redirect`);
  const router = createStaticRouter(dataRoutes, context);
  return renderToString(
    <StrictMode>
      <StaticRouterProvider router={router} context={context} />
    </StrictMode>,
  );
}
