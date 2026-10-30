import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// On GitHub Pages the site lives under /legacy-storefront-refactor/.
export default defineConfig({
  base: process.env.PAGES_BASE ?? "/",
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
