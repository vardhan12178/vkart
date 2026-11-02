import React from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLinkIcon } from "@heroicons/react/outline";
import { formatINR } from "../../../utils/format";
import { EmptyState, ImageWithFallback } from "./DashboardParts";

export default function TopProducts({ products }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl sm:rounded-[1.5rem] border border-slate-200/60 shadow-xs h-[380px] sm:h-[450px] flex flex-col relative group">
      <div className="p-4 sm:p-6 border-b border-slate-50 flex items-center justify-between bg-white rounded-t-2xl sm:rounded-t-[1.5rem]">
        <h2 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight">Top Products</h2>
        <button
          onClick={() => navigate("/admin/catalog")}
          className="text-slate-400 hover:text-orange-600 transition-colors p-1"
          aria-label="View all products"
        >
          <ExternalLinkIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-y-auto no-scrollbar flex-1 p-2.5 sm:p-4 space-y-2 sm:space-y-3">
        {products.length > 0 ? (
          products.map((p, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 sm:gap-4 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-xs transition-all bg-white group/item"
            >
              <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-100 relative">
                <ImageWithFallback
                  src={p.image}
                  alt={p.name}
                  className="h-full w-full object-contain p-1 group-hover/item:scale-110 transition-transform duration-500 mix-blend-multiply"
                />
                <div className="absolute top-0 left-0 bg-slate-900 text-white text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded-br-lg">
                  #{idx + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover/item:text-orange-600 transition-colors">
                  {p.name}
                </h4>
                <p className="text-[10px] sm:text-xs font-medium text-slate-500">
                  {p.qty} units sold
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm font-black text-slate-900">
                  {formatINR(p.revenue)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <EmptyState message={`No sales in this period`} />
        )}
        <div className="h-10"></div>
      </div>

      {/* Premium Fade Overlay - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none rounded-b-2xl sm:rounded-b-[1.5rem]" />
    </div>
  );
}
