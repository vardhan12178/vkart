import React from "react";
import { ArrowRightIcon } from "../ui/icons";
import { formatINR } from "../../utils/format";

export default function MobileCheckoutBar({ total, onCheckout }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-black/10 p-3 lg:hidden z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex gap-3 items-center max-w-7xl mx-auto">
        <div className="flex-1">
          <div className="text-[10px] text-muted-light font-bold uppercase tracking-wide">
            Total
          </div>
          <div className="text-lg font-black text-[#1d1c19] leading-none">{formatINR(total)}</div>
        </div>
        <button
          onClick={onCheckout}
          className="px-6 h-10 bg-[#1d1c19] text-white rounded-full text-xs font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-1.5 hover:bg-black"
        >
          Checkout <ArrowRightIcon size={11} />
        </button>
      </div>
    </div>
  );
}
