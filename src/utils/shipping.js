// Mirrors FREE_SHIPPING_THRESHOLD and FLAT_SHIPPING_FEE in the backend's order.controller.js,
// which decides what an order is actually charged.
export const FREE_SHIPPING_THRESHOLD = 999;
export const SHIPPING_FEE = 50;

export const shippingFor = (subtotal) => (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE);
