import { test, expect } from "@playwright/test";
import { dismissCookies, findProduct, loginShopper } from "./helpers.mjs";

test.describe("Checkout (signed-in shopper)", () => {
  test("bag -> coupon -> address -> wallet payment -> order placed", async ({ page, request }) => {
    const product = await findProduct(request);

    await loginShopper(page);
    await page.goto(`/product/${product._id}`);
    await dismissCookies(page);
    await page.getByRole("button", { name: /add to bag/i }).first().click();

    await page.goto("/cart");
    await expect(page.getByRole("heading", { name: /your bag/i })).toBeVisible();
    await expect(page.getByText(product.title).first()).toBeVisible();

    // Public coupon from the seed: 10% off, capped.
    await page.getByPlaceholder(/coupon code/i).fill("WELCOME10");
    await page.getByRole("button", { name: /^apply$/i }).click();
    await expect(page.getByText(/WELCOME10 applied/i)).toBeVisible();

    await page.getByRole("button", { name: /checkout/i }).filter({ visible: true }).first().click();
    await expect(page.locator("#fullName")).toBeVisible();

    const form = {
      "#fullName": "Asha Shopper",
      "#phone": "9876543210",
      "#email": "shopper@vkart.test",
      "#address1": "12 MG Road",
      "#city": "Bengaluru",
      "#state": "Karnataka",
      "#pincode": "560001",
    };
    for (const [selector, value] of Object.entries(form)) {
      await page.locator(selector).fill(value);
    }

    // The seeded shopper has enough wallet balance to cover the whole order.
    await page.getByLabel(/use wallet balance/i).check();
    // Desktop form button or the mobile sticky bar — whichever is showing.
    await page.getByRole("button", { name: /pay now/i }).filter({ visible: true }).first().click();
    await expect(page.getByText(/review your order/i)).toBeVisible();
    await page.getByRole("button", { name: /confirm & pay/i }).click();

    await expect(page).toHaveURL(/\/order-success\//, { timeout: 20_000 });
    const orderId = page.url().split("/order-success/")[1];
    expect(orderId).toBeTruthy();

    await page.goto("/orders");
    await expect(page.getByText(product.title).first()).toBeVisible();
  });
});
