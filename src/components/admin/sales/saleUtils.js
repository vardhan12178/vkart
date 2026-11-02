import { CATEGORIES } from "../../shop/catalogData";

export const categoryLabel = (slug) =>
  CATEGORIES[slug] ||
  String(slug || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());

export const emptyCategoryRow = { category: "", discountPercent: "", primeDiscountPercent: "" };

export const emptySale = {
  name: "",
  slug: "",
  description: "",
  bannerImage: "",
  startDate: "",
  endDate: "",
  isActive: true,
  categories: [{ ...emptyCategoryRow }],
};

export const toLocal = (iso) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");

export const formFromSale = (sale) => ({
  name: sale.name,
  slug: sale.slug,
  description: sale.description || "",
  bannerImage: sale.bannerImage || "",
  startDate: toLocal(sale.startDate),
  endDate: toLocal(sale.endDate),
  isActive: sale.isActive,
  categories: sale.categories.length
    ? sale.categories.map((c) => ({
        category: c.category,
        discountPercent: c.discountPercent,
        primeDiscountPercent: c.primeDiscountPercent || "",
      }))
    : [{ ...emptyCategoryRow }],
});

export const payloadFromForm = (form) => ({
  ...form,
  categories: form.categories
    .filter((c) => c.category && c.discountPercent)
    .map((c) => ({
      category: c.category.trim(),
      discountPercent: Number(c.discountPercent),
      primeDiscountPercent: Number(c.primeDiscountPercent) || 0,
    })),
});

export const isLive = (s) =>
  s.isActive && new Date() >= new Date(s.startDate) && new Date() <= new Date(s.endDate);
