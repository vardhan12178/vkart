import { buildSecureOrderPayload } from "../../utils/orderPayload";

describe("orderPayload utils", () => {
  test("buildSecureOrderPayload keeps only secure server-validated fields", () => {
    const payload = buildSecureOrderPayload({
      productsPayload: [{ productId: "abc", name: "Item", quantity: 1, price: 999 }],
      shippingAddress: "123 Test Street",
      promoCode: "SAVE10",
      paymentVerificationToken: "verify_tok_789",
      walletUsed: "100",
      paymentStatus: "PAID",
      paymentMethod: "CARD",
      totalPrice: 1,
    });

    expect(payload).toEqual({
      products: [{ productId: "abc", name: "Item", quantity: 1, price: 999 }],
      shippingAddress: "123 Test Street",
      promo: "SAVE10",
      paymentVerificationToken: "verify_tok_789",
      walletUsed: 100,
    });
    expect(payload.paymentStatus).toBeUndefined();
    expect(payload.paymentMethod).toBeUndefined();
    expect(payload.totalPrice).toBeUndefined();
  });

  test("buildSecureOrderPayload omits optional promo/token and normalizes wallet", () => {
    const payload = buildSecureOrderPayload({
      productsPayload: [],
      shippingAddress: "No Promo Street",
      walletUsed: undefined,
    });

    expect(payload).toEqual({
      products: [],
      shippingAddress: "No Promo Street",
      promo: undefined,
      paymentVerificationToken: undefined,
      walletUsed: 0,
    });
  });
});
