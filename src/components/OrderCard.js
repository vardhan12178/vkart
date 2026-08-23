import React, { useState, useMemo, useEffect } from "react";
import axios from "./axiosInstance";
import OrderStages from "./OrderStages";
import {
  FaBox,
  FaChevronDown,
  FaMapMarkerAlt,
  FaReceipt,
  FaShoppingBag,
  FaFileDownload,
  FaTimes,
  FaUndoAlt,
  FaCheckCircle,
} from "react-icons/fa";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(n) || 0));

/* ---- MODERN STAGE STYLES ---- */
const stageStyles = {
  PLACED: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500", border: "border-slate-200" },
  CONFIRMED: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-200" },
  PROCESSING: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", border: "border-amber-200" },
  PACKED: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500", border: "border-indigo-200" },
  SHIPPED: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500", border: "border-purple-200" },
  OUT_FOR_DELIVERY: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500", border: "border-orange-200" },
  DELIVERED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", border: "border-red-200" },
};

const apiBase =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : (process.env.REACT_APP_API_BASE_URL || "");

export default function OrderCard({ order, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [returnBusy, setReturnBusy] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [reason, setReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("ORIGINAL");
  const [returnType, setReturnType] = useState("REFUND");

  useEffect(() => {
    if (defaultOpen) {
      setOpen(true);
    }
  }, [defaultOpen]);

  const stage = order.stage || "PLACED";
  const style = stageStyles[stage] || stageStyles.PLACED;
  const firstProduct = order.products?.[0] || {};
  const hasReturn = order.returnStatus && order.returnStatus !== "NONE";
  const hasRefund = order.refundStatus && order.refundStatus !== "NONE";

  const orderDate = useMemo(
    () =>
      new Date(order.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    [order.createdAt]
  );

  return (
    <div
      className={`group relative rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden ${
        open
          ? "bg-white border-slate-200 shadow-sm"
          : "bg-white border-gray-200/80 shadow-2xs hover:border-gray-300 hover:shadow-xs"
      }`}
    >
      {/* --- SUMMARY HEADER --- */}
      <div
        className="p-3.5 sm:p-5 cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Left: Thumbnail + Name + Date + Status */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 max-w-[56px] max-h-[56px] sm:max-w-[64px] sm:max-h-[64px] rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
              <img
                src={firstProduct.image || firstProduct.thumbnail || "https://via.placeholder.com/80"}
                alt="Product"
                className="w-full h-full max-w-full max-h-full object-contain mix-blend-multiply"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate">
                  {(() => {
                    const products = order.products || [];
                    if (products.length === 0) return "Order";
                    const names = products.slice(0, 2).map((p) => p.name).join(", ");
                    const more = products.length > 2 ? ` +${products.length - 2} more` : "";
                    return names + more;
                  })()}
                </h3>

                {/* Status Badges on Desktop */}
                {(() => {
                  if (hasRefund) {
                    return (
                      <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Refund {order.refundStatus}
                      </span>
                    );
                  }
                  if (hasReturn) {
                    return (
                      <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                        Return {order.returnStatus}
                      </span>
                    );
                  }
                  return (
                    <span
                      className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style.border} ${style.bg} ${style.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {stage.replace(/_/g, " ")}
                    </span>
                  );
                })()}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                <span>{orderDate}</span>
                {order._id && (
                  <span className="hidden sm:inline font-mono text-[10px] text-slate-300">
                    #{order._id.substring(order._id.length - 8)}
                  </span>
                )}
              </div>

              {/* Status Badge on Mobile */}
              <div className="sm:hidden mt-1.5">
                {hasRefund ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Refund {order.refundStatus}
                  </span>
                ) : hasReturn ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                    Return {order.returnStatus}
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${style.border} ${style.bg} ${style.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    {stage.replace(/_/g, " ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Total + Items + Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 border-t sm:border-t-0 border-gray-100 pt-2 sm:pt-0">
            <div className="flex items-center gap-4 sm:gap-6">
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900">{INR(order.totalPrice)}</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Items</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1">
                  <FaShoppingBag size={10} className="text-orange-500" />
                  <span>{order.products?.length || 0}</span>
                </p>
              </div>
            </div>

            <button
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                open ? "bg-slate-900 text-white rotate-180 shadow-2xs" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
              title={open ? "Collapse" : "Expand"}
            >
              <FaChevronDown size={10} />
            </button>
          </div>
        </div>
      </div>

      {/* --- EXPANDED DETAILS --- */}
      {open && (
        <div className="border-t border-gray-100 bg-slate-50/60 p-3.5 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-5">
            {/* Column 1: Delivery & Payment Details */}
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-100 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <FaMapMarkerAlt className="text-orange-500" />
                  <span>Delivery Address</span>
                </div>
                <p className="text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-line">
                  {order.shippingAddress || "No shipping address specified"}
                </p>
              </div>

              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-100 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <FaReceipt className="text-emerald-500" />
                  <span>Payment Summary</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Method</span>
                    <span className="font-bold text-slate-900">Online (Prepaid)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Status</span>
                    <span className="font-bold text-emerald-600 inline-flex items-center gap-1">
                      <FaCheckCircle size={10} /> Paid
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Items Ordered List */}
            <div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-2xs overflow-hidden">
                <div className="px-3.5 py-2.5 border-b border-gray-100 bg-slate-50/50">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Items Ordered ({order.products?.length || 0})
                  </h4>
                </div>
                <div className="divide-y divide-gray-50 max-h-56 overflow-y-auto">
                  {(order.products || []).map((p, i) => (
                    <div key={i} className="p-2.5 sm:p-3 flex items-center gap-3 hover:bg-slate-50/80 transition">
                      <div className="w-10 h-10 max-w-[40px] max-h-[40px] rounded-lg bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={p.image || p.thumbnail}
                          alt={p.name}
                          className="w-full h-full max-w-full max-h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                        <p className="text-[11px] text-slate-400">Qty: {p.quantity}</p>
                      </div>
                      <div className="text-xs font-bold text-slate-900 shrink-0">
                        {INR(p.lineTotal ?? p.price * p.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-gray-100 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-1.5">
              <FaBox className="text-orange-500" />
              <span>Order Tracking Timeline</span>
            </h4>
            <OrderStages
              currentStage={stage}
              statusHistory={order.statusHistory || []}
              createdAt={order.createdAt}
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap pt-1">
            <button
              onClick={() => window.open(`${apiBase}/api/orders/${order._id}/invoice`, "_blank")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
            >
              <FaFileDownload size={11} className="text-slate-500" />
              <span>Download Invoice</span>
            </button>

            {stage === "DELIVERED" && (
              <>
                {order.returnStatus && order.returnStatus !== "NONE" ? (
                  <span className="text-xs font-bold text-amber-700 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-200">
                    Return: {order.returnStatus}
                  </span>
                ) : (
                  <button
                    disabled={returnBusy}
                    onClick={() => {
                      setReason("");
                      setRefundMethod("ORIGINAL");
                      setReturnType("REFUND");
                      setShowReturn(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-2xs hover:bg-black transition disabled:opacity-60"
                  >
                    <FaUndoAlt size={10} />
                    <span>{returnBusy ? "Submitting..." : "Request Return"}</span>
                  </button>
                )}
              </>
            )}

            {["PLACED", "CONFIRMED", "PROCESSING", "PACKED"].includes(stage) && (
              <button
                onClick={() => {
                  setReason("");
                  setRefundMethod("ORIGINAL");
                  setShowCancel(true);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-700 hover:bg-red-100 transition shadow-2xs"
              >
                <FaTimes size={10} />
                <span>Cancel Order</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturn && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Request Return / Replacement</h3>
              <button onClick={() => setShowReturn(false)} className="text-slate-400 hover:text-slate-600">
                <FaTimes size={14} />
              </button>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Reason for Return</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the issue with the item..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
                rows={3}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Return Type</label>
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input type="radio" checked={returnType === "REFUND"} onChange={() => setReturnType("REFUND")} className="text-orange-500" />
                  Refund
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input type="radio" checked={returnType === "REPLACEMENT"} onChange={() => setReturnType("REPLACEMENT")} className="text-orange-500" />
                  Replacement
                </label>
              </div>
            </div>

            {returnType === "REFUND" && (
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Refund Destination</label>
                <div className="space-y-1.5 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                    <input type="radio" checked={refundMethod === "ORIGINAL"} onChange={() => setRefundMethod("ORIGINAL")} className="text-orange-500" />
                    Original Payment Method (5-7 business days)
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                    <input type="radio" checked={refundMethod === "WALLET"} onChange={() => setRefundMethod("WALLET")} className="text-orange-500" />
                    VKart Wallet (Instant credit)
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowReturn(false)} className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
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
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition disabled:opacity-50"
              >
                {returnBusy ? "Submitting..." : "Submit Return"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancel && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Cancel Order</h3>
              <button onClick={() => setShowCancel(false)} className="text-slate-400 hover:text-slate-600">
                <FaTimes size={14} />
              </button>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Reason for Cancellation</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why do you wish to cancel this order?"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
                rows={3}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Refund Destination</label>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input type="radio" checked={refundMethod === "ORIGINAL"} onChange={() => setRefundMethod("ORIGINAL")} className="text-orange-500" />
                  Original Payment Method (5-7 business days)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input type="radio" checked={refundMethod === "WALLET"} onChange={() => setRefundMethod("WALLET")} className="text-orange-500" />
                  VKart Wallet (Instant credit)
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowCancel(false)} className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50">
                Close
              </button>
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
                    alert("Cancellation failed.");
                  } finally {
                    setShowCancel(false);
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition disabled:opacity-50"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
