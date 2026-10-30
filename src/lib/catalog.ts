import data from "../data/catalog.json";
import { toCents } from "./money";

export type Group = "clothing" | "shoes" | "accessories";

export interface Product {
  id: number;
  slug: string;
  title: string;
  description: string;
  group: Group;
  category: string;
  brand: string | null;
  /** Price after discount, in cents. */
  priceCents: number;
  /** Price before discount, in cents. */
  listPriceCents: number;
  rating: number;
  stock: number;
  thumbnail: string;
  images: string[];
}

export const GROUPS: { id: Group; label: string; blurb: string }[] = [
  { id: "clothing", label: "Clothing", blurb: "Shirts, dresses and tops" },
  { id: "shoes", label: "Shoes", blurb: "Sneakers, heels and boots" },
  { id: "accessories", label: "Accessories", blurb: "Bags, watches and sunglasses" },
];

// DummyJSON gives the list price and a discount percentage; the store shows both.
export const products: Product[] = data.map((p) => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  description: p.description,
  group: p.group as Group,
  category: p.category,
  brand: p.brand,
  listPriceCents: toCents(p.price),
  priceCents: toCents(p.price * (1 - p.discountPercentage / 100)),
  rating: p.rating,
  stock: p.stock,
  thumbnail: p.thumbnail,
  images: p.images,
}));

const byId = new Map(products.map((p) => [p.id, p]));
export const getProduct = (id: number) => byId.get(id);

export type Sort = "featured" | "price-asc" | "price-desc" | "rating";
export const SORTS: { id: Sort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Best rated" },
];

export function listProducts({ group, sort = "featured" }: { group?: Group | null; sort?: Sort }): Product[] {
  const filtered = group ? products.filter((p) => p.group === group) : products;
  const compare: Record<Sort, (a: Product, b: Product) => number> = {
    featured: () => 0,
    "price-asc": (a, b) => a.priceCents - b.priceCents,
    "price-desc": (a, b) => b.priceCents - a.priceCents,
    rating: (a, b) => b.rating - a.rating,
  };
  return [...filtered].sort(compare[sort]);
}

export const isGroup = (value: string | null): value is Group => GROUPS.some((g) => g.id === value);
export const isSort = (value: string | null): value is Sort => SORTS.some((s) => s.id === value);
