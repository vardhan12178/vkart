import React from "react";
import { ShoppingBag } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-[#f6f3ed] text-[#1d1c19]"
      role="status"
      aria-live="polite"
      aria-label="Loading VKart"
    >
      <div className="flex flex-col items-center">
        <div className="relative grid h-[4.5rem] w-[4.5rem] place-items-center">
          <span className="absolute inset-0 rounded-full border border-black/10" />
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#a85d37]" />
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#1d1c19] text-[#fffdf8] shadow-[0_10px_30px_rgba(29,28,25,.16)]">
            <ShoppingBag size={19} strokeWidth={1.7} />
          </span>
        </div>
        <p className="mt-5 font-editorial text-2xl tracking-[-0.03em]">VKart</p>
        <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-[#817b72]">
          Curating your view
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
