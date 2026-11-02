import React, { useState } from "react";
import {
  ArrowSmDownIcon,
  ArrowSmUpIcon,
  ClockIcon,
  PhotographIcon,
} from "@heroicons/react/outline";

export function ImageWithFallback({ src, alt, className }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return <PhotographIcon className="h-6 w-6 text-slate-300" />;
  }

  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
}

export function StatCard({ title, value, subtitle, icon, gradient, trend, trendUp }) {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-[1.5rem] bg-white p-3 sm:p-6 shadow-xs border border-slate-200/60 group hover:shadow-md transition-all duration-300">
      {/* Subtle Gradient Background */}
      <div
        className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br ${gradient} opacity-[0.08] rounded-bl-full -mr-6 -mt-6 sm:-mr-8 sm:-mt-8 transition-transform group-hover:scale-110 duration-700 pointer-events-none`}
      ></div>

      <div className="flex justify-between items-start relative z-10 gap-1.5 sm:gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1 truncate">
            {title}
          </p>
          <h3 className="text-base sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight truncate">
            {value}
          </h3>
        </div>
        <div
          className={`h-7 w-7 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-xs text-white shrink-0 transform group-hover:rotate-6 transition-transform duration-300`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-2 sm:mt-4 flex items-center gap-1.5 text-[9px] sm:text-xs font-medium relative z-10 truncate">
        <span
          className={`flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 rounded-md shrink-0 font-bold ${trendUp ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"}`}
        >
          {trendUp ? (
            <ArrowSmUpIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          ) : (
            <ArrowSmDownIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          )}
          {trend}
        </span>
        <span className="text-slate-400 truncate hidden sm:inline">{subtitle}</span>
      </div>
    </div>
  );
}

export function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3 border border-slate-100">
        <ClockIcon className="h-6 w-6 text-slate-300" />
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{message}</p>
    </div>
  );
}
