import React, { useEffect, useMemo, useState } from "react";
import { FaFilter, FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function Sidebar({ categoryFilter, onCategoryChange, onPriceChange, onSearch }) {
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [catError, setCatError] = useState(null);
  const [showAllCats, setShowAllCats] = useState(false);

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
      } catch {
        setCatError("Failed to load categories");
      } finally {
        setLoadingCats(false);
      }
    })();
  }, []);

  const visibleCats = useMemo(() => (showAllCats ? categories : categories.slice(0, 16)), [categories, showAllCats]);

  const handleCat = (slug) => {
    onCategoryChange(categoryFilter === slug ? "" : slug);
  };

  const clearAll = () => {
    if (categoryFilter) onCategoryChange("");
  };

  return (
    <aside className="sticky top-24">
      <div className="rounded-3xl bg-white/90 ring-1 ring-gray-200 shadow-[0_20px_70px_-35px_rgba(0,0,0,0.35)] backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="sticky top-0 z-10 rounded-t-3xl border-b bg-white/90 p-6 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <div className="flex items-center text-2xl font-extrabold tracking-tight text-gray-900">
            <span className="mr-2 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white ring-4 ring-orange-100">
              <FaFilter />
            </span>
            Filters
            <button onClick={clearAll} className="ml-auto text-sm font-medium text-gray-500 underline hover:text-gray-700">
              Clear All
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Categories</h3>
            {categoryFilter && (
              <button onClick={() => onCategoryChange("")} className="text-xs text-gray-500 underline hover:text-gray-700">
                Reset
              </button>
            )}
          </div>

          {loadingCats ? (
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-9 animate-pulse rounded-full bg-gray-100" />
              ))}
            </div>
          ) : catError ? (
            <p className="text-sm text-red-600">{catError}</p>
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
                      className={[
                        "px-4 py-2 rounded-full text-sm font-semibold transition border",
                        active
                          ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white border-transparent shadow-md"
                          : "bg-orange-50 text-gray-800 border-transparent hover:bg-orange-100",
                      ].join(" ")}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {categories.length > 16 && (
                <button
                  onClick={() => setShowAllCats((v) => !v)}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  {showAllCats ? (
                    <>
                      <FaChevronUp /> Show less
                    </>
                  ) : (
                    <>
                      <FaChevronDown /> Show more ({categories.length - 16})
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
