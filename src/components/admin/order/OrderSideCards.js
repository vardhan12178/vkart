import React from "react";
import {
  CreditCardIcon,
  LocationMarkerIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/outline";

const CARD = "bg-white rounded-2xl border border-slate-200/70 shadow-xs p-4 sm:p-6";
const HEADING =
  "text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5";

const ContactRow = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2.5 p-2 sm:p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group cursor-pointer">
    <div className="bg-white p-1 rounded-lg shadow-xs text-slate-400 group-hover:text-orange-500 transition-colors">
      <Icon className="h-3.5 w-3.5" />
    </div>
    <span className="text-xs sm:text-sm text-slate-600 font-medium truncate">{children}</span>
  </div>
);

export function CustomerCard({ customer = {} }) {
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className={HEADING}>
          <UserIcon className="h-4 w-4 text-orange-500" />
          Customer
        </h3>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 flex items-center justify-center text-sm sm:text-lg font-bold shadow-xs ring-2 ring-white shrink-0">
          {customer.name ? customer.name.charAt(0).toUpperCase() : "?"}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm sm:text-base font-bold text-slate-900 truncate">
            {customer.name || "Guest"}
          </p>
          <p className="text-[10px] sm:text-xs text-slate-500 truncate">Customer since 2024</p>
        </div>
      </div>

      <div className="space-y-2">
        {customer.email && <ContactRow icon={MailIcon}>{customer.email}</ContactRow>}
        {customer.phone && <ContactRow icon={PhoneIcon}>{customer.phone}</ContactRow>}
      </div>
    </div>
  );
}

export function DeliveryCard({ address }) {
  return (
    <div className={CARD}>
      <h3 className={`${HEADING} mb-3`}>
        <LocationMarkerIcon className="h-4 w-4 text-orange-500" />
        Delivery Details
      </h3>
      <div className="relative p-3 sm:p-4 bg-slate-50/80 rounded-xl border border-slate-100">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-orange-600 rounded-l-xl"></div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium pl-1.5">
          {address || "No shipping address provided."}
        </p>
      </div>
    </div>
  );
}

export function PaymentCard({ order }) {
  const paid = order.paymentStatus === "PAID";
  return (
    <div className={CARD}>
      <h3 className={`${HEADING} mb-3`}>
        <CreditCardIcon className="h-4 w-4 text-orange-500" />
        Payment
      </h3>

      <div className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Method</p>
            <p className="text-xs sm:text-sm font-bold text-slate-800 uppercase">
              {order.paymentMethod || "COD"}
            </p>
          </div>
          <div
            className={`p-2.5 sm:p-3 rounded-xl border text-center ${
              paid
                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                : "bg-amber-50 border-amber-100 text-amber-700"
            }`}
          >
            <p className="text-[10px] uppercase font-bold opacity-80 mb-0.5">Status</p>
            <p className="text-xs sm:text-sm font-bold uppercase">
              {order.paymentStatus || "PENDING"}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 space-y-1.5">
          {[
            ["Subtotal", order.subtotal],
            ["Shipping", order.shipping],
            ["Tax", order.tax],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-xs sm:text-sm text-slate-600">
              <span>{label}</span>
              <span>₹{value?.toLocaleString()}</span>
            </div>
          ))}
          <div className="pt-2 mt-1 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs sm:text-sm font-bold text-slate-900">Total Paid</span>
            <span className="text-base sm:text-xl font-black text-slate-900">
              ₹{order.totalPrice?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
