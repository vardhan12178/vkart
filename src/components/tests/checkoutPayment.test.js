import { buildVerifiedPaymentMeta, extractVerificationToken } from "../../utils/checkoutPayment";

describe("checkoutPayment utils", () => {
  test("extractVerificationToken returns token for successful response", () => {
    const token = extractVerificationToken({
      data: { success: true, verificationToken: "verify_tok_123" },
    });
    expect(token).toBe("verify_tok_123");
  });

  test("extractVerificationToken throws for invalid response", () => {
    expect(() =>
      extractVerificationToken({ data: { success: true } })
    ).toThrow(/payment verification failed/i);
  });

  test("buildVerifiedPaymentMeta builds payment payload with verification token", () => {
    const payload = buildVerifiedPaymentMeta(
      {
        razorpay_payment_id: "pay_1",
        razorpay_order_id: "order_1",
        razorpay_signature: "sig_1",
      },
      "verify_tok_456"
    );

    expect(payload).toEqual({
      paymentId: "pay_1",
      paymentOrderId: "order_1",
      signature: "sig_1",
      verificationToken: "verify_tok_456",
    });
  });
});
