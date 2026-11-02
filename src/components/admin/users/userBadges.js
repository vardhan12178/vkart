import React from "react";

// Semantic styles for badges
export const badgeStyles = {
  twoFAOn: "bg-[#e5e8df] text-[#59634f] border-[#59634f]/15 ring-[#59634f]/20",
  twoFAOff: "bg-slate-50 text-slate-500 border-slate-100 ring-slate-500/30",
  blocked: "bg-[#eee2dc] text-[#75483b] border-[#75483b]/15 ring-[#75483b]/20",
  active: "bg-[#ece8df] text-[#5f5a52] border-black/10 ring-black/10",
};

export function StatusBadge({ blocked }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border ${blocked ? badgeStyles.blocked : badgeStyles.active}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${blocked ? "bg-red-500" : "bg-blue-500"}`}></span>
      {blocked ? "Blocked" : "Active"}
    </span>
  );
}
