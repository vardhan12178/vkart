import React, { useEffect, useState } from "react";
import axios from "./axiosInstance";
import { useSelector } from "react-redux";
import { FaCrown, FaCheck, FaShieldAlt, FaTruck, FaStar, FaTag, FaBolt } from "react-icons/fa";
import { showToast } from "../utils/toast";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.round(n));

export default function PrimeMembership() {
  const [plans, setPlans] = useState([]);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    const load = async () => {
      try {
        const [plansRes, statusRes] = await Promise.all([
          axios.get("/api/membership/plans"),
          isAuthenticated ? axios.get("/api/membership/status") : Promise.resolve({ data: null }),
        ]);
        setPlans(plansRes.data || []);
        if (statusRes.data) setMembership(statusRes.data);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  const isPrime = membership?.isPrime;

  const handlePurchase = async (planId) => {
    if (!isAuthenticated) {
      showToast("Please login first", "error");
      return;
    }
    setPurchasing(planId);
    try {
      const { data } = await axios.post("/api/membership/purchase", { planId });
      if (!data.orderId) throw new Error("No orderId returned");

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "VKart Prime",
        description: `${data.plan.name} Membership`,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            const res = await axios.post("/api/membership/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId,
            });
            if (res.data.success) {
              setMembership({ membership: res.data.membership, isPrime: res.data.isPrime });
              showToast("Welcome to VKart Prime! 🎉", "success");
            }
          } catch {
            showToast("Verification failed", "error");
          } finally {
            setPurchasing(null);
          }
        },
        modal: { ondismiss: () => setPurchasing(null) },
        theme: { color: "#F59E0B" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      showToast("Failed to initiate payment", "error");
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(245,158,11,0.15),transparent_50%)]" />
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6">
            <FaCrown className="text-amber-400" />
            <span className="text-sm font-bold text-amber-300">VKart Prime</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight">
            Unlock Premium<br />Shopping Benefits
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Exclusive discounts, priority support, and premium perks — all in one membership.
          </p>
        </div>
      </div>

      {/* Active Membership Banner */}
      {isPrime && membership?.membership && (
        <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <FaCrown className="text-amber-600 text-xl" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">You're a Prime Member!</p>
                  <p className="text-sm text-gray-600">
                    Active until {new Date(membership.membership.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
              <span className="bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-full">ACTIVE</span>
            </div>
            {membership.membership.history?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-amber-200/50">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Membership History</p>
                <div className="space-y-1">
                  {membership.membership.history.slice(-3).reverse().map((h, i) => (
                    <div key={i} className="flex justify-between text-xs text-gray-600">
                      <span>{h.plan || "Prime Plan"}</span>
                      <span>{new Date(h.startDate).toLocaleDateString("en-IN")} → {new Date(h.endDate).toLocaleDateString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Benefits */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-black text-gray-900 text-center mb-10">What You Get</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <FaTag />, title: "Extra Discounts", desc: "Exclusive Prime-only sale prices on every sale" },
            { icon: <FaTruck />, title: "Free Shipping", desc: "Free delivery on all orders, no minimum" },
            { icon: <FaBolt />, title: "Early Access", desc: "Shop sales 24 hours before everyone else" },
            { icon: <FaShieldAlt />, title: "Priority Support", desc: "Dedicated support with faster resolution" },
          ].map((b, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-amber-600 text-lg">
                {b.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{b.title}</h3>
              <p className="text-sm text-gray-500">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-black text-gray-900 text-center mb-3">Choose Your Plan</h2>
        <p className="text-gray-500 text-center mb-10">One-time payment. No auto-renewal. Cancel anytime.</p>

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
                <span className="text-3xl font-black text-gray-900">{INR(plan.price)}</span>
                {plan.originalPrice > plan.price && (
                  <span className="text-sm text-gray-400 line-through">{INR(plan.originalPrice)}</span>
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
                onClick={() => handlePurchase(plan._id)}
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
    </div>
  );
}
