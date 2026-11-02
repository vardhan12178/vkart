import React from "react";
import { RefreshIcon } from "@heroicons/react/outline";

export default function DashboardHeader({
  greeting,
  timeRange,
  setTimeRange,
  onRefresh,
  fetching,
}) {
  return (
    <div className="sticky top-0 z-20 bg-[#F8F9FA]/85 backdrop-blur-xl border-b border-slate-200/60 px-3.5 sm:px-8 py-3 sm:py-4">
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
        <div>
          <h1 className="font-editorial text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            Store overview.
          </h1>
          <p className="text-slate-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-0.5">
            {greeting} · Live operations
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Date Filter - Segmented Control */}
          <div className="bg-slate-200/60 p-0.5 sm:p-1 rounded-xl flex items-center">
            {["7d", "30d", "90d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${
                  timeRange === range
                    ? "bg-white text-slate-900 shadow-xs scale-102"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "3 Months"}
              </button>
            ))}
          </div>

          <button
            onClick={() => onRefresh()}
            disabled={fetching}
            className="p-1.5 sm:p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-200 transition-all shadow-xs active:scale-95"
            title="Sync Data"
          >
            <RefreshIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${fetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
