import React from "react";

export default function SectionTitle({ children, className = "mb-2.5 sm:mb-4" }) {
  return (
    <h3
      className={`text-[11px] sm:text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-accent" /> {children}
    </h3>
  );
}
