import { CATEGORIES, catOf } from "./catalogData";

// Fallback data source: the catalog JSON copied from the backend repo, answered
// in the same shapes as /api/v2 (backend services/catalogV2.service.js). Loaded as a
// separate chunk, only when the API is unavailable.

const modules = import.meta.glob("../../data/catalog/*/*.json", { eager: true });
const raw = Object.values(modules).map((m) => m.default || m);

const IMAGE_BASE = import.meta.env.VITE_CATALOG_IMAGE_BASE || "https://vkart-assets-mumbai.s3.ap-south-1.amazonaws.com/catalog-v2";
const PAGE_SIZE = 24;

const resolveImage = (im) => {
  if (!im) return null;
  if (im.key) {
    const base = `${IMAGE_BASE}/${im.key}`;
    return { alt: im.alt, thumb: `${base}-thumb.webp`, md: `${base}-md.webp`, lg: `${base}-lg.webp`, width: im.width, height: im.height };
  }
  return { alt: im.alt, thumb: im.src, md: im.src, lg: im.src };
};
const discount = (v) => (v && v.mrp > v.price ? Math.round(((v.mrp - v.price) / v.mrp) * 100) : 0);
const defaultOf = (p) => p.variants.find((v) => v.isDefault) || p.variants[0];
const priceRange = (p) => ({ min: Math.min(...p.variants.map((v) => v.price)), max: Math.max(...p.variants.map((v) => v.price)) });
const inStock = (p) => p.variants.some((v) => v.keySpecs?.available !== false);

function toDetail(p) {
  const list = (l) => (l || []).map(resolveImage);
  return {
    ...p,
    media: {
      groupBy: p.media.groupBy,
      groups: Object.fromEntries(Object.entries(p.media.groups || {}).map(([k, l]) => [k, list(l)])),
      common: list(p.media.common),
    },
    variants: p.variants.map((v) => ({ ...v, discountPercent: discount(v), inStock: v.keySpecs?.available !== false })),
    priceRange: priceRange(p),
    inStock: inStock(p),
  };
}

function toCard(p) {
  const v = defaultOf(p);
  const first = [...((p.media.groups || {})[v.options?.[p.media.groupBy]] || []), ...(p.media.common || [])][0];
  return {
    sku: v.sku, slug: p.slug, title: p.title, brand: p.brand, category: p.category,
    image: resolveImage(first), price: v.price, mrp: v.mrp, discountPercent: discount(v),
    priceRange: priceRange(p),
    colors: ((p.variantOptions || []).find((o) => o.name === "Color")?.values || []).map((c) => ({ value: c.value, hex: c.hex })),
    variantCount: p.variants.length, inStock: inStock(p), launchDate: p.launchDate,
    options: v.options || {},
    defaultInStock: v.keySpecs?.available !== false,
    needsSize: (((p.variantOptions || []).find((o) => o.name === "Size")?.values.length) || 0) > 1,
  };
}

const SORTS = {
  featured: (a, b) => b.priceRange.min - a.priceRange.min,
  "price-asc": (a, b) => a.priceRange.min - b.priceRange.min,
  "price-desc": (a, b) => b.priceRange.min - a.priceRange.min,
  discount: (a, b) => b.discountPercent - a.discountPercent || b.priceRange.min - a.priceRange.min,
  newest: (a, b) => String(b.launchDate || "").localeCompare(String(a.launchDate || "")),
};

const num = (v) => (v === undefined || v === null || v === "" ? null : Number(v));

const api = {
  categories() {
    return Object.entries(CATEGORIES)
      .map(([slug, name]) => ({ slug, name, count: raw.filter((p) => catOf(p) === slug).length }))
      .filter((c) => c.count > 0);
  },

  listProducts(params = {}) {
    const brands = String(params.brand || "").split(",").filter(Boolean);
    const min = num(params.minPrice);
    const max = num(params.maxPrice);
    const minDiscount = num(params.minDiscount);
    const words = String(params.q || "").toLowerCase().split(/\s+/).filter((w) => w.length > 1);
    const limit = Math.min(60, num(params.limit) || PAGE_SIZE);
    const page = Math.max(1, num(params.page) || 1);

    const base = raw
      .filter((p) => !params.category || catOf(p) === params.category)
      .map(toCard)
      .filter((c) => (min === null || c.priceRange.min >= min) && (max === null || c.priceRange.min <= max))
      .filter((c) => params.inStock !== "true" || c.inStock)
      .filter((c) => !words.length || words.some((w) => `${c.title} ${c.brand} ${c.category}`.toLowerCase().includes(w)))
      .filter((c) => !minDiscount || c.discountPercent >= minDiscount);
    const items = base.filter((c) => !brands.length || brands.includes(c.brand)).sort(SORTS[params.sort] || SORTS.featured);

    const counts = new Map();
    base.forEach((c) => counts.set(c.brand, (counts.get(c.brand) || 0) + 1));
    const prices = base.map((c) => c.priceRange.min);
    return {
      products: items.slice((page - 1) * limit, page * limit),
      page, limit, total: items.length, pages: Math.max(1, Math.ceil(items.length / limit)),
      sort: SORTS[params.sort] ? params.sort : "featured",
      facets: {
        brands: [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name, count]) => ({ name, count })),
        price: prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null,
      },
    };
  },

  getProduct(slug) {
    const p = raw.find((x) => x.slug === slug);
    return p ? toDetail(p) : null;
  },

  getSimilar(slug, limit = 12) {
    const p = raw.find((x) => x.slug === slug);
    if (!p) return null;
    const price = priceRange(p).min;
    const products = raw
      .filter((x) => x.slug !== slug && catOf(x) === catOf(p))
      .map(toCard)
      .sort((a, b) => Math.abs(a.priceRange.min - price) - Math.abs(b.priceRange.min - price))
      .slice(0, limit);
    return { source: "price", products };
  },
};

export default api;
