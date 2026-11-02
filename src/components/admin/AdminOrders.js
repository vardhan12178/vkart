import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  RefreshIcon,
} from "@heroicons/react/outline";
import { SkeletonRegion, TableSkeleton } from "../ui/Skeleton";
import Pagination from "./ui/Pagination";
import StatTile from "./ui/StatTile";
import OrderCards from "./orders/OrderCards";
import OrderTable from "./orders/OrderTable";
import OrderToolbar from "./orders/OrderToolbar";
import OrdersEmpty from "./orders/OrdersEmpty";
import { PAGE_SIZE } from "./orders/orderListUtils";
import useOrdersList from "./orders/useOrdersList";

export default function AdminOrders() {
  const navigate = useNavigate();
  const o = useOrdersList();
  const openOrder = (order) => navigate(`/admin/orders/${order._id}`);

  return (
    <div className="premium-admin-page min-h-screen bg-transparent p-3.5 sm:p-8 font-sans text-[#24231f]">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              Orders
            </h1>
            <p className="text-slate-500 mt-0.5 text-xs sm:text-sm font-medium">
              Overview of all customer orders and status.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={o.refetch}
              disabled={o.fetching}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-slate-700 border border-slate-200 rounded-xl shadow-xs hover:bg-slate-50 transition-all active:scale-95 text-xs sm:text-sm font-semibold"
            >
              <RefreshIcon
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${o.fetching ? "animate-spin" : ""}`}
              />
              <span>Sync</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <StatTile
            label="Revenue"
            value={`₹${o.stats.totalRevenue.toLocaleString("en-IN")}`}
            icon={CurrencyRupeeIcon}
            tone="text-emerald-700 bg-emerald-50"
          />
          <StatTile
            label="Active"
            value={o.stats.activeOrders}
            icon={ClockIcon}
            tone="text-orange-700 bg-orange-50"
          />
          <StatTile
            label="Completed"
            value={o.stats.completedOrders}
            icon={CheckCircleIcon}
            tone="text-blue-700 bg-blue-50"
          />
        </div>

        <OrderToolbar
          search={o.search}
          setSearch={o.setSearch}
          filterStage={o.filterStage}
          setFilterStage={o.setFilterStage}
          filterReturns={o.filterReturns}
          toggleReturns={o.toggleReturns}
        />

        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden flex flex-col min-h-[350px]">
          {o.loading ? (
            <div className="p-4 sm:p-6">
              <SkeletonRegion label="Loading orders">
                <TableSkeleton rows={4} cols={5} />
              </SkeletonRegion>
            </div>
          ) : o.filtered.length === 0 ? (
            <OrdersEmpty onClear={o.clearFilters} />
          ) : (
            <>
              <OrderCards orders={o.pageOrders} onOpen={openOrder} />
              <OrderTable
                orders={o.pageOrders}
                sortConfig={o.sortConfig}
                onSort={o.sort}
                onOpen={openOrder}
              />
              <Pagination
                page={o.page}
                pageSize={PAGE_SIZE}
                total={o.filtered.length}
                onPage={o.setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
