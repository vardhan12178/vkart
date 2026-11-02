import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CATEGORIES } from "../catalogData";
import { fetchProducts, formatPrice } from "../catalogApi";
import { priceBands } from "./priceBands";
import { SORT_OPTIONS, SORTS_BROWSE, isFilterParam, listOf } from "./listParams";

// Everything the catalog page keeps in the URL (category, search, sort, filters) plus the
// paged product fetch. The page and its components only read what this returns.
export default function useProductList() {
  const [params, setParams] = useSearchParams();
  // URL state: ?cat= (category, absent for all products), ?q= (search), ?sort=, ?min= / ?max= (from header search)
  const category = CATEGORIES[params.get("cat")] ? params.get("cat") : null;
  const q = (params.get("q") || "").trim();
  const sortOptions = q ? SORT_OPTIONS : SORTS_BROWSE;
  const sort = sortOptions.some((o) => o.value === params.get("sort"))
    ? params.get("sort")
    : q
      ? "relevance"
      : "featured";
  const urlMin = Number(params.get("min")) || null;
  const urlMax = Number(params.get("max")) || null;
  const scope = category || "all";
  const brandSel = listOf(params.get("brand"));
  const minOff = Number(params.get("off")) || 0;
  const inStock = params.get("stock") === "1";
  const minRating = Number(params.get("rating")) || 0;
  const specSel = {};
  params.forEach((v, k) => {
    if (k.startsWith("f_")) specSel[k.slice(2)] = listOf(v);
  });
  const filterKey = [...params.entries()]
    .filter(([k]) => isFilterParam(k))
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join("&");
  const [sheet, setSheet] = useState(false);
  const [quickSlug, setQuickSlug] = useState(null); // product open in the quick-add sheet

  const [data, setData] = useState(null); // last API response
  const [items, setItems] = useState([]); // products across loaded pages
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bounds, setBounds] = useState({}); // category -> price bounds without filters, for stable bands
  const [attempt, setAttempt] = useState(0);

  const closeQuick = useCallback(() => setQuickSlug(null), []);
  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  const setSort = (value) =>
    setParam("sort", value === (q ? "relevance" : "featured") ? null : value);
  const update = (mutate) => {
    const next = new URLSearchParams(params);
    mutate(next);
    setParams(next, { replace: true });
  };
  const toggleIn = (next, key, value) => {
    const list = listOf(next.get(key));
    const out = list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
    if (out.length) next.set(key, out.join(","));
    else next.delete(key);
  };
  const clearUrlPrice = () =>
    update((n) => {
      n.delete("min");
      n.delete("max");
    });
  const clearAll = () =>
    update((n) => [...n.keys()].filter(isFilterParam).forEach((k) => n.delete(k)));
  useEffect(() => {
    setPage(1);
  }, [category, q, filterKey, sort]);

  const bands = priceBands(bounds[scope]);
  // A sidebar price band is just a min/max pair in the URL; the header search can set any range
  const band = bands.find((b) => (b.min || null) === urlMin && (b.max || null) === urlMax) || null;
  const act = {
    toggleBrand: (b) => update((n) => toggleIn(n, "brand", b)),
    toggleSpec: (key, value) => update((n) => toggleIn(n, `f_${key}`, value)),
    setOne: (key, value) => update((n) => (value ? n.set(key, String(value)) : n.delete(key))),
    pickBand: (b) =>
      update((n) => {
        if (b?.min) n.set("min", String(b.min));
        else n.delete("min");
        if (b?.max) n.set("max", String(b.max));
        else n.delete("max");
      }),
  };
  const sel = { brands: brandSel, band, minOff, inStock, minRating, specs: specSel };

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");
    fetchProducts({
      ...(category ? { category } : {}),
      ...(q ? { q } : {}),
      sort,
      page,
      limit: 24,
      ...(brandSel.length ? { brand: brandSel.join(",") } : {}),
      ...(urlMin ? { minPrice: urlMin } : {}),
      ...(urlMax ? { maxPrice: urlMax } : {}),
      ...(minOff ? { minDiscount: minOff } : {}),
      ...(inStock ? { inStock: "true" } : {}),
      ...(minRating ? { minRating } : {}),
      // Category filters only apply inside their category
      ...(category
        ? Object.fromEntries(Object.entries(specSel).map(([k, v]) => [`f_${k}`, v.join(",")]))
        : {}),
    })
      .then((res) => {
        if (!live) return;
        setData(res);
        setItems((prev) => (page === 1 ? res.products : [...prev, ...res.products]));
        const unfiltered = !q && !filterKey;
        if (unfiltered && res.facets?.price)
          setBounds((b) => (b[scope] ? b : { ...b, [scope]: res.facets.price }));
      })
      .catch(() => live && setError("Couldn't load products. Please try again."))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, q, filterKey, sort, page, attempt]);

  const total = data?.total ?? 0;
  const heading = q ? `Results for "${q}"` : category ? CATEGORIES[category] : "All products";
  // Switching category keeps the search words, so a search can be narrowed to one category
  const pickCategory = (k) => {
    const next = new URLSearchParams();
    if (k) next.set("cat", k);
    if (q) next.set("q", q);
    setParams(next, { replace: true });
  };
  const specLabel = (key, value) => {
    const facet = data?.facets?.specs?.find((x) => x.key === key);
    const option = facet?.options.find((o) => o.value === value);
    return option?.label || value;
  };
  const chips = [
    ...brandSel.map((b) => ({ label: b, clear: act.toggleBrand.bind(null, b) })),
    ...(urlMin || urlMax
      ? [
          {
            label: band
              ? band.label
              : urlMin && urlMax
                ? `${formatPrice(urlMin)} – ${formatPrice(urlMax)}`
                : urlMax
                  ? `Under ${formatPrice(urlMax)}`
                  : `Over ${formatPrice(urlMin)}`,
            clear: clearUrlPrice,
          },
        ]
      : []),
    ...(category
      ? Object.entries(specSel).flatMap(([key, values]) =>
          values.map((v) => ({ label: specLabel(key, v), clear: () => act.toggleSpec(key, v) }))
        )
      : []),
    ...(minRating
      ? [{ label: `${minRating}★ & above`, clear: () => act.setOne("rating", null) }]
      : []),
    ...(minOff ? [{ label: `${minOff}%+ off`, clear: () => act.setOne("off", null) }] : []),
    ...(inStock ? [{ label: "In stock", clear: () => act.setOne("stock", null) }] : []),
  ];

  return {
    category,
    q,
    sort,
    sortOptions,
    setSort,
    heading,
    total,
    pickCategory,
    chips,
    clearAll,
    bands,
    sel,
    act,
    data,
    items,
    loading,
    page,
    setPage,
    error,
    retry: () => setAttempt((n) => n + 1),
    sheet,
    setSheet,
    quickSlug,
    setQuickSlug,
    closeQuick,
  };
}
