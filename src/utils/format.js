// Whole-rupee amount in Indian digit grouping, e.g. 123456 -> "₹1,23,456".
const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatINR = (n) => inr.format(Math.round(Number(n) || 0));
