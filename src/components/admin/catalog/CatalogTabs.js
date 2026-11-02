import React from "react";
import { TABS } from "./catalogConfig";

export default function CatalogTabs({ tab, setTab, counts }) {
  return (
    <div
      className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200/70 bg-white p-1 shadow-xs [scrollbar-width:none]"
      role="tablist"
    >
      {TABS.map((x) => (
        <button
          key={x.key}
          type="button"
          role="tab"
          aria-selected={tab === x.key}
          onClick={() => setTab(x.key)}
          className={`flex flex-none items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition sm:text-sm ${tab === x.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
        >
          {x.label}
          <span
            className={`rounded-full px-1.5 text-[10px] ${tab === x.key ? "bg-white/20" : x.key === "out" && counts.out ? "bg-red-50 text-red-600" : "bg-slate-100"}`}
          >
            {counts[x.key] ?? "–"}
          </span>
        </button>
      ))}
    </div>
  );
}
