import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  LocationMarkerIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  ClockIcon,
  RefreshIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  ClipboardCheckIcon,
  CubeIcon,
  CreditCardIcon,
  PrinterIcon,
  DuplicateIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  ArchiveIcon
} from "@heroicons/react/outline";

const STAGES = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const stageStyles = {
  PLACED: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", icon: ClipboardCheckIcon },
  CONFIRMED: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", icon: ShieldCheckIcon },
  PROCESSING: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200", icon: RefreshIcon },
  PACKED: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", icon: ArchiveIcon },
  SHIPPED: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200", icon: TruckIcon },
  OUT_FOR_DELIVERY: { bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-200", icon: TruckIcon },
  DELIVERED: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", icon: CheckCircleIcon },
  CANCELLED: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", icon: XCircleIcon },
};

function formatDateTime(isoStr) {
  if (!isoStr) return "-";
  const d = new Date(isoStr);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });

  const showToast = (type, message, ms = 3000) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), ms);
  };

  // --- Function to copy Order ID ---
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast("success", "Order ID copied to clipboard!");
  };

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/orders/${id}`, {
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
      });

      if (!res.ok) throw new Error("Failed to fetch order");

      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.error("Order load error:", err);
      showToast("error", "Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const updateStage = async (stage) => {
    if (!order) return;
    if (["DELIVERED", "CANCELLED"].includes(order.stage)) {
      showToast("error", "Order is closed and cannot be modified.");
      return;
    }
    if (stage === order.stage) return;

    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/orders/${id}/stage`, {
        method: "PATCH",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ stage }),
      });

      const data = await res.json();

      if (res.ok) {
        setOrder(data.order || { ...order, stage });
        showToast("success", `Status updated to ${stage.replace(/_/g, " ")}`);
      } else {
        throw new Error(data.message || "Update failed");
      }
    } catch (err) {
      showToast("error", err.message || "Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const timeline = useMemo(() => {
    if (!order) return [];
    const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];
    if (history.length === 0 && order.stage) {
      return [{
        stage: order.stage,
        date: order.updatedAt || order.createdAt || new Date().toISOString(),
        note: "Initial Status",
      }];
    }
    return history
      .filter((h) => h && h.stage)
      .map((h) => ({
        stage: h.stage,
        date: h.date || order.createdAt,
        note: h.note || "",
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [order]);

  // --- Logic to determine the NEXT logical step ---
  const nextLogicalStage = useMemo(() => {
    if (!order) return null;
    const currentIndex = STAGES.indexOf(order.stage);
    if (currentIndex === -1 || currentIndex === STAGES.length - 1) return null; // End of line
    if (order.stage === 'CANCELLED') return null;
    return STAGES[currentIndex + 1];
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="h-12 w-12 bg-slate-200 rounded-xl"></div>
          <div className="h-4 w-32 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const customer = order.customer || {};
  const terminal = ["DELIVERED", "CANCELLED"].includes(order.stage);
  const currentStageStyle = stageStyles[order.stage] || stageStyles.PLACED;
  const StatusIcon = currentStageStyle.icon;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 font-sans text-slate-800">

      {/* Toast Notification */}
      {toast.message && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${toast.type === "success" ? "bg-white border-emerald-100 text-emerald-800" : "bg-white border-red-100 text-red-800"
          }`}>
          {toast.type === "success" ? <CheckCircleIcon className="h-5 w-5 text-emerald-500" /> : <XCircleIcon className="h-5 w-5 text-red-500" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate("/admin/orders")}
            className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Orders
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()} // Simple print trigger
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              <PrinterIcon className="h-4 w-4" />
              Invoice
            </button>
            <button
              onClick={loadOrder}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              <RefreshIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className={`absolute top-0 right-0 w-64 h-64 opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl ${currentStageStyle.bg.replace('bg-', 'bg-gradient-to-br from-transparent to-')}`}></div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  Order #{order._id.slice(-6).toUpperCase()}
                  <button
                    onClick={() => copyToClipboard(order._id)}
                    className="text-slate-300 hover:text-orange-500 transition-colors p-1" title="Copy Full ID"
                  >
                    <DuplicateIcon className="h-5 w-5" />
                  </button>
                </h1>
              </div>
              <p className="text-slate-500 text-sm flex items-center gap-2">
                Placed on <span className="font-medium text-slate-700">{formatDateTime(order.createdAt)}</span>
                <span className="text-slate-300">•</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentStageStyle.bg} ${currentStageStyle.text} ${currentStageStyle.border}`}>
                  <StatusIcon className="h-3 w-3" />
                  {order.stage.replace(/_/g, " ")}
                </span>
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-sm font-medium text-slate-500">Total Amount</p>
              <p className="text-4xl font-bold text-slate-900 tracking-tight">
                ₹{order.totalPrice?.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Enhanced Stepper */}
          <div className="mt-12 mb-4 hidden lg:block">
            <div className="relative flex items-center justify-between w-full">
              {/* Background Line */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1.5 bg-slate-100 rounded-full"></div>

              {/* Progress Fill */}
              <div
                className={`absolute left-0 top-1/2 transform -translate-y-1/2 h-1.5 transition-all duration-700 ease-out rounded-full shadow-sm
                    ${order.stage === 'CANCELLED' ? 'bg-red-500' : 'bg-gradient-to-r from-orange-400 to-orange-600'}
                  `}
                style={{ width: `${(Math.max(0, STAGES.indexOf(order.stage)) / (STAGES.length - 1)) * 100}%` }}
              ></div>

              {STAGES.map((stage, idx) => {
                const isCompleted = STAGES.indexOf(order.stage) >= idx;
                const isCurrent = order.stage === stage;
                const isCancelled = order.stage === "CANCELLED";

                let dotClass = "bg-white border-2 border-slate-200 text-slate-300";
                let textClass = "text-slate-400 font-medium";

                if (isCancelled && stage === "CANCELLED") {
                  dotClass = "bg-red-500 border-red-500 text-white shadow-md shadow-red-200";
                  textClass = "text-red-600 font-bold";
                } else if (isCurrent) {
                  dotClass = "bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-200 scale-110";
                  textClass = "text-orange-700 font-bold";
                } else if (isCompleted) {
                  dotClass = "bg-orange-500 border-orange-500 text-white";
                  textClass = "text-slate-600 font-semibold";
                }

                return (
                  <div key={stage} className="relative z-10 flex flex-col items-center group">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${dotClass}`}>
                      {isCompleted || isCancelled ? <CheckCircleIcon className="h-5 w-5" /> : <div className="h-2.5 w-2.5 bg-current rounded-full opacity-50" />}
                    </div>
                    <span className={`absolute top-10 text-[10px] uppercase tracking-wider whitespace-nowrap transition-colors ${textClass}`}>
                      {stage.replace(/_/g, " ")}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}
          <div className="xl:col-span-2 space-y-6">

            {/* Action Center (The Workflow Engine) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ClipboardCheckIcon className="h-4 w-4 text-orange-500" />
                  Manage Order Status
                </h3>
              </div>

              {!terminal ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Primary Action: The Next Logical Step */}
                  {nextLogicalStage && (
                    <button
                      disabled={updating}
                      onClick={() => updateStage(nextLogicalStage)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Mark as {nextLogicalStage.replace(/_/g, " ")}</span>
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  )}

                  {/* Secondary Actions: Dropdown or List */}
                  <div className="flex flex-wrap gap-2 flex-1">
                    {STAGES.filter(s => s !== "CANCELLED" && s !== nextLogicalStage && s !== order.stage).map((s) => (
                      <button
                        key={s}
                        disabled={updating}
                        onClick={() => updateStage(s)}
                        className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-white hover:border-orange-200 hover:text-orange-600 transition-all"
                      >
                        {s.replace(/_/g, " ")}
                      </button>
                    ))}
                    <button
                      onClick={() => updateStage("CANCELLED")}
                      className="px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-semibold hover:bg-red-100 transition-all ml-auto"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-slate-500 font-medium text-sm">
                    This order is closed ({order.stage.replace(/_/g, " ")}) and requires no further action.
                  </p>
                </div>
              )}
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CubeIcon className="h-4 w-4 text-orange-500" />
                  Order Items
                </h3>
                <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                  {order.products?.length} Items
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3 text-left">Product</th>
                      <th className="px-6 py-3 text-center">Price</th>
                      <th className="px-6 py-3 text-center">Qty</th>
                      <th className="px-6 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.products?.map((p, idx) => (
                      <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 group-hover:border-orange-200 transition-colors">
                              {p.image ? (
                                <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-300">
                                  <CubeIcon className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 line-clamp-1">{p.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">SKU: VK-{idx + 1024}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-slate-600">₹{p.price?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center text-sm font-medium text-slate-900">{p.quantity}</td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-slate-800">
                          ₹{((p.price || 0) * (p.quantity || 0)).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-orange-500" />
                Timeline
              </h3>
              <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pb-2">
                {timeline.map((entry, idx) => {
                  const isLatest = idx === 0;
                  return (
                    <div key={idx} className="relative pl-8 group">
                      <span className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white shadow-sm transition-all duration-300
                          ${isLatest ? 'bg-orange-500 ring-4 ring-orange-50 scale-110' : 'bg-slate-300 group-hover:bg-slate-400'}
                        `}></span>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className={`text-sm font-bold ${isLatest ? 'text-slate-900' : 'text-slate-600'}`}>
                          {entry.stage.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {formatDateTime(entry.date)}
                        </span>
                      </div>
                      {entry.note && (
                        <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 inline-block">
                          {entry.note}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Info Sidebars */}
          <div className="space-y-6">

            {/* Customer Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-orange-500" />
                  Customer
                </h3>
                <span className="text-xs font-medium text-orange-600 hover:underline cursor-pointer">View Profile</span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 flex items-center justify-center text-lg font-bold shadow-sm ring-2 ring-white">
                  {customer.name ? customer.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-base font-bold text-slate-900 truncate">{customer.name || "Guest"}</p>
                  <p className="text-xs text-slate-500 truncate">Customer since 2024</p>
                </div>
              </div>

              <div className="space-y-3">
                {customer.email && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group cursor-pointer">
                    <div className="bg-white p-1.5 rounded-lg shadow-sm text-slate-400 group-hover:text-orange-500 transition-colors">
                      <MailIcon className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-slate-600 font-medium truncate">{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group cursor-pointer">
                    <div className="bg-white p-1.5 rounded-lg shadow-sm text-slate-400 group-hover:text-orange-500 transition-colors">
                      <PhoneIcon className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-slate-600 font-medium">{customer.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <LocationMarkerIcon className="h-4 w-4 text-orange-500" />
                Delivery Details
              </h3>
              <div className="relative p-4 bg-slate-50/80 rounded-xl border border-slate-100">
                {/* Decorator */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-orange-600 rounded-l-xl"></div>
                <p className="text-sm text-slate-700 leading-relaxed font-medium pl-2">
                  {order.shippingAddress || "No shipping address provided."}
                </p>
              </div>
            </div>

            {/* Payment Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCardIcon className="h-4 w-4 text-orange-500" />
                Payment
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <p className="text-xs text-slate-500 mb-1">Method</p>
                    <p className="text-sm font-bold text-slate-800 uppercase">{order.paymentMethod || "COD"}</p>
                  </div>
                  <div className={`p-3 rounded-xl border text-center
                      ${order.paymentStatus === 'PAID' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'}
                   `}>
                    <p className="text-xs opacity-80 mb-1">Status</p>
                    <p className="text-sm font-bold uppercase">{order.paymentStatus || "PENDING"}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Shipping</span>
                    <span>₹{order.shipping?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Tax</span>
                    <span>₹{order.tax?.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-base font-bold text-slate-900">Total Paid</span>
                    <span className="text-xl font-bold text-slate-900">₹{order.totalPrice?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}