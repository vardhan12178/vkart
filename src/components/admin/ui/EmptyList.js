import React from "react";

export default function EmptyList({ title, hint }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/70 shadow-xs text-slate-400">
      <p className="text-base font-bold text-slate-900">{title}</p>
      {hint && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{hint}</p>}
    </div>
  );
}
