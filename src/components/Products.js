import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useInfiniteQuery } from "@tanstack/react-query";
import { addToCart } from "../redux/cartSlice";
import { toggleWishlist } from "../redux/wishlistSlice";
import { showToast } from "../utils/toast";
import axios from "./axiosInstance";
import { Helmet } from "react-helmet-async";
import { qk } from "../query/queryKeys";

// Extracted Components
import ProductSkeleton from "./product/ProductSkeleton";
import ProductQuickView from "./product/ProductQuickView";

import {
  FaCartPlus,
  FaHeart,
  FaRegHeart,
  FaStar,
  FaFilter,
  FaTimes,
  FaSearch,
  FaExpand,
  FaArrowRight,
  FaBolt,
} from "react-icons/fa";

import Sidebar from "./Sidebar";
import CustomDropdown from "./CustomDropdown";

/* ---------- Animation Styles ---------- */
const AnimStyles = () => (
  <style>{`
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .animate-fade-up { animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

/* ---------- UTILS ---------- */
const formatPrice = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

const COLLECTION_COPY = {
  smartphones: "Phones selected for strong cameras, dependable performance, and effortless everyday use.",
  laptops: "Portable performance for focused work, creative projects, and everything between.",
  "mens-watches": "Considered timepieces that bring clarity and character to the everyday.",
  "womens-watches": "Refined watches chosen as practical, lasting finishing details.",
  fragrances: "Distinctive scents selected for daily signatures and memorable occasions.",
  beauty: "Useful formulas and considered essentials for an uncomplicated routine.",
  furniture: "Functional pieces designed to make everyday spaces feel more resolved.",
  groceries: "Reliable pantry favourites and useful everyday provisions.",
  "home-decoration": "Thoughtful accents that add warmth, texture, and personality to a room.",
  "womens-dresses": "Easy silhouettes and considered details for everyday and occasion dressing.",
  "womens-shoes": "Versatile footwear selected for comfort, finish, and repeat wear.",
  "mens-shirts": "Well-made shirts for a sharper, easier everyday wardrobe.",
  "mens-shoes": "Dependable footwear balancing comfort, utility, and considered style.",
};

const formatCollectionName = (value = "") =>
  value
    .split("-")
    .filter(Boolean)
    .map((word) => {
      if (word === "mens") return "Men’s";
      if (word === "womens") return "Women’s";
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

/* ---------- Components ---------- */



/* =================== MAIN COMPONENT =================== */
export default function Products() {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const saleOnly = searchParams.get("sale") === "true";

  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const searchTerm = searchParams.get("q") || ""; // Derived directly from URL

  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("cat") || "");
  const [ratingFilter, setRatingFilter] = useState(Number(searchParams.get("rating")) || 0);
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

  const PAGE_SIZE = 12;

  /**
   * Sync Search Input with URL (e.g. when navigating from Header)
   */
  useEffect(() => {
    const q = searchParams.get("q") || "";
    if (q !== searchInput) {
      setSearchInput(q);
    }
  }, [searchInput, searchParams]);

  /**
   * Sync the other filter dimensions from the URL too (e.g. when the AI
   * search bar navigates here with cat/min/max/rating/sort already resolved
   * while this page is already mounted - only `q` had this sync before).
   * Guarded by equality checks so this can't fight the state->URL effect below.
   */
  // Deliberately depend on `searchParams` ONLY, not on categoryFilter/etc.
  // Sidebar (and other in-page controls) sets these via direct setState calls,
  // not URL navigation - if the state variable were also a dependency here,
  // every direct setState would re-fire this effect against a still-stale
  // `searchParams` closure, which re-set the state back, which re-triggered
  // the state->URL effect below, ping-ponging forever (this actually happened:
  // "Maximum update depth exceeded" from clicking a sidebar category, since
  // unlike the debounced `q` sync above, these run synchronously with no
  // debounce). Reading the latest state via closure at execution time is
  // still correct without listing it as a dependency.
  useEffect(() => {
    const cat = searchParams.get("cat") || "";
    setCategoryFilter((prev) => (cat !== prev ? cat : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const r = Number(searchParams.get("rating")) || 0;
    setRatingFilter((prev) => (r !== prev ? r : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const min = Number(searchParams.get("min")) || 0;
    const max = Number(searchParams.get("max")) || 100000;
    setPriceRange((prev) => (min !== prev.min || max !== prev.max ? { min, max } : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const s = searchParams.get("sort") || "relevance";
    setSortBy((prev) => (s !== prev ? s : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /**
   * Debouce Search Input -> Update URL
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams.get("q") || "";
      if (searchInput !== currentQ) {
        setSearchParams(prev => {
          const next = new URLSearchParams(prev);
          if (searchInput) next.set("q", searchInput);
          else next.delete("q");
          return next;
        }, { replace: true });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, searchParams, setSearchParams]);

  const [debouncedFilters, setDebouncedFilters] = useState(() => ({
    categoryFilter,
    searchTerm,
    saleOnly,
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
    ratingFilter,
    sortBy,
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        categoryFilter,
        searchTerm,
        saleOnly,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        ratingFilter,
        sortBy,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [categoryFilter, searchTerm, saleOnly, priceRange.min, priceRange.max, ratingFilter, sortBy]);

  const productParams = useMemo(() => {
    const params = {};

    if (debouncedFilters.categoryFilter) params.category = debouncedFilters.categoryFilter;
    if (debouncedFilters.searchTerm) params.q = debouncedFilters.searchTerm;
    if (debouncedFilters.saleOnly) params.sale = "true";
    if (debouncedFilters.minPrice > 0) params.minPrice = debouncedFilters.minPrice;
    if (debouncedFilters.maxPrice < 100000) params.maxPrice = debouncedFilters.maxPrice;
    if (debouncedFilters.ratingFilter > 0) params.minRating = debouncedFilters.ratingFilter;

    if (debouncedFilters.sortBy !== "relevance") {
      if (debouncedFilters.sortBy === "price-asc") params.sort = "price_asc";
      else if (debouncedFilters.sortBy === "price-desc") params.sort = "price_desc";
      else if (debouncedFilters.sortBy === "rating-desc") params.sort = "rating_desc";
    }

    return params;
  }, [debouncedFilters]);

  const productsQuery = useInfiniteQuery({
    queryKey: qk.products.list(productParams),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get("/api/products", {
        params: { ...productParams, page: pageParam, limit: PAGE_SIZE },
      });
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage?.pagination?.page || 1;
      const totalPages = lastPage?.pagination?.totalPages || 0;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });

  /**
   * Sync filter state to URL parameters
   * Note: We exclude 'searchTerm' (q) here because it is handled by the debounce effect.
   * This effect handles the OTHER filters.
   */
  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      if (categoryFilter) next.set("cat", categoryFilter); else next.delete("cat");
      if (ratingFilter > 0) next.set("rating", String(ratingFilter)); else next.delete("rating");
      if (priceRange.min) next.set("min", String(priceRange.min)); else next.delete("min");
      if (priceRange.max !== 100000) next.set("max", String(priceRange.max)); else next.delete("max");
      if (sortBy !== "relevance") next.set("sort", sortBy); else next.delete("sort");

      // Bail out if nothing would actually change - calling setSearchParams
      // unconditionally on every effect run (even with equivalent content)
      // can make `searchParams`/`setSearchParams` churn to a new reference
      // every render, which - combined with `setSearchParams` being listed
      // as this same effect's own dependency below - becomes a self-driven
      // infinite loop with no user interaction required at all.
      return next.toString() === prev.toString() ? prev : next;
    }, { replace: true });
    // `setSearchParams` intentionally omitted: including it here is what
    // caused the loop above when its reference isn't stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, ratingFilter, priceRange.max, priceRange.min, sortBy]);

  /**
   * No client-side filtering needed - backend handles everything
   * Products array is already filtered and sorted by the backend
   */
  const pages = productsQuery.data?.pages || [];
  const filteredProducts = useMemo(
    () => pages.flatMap((page) => page?.products || []),
    [pages]
  );
  const firstPage = pages[0] || null;
  const activeSale = firstPage?.activeSale || null;
  const loading = productsQuery.isLoading;
  const filterLoading =
    productsQuery.isFetching &&
    !productsQuery.isLoading &&
    !productsQuery.isFetchingNextPage;

  /**
   * Check if product is in wishlist
   */
  const isInWishlist = useCallback(
    (id) => {
      if (!Array.isArray(wishlist) || !wishlist.length) return false;
      return wishlist.some((item) => {
        if (typeof item === "object" && item !== null) {
          return item._id === id || item.id === id;
        }
        return item === id;
      });
    },
    [wishlist]
  );

  /**
   * Toggle product in wishlist
   */
  const toggleWishlistItem = (product) => {
    const exists = isInWishlist(product._id);
    dispatch(toggleWishlist(product));
    showToast(
      exists ? "Removed from Wishlist" : "Added to Wishlist",
      exists ? "error" : "success"
    );
  };

  /**
   * Add product to cart
   */
  const handleAddToCart = useCallback(
    (product) => {
      dispatch(addToCart({ ...product, quantity: 1 }));
      showToast("Added to Cart", "success");
    },
    [dispatch]
  );

  /**
   * Toggle product in comparison list (max 4 products)
   */
  const toggleCompare = useCallback((_id) => {
    setCompare((prev) => {
      if (prev.includes(_id)) return prev.filter((x) => x !== _id);
      if (prev.length >= 4) return prev;
      return [...prev, _id];
    });
  }, []);

  /**
   * Clear all filters and reset to defaults
   */
  const clearAll = () => {
    setSearchInput("");
    // setSearchTerm(""); // Removed: derived from URL
    setCategoryFilter("");
    setRatingFilter(0);
    setPriceRange({ min: 0, max: 100000 });
    setSortBy("relevance");
  };

  const visibleItems = filteredProducts;
  const total = firstPage?.pagination?.total || filteredProducts.length;
  const isSearching = searchInput !== searchTerm;
  const collectionName = formatCollectionName(categoryFilter);
  const mastheadTitle = saleOnly
    ? (activeSale?.name || "Current offers")
    : searchTerm
      ? `Results for “${searchTerm}”`
      : collectionName || "The VKart collection";
  const mastheadEyebrow = saleOnly
    ? "Limited-time offers"
    : searchTerm
      ? "Search results"
      : categoryFilter
        ? "Selected collection"
        : "Curated across tech, style, and life";
  const mastheadCopy = saleOnly
    ? "Save on selected products for a limited time. Prices return to normal when the sale ends."
    : searchTerm
      ? "The closest matches from across the VKart catalogue. Refine the selection with filters below."
      : categoryFilter
        ? COLLECTION_COPY[categoryFilter] || `A considered selection of ${collectionName.toLowerCase()}, chosen for quality, value, and everyday usefulness.`
        : "A considered catalogue of useful technology, personal style, and everyday essentials—without the endless aisle.";

  return (
    <div className="premium-page premium-catalog min-h-screen bg-[#f6f3ed] font-sans selection:bg-[#1d1c19] selection:text-white relative overflow-hidden">
      <AnimStyles />

      <div className="hidden" />
      <div className="hidden" />

      <Helmet>
        <title>{mastheadTitle} | VKart</title>
        <meta name="description" content={mastheadCopy} />
        <link rel="canonical" href="https://vkart.balavardhan.dev/products" />
        <meta property="og:title" content={`${mastheadTitle} | VKart`} />
        <meta property="og:description" content={mastheadCopy} />
        <meta property="og:url" content="https://vkart.balavardhan.dev/products" />
      </Helmet>

      {/* Masthead Section — Compact on mobile */}
      <section className="relative z-10 border-b border-black/[0.08] px-4 py-3.5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-1.5 sm:mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#a85d37]">
              {mastheadEyebrow}
            </p>
            <span className="h-2.5 sm:h-3 w-px bg-black/15" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a857b]">
              {total} {total === 1 ? "item" : "items"}
            </span>
          </div>
          <div className="grid gap-2 sm:gap-5 lg:grid-cols-[1fr_.7fr] lg:items-end lg:gap-12">
            <h1 className="max-w-3xl font-editorial font-bold text-2xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-[#1d1c19]">
              {mastheadTitle}.
            </h1>
            <p className="hidden sm:block max-w-xl text-xs sm:text-sm leading-relaxed text-[#6f6b62] lg:pb-1">
              {mastheadCopy}
            </p>
          </div>
        </div>
      </section>

      {/* Sticky Bar — Sleek & Compact */}
      <div className="sticky top-0 z-40 bg-[#f6f3ed]/90 backdrop-blur-xl border-b border-black/[0.08] transition-all">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <h2 className="font-sans text-xs sm:text-sm font-bold text-[#1d1c19] tracking-tight truncate">
                {categoryFilter ? `${collectionName}` : searchTerm ? "Search Results" : saleOnly ? "Sale Products" : "All Products"}
              </h2>
              <span className="text-xs font-semibold text-slate-400 shrink-0">
                ({total})
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 shadow-2xs active:scale-95 transition-transform"
              >
                <FaFilter className="text-gray-400 text-[10px]" /> Filters
              </button>

              <div className="hidden sm:block w-48">
                <CustomDropdown
                  options={[
                    { value: "relevance", label: "Relevance" },
                    { value: "price-asc", label: "Price: Low to High" },
                    { value: "price-desc", label: "Price: High to Low" },
                    { value: "rating-desc", label: "Top Rated" },
                  ]}
                  value={sortBy}
                  onChange={setSortBy}
                  label="Sort By"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-8 relative z-10">
        <div className="flex gap-8 items-start">

          <div className="hidden lg:block w-72 shrink-0">
            <Sidebar
              categoryFilter={categoryFilter}
              saleOnly={saleOnly}
              searchTerm={searchTerm}
              ratingFilter={ratingFilter}
              onCategoryChange={setCategoryFilter}
              onSearch={setSearchInput}
              onRatingChange={setRatingFilter}
              onPriceChange={(r) => setPriceRange({ min: clamp(r.min, 0, 100000), max: clamp(r.max, 0, 100000) })}
            />
          </div>

          <div className="flex-1 min-w-0">

            {/* Active Sale Banner — Streamlined */}
            {activeSale && (
              <div className="relative mb-3.5 sm:mb-6 overflow-hidden rounded-xl sm:rounded-2xl border border-black/[0.08] bg-[#eee7dd] px-3.5 py-2.5 sm:px-6 sm:py-4 text-[#1d1c19] shadow-2xs animate-fade-up">
                <span className="absolute inset-y-0 left-0 w-1 bg-[#a85d37]" />
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="grid h-8 w-8 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-full border border-black/[0.08] bg-[#fffdf8]">
                      <FaBolt className="text-xs sm:text-sm text-[#a85d37]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.16em] text-[#8a604b] truncate">Limited-time sale</p>
                      <h3 className="font-editorial font-bold text-sm sm:text-xl leading-tight truncate">{activeSale.name}</h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-[#fffdf8] px-2.5 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#5d584f] shrink-0">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#59634f] opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#59634f]" />
                    </span>
                    <span>Live now</span>
                  </span>
                </div>
              </div>
            )}

            {(loading || filterLoading || isSearching) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400 text-xl">
                  <FaSearch />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No products found</h3>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or search terms</p>
                <button
                  onClick={clearAll}
                  className="mt-5 rounded-full bg-[#1d1c19] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-black"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleItems.map((p, i) => {
                  const inWishlist = isInWishlist(p._id);
                  const inCompare = compare.includes(p._id);

                  const price = p.price;
                  const mrp = p.discountPercentage
                    ? price / (1 - p.discountPercentage / 100)
                    : price * 1.2;

                  return (
                    <div
                      key={p._id}
                      className="group relative bg-[#fffdf8] sm:bg-transparent rounded-2xl sm:rounded-none p-2.5 sm:p-0 border border-black/[0.07] sm:border-0 transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 animate-fade-up flex flex-row sm:flex-col gap-3 sm:gap-0 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:shadow-none"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      {/* Thumbnail container — Left side on mobile, Top on desktop */}
                      <div className="relative aspect-square sm:aspect-[3/4] w-28 sm:w-full min-w-[7rem] sm:min-w-0 shrink-0 overflow-hidden rounded-xl sm:rounded-[1.35rem] bg-[#eeebe4] border border-black/[0.06] transition-colors">
                        <Link to={`/product/${p._id}`} className="block w-full h-full">
                          <img
                            src={p.thumbnail}
                            alt={p.title}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-contain p-2 sm:p-4 transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </Link>

                        {/* Top Badges and Heart overlay */}
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex justify-between items-start z-10 pointer-events-none">
                          <div className="flex flex-col gap-1 pointer-events-auto">
                            {p.onSale && (
                              <span className="rounded-full bg-[#75483b] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold text-white">
                                {p.saleName || 'SALE'}
                              </span>
                            )}
                            {p.discountPercentage ? (
                              <span className="bg-white/90 backdrop-blur text-gray-900 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-sm">
                                -{Math.round(p.discountPercentage)}%
                              </span>
                            ) : null}
                          </div>

                          <div className="flex flex-col gap-1.5 sm:gap-2 pointer-events-auto">
                            <button
                              onClick={() => toggleWishlistItem(p)}
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-sm backdrop-blur transition-all ${inWishlist ? "bg-[#efe3d9] text-[#874526]" : "bg-white/90 text-gray-400 hover:bg-white hover:text-[#874526]"
                                }`}
                              aria-label={inWishlist ? `Remove ${p.title} from saved items` : `Save ${p.title}`}
                            >
                              {inWishlist ? <FaHeart size={11} /> : <FaRegHeart size={11} />}
                            </button>

                            <button
                              onClick={() => setQuickView(p)}
                              className="hidden sm:flex w-8 h-8 rounded-full bg-white/90 text-gray-900 lg:text-gray-400 items-center justify-center shadow-sm backdrop-blur hover:bg-white hover:text-gray-900 transition-all translate-x-0 lg:translate-x-10 lg:opacity-100 lg:group-hover:translate-x-0 lg:group-hover:opacity-100"
                              aria-label={`Quick view ${p.title}`}
                            >
                              <FaExpand size={10} />
                            </button>
                          </div>
                        </div>

                        {/* Desktop Hover Add Button */}
                        <div className="hidden sm:block absolute bottom-3 left-3 right-3 
                                      translate-y-12 opacity-0 
                                      group-hover:translate-y-0 group-hover:opacity-100 
                                      transition-all duration-300 z-20">
                          <button
                            onClick={(e) => { e.preventDefault(); handleAddToCart(p); }}
                            className="w-full py-3 bg-[#1d1c19] text-white rounded-full text-xs font-bold shadow-lg hover:bg-black flex items-center justify-center gap-2 active:scale-95 transition-transform"
                          >
                            <FaCartPlus /> Add
                          </button>
                        </div>
                      </div>

                      {/* Content column — Right side on mobile, Bottom on desktop */}
                      <div className="flex-1 flex flex-col justify-between px-0 sm:px-1 pt-0 sm:pt-3 pb-0 sm:pb-1 min-w-0">
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-0.5 sm:mb-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{p.category}</p>
                            <div className="flex items-center gap-1 shrink-0">
                              <FaStar className="text-amber-400 text-[10px]" />
                              <span className="text-[11px] sm:text-xs font-bold text-gray-600">{p.rating}</span>
                            </div>
                          </div>

                          <Link to={`/product/${p._id}`} className="block text-xs sm:text-sm font-bold sm:font-semibold text-[#1d1c19] leading-snug mb-1 line-clamp-2 sm:line-clamp-1 hover:text-[#a85d37] transition-colors">
                            {p.title}
                          </Link>

                          <div className="flex items-baseline gap-1.5 sm:justify-between mt-1 sm:mt-2 flex-wrap">
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              <span className="text-sm sm:text-base font-black text-gray-900">{formatPrice(price)}</span>
                              <span className="text-[11px] sm:text-xs text-gray-400 line-through decoration-gray-300">{formatPrice(mrp)}</span>
                            </div>
                            {p.discountPercentage ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded hidden sm:inline">
                                Save {Math.round(p.discountPercentage)}%
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* Mobile Actions: Compare Checkbox + Full-width Add Button */}
                        <div className="mt-2 sm:mt-2 pt-1 border-t border-black/[0.04] sm:border-0 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <label className="cursor-pointer text-[10px] sm:text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-1 select-none">
                              <input
                                type="checkbox"
                                className="accent-gray-900 w-3 h-3"
                                checked={inCompare}
                                onChange={() => toggleCompare(p._id)}
                              />
                              Compare
                            </label>
                          </div>

                          {/* Mobile-only Add to Cart Button */}
                          <button
                            onClick={(e) => { e.preventDefault(); handleAddToCart(p); }}
                            className="sm:hidden w-full py-1.5 bg-[#1d1c19] text-white rounded-full text-xs font-bold shadow-sm hover:bg-black flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                          >
                            <FaCartPlus size={11} /> Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {productsQuery.hasNextPage && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => productsQuery.fetchNextPage()}
                  disabled={productsQuery.isFetchingNextPage}
                  className="flex items-center gap-2 rounded-full border border-black/10 bg-transparent px-6 py-2.5 text-sm font-bold text-[#1d1c19] transition-colors hover:bg-black/[0.04]"
                >
                  {productsQuery.isFetchingNextPage ? "Loading..." : "Show More"} <FaArrowRight size={10} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Compare Action Bar — centered horizontally with flex container */}
      {compare.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 sm:bottom-6 z-40 flex justify-center pointer-events-none px-4">
          <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 rounded-full border border-white/15 bg-[#1d1c19]/95 backdrop-blur-md px-3 sm:px-5 py-2 sm:py-2.5 text-white shadow-[0_12px_36px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-1.5">
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#a85d37] px-1 text-[10px] font-bold text-white shrink-0">
                {compare.length}
              </span>
              <span className="text-xs font-semibold text-gray-200 hidden xs:inline sm:inline">
                {compare.length === 1 ? "Selected" : "Selected"}
              </span>
            </div>

            <div className="h-3.5 w-px bg-white/20" />

            <button
              onClick={() => setCompare([])}
              className="text-[11px] sm:text-xs text-gray-400 hover:text-white transition-colors px-1"
            >
              Clear
            </button>

            <button
              onClick={() => navigate(`/compare?ids=${compare.join(",")}`)}
              className="rounded-full bg-[#fffdf8] px-3 sm:px-4 py-1.5 text-xs font-bold text-[#1d1c19] transition-all hover:bg-[#eee8df] active:scale-95 shadow-sm shrink-0 flex items-center gap-1.5"
            >
              <span>Compare</span>
              <span className="grid h-4 min-w-4 place-items-center rounded-full bg-[#1d1c19] text-[9px] text-white px-1">
                {compare.length}
              </span>
            </button>
          </div>
        </div>
      )}

      <div className={`fixed inset-0 z-[60] lg:hidden transition-transform duration-300 ${showFilters ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
        <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col border-r border-black/[0.08] bg-[#fffdf8]">
          <div className="flex items-center justify-between border-b border-black/[0.07] bg-[#f3efe8] p-5">
            <h3 className="text-base font-bold text-[#1d1c19]">Refine the collection</h3>
            <button onClick={() => setShowFilters(false)} className="grid h-9 w-9 place-items-center rounded-full border border-black/[0.08] text-[#6f6b62]" aria-label="Close filters"><FaTimes /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <Sidebar
              categoryFilter={categoryFilter}
              saleOnly={saleOnly}
              searchTerm={searchTerm}
              ratingFilter={ratingFilter}
              onCategoryChange={(v) => { setCategoryFilter(v); setShowFilters(false); }}
              onSearch={(v) => { setSearchInput(v); setShowFilters(false); }}
              onRatingChange={(v) => { setRatingFilter(v); setShowFilters(false); }}
              onPriceChange={(r) => setPriceRange({ min: clamp(r.min, 0, 100000), max: clamp(r.max, 0, 100000) })}
            />
          </div>
        </div>
      </div>

      {quickView && (
        <ProductQuickView
          product={quickView}
          onClose={() => setQuickView(null)}
          onAdd={handleAddToCart}
        />
      )}

    </div>
  );
}
