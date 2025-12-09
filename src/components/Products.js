import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { toggleWishlist } from "../redux/wishlistSlice";
import { showToast } from "../utils/toast";
import axios from "./axiosInstance";
import { Helmet } from "react-helmet-async";

// Extracted Components
import Stars from "./Stars";
import ProductSkeleton from "./product/ProductSkeleton";
import ProductQuickView from "./product/ProductQuickView";

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
  FaLayerGroup,
  FaArrowRight,
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

/* ---------- Components ---------- */



/* =================== MAIN COMPONENT =================== */
export default function Products() {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);

  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
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
  const [visible, setVisible] = useState(PAGE_SIZE);

  /**
   * Debounce search input to avoid excessive API calls
   * Updates searchTerm after 500ms of no typing
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  /**
   * Fetch products from backend with all filters applied server-side
   * Backend handles: search, category, price, rating, and sorting
   */
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    (async () => {
      try {
        setFilterLoading(true);

        const params = {
          page: 1,
          limit: 100,
        };

        if (categoryFilter) params.category = categoryFilter;
        if (searchTerm) params.q = searchTerm;
        if (priceRange.min > 0) params.minPrice = priceRange.min;
        if (priceRange.max < 100000) params.maxPrice = priceRange.max;
        if (ratingFilter > 0) params.minRating = ratingFilter;

        if (sortBy !== "relevance") {
          if (sortBy === "price-asc") params.sort = "price_asc";
          else if (sortBy === "price-desc") params.sort = "price_desc";
          else if (sortBy === "rating-desc") params.sort = "rating_desc";
        }

        const res = await axios.get("/api/products", {
          params,
          signal: controller.signal
        });
        const { products: fetchedProducts } = res.data;

        if (isMounted) {
          setProducts(fetchedProducts || []);
        }
      } catch (err) {
        if (err.name !== 'CanceledError') {
          console.error("Fetch error:", err);
          if (isMounted) {
            setProducts([]);
          }
        }
      } finally {
        if (isMounted) {
          setFilterLoading(false);
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [categoryFilter, searchTerm, priceRange, sortBy, ratingFilter]);

  /**
   * Sync filter state to URL parameters
   */
  useEffect(() => {
    const next = new URLSearchParams();
    if (searchTerm) next.set("q", searchTerm);
    if (categoryFilter) next.set("cat", categoryFilter);
    if (ratingFilter > 0) next.set("rating", String(ratingFilter));
    if (priceRange.min) next.set("min", String(priceRange.min));
    if (priceRange.max !== 100000) next.set("max", String(priceRange.max));
    if (sortBy !== "relevance") next.set("sort", sortBy);
    setSearchParams(next, { replace: true });
  }, [searchTerm, categoryFilter, ratingFilter, priceRange, sortBy, setSearchParams]);

  /**
   * No client-side filtering needed - backend handles everything
   * Products array is already filtered and sorted by the backend
   */
  const filteredProducts = useMemo(() => {
    return products;
  }, [products]);

  /**
   * Reset visible items count when filters change
   */
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [searchTerm, categoryFilter, ratingFilter, priceRange, sortBy]);

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
    setSearchTerm("");
    setCategoryFilter("");
    setRatingFilter(0);
    setPriceRange({ min: 0, max: 100000 });
    setSortBy("relevance");
  };

  const visibleItems = filteredProducts.slice(0, visible);
  const total = filteredProducts.length;
  const isSearching = searchInput !== searchTerm;

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-orange-100 selection:text-orange-900 relative overflow-hidden">
      <AnimStyles />

      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-orange-100/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <Helmet>
        <title>Shop Our Collection | VKart</title>
        <meta name="description" content="Browse our extensive collection of electronics, fashion, and essentials. Find the best deals on VKart today." />
        <link rel="canonical" href="https://vkart.balavardhan.dev/products" />
        <meta property="og:title" content="Shop Our Collection | VKart" />
        <meta property="og:description" content="Browse our extensive collection of electronics, fashion, and essentials. Find the best deals on VKart today." />
        <meta property="og:url" content="https://vkart.balavardhan.dev/products" />
      </Helmet>

      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">

            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Our Collection
              </h1>
              <div className="h-6 w-px bg-gray-200 hidden sm:block" />
              <span className="text-sm font-medium text-gray-500 hidden sm:block">
                {total} Items
              </span>
            </div>

            <div className="flex gap-3 items-center w-full md:w-auto">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 shadow-sm active:scale-95 transition-transform"
              >
                <FaFilter className="text-gray-400" /> Filters
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex gap-8 items-start">

          <div className="hidden lg:block w-72 shrink-0">
            <Sidebar
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              onSearch={setSearchInput}
              onRatingChange={setRatingFilter}
              onPriceChange={(r) => setPriceRange({ min: clamp(r.min, 0, 100000), max: clamp(r.max, 0, 100000) })}
            />
          </div>

          <div className="flex-1 min-w-0">
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
                  className="mt-4 px-5 py-2 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-black transition-colors"
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
                      className="group relative bg-white rounded-2xl p-3 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 border border-gray-100 transition-all duration-300 hover:-translate-y-1 animate-fade-up"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-50 group-hover:bg-gray-100 transition-colors">
                        <Link to={`/product/${p._id}`} className="block w-full h-full">
                          <img
                            src={p.thumbnail}
                            alt={p.title}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </Link>

                        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                          {p.discountPercentage ? (
                            <span className="bg-white/90 backdrop-blur text-gray-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                              -{Math.round(p.discountPercentage)}%
                            </span>
                          ) : <div />}

                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => toggleWishlistItem(p)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm backdrop-blur transition-all ${inWishlist ? "bg-red-50 text-red-500" : "bg-white/90 text-gray-400 hover:bg-white hover:text-gray-900"
                                }`}
                            >
                              {inWishlist ? <FaHeart size={12} /> : <FaRegHeart size={12} />}
                            </button>

                            <button
                              onClick={() => setQuickView(p)}
                              className="w-8 h-8 rounded-full bg-white/90 text-gray-400 flex items-center justify-center shadow-sm backdrop-blur hover:bg-white hover:text-gray-900 transition-all translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                            >
                              <FaExpand size={10} />
                            </button>
                          </div>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 
                                      translate-y-0 opacity-100 
                                      lg:translate-y-12 lg:opacity-0 
                                      lg:group-hover:translate-y-0 lg:group-hover:opacity-100 
                                      transition-all duration-300 z-20">
                          <button
                            onClick={(e) => { e.preventDefault(); handleAddToCart(p); }}
                            className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-xs font-bold shadow-lg hover:bg-black flex items-center justify-center gap-2 active:scale-95 transition-transform"
                          >
                            <FaCartPlus /> Add
                          </button>
                        </div>
                      </div>

                      <div className="px-1 pt-3 pb-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{p.category}</p>

                        <Link to={`/product/${p._id}`} className="block text-sm font-bold text-gray-900 leading-snug mb-1 line-clamp-1 hover:text-orange-600 transition-colors">
                          {p.title}
                        </Link>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex flex-col">
                            <span className="text-base font-bold text-gray-900">{formatPrice(price)}</span>
                            <span className="text-xs text-gray-400 line-through decoration-gray-300">{formatPrice(mrp)}</span>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1">
                              <FaStar className="text-amber-400 text-[10px]" />
                              <span className="text-xs font-bold text-gray-600">{p.rating}</span>
                            </div>
                            <label className="cursor-pointer text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-1 select-none">
                              <input
                                type="checkbox"
                                className="accent-gray-900 w-3 h-3"
                                checked={inCompare}
                                onChange={() => toggleCompare(p._id)}
                              />
                              Compare
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {visible < filteredProducts.length && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="px-6 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-900 text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  Show More <FaArrowRight size={10} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {compare.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
          <div className="bg-gray-900 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="bg-white text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded">{compare.length}</span>
              <span className="text-xs font-medium text-gray-300">Selected</span>
            </div>
            <div className="h-3 w-px bg-white/20" />
            <div className="flex items-center gap-2">
              <button onClick={() => setCompare([])} className="text-xs text-gray-400 hover:text-white transition-colors">Clear</button>
              <button
                onClick={() => navigate(`/compare?ids=${compare.join(",")}`)}
                className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors"
              >
                Compare
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`fixed inset-0 z-[60] lg:hidden transition-transform duration-300 ${showFilters ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
        <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-900 text-base">Filters</h3>
            <button onClick={() => setShowFilters(false)} className="p-2 bg-white rounded-full shadow-sm text-gray-500"><FaTimes /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <Sidebar
              categoryFilter={categoryFilter}
              onCategoryChange={(v) => { setCategoryFilter(v); setShowFilters(false); }}
              onSearch={(v) => { setSearchInput(v); setShowFilters(false); }}
              onRatingChange={(v) => { setRatingFilter(v); setShowFilters(false); }}
              onPriceChange={(r) => setPriceRange({ min: clamp(r.min, 0, 100000), max: clamp(r.max, 100000) })}
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