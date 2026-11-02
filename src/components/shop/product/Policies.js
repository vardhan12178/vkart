import React from "react";
import { FiLock, FiRotateCcw, FiShield, FiTruck } from "react-icons/fi";
import { FREE_SHIPPING_THRESHOLD } from "../../../utils/shipping";
import { ACCENT } from "./theme";

export default function Policies({ warranty }) {
  const policies = [
    { icon: FiTruck, text: `Free delivery over ₹${FREE_SHIPPING_THRESHOLD}` },
    { icon: FiRotateCcw, text: "7-day easy returns" },
    {
      icon: FiShield,
      text: warranty ? warranty.replace(/^./, (c) => c.toUpperCase()) : "Brand warranty",
    },
    { icon: FiLock, text: "Secure checkout" },
  ];
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 [&>*]:min-w-0">
      {policies.map(({ icon: Icon, text }) => (
        <div
          key={text}
          className="flex flex-col items-center gap-1.5 rounded-xl bg-sand px-2 py-3 text-center text-[11px] leading-tight text-[#5f5b52]"
        >
          <Icon className="text-lg" style={{ color: ACCENT }} />
          {text}
        </div>
      ))}
    </div>
  );
}
