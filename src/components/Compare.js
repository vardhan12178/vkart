import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { FaTimes, FaCartPlus, FaPlus, FaLayerGroup, FaArrowRight, FaCheckCircle, FaTimesCircle, FaTrashAlt } from "react-icons/fa";
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
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
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-800 pb-20 selection:bg-orange-100 selection:text-orange-900">
      <GlobalStyles />
      
      {/* Header Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 py-4 px-4 sm:px-8 mb-8 transition-all">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/products" className="h-10 w-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">
               <FaArrowRight className="rotate-180" size={14} />
            </Link>
            <div>
               <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">Compare</h1>
               <span className="text-xs font-medium text-gray-400">
                 {items.length} Items Selected
               </span>
            </div>
          </div>
          
          <div className="flex gap-3">
            {items.length < 4 && (
                <button 
                  onClick={() => navigate("/products")}
                  className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-bold shadow-lg hover:bg-black transition-all"
                >
                  <FaPlus /> Add Product
                </button>
            )}
            <button 
              onClick={clearAll}
              className="px-4 py-2.5 rounded-xl border border-red-100 bg-red-50 text-xs font-bold text-red-500 hover:bg-red-100 transition-colors flex items-center gap-2"
            >
              <FaTrashAlt size={12} /> <span className="hidden sm:inline">Clear All</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {loading ? (
           <CompareSkeleton />
        ) : (
          <div className="relative rounded-3xl border border-gray-200/60 bg-white shadow-xl shadow-gray-200/40 overflow-hidden">
            
            {/* Scrollable Table Container */}
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full min-w-max border-collapse text-left">
                
                {/* --- HEADER ROW (Product Cards) --- */}
                <thead>
                  <tr>
                    {/* Sticky Label Cell */}
                    <th className="sticky-col w-48 md:w-64 min-w-[160px] p-6 border-b border-gray-100 align-bottom">
                      <div className="h-full flex flex-col justify-end pb-2">
                         <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Details</span>
                      </div>
                    </th>
                    
                    {/* Product Columns */}
                    {ids.map((id, idx) => {
                      const item = items.find(p => p._id === id);
                      return (
                        <th key={id} className="w-[280px] min-w-[280px] p-6 border-b border-gray-100 align-top bg-white">
                          {item ? (
                            <div className="relative flex flex-col h-full group">
                              {/* Remove Button */}
                              <button 
                                onClick={() => removeId(id)}
                                className="absolute -top-3 -right-3 z-10 h-8 w-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                              >
                                <FaTimes size={12} />
                              </button>
                              
                              {/* Image */}
                              <div className="aspect-[4/3] w-full flex items-center justify-center mb-4 bg-gray-50 rounded-2xl p-4 border border-gray-50 transition-colors group-hover:border-gray-200">
                                <img 
                                  src={item.thumbnail} 
                                  alt="" 
                                  className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" 
                                />
                              </div>
                              
                              {/* Title & CTA */}
                              <div className="flex-1 flex flex-col">
                                <Link to={`/product/${item._id}`} className="text-base font-bold text-gray-900 leading-snug mb-2 hover:text-orange-600 transition-colors line-clamp-2">
                                  {item.title}
                                </Link>
                                <div className="mt-auto pt-3">
                                   <button
                                     onClick={() => add(item)}
                                     className="w-full py-3 rounded-xl bg-gray-900 text-white text-xs font-bold shadow-md hover:bg-black transition-transform active:scale-95 flex items-center justify-center gap-2"
                                   >
                                     <FaCartPlus /> Add to Cart
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
                        <th className="w-[280px] min-w-[280px] p-6 border-b border-gray-100 align-middle bg-white">
                           <button 
                             onClick={() => navigate("/products")}
                             className="w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50/50 transition-all group"
                           >
                              <div className="h-12 w-12 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center text-lg transition-colors shadow-sm">
                                 <FaPlus />
                              </div>
                              <span className="text-sm font-bold">Add Product</span>
                           </button>
                        </th>
                    )}
                  </tr>
                </thead>

                {/* --- DATA ROWS --- */}
                <tbody className="divide-y divide-gray-50">
                  
                  {/* Price */}
                  <tr className="group hover:bg-gray-50/50 transition-colors">
                    <td className="sticky-col p-6 text-sm font-bold text-gray-900">Price</td>
                    {ids.map((id) => {
                       const item = items.find(p => p._id === id);
                       return (
                         <td key={id} className="p-6 align-middle">
                           {item && (
                             <div>
                               <span className="text-xl font-black text-gray-900">{formatPrice(item.price)}</span>
                               {item.discountPercentage > 0 && (
                                 <div className="text-xs font-bold text-green-600 mt-1">
                                   Save {Math.round(item.discountPercentage)}%
                                 </div>
                               )}
                             </div>
                           )}
                         </td>
                       );
                    })}
                    {ids.length < 4 && <td className="p-6"></td>}
                  </tr>

                  {/* Rating */}
                  <tr className="group hover:bg-gray-50/50 transition-colors">
                    <td className="sticky-col p-6 text-sm font-bold text-gray-500">Rating</td>
                    {ids.map((id) => {
                       const item = items.find(p => p._id === id);
                       return (
                         <td key={id} className="p-6 align-middle">
                           {item ? (
                             <div className="flex items-center gap-2">
                               <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg text-xs font-bold">
                                 ★ {item.rating}
                               </span>
                               <span className="text-xs text-gray-400 font-medium">User Rating</span>
                             </div>
                           ) : "—"}
                         </td>
                       );
                    })}
                    {ids.length < 4 && <td className="p-6"></td>}
                  </tr>

                  {/* Brand */}
                  <tr className="group hover:bg-gray-50/50 transition-colors">
                    <td className="sticky-col p-6 text-sm font-bold text-gray-500">Brand</td>
                    {ids.map((id) => {
                       const item = items.find(p => p._id === id);
                       return (
                         <td key={id} className="p-6 align-middle text-sm font-medium text-gray-700">
                           {item?.brand || "—"}
                         </td>
                       );
                    })}
                    {ids.length < 4 && <td className="p-6"></td>}
                  </tr>

                  {/* Category */}
                  <tr className="group hover:bg-gray-50/50 transition-colors">
                    <td className="sticky-col p-6 text-sm font-bold text-gray-500">Category</td>
                    {ids.map((id) => {
                       const item = items.find(p => p._id === id);
                       return (
                         <td key={id} className="p-6 align-middle">
                           {item ? (
                             <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wide">
                               {item.category}
                             </span>
                           ) : "—"}
                         </td>
                       );
                    })}
                    {ids.length < 4 && <td className="p-6"></td>}
                  </tr>

                  {/* Availability */}
                  <tr className="group hover:bg-gray-50/50 transition-colors">
                    <td className="sticky-col p-6 text-sm font-bold text-gray-500">Availability</td>
                    {ids.map((id) => {
                       const item = items.find(p => p._id === id);
                       return (
                         <td key={id} className="p-6 align-middle">
                           {item ? (
                             item.stock > 0 ? (
                               <div className="flex items-center gap-1.5 text-green-600 font-bold text-sm">
                                 <FaCheckCircle size={14} /> In Stock
                               </div>
                             ) : (
                               <div className="flex items-center gap-1.5 text-red-500 font-bold text-sm">
                                 <FaTimesCircle size={14} /> Out of Stock
                               </div>
                             )
                           ) : "—"}
                         </td>
                       );
                    })}
                    {ids.length < 4 && <td className="p-6"></td>}
                  </tr>

                  {/* Description */}
                  <tr className="group hover:bg-gray-50/50 transition-colors">
                    <td className="sticky-col p-6 text-sm font-bold text-gray-500 align-top pt-8">Summary</td>
                    {ids.map((id) => {
                       const item = items.find(p => p._id === id);
                       return (
                         <td key={id} className="p-6 align-top">
                           <p className="text-sm text-gray-500 leading-relaxed line-clamp-4">
                             {item?.description || "—"}
                           </p>
                         </td>
                       );
                    })}
                    {ids.length < 4 && <td className="p-6"></td>}
                  </tr>

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