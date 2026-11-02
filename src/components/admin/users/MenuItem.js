import React from "react";

export default function MenuItem({ onClick, icon: Icon, label, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors ${danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
