import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Gauge } from "lucide-react";
import axiosInstance from "../axiosInstance";
import { qk } from "../../query/queryKeys";

// Google's published "good" / "poor" boundaries for each Core Web Vital.
const METRICS = [
  { key: "LCP", label: "Largest paint", good: 2500, poor: 4000, unit: "s" },
  { key: "INP", label: "Interaction", good: 200, poor: 500, unit: "ms" },
  { key: "CLS", label: "Layout shift", good: 0.1, poor: 0.25, unit: "" },
  { key: "FCP", label: "First paint", good: 1800, poor: 3000, unit: "s" },
  { key: "TTFB", label: "Server response", good: 800, poor: 1800, unit: "ms" },
];

const format = (value, unit) => {
  if (value == null) return "—";
  if (unit === "s") return `${(value / 1000).toFixed(2)}s`;
  if (unit === "ms") return `${Math.round(value)}ms`;
  return value.toFixed(2);
};

const tone = (value, { good, poor }) => {
  if (value == null) return "text-slate-400";
  if (value <= good) return "text-[#59634f]";
  if (value <= poor) return "text-[#b56a3f]";
  return "text-[#75483b]";
};

/** Real-user Core Web Vitals (p75 over the most recent storefront samples). */
export default function WebVitalsCard() {
  const vitalsQuery = useQuery({
    queryKey: qk.admin.vitals,
    queryFn: async () => (await axiosInstance.get("/api/admin/vitals"))?.data ?? {},
    staleTime: 60 * 1000,
  });

  const metrics = vitalsQuery.data?.metrics || {};
  const hasData = METRICS.some(({ key }) => metrics[key]?.count > 0);

  return (
    <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/60 p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-3 sm:mb-5">
        <div>
          <h2 className="flex items-center gap-2 text-sm sm:text-lg font-bold text-slate-900 tracking-tight">
            <Gauge className="h-4 w-4 sm:h-5 sm:w-5 text-[#a85d37]" strokeWidth={1.8} />
            Storefront performance
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
            Core Web Vitals from real shoppers · 75th percentile of the latest {vitalsQuery.data?.windowSize || 1000} visits per metric
          </p>
        </div>
      </div>

      {vitalsQuery.isError ? (
        <p className="text-xs text-slate-500">Could not load performance data.</p>
      ) : !hasData ? (
        <p className="text-xs text-slate-500">
          {vitalsQuery.isLoading ? "Loading…" : "No data yet — metrics appear once the production storefront gets visits."}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-4">
          {METRICS.map((m) => {
            const data = metrics[m.key] || {};
            return (
              <div key={m.key} className="rounded-xl sm:rounded-2xl border border-slate-100 p-3 sm:p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-slate-500">{m.key}</span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400">{data.count || 0} visits</span>
                </div>
                <p className={`mt-1 text-lg sm:text-2xl font-black ${tone(data.p75, m)}`}>{format(data.p75, m.unit)}</p>
                <p className="text-[10px] sm:text-xs text-slate-500">{m.label}</p>
                {data.count > 0 && (
                  <div
                    className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-slate-100"
                    title={`${data.good}% good · ${data.needsImprovement}% needs improvement · ${data.poor}% poor`}
                  >
                    <span className="bg-[#59634f]" style={{ width: `${data.good}%` }} />
                    <span className="bg-[#b56a3f]" style={{ width: `${data.needsImprovement}%` }} />
                    <span className="bg-[#75483b]" style={{ width: `${data.poor}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
