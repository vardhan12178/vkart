import React from "react";

const CONFIGS = {
  PLACED: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  CONFIRMED: { bg: "bg-[#ece8df]", text: "text-[#5f5a52]", dot: "bg-[#776f63]" },
  PROCESSING: { bg: "bg-[#f0e5db]", text: "text-[#8b5437]", dot: "bg-[#b56a3f]" },
  PACKED: { bg: "bg-[#e9e5dd]", text: "text-[#665f55]", dot: "bg-[#776f63]" },
  SHIPPED: { bg: "bg-[#e8e4dc]", text: "text-[#655e54]", dot: "bg-[#6d665b]" },
  OUT_FOR_DELIVERY: { bg: "bg-[#efe2d8]", text: "text-[#8b5437]", dot: "bg-[#b56a3f]" },
  DELIVERED: { bg: "bg-[#e5e8df]", text: "text-[#59634f]", dot: "bg-[#59634f]" },
  CANCELLED: { bg: "bg-[#eee2dc]", text: "text-[#75483b]", dot: "bg-[#75483b]" },
};

export default function OrderStatusBadge({ stage }) {
  const config = CONFIGS[stage] || CONFIGS.PLACED;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1 ${config.dot}`}></span>
      {stage.replace(/_/g, " ")}
    </span>
  );
}
