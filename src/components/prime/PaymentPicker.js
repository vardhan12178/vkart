import React from "react";
import { FaClock, FaCreditCard, FaUniversity } from "react-icons/fa";
import { formatINR } from "../../utils/format";

// Payment method picker: lighter than the full checkout form (no address to collect), but
// the Razorpay look and available methods match checkout.
export default function PaymentPicker({
  plan,
  purchasing,
  paymentMethod,
  setPaymentMethod,
  onClose,
  onPay,
}) {
  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={() => !purchasing && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
          <span className="text-lg font-black text-gray-900">{formatINR(plan.price)}</span>
        </div>
        <p className="text-xs text-gray-500 mb-5">{plan.durationDays} days of VKart Prime</p>

        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Pay with</p>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[
            { id: "card", icon: FaCreditCard, label: "Card" },
            { id: "netbanking", icon: FaUniversity, label: "Netbanking" },
            { id: "paylater", icon: FaClock, label: "Pay Later" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPaymentMethod(id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                paymentMethod === id
                  ? "border-amber-400 bg-amber-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Icon
                className={paymentMethod === id ? "text-amber-500" : "text-gray-400"}
                size={16}
              />
              <span className="text-[11px] font-bold text-gray-700">{label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => onPay(plan._id)}
          disabled={purchasing === plan._id}
          className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-black transition-colors disabled:opacity-60"
        >
          {purchasing === plan._id ? "Processing..." : `Confirm & Pay ${formatINR(plan.price)}`}
        </button>
      </div>
    </div>
  );
}
