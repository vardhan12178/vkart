import React from "react";
import { ArrowRightIcon } from "../ui/icons";
import { formatINR } from "../../utils/format";

export default function MobilePayBar({ total, payable, busy, ready }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-black/10 p-3 lg:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex gap-3 items-center max-w-6xl mx-auto">
        <div className="flex-1">
          <div className="text-[9px] text-muted-light font-bold uppercase tracking-wider">
            Total Payable
          </div>
          <div className="text-lg font-black text-[#1d1c19] leading-none">{formatINR(total)}</div>
        </div>
        <button
          type="submit"
          disabled={busy || !ready}
          className="px-6 h-10 bg-[#1d1c19] text-white rounded-full text-xs font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-1.5 disabled:opacity-50 hover:bg-black"
        >
          {busy ? "Processing..." : payable > 0 ? "Pay Now" : "Place order"}{" "}
          <ArrowRightIcon size={11} />
        </button>
      </div>
    </div>
  );
}
