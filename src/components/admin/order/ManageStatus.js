import React from "react";
import { ChevronRightIcon, ClipboardCheckIcon } from "@heroicons/react/outline";
import { STAGES, TERMINAL_STAGES, nextStageAfter, stageLabel } from "./orderStages";

const NOTE = "p-3 bg-slate-50 rounded-xl border border-slate-100 text-center";

// Move the order to its next stage (or any other), or cancel it.
export default function ManageStatus({ order, canWrite, pending, onChange }) {
  const next = nextStageAfter(order.stage);
  const terminal = TERMINAL_STAGES.includes(order.stage);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <ClipboardCheckIcon className="h-4 w-4 text-orange-500" />
          Manage Order Status
        </h3>
        {next && canWrite && !terminal && (
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Next: <strong className="text-slate-700">{stageLabel(next)}</strong>
          </span>
        )}
      </div>

      {terminal ? (
        <div className={NOTE}>
          <p className="text-slate-500 font-medium text-xs">
            This order is closed ({stageLabel(order.stage)}) and requires no further action.
          </p>
        </div>
      ) : !canWrite ? (
        <div className={NOTE}>
          <p className="text-slate-500 font-medium text-xs">
            You have read-only access and cannot modify this order.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {next && (
            <button
              disabled={pending}
              onClick={() => onChange(next)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-2xs hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Mark as {stageLabel(next)}</span>
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
          )}

          {STAGES.filter((s) => s !== "CANCELLED" && s !== next && s !== order.stage).map((s) => (
            <button
              key={s}
              disabled={pending}
              onClick={() => onChange(s)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 hover:text-slate-900 transition-all disabled:opacity-50"
            >
              {stageLabel(s)}
            </button>
          ))}

          <button
            disabled={pending}
            onClick={() => onChange("CANCELLED")}
            className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold hover:bg-red-100 transition-all sm:ml-auto"
          >
            Cancel Order
          </button>
        </div>
      )}
    </div>
  );
}
