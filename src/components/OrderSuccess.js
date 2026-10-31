import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRightIcon, ChevronRightIcon, CircleCheckIcon, HeadsetIcon, MapPinIcon, PackageIcon, ReceiptIcon, ShieldCheckIcon, ShoppingBagIcon } from "./ui/icons";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import axios from "./axiosInstance";
import OrderStages from "./OrderStages";
import SupportChatWidget from "./support/SupportChatWidget";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(n) || 0));

export default function OrderSuccess() {
  const { orderId } = useParams();
  const { width, height } = useWindowSize();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [showSupport, setShowSupport] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get("/api/profile/orders");
        const foundOrder = response.data.find(
          (o) => o._id === orderId || o.orderId === orderId || o.razorpayOrderId === orderId
        );

        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    } else {
      setLoading(false);
      setError(true);
    }

    const timer = setTimeout(() => setShowConfetti(false), 4500);
    return () => clearTimeout(timer);
  }, [orderId]);

  if (loading) {
    return (
      <div className="premium-page premium-success min-h-screen flex items-center justify-center bg-[#f6f3ed]">
        <div className="w-10 h-10 border-2 border-line-strong border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="premium-page premium-success min-h-screen flex flex-col items-center justify-center bg-[#f6f3ed] p-4 text-center">
        <div className="w-14 h-14 bg-alert/10 text-alert rounded-2xl flex items-center justify-center mb-3">
          <PackageIcon size={22} />
        </div>
        <h2 className="text-lg font-bold text-ink mb-1">Order Details Unavailable</h2>
        <p className="text-muted text-xs sm:text-sm mb-4">We couldn't locate this order in your account.</p>
        <Link to="/" className="px-5 py-2.5 bg-ink text-white rounded-xl font-bold text-xs shadow-xs">
          Back to Home
        </Link>
      </div>
    );
  }

  const products = order.products || [];
  const orderDisplayId = order.orderId || (order._id ? `#${order._id.slice(-8).toUpperCase()}` : "VKART-ORDER");

  return (
    <div className="premium-page premium-success min-h-screen bg-[#f6f3ed] font-sans text-[#1d1c19] py-6 sm:py-10 px-3.5 sm:px-6 lg:px-8 relative overflow-hidden">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={120}
          recycle={false}
          colors={["#0f172a", "#f97316", "#10b981", "#3b82f6", "#eab308"]}
        />
      )}

      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-tint/60 via-sand to-white opacity-80" />

      <div className="max-w-xl mx-auto space-y-4 relative z-10">

        {/* Top Header Notification */}
        <div className="text-center space-y-1.5 pt-2">
          <div className="w-12 h-12 bg-ok text-white rounded-full flex items-center justify-center mx-auto shadow-sm shadow-ok/20">
            <CircleCheckIcon size={24} />
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-ink tracking-tight leading-tight">
            Thank you for your order!
          </h1>
          <p className="text-xs sm:text-sm text-muted font-medium">
            Order <span className="font-mono font-bold text-ink-soft">{orderDisplayId}</span> is confirmed and being prepared.
          </p>
        </div>

        {/* Unified Receipt Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-line-strong/80 shadow-xs overflow-hidden">

          {/* Card Header Bar */}
          <div className="px-4 sm:px-6 py-3.5 bg-sand/80 border-b border-line flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ok animate-pulse" />
              <span className="text-xs font-bold text-ink">Order Confirmed</span>
            </div>
            <span className="text-[11px] font-mono text-muted-light">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
              })}
            </span>
          </div>

          {/* Items Preview */}
          <div className="p-4 sm:p-6 divide-y divide-line">
            <div className="text-[10px] font-bold text-muted-light uppercase tracking-wider mb-2">
              Items in this shipment ({products.length})
            </div>
            {products.map((p, idx) => (
              <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sand border border-line p-1 flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src={p.image || p.thumbnail || "https://via.placeholder.com/60"}
                    alt={p.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-ink truncate">{p.name}</p>
                  <p className="text-[11px] text-muted-light">Qty: {p.quantity}</p>
                </div>
                <div className="text-xs sm:text-sm font-bold text-ink shrink-0">
                  {INR(p.lineTotal ?? p.price * p.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Order Details & Summary Grid */}
          <div className="px-4 sm:px-6 py-4 bg-sand/50 border-t border-line grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-light uppercase tracking-wider mb-1">
                <MapPinIcon className="text-accent" />
                <span>Shipping To</span>
              </div>
              <p className="font-medium text-ink-soft leading-relaxed truncate">
                {order.shippingAddress || "Provided at checkout"}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-light uppercase tracking-wider mb-1">
                <ReceiptIcon className="text-ok" />
                <span>Payment & Total</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Paid Online</span>
                <span className="font-bold text-ink text-sm">{INR(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Embedded Tracking Timeline */}
          <div className="p-4 sm:p-6 border-t border-line bg-white">
            <div className="text-[10px] font-bold text-muted-light uppercase tracking-wider mb-3">
              Delivery Progress
            </div>
            <OrderStages
              currentStage={order.stage || "PLACED"}
              statusHistory={order.statusHistory || []}
              createdAt={order.createdAt}
            />
          </div>

          {/* Action CTAs inside receipt card */}
          <div className="p-4 sm:p-6 border-t border-line bg-sand/80 flex flex-col sm:flex-row gap-2.5">
            <Link
              to={`/orders/${order._id}`}
              className="flex-1 py-2.5 px-4 bg-ink text-white text-xs font-bold rounded-xl shadow-xs hover:bg-black transition flex items-center justify-center gap-1.5 text-center"
            >
              <PackageIcon size={11} />
              <span>View Order Details</span>
            </Link>

            <Link
              to="/products"
              className="flex-1 py-2.5 px-4 bg-white text-ink-soft text-xs font-bold rounded-xl border border-line-strong/80 hover:bg-tint transition flex items-center justify-center gap-1.5 text-center"
            >
              <span>Continue Shopping</span>
              <ChevronRightIcon size={10} />
            </Link>
          </div>
        </div>

        {/* Live Support Help Link */}
        <div className="text-center pt-1 pb-4">
          <button
            onClick={() => setShowSupport(true)}
            className="text-xs text-muted hover:text-ink font-medium inline-flex items-center gap-1.5 transition"
          >
            <HeadsetIcon className="text-muted-light" />
            <span>Have a question about your order? Chat with Support</span>
          </button>
        </div>

      </div>

      <SupportChatWidget open={showSupport} onClose={() => setShowSupport(false)} />
    </div>
  );
}
