import axios from "../axiosInstance";
import { CATEGORIES, catOf } from "./catalogData";

// Data access for the catalog pages. Everything goes through /api/v2; when the API is
// unreachable, the same response shapes are built from the JSON bundled with the site.
// Responses match backend services/catalog.service.js.

let bundled;
async function bundle() {
  if (!bundled) bundled = import("./catalogBundle").then((m) => m.default);
  return bundled;
}

let apiDown = false;
const listeners = new Set();
export const getSource = () => (apiDown ? "bundled" : "api");
export function onSourceChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

async function viaApi(path, params, local) {
  if (!apiDown) {
    try {
      const { data } = await axios.get(`/api/v2${path}`, { params, timeout: 15000 });
      if (data && typeof data === "object") return data;
      throw new Error("Unexpected catalog response");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404 && err.response.data?.error === "Product not found") return null; // a real "not found"
      if (status === 400) throw err;
      // Anything else (route missing on an older backend, network error, 5xx): use the bundled data
      apiDown = true;
      listeners.forEach((fn) => fn("bundled"));
    }
  }
  return local(await bundle());
}

export const fetchCategories = () => viaApi("/categories", undefined, (b) => b.categories());
export const fetchProducts = (params) => viaApi("/products", params, (b) => b.listProducts(params));
export const fetchProduct = (slug) => viaApi(`/products/${encodeURIComponent(slug)}`, undefined, (b) => b.getProduct(slug));
// Delivery estimate for a PIN code; there is no bundled fallback, so this needs the API
export const fetchDelivery = (pincode, category) =>
  axios.get(`/api/v2/delivery/${encodeURIComponent(pincode)}`, { params: category ? { category } : undefined, timeout: 10000 }).then((r) => r.data);
export const fetchSimilar = (slug, limit = 12) => viaApi(`/products/${encodeURIComponent(slug)}/similar`, { limit }, (b) => b.getSimilar(slug, limit));

/* ------------ Helpers for API-shaped data ------------ */
export const categoryName = (slug) => CATEGORIES[slug] || slug;
export const storefrontCategory = (p) => catOf(p);

export function defaultVariant(p) {
  return p.variants.find((v) => v.isDefault) || p.variants[0];
}

export function imagesFor(p, optionValue) {
  const media = p.media || {};
  return [...((media.groups || {})[optionValue] || []), ...(media.common || [])];
}

export function toCardFromDetail(p) {
  const v = defaultVariant(p);
  const prices = p.variants.map((x) => x.price);
  return {
    slug: p.slug, title: p.title, brand: p.brand, category: p.category,
    image: imagesFor(p, v.options?.[p.media?.groupBy])[0] || null,
    price: v.price, mrp: v.mrp, discountPercent: v.discountPercent ?? 0,
    priceRange: p.priceRange || { min: Math.min(...prices), max: Math.max(...prices) },
    colors: ((p.variantOptions || []).find((o) => o.name === "Color")?.values || []).map((c) => ({ value: c.value, hex: c.hex })),
    variantCount: p.variants.length, inStock: p.inStock, launchDate: p.launchDate,
    rating: p.rating || null,
  };
}

export const formatPrice = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
