import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import {
  FaCartPlus,
  FaHeart,
  FaRegHeart,
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaFilter,
  FaTimes,
  FaSearch,
  FaExpand,
  FaCheck,
} from "react-icons/fa";
import Sidebar from "./Sidebar";
import CustomDropdown from "./CustomDropdown";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

const CardSkeleton = () => (
  <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
    <div className="aspect-square w-full rounded-2xl bg-gray-100 animate-pulse" />
    <div className="mt-4 space-y-3">
      <div className="h-3 w-24 rounded bg-gray-100 animate-pulse" />
      <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
      <div className="flex items-center justify-between">
        <div className="h-5 w-28 rounded bg-gray-100 animate-pulse" />
        <div className="h-4 w-16 rounded bg-gray-100 animate-pulse" />
      </div>
      <div className="h-10 w-full rounded-2xl bg-gray-100 animate-pulse" />
    </div>
  </div>
);

const Stars = ({ value }) => {
  const rounded = Math.round(value * 2) / 2;
  return (
    <div className="flex items-center text-yellow-500 text-[15px]">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i + 1 <= Math.floor(rounded)) return <FaStar key={i} />;
        if (i + 0.5 === rounded) return <FaStarHalfAlt key={i} />;
        return <FaRegStar key={i} className="text-gray-300" />;
      })}
    </div>
  );
};

const Chip = ({ onClear, children }) => (
  <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-700 ring-1 ring-orange-100">
    {children}
    <button onClick={onClear} className="ml-1 rounded-full p-1 hover:bg-orange-100" aria-label="Remove filter">
      <FaTimes />
    </button>
  </span>
);

const QuickView = ({ product, onClose, onAdd }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const images = product?.images?.length ? product.images : [product?.thumbnail].filter(Boolean);

  useEffect(() => {
    if (!product) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setActiveIdx((i) => Math.min(i + 1, images.length - 1));
      if (e.key === "ArrowLeft") setActiveIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [product, onClose, images.length]);

  if (!product) return null;

  const priceINR = product.price * 83;
  const mrpINR = product.discountPercentage ? priceINR / (1 - product.discountPercentage / 100) : priceINR * 1.2;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 mx-4 w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <button className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-gray-600 shadow hover:bg-white" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
              <img src={images[activeIdx]} alt={product.title} className="h-80 w-full object-contain" />
              {images.length > 1 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
                    onClick={() => setActiveIdx((i) => Math.max(i - 1, 0))}
                    disabled={activeIdx === 0}
                    aria-label="Prev"
                  >
                    ‹
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
                    onClick={() => setActiveIdx((i) => Math.min(i + 1, images.length - 1))}
                    disabled={activeIdx === images.length - 1}
                    aria-label="Next"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIdx(idx)}
                    className={["h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border", idx === activeIdx ? "border-orange-500" : "border-gray-200"].join(" ")}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-xl font-semibold text-gray-900">{product.title}</h3>
            <p className="mt-1 text-sm text-gray-500 capitalize">{product.category}</p>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-orange-600">{INR(priceINR)}</span>
                <span className="text-sm text-gray-400 line-through">{INR(mrpINR)}</span>
                {product.discountPercentage ? (
                  <span className="rounded-full bg-green-50 px-2 py-[2px] text-[11px] font-semibold text-green-700">
                    {Math.round(product.discountPercentage)}% OFF
                  </span>
                ) : null}
              </div>
              <Stars value={product.rating} />
            </div>
            <p className="mt-4 line-clamp-4 text-sm text-gray-700">{product.description}</p>
            <div className="mt-auto pt-6">
              <button
                onClick={() => onAdd(product)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 px-4 py-2 font-semibold text-white shadow-sm transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
              >
                <FaCartPlus /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Products() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("cat") || "");
  const [priceRange, setPriceRange] = useState({
    min: Number(searchParams.get("min")) || 0,
    max: Number(searchParams.get("max")) || 100000,
  });
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "relevance");
  const [showFilters, setShowFilters] = useState(false);

  const [quickView, setQuickView] = useState(null);

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlist") || "[]");
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const [compare, setCompare] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("compare") || "[]");
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("compare", JSON.stringify(compare.slice(0, 4)));
  }, [compare]);

  const PAGE_SIZE = 16;
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://dummyjson.com/products?limit=500");
        const { products } = await res.json();
        setProducts(products || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const next = new URLSearchParams();
    if (searchTerm) next.set("q", searchTerm);
    if (categoryFilter) next.set("cat", categoryFilter);
    if (priceRange.min) next.set("min", String(priceRange.min));
    if (priceRange.max !== 100000) next.set("max", String(priceRange.max));
    if (sortBy !== "relevance") next.set("sort", sortBy);
    setSearchParams(next, { replace: true });
  }, [searchTerm, categoryFilter, priceRange, sortBy, setSearchParams]);

  const filteredProducts = useMemo(() => {
    let list = products.slice();
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((p) => `${p.title} ${p.description}`.toLowerCase().includes(q));
    }
    if (categoryFilter) {
      list = list.filter((p) => p.category === categoryFilter);
    }
    list = list.filter((p) => p.price >= priceRange.min && p.price <= priceRange.max);
    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating-desc":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    return list;
  }, [products, searchTerm, categoryFilter, priceRange, sortBy]);

  useEffect(() => setVisible(PAGE_SIZE), [searchTerm, categoryFilter, priceRange, sortBy]);

  const toggleWishlist = useCallback((id) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const handleAddToCart = useCallback(
    (product) => {
      dispatch(addToCart({ ...product, quantity: 1 }));
    },
    [dispatch]
  );

  const toggleCompare = useCallback((id) => {
    setCompare((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }, []);

  const clearAll = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setPriceRange({ min: 0, max: 100000 });
    setSortBy("relevance");
  };

  const visibleItems = filteredProducts.slice(0, visible);
  const total = filteredProducts.length;

  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "rating-desc", label: "Rating" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 overflow-x-clip">

<div className="mb-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

  <div className="flex min-w-0 items-baseline gap-3">
    <h1 className="truncate text-3xl font-extrabold tracking-tight text-gray-900">Products</h1>
    <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-[2px] text-sm text-gray-600 ring-1 ring-gray-200">
      {total} items
    </span>
  </div>


  <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">

    <div className="order-1 flex w-full min-w-0 items-center gap-3 sm:order-2 sm:w-auto">
      <button
        onClick={() => setShowFilters(true)}
        className="inline-flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-2 text-orange-700 ring-1 ring-orange-100 sm:hidden"
      >
        <FaFilter /> Filters
      </button>

      <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
        <span className="hidden text-sm text-gray-500 sm:block">Sort</span>
        <div className="min-w-0 flex-1 sm:flex-none">
          <CustomDropdown
            options={[
              { value: "relevance", label: "Relevance" },
              { value: "price-asc", label: "Price: Low to High" },
              { value: "price-desc", label: "Price: High to Low" },
              { value: "rating-desc", label: "Rating" },
            ]}
            value={sortBy}
            onChange={(v) => setSortBy(v)}
            label="Relevance"
          />
        </div>
      </div>
    </div>


    <div className="order-2 relative w-full min-w-0 sm:order-1 sm:w-72">
      <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search products"
        className="w-full flex-1 min-w-0 rounded-2xl border border-gray-200 bg-white px-10 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
      />
    </div>
  </div>
</div>


      <div className="flex gap-8 min-w-0">
        <div className="hidden lg:block lg:w-72">
          <div className="sticky top-24">
            <Sidebar
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              onPriceChange={(r) => setPriceRange({ min: clamp(r.min, 0, 100000), max: clamp(r.max, 0, 100000) })}
              onSearch={setSearchTerm}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {(searchTerm || categoryFilter || priceRange.min > 0 || priceRange.max < 100000) && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {searchTerm && <Chip onClear={() => setSearchTerm("")}>Search: {searchTerm}</Chip>}
              {categoryFilter && <Chip onClear={() => setCategoryFilter("")}>Category: {categoryFilter}</Chip>}
              {(priceRange.min > 0 || priceRange.max < 100000) && (
                <Chip onClear={() => setPriceRange({ min: 0, max: 100000 })}>Price: {priceRange.min} – {priceRange.max}</Chip>
              )}
              <button onClick={clearAll} className="ml-1 text-sm text-gray-500 underline hover:text-gray-700">
                Clear all
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="mx-auto mt-16 w-full max-w-md rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="text-lg font-semibold text-gray-800">No products found</p>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters to find what you’re looking for.</p>
              <button onClick={clearAll} className="mt-4 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 px-4 py-2 text-white shadow hover:brightness-105">
                Reset filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {visibleItems.map((p) => {
                  const inWishlist = wishlist.includes(p.id);
                  const inCompare = compare.includes(p.id);
                  const priceINR = p.price * 83;
                  const mrpINR = p.discountPercentage ? priceINR / (1 - p.discountPercentage / 100) : priceINR * 1.2;

                  return (
                    <div key={p.id} className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white p-3 shadow-sm transition hover:-translate-y-[2px] hover:shadow-xl">
                      {p.discountPercentage ? (
                        <span className="absolute left-3 top-3 z-10 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-100">
                          {Math.round(p.discountPercentage)}% OFF
                        </span>
                      ) : null}

                      <button
                        onClick={() => toggleWishlist(p.id)}
                        aria-pressed={inWishlist}
                        title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                        className={["absolute right-3 top-3 z-10 rounded-full p-2 backdrop-blur-sm transition", inWishlist ? "text-rose-500 bg-white/90" : "text-gray-600 bg-white/80", "hover:scale-110"].join(" ")}
                      >
                        {inWishlist ? <FaHeart /> : <FaRegHeart />}
                      </button>

                      <label className="absolute left-3 top-10 z-10 inline-flex items-center gap-2 rounded-full bg-white/85 px-2 py-1 text-xs text-gray-700 backdrop-blur-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          checked={inCompare}
                          onChange={() => toggleCompare(p.id)}
                        />
                        Compare
                      </label>

                      <Link to={`/product/${p.id}`} className="relative block overflow-hidden rounded-2xl">
                        <img src={p.thumbnail} alt={p.title} loading="lazy" className="h-56 w-full rounded-2xl bg-gray-50 object-contain transition duration-300 group-hover:scale-[1.03]" />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white/90 to-transparent" />
                      </Link>

                      <div className="mt-3 flex flex-1 flex-col gap-2 px-1">
                        <span className="text-[11px] uppercase tracking-wide text-gray-400">{p.category}</span>
                        <Link to={`/product/${p.id}`} className="line-clamp-2 text-[15px] font-semibold text-gray-900 hover:text-orange-700">
                          {p.title}
                        </Link>
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-extrabold text-orange-600">{INR(priceINR)}</span>
                            <span className="text-xs text-gray-400 line-through">{INR(mrpINR)}</span>
                          </div>
                          <Stars value={p.rating} />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => handleAddToCart(p)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 px-4 py-2 font-semibold text-white shadow-sm transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                        >
                          <FaCartPlus /> Add to Cart
                        </button>
                        <button
                          onClick={() => setQuickView(p)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                          title="Quick View"
                        >
                          <FaExpand />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {visible < filteredProducts.length && (
                <div className="mt-10 flex justify-center">
                  <button
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    className="rounded-2xl border border-gray-300 px-5 py-2 text-sm shadow-sm hover:border-gray-400"
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <aside className="relative ml-auto h-full w-4/5 max-w-sm overflow-auto rounded-l-3xl bg-white p-6 shadow-2xl">
            <button onClick={() => setShowFilters(false)} className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <FaTimes /> Close
            </button>
            <Sidebar
              categoryFilter={categoryFilter}
              onCategoryChange={(val) => {
                setCategoryFilter(val);
                setShowFilters(false);
              }}
              onPriceChange={(range) => {
                setPriceRange({
                  min: clamp(range.min, 0, 100000),
                  max: clamp(range.max, 0, 100000),
                });
                setShowFilters(false);
              }}
              onSearch={(val) => setSearchTerm(val)}
            />
          </aside>
        </div>
      )}

      {quickView && (
        <QuickView
          product={quickView}
          onClose={() => setQuickView(null)}
          onAdd={(p) => {
            handleAddToCart(p);
            setQuickView(null);
          }}
        />
      )}

      {compare.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-40 mx-auto w-[min(1100px,92%)] rounded-2xl bg-white/90 p-3 shadow-2xl ring-1 ring-gray-200 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-orange-100 px-2 py-[2px] text-sm font-semibold text-orange-700">{compare.length}</span>
              <span className="text-sm text-gray-700">selected for comparison</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {compare.map((id) => (
                <button
                  key={id}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-700"
                  onClick={() => setCompare((prev) => prev.filter((x) => x !== id))}
                >
                  <FaCheck className="text-green-600" /> #{id}
                </button>
              ))}
              <button onClick={() => setCompare([])} className="rounded-full px-3 py-1 text-sm text-gray-500 underline">
                Clear
              </button>
              <button onClick={() => navigate(`/compare?ids=${compare.join(",")}`)} className="rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-105">
                Compare
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
