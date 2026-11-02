import React from "react";
import RowActions from "../ui/RowActions";
import SaleStatus from "./SaleStatus";
import { categoryLabel } from "./saleUtils";

const shortDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const longDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// Phone layout: one card per sale
export default function SaleCards({ sales, canWrite, onEdit, onDelete }) {
  return (
    <div className="block md:hidden divide-y divide-slate-100">
      {sales.map((s) => (
        <div key={s._id} className="p-3.5 space-y-3 hover:bg-slate-50/50 transition">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 leading-snug">{s.name}</h4>
              <span className="font-mono text-[10px] text-slate-400 block mt-0.5">{s.slug}</span>
            </div>
            <div className="shrink-0">
              <SaleStatus sale={s} />
            </div>
          </div>

          <div className="text-[11px] text-slate-600 font-medium bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 flex items-center justify-between">
            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">
              Duration
            </span>
            <span className="font-semibold text-slate-700">
              {shortDate(s.startDate)} → {longDate(s.endDate)}
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              <span>Categories ({s.categories.length})</span>
              <span>Discounts</span>
            </div>
            <div className="divide-y divide-slate-200/50">
              {s.categories.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-1 px-1 text-xs">
                  <span className="font-medium text-slate-700 capitalize truncate pr-2 text-[11px]">
                    {categoryLabel(c.category)}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-bold text-orange-700 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded text-[10px]">
                      {c.discountPercent}% OFF
                    </span>
                    {c.primeDiscountPercent > 0 && (
                      <span className="font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded text-[10px]">
                        ★ {c.primeDiscountPercent}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {canWrite && (
            <div className="flex justify-end pt-0.5">
              <RowActions
                label={s.name}
                onEdit={() => onEdit(s)}
                onDelete={() => onDelete(s._id)}
                compact
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
