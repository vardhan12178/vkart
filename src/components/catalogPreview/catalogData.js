// Preview-only loader for the catalog v2 draft data (copied from the backend
// repo's data/catalog-v2). Images are WebP files on S3, stored as keys; an item
// that has not been uploaded yet still carries the brand's own `src` URL.
const modules = import.meta.glob("../../data/catalog-v2/*/*.json", { eager: true });

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

const IMAGE_BASE = import.meta.env.VITE_CATALOG_IMAGE_BASE || "https://vkart-assets-mumbai.s3.ap-south-1.amazonaws.com/catalog-v2";

const withUrls = (im) =>
  im.key
    ? { ...im, src: `${IMAGE_BASE}/${im.key}-md.webp`, thumb: `${IMAGE_BASE}/${im.key}-thumb.webp`, lg: `${IMAGE_BASE}/${im.key}-lg.webp` }
    : { ...im, thumb: im.src, lg: im.src };

export function imagesFor(p, color) {
  return [...(p.media.groups[color] || []), ...(p.media.common || [])].map(withUrls);
}

export function discountPercent(v) {
  return v.mrp > v.price ? Math.round(((v.mrp - v.price) / v.mrp) * 100) : 0;
}

export const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
