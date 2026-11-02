import React from "react";
import RowActions from "../ui/RowActions";
import CouponStatus from "./CouponStatus";
import { formatDate, isExpired } from "./couponUtils";

const HEADERS = ["Code", "Type", "Value", "Min Order", "Used", "Valid Until", "Status"];

// Desktop layout
export default function CouponTable({ coupons, canWrite, onToggle, onEdit, onDelete }) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50/80 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
            {HEADERS.map((h) => (
              <th key={h} className="px-5 py-4">
                {h}
              </th>
            ))}
            {canWrite && <th className="px-5 py-4 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {coupons.map((c) => (
            <tr key={c._id} className="hover:bg-slate-50/50 transition">
              <td className="px-5 py-4">
                <div className="font-bold text-slate-900">{c.code}</div>
                {c.description && (
                  <div className="text-xs text-slate-400 mt-0.5">{c.description}</div>
                )}
              </td>
              <td className="px-5 py-4 capitalize">{c.type}</td>
              <td className="px-5 py-4 font-semibold">
                {c.type === "percent" ? `${c.value}%` : `₹${c.value}`}
                {c.maxDiscount && (
                  <span className="text-xs text-slate-400 block">max ₹{c.maxDiscount}</span>
                )}
              </td>
              <td className="px-5 py-4">{c.minOrder ? `₹${c.minOrder}` : "—"}</td>
              <td className="px-5 py-4">
                {c.usedCount || 0}
                {c.usageLimit ? ` / ${c.usageLimit}` : ""}
              </td>
              <td className="px-5 py-4">
                <span className={isExpired(c.validTo) ? "text-red-500" : ""}>
                  {formatDate(c.validTo)}
                </span>
              </td>
              <td className="px-5 py-4">
                <CouponStatus coupon={c} canWrite={canWrite} onToggle={onToggle} />
              </td>
              {canWrite && (
                <td className="px-5 py-4">
                  <RowActions
                    label={c.code}
                    onEdit={() => onEdit(c)}
                    onDelete={() => onDelete(c._id)}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
