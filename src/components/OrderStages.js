import React, { useMemo } from "react";

export default function OrderStages({ currentStage = "PLACED" }) {
  const stages = [
    { key: "PLACED", label: "Placed", icon: "🛒" },
    { key: "CONFIRMED", label: "Confirmed", icon: "✔️" },
    { key: "PROCESSING", label: "Processing", icon: "⚙️" },
    { key: "PACKED", label: "Packed", icon: "📦" },
    { key: "SHIPPED", label: "Shipped", icon: "✈️" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: "🚚" },
    { key: "DELIVERED", label: "Delivered", icon: "🎉" },
  ];

  const isCancelled = currentStage === "CANCELLED";

  const currentIndex = useMemo(
    () => stages.findIndex((s) => s.key === currentStage),
    [currentStage]
  );

  const pct = useMemo(() => {
    if (currentIndex < 0) return 0;
    return (currentIndex / (stages.length - 1)) * 100;
  }, [currentIndex, stages.length]);

  if (isCancelled) {
    return (
      <div className="text-center p-6 rounded-2xl bg-red-50 border border-red-200">
        <div className="text-4xl mb-2">❌</div>
        <h2 className="text-xl font-bold text-red-700">Order Cancelled</h2>
        <p className="text-sm text-red-600 mt-1">
          This order has been cancelled.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Progress Bar */}
      <div className="relative h-2 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        ></div>
      </div>

      {/* Stage Icons */}
      {/* Mobile: horizontal scroll | Desktop: evenly spaced grid */}
      <div className="mt-6 overflow-x-auto pb-3">
        <div className="min-w-max grid grid-flow-col gap-6 md:gap-10 md:min-w-0 md:grid-cols-7">
          {stages.map((s, i) => {
            const active = i <= currentIndex;
            const now = i === currentIndex;

            return (
              <div
                key={s.key}
                className="flex flex-col items-center text-center w-20 md:w-auto"
              >
                <div
                  className={[
                    "w-12 h-12 rounded-xl grid place-items-center text-xl font-bold transition",
                    active
                      ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg"
                      : "bg-white ring-1 ring-gray-300 text-gray-400",
                    now ? "scale-105" : "scale-100",
                  ].join(" ")}
                >
                  {s.icon}
                </div>
                <div
                  className={[
                    "mt-2 text-xs font-semibold tracking-wide whitespace-nowrap",
                    active ? "text-orange-600" : "text-gray-500",
                  ].join(" ")}
                >
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
