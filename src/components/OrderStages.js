import React, { useMemo } from "react";
import { CheckIcon, CircleCheckIcon, CircleXIcon, ClipboardListIcon, HouseIcon, PackageIcon, PlaneIcon, SettingsIcon, TruckIcon } from "./ui/icons";

// Fixed per-step column width (px) for the horizontal timeline. Kept as a
// single constant since the connector-line math below has to match it
// exactly at every breakpoint, including inside the horizontal scroller.
const STEP_WIDTH = 92;

// Helper function to format dates
function formatStageDate(isoStr) {
  if (!isoStr) return null;
  const d = new Date(isoStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function OrderStages({ currentStage = "PLACED", statusHistory = [], createdAt }) {
  // Build a map of stage -> timestamp from statusHistory
  const stageTimestampMap = useMemo(() => {
    const map = {};
    if (Array.isArray(statusHistory)) {
      statusHistory.forEach((entry) => {
        if (entry && entry.stage && entry.date) {
          // Keep the earliest date for each stage
          if (!map[entry.stage] || new Date(entry.date) < new Date(map[entry.stage])) {
            map[entry.stage] = entry.date;
          }
        }
      });
    }
    // If PLACED doesn't have a timestamp, use createdAt
    if (!map["PLACED"] && createdAt) {
      map["PLACED"] = createdAt;
    }
    return map;
  }, [statusHistory, createdAt]);

  const stages = [
    { key: "PLACED", label: "Order Placed", icon: ClipboardListIcon },
    { key: "CONFIRMED", label: "Confirmed", icon: CheckIcon },
    { key: "PROCESSING", label: "Processing", icon: SettingsIcon },
    { key: "PACKED", label: "Packed", icon: PackageIcon },
    { key: "SHIPPED", label: "Shipped", icon: PlaneIcon },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: TruckIcon },
    { key: "DELIVERED", label: "Delivered", icon: HouseIcon },
  ].map(stage => ({
    ...stage,
    date: formatStageDate(stageTimestampMap[stage.key])
  }));

  const isCancelled = currentStage === "CANCELLED";

  const currentIndex = useMemo(
    () => stages.findIndex((s) => s.key === currentStage),
    [currentStage]
  );

  /* --- CANCELLED STATE --- */
  if (isCancelled) {
    return (
      <div className="max-w-3xl mx-auto my-4">
        <div className="rounded-2xl bg-alert/10 border border-alert/30 p-6 text-center shadow-sm">
          <div className="w-14 h-14 bg-alert/10 text-alert rounded-full flex items-center justify-center mx-auto mb-3">
            <CircleXIcon size={26} />
          </div>
          <h2 className="text-lg font-black text-alert mb-1">Order Cancelled</h2>
          <p className="text-sm text-muted">
            This order has been cancelled and the refund process has been initiated.
          </p>
        </div>
      </div>
    );
  }

  const progressFraction = currentIndex / (stages.length - 1);

  /* --- PROGRESS TIMELINE (horizontal at every breakpoint, scrolls on narrow screens) --- */
  return (
    <div className="w-full bg-white rounded-2xl border border-line shadow-2xs p-3.5 sm:p-5 relative overflow-hidden">
      <div className="overflow-x-auto -mx-1 px-1 pt-1 pb-1">
        <div
          className="relative flex items-start"
          style={{ minWidth: `${stages.length * STEP_WIDTH}px` }}
        >
          {/* Background Line */}
          <div
            className="absolute top-[18px] h-0.5 bg-tint rounded-full -z-10"
            style={{ left: STEP_WIDTH / 2, right: STEP_WIDTH / 2 }}
          />

          {/* Active Progress Line */}
          <div
            className="absolute top-[18px] left-[46px] h-0.5 bg-gradient-to-r from-accent to-accent rounded-full -z-10 transition-all duration-1000 ease-out"
            style={{ width: `calc((100% - ${STEP_WIDTH}px) * ${progressFraction})` }}
          />

          {stages.map((step, i) => {
            const isCompleted = i < currentIndex;
            const isCurrent = i === currentIndex;
            const isPending = i > currentIndex;

            return (
              <div
                key={step.key}
                className="flex flex-col items-center shrink-0"
                style={{ width: STEP_WIDTH }}
              >
                {/* Icon Node */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${isCompleted
                    ? "bg-ok text-white shadow-md shadow-ok/30"
                    : isCurrent
                      ? "bg-accent text-white shadow-lg shadow-accent/40 scale-110 ring-4 ring-accent/30"
                      : "bg-white border-2 border-line text-muted-faint"
                    }`}
                >
                  {isCompleted ? <CircleCheckIcon size={14} /> : <step.icon size={13} />}
                </div>

                {/* Label & Date */}
                <div className={`mt-2 flex flex-col items-center text-center px-1 transition-all duration-500 ${isPending ? "opacity-40" : "opacity-100"
                  }`}>
                  <span className={`text-[11px] font-bold leading-tight ${isCurrent ? "text-accent" : "text-ink-soft"}`}>
                    {step.label}
                  </span>
                  {!isPending && (
                    <span className="text-[9px] text-muted-light font-semibold mt-0.5">
                      {step.date}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
