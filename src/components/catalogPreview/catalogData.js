// Preview-only loader for the catalog v2 draft data (copied from the backend
// repo's data/catalog-v2). Images point at the brands' own servers until the
// import script moves them to S3.
const modules = import.meta.glob("../../data/catalog-v2/mobiles/*.json", { eager: true });

export const products = Object.values(modules)
  .map((m) => m.default || m)
  .sort((a, b) => minPrice(b) - minPrice(a));

export function minPrice(p) {
  return Math.min(...p.variants.map((v) => v.price));
}

export function maxPrice(p) {
  return Math.max(...p.variants.map((v) => v.price));
}

export function defaultVariant(p) {
  return p.variants.find((v) => v.isDefault) || p.variants[0];
}

export function imagesFor(p, color) {
  return [...(p.media.groups[color] || []), ...(p.media.common || [])];
}

export function discountPercent(v) {
  return v.mrp > v.price ? Math.round(((v.mrp - v.price) / v.mrp) * 100) : 0;
}

export const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
