import React, { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { findSaved, toggleSaved, wishlistItemFrom, variantLabel } from "./v2Items";
import { addToCart } from "../../redux/cartSlice";
import { openChat } from "../../redux/uiSlice";
import QuickAdd from "./QuickAdd";
import { RatingChip } from "./Reviews";
import { showToast } from "../../utils/toast";
import { Helmet } from "react-helmet-async";
import {
  FiSmartphone, FiMonitor, FiTablet, FiTv, FiHeadphones, FiWatch, FiDroplet, FiUser, FiShoppingBag,
  FiHome, FiCoffee, FiScissors, FiActivity, FiCpu, FiChevronRight, FiFilter, FiX, FiHeart, FiCheck, FiShoppingCart, FiGrid,
} from "react-icons/fi";
import BrandSelect from "./BrandSelect";
import { CATEGORIES } from "./catalogData";
import { fetchProducts, formatPrice } from "./catalogApi";

const ACCENT = "#a85d37";

const ICONS = {
  mobiles: FiSmartphone, laptops: FiCpu, tablets: FiTablet, tvs: FiTv, monitors: FiMonitor, audio: FiHeadphones,
  wearables: FiWatch, skincare: FiDroplet, "fashion-men": FiUser, "fashion-women": FiShoppingBag,
  appliances: FiHome, "kitchen-appliances": FiCoffee, grooming: FiScissors, sports: FiActivity,
};

const SORTS = {
  relevance: "Best match",
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  discount: "Biggest discount",
  newest: "Newest first",
};
const SORT_OPTIONS = Object.entries(SORTS).map(([value, label]) => ({ value, label }));
const SORTS_BROWSE = SORT_OPTIONS.filter((o) => o.value !== "relevance"); // "Best match" only applies to searches
const DISCOUNTS = [10, 25, 40];

const roundNice = (n) => {
  const step = n >= 100000 ? 10000 : n >= 20000 ? 5000 : n >= 5000 ? 1000 : n >= 1000 ? 500 : 100;
  return Math.max(step, Math.round(n / step) * step);
};

// Four price bands between the category's cheapest and dearest product. Prices are
// skewed (a few very expensive items), so the cuts are spaced geometrically.
function priceBands(bounds) {
  if (!bounds || !(bounds.max > bounds.min)) return [];
  const lo = Math.max(100, bounds.min);
  const cuts = [...new Set([1, 2, 3].map((k) => roundNice(lo * (bounds.max / lo) ** (k / 4))))].filter((c) => c > bounds.min && c < bounds.max);
  if (!cuts.length) return [];
  const bands = [{ max: cuts[0], label: `Under ${formatPrice(cuts[0])}` }];
  for (let i = 1; i < cuts.length; i++) bands.push({ min: cuts[i - 1], max: cuts[i], label: `${formatPrice(cuts[i - 1])} – ${formatPrice(cuts[i])}` });
  bands.push({ min: cuts[cuts.length - 1], label: `Over ${formatPrice(cuts[cuts.length - 1])}` });
  return bands;
}

/* ------------ Product card ------------ */
function Card({ p, onChooseOptions }) {
  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.wishlist);
  const liked = Boolean(findSaved(wishlist, p.slug));
  const img = p.image;
  const off = p.discountPercent;
  const colors = p.colors || [];
  const price = p.priceRange?.min ?? p.price;
  const multi = p.priceRange && p.priceRange.max > p.priceRange.min;
  // Fashion photos are styled shots: fill the frame. Product renders sit on a soft background.
  const fit = p.category === "fashion" ? "object-cover" : "object-contain p-4 mix-blend-multiply";
  // Add to cart adds the variant the tile shows (default storage/colour). Clothing with
  // several sizes asks for the size in the quick-add sheet instead of guessing one.
  const pickSize = p.needsSize || (p.needsSize === undefined && p.category === "fashion" && p.variantCount > 1);
  const pickOther = !pickSize && p.defaultInStock === false; // shown variant sold out, others aren't
  const label = variantLabel({ options: p.options });
  const add = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (pickSize || pickOther) return onChooseOptions(p.slug);
    if (!p.id) return showToast("Ordering works once this site's backend serves the v2 API.", "error");
    dispatch(addToCart({
      catalog: "v2", productId: p.id, sku: p.sku, slug: p.slug, title: p.title, price: p.price,
      thumbnail: img?.md || "", category: p.category, discountPercentage: off || 0,
      selectedVariants: label || undefined, quantity: 1,
    }));
    showToast(`Added to cart${label ? ` · ${label}` : ""}`, "success");
  };
  return (
    <Link to={`/products/${p.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(29,28,25,0.25)]">
      <div className={`relative overflow-hidden bg-[#f6f3ed] ${p.category === "fashion" ? "aspect-[4/5]" : "aspect-square"}`}>
        {img && (
          <img src={img.md} alt={img.alt || p.title} loading="lazy" referrerPolicy="no-referrer"
            className={`absolute inset-0 h-full w-full ${fit} transition-transform duration-500 group-hover:scale-[1.03]`} />
        )}
        {off >= 5 && (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-white">{off}% OFF</span>
        )}
        <button type="button" aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={liked}
          onClick={(e) => {
            e.preventDefault();
            const saved = toggleSaved(dispatch, wishlist, wishlistItemFrom(p));
            showToast(saved ? "Saved to wishlist" : "Removed from wishlist", "success");
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition hover:scale-110">
          <FiHeart className={liked ? "fill-accent text-accent" : ""} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-light">{p.brand}</p>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-ink">{p.title.replace(`${p.brand} `, "")}</h3>
        {p.rating && <div className="mt-1.5"><RatingChip rating={p.rating} /></div>}
        {colors.length > 1 && (
          <div className="mt-2 flex items-center gap-1">
            {colors.slice(0, 5).map((c) => (
              <span key={c.value} title={c.value} className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10" style={{ background: c.hex || "#ddd" }} />
            ))}
            {colors.length > 5 && <span className="text-[11px] text-muted-light">+{colors.length - 5}</span>}
          </div>
        )}
        <div className="mt-auto pt-2">
          <div className="flex flex-wrap items-baseline gap-x-1.5">
            {multi && <span className="text-xs text-muted-light">From</span>}
            <span className="text-base font-bold text-ink">{formatPrice(price)}</span>
            {off > 0 && <span className="text-xs text-muted-light line-through">{formatPrice(p.mrp)}</span>}
          </div>
          <button type="button" onClick={add} disabled={p.inStock === false}
            aria-label={pickSize ? `Select size for ${p.title}` : pickOther ? `See options for ${p.title}` : `Add ${p.title} to cart`}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full border border-ink py-2 text-xs font-bold text-ink transition hover:bg-ink hover:text-white disabled:border-line-strong disabled:text-muted-faint disabled:hover:bg-transparent sm:text-sm">
            {p.inStock === false ? "Out of stock" : pickSize ? "Select size" : pickOther ? "See options" : <><FiShoppingCart /> Add to cart</>}
          </button>
        </div>
      </div>
    </Link>
  );
}

/* ------------ Filters ------------ */
function Section({ title, children }) {
  return (
    <div className="border-b border-line py-4 last:border-0">
      <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-ink">{title}</h3>
      {children}
    </div>
  );
}

function Check({ checked, onChange, children, count }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-ink-soft">
      <span className={`flex h-4 w-4 flex-none items-center justify-center rounded border ${checked ? "border-ink bg-ink text-white" : "border-[#cfc7b8] bg-white"}`}>
        {checked && <FiCheck className="h-3 w-3" />}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <span className="flex-1">{children}</span>
      {count != null && <span className="text-xs text-muted-faint">{count}</span>}
    </label>
  );
}

function Filters({ facets, bands, f, set }) {
  const toggleBrand = (b) => set({ ...f, brands: f.brands.includes(b) ? f.brands.filter((x) => x !== b) : [...f.brands, b] });
  const brands = [...new Set([...(facets?.brands || []).map((b) => b.name), ...f.brands])];

  return (
    <div>
      <Section title="Brand">
        <div className="max-h-64 overflow-y-auto pr-1">
          {brands.map((b) => <Check key={b} checked={f.brands.includes(b)} onChange={() => toggleBrand(b)}>{b}</Check>)}
        </div>
      </Section>
      {bands.length > 0 && (
        <Section title="Price">
          {bands.map((band, i) => (
            <Check key={band.label} checked={f.band === i} onChange={() => set({ ...f, band: f.band === i ? null : i })}>{band.label}</Check>
          ))}
        </Section>
      )}
      <Section title="Discount">
        {DISCOUNTS.map((d) => (
          <Check key={d} checked={f.minOff === d} onChange={() => set({ ...f, minOff: f.minOff === d ? 0 : d })}>{d}% or more</Check>
        ))}
      </Section>
      <Section title="Availability">
        <Check checked={f.inStock} onChange={() => set({ ...f, inStock: !f.inStock })}>In stock only</Check>
      </Section>
    </div>
  );
}

const EMPTY = { brands: [], band: null, minOff: 0, inStock: false };

/* ------------ Page ------------ */
export default function CatalogPreviewList() {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  // URL state: ?cat= (category, absent for all products), ?q= (search), ?sort=, ?min= / ?max= (from header search)
  const category = CATEGORIES[params.get("cat")] ? params.get("cat") : null;
  const q = (params.get("q") || "").trim();
  const sortOptions = q ? SORT_OPTIONS : SORTS_BROWSE;
  const sort = sortOptions.some((o) => o.value === params.get("sort")) ? params.get("sort") : q ? "relevance" : "featured";
  const urlMin = Number(params.get("min")) || null;
  const urlMax = Number(params.get("max")) || null;
  const scope = category || "all";
  const [f, setF] = useState(EMPTY);
  const [sheet, setSheet] = useState(false);
  const [quickSlug, setQuickSlug] = useState(null); // product open in the quick-add sheet

  const [data, setData] = useState(null); // last API response
  const [items, setItems] = useState([]); // products across loaded pages
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bounds, setBounds] = useState({}); // category -> price bounds without filters, for stable bands

  const closeQuick = useCallback(() => setQuickSlug(null), []);
  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };
  const setSort = (value) => setParam("sort", value === (q ? "relevance" : "featured") ? null : value);
  const clearUrlPrice = () => {
    const next = new URLSearchParams(params);
    next.delete("min"); next.delete("max");
    setParams(next, { replace: true });
  };
  const clearAll = () => { setF(EMPTY); if (urlMin || urlMax) clearUrlPrice(); };
  useEffect(() => { setF(EMPTY); }, [category, q]);
  useEffect(() => { setPage(1); }, [category, q, f, sort, urlMin, urlMax]);

  const bands = priceBands(bounds[scope]);
  const band = f.band !== null ? bands[f.band] : null;
  // A price band from the sidebar wins over a range that came from the header search
  const minPrice = band ? band.min : urlMin;
  const maxPrice = band ? (band.max ? band.max - 1 : null) : urlMax;

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
      ...(f.brands.length ? { brand: f.brands.join(",") } : {}),
      ...(minPrice ? { minPrice } : {}),
      ...(maxPrice ? { maxPrice } : {}),
      ...(f.minOff ? { minDiscount: f.minOff } : {}),
      ...(f.inStock ? { inStock: "true" } : {}),
    })
      .then((res) => {
        if (!live) return;
        setData(res);
        setItems((prev) => (page === 1 ? res.products : [...prev, ...res.products]));
        const unfiltered = !q && !urlMin && !urlMax && !f.brands.length && f.band === null && !f.minOff && !f.inStock;
        if (unfiltered && res.facets?.price) setBounds((b) => (b[scope] ? b : { ...b, [scope]: res.facets.price }));
      })
      .catch(() => live && setError("Couldn't load products. Please try again."))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, q, f, sort, page, urlMin, urlMax]);

  const total = data?.total ?? 0;
  const heading = q ? `Results for "${q}"` : category ? CATEGORIES[category] : "All products";
  // Switching category keeps the search words, so a search can be narrowed to one category
  const pickCategory = (k) => {
    const next = new URLSearchParams();
    if (k) next.set("cat", k);
    if (q) next.set("q", q);
    setParams(next, { replace: true });
  };
  const chips = [
    ...f.brands.map((b) => ({ label: b, clear: () => setF({ ...f, brands: f.brands.filter((x) => x !== b) }) })),
    ...(band ? [{ label: band.label, clear: () => setF({ ...f, band: null }) }] : []),
    ...(!band && (urlMin || urlMax) ? [{
      label: urlMin && urlMax ? `${formatPrice(urlMin)} – ${formatPrice(urlMax)}` : urlMax ? `Under ${formatPrice(urlMax)}` : `Over ${formatPrice(urlMin)}`,
      clear: clearUrlPrice,
    }] : []),
    ...(f.minOff ? [{ label: `${f.minOff}%+ off`, clear: () => setF({ ...f, minOff: 0 }) }] : []),
    ...(f.inStock ? [{ label: "In stock", clear: () => setF({ ...f, inStock: false }) }] : []),
  ];

  return (
    <div className="min-h-screen bg-sand pb-24 lg:pb-12">
      <Helmet>
        <title>{`${heading} | VKart`}</title>
        {q && <meta name="robots" content="noindex,follow" />}
      </Helmet>

      {/* Category bar */}
      <div className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-4">
          {[[null, "All"], ...Object.entries(CATEGORIES)].map(([k, name]) => {
            const Icon = k ? ICONS[k] || FiShoppingBag : FiGrid;
            const active = k === category;
            return (
              <button key={k || "all"} type="button" onClick={() => pickCategory(k)} aria-pressed={active}
                ref={active ? (el) => el?.scrollIntoView({ block: "nearest", inline: "center" }) : undefined}
                className="group flex w-[76px] flex-none flex-col items-center gap-1.5 rounded-xl px-1 py-1.5 sm:w-[86px]">
                <span className={`flex h-12 w-12 items-center justify-center rounded-full text-xl transition ${active ? "bg-ink text-white" : "bg-tint text-[#5f5b52] group-hover:bg-[#e8e1d4]"}`}>
                  <Icon />
                </span>
                <span className={`text-center text-[11px] leading-tight ${active ? "font-bold text-ink" : "text-muted"}`}>{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        {/* Heading */}
        <div className="flex flex-wrap items-end justify-between gap-3 pb-4 pt-5">
          <div>
            <nav className="flex items-center gap-1 text-xs text-muted-light">
              <Link to="/" className="hover:text-ink">Home</Link><FiChevronRight />
              {category && !q ? <span className="text-ink">{CATEGORIES[category]}</span> : (
                <><Link to="/products" className="hover:text-ink">Products</Link>{q && <><FiChevronRight /><span className="text-ink">Search</span></>}</>
              )}
            </nav>
            <h1 className="mt-1 break-words text-2xl font-bold text-ink sm:text-3xl">{heading}</h1>
            <p className="text-sm text-muted-light">{loading && page === 1 ? "Loading…" : `${total} products`}</p>
          </div>
          <BrandSelect label="Sort by" prefix="Sort by:" value={sort} onChange={setSort} options={sortOptions} className="hidden w-64 lg:block" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden self-start rounded-2xl bg-paper px-5 py-1 ring-1 ring-line lg:sticky lg:top-24 lg:block">
            <div className="flex items-center justify-between border-b border-line py-4">
              <span className="text-sm font-bold text-ink">Filters</span>
              {chips.length > 0 && <button type="button" onClick={clearAll} className="text-xs font-semibold" style={{ color: ACCENT }}>Clear all</button>}
            </div>
            <Filters facets={data?.facets} bands={bands} f={f} set={setF} />
          </aside>

          <div>
            {chips.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {chips.map((c) => (
                  <button key={c.label} type="button" onClick={c.clear}
                    className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-white">
                    {c.label}<FiX />
                  </button>
                ))}
              </div>
            )}
            {error ? (
              <div className="rounded-2xl bg-paper p-10 text-center ring-1 ring-line">
                <p className="font-semibold text-ink">{error}</p>
                <button type="button" onClick={() => setF({ ...f })} className="mt-3 text-sm font-semibold underline" style={{ color: ACCENT }}>Retry</button>
              </div>
            ) : loading && page === 1 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="overflow-hidden rounded-2xl bg-white ring-1 ring-line">
                    <div className="aspect-[4/5] animate-pulse bg-tint" />
                    <div className="space-y-2 p-4"><div className="h-3 w-1/3 rounded bg-tint" /><div className="h-4 w-4/5 rounded bg-tint" /><div className="h-4 w-1/2 rounded bg-tint" /></div>
                  </div>
                ))}
              </div>
            ) : items.length ? (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {items.map((p) => <Card key={p.slug} p={p} onChooseOptions={setQuickSlug} />)}
                </div>
                {data && page < data.pages && (
                  <div className="mt-8 flex flex-col items-center gap-2">
                    <p className="text-xs text-muted-light">You've seen {items.length} of {total} products</p>
                    <div className="h-1 w-40 overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full bg-ink" style={{ width: `${Math.min(100, (items.length / total) * 100)}%` }} />
                    </div>
                    <button type="button" disabled={loading} onClick={() => setPage(page + 1)}
                      className="rounded-full border-2 border-ink px-8 py-2.5 text-sm font-bold text-ink transition hover:bg-ink hover:text-white disabled:opacity-50">
                      {loading ? "Loading…" : "Load more"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl bg-paper p-10 text-center ring-1 ring-line">
                {q && !chips.length ? (
                  <>
                    <p className="font-semibold text-ink">No matches for "{q}".</p>
                    <p className="mt-1 text-sm text-muted">Try fewer or different words, or describe what you need to our AI assistant.</p>
                    <button type="button" onClick={() => dispatch(openChat())}
                      className="mt-4 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black">Ask VKart</button>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-ink">No products match these filters.</p>
                    <button type="button" onClick={clearAll} className="mt-3 text-sm font-semibold underline" style={{ color: ACCENT }}>Clear filters</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sort / filter bar */}
      <div className="has-bottom-bar fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-line bg-paper lg:hidden">
        <div className="border-r border-line p-1.5">
          <BrandSelect label="Sort by" prefix="Sort:" value={sort} onChange={setSort} options={sortOptions} up
            buttonClassName="justify-center border-transparent bg-transparent hover:border-transparent" />
        </div>
        <button type="button" onClick={() => setSheet(true)} className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-ink">
          <FiFilter /> Filter{chips.length > 0 && <span className="rounded-full px-1.5 text-xs text-white" style={{ background: ACCENT }}>{chips.length}</span>}
        </button>
      </div>

      {/* Mobile filter sheet */}
      {sheet && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheet(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-paper px-5 pb-24">
            <div className="sticky top-0 flex items-center justify-between bg-paper py-4">
              <span className="text-base font-bold text-ink">Filters</span>
              <button type="button" onClick={() => setSheet(false)} aria-label="Close"><FiX className="text-xl" /></button>
            </div>
            <Filters facets={data?.facets} bands={bands} f={f} set={setF} />
            <div className="fixed inset-x-0 bottom-0 grid grid-cols-2 gap-3 border-t border-line bg-paper p-3">
              <button type="button" onClick={clearAll} className="rounded-full border border-ink py-3 text-sm font-bold">Clear</button>
              <button type="button" onClick={() => setSheet(false)} className="rounded-full py-3 text-sm font-bold text-white" style={{ background: ACCENT }}>
                Show {total} products
              </button>
            </div>
          </div>
        </div>
      )}
      {quickSlug && <QuickAdd slug={quickSlug} onClose={closeQuick} />}
    </div>
  );
}
