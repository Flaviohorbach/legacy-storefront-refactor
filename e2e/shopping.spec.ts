import { expect, test } from "@playwright/test";

test("a customer finds a product, buys two and gets an order number", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Shop now" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Shop" })).toBeVisible();

  await page.getByRole("navigation", { name: "Categories" }).getByRole("link", { name: "Shoes" }).click();
  await expect(page).toHaveURL(/\/category\/shoes$/);
  await expect(page.getByRole("heading", { level: 1, name: "Shoes" })).toBeVisible();
  await page.getByLabel("Sort by").selectOption("price-asc");
  await expect(page).toHaveURL(/sort=price-asc/);

  await page.getByRole("link", { name: "Calvin Klein Heel Shoes" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Calvin Klein Heel Shoes" })).toBeFocused();

  await page.getByRole("button", { name: "Increase quantity" }).click();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("status")).toContainText("Added to your cart");
  await expect(page.getByRole("link", { name: /Cart, 2 items/ })).toBeVisible();

  await page.getByRole("link", { name: "View cart" }).click();
  await expect(page.getByTestId("total")).toHaveText("$154.88");
  await page.getByRole("link", { name: "Checkout" }).click();

  // Submitting empty shows every error and moves focus to the first field to fix.
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page.getByLabel("Full name")).toBeFocused();
  await expect(page.getByLabel("Full name")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a 5-digit ZIP code, like 10001.")).toBeVisible();

  await page.getByLabel("Full name").fill("Ana Souza");
  await page.getByLabel("Email").fill("ana@example.com");
  await page.getByLabel("Address").fill("5th Avenue, 100");
  await page.getByLabel("City").fill("New York");
  await page.getByLabel("ZIP code").fill("10001");
  await page.getByRole("button", { name: "Place order" }).click();

  await expect(page).toHaveURL(/\/order\/AV-[A-Z0-9]{6}$/);
  await expect(page.getByRole("heading", { name: "Thank you!" })).toBeVisible();
  await expect(page.getByText("$154.88")).toBeVisible();
  await expect(page.getByRole("link", { name: /Cart, 0 items/ })).toBeVisible();
});

test("the cart survives a reload and quantities can be changed and removed", async ({ page }) => {
  await page.goto("/product/186/calvin-klein-heel-shoes");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.goto("/cart");
  await page.reload();

  const line = page.getByRole("listitem").filter({ hasText: "Calvin Klein Heel Shoes" });
  await expect(line).toBeVisible();
  await line.getByRole("button", { name: /Increase quantity/ }).click();
  await expect(page.getByTestId("total")).toHaveText("$154.88");

  await line.getByRole("button", { name: /Remove/ }).click();
  await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
});

test("checkout with an empty cart goes back to the cart", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page).toHaveURL(/\/cart$/);
});

test("deep links and unknown pages work on a static host", async ({ page }) => {
  await page.goto("/category/accessories?sort=price-desc");
  await expect(page.getByRole("heading", { level: 1, name: "Accessories" })).toBeVisible();
  await expect(page.getByLabel("Sort by")).toHaveValue("price-desc");
  // The prerendered HTML is in "featured" order; after hydration the URL's sort applies.
  const prices = await page.locator("article p span:first-child").allTextContents();
  const values = prices.map((p) => Number(p.replace(/[$,]/g, "")));
  expect(values).toEqual([...values].sort((a, b) => b - a));

  await page.goto("/category/not-a-category");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();

  await page.goto("/product/999999");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await page.goto("/nothing-here");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("prerendered pages have their content in the HTML, before any JavaScript", async ({ request }) => {
  const product = await (await request.get("/product/186/calvin-klein-heel-shoes")).text();
  expect(product).toContain("Calvin Klein Heel Shoes</h1>");
  const shop = await (await request.get("/category/shoes")).text();
  expect(shop).toContain("Shoes</h1>");
  const cart = await request.get("/cart");
  expect(cart.status()).toBe(200);
  expect(await cart.text()).toContain('<div id="root"></div>'); // user-specific: rendered in the browser
});

test("a cart saved before loading a prerendered page shows up after hydration", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("aviato-cart", JSON.stringify([{ productId: 186, quantity: 3 }])));
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("/product/186/calvin-klein-heel-shoes");
  await expect(page.getByRole("link", { name: "Cart, 3 items" })).toBeVisible();
  expect(errors, "hydration errors").toEqual([]);
});

test("no horizontal scroll and no console errors on the main pages", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  for (const path of ["/", "/shop", "/product/186/calvin-klein-heel-shoes", "/cart"]) {
    await page.goto(path);
    await expect(page.locator("main h1")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow, `horizontal overflow on ${path}`).toBe(false);
  }
  expect(errors).toEqual([]);
});
