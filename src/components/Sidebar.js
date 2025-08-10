import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaSearch, FaFilter,  FaTimes } from "react-icons/fa";

const DEFAULT_RANGE = { min: 0, max: 100000 };

export default function Sidebar({
  categoryFilter,
  onCategoryChange,
  onPriceChange,
  onSearch,
}) {
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [catError, setCatError] = useState(null);

  // sidebar-local state
  const [searchInput, setSearchInput] = useState("");
  const [price, setPrice] = useState(DEFAULT_RANGE);
  const [showAllCats, setShowAllCats] = useState(false);

  // ---- fetch categories ----
  useEffect(() => {
    (async () => {
      try {
        setLoadingCats(true);
        const res = await fetch("https://dummyjson.com/products/categories");
        const data = await res.json();
        const normalized = Array.isArray(data)
          ? data.map((c) =>
              typeof c === "string"
                ? { slug: c, label: c.charAt(0).toUpperCase() + c.slice(1) }
                : { slug: c.slug, label: c.name || c.slug }
            )
          : [];
        setCategories(normalized);
      } catch (e) {
        setCatError("Failed to load categories");
      } finally {
        setLoadingCats(false);
      }
    })();
  }, []);

  // ---- sticky header search (debounced) ----
  const timer = useRef();
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer.current);
  }, [searchInput, onSearch]);

  // ---- category pills (with “show more”) ----
  const visibleCats = useMemo(
    () => (showAllCats ? categories : categories.slice(0, 16)),
    [categories, showAllCats]
  );
  const handleCat = (slug) => {
    onCategoryChange(categoryFilter === slug ? "" : slug);
  };



  const clearPrice = () => {
    setPrice(DEFAULT_RANGE);
    onPriceChange(DEFAULT_RANGE);
  };

  const clearAll = () => {
    setSearchInput("");
    if (categoryFilter) onCategoryChange("");
    clearPrice();
  };

  return (
    <aside
      className="
        bg-white rounded-2xl shadow-lg
        sticky top-24
        max-h-[calc(100vh-7rem)]
        overflow-auto
      "
    >
      {/* header + search (kept visible while scrolling the panel) */}
      <div className="p-6 border-b sticky top-0 bg-white rounded-t-2xl z-10">
        <div className="flex items-center text-2xl font-bold text-gray-900 mb-4">
          <FaFilter className="text-orange-500 mr-2" />
          Filters
          <span className="ml-auto">
            <button
              onClick={clearAll}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear All
            </button>
          </span>
        </div>
        <div className="relative">
          <FaSearch className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-2 top-2 p-2 rounded hover:bg-gray-100 text-gray-500"
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* categories */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Categories</h3>
          {categoryFilter && (
            <button
              onClick={() => onCategoryChange("")}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Reset
            </button>
          )}
        </div>

        {loadingCats ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-100 rounded-full animate-pulse" />
            ))}
          </div>
        ) : catError ? (
          <p className="text-sm text-red-500">{catError}</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              {visibleCats.map((cat) => {
                const active = categoryFilter === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => handleCat(cat.slug)}
                    aria-pressed={active}
                    className={
                      "px-4 py-2 rounded-full text-sm font-medium transition border " +
                      (active
                        ? "bg-orange-500 text-white border-orange-500 shadow"
                        : "bg-orange-50 text-gray-800 border-transparent hover:bg-orange-100")
                    }
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {categories.length > 16 && (
              <button
                onClick={() => setShowAllCats((v) => !v)}
                className="mt-3 text-sm text-gray-600 hover:text-gray-800"
              >
                {showAllCats ? "Show less" : `Show more (${categories.length - 16})`}
              </button>
            )}
          </>
        )}
      </div>

    
    </aside>
  );
}
