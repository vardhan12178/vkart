import React from "react";
import { formatPrice } from "../catalogApi";
import { ACCENT, INK } from "./theme";

export default function MobileBuyBar({ variant, off, available, buy }) {
  return (
    <div className="has-bottom-bar fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 p-3 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-2 pr-16 sm:gap-3">
        <div className="min-w-0 flex-none">
          <p className="text-lg font-bold leading-none text-ink">
            {variant ? formatPrice(variant.price) : "–"}
          </p>
          {off > 0 && <p className="text-xs font-semibold text-ok">{off}% off</p>}
        </div>
        <button
          type="button"
          disabled={!available}
          onClick={() => buy("cart")}
          className="min-w-0 flex-1 rounded-full border-2 border-ink py-2.5 text-sm font-bold disabled:opacity-40"
          style={{ color: INK }}
        >
          Add to cart
        </button>
        <button
          type="button"
          disabled={!available}
          onClick={() => buy("buy")}
          className="min-w-0 flex-1 rounded-full py-2.5 text-sm font-bold text-white disabled:opacity-40"
          style={{ background: ACCENT }}
        >
          Buy now
        </button>
      </div>
    </div>
  );
}
