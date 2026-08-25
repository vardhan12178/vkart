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

  test("extractVerificationToken throws when success is false even if a token is present", () => {
    expect(() =>
      extractVerificationToken({ data: { success: false, verificationToken: "tok" } })
    ).toThrow(/payment verification failed/i);
  });

  test("extractVerificationToken throws when the response has no data at all", () => {
    expect(() => extractVerificationToken(undefined)).toThrow(/payment verification failed/i);
    expect(() => extractVerificationToken({})).toThrow(/payment verification failed/i);
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

  test("buildVerifiedPaymentMeta tolerates a missing razorpay response instead of throwing", () => {
    const payload = buildVerifiedPaymentMeta(undefined, "verify_tok_456");
    expect(payload).toEqual({
      paymentId: undefined,
      paymentOrderId: undefined,
      signature: undefined,
      verificationToken: "verify_tok_456",
    });
  });
});
