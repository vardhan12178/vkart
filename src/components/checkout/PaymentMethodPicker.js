import React from "react";
import { ClockIcon, CreditCardIcon, LandmarkIcon } from "../ui/icons";

const METHODS = [
  { id: "card", icon: CreditCardIcon, label: "Card", caption: "Credit / Debit" },
  { id: "netbanking", icon: LandmarkIcon, label: "Netbanking", caption: "All banks" },
  { id: "paylater", icon: ClockIcon, label: "Pay Later", caption: "BNPL" },
];

export default function PaymentMethodPicker({ value, onChange }) {
  return (
    <div className="relative z-10 mb-3.5 sm:mb-6">
      <p className="text-[10px] sm:text-xs font-bold text-muted-ondark uppercase tracking-wider mb-2">
        Pay with
      </p>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {METHODS.map(({ id, icon: Icon, label, caption }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={value === id}
            className={`flex flex-col items-center gap-1 rounded-xl border p-2 sm:p-2.5 text-center transition-all ${
              value === id
                ? "border-accent bg-accent/10 shadow-xs"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <Icon className={value === id ? "text-accent" : "text-muted-ondark"} size={15} />
            <span className="text-[11px] sm:text-xs font-bold text-white leading-tight">
              {label}
            </span>
            <span className="text-[8px] sm:text-[9px] leading-tight text-muted-ondark truncate">
              {caption}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-[10px] sm:text-[11px] leading-snug text-muted-ondark">
        A secure Razorpay window opens on this page to finish your payment. Your card details go to
        Razorpay, not to VKart.
      </p>
    </div>
  );
}
