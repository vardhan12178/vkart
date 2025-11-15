import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { toggleWishlist } from "../redux/wishlistSlice";
import { showToast } from "../utils/toast";
import axios from "./axiosInstance";

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
  FaMagic,
} from "react-icons/fa";

import Sidebar from "./Sidebar";
import CustomDropdown from "./CustomDropdown";

/* ---------- Small animation helpers (no external libs) ---------- */
const AnimStyles = () => (
  <style>{`
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    @keyframes scaleIn { from { transform: scale(.96) } to { transform: scale(1) } }
    @keyframes slideUp { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
    @keyframes bounceSlow {
      0%, 100% { transform: translateY(0) }
      50% { transform: translateY(-2px) }
    }
    .animate-fadeIn { animation: fadeIn .28s ease-out both; }
    .animate-scaleIn { animation: scaleIn .22s ease-out both; }
    .animate-slideUp { animation: slideUp .28s ease-out both; }
    .animate-bounce-slow { animation: bounceSlow 2.4s ease-in-out infinite; }
  `}</style>
);

/* ---------- Utils ---------- */
const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

/* ---------- UI bits ---------- */
const CardSkeleton = () => (
  <div className="rounded-3xl border border-gray-100 bg-white/70 backdrop-blur-sm p-4 shadow-sm animate-pulse">
    <div className="aspect-square w-full rounded-2xl bg-gray-100" />
    <div className="mt-4 space-y-3">
      <div className="h-3 w-24 rounded bg-gray-100" />
      <div className="h-4 w-3/4 rounded bg-gray-100" />
      <div className="flex items-center justify-between">
        <div className="h-5 w-28 rounded bg-gray-100" />
        <div className="h-4 w-16 rounded bg-gray-100" />
      </div>
      <div className="h-10 w-full rounded-2xl bg-gray-100" />
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
  <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-700 ring-1 ring-orange-100 transition hover:bg-orange-100">
    {children}
    <button
      onClick={onClear}
      className="ml-1 rounded-full p-1 hover:bg-orange-200"
      aria-label="Remove filter"
    >
      <FaTimes />
    </button>
  </span>
);

/* ---------- Quick View (polished) ---------- */
const QuickView = ({ product, onClose, onAdd }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const images = product?.images?.length
    ? product.images
    : [product?.thumbnail].filter(Boolean);

  useEffect(() => {
    if (!product) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight")
        setActiveIdx((i) => Math.min(i + 1, images.length - 1));
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
  const mrpINR = product.discountPercentage
    ? priceINR / (1 - product.discountPercentage / 100)
    : priceINR * 1.2;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="relative z-10 mx-4 w-full max-w-4xl overflow-hidden rounded-3xl bg-white/95 shadow-2xl animate-scaleIn">
        <button
          className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-gray-600 shadow hover:bg-white"
          onClick={onClose}
          aria-label="Close"
        >
          <FaTimes />
        </button>
        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
              <img
                src={images[activeIdx]}
                alt={product.title}
                className="h-80 w-full object-contain transition-transform duration-300"
              />
              {images.length > 1 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 shadow hover:bg-white"
                    onClick={() => setActiveIdx((i) => Math.max(i - 1, 0))}
                    disabled={activeIdx === 0}
                  >
                    ‹
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 shadow hover:bg-white"
                    onClick={() =>
                      setActiveIdx((i) => Math.min(i + 1, images.length - 1))
                    }
                    disabled={activeIdx === images.length - 1}
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
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border ${
                      idx === activeIdx ? "border-orange-500" : "border-gray-200"
                    }`}
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
                <span className="text-2xl font-extrabold text-orange-600">
                  {INR(priceINR)}
                </span>
                <span className="text-sm text-gray-400 line-through">{INR(mrpINR)}</span>
                {product.discountPercentage && (
                  <span className="rounded-full bg-green-50 px-2 py-[2px] text-[11px] font-semibold text-green-700">
                    {Math.round(product.discountPercentage)}% OFF
                  </span>
                )}
              </div>
              <Stars value={product.rating} />
            </div>

            <p className="mt-4 line-clamp-4 text-sm text-gray-700">{product.description}</p>

            <div className="mt-auto pt-6">
              <button
                onClick={() => onAdd(product)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2 font-bold text-white shadow-[0_4px_14px_rgba(249,115,22,0.28)] transition-all duration-200 hover:brightness-110 hover:-translate-y-[1px]"
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

/* =================== MAIN COMPONENT =================== */
export default function Products() {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist);
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
       const res = await axios.get("/api/products", { params: { limit: 500 } });

       const { products } = res.data; 
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

    if (searchTerm.startsWith("rating:")) {
      const minRating = Number(searchTerm.split(":")[1]);
      list = list.filter((p) => p.rating >= minRating);
    } else if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((p) => `${p.title} ${p.description}`.toLowerCase().includes(q));
    }

    if (categoryFilter) list = list.filter((p) => p.category === categoryFilter);

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

  /* Robust wishlist check for either IDs or objects */
  const isInWishlist = useCallback(
    (id) => {
      if (!Array.isArray(wishlist)) return false;
      if (wishlist.length === 0) return false;
      const first = wishlist[0];
      return typeof first === "object" ? wishlist.some((x) => x?.id === id) : wishlist.includes(id);
    },
    [wishlist]
  );

  const toggleWishlistItem = (product) => {
    const exists = isInWishlist(product.id);
    dispatch(toggleWishlist(product));
    showToast(exists ? "Removed from Wishlist 💔" : "Added to Wishlist ❤️", exists ? "error" : "success");
  };

  const handleAddToCart = useCallback(
    (product) => {
      dispatch(addToCart({ ...product, quantity: 1 }));
      showToast("Added to Cart 🛒", "success");
    },
    [dispatch]
  );

  const toggleCompare = useCallback((_id) => {
  setCompare((prev) => {
    if (prev.includes(_id)) return prev.filter((x) => x !== _id);
    if (prev.length >= 4) return prev;
    return [...prev, _id];
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50">
      <AnimStyles />

      {/* Top bar */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/70 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-baseline gap-3">
            <h1 className="truncate text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
              Explore Products
            </h1>
            <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-[2px] text-sm text-gray-600 ring-1 ring-gray-200 animate-fadeIn">
              {total} items
            </span>
          </div>

          <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(true)}
              className="inline-flex sm:hidden items-center gap-2 rounded-xl bg-white/80 backdrop-blur px-4 py-2 text-gray-700 ring-1 ring-gray-200 hover:ring-orange-200"
            >
              <FaFilter /> Filters
            </button>

            {/* Sort */}
            <div className="order-1 flex w-full min-w-0 items-center gap-2 sm:order-2 sm:w-auto">
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

            {/* Search */}
            <div className="order-2 relative w-full min-w-0 sm:order-1 sm:w-72">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search 1000+ curated products"
                className="w-full flex-1 min-w-0 rounded-xl border border-gray-200 bg-white/90 px-10 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="container mx-auto px-4 py-8 overflow-x-clip"
        title="VKart Products – Browse curated electronics, fashion, and more"
      >
        <div className="flex gap-8 min-w-0">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-72">
            <div className="sticky top-24">
              <div className="rounded-2xl border border-gray-100 bg-white/70 backdrop-blur p-4 shadow-sm">
                <Sidebar
                  categoryFilter={categoryFilter}
                  onCategoryChange={setCategoryFilter}
                  onPriceChange={(r) =>
                    setPriceRange({
                      min: clamp(r.min, 0, 100000),
                      max: clamp(r.max, 0, 100000),
                    })
                  }
                  onSearch={setSearchTerm}
                />
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 min-w-0 transition-all">
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="mx-auto mt-16 w-full max-w-md rounded-3xl border border-dashed border-gray-300 bg-white/80 backdrop-blur p-10 text-center animate-fadeIn">
                <p className="text-lg font-semibold text-gray-800">No products found</p>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
                <button
                  onClick={clearAll}
                  className="mt-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2 text-white shadow-[0_4px_14px_rgba(249,115,22,0.25)] hover:brightness-110"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {visibleItems.map((p) => {
                    const inWishlist = isInWishlist(p._id);
                    const inCompare = compare.includes(p._id);
                    const priceINR = p.price * 83;
                    const mrpINR = p.discountPercentage
                      ? priceINR / (1 - p.discountPercentage / 100)
                      : priceINR * 1.2;

                    return (
                      <div
                        key={p._id}
                        className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white/90 p-3 backdrop-blur-sm shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_26px_rgba(0,0,0,0.08)] hover:ring-1 hover:ring-orange-100 animate-slideUp"
                      >
                        {/* Discount badge */}
                        {p.discountPercentage && (
                          <span className="absolute left-3 top-3 z-10 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-100">
                            {Math.round(p.discountPercentage)}% OFF
                          </span>
                        )}

                        {/* Wishlist */}
                        <button
                          onClick={() => toggleWishlistItem(p)}
                          title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                          className={`absolute right-3 top-3 z-10 rounded-full p-2 backdrop-blur-sm transition-all duration-200 ${
                            inWishlist ? "text-rose-500 bg-white/90" : "text-gray-600 bg-white/80"
                          } hover:scale-110`}
                        >
                          {inWishlist ? <FaHeart /> : <FaRegHeart />}
                        </button>

                        {/* Compare checkbox */}
                        <label className="absolute left-3 top-10 z-10 inline-flex items-center gap-2 rounded-full bg-white/85 px-2 py-1 text-xs text-gray-700 backdrop-blur-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          checked={compare.includes(p._id)}
                          onChange={() => toggleCompare(p._id)}
                        />
                        Compare
                      </label>


                        {/* Image */}
                        <Link to={`/product/${p._id}`} className="relative block overflow-hidden rounded-2xl">
                          <img
                            src={p.thumbnail}
                            alt={p.title}
                            loading="lazy"
                            className="h-56 w-full rounded-2xl bg-gray-50 object-contain transition duration-300 group-hover:scale-[1.04]"
                          />
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white/90 to-transparent" />
                        </Link>

                        {/* Meta */}
                        <div className="mt-3 flex flex-1 flex-col gap-2 px-1">
                          <span className="text-[11px] uppercase tracking-wide text-gray-400">{p.category}</span>
                          <Link
                            to={`/product/${p._id}`}
                            className="line-clamp-2 text-[15px] font-semibold text-gray-900 hover:text-orange-700"
                          >
                            {p.title}
                          </Link>

                          <div className="mt-1 border-t border-gray-100 pt-2 flex items-center justify-between">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-extrabold text-orange-600">{INR(priceINR)}</span>
                              <span className="text-xs text-gray-400 line-through">{INR(mrpINR)}</span>
                            </div>
                            <Stars value={p.rating} />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => handleAddToCart(p)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2 font-bold text-white shadow-[0_4px_14px_rgba(249,115,22,0.25)] transition-all duration-200 hover:brightness-110 hover:-translate-y-[1px]"
                          >
                            <FaCartPlus /> Add to Cart
                          </button>
                          <button
                            onClick={() => setQuickView(p)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-all duration-150 hover:border-orange-300 hover:text-orange-700 hover:shadow-sm"
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
                      className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-orange-300 hover:text-orange-600 transition-all bg-white/80 backdrop-blur"
                    >
                      Load more
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating AI Assistant Button */}
      <button
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3 text-white font-semibold shadow-[0_6px_20px_rgba(249,115,22,0.35)] backdrop-blur-lg hover:brightness-110 hover:scale-105 transition-all duration-300 animate-bounce-slow z-50"
        onClick={() => alert('AI Assistant feature coming soon!')}
      >
        <FaMagic className="text-lg" /> Ask VKart AI
      </button>

      {/* Quick View */}
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

      {/* Compare bar (frosted) */}
      {compare.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-40 mx-auto w-[min(1100px,92%)] rounded-2xl bg-white/70 p-3 shadow-2xl ring-1 ring-gray-200 backdrop-blur animate-slideUp">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-orange-100 px-2 py-[2px] text-sm font-semibold text-orange-700">
                {compare.length}
              </span>
              <span className="text-sm text-gray-700">selected for comparison</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {compare.map((id) => (
                <button
                  key={id}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-700 bg-white/80"
                  onClick={() => setCompare((prev) => prev.filter((x) => x !== id))}
                >
                  <FaCheck className="text-green-600" /> #{id}
                </button>
              ))}
              <button onClick={() => setCompare([])} className="rounded-full px-3 py-1 text-sm text-gray-500 underline">
                Clear
              </button>
              <button
                onClick={() => navigate(`/compare?ids=${compare.join(",")}`)}
                className="rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2 text-sm font-bold text-white shadow-[0_4px_14px_rgba(249,115,22,0.25)] hover:brightness-110 hover:-translate-y-[1px] transition-all"
              >
                Compare
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile filter drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[86%] transform transition-transform duration-300 ${
          showFilters ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!showFilters}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setShowFilters(false)}
          role="button"
          tabIndex={-1}
        />
        <div className="relative h-full bg-white/90 backdrop-blur-md border-r border-gray-100 p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="rounded-full bg-white/90 p-2 text-gray-600 shadow hover:bg-white"
            >
              <FaTimes />
            </button>
          </div>
          <Sidebar
            categoryFilter={categoryFilter}
            onCategoryChange={(v) => {
              setCategoryFilter(v);
              setShowFilters(false);
            }}
            onPriceChange={(r) => {
              setPriceRange({
                min: clamp(r.min, 0, 100000),
                max: clamp(r.max, 0, 100000),
              });
            }}
            onSearch={(v) => {
              setSearchTerm(v);
              setShowFilters(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}
