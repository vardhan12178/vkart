import React from "react";
import { ArrowRightIcon, CircleCheckIcon } from "../ui/icons";
import { Dots } from "../ui/Skeleton";
import { formatINR } from "../../utils/format";
import PaymentMethodPicker from "./PaymentMethodPicker";
import TestModeHelp from "./TestModeHelp";

// The dark "Payment Details" panel beside the form.
export default function PaymentSummary({
  total,
  payable,
  paymentMethod,
  onMethodChange,
  busy,
  ready,
  status,
}) {
  const disabled = busy || !ready;

  return (
    <div className="sticky top-24 bg-ink text-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-7 shadow-xl shadow-ink/20 overflow-hidden border border-white/10">
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-ink/10 rounded-full blur-3xl pointer-events-none" />

      <h3 className="relative z-10 text-base sm:text-lg font-bold text-white mb-3.5 sm:mb-6 flex items-center gap-2">
        Payment Details
      </h3>

      <div className="relative z-10 space-y-2.5 sm:space-y-4 mb-4 sm:mb-6">
        <div className="flex justify-between text-xs sm:text-sm text-muted-ondark font-medium">
          <span>Order Total</span>
          <span className="text-white font-semibold">{formatINR(total)}</span>
        </div>
        <div className="h-px bg-white/10" />
        <div className="flex justify-between items-baseline">
          <span className="text-muted-ondark text-xs sm:text-sm font-medium">Payable Amount</span>
          <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {formatINR(total)}
          </span>
        </div>
      </div>

      {payable > 0 && <PaymentMethodPicker value={paymentMethod} onChange={onMethodChange} />}

      <TestModeHelp method={paymentMethod} />

      <button
        type="submit"
        disabled={disabled}
        className={`hidden lg:flex w-full py-3.5 rounded-full font-bold text-xs sm:text-sm shadow-lg transition-all transform active:scale-[0.98] items-center justify-center gap-2 ${
          disabled ? "bg-ink text-muted cursor-not-allowed" : "bg-white text-ink hover:bg-tint"
        }`}
      >
        {busy ? (
          <>
            Processing <Dots />
          </>
        ) : (
          <>
            {payable > 0 ? `Pay ${formatINR(payable)}` : "Place order"} <ArrowRightIcon size={12} />
          </>
        )}
      </button>

      {status && (
        <div className="mt-3 p-2.5 rounded-lg bg-alert/10 border border-alert/20 text-alert text-xs text-center font-medium">
          {status}
        </div>
      )}

      <div className="mt-3.5 pt-3 border-t border-white/10 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs text-muted-ondark font-medium">
          <CircleCheckIcon className="text-ok" size={11} />
          <span>Razorpay Secured (256-bit SSL)</span>
        </div>
      </div>
    </div>
  );
}
