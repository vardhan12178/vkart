import React from "react";
import { ArrowLeftIcon, PrinterIcon, RefreshIcon } from "@heroicons/react/outline";

export default function OrderTopBar({ orderId, apiBase, onBack, onRefresh, refreshing }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <button
        onClick={onBack}
        className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span>Orders</span>
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={() => window.print()}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all active:scale-95"
        >
          <PrinterIcon className="h-4 w-4" />
          <span>Invoice</span>
        </button>
        <button
          onClick={() => window.open(`${apiBase}/api/orders/${orderId}/invoice`, "_blank")}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-black transition-all active:scale-95"
        >
          <span>PDF</span>
        </button>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all active:scale-95"
        >
          <RefreshIcon className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
}
