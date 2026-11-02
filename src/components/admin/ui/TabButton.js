import React from "react";

export default function TabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all ${
        active ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {label}
    </button>
  );
}
