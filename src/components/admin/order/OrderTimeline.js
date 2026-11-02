import React from "react";
import { ClockIcon } from "@heroicons/react/outline";
import { formatDateTime, stageLabel } from "./orderStages";

export default function OrderTimeline({ entries }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-4 sm:p-6">
      <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 sm:mb-6 flex items-center gap-1.5">
        <ClockIcon className="h-4 w-4 text-orange-500" />
        Timeline
      </h3>
      <div className="relative border-l-2 border-slate-100 ml-2.5 sm:ml-3 space-y-6 sm:space-y-8 pb-1">
        {entries.map((entry, idx) => {
          const latest = idx === 0;
          return (
            <div key={idx} className="relative pl-6 sm:pl-8 group">
              <span
                className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white shadow-xs transition-all duration-300 ${
                  latest
                    ? "bg-orange-500 ring-4 ring-orange-50 scale-110"
                    : "bg-slate-300 group-hover:bg-slate-400"
                }`}
              ></span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 sm:gap-1">
                <span
                  className={`text-xs sm:text-sm font-bold ${latest ? "text-slate-900" : "text-slate-600"}`}
                >
                  {stageLabel(entry.stage)}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-mono">
                  {formatDateTime(entry.date)}
                </span>
              </div>
              {entry.note && (
                <p className="mt-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 inline-block">
                  {entry.note}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
