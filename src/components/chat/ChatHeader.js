import React from "react";
import { Sparkles, X } from "lucide-react";

export default function ChatHeader({ onClose }) {
  return (
    <div className="premium-assistant-header bg-[#fffdf8] px-4 py-3 sm:px-5 sm:py-3.5 flex justify-between items-center shrink-0 border-b border-black/[0.08] relative z-20 text-[#1d1c19]">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1d1c19] flex items-center justify-center text-white shrink-0">
          <Sparkles size={15} />
        </div>
        <div>
          <h3 className="font-editorial text-base sm:text-xl text-[#1d1c19] leading-tight font-bold tracking-tight">
            Ask VKart
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#59634f]" />
            <p className="text-[9px] text-[#625c53] font-bold uppercase tracking-[0.14em]">
              Product concierge
            </p>
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="h-8 w-8 rounded-full text-[#625c53] hover:text-[#1d1c19] hover:bg-black/5 flex items-center justify-center transition-all active:scale-95"
        aria-label="Close product concierge"
      >
        <X size={18} />
      </button>
    </div>
  );
}
