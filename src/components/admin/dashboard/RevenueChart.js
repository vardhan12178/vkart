import React from "react";
import { CalendarIcon, TrendingUpIcon } from "@heroicons/react/outline";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "./DashboardParts";

export default function RevenueChart({ revenueSeries }) {
  return (
    <div className="xl:col-span-2 bg-white rounded-2xl sm:rounded-[1.5rem] border border-slate-200/60 shadow-xs p-4 sm:p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4 sm:mb-8">
        <div>
          <h2 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5 sm:gap-2">
            <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
            Revenue Analytics
          </h2>
          <p className="text-[10px] sm:text-xs font-medium text-slate-400 mt-0.5 ml-5 sm:ml-7">
            Income trend for the selected period
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-emerald-100">
          <TrendingUpIcon className="h-3 w-3" />
          <span>Growth Stable</span>
        </div>
      </div>

      <div className="h-[220px] sm:h-[320px] w-full">
        {revenueSeries.length > 0 && revenueSeries.some((d) => d.revenue > 0) ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueSeries} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 500 }}
                dy={5}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 500 }}
                tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  padding: "8px 12px",
                  fontSize: "12px",
                }}
                cursor={{ stroke: "#f97316", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message="No revenue data available" />
        )}
      </div>
    </div>
  );
}
