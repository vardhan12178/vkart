import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { FaTimes, FaCartPlus, FaPlus, FaLayerGroup, FaArrowRight, FaCheckCircle, FaTimesCircle, FaTrashAlt } from "react-icons/fa";
import { Sparkles } from "lucide-react";
import axios from "./axiosInstance";

/* ---------- STYLES ---------- */
const GlobalStyles = () => (
  <style>{`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
    
    /* Hide Scrollbar but keep functionality */
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    
    /* Sticky Column Shadow Logic */
    .sticky-col {
      position: sticky;
      left: 0;
      z-index: 30;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
    }
    .sticky-col::after {
      content: "";
      position: absolute;
      top: 0;
      right: -12px; /* Push shadow out */
      bottom: 0;
      width: 12px;
      background: linear-gradient(to right, rgba(0,0,0,0.05), transparent);
      pointer-events: none;
    }
  `}</style>
);

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount ?? 0));

const normalizeIds = (idsStr) =>
  Array.from(
    new Set(
      (idsStr || "")
        .split(",")
        .map((s) => s.trim())
        .filter((x) => x.length > 0)
    )
  ).slice(0, 4);

/* ---------- SKELETON ---------- */
const CompareSkeleton = () => (
  <div className="w-full overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
    <div className="flex gap-8">
      <div className="w-40 shrink-0 space-y-12 pt-32 hidden md:block">
        {[1,2,3,4].map(i => <div key={i} className="h-4 w-24 bg-gray-100 rounded animate-pulse" />)}
      </div>
      <div className="flex-1 flex gap-6 overflow-hidden">
        {[1,2,3].map(i => (
          <div key={i} className="min-w-[260px] space-y-4 animate-pulse">
            <div className="h-48 w-full bg-gray-100 rounded-2xl" />
            <div className="h-6 w-3/4 bg-gray-100 rounded" />
            <div className="h-4 w-1/2 bg-gray-100 rounded" />
            <div className="space-y-2 pt-8">
               <div className="h-4 w-full bg-gray-50 rounded" />
               <div className="h-4 w-full bg-gray-50 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Compare = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [ids, setIds] = useState(() => normalizeIds(searchParams.get("ids")));
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiVerdict, setAiVerdict] = useState(null);
  const [aiVerdictLoading, setAiVerdictLoading] = useState(false);
  const [aiVerdictError, setAiVerdictError] = useState("");

  // Sync URL
  useEffect(() => {
    const next = new URLSearchParams();
    if (ids.length) next.set("ids", ids.join(","));
    setSearchParams(next, { replace: true });
  }, [ids, setSearchParams]);

  // Fetch Data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (ids.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // In a real app, you might have a bulk fetch endpoint. 
        // Here we fetch individually for compatibility.
        const proms = ids.map((id) =>
          axios.get(`/api/products/${id}`).then((res) => res.data).catch(() => null)
        );
        const results = await Promise.all(proms);
        if (!cancelled) setItems(results.filter(Boolean)); // Filter out failed fetches
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ids]);

  // The AI verdict is tied to a specific product set — clear it whenever
  // that set changes so a stale verdict never lingers for a different
  // comparison.
  useEffect(() => {
    setAiVerdict(null);
    setAiVerdictError("");
  }, [ids]);

  const fetchAiVerdict = useCallback(async () => {
    if (items.length < 2) return;
    setAiVerdictLoading(true);
    setAiVerdictError("");
    try {
      const res = await axios.post("/api/ai/compare", { ids: items.map((p) => p._id) });
      setAiVerdict(res.data);
    } catch (err) {
      setAiVerdictError("Couldn't generate a comparison right now. Please try again.");
    } finally {
      setAiVerdictLoading(false);
    }
  }, [items]);

  const removeId = useCallback((id) => setIds((prev) => prev.filter((x) => x !== id)), []);
  const clearAll = useCallback(() => setIds([]), []);
  const add = useCallback((p) => {
      dispatch(addToCart({ ...p, quantity: 1 }));
      // We assume a toast utility exists based on context
      // showToast("Added to cart", "success"); 
  }, [dispatch]);

  // --- EMPTY STATE ---
  if (!ids.length) {
    return (
      <div className="premium-page premium-compare premium-compare-hero min-h-screen bg-[#f6f3ed] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <GlobalStyles />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-100/40 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-orange-900/5 p-10 text-center animate-fade-in border border-white">
          <div className="w-20 h-20 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30 rotate-3 text-white text-3xl">
            <FaLayerGroup />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Compare Products</h1>
          <p className="text-gray-500 mb-8 leading-relaxed text-sm">
            Select products to see a detailed side-by-side comparison of specs, prices, and features.
          </p>
          <Link
            to="/products"
            className="group relative w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-xl hover:scale-[1.02] transition-all active:scale-[0.98]"
          >
            <span>Browse Collection</span>
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" size={12} />
          </Link>
        </div>
      </div>
    );
  }

  // --- MAIN UI ---
  return (
    <div className="premium-page premium-compare min-h-screen bg-[#f6f3ed] font-sans text-[#1d1c19] pb-20 selection:bg-[#1d1c19] selection:text-white">
      <GlobalStyles />
      
      {/* Header Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 py-3 sm:py-4 px-4 sm:px-8 mb-4 sm:mb-8 transition-all">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <Link to="/products" className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors shrink-0">
               <FaArrowRight className="rotate-180 text-xs sm:text-sm" />
            </Link>
            <div>
               <h1 className="compare-header-title font-editorial font-bold text-gray-900 tracking-tight leading-none">Compare</h1>
               <span className="text-[10px] sm:text-xs font-medium text-gray-400 block mt-0.5 whitespace-nowrap">
                 {items.length} {items.length === 1 ? "Item" : "Items"} Selected
               </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {items.length < 4 && (
                <button 
                  onClick={() => navigate("/products")}
                  className="flex items-center gap-1.5 px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-gray-900 text-white text-[11px] sm:text-xs font-bold shadow-sm hover:bg-black transition-all"
                >
                  <FaPlus size={10} /> <span>Add <span className="hidden sm:inline">Product</span></span>
                </button>
            )}
            <button 
              onClick={clearAll}
              className="h-8 w-8 sm:w-auto sm:h-auto px-0 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-red-100 bg-red-50 text-[11px] sm:text-xs font-bold text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5 shrink-0"
              title="Clear All"
              aria-label="Clear all compared products"
            >
              <FaTrashAlt size={11} /> <span className="hidden sm:inline">Clear All</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8">

        {/* AI Comparison — opt-in via button, sits above the spec table */}
        {!loading && items.length >= 2 && (
          <div className="mb-4 sm:mb-6">
            {!aiVerdict && !aiVerdictLoading && (
              <button
                type="button"
                onClick={fetchAiVerdict}
                className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-gray-900 text-white text-[11px] sm:text-xs font-bold px-4 py-2.5 sm:px-5 sm:py-3 shadow-lg hover:bg-black transition-all"
              >
                <Sparkles size={13} /> Get AI Comparison
              </button>
            )}

            {aiVerdictLoading && (
              <div className="rounded-xl sm:rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm animate-pulse">
                <div className="h-4 w-32 sm:w-40 bg-gray-100 rounded mb-3" />
                <div className="h-3 w-full bg-gray-100 rounded mb-2" />
                <div className="h-3 w-2/3 bg-gray-100 rounded" />
              </div>
            )}

            {aiVerdictError && (
              <p className="text-xs font-semibold text-red-500 mt-2">{aiVerdictError}</p>
            )}

            {aiVerdict?.available && (
              <div className="rounded-xl sm:rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2 text-xs sm:text-sm">
                    <Sparkles size={14} className="text-orange-500" /> AI Comparison
                  </h3>
                  <button type="button" onClick={() => setAiVerdict(null)} className="text-[11px] sm:text-xs font-bold text-gray-400 hover:text-gray-600">
                    Hide
                  </button>
                </div>

                {aiVerdict.overallReason && (
                  <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-100">
                    <span className="font-bold text-gray-900">
                      Overall pick: {items.find((p) => p._id === aiVerdict.overallPickId)?.title || "—"}.
                    </span>{" "}
                    {aiVerdict.overallReason}
                  </p>
                )}

                {aiVerdict.perProduct?.length > 0 && (
                  <ul className="space-y-1.5 sm:space-y-2">
                    {aiVerdict.perProduct.map((row) => {
                      const p = items.find((it) => it._id === row.id);
                      if (!p || !row.bestFor) return null;
                      return (
                        <li key={row.id} className="text-xs sm:text-sm text-gray-600">
                          <span className="font-bold text-gray-900">{p.title}: </span>
                          {row.bestFor}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile Swipe Cue */}
        {!loading && (
          <div className="sm:hidden flex items-center justify-between text-[11px] font-medium text-gray-400 mb-2 px-1">
            <span>Attributes</span>
            <span className="flex items-center gap-1">Swipe to compare products →</span>
          </div>
        )}

        {loading ? (
           <CompareSkeleton />
        ) : (
          <div className="relative rounded-2xl sm:rounded-3xl border border-gray-200/60 bg-white shadow-xl shadow-gray-200/40 overflow-hidden">
            
            {/* Scrollable Table Container */}
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full min-w-max border-collapse text-left">
                
                {/* --- HEADER ROW (Product Cards) --- */}
                <thead>
                  <tr>
                    {/* Sticky Label Cell */}
                    <th className="sticky-col w-28 sm:w-48 md:w-64 min-w-[100px] sm:min-w-[160px] p-3 sm:p-6 border-b border-gray-100 align-bottom">
                      <div className="h-full flex flex-col justify-end pb-1 sm:pb-2">
                         <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Product</span>
                      </div>
                    </th>
                    
                    {/* Product Columns */}
                    {ids.map((id, idx) => {
                      const item = items.find(p => p._id === id);
                      return (
                        <th key={id} className="w-[180px] min-w-[180px] sm:w-[280px] sm:min-w-[280px] p-3 sm:p-6 border-b border-gray-100 align-top bg-white">
                          {item ? (
                            <div className="relative flex flex-col h-full group">
                              {/* Remove Button */}
                              <button 
                                onClick={() => removeId(id)}
                                className="absolute -top-1.5 -right-1.5 sm:-top-3 sm:-right-3 z-10 h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                                aria-label="Remove product from comparison"
                              >
                                <FaTimes size={10} />
                              </button>
                              
                              <div className="relative w-full shrink-0 grow-0 mb-2 sm:mb-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-50 transition-colors group-hover:border-gray-200" style={{ paddingBottom: "75%" }}>
                                <img
                                  src={item.thumbnail}
                                  alt=""
                                  className="absolute inset-0 h-full w-full object-contain p-2 sm:p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                                />
                              </div>
                              
                              {/* Title & CTA */}
                              <div className="flex-1 flex flex-col">
                                <Link to={`/product/${item._id}`} className="text-xs sm:text-base font-bold text-gray-900 leading-snug mb-1 sm:mb-2 hover:text-orange-600 transition-colors line-clamp-2 min-h-[2rem] sm:min-h-[2.75rem]">
                                  {item.title}
                                </Link>
                                <div className="mt-auto pt-2 sm:pt-3">
                                   <button
                                     onClick={() => add(item)}
                                     className="w-full py-2 sm:py-3 px-2 rounded-lg sm:rounded-xl bg-gray-900 text-white text-[10px] sm:text-xs font-bold shadow-md hover:bg-black transition-transform active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2"
                                   >
                                     <FaCartPlus /> <span>Add to Cart</span>
                                   </button>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </th>
                      );
                    })}

                    {/* Add Slot (if < 4 items) */}
                    {ids.length < 4 && (
                        <th className="w-[180px] min-w-[180px] sm:w-[280px] sm:min-w-[280px] p-3 sm:p-6 border-b border-gray-100 align-middle bg-white">
                           <button 
                             onClick={() => navigate("/products")}
                             className="w-full aspect-[3/4] rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 sm:gap-3 text-gray-400 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50/50 transition-all group"
                           >
                              <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center text-sm sm:text-lg transition-colors shadow-sm">
                                 <FaPlus />
                              </div>
                              <span className="text-xs sm:text-sm font-bold">Add Product</span>
                           </button>
                        </th>
                    )}
                  </tr>
                </thead>

                {/* --- DATA ROWS --- */}
                <tbody className="divide-y divide-gray-50 text-xs sm:text-sm">
                  
                  {/* Price */}
                  <tr className="group hover:bg-gray-50/50 transition-colors">
                    <td className="sticky-col p-3 sm:p-6 font-bold text-gray-900">Price</td>
                    {ids.map((id) => {
                       const item = items.find(p => p._id === id);
                       return (
                         <td key={id} className="p-3 sm:p-6 align-middle">
                           {item && (
                             <div>
                               <span className="text-sm sm:text-xl font-black text-gray-900">{formatPrice(item.price)}</span>
                               {item.discountPercentage > 0 && (
                                 <div className="text-[10px] sm:text-xs font-bold text-green-600 mt-0.5 sm:mt-1">
                                   Save {Math.round(item.discountPercentage)}%
                                 </div>
                               )}
                             </div>
                           )}
                         </td>
                       );
                    })}
                    {ids.length < 4 && <td className="p-3 sm:p-6"></td>}
                  </tr>

                  {/* Rating */}
                  <tr className="group hover:bg-gray-50/50 transition-colors">
                    <td className="sticky-col p-3 sm:p-6 font-bold text-gray-500">Rating</td>
                    {ids.map((id) => {
                       const item = items.find(p => p._id === id);
                       return (
                         <td key={id} className="p-3 sm:p-6 align-middle">
                           {item ? (
                             <div className="flex items-center gap-1.5 sm:gap-2">
                               <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold">
                                 ★ {item.rating}
                               </span>
                               <span className="text-[10px] sm:text-xs text-gray-400 font-medium hidden sm:inline">User Rating</span>
                             </div>
                           ) : "—"}
                         </td>
                       );
                    })}
                    {ids.length < 4 && <td className="p-3 sm:p-6"></td>}
                  </tr>

                  {/* Brand */}
                  <tr className="group hover:bg-gray-50/50 transition-colors">
                    <td className="sticky-col p-3 sm:p-6 font-bold text-gray-500">Brand</td>
                    {ids.map((id) => {
                       const item = items.find(p => p._id === id);
                       return (
                         <td key={id} className="p-3 sm:p-6 align-middle font-medium text-gray-700">
                           {item?.brand || "—"}
                         </td>
                       );
                    })}
                    {ids.length < 4 && <td className="p-3 sm:p-6"></td>}
                  </tr>

                  {/* Category */}
                  <tr className="group hover:bg-gray-50/50 transition-colors">
                    <td className="sticky-col p-3 sm:p-6 font-bold text-gray-500">Category</td>
                    {ids.map((id) => {
                       const item = items.find(p => p._id === id);
                       return (
                         <td key={id} className="p-3 sm:p-6 align-middle">
                           {item ? (
                             <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] sm:text-xs font-bold uppercase tracking-wide">
                               {item.category}
                             </span>
                           ) : "—"}
                         </td>
                       );
                    })}
                    {ids.length < 4 && <td className="p-3 sm:p-6"></td>}
                  </tr>

                  {/* Availability */}
                  <tr className="group hover:bg-gray-50/50 transition-colors">
                    <td className="sticky-col p-3 sm:p-6 font-bold text-gray-500">Availability</td>
                    {ids.map((id) => {
                       const item = items.find(p => p._id === id);
                       return (
                         <td key={id} className="p-3 sm:p-6 align-middle">
                           {item ? (
                             item.stock > 0 ? (
                               <div className="flex items-center gap-1 sm:gap-1.5 text-green-600 font-bold text-xs sm:text-sm">
                                 <FaCheckCircle size={12} /> <span>In Stock</span>
                                </div>
                             ) : (
                               <div className="flex items-center gap-1 sm:gap-1.5 text-red-500 font-bold text-xs sm:text-sm">
                                 <FaTimesCircle size={12} /> <span>Out of Stock</span>
                                </div>
                             )
                           ) : "—"}
                         </td>
                       );
                    })}
                    {ids.length < 4 && <td className="p-3 sm:p-6"></td>}
                  </tr>

                  {/* Description */}
                  <tr className="group hover:bg-gray-50/50 transition-colors">
                    <td className="sticky-col p-3 sm:p-6 font-bold text-gray-500 align-top pt-4 sm:pt-8">Summary</td>
                    {ids.map((id) => {
                       const item = items.find(p => p._id === id);
                       return (
                         <td key={id} className="p-3 sm:p-6 align-top">
                           <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-3 sm:line-clamp-4">
                             {item?.description || "—"}
                           </p>
                         </td>
                       );
                    })}
                    {ids.length < 4 && <td className="p-3 sm:p-6"></td>}
                  </tr>

                  {/* Warranty */}
                  <tr className="group hover:bg-gray-50/50 transition-colors">
                    <td className="sticky-col p-3 sm:p-6 font-bold text-gray-500">Warranty</td>
                    {ids.map((id) => {
                       const item = items.find(p => p._id === id);
                       return (
                         <td key={id} className="p-3 sm:p-6 align-middle font-medium text-gray-700">
                           {item?.warrantyInformation || "1 Year Standard"}
                         </td>
                       );
                    })}
                    {ids.length < 4 && <td className="p-3 sm:p-6"></td>}
                  </tr>

                  {/* Return Policy */}
                  <tr className="group hover:bg-gray-50/50 transition-colors">
                    <td className="sticky-col p-3 sm:p-6 font-bold text-gray-500">Returns</td>
                    {ids.map((id) => {
                       const item = items.find(p => p._id === id);
                       return (
                         <td key={id} className="p-3 sm:p-6 align-middle font-medium text-gray-700">
                           {item?.returnPolicy || "7 Day Returns"}
                         </td>
                       );
                    })}
                    {ids.length < 4 && <td className="p-3 sm:p-6"></td>}
                  </tr>

                  {/* Dimensions / Weight */}
                  <tr className="group hover:bg-gray-50/50 transition-colors">
                    <td className="sticky-col p-3 sm:p-6 font-bold text-gray-500">Dimensions</td>
                    {ids.map((id) => {
                       const item = items.find(p => p._id === id);
                       const dim = item?.dimensions;
                       return (
                         <td key={id} className="p-3 sm:p-6 align-middle text-xs sm:text-sm text-gray-600">
                           {dim ? `${dim.width} × ${dim.height} × ${dim.depth} cm` : "—"}
                           {item?.weight ? <span className="block text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">{item.weight} g</span> : null}
                         </td>
                       );
                    })}
                    {ids.length < 4 && <td className="p-3 sm:p-6"></td>}
                  </tr>

                  {/* Best Value Highlight */}
                  {items.length >= 2 && (() => {
                    const best = items.reduce((a, b) => {
                      const scoreA = (a.rating || 0) / Math.max(a.price, 1);
                      const scoreB = (b.rating || 0) / Math.max(b.price, 1);
                      return scoreB > scoreA ? b : a;
                    });
                    return (
                      <tr className="bg-emerald-50/50">
                        <td className="sticky-col p-3 sm:p-6 font-bold text-emerald-700">Best Value</td>
                        {ids.map((id) => {
                          const item = items.find(p => p._id === id);
                          const isBest = item?._id === best?._id;
                          return (
                            <td key={id} className="p-3 sm:p-6 align-middle">
                              {item && isBest ? (
                                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-bold rounded-full">
                                  <FaCheckCircle size={10} /> <span>Best Pick</span>
                                </span>
                              ) : null}
                            </td>
                          );
                        })}
                        {ids.length < 4 && <td className="p-3 sm:p-6"></td>}
                      </tr>
                    );
                  })()}

                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;
