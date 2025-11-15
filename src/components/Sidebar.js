import React, { useEffect, useMemo, useState } from "react";
import axios from "./axiosInstance";
import {
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaStar,
} from "react-icons/fa";

export default function Sidebar({ categoryFilter, onCategoryChange, onSearch }) {
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

      // Fetch all products (same as other components)
      const res = await axios.get("/api/products", {
        params: { limit: 500 },
      });

      const products = res.data.products || [];

      // Extract unique categories
      const unique = Array.from(new Set(products.map((p) => p.category)));

      const normalized = unique.map((c) => ({
        slug: c.toLowerCase().replace(/\s+/g, "-"),
        label: c
          .replace(/-/g, " ")
          .replace(/\b\w/g, (ch) => ch.toUpperCase()),
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

  const handleRating = (r) => {
    setSelectedRating((prev) => (prev === r ? null : r));
    if (r) onSearch(`rating:${r}`);
    else onSearch("");
  };

  const clearAll = () => {
    setSelectedRating(null);
    onCategoryChange("");
    onSearch("");
  };

  const toggleSection = (key) =>
    setExpanded((prev) => (prev === key ? "" : key));

  return (
    <aside className="sticky top-24">
      <div className="rounded-3xl bg-white/95 ring-1 ring-gray-200 shadow-[0_20px_70px_-35px_rgba(0,0,0,0.35)] backdrop-blur-lg overflow-hidden transition">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-gradient-to-r from-orange-50 to-amber-50 p-5 flex items-center">
          <span className="mr-3 grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white ring-4 ring-orange-100 shadow-sm">
            <FaFilter />
          </span>
          <h2 className="text-xl font-extrabold text-gray-900">Filters</h2>
          <button
            onClick={clearAll}
            className="ml-auto text-sm font-medium text-gray-500 hover:text-orange-600 transition"
          >
            Clear All
          </button>
        </div>

        {/* Accordion Body */}
        <div className="p-5 space-y-6">
          {/* Categories */}
          <div>
            <button
              className="flex w-full items-center justify-between text-lg font-semibold text-gray-800 mb-2"
              onClick={() => toggleSection("categories")}
            >
              Categories
              {expanded === "categories" ? (
                <FaChevronUp className="text-gray-500" />
              ) : (
                <FaChevronDown className="text-gray-500" />
              )}
            </button>

            {expanded === "categories" && (
              <div className="pl-1 mt-2 animate-fadeIn">
                {loadingCats ? (
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-9 animate-pulse rounded-full bg-gray-100"
                      />
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
                              "px-4 py-2 rounded-full text-sm font-semibold transition border shadow-sm",
                              active
                                ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white border-transparent shadow-md"
                                : "bg-white border border-gray-200 text-gray-800 hover:border-orange-300 hover:text-orange-600",
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
                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-orange-600"
                      >
                        {showAllCats ? (
                          <>
                            <FaChevronUp /> Show less
                          </>
                        ) : (
                          <>
                            <FaChevronDown /> Show more (
                            {categories.length - 16})
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Ratings */}
          <div>
            <button
              className="flex w-full items-center justify-between text-lg font-semibold text-gray-800 mb-2"
              onClick={() => toggleSection("rating")}
            >
              Ratings
              {expanded === "rating" ? (
                <FaChevronUp className="text-gray-500" />
              ) : (
                <FaChevronDown className="text-gray-500" />
              )}
            </button>

            {expanded === "rating" && (
              <div className="mt-2 space-y-2 animate-fadeIn">
                {[5, 4, 3].map((r) => (
                  <div key={r} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      id={`rating-${r}`}
                      name="rating"
                      checked={selectedRating === r}
                      onChange={() => handleRating(r)}
                      className="accent-orange-500"
                    />
                    <label
                      htmlFor={`rating-${r}`}
                      className={`flex items-center gap-1 text-sm ${
                        selectedRating === r
                          ? "text-orange-600 font-semibold"
                          : "text-gray-700 hover:text-orange-600"
                      }`}
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FaStar
                          key={i}
                          className={`text-[13px] ${
                            i < r ? "text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                      &nbsp;{r} & Up
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
