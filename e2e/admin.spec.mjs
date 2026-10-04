import { test, expect } from "@playwright/test";
import { API, SHOPPER, findProduct, loginAdmin } from "./helpers.mjs";

/** Place a wallet-paid order as the seeded shopper, straight through the API. */
async function placeOrderViaApi(request) {
  const product = await findProduct(request);
  await request.get(`${API}/api/products?limit=1`); // issues the csrf_token cookie
  const login = await request.post(`${API}/api/login`, { data: SHOPPER });
  expect(login.ok()).toBeTruthy();
  const { token } = await login.json();
  const state = await request.storageState();
  const csrf = state.cookies.find((c) => c.name === "csrf_token")?.value;

  const res = await request.post(`${API}/api/orders`, {
    headers: { Authorization: `Bearer ${token}`, "X-CSRF-Token": csrf },
    data: {
      products: [{ productId: product._id, name: product.title, quantity: 1 }],
      shippingAddress: "12 MG Road, Bengaluru, Karnataka 560001",
      walletUsed: 1000000,
    },
  });
  expect(res.status()).toBe(201);
  return { order: await res.json(), product };
}

test.describe("Admin", () => {
  test("advance a new order through its first stage", async ({ page, request }) => {
    const { order, product } = await placeOrderViaApi(request);

    await loginAdmin(page);
    await page.goto(`/admin/orders/${order._id}`);
    // The items list renders as a table on desktop and as cards on mobile.
    await expect(page.getByText(product.title).filter({ visible: true }).first()).toBeVisible();

    await page.getByRole("button", { name: /mark as confirmed/i }).click();
    await expect(page.getByRole("button", { name: /mark as processing/i })).toBeVisible();

    // The change is persisted, not just optimistic.
    await page.reload();
    await expect(page.getByRole("button", { name: /mark as processing/i })).toBeVisible();
  });

  test("header quick search jumps to a pre-filtered list", async ({ page }) => {
    await loginAdmin(page);
    const search = page.getByRole("combobox", { name: /search the admin panel/i }).filter({ visible: true });
    // The admin layout is lazy-loaded; the "/" shortcut exists once its header is up.
    await expect(search).toBeVisible();
    await page.keyboard.press("/");
    await expect(search).toBeFocused();
    await search.fill("omega");
    await page.getByRole("option", { name: /search products for/i }).click();

    await expect(page).toHaveURL(/\/admin\/products\?q=omega/);
    await expect(page.getByText(/omega seamaster/i).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText(/creed aventus/i)).toHaveCount(0);
  });
});
