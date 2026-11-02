import React from "react";
import { ArrowRightIcon, CircleCheckIcon, MapPinIcon } from "../ui/icons";
import { Dots } from "../ui/Skeleton";
import { formatINR } from "../../utils/format";

// Last look before paying: items, delivery address and what will be charged.
export default function OrderReviewModal({
  cartItems,
  data,
  total,
  walletApplied,
  payable,
  busy,
  onEdit,
  onConfirm,
}) {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-[#1d1c19]/50 backdrop-blur-sm p-3 sm:p-4"
      onClick={onEdit}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl sm:rounded-[1.6rem] border border-black/10 bg-[#fffdf8] p-4 sm:p-8 shadow-[0_30px_90px_rgba(29,28,25,.24)] animate-fade-up-quick"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onEdit}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#eee8df] text-sm font-bold text-[#777168] transition-colors hover:bg-[#e4ddd3] hover:text-[#1d1c19]"
        >
          &times;
        </button>

        <h2 className="mb-4 sm:mb-6 flex items-center gap-2.5 font-editorial text-xl sm:text-3xl font-bold leading-none tracking-tight text-[#1d1c19]">
          <CircleCheckIcon className="text-[#a85d37]" size={20} /> Review Your Order
        </h2>

        <div className="mb-4 sm:mb-6">
          <h3 className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-wider mb-2 sm:mb-3">
            Items ({cartItems.length})
          </h3>
          <div className="space-y-2 sm:space-y-3 max-h-40 sm:max-h-48 overflow-y-auto pr-1">
            {cartItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 sm:gap-3 rounded-xl border border-black/[0.07] bg-[#eeeae2] p-2.5 sm:p-3"
              >
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-ink truncate">
                    {item.title || item.name}
                  </p>
                  <p className="text-[11px] text-muted">Qty: {item.quantity}</p>
                </div>
                <span className="text-xs sm:text-sm font-bold text-ink whitespace-nowrap">
                  {formatINR((item.price || 0) * (item.quantity || 1))}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4 sm:mb-6 rounded-xl border border-[#a85d37]/15 bg-[#f4eee7] p-3 sm:p-4">
          <h3 className="mb-1.5 flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#777168]">
            <MapPinIcon className="text-[#a85d37]" /> Shipping To
          </h3>
          <p className="text-xs sm:text-sm font-bold text-ink">{data.fullName}</p>
          <p className="text-[11px] sm:text-xs text-muted mt-0.5">
            {data.address1}
            {data.address2 ? `, ${data.address2}` : ""}
          </p>
          <p className="text-[11px] sm:text-xs text-muted">
            {data.city}, {data.state} — {data.pincode}
          </p>
          <p className="text-[10px] sm:text-xs text-muted mt-1">
            {data.phone} &bull; {data.email}
          </p>
        </div>

        <div className="mb-4 sm:mb-6 space-y-1.5 sm:space-y-2">
          <div className="flex justify-between text-xs sm:text-sm text-muted">
            <span>Order Total</span>
            <span className="font-bold text-ink">{formatINR(total)}</span>
          </div>
          {walletApplied > 0 && (
            <div className="flex justify-between text-xs sm:text-sm text-[#59634f]">
              <span>Wallet Applied</span>
              <span className="font-bold">−{formatINR(walletApplied)}</span>
            </div>
          )}
          <div className="h-px bg-line my-1" />
          <div className="flex justify-between text-sm sm:text-base">
            <span className="font-bold text-ink">Payable Amount</span>
            <span className="text-lg sm:text-xl font-black text-[#a85d37]">
              {formatINR(payable)}
            </span>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 rounded-full border border-black/10 bg-transparent py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-[#5f5a52] transition-colors hover:bg-[#eee8df] hover:text-[#1d1c19]"
          >
            Edit Details
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#1d1c19] py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-[0_12px_28px_rgba(29,28,25,.16)] transition-all hover:-translate-y-0.5 hover:bg-[#34312c] disabled:translate-y-0 disabled:opacity-50"
          >
            {busy ? (
              <>
                Processing <Dots />
              </>
            ) : (
              <>
                {payable > 0 ? `Confirm & Pay ${formatINR(payable)}` : "Confirm order"}{" "}
                <ArrowRightIcon size={11} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
