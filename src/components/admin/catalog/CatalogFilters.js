import React from "react";
import { Search } from "lucide-react";
import { CATEGORIES } from "../../shop/catalogData";

export default function CatalogFilters({
  search,
  setSearch,
  category,
  setCategory,
  sort,
  setSort,
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/70 bg-white p-1.5 shadow-xs sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, brand or SKU"
          aria-label="Search products"
          className="block w-full rounded-xl border-none bg-transparent py-2 pl-9 pr-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:ring-0"
        />
      </div>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        aria-label="Category"
        className="rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-700 focus:ring-orange-200"
      >
        <option value="">All categories</option>
        {Object.entries(CATEGORIES).map(([k, name]) => (
          <option key={k} value={k}>
            {name}
          </option>
        ))}
      </select>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        aria-label="Sort"
        className="rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-700 focus:ring-orange-200"
      >
        <option value="updated">Recently updated</option>
        <option value="title">Name A–Z</option>
        <option value="stock">Out of stock first</option>
      </select>
    </div>
  );
}
