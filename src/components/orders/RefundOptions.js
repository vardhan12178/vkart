import React from "react";

const OPTIONS = [
  ["ORIGINAL", "Original Payment Method (5-7 business days)"],
  ["WALLET", "VKart Wallet (Instant credit)"],
];

export default function RefundOptions({ value, onChange }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">
        Refund Destination
      </label>
      <div className="space-y-1.5 text-xs">
        {OPTIONS.map(([key, label]) => (
          <label key={key} className="flex items-center gap-1.5 cursor-pointer font-medium">
            <input
              type="radio"
              checked={value === key}
              onChange={() => onChange(key)}
              className="text-accent"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}
