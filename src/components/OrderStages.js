import React, { useMemo } from "react";

export default function OrderStages({ currentStage = "Pending" }) {
  const stages = [
    { name: "Shipping", icon: "📦" },
    { name: "Shipped", icon: "✈️" },
    { name: "Out for Delivery", icon: "🚚" },
    { name: "Delivered", icon: "🎉" },
  ];

  const idx = useMemo(
    () => Math.max(0, stages.findIndex((s) => s.name === currentStage)),
    [currentStage]
  );
  const pct = useMemo(
    () => (stages.length > 1 ? (idx / (stages.length - 1)) * 100 : 0),
    [idx, stages.length]
  );

  return (
    <div className="relative w-full">
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        className="relative h-2 rounded-full bg-gray-200/70 overflow-hidden"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_20px_rgba(251,146,60,0.45)] transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {stages.map((s, i) => {
          const active = i <= idx;
          const now = i === idx;
          return (
            <div key={s.name} className="flex flex-col items-center text-center">
              <div
                className={[
                  "w-12 h-12 rounded-2xl grid place-items-center text-lg font-semibold transition transform",
                  active
                    ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg"
                    : "bg-white ring-1 ring-gray-200 text-gray-500",
                  now ? "scale-105" : "scale-100",
                ].join(" ")}
              >
                <span>{s.icon}</span>
              </div>
              <div
                className={[
                  "mt-2 text-xs font-semibold tracking-wide",
                  active ? "text-orange-600" : "text-gray-500",
                ].join(" ")}
              >
                {s.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
