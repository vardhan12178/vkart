import React from "react";
import SectionTitle from "./SectionTitle";

export default function SavedAddresses({ addresses, selectedId, onSelect }) {
  if (!addresses.length) return null;
  return (
    <div className="mb-4 sm:mb-6">
      <SectionTitle className="mb-2.5 sm:mb-3.5">Saved Addresses</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {addresses.map((a) => (
          <button
            type="button"
            key={a._id}
            onClick={() => onSelect(a)}
            className={`text-left p-2.5 sm:p-3.5 rounded-xl border transition-all ${
              selectedId === a._id
                ? "border-accent bg-accent/10 shadow-xs"
                : "border-line-strong bg-white hover:border-line-strong"
            }`}
          >
            <div className="text-xs sm:text-sm font-bold text-ink line-clamp-1">
              {a.fullName || a.name}
            </div>
            <div className="text-[11px] sm:text-xs text-muted mt-0.5 line-clamp-2 leading-tight">
              {a.address1 || a.line1}
              {a.address2 || a.line2 ? `, ${a.address2 || a.line2}` : ""}, {a.city}{" "}
              {a.pincode || a.zip}
            </div>
            <div className="text-[10px] sm:text-xs text-muted mt-0.5">{a.state}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
