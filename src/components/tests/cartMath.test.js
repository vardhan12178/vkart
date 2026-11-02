import { buildOrderLines, cartTotals, linePrices } from "../cart/cartMath";

const shirt = {
  title: "Linen Shirt",
  price: 1000,
  quantity: 2,
  catalog: "v2",
  productId: "p1",
  sku: "S-M",
};

describe("linePrices", () => {
  test("derives MRP from the discount percentage", () => {
    const { unitSell, lineSell, lineMrp } = linePrices({
      price: 800,
      discountPercentage: 20,
      quantity: 3,
    });
    expect(unitSell).toBe(800);
    expect(lineSell).toBe(2400);
    expect(lineMrp).toBe(3000);
  });

  test("falls back to the selling price when there is no discount", () => {
    expect(linePrices({ price: 500, quantity: 1 })).toEqual({
      unitSell: 500,
      lineSell: 500,
      lineMrp: 500,
    });
  });
});

describe("cartTotals", () => {
  test("an empty bag costs nothing", () => {
    expect(cartTotals([]).total).toBe(0);
  });

  test("tax is included in the price and shipping is added on top", () => {
    const t = cartTotals([shirt]);
    expect(t.rawSell).toBe(2000);
    expect(t.tax).toBeCloseTo(2000 * (0.18 / 1.18), 2);
    expect(t.total).toBe(t.subtotal + t.shipping);
  });

  test("a coupon comes off the subtotal, not the MRP", () => {
    const t = cartTotals([shirt], 300);
    expect(t.subtotal).toBe(1700);
    expect(t.promoOff).toBe(300);
  });

  test("reports what the shopper saves against MRP", () => {
    const t = cartTotals([{ price: 800, discountPercentage: 20, quantity: 1 }]);
    expect(t.savingsMrpVsSell).toBe(200);
  });
});

describe("buildOrderLines", () => {
  test("catalog lines send the product id and SKU", () => {
    const [line] = buildOrderLines([{ ...shirt, _id: "saved-row", selectedVariants: "Size: M" }]);
    expect(line).toMatchObject({
      productId: "p1",
      sku: "S-M",
      catalog: "v2",
      quantity: 2,
      price: 1000,
      lineTotal: 2000,
      selectedVariants: "Size: M",
    });
  });

  test("lines without a database id fall back to the external id", () => {
    const [line] = buildOrderLines([{ title: "Gift card", price: 100, quantity: 1, id: 7 }]);
    expect(line.externalId).toBe("7");
    expect(line.productId).toBeUndefined();
  });
});
