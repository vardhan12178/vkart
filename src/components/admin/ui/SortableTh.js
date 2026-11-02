import React from "react";

// Table header cell; pass onClick to make it a sort control.
export default function SortableTh({ children, onClick, active, dir, align = "left" }) {
  return (
    <th
      className={`px-6 py-4 text-${align} text-xs font-bold text-slate-500 uppercase tracking-wider ${onClick ? "cursor-pointer group select-none" : ""}`}
      onClick={onClick}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : undefined}
    >
      <div className="flex items-center gap-1 group-hover:text-slate-800 transition-colors">
        {children}
        {active && <span className="text-orange-500">{dir === "asc" ? "▲" : "▼"}</span>}
      </div>
    </th>
  );
}
