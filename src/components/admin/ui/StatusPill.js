import React from "react";

const TONES = {
  ok: "text-emerald-700 bg-emerald-50 border-emerald-100",
  off: "text-slate-500 bg-slate-100 border-slate-200",
  info: "text-blue-700 bg-blue-50 border-blue-100",
  bad: "text-red-700 bg-red-50 border-red-100",
};

export default function StatusPill({ tone = "off", icon: Icon, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold border px-2 py-0.5 rounded-full ${TONES[tone]}`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}
