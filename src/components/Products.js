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
  FaLayerGroup,
  FaArrowRight,
  FaMagic
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

const Stars = ({ value }) => {
  const rounded = Math.round(value * 2) / 2;
  return (
    <div className="flex items-center gap-0.5 text-amber-400 text-xs">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i + 1 <= Math.floor(rounded)) return <FaStar key={i} />;
        if (i + 0.5 === rounded) return <FaStarHalfAlt key={i} />;
        return <FaRegStar key={i} className="text-gray-200" />;
      })}
    </div>
  );
};

const CardSkeleton = () => (
  <div className="relative overflow-hidden rounded-2xl bg-white p-3 shadow-sm border border-gray-100">
    <div className="aspect-[3/4] w-full rounded-xl bg-gray-100 animate-pulse" />
    <div className="mt-4 space-y-2">
      <div className="h-3 w-1/3 rounded-full bg-gray-100 animate-pulse" />
      <div className="h-4 w-3/4 rounded-full bg-gray-100 animate-pulse" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-5 w-20 rounded-lg bg-gray-100 animate-pulse" />
        <div className="h-6 w-6 rounded-full bg-gray-100 animate-pulse" />
      </div>
    </div>
  </div>
);

const QuickView = ({ product, onClose, onAdd }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const images = product?.images?.length ? product.images : [product?.thumbnail].filter(Boolean);

  useEffect(() => {
    if (!product) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, [product]);

  if (!product) return null;

  const price = product.price;
  const mrp = product.discountPercentage
    ? price / (1 - product.discountPercentage / 100)
    : price * 1.2;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-scale-in flex flex-col md:flex-row max-h-[90vh]">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-gray-100 transition-colors"
        >
          <FaTimes size={18} className="text-gray-500" />
        </button>

        <div className="w-full md:w-1/2 bg-gray-50 p-6 flex flex-col justify-between relative">
           <div className="flex-1 flex items-center justify-center relative">
             <img 
               src={images[activeIdx]} 
               alt={product.title} 
               className="max-h-[350px] w-full object-contain mix-blend-multiply"
             />
             {product.discountPercentage && (
                <span className="absolute top-4 left-4 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                  -{Math.round(product.discountPercentage)}%
                </span>
             )}
           </div>
           
           {images.length > 1 && (
             <div className="flex gap-3 overflow-x-auto py-4 px-2 justify-center scrollbar-hide">
               {images.map((src, idx) => (
                 <button
                   key={idx}
                   onClick={() => setActiveIdx(idx)}
                   className={`h-14 w-14 rounded-lg border-2 flex-shrink-0 overflow-hidden transition-all ${
                     idx === activeIdx ? "border-gray-900" : "border-transparent opacity-60 hover:opacity-100"
                   }`}
                 >
                   <img src={src} alt="" className="h-full w-full object-cover bg-white" />
                 </button>
               ))}
             </div>
           )}
        </div>

        <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-white">
          <div className="mb-2 text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <FaLayerGroup /> {product.category}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">{product.title}</h2>
          
          <div className="flex items-center gap-3 mb-6">
             <Stars value={product.rating} />
             <span className="text-xs text-gray-300">|</span>
             <span className={`text-xs font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
               {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
             </span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(price)}</span>
            <span className="text-lg text-gray-300 line-through">{formatPrice(mrp)}</span>
          </div>

          <p className="text-sm text-gray-500 leading-relaxed mb-8 line-clamp-4">{product.description}</p>

          <div className="mt-auto">
            <button
              onClick={() => onAdd(product)}
              className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-lg hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <FaCartPlus /> Add to Cart
            </button>
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
  const [page, setPage] = useState(1);
const [totalProducts, setTotalProducts] = useState(0);
const [hasMore, setHasMore] = useState(true);
const [filterLoading, setFilterLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("cat") || "");
  
  // --- NEW: Separate State for Rating Filter ---
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

  // --- FETCHING ---
// Fetch products with pagination
useEffect(() => {
  (async () => {
    try {
      setFilterLoading(true); //  Show mini loader
      
      const params = {
        page: 1,
        limit: 100,
      };
      
      if (categoryFilter) params.category = categoryFilter;
      if (searchTerm) params.q = searchTerm;
      if (priceRange.min > 0) params.minPrice = priceRange.min;
      if (priceRange.max < 100000) params.maxPrice = priceRange.max;
      if (sortBy !== "relevance") {
        if (sortBy === "price-asc") params.sort = "price_asc";
        else if (sortBy === "price-desc") params.sort = "price_desc";
      }
      
      const res = await axios.get("/api/products", { params });
      const { products: fetchedProducts, pagination } = res.data;
      
      setProducts(fetchedProducts || []);
      setTotalProducts(pagination?.total || 0);
    } catch (err) {
      console.error("Fetch error:", err);
      setProducts([]);
    } finally {
      setFilterLoading(false); //  Hide loader
      setLoading(false);
    }
  })();
}, [categoryFilter, searchTerm, priceRange, sortBy]);

  // --- URL PARAMS UPDATE ---
  useEffect(() => {
    const next = new URLSearchParams();
    if (searchTerm) next.set("q", searchTerm);
    if (categoryFilter) next.set("cat", categoryFilter);
    // Sync rating filter to URL
    if (ratingFilter > 0) next.set("rating", String(ratingFilter));
    
    if (priceRange.min) next.set("min", String(priceRange.min));
    if (priceRange.max !== 100000) next.set("max", String(priceRange.max));
    if (sortBy !== "relevance") next.set("sort", sortBy);
    setSearchParams(next, { replace: true });
  }, [searchTerm, categoryFilter, ratingFilter, priceRange, sortBy, setSearchParams]);

  // --- FILTERING LOGIC ---
  const filteredProducts = useMemo(() => {
    let list = products.slice();
    
    // 1. Search Filter (Title/Desc only)
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((p) => `${p.title} ${p.description}`.toLowerCase().includes(q));
    }

    // 2. Rating Filter (Now separated)
    if (ratingFilter > 0) {
       list = list.filter((p) => p.rating >= ratingFilter);
    }

    // 3. Category Filter
    if (categoryFilter) list = list.filter((p) => p.category === categoryFilter);
    
    // 4. Price Filter
    list = list.filter((p) => p.price >= priceRange.min && p.price <= priceRange.max);
    
    // 5. Sorting
    switch (sortBy) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating-desc": list.sort((a, b) => b.rating - a.rating); break;
      default: break;
    }
    return list;
  }, [products, searchTerm, categoryFilter, ratingFilter, priceRange, sortBy]);

  useEffect(() => setVisible(PAGE_SIZE), [searchTerm, categoryFilter, ratingFilter, priceRange, sortBy]);

  // --- ACTIONS ---
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

  const toggleWishlistItem = (product) => {
    const exists = isInWishlist(product._id);      
    dispatch(toggleWishlist(product));
    showToast(
      exists ? "Removed from Wishlist" : "Added to Wishlist",
      exists ? "error" : "success"
    );
  };

  const handleAddToCart = useCallback(
    (product) => {
      dispatch(addToCart({ ...product, quantity: 1 }));
      showToast("Added to Cart", "success");
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
    setRatingFilter(0); // Reset Rating
    setPriceRange({ min: 0, max: 100000 });
    setSortBy("relevance");
  };

  const visibleItems = filteredProducts.slice(0, visible);
  const total = filteredProducts.length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-orange-100 selection:text-orange-900 relative overflow-hidden">
      <AnimStyles />
      
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-orange-100/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

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

              <div className="relative flex-1 md:w-80 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                </div>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all text-sm font-medium"
                />
              </div>

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
                onSearch={setSearchTerm}
                // --- Pass the Rating Handler ---
                onRatingChange={setRatingFilter}
                onPriceChange={(r) => setPriceRange({ min: clamp(r.min, 0, 100000), max: clamp(r.max, 0, 100000) })}
              />
          </div>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400 text-xl">
                  <FaSearch />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No products found</h3>
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
                    ? price / (1 - p.discountPercentage/100)
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
                                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm backdrop-blur transition-all ${
                                  inWishlist ? "bg-red-50 text-red-500" : "bg-white/90 text-gray-400 hover:bg-white hover:text-gray-900"
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

      <button
        onClick={() => alert("AI Assistant feature coming soon!")}
        className="fixed bottom-8 right-8 z-30 h-12 w-12 rounded-full bg-gray-900 text-white shadow-xl shadow-gray-900/20 flex items-center justify-center hover:scale-110 transition-transform"
      >
        <FaMagic size={16} />
      </button>
      
      {/* RESTORED COMPARE DOCK */}
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
                onSearch={(v) => { setSearchTerm(v); setShowFilters(false); }}
                // --- Pass the Rating Handler to Mobile Drawer too ---
                onRatingChange={(v) => { setRatingFilter(v); setShowFilters(false); }}
                onPriceChange={(r) => setPriceRange({ min: clamp(r.min, 0, 100000), max: clamp(r.max, 0, 100000) })}
              />
          </div>
        </div>
      </div>
 {quickView && (
        <QuickView
          product={quickView}
          onClose={() => setQuickView(null)}
          onAdd={handleAddToCart}
        />
      )}

    </div>
  );
}