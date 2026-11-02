import React from "react";
import { FaCheck, FaStar } from "react-icons/fa";
import { showToast } from "../../utils/toast";
import { formatINR } from "../../utils/format";

export default function PlansSection({ plans, isAuthenticated, isPrime, purchasing, onChoose }) {
  return (
    <div className="max-w-5xl mx-auto px-4 pb-20">
      <h2 className="text-2xl font-black text-gray-900 text-center mb-3">Choose Your Plan</h2>
      <p className="text-gray-500 text-center mb-10">
        One-time payment. No auto-renewal. Cancel anytime.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className={`relative bg-white rounded-2xl p-6 border-2 transition-all ${
              plan.isPopular
                ? "border-amber-400 shadow-xl shadow-amber-500/10 scale-[1.02]"
                : "border-gray-100 shadow-sm hover:shadow-md"
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <FaStar size={8} /> Most Popular
              </div>
            )}

            <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
            <p className="text-xs text-gray-500 mb-4">{plan.durationDays} days</p>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-black text-gray-900">{formatINR(plan.price)}</span>
              {plan.originalPrice > plan.price && (
                <span className="text-sm text-muted-light line-through">
                  {formatINR(plan.originalPrice)}
                </span>
              )}
            </div>

            <ul className="space-y-2 mb-6">
              {(plan.features || []).map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <FaCheck className="text-green-500 text-xs shrink-0" /> {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  showToast("Please login first", "error");
                  return;
                }
                onChoose(plan);
              }}
              disabled={purchasing === plan._id}
              className={`w-full py-3 rounded-xl font-bold transition-all text-sm ${
                plan.isPopular
                  ? "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20"
                  : "bg-gray-900 text-white hover:bg-black"
              }`}
            >
              {purchasing === plan._id
                ? "Processing..."
                : isPrime
                  ? "Extend Membership"
                  : "Get Prime"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
