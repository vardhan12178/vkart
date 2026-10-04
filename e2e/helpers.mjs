import { expect } from "@playwright/test";

export const SHOPPER = { username: "shopper", password: "Shopper@123" };
export const ADMIN = { email: "admin@vkart.test", password: "Admin@12345" };
export const API = process.env.E2E_API_URL || "http://localhost:5000";

/** Dismiss the cookie banner if it's showing (it overlaps bottom-of-page CTAs). */
export async function dismissCookies(page) {
  await page.getByRole("button", { name: /essential only/i }).click({ timeout: 2500 }).catch(() => {});
}

export async function loginShopper(page) {
  await page.goto("/login");
  await dismissCookies(page);
  await page.getByPlaceholder("Enter your email").fill(SHOPPER.username);
  await page.locator('input[type="password"]').first().fill(SHOPPER.password);
  await page.locator('button[type="submit"]').first().click();
  await expect(page).not.toHaveURL(/\/login/);
}

export async function loginAdmin(page) {
  await page.goto("/admin/login");
  await page.getByPlaceholder("admin@vkart.com").fill(ADMIN.email);
  await page.locator('input[type="password"]').first().fill(ADMIN.password);
  await page.locator('button[type="submit"]').first().click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}

/**
 * A seeded product (by API) for deterministic navigation: the best-stocked one,
 * so the orders placed across a run never sell it out, or an out-of-stock one.
 */
export async function findProduct(request, { inStock = true } = {}) {
  const res = await request.get(`${API}/api/products?limit=50`);
  expect(res.ok(), `GET /api/products -> ${res.status()}`).toBeTruthy();
  const { products } = await res.json();
  if (!inStock) return products.find((p) => p.stock === 0);
  return [...products].sort((a, b) => b.stock - a.stock || a.title.localeCompare(b.title))[0];
}
