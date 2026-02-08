import React, { useState, useMemo } from "react";
import axios from "./axiosInstance";
import OrderStages from "./OrderStages";
import {
  FaBox,
  FaChevronDown,
  FaMapMarkerAlt,
  FaReceipt,
  FaShoppingBag
} from "react-icons/fa";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(n) || 0));

/* ---- MODERN STAGE STYLES ---- */
const stageStyles = {
  PLACED: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  CONFIRMED: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-500" },
  PROCESSING: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" },
  PACKED: { bg: "bg-indigo-50", text: "text-indigo-600", dot: "bg-indigo-500" },
  SHIPPED: { bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-500" },
  OUT_FOR_DELIVERY: { bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-500" },
  DELIVERED: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
};

export default function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const [returnBusy, setReturnBusy] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [reason, setReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("ORIGINAL");
  const [returnType, setReturnType] = useState("REFUND");

  const stage = order.stage || "PLACED";
  const style = stageStyles[stage] || stageStyles.PLACED;
  const firstProduct = order.products?.[0] || {};
  const hasReturn = order.returnStatus && order.returnStatus !== "NONE";
  const hasRefund = order.refundStatus && order.refundStatus !== "NONE";

  const orderDate = useMemo(
    () => new Date(order.createdAt).toLocaleDateString("en-IN", {
      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true
    }),
    [order.createdAt]
  );

  return (
    <div className={`group relative rounded-[2rem] border transition-all duration-300 overflow-hidden ${open
      ? "bg-white border-orange-200 shadow-xl shadow-orange-500/5"
      : "bg-white border-gray-100 shadow-sm hover:shadow-md"
      }`}>

      {/* --- SUMMARY HEADER --- */}
      <div
        className="p-6 sm:p-8 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

          {/* Left: Icon + ID + Date */}
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 p-2 flex items-center justify-center shrink-0">
              <img
                src={firstProduct.image || firstProduct.thumbnail || "https://via.placeholder.com/80"}
                alt="Product"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-black text-gray-900 tracking-tight">
                  {(() => {
                    const products = order.products || [];
                    if (products.length === 0) return 'Order';
                    const names = products.slice(0, 2).map(p => p.name).join(', ');
                    const more = products.length > 2 ? ` +${products.length - 2} more` : '';
                    return names + more;
                  })()}
                </h3>
                {/* Status Badges - Prioritize specific statuses (Refund > Return > Main Status) */}
                {(() => {
                  if (hasRefund) {
                    return (
                      <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Refund {order.refundStatus}
                      </span>
                    );
                  }
                  if (hasReturn) {
                    return (
                      <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100">
                        Return {order.returnStatus}
                      </span>
                    );
                  }
                  return (
                    <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-transparent ${style.bg} ${style.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {stage.replace(/_/g, " ")}
                    </span>
                  );
                })()}
              </div>
              <p className="text-sm font-medium text-gray-500">{orderDate}</p>
              {/* Mobile Status Pill - same priority logic */}
              <div className="sm:hidden mt-2">
                {hasRefund ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Refund {order.refundStatus}
                  </span>
                ) : hasReturn ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100">
                    Return {order.returnStatus}
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    {stage.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Price + Items + Action */}
          <div className="flex items-center justify-between lg:justify-end gap-6 lg:gap-10 border-t lg:border-t-0 border-gray-50 pt-4 lg:pt-0">

            {/* Stats */}
            <div className="flex items-center gap-8">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total</p>
                <p className="text-lg font-black text-gray-900">{INR(order.totalPrice)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Items</p>
                <p className="text-lg font-black text-gray-900 flex items-center gap-1">
                  <FaShoppingBag size={14} className="text-orange-500" /> {order.products?.length || 0}
                </p>
              </div>
            </div>

            {/* Toggle Button */}
            <button
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${open ? "bg-gray-900 text-white rotate-180" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
            >
              <FaChevronDown size={14} />
            </button>
          </div>

        </div>
      </div>

      {/* --- EXPANDED DETAILS --- */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${open ? "max-h-[1000px] opacity-100 border-t border-gray-100" : "max-h-0 opacity-0"
        }`}>
        <div className="p-6 sm:p-8 bg-gray-50/50">

          <div className="grid lg:grid-cols-3 gap-8">

            {/* Column 1: Shipping Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  <FaMapMarkerAlt /> Delivery Address
                </h4>
                <p className="text-sm font-medium text-gray-700 leading-relaxed">
                  {order.shippingAddress || "No address provided"}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  <FaReceipt /> Payment
                </h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Method</span>
                  <span className="font-bold text-gray-900">Online (Razorpay)</span>
                </div>
              </div>
            </div>

            {/* Column 2: Product List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/30">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Items Ordered</h4>
                </div>
                <div className="divide-y divide-gray-50">
                  {order.products.map((p, i) => (
                    <div key={i} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 p-1 flex items-center justify-center">
                        <img
                          src={p.image || p.thumbnail}
                          alt={p.name}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-500">Qty: {p.quantity}</p>
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {INR(p.lineTotal ?? p.price * p.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Timeline Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h4 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaBox className="text-orange-500" /> Order Status
            </h4>
            <OrderStages
              currentStage={stage}
              statusHistory={order.statusHistory || []}
              createdAt={order.createdAt}
            />
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => window.open(`${apiBase}/api/orders/${order._id}/invoice`, "_blank")}
              className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              Download Invoice
            </button>
          </div>

          {/* Return Section */}
          {stage === "DELIVERED" && (
            <div className="mt-6">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Returns
              </div>
              {order.returnStatus && order.returnStatus !== "NONE" ? (
                <div className="text-sm font-bold text-gray-700">
                  Status: {order.returnStatus}
                </div>
              ) : (
                <button
                  disabled={returnBusy}
                  onClick={() => {
                    setReason("");
                    setRefundMethod("ORIGINAL");
                    setReturnType("REFUND");
                    setShowReturn(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold shadow-md hover:bg-black transition-all disabled:opacity-60"
                >
                  {returnBusy ? "Submitting..." : "Request Return"}
                </button>
              )}
            </div>
          )}

          {/* Cancel Section */}
          {["PLACED", "CONFIRMED", "PROCESSING", "PACKED"].includes(stage) && (
            <div className="mt-4">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Cancel Order
              </div>
              <button
                onClick={() => {
                  setReason("");
                  setRefundMethod("ORIGINAL");
                  setShowCancel(true);
                }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel Order
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Return Modal */}
      {showReturn && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Request Return</h3>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full mt-2 p-3 rounded-xl border border-gray-200 text-sm"
              rows={3}
            />
            <div className="mt-4">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Return Type</div>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={returnType === "REPLACEMENT"} onChange={() => setReturnType("REPLACEMENT")} />
                Replacement
              </label>
              <label className="flex items-center gap-2 text-sm mt-2">
                <input type="radio" checked={returnType === "REFUND"} onChange={() => setReturnType("REFUND")} />
                Refund
              </label>

              {returnType === "REFUND" && (
                <div className="mt-4">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Refund Method</div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={refundMethod === "ORIGINAL"} onChange={() => setRefundMethod("ORIGINAL")} />
                    Original Payment (7 days)
                  </label>
                  <label className="flex items-center gap-2 text-sm mt-2">
                    <input type="radio" checked={refundMethod === "WALLET"} onChange={() => setRefundMethod("WALLET")} />
                    VKart Wallet (instant)
                  </label>
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowReturn(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm">Cancel</button>
              <button
                disabled={returnBusy || reason.trim().length < 3}
                onClick={async () => {
                  setReturnBusy(true);
                  try {
                    await axios.post(`/api/orders/${order._id}/return`, {
                      reason,
                      returnType,
                      refundMethod,
                    });
                    window.location.reload();
                  } catch {
                    alert("Return request failed.");
                  } finally {
                    setReturnBusy(false);
                    setShowReturn(false);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-bold disabled:opacity-60"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancel && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Cancel Order</h3>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full mt-2 p-3 rounded-xl border border-gray-200 text-sm"
              rows={3}
            />
            <div className="mt-4">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Refund Method</div>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={refundMethod === "ORIGINAL"} onChange={() => setRefundMethod("ORIGINAL")} />
                Original Payment (7 days)
              </label>
              <label className="flex items-center gap-2 text-sm mt-2">
                <input type="radio" checked={refundMethod === "WALLET"} onChange={() => setRefundMethod("WALLET")} />
                VKart Wallet (instant)
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowCancel(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm">Close</button>
              <button
                disabled={reason.trim().length < 3}
                onClick={async () => {
                  try {
                    await axios.post(`/api/orders/${order._id}/cancel`, {
                      reason,
                      refundMethod,
                    });
                    window.location.reload();
                  } catch {
                    alert("Cancel failed.");
                  } finally {
                    setShowCancel(false);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-bold disabled:opacity-60"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
  const apiBase =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? "http://localhost:5000"
      : (process.env.REACT_APP_API_BASE_URL || "");
