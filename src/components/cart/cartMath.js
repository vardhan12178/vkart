import { shippingFor } from "../../utils/shipping";

export const TAX_RATE = 0.18;
export const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

const EMPTY_TOTALS = {
  mrp: 0,
  rawSell: 0,
  subtotal: 0,
  promoOff: 0,
  tax: 0,
  total: 0,
  savingsMrpVsSell: 0,
  shipping: 0,
};

// Unit and line prices for a cart line. MRP is derived from the discount percentage when there is one.
export function linePrices(item) {
  const unitSell = round2(item.price);
  const unitMrp = item.discountPercentage
    ? round2(item.price / (1 - item.discountPercentage / 100))
    : unitSell;
  return {
    unitSell,
    lineSell: round2(unitSell * item.quantity),
    lineMrp: round2(unitMrp * item.quantity),
  };
}

// Order totals. Tax is already inside the prices, so the total is subtotal plus shipping.
export function cartTotals(items, promoOff = 0) {
  if (!items?.length) return EMPTY_TOTALS;

  const lines = items.map(linePrices);
  const mrp = round2(lines.reduce((a, l) => a + l.lineMrp, 0));
  const rawSell = round2(lines.reduce((a, l) => a + l.lineSell, 0));
  const subtotal = round2(rawSell - promoOff);
  const shipping = shippingFor(subtotal);
  const tax = round2(subtotal * (TAX_RATE / (1 + TAX_RATE)));
  const total = round2(subtotal + shipping);

  return {
    mrp,
    rawSell,
    subtotal,
    promoOff,
    tax,
    total,
    savingsMrpVsSell: Math.max(0, round2(mrp - rawSell)),
    shipping,
  };
}

// The product lines sent when an order is placed.
export function buildOrderLines(cartItems) {
  return cartItems.map((it) => {
    // For catalog lines _id is the saved cart row, not the product the backend must find
    const mongoId = it.catalog === "v2" ? it.productId || null : it._id || it.productId || null;
    const extId = it.externalId || (it.id != null ? String(it.id) : null);
    const unitPrice = round2(it.price);
    const line = {
      name: it.title,
      image: it.thumbnail || it.images?.[0],
      quantity: it.quantity,
      price: unitPrice,
      lineTotal: round2(unitPrice * it.quantity),
      currency: "INR",
    };
    if (it.selectedVariants) line.selectedVariants = it.selectedVariants;
    if (it.catalog === "v2") {
      line.catalog = "v2";
      line.sku = it.sku;
    }
    if (mongoId) line.productId = String(mongoId);
    if (!mongoId && extId) line.externalId = extId;
    return line;
  });
}
