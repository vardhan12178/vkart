import React from "react";
import RowActions from "../ui/RowActions";
import CouponStatus from "./CouponStatus";
import { formatDate, isExpired } from "./couponUtils";

// Phone layout: one card per coupon
export default function CouponCards({ coupons, canWrite, onToggle, onEdit, onDelete }) {
  return (
    <div className="block md:hidden divide-y divide-slate-100">
      {coupons.map((c) => (
        <div key={c._id} className="p-3.5 space-y-2.5 hover:bg-slate-50/50 transition">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 border border-dashed border-slate-300 px-2 py-0.5 rounded-lg tracking-wider">
              {c.code}
            </span>
            <CouponStatus coupon={c} canWrite={canWrite} onToggle={onToggle} />
          </div>

          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-black text-slate-900">
                {c.type === "percent" ? `${c.value}% OFF` : `₹${c.value} FLAT OFF`}
              </span>
              {c.maxDiscount && (
                <span className="text-[10px] font-bold text-slate-500">Max ₹{c.maxDiscount}</span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-2">
              <span>{c.minOrder ? `Min Order: ₹${c.minOrder}` : "No min order"}</span>
              <span>·</span>
              <span>
                Used: {c.usedCount || 0}
                {c.usageLimit ? `/${c.usageLimit}` : ""}
              </span>
            </div>
            {c.description && (
              <p className="text-[11px] text-slate-600 italic mt-0.5">{c.description}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span
              className={`text-[10px] font-medium ${isExpired(c.validTo) ? "text-red-500 font-bold" : "text-slate-400"}`}
            >
              Valid till: {formatDate(c.validTo)}
            </span>
            {canWrite && (
              <RowActions
                label={c.code}
                onEdit={() => onEdit(c)}
                onDelete={() => onDelete(c._id)}
                compact
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
