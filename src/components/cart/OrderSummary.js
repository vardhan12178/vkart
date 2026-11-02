import React from "react";
import { ArrowRightIcon } from "../ui/icons";
import { FreeDeliveryProgress } from "../MiniCart";
import { formatINR } from "../../utils/format";
import PromoBox from "./PromoBox";

export default function OrderSummary({ totals, promo, onCheckout }) {
  return (
    <div className="sticky top-24 space-y-4 sm:space-y-6">
      <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 shadow-sm border border-black/[0.06]">
        <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#1d1c19] mb-3 sm:mb-5">
          Order Summary
        </h2>

        <div className="space-y-3 text-xs sm:text-sm font-medium text-[#6f6b62]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-[#1d1c19] font-semibold">{formatINR(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-light">
            <span className="text-[11px]">Tax (Included 18%)</span>
            <span className="text-[11px]">{formatINR(totals.tax)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span
              className={
                totals.shipping === 0 ? "text-ok font-bold" : "text-[#1d1c19] font-semibold"
              }
            >
              {totals.shipping === 0 ? "Free" : formatINR(totals.shipping)}
            </span>
          </div>
          {totals.promoOff > 0 && (
            <div className="flex justify-between text-ok font-bold">
              <span>Discount</span>
              <span>-{formatINR(totals.promoOff)}</span>
            </div>
          )}

          <div className="h-px bg-black/[0.06] my-3" />

          <div className="flex justify-between text-base sm:text-lg font-black text-[#1d1c19]">
            <span>Total</span>
            <span>{formatINR(totals.total)}</span>
          </div>
        </div>

        <PromoBox promo={promo} />

        <button
          onClick={onCheckout}
          className="hidden lg:flex w-full mt-6 py-3.5 rounded-full bg-[#1d1c19] text-white font-bold text-sm shadow-lg hover:bg-black transition-all items-center justify-center gap-2"
        >
          Checkout <ArrowRightIcon size={12} />
        </button>

        <FreeDeliveryProgress
          subtotal={totals.subtotal}
          className="mt-4 rounded-xl border border-line bg-sand p-3"
        />
      </div>
    </div>
  );
}
