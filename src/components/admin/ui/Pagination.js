import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline";

// Footer for paged lists: "1-10 of 42" on the left, page arrows on the right.
export default function Pagination({ page, pageSize, total, onPage }) {
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const goTo = (p) => {
    if (p >= 1 && p <= totalPages) onPage(p);
  };
  const arrow =
    "p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-all shadow-xs";
  return (
    <div className="px-4 sm:px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/40 text-xs sm:text-sm text-slate-500">
      <div>
        <span className="font-bold text-slate-900">
          {start + 1}-{Math.min(start + pageSize, total)}
        </span>{" "}
        of <span className="font-bold text-slate-900">{total}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-bold text-slate-400 mr-1.5">
          {page}/{totalPages || 1}
        </span>
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className={arrow}
        >
          <ChevronLeftIcon className="h-4 w-4 text-slate-600" />
        </button>
        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          className={arrow}
        >
          <ChevronRightIcon className="h-4 w-4 text-slate-600" />
        </button>
      </div>
    </div>
  );
}
