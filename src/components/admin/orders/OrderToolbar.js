import React, { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon, FilterIcon, SearchIcon } from "@heroicons/react/outline";
import { STAGES } from "./orderListUtils";

export default function OrderToolbar({
  search,
  setSearch,
  filterStage,
  setFilterStage,
  filterReturns,
  toggleReturns,
}) {
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setIsFilterMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white p-1 sm:p-1.5 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col sm:flex-row gap-1.5 sm:gap-2">
      {/* Search */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-9 pr-3 py-2 border-none rounded-xl bg-transparent text-slate-900 placeholder-slate-400 focus:ring-0 text-xs sm:text-sm font-medium"
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="w-full h-px bg-slate-100 sm:w-px sm:h-auto my-0.5 sm:my-1"></div>

      <div className="flex items-center gap-1.5 px-1 pb-1 sm:p-0">
        {/* Filter Dropdown */}
        <div className="relative flex-1 sm:flex-initial" ref={filterMenuRef}>
          <button
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            className={`flex items-center justify-between gap-1.5 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl transition-all w-full sm:w-44
                  ${
                    isFilterMenuOpen || filterStage !== "ALL"
                      ? "bg-slate-100 text-slate-900"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <FilterIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {filterStage === "ALL" ? "Filter Status" : filterStage.replace(/_/g, " ")}
              </span>
            </div>
            <ChevronDownIcon
              className={`h-3.5 w-3.5 transition-transform shrink-0 ${isFilterMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isFilterMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Status
              </div>
              <div className="max-h-60 overflow-y-auto">
                {STAGES.map((stage) => (
                  <button
                    key={stage}
                    onClick={() => {
                      setFilterStage(stage);
                      setIsFilterMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between group"
                  >
                    <span className={filterStage === stage ? "font-bold text-slate-900" : ""}>
                      {stage.replace(/_/g, " ")}
                    </span>
                    {filterStage === stage && <CheckIcon className="h-3.5 w-3.5 text-slate-900" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => toggleReturns()}
          className={`px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
            filterReturns
              ? "bg-amber-100 text-amber-800"
              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          Returns
        </button>
      </div>
    </div>
  );
}
