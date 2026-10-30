import { describe, expect, it } from "vitest";
import { getProduct, isGroup, isSort, listProducts, products } from "./catalog";

describe("catalog", () => {
  it("has unique ids, and every product has photos and a positive price", () => {
    // Slugs are not unique ("Off White & Red" and "Off White Red" both become
    // off-white-red), which is why product URLs carry the id: /product/91/<slug>.
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
    for (const p of products) {
      expect(p.images.length).toBeGreaterThan(0);
      expect(p.priceCents).toBeGreaterThan(0);
      expect(p.priceCents).toBeLessThanOrEqual(p.listPriceCents);
    }
  });

  it("filters by group and sorts by price", () => {
    const shoes = listProducts({ group: "shoes", sort: "price-asc" });
    expect(shoes.length).toBeGreaterThan(0);
    expect(shoes.every((p) => p.group === "shoes")).toBe(true);
    expect(shoes.map((p) => p.priceCents)).toEqual([...shoes.map((p) => p.priceCents)].sort((a, b) => a - b));
  });

  it("does not reorder the shared catalog when sorting", () => {
    const before = products.map((p) => p.id);
    listProducts({ sort: "price-desc" });
    expect(products.map((p) => p.id)).toEqual(before);
  });

  it("validates URL parameters instead of trusting them", () => {
    expect(isGroup("shoes")).toBe(true);
    expect(isGroup("<script>")).toBe(false);
    expect(isSort("rating")).toBe(true);
    expect(isSort(null)).toBe(false);
  });

  it("returns undefined for unknown products", () => {
    expect(getProduct(-1)).toBeUndefined();
    expect(getProduct(Number("abc"))).toBeUndefined();
  });
});
