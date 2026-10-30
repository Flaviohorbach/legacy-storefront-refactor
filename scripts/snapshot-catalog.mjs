// Takes a snapshot of fashion products from DummyJSON into src/data/catalog.json.
// A committed snapshot keeps the store, the tests and the measurements reproducible.
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const GROUPS = {
  clothing: ["mens-shirts", "womens-dresses", "tops"],
  shoes: ["mens-shoes", "womens-shoes"],
  accessories: ["sunglasses", "womens-bags", "womens-jewellery", "mens-watches"],
};

const products = [];
for (const [group, categories] of Object.entries(GROUPS)) {
  for (const category of categories) {
    const response = await fetch(`https://dummyjson.com/products/category/${category}?limit=0`);
    const { products: items } = await response.json();
    for (const p of items) {
      products.push({
        id: p.id,
        slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        title: p.title,
        description: p.description,
        group,
        category,
        brand: p.brand ?? null,
        price: p.price,
        discountPercentage: p.discountPercentage,
        rating: p.rating,
        stock: p.stock,
        thumbnail: p.thumbnail,
        images: p.images,
      });
    }
  }
}

writeFileSync(join(import.meta.dirname, "..", "src", "data", "catalog.json"), JSON.stringify(products, null, 2) + "\n");
console.log(`${products.length} products`);
