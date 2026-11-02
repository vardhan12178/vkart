import React from "react";
import { StatusOnlineIcon } from "@heroicons/react/outline";
import DashboardHeader from "./dashboard/DashboardHeader";
import DashboardSkeleton from "./dashboard/DashboardSkeleton";
import PipelineChart from "./dashboard/PipelineChart";
import RecentOrders from "./dashboard/RecentOrders";
import RevenueChart from "./dashboard/RevenueChart";
import StatsGrid from "./dashboard/StatsGrid";
import TopProducts from "./dashboard/TopProducts";
import { fadeInClass, noScrollbarStyle } from "./dashboard/dashboardData";
import useDashboard from "./dashboard/useDashboard";

export default function AdminDashboard() {
  const d = useDashboard();

  return (
    <div className="premium-admin-page min-h-screen bg-transparent font-sans text-[#24231f] pb-10">
      <style>{noScrollbarStyle}</style>

      <DashboardHeader
        greeting={d.greeting}
        timeRange={d.timeRange}
        setTimeRange={d.setTimeRange}
        onRefresh={d.refetch}
        fetching={d.fetching}
      />

      <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-8 px-3.5 sm:px-8 mt-4 sm:mt-8">
        {d.error && (
          <div className="rounded-2xl bg-red-50 border border-red-100 px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-red-600 flex items-center gap-2 animate-in fade-in shadow-xs">
            <StatusOnlineIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-medium">{d.error}</span>
          </div>
        )}

        {d.loading && !d.orders.length ? (
          <DashboardSkeleton />
        ) : (
          <>
            <StatsGrid stats={d.stats} users={d.users} />

            <div className={`grid grid-cols-1 xl:grid-cols-3 gap-3.5 sm:gap-6 ${fadeInClass(400)}`}>
              <RevenueChart revenueSeries={d.revenueSeries} />
              <PipelineChart stageData={d.stageData} />
            </div>

            <div className={`grid grid-cols-1 xl:grid-cols-2 gap-3.5 sm:gap-6 ${fadeInClass(500)}`}>
              <RecentOrders orders={d.recentOrders} />
              <TopProducts products={d.topProducts} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
