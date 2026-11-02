import React from "react";
import { PlusIcon, RefreshIcon } from "@heroicons/react/outline";

// Title, subtitle, refresh button and an optional "create" button shared by the admin list pages.
export default function ListPageHeader({
  title,
  subtitle,
  onRefresh,
  refreshing,
  onCreate,
  createLabel,
  createShortLabel,
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0 flex-1">
        <h1 className="font-editorial text-xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight truncate">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">{subtitle}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onRefresh}
          className="p-2 sm:p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition shadow-xs text-slate-600"
          title="Refresh"
          aria-label="Refresh"
        >
          <RefreshIcon className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
        {onCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="flex items-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition shadow-xs shrink-0 whitespace-nowrap active:scale-95"
          >
            <PlusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{createLabel}</span>
            <span className="sm:hidden">{createShortLabel || createLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}
