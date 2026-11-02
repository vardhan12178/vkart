import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CatalogPager({ data, page, setPage }) {
  return (
    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
      <span>
        Page {data.page} of {data.pages} · {data.total} products
      </span>
      <div className="flex gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          aria-label="Previous page"
          className="rounded-lg border border-slate-200 bg-white p-1.5 hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={page >= data.pages}
          onClick={() => setPage(page + 1)}
          aria-label="Next page"
          className="rounded-lg border border-slate-200 bg-white p-1.5 hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
