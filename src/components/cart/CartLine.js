import React from "react";
import { HeartIcon, MinusIcon, PlusIcon, Trash2Icon } from "../ui/icons";
import { formatINR } from "../../utils/format";
import { linePrices } from "./cartMath";

// One item in the bag: image, details, quantity, price, and the save-for-later / remove actions.
export default function CartLine({
  item,
  confirming,
  onAskRemove,
  onCancelRemove,
  onRemove,
  onIncrement,
  onDecrement,
  onSaveForLater,
}) {
  const { lineSell, lineMrp } = linePrices(item);

  return (
    <div className="group bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-[2rem] border border-black/[0.06] shadow-sm transition-all animate-fade-up-quick">
      <div className="flex gap-3 sm:gap-6">
        <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 bg-[#fbfaf7] rounded-xl sm:rounded-2xl p-2 border border-black/[0.05]">
          <img
            src={item.thumbnail || item.images?.[0]}
            alt={item.title}
            className="w-full h-full object-contain mix-blend-multiply"
          />
        </div>

        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="flex justify-between items-start gap-2 sm:gap-4">
            <div className="min-w-0">
              <h3 className="text-xs sm:text-base font-bold text-[#1d1c19] leading-snug line-clamp-2">
                {item.title}
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-light mt-0.5 capitalize truncate">
                {item.category}
              </p>
              {item.selectedVariants && (
                <p className="text-[10px] sm:text-xs text-[#a85d37] font-semibold mt-0.5">
                  {item.selectedVariants}
                </p>
              )}
            </div>
            <button
              onClick={onAskRemove}
              className="text-muted-faint hover:text-alert transition-colors p-1 shrink-0"
              aria-label="Remove item"
            >
              <Trash2Icon size={12} />
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 mt-2.5 sm:mt-4">
            <div className="flex items-center bg-[#f6f3ed] rounded-lg sm:rounded-xl border border-black/[0.06] h-7 sm:h-9">
              <button
                onClick={onDecrement}
                disabled={item.quantity <= 1}
                className="w-7 sm:w-9 h-full flex items-center justify-center text-muted hover:text-ink rounded-l-lg transition disabled:opacity-30"
              >
                <MinusIcon size={9} />
              </button>
              <span className="w-5 sm:w-7 text-center font-bold text-xs">{item.quantity}</span>
              <button
                onClick={onIncrement}
                className="w-7 sm:w-9 h-full flex items-center justify-center text-muted hover:text-ink rounded-r-lg transition"
              >
                <PlusIcon size={9} />
              </button>
            </div>

            <div className="text-right">
              <div className="text-sm sm:text-lg font-bold text-[#1d1c19]">
                {formatINR(lineSell)}
              </div>
              {lineMrp > lineSell && (
                <div className="text-[10px] sm:text-xs text-muted-light line-through font-medium">
                  {formatINR(lineMrp)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2.5 pt-2 sm:mt-4 sm:pt-4 border-t border-black/[0.05] flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={onSaveForLater}
          className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#716c63] hover:text-[#a85d37] transition-colors"
        >
          <HeartIcon size={11} className="text-muted-faint group-hover:text-[#a85d37]" />
          Save for Later
        </button>

        {confirming && (
          <div className="flex items-center gap-2 animate-fade-up-quick ml-auto">
            <span className="text-[11px] font-bold text-[#75483b]">Remove?</span>
            <button
              onClick={onRemove}
              className="rounded-full bg-[#eee2dc] px-2.5 py-0.5 text-[11px] font-bold text-[#75483b]"
            >
              Yes
            </button>
            <button
              onClick={onCancelRemove}
              className="text-[11px] font-bold text-muted px-1.5 py-0.5"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
