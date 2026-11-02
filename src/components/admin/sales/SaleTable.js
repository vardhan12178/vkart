import React from "react";
import RowActions from "../ui/RowActions";
import SaleStatus from "./SaleStatus";
import { categoryLabel } from "./saleUtils";

// Desktop layout
export default function SaleTable({ sales, canWrite, onEdit, onDelete }) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4 text-left">Sale</th>
            <th className="px-6 py-4 text-left">Categories</th>
            <th className="px-6 py-4 text-left">Duration</th>
            <th className="px-6 py-4 text-center">Status</th>
            {canWrite && <th className="px-6 py-4 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sales.map((s) => (
            <tr key={s._id} className="hover:bg-slate-50/50 transition">
              <td className="px-6 py-4">
                <div className="font-bold text-slate-900">{s.name}</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{s.slug}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {s.categories.map((c, i) => (
                    <span
                      key={i}
                      className="bg-orange-50 border border-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    >
                      {categoryLabel(c.category)} ({c.discountPercent}%
                      {c.primeDiscountPercent ? ` / P:${c.primeDiscountPercent}%` : ""})
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 text-xs text-slate-500">
                <div>{new Date(s.startDate).toLocaleDateString()}</div>
                <div>→ {new Date(s.endDate).toLocaleDateString()}</div>
              </td>
              <td className="px-6 py-4 text-center">
                <SaleStatus sale={s} />
              </td>
              {canWrite && (
                <td className="px-6 py-4">
                  <RowActions
                    label={s.name}
                    onEdit={() => onEdit(s)}
                    onDelete={() => onDelete(s._id)}
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
