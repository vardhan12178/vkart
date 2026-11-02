import React from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLinkIcon, ShoppingBagIcon } from "@heroicons/react/outline";
import { formatINR } from "../../../utils/format";
import { stageColors, stageLabels } from "./dashboardData";
import { EmptyState } from "./DashboardParts";

export default function RecentOrders({ orders }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl sm:rounded-[1.5rem] border border-slate-200/60 shadow-xs h-[380px] sm:h-[450px] flex flex-col relative group">
      <div className="p-4 sm:p-6 border-b border-slate-50 flex items-center justify-between bg-white rounded-t-2xl sm:rounded-t-[1.5rem]">
        <h2 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight">
          Recent Orders
        </h2>
        <button
          onClick={() => navigate("/admin/orders")}
          className="text-slate-400 hover:text-orange-600 transition-colors p-1"
          aria-label="View all orders"
        >
          <ExternalLinkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="overflow-y-auto no-scrollbar flex-1 p-2 sm:p-3">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order._id}
              className="p-2.5 sm:p-3 hover:bg-slate-50/80 rounded-xl sm:rounded-2xl transition-colors flex items-center gap-2.5 sm:gap-4 group/item cursor-pointer mb-1"
              onClick={() => navigate(`/admin/orders/${order._id}`)}
            >
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover/item:bg-orange-100 group-hover/item:text-orange-600 transition-colors shrink-0">
                <ShoppingBagIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    #{order.orderId || order._id.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-xs sm:text-sm font-black text-slate-900">
                    {formatINR(order.totalPrice)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] sm:text-xs font-medium text-slate-500 truncate">
                    {order.customer?.name || "Guest"}
                  </p>
                  <span
                    className={`text-[8px] sm:text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full font-bold border ${stageColors[order.stage]}`}
                  >
                    {stageLabels[order.stage]}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState message="No recent orders found" />
        )}
        {/* Spacer for bottom scroll */}
        <div className="h-10"></div>
      </div>

      {/* Premium Fade Overlay - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none rounded-b-2xl sm:rounded-b-[1.5rem]" />
    </div>
  );
}
