export const buildSecureOrderPayload = ({
  productsPayload,
  shippingAddress,
  promoCode,
  paymentVerificationToken,
  walletUsed,
}) => ({
  products: productsPayload,
  shippingAddress,
  promo: promoCode || undefined,
  paymentVerificationToken: paymentVerificationToken || undefined,
  walletUsed: Number(walletUsed) || 0,
});
