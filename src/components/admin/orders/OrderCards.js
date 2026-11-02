import React from "react";
import { ChevronRightIcon, ShoppingBagIcon } from "@heroicons/react/outline";
import OrderStatusBadge from "./OrderStatusBadge";
import { getInitials, orderLabel } from "./orderListUtils";

// Phone layout
export default function OrderCards({ orders, onOpen }) {
  return (
    <div className="block md:hidden divide-y divide-slate-100">
      {orders.map((o) => (
        <div
          key={o._id}
          onClick={() => onOpen(o)}
          className="p-3 hover:bg-slate-50/70 transition-colors flex flex-col gap-2 cursor-pointer"
        >
          {/* Top Row: Order ID + Status Badges */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                <ShoppingBagIcon className="h-4 w-4" />
              </div>
              <span className="font-mono text-xs font-bold text-slate-900">{orderLabel(o)}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <OrderStatusBadge stage={o.stage} />
              {o.returnStatus && o.returnStatus !== "NONE" && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                  Return {o.returnStatus}
                </span>
              )}
            </div>
          </div>

          {/* Middle Row: Customer Info */}
          <div className="flex items-center gap-2 pl-10">
            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
              {getInitials(o.customer?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-800 truncate">
                {o.customer?.name || "Guest"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{o.customer?.email}</p>
            </div>
          </div>

          {/* Bottom Row: Price + Date + Arrow */}
          <div className="flex items-center justify-between pt-1.5 pl-10 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-slate-900">
                ₹{o.totalPrice?.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                ·{" "}
                {new Date(o.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>

            <div className="flex items-center text-xs font-bold text-orange-600 gap-0.5">
              <span>Details</span>
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
