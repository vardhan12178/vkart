import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "./DashboardParts";

export default function PipelineChart({ stageData }) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-[1.5rem] border border-slate-200/60 shadow-xs p-4 sm:p-6 hover:shadow-md transition-all duration-300 flex flex-col">
      <h2 className="text-sm sm:text-lg font-bold text-slate-900 mb-0.5 sm:mb-1 tracking-tight">
        Pipeline
      </h2>
      <p className="text-[10px] sm:text-xs font-medium text-slate-400 mb-3 sm:mb-6">
        Order status distribution
      </p>

      <div className="flex-1 min-h-[180px] sm:min-h-[220px]">
        {stageData.some((s) => s.count > 0) ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stageData} layout="vertical" margin={{ left: -10, right: 10 }}>
              <CartesianGrid horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="stage"
                type="category"
                axisLine={false}
                tickLine={false}
                width={75}
                tick={{ fontSize: 9, fill: "#64748b", fontWeight: 600 }}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14} animationDuration={1500}>
                {stageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message="No active orders" />
        )}
      </div>
    </div>
  );
}
