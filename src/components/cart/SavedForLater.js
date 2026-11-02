import React from "react";
import { HeartIcon, ShoppingCartIcon } from "../ui/icons";
import { formatINR } from "../../utils/format";

export default function SavedForLater({ items, hasCartItems, onClear, onMoveToCart, keyOf }) {
  return (
    <div className={hasCartItems ? "mt-6 sm:mt-10" : "mt-4"}>
      <div className="flex items-center justify-between mb-2.5 sm:mb-4">
        <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#1d1c19] flex items-center gap-2">
          <HeartIcon size={13} fill="currentColor" className="text-[#a85d37]" /> Saved for Later
        </h2>
        <button
          onClick={onClear}
          className="rounded-full border border-black/10 bg-[#eee8df] px-2.5 py-1 text-[10px] sm:text-xs font-bold text-[#6f6b62] transition-colors hover:bg-[#e6ddd2] hover:text-[#1d1c19]"
        >
          Clear all
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 sm:gap-4">
        {items.map((w) => (
          <div
            key={keyOf(w)}
            className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-black/[0.06] flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#fbfaf7] rounded-lg p-1.5 shrink-0 border border-black/[0.04]">
                <img
                  src={w.thumbnail}
                  className="w-full h-full object-contain mix-blend-multiply"
                  alt=""
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-[#1d1c19] line-clamp-1">{w.title}</h4>
                <div className="text-[11px] font-bold text-[#716c63] mt-0.5">
                  {formatINR(w.price)}
                </div>
              </div>
            </div>
            <button
              onClick={() => onMoveToCart(w)}
              className="mt-2 text-[10px] sm:text-xs font-bold text-[#a85d37] hover:text-white hover:bg-[#a85d37] bg-[#fbf3ee] py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 w-full"
            >
              <ShoppingCartIcon size={10} /> Move to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
