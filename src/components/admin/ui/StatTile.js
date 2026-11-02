import React from "react";

// Small metric card: label, value and a tinted icon. `tone` is the icon's text + background classes.
export default function StatTile({ label, fullLabel, value, icon: Icon, tone }) {
  return (
    <div className="bg-white p-2.5 sm:p-5 rounded-2xl border border-slate-200/70 shadow-xs flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span className={fullLabel ? "sm:hidden" : ""}>{label}</span>
          {fullLabel && <span className="hidden sm:inline">{fullLabel}</span>}
        </p>
        <p className="text-base sm:text-2xl font-black text-slate-900 mt-0.5">{value}</p>
      </div>
      <div className={`p-1.5 sm:p-3 rounded-xl shrink-0 ${tone}`}>
        <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
      </div>
    </div>
  );
}
