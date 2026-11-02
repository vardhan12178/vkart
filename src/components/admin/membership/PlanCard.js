import React from "react";
import { CheckCircleIcon, PencilIcon, TrashIcon, XCircleIcon } from "@heroicons/react/outline";
import { formatINR } from "../../../utils/format";

export default function PlanCard({ plan, canWrite, onEdit, onDelete }) {
  return (
    <div
      key={plan._id}
      className={`bg-white rounded-2xl p-4 sm:p-6 border ${
        plan.isPopular ? "border-amber-400 ring-1 ring-amber-400/30" : "border-slate-200/70"
      } shadow-xs space-y-3 relative flex flex-col justify-between hover:shadow-md transition-shadow`}
    >
      <div>
        {/* Top line: Name, duration, and status */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-900">{plan.name}</h3>
              {plan.isPopular && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.2 rounded-full">
                  ★ Popular
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
              {plan.slug} · {plan.durationDays} days
            </p>
          </div>
          {plan.isActive ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full shrink-0">
              <CheckCircleIcon className="h-3 w-3" /> Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full shrink-0">
              <XCircleIcon className="h-3 w-3" /> Inactive
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 py-2">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {formatINR(plan.price)}
          </span>
          {plan.originalPrice > plan.price && (
            <span className="text-xs sm:text-sm text-slate-400 line-through font-medium">
              {formatINR(plan.originalPrice)}
            </span>
          )}
        </div>

        {/* Features List */}
        {plan.features?.length > 0 && (
          <ul className="space-y-1.5 pt-1 border-t border-slate-100">
            {plan.features.map((f, i) => (
              <li key={i} className="text-[11px] sm:text-xs text-slate-600 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1" />
                <span className="leading-snug">{f}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions Footer */}
      {canWrite && (
        <div className="flex gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={() => onEdit(plan)}
            className="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition"
          >
            <PencilIcon className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(plan._id)}
            className="py-1.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition flex items-center justify-center"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
