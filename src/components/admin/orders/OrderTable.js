import React from "react";
import { ChevronRightIcon, ShoppingBagIcon } from "@heroicons/react/outline";
import SortableTh from "../ui/SortableTh";
import OrderStatusBadge from "./OrderStatusBadge";
import { getInitials, orderLabel } from "./orderListUtils";

// Desktop layout
export default function OrderTable({ orders, sortConfig, onSort, onOpen }) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50/50">
          <tr>
            <SortableTh
              onClick={() => onSort("_id")}
              active={sortConfig.key === "_id"}
              dir={sortConfig.direction}
            >
              Order ID
            </SortableTh>
            <SortableTh
              onClick={() => onSort("customer")}
              active={sortConfig.key === "customer"}
              dir={sortConfig.direction}
            >
              Customer
            </SortableTh>
            <SortableTh
              onClick={() => onSort("totalPrice")}
              active={sortConfig.key === "totalPrice"}
              dir={sortConfig.direction}
            >
              Total
            </SortableTh>
            <SortableTh
              onClick={() => onSort("stage")}
              active={sortConfig.key === "stage"}
              dir={sortConfig.direction}
            >
              Status
            </SortableTh>
            <SortableTh
              onClick={() => onSort("createdAt")}
              active={sortConfig.key === "createdAt"}
              dir={sortConfig.direction}
            >
              Date
            </SortableTh>
            <th className="relative px-6 py-4">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {orders.map((o) => (
            <tr
              key={o._id}
              onClick={() => onOpen(o)}
              className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
            >
              {/* Order ID */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-100 transition-colors">
                    <ShoppingBagIcon className="h-5 w-5" />
                  </div>
                  <div className="font-mono text-sm font-medium text-slate-700">
                    {orderLabel(o)}
                  </div>
                </div>
              </td>

              {/* Customer */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 ring-2 ring-white">
                    {getInitials(o.customer?.name)}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-slate-900">
                      {o.customer?.name || "Guest"}
                    </div>
                    <div className="text-xs text-slate-400">{o.customer?.email}</div>
                  </div>
                </div>
              </td>

              {/* Price */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-slate-900 tabular-nums">
                  ₹{o.totalPrice?.toLocaleString("en-IN")}
                </div>
              </td>

              {/* Status */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  <OrderStatusBadge stage={o.stage} />
                  {o.returnStatus && o.returnStatus !== "NONE" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                      Return {o.returnStatus}
                    </span>
                  )}
                  {o.refundStatus && o.refundStatus !== "NONE" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Refund {o.refundStatus}
                    </span>
                  )}
                </div>
              </td>

              {/* Date */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-500 tabular-nums">
                  {new Date(o.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </div>
                <div className="text-xs text-slate-400 tabular-nums">
                  {new Date(o.createdAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </td>

              {/* Action */}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <ChevronRightIcon className="h-5 w-5 text-slate-300 group-hover:text-orange-500 transition-colors ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
