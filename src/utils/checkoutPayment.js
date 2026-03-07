export const extractVerificationToken = (verifyResponse) => {
  const token = verifyResponse?.data?.verificationToken;
  if (!verifyResponse?.data?.success || !token) {
    throw new Error("Payment verification failed");
  }
  return token;
};

export const buildVerifiedPaymentMeta = (response, verificationToken) => ({
  paymentId: response?.razorpay_payment_id,
  paymentOrderId: response?.razorpay_order_id,
  signature: response?.razorpay_signature,
  verificationToken,
});
