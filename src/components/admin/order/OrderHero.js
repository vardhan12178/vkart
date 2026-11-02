import React from "react";
import { CheckCircleIcon, DuplicateIcon } from "@heroicons/react/outline";
import { STAGES, formatDateTime, stageLabel, stageStyles } from "./orderStages";

function Stepper({ stage }) {
  const currentIndex = STAGES.indexOf(stage);
  const cancelled = stage === "CANCELLED";

  return (
    <div className="mt-10 mb-2 hidden lg:block">
      <div className="relative flex items-center justify-between w-full">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1.5 bg-slate-100 rounded-full"></div>

        <div
          className={`absolute left-0 top-1/2 transform -translate-y-1/2 h-1.5 transition-all duration-700 ease-out rounded-full shadow-xs ${
            cancelled ? "bg-red-500" : "bg-gradient-to-r from-orange-400 to-orange-600"
          }`}
          style={{ width: `${(Math.max(0, currentIndex) / (STAGES.length - 1)) * 100}%` }}
        ></div>

        {STAGES.map((s, idx) => {
          const completed = currentIndex >= idx;
          const current = stage === s;

          let dotClass = "bg-white border-2 border-slate-200 text-slate-300";
          let textClass = "text-slate-400 font-medium";
          if (cancelled && s === "CANCELLED") {
            dotClass = "bg-red-500 border-red-500 text-white shadow-xs shadow-red-200";
            textClass = "text-red-600 font-bold";
          } else if (current) {
            dotClass =
              "bg-orange-600 border-orange-600 text-white shadow-xs shadow-orange-200 scale-110";
            textClass = "text-orange-700 font-bold";
          } else if (completed) {
            dotClass = "bg-orange-500 border-orange-500 text-white";
            textClass = "text-slate-600 font-semibold";
          }

          return (
            <div key={s} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${dotClass}`}
              >
                {completed || cancelled ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <div className="h-2.5 w-2.5 bg-current rounded-full opacity-50" />
                )}
              </div>
              <span
                className={`absolute top-10 text-[10px] uppercase tracking-wider whitespace-nowrap transition-colors ${textClass}`}
              >
                {stageLabel(s)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Order number, placed date, current stage badge, total and the stage stepper.
export default function OrderHero({ order, onCopyId }) {
  const style = stageStyles[order.stage] || stageStyles.PLACED;
  const StatusIcon = style.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-4 sm:p-8 relative overflow-hidden">
      <div
        className={`absolute top-0 right-0 w-64 h-64 opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl ${style.bg.replace("bg-", "bg-gradient-to-br from-transparent to-")}`}
      ></div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-6 relative z-10">
        <div className="space-y-1 sm:space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
              Order
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60 break-all">
              #{order.orderId || order._id.slice(-6).toUpperCase()}
            </span>
            <button
              onClick={() => onCopyId(order.orderId || order._id)}
              className="text-slate-400 hover:text-orange-500 transition-colors p-1 rounded-md hover:bg-slate-100"
              title="Copy Full ID"
            >
              <DuplicateIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
          <div className="text-slate-500 text-[11px] sm:text-xs flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span>Placed {formatDateTime(order.createdAt)}</span>
            <span className="text-slate-300">•</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border ${style.bg} ${style.text} ${style.border}`}
            >
              <StatusIcon className="h-3 w-3" />
              {stageLabel(order.stage)}
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex sm:block items-center justify-between">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Amount
          </p>
          <p className="text-base sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            ₹{order.totalPrice?.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <Stepper stage={order.stage} />
    </div>
  );
}
