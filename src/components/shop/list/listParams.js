export const SORTS = {
  relevance: "Best match",
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  discount: "Biggest discount",
  rating: "Customer rating",
  newest: "Newest first",
};
export const SORT_OPTIONS = Object.entries(SORTS).map(([value, label]) => ({ value, label }));
export const SORTS_BROWSE = SORT_OPTIONS.filter((o) => o.value !== "relevance"); // "Best match" only applies to searches
export const DISCOUNTS = [10, 25, 40];
export const RATINGS = [4, 3];

// Filters live in the URL: brand=a,b · min/max · off · stock=1 · rating · f_<key>=a,b (category filters)
export const FILTER_PARAMS = ["brand", "min", "max", "off", "stock", "rating"];
export const isFilterParam = (k) => FILTER_PARAMS.includes(k) || k.startsWith("f_");
export const listOf = (v) =>
  (v || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
