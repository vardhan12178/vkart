import React, { useEffect, useMemo, useState } from "react";
import axios from "./axiosInstance";
import {
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaStar,
  FaCheck,
  FaUndo,
  FaLayerGroup,
  FaCircle
} from "react-icons/fa";

// 1. Added 'onRatingChange' to props
export default function Sidebar({ categoryFilter, onCategoryChange, onSearch, onRatingChange }) {
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [catError, setCatError] = useState(null);
  const [showAllCats, setShowAllCats] = useState(false);
  const [expanded, setExpanded] = useState("categories"); 
  const [selectedRating, setSelectedRating] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoadingCats(true);
        const res = await axios.get("/api/products", { params: { limit: 500 } });
        const products = res.data.products || [];
        const unique = Array.from(new Set(products.map((p) => p.category)));
        const normalized = unique.map((c) => ({
          slug: c.toLowerCase().replace(/\s+/g, "-"),
          label: c.replace(/-/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()),
        }));
        setCategories(normalized);
      } catch (e) {
        console.error(e);
        setCatError("Failed to load categories");
      } finally {
        setLoadingCats(false);
      }
    })();
  }, []);

  const visibleCats = useMemo(
    () => (showAllCats ? categories : categories.slice(0, 16)),
    [categories, showAllCats]
  );

  const handleCat = (slug) => {
    onCategoryChange(categoryFilter === slug ? "" : slug);
  };

  // 2. FIXED: No longer touches the search bar. 
  // It calls the dedicated rating handler instead.
  const handleRating = (r) => {
    const newVal = selectedRating === r ? null : r;
    setSelectedRating(newVal);
    onRatingChange(newVal); 
  };

  const clearAll = () => {
    setSelectedRating(null);
    onCategoryChange("");
    onSearch("");
    onRatingChange(null); // Clear rating specifically
  };

  const toggleSection = (key) =>
    setExpanded((prev) => (prev === key ? "" : key));

  return (
    <aside className="sticky top-24 h-fit w-full min-w-[260px]">
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="border-b border-gray-100 p-5 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <FaFilter className="text-gray-400" size={12} />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Filters</h2>
          </div>
          
          {(categoryFilter || selectedRating) && (
            <button
              onClick={clearAll}
              className="group flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-md hover:bg-red-100 transition-colors"
            >
              <FaUndo size={8} className="group-hover:-rotate-180 transition-transform duration-500" />
              RESET
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5 space-y-8">
          
          {/* Categories */}
          <div className="group">
            <button
              className="flex w-full items-center justify-between text-sm font-bold text-gray-900 mb-3"
              onClick={() => toggleSection("categories")}
            >
              <div className="flex items-center gap-2">Categories</div>
              <div className={`text-gray-400 transition-transform duration-300 ${expanded === "categories" ? "rotate-180" : ""}`}>
                <FaChevronDown size={10} />
              </div>
            </button>

            <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${expanded === "categories" ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                {loadingCats ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-6 w-3/4 animate-pulse rounded bg-gray-100" />
                    ))}
                  </div>
                ) : catError ? (
                  <div className="text-xs text-red-500">{catError}</div>
                ) : (
                  <div className="flex flex-col space-y-1">
                    {visibleCats.map((cat) => {
                      const active = categoryFilter === cat.slug;
                      return (
                        <button
                          key={cat.slug}
                          onClick={() => handleCat(cat.slug)}
                          className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${active ? "bg-gray-900 text-white font-medium shadow-md shadow-gray-200" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
                        >
                          <span>{cat.label}</span>
                          {active ? <FaCheck size={10} className="text-white" /> : <FaCircle size={6} className="text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </button>
                      );
                    })}
                    {categories.length > 16 && (
                      <button
                        onClick={() => setShowAllCats((v) => !v)}
                        className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-3"
                      >
                        {showAllCats ? <>Show Less <FaChevronUp size={10} /></> : <>+ {categories.length - 16} More categories</>}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Ratings */}
          <div>
            <button
              className="flex w-full items-center justify-between text-sm font-bold text-gray-900 mb-3"
              onClick={() => toggleSection("rating")}
            >
              <div className="flex items-center gap-2">Rating</div>
              <div className={`text-gray-400 transition-transform duration-300 ${expanded === "rating" ? "rotate-180" : ""}`}>
                <FaChevronDown size={10} />
              </div>
            </button>

            <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${expanded === "rating" ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden space-y-1">
                {[5, 4, 3, 2].map((r) => {
                  const active = selectedRating === r;
                  return (
                    <button
                      key={r}
                      onClick={() => handleRating(r)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${active ? "bg-orange-50 border border-orange-100" : "hover:bg-gray-50 border border-transparent"}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-400 gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FaStar key={i} size={13} className={i < r ? "fill-amber-400" : "text-gray-200"} />
                          ))}
                        </div>
                        <span className={`text-xs font-medium ${active ? "text-orange-800" : "text-gray-400"}`}>& Up</span>
                      </div>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${active ? "bg-orange-500 border-orange-500" : "border-gray-300"}`}>
                        {active && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </aside>
  );
}