import { test, expect } from "@playwright/test";
import { dismissCookies, findProduct } from "./helpers.mjs";

test.describe("Storefront (guest)", () => {
  test("browse from the home page to a product and add it to the bag", async ({ page, request }) => {
    const product = await findProduct(request);

    await page.goto("/");
    await dismissCookies(page);
    await expect(page.getByRole("heading", { level: 1 }).first()).toContainText(/better things/i);

    await page.getByRole("link", { name: /shop the collection/i }).first().click();
    await expect(page).toHaveURL(/\/products/);
    await expect(page.getByText(/24 items/i)).toBeVisible();

    await page.goto(`/product/${product._id}`);
    await expect(page.getByText(product.title).first()).toBeVisible();
    await page.getByRole("button", { name: /add to bag/i }).first().click();

    // The header bag badge counts it; the bag itself asks a guest to sign in.
    await expect(page.locator('a[href="/cart"]').filter({ hasText: "1" }).first()).toBeVisible();
    await page.goto("/cart");
    await expect(page.getByRole("link", { name: /sign in to your bag/i })).toBeVisible();
  });

  test("an out-of-stock product cannot be added", async ({ page, request }) => {
    const product = await findProduct(request, { inStock: false });
    await page.goto(`/product/${product._id}`);
    await dismissCookies(page);
    const addButton = page.getByRole("button", { name: /out of stock/i }).first();
    await expect(addButton).toBeVisible();
    await expect(addButton).toBeDisabled();
    await expect(page.getByRole("button", { name: /buy now/i })).toHaveCount(0);
  });

  test("searching the catalog filters the product list", async ({ page }) => {
    await page.goto("/products?q=omega");
    await dismissCookies(page);
    await expect(page.getByText(/omega seamaster/i).first()).toBeVisible();
    await expect(page.getByText(/creed aventus/i)).toHaveCount(0);
  });
});
