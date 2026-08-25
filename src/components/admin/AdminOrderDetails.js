import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import axiosInstance from "../axiosInstance";
import { qk } from "../../query/queryKeys";
import usePermission from "./usePermission";

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
  const queryClient = useQueryClient();
  const { canWrite } = usePermission("orders");

  const [toast, setToast] = useState({ type: "", message: "" });
  const apiBase =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? "http://localhost:5000"
      : (process.env.REACT_APP_API_BASE_URL || "");

  const showToast = (type, message, ms = 3000) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), ms);
  };

  // --- Function to copy Order ID ---
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast("success", "Order ID copied to clipboard!");
  };

  const orderQuery = useQuery({
    queryKey: qk.admin.order(id),
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/admin/orders/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });

  const order = orderQuery.data || null;
  const loading = orderQuery.isLoading;

  useEffect(() => {
    if (orderQuery.isError) {
      showToast("error", "Failed to load order details.");
    }
  }, [orderQuery.isError]);

  const updateStageMutation = useMutation({
    mutationFn: async (stage) => {
      const res = await axiosInstance.patch(`/api/admin/orders/${id}/stage`, { stage });
      return { stage, data: res.data };
    },
    onSuccess: ({ stage, data }) => {
      queryClient.setQueryData(qk.admin.order(id), (prev) => data.order || (prev ? { ...prev, stage } : prev));
      queryClient.invalidateQueries({ queryKey: qk.admin.orders });
      queryClient.invalidateQueries({ queryKey: qk.admin.dashboard });
      showToast("success", `Status updated to ${stage.replace(/_/g, " ")}`);
    },
    onError: (err) => {
      showToast("error", err?.message || "Failed to update status.");
    },
  });

  const updateReturnMutation = useMutation({
    mutationFn: async (status) => {
      const res = await axiosInstance.patch(`/api/admin/orders/${id}/return`, { status });
      return { status, data: res.data };
    },
    onSuccess: ({ status, data }) => {
      queryClient.setQueryData(qk.admin.order(id), (prev) => data.order || prev);
      queryClient.invalidateQueries({ queryKey: qk.admin.orders });
      queryClient.invalidateQueries({ queryKey: qk.admin.dashboard });
      showToast("success", `Return status: ${status}`);
    },
    onError: () => {
      showToast("error", "Failed to update return status.");
    },
  });

  const refundMutation = useMutation({
    mutationFn: async (method) => {
      const res = await axiosInstance.post(`/api/admin/orders/${id}/refund`, { method });
      return { method, data: res.data };
    },
    onSuccess: ({ method, data }) => {
      queryClient.setQueryData(qk.admin.order(id), (prev) => data.order || prev);
      queryClient.invalidateQueries({ queryKey: qk.admin.orders });
      queryClient.invalidateQueries({ queryKey: qk.admin.dashboard });
      showToast("success", `Refund ${method}`);
    },
    onError: () => {
      showToast("error", "Failed to initiate refund.");
    },
  });

  const replacementMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(`/api/admin/orders/${id}/replacement`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(qk.admin.order(id), (prev) =>
        data.replacement ? { ...prev, replacementOrderId: data.replacement._id } : prev
      );
      queryClient.invalidateQueries({ queryKey: qk.admin.orders });
      queryClient.invalidateQueries({ queryKey: qk.admin.dashboard });
      showToast("success", "Replacement created");
    },
    onError: () => {
      showToast("error", "Replacement failed");
    },
  });

  const updateStage = async (stage) => {
    if (!order) return;
    if (["DELIVERED", "CANCELLED"].includes(order.stage)) {
      showToast("error", "Order is closed and cannot be modified.");
      return;
    }
    if (stage === order.stage) return;

    try {
      await updateStageMutation.mutateAsync(stage);
    } catch {
      // Error toast is handled in mutation callbacks.
    }
  };

  const updateReturn = async (status) => {
    if (!order) return;
    try {
      await updateReturnMutation.mutateAsync(status);
    } catch {
      // Error toast is handled in mutation callbacks.
    }
  };

  const initiateRefund = async (method) => {
    if (!order) return;
    try {
      await refundMutation.mutateAsync(method);
    } catch {
      // Error toast is handled in mutation callbacks.
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
      <div className="premium-admin-page min-h-screen bg-transparent flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="h-12 w-12 bg-slate-200 rounded-xl"></div>
          <div className="h-4 w-32 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    // The fetch-error toast set above can never reach the screen without this:
    // previously this branch was a bare `return null`, so a failed or missing
    // order left admins staring at a blank page with no feedback at all —
    // even though `orderQuery.isError` already set an error toast in state.
    return (
      <div className="premium-admin-page min-h-screen bg-transparent flex flex-col items-center justify-center p-6 gap-4">
        {toast.message && (
          <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${toast.type === "success" ? "bg-white border-emerald-100 text-emerald-800" : "bg-white border-red-100 text-red-800"
            }`}>
            {toast.type === "success" ? <CheckCircleIcon className="h-5 w-5 text-emerald-500" /> : <XCircleIcon className="h-5 w-5 text-red-500" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        )}
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900">Order not found</h2>
          <p className="text-slate-500 text-sm mt-1">This order may have been removed, or the link is invalid.</p>
        </div>
        <button
          onClick={() => navigate("/admin/orders")}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-black transition-all"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const customer = order.customer || {};
  const terminal = ["DELIVERED", "CANCELLED"].includes(order.stage);
  const currentStageStyle = stageStyles[order.stage] || stageStyles.PLACED;
  const StatusIcon = currentStageStyle.icon;

  return (
    <div className="premium-admin-page min-h-screen bg-transparent p-3.5 sm:p-8 font-sans text-[#24231f]">

      {/* Toast Notification */}
      {toast.message && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${toast.type === "success" ? "bg-white border-emerald-100 text-emerald-800" : "bg-white border-red-100 text-red-800"
          }`}>
          {toast.type === "success" ? <CheckCircleIcon className="h-5 w-5 text-emerald-500" /> : <XCircleIcon className="h-5 w-5 text-red-500" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* Top Navigation & Actions */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => navigate("/admin/orders")}
            className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Orders</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all active:scale-95"
            >
              <PrinterIcon className="h-4 w-4" />
              <span>Invoice</span>
            </button>
            <button
              onClick={() => window.open(`${apiBase}/api/orders/${order._id}/invoice`, "_blank")}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-black transition-all active:scale-95"
            >
              <span>PDF</span>
            </button>
            <button
              onClick={() => orderQuery.refetch()}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all active:scale-95"
            >
              <RefreshIcon className={`h-3.5 w-3.5 ${orderQuery.isFetching ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-4 sm:p-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className={`absolute top-0 right-0 w-64 h-64 opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl ${currentStageStyle.bg.replace('bg-', 'bg-gradient-to-br from-transparent to-')}`}></div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-6 relative z-10">
            <div className="space-y-1 sm:space-y-1.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">Order</span>
                <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60 break-all">
                  #{order.orderId || order._id.slice(-6).toUpperCase()}
                </span>
                <button
                  onClick={() => copyToClipboard(order.orderId || order._id)}
                  className="text-slate-400 hover:text-orange-500 transition-colors p-1 rounded-md hover:bg-slate-100"
                  title="Copy Full ID"
                >
                  <DuplicateIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
              <div className="text-slate-500 text-[11px] sm:text-xs flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span>Placed {formatDateTime(order.createdAt)}</span>
                <span className="text-slate-300">•</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border ${currentStageStyle.bg} ${currentStageStyle.text} ${currentStageStyle.border}`}>
                  <StatusIcon className="h-3 w-3" />
                  {order.stage.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex sm:block items-center justify-between">
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Total Amount</p>
              <p className="text-base sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                ₹{order.totalPrice?.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Enhanced Stepper */}
          <div className="mt-10 mb-2 hidden lg:block">
            <div className="relative flex items-center justify-between w-full">
              {/* Background Line */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1.5 bg-slate-100 rounded-full"></div>

              {/* Progress Fill */}
              <div
                className={`absolute left-0 top-1/2 transform -translate-y-1/2 h-1.5 transition-all duration-700 ease-out rounded-full shadow-xs
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
                  dotClass = "bg-red-500 border-red-500 text-white shadow-xs shadow-red-200";
                  textClass = "text-red-600 font-bold";
                } else if (isCurrent) {
                  dotClass = "bg-orange-600 border-orange-600 text-white shadow-xs shadow-orange-200 scale-110";
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">

          {/* LEFT COLUMN */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">

            {/* Action Center (The Workflow Engine) */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardCheckIcon className="h-4 w-4 text-orange-500" />
                  Manage Order Status
                </h3>
                {nextLogicalStage && canWrite && !terminal && (
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                    Next: <strong className="text-slate-700">{nextLogicalStage.replace(/_/g, " ")}</strong>
                  </span>
                )}
              </div>

              {!terminal ? (
                canWrite ? (
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {/* Primary Action: The Next Logical Step (Compact) */}
                    {nextLogicalStage && (
                      <button
                        disabled={updateStageMutation.isPending}
                        onClick={() => updateStage(nextLogicalStage)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-2xs hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>Mark as {nextLogicalStage.replace(/_/g, " ")}</span>
                        <ChevronRightIcon className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {/* Secondary Actions: Pills Grid */}
                    {STAGES.filter(s => s !== "CANCELLED" && s !== nextLogicalStage && s !== order.stage).map((s) => (
                      <button
                        key={s}
                        disabled={updateStageMutation.isPending}
                        onClick={() => updateStage(s)}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 hover:text-slate-900 transition-all disabled:opacity-50"
                      >
                        {s.replace(/_/g, " ")}
                      </button>
                    ))}

                    <button
                      disabled={updateStageMutation.isPending}
                      onClick={() => updateStage("CANCELLED")}
                      className="px-3 py-1.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold hover:bg-red-100 transition-all sm:ml-auto"
                    >
                      Cancel Order
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <p className="text-slate-500 font-medium text-xs">
                      You have read-only access and cannot modify this order.
                    </p>
                  </div>
                )
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-slate-500 font-medium text-xs">
                    This order is closed ({order.stage.replace(/_/g, " ")}) and requires no further action.
                  </p>
                </div>
              )}
            </div>

            {/* Products Card / Table */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
              <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CubeIcon className="h-4 w-4 text-orange-500" />
                  Order Items
                </h3>
                <span className="text-[11px] sm:text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                  {order.products?.length} Items
                </span>
              </div>

              {/* Mobile View (< md) */}
              <div className="block md:hidden divide-y divide-slate-100">
                {order.products?.map((p, idx) => (
                  <div key={idx} className="p-3 flex items-center gap-3">
                    <div className="h-12 w-12 flex-shrink-0 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 p-0.5">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="h-full w-full object-contain mix-blend-multiply" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-300">
                          <CubeIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</p>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-slate-400">SKU: VK-{idx + 1024}</span>
                        <span>·</span>
                        <span>Qty: {p.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-black text-slate-900">₹{((p.price || 0) * (p.quantity || 0)).toLocaleString('en-IN')}</p>
                      {p.quantity > 1 && (
                        <p className="text-[10px] text-slate-400">₹{p.price?.toLocaleString('en-IN')} ea</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto">
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
                                <img src={p.image} alt={p.name} className="h-full w-full object-contain" />
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
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-4 sm:p-6">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 sm:mb-6 flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4 text-orange-500" />
                Timeline
              </h3>
              <div className="relative border-l-2 border-slate-100 ml-2.5 sm:ml-3 space-y-6 sm:space-y-8 pb-1">
                {timeline.map((entry, idx) => {
                  const isLatest = idx === 0;
                  return (
                    <div key={idx} className="relative pl-6 sm:pl-8 group">
                      <span className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white shadow-xs transition-all duration-300
                          ${isLatest ? 'bg-orange-500 ring-4 ring-orange-50 scale-110' : 'bg-slate-300 group-hover:bg-slate-400'}
                        `}></span>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 sm:gap-1">
                        <span className={`text-xs sm:text-sm font-bold ${isLatest ? 'text-slate-900' : 'text-slate-600'}`}>
                          {entry.stage.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] sm:text-xs text-slate-400 font-mono">
                          {formatDateTime(entry.date)}
                        </span>
                      </div>
                      {entry.note && (
                        <p className="mt-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 inline-block">
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
          <div className="space-y-4 sm:space-y-6">

            {/* Customer Card */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="h-4 w-4 text-orange-500" />
                  Customer
                </h3>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 flex items-center justify-center text-sm sm:text-lg font-bold shadow-xs ring-2 ring-white shrink-0">
                  {customer.name ? customer.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm sm:text-base font-bold text-slate-900 truncate">{customer.name || "Guest"}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 truncate">Customer since 2024</p>
                </div>
              </div>

              <div className="space-y-2">
                {customer.email && (
                  <div className="flex items-center gap-2.5 p-2 sm:p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group cursor-pointer">
                    <div className="bg-white p-1 rounded-lg shadow-xs text-slate-400 group-hover:text-orange-500 transition-colors">
                      <MailIcon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm text-slate-600 font-medium truncate">{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2.5 p-2 sm:p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group cursor-pointer">
                    <div className="bg-white p-1 rounded-lg shadow-xs text-slate-400 group-hover:text-orange-500 transition-colors">
                      <PhoneIcon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm text-slate-600 font-medium">{customer.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Card */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-4 sm:p-6">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <LocationMarkerIcon className="h-4 w-4 text-orange-500" />
                Delivery Details
              </h3>
              <div className="relative p-3 sm:p-4 bg-slate-50/80 rounded-xl border border-slate-100">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-orange-600 rounded-l-xl"></div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium pl-1.5">
                  {order.shippingAddress || "No shipping address provided."}
                </p>
              </div>
            </div>

            {/* Payment Card */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-4 sm:p-6">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CreditCardIcon className="h-4 w-4 text-orange-500" />
                Payment
              </h3>

              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Method</p>
                    <p className="text-xs sm:text-sm font-bold text-slate-800 uppercase">{order.paymentMethod || "COD"}</p>
                  </div>
                  <div className={`p-2.5 sm:p-3 rounded-xl border text-center
                      ${order.paymentStatus === 'PAID' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'}
                   `}>
                    <p className="text-[10px] uppercase font-bold opacity-80 mb-0.5">Status</p>
                    <p className="text-xs sm:text-sm font-bold uppercase">{order.paymentStatus || "PENDING"}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-xs sm:text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm text-slate-600">
                    <span>Shipping</span>
                    <span>₹{order.shipping?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm text-slate-600">
                    <span>Tax</span>
                    <span>₹{order.tax?.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 mt-1 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">Total Paid</span>
                    <span className="text-base sm:text-xl font-black text-slate-900">₹{order.totalPrice?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Returns & Refunds */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-4 sm:p-8">
          <h3 className="text-sm sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">Returns & Refunds</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <div className="p-2.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Return Status</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-900">{order.returnStatus || "NONE"}</div>
            </div>
            <div className="p-2.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Refund Status</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-900">{order.refundStatus || "NONE"}</div>
            </div>
            <div className="p-2.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Refund Method</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-900">{order.refundMethod || "-"}</div>
            </div>
            <div className="p-2.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Return Type</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-900">{order.returnType || "-"}</div>
            </div>
          </div>

          {canWrite && (
          <div className="mt-4 sm:mt-6">
            {order.returnStatus && order.returnStatus !== "NONE" ? (
              <div className="flex flex-wrap gap-2">
                {["APPROVED", "PICKED", "RECEIVED", "REJECTED", "CLOSED"].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateReturn(s)}
                    disabled={updateReturnMutation.isPending}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    Set {s}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No return has been requested for this order yet.</p>
            )}
          </div>
          )}

          {canWrite && (
          <div className="mt-3 sm:mt-4">
            {(() => {
              const refundEligible = order.stage === "CANCELLED" || ["APPROVED", "PICKED", "RECEIVED"].includes(order.returnStatus);
              const refundAlreadyHandled = order.refundStatus && order.refundStatus !== "NONE" && order.refundStatus !== "FAILED";

              if (refundAlreadyHandled) {
                return <p className="text-xs text-slate-400 italic">A refund has already been {order.refundStatus.toLowerCase()} for this order.</p>;
              }
              if (!refundEligible) {
                return (
                  <p className="text-xs text-slate-400 italic">
                    Refunds are only available for cancelled orders, or once a return has been approved.
                  </p>
                );
              }
              return (
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <button
                    onClick={() => initiateRefund("WALLET")}
                    disabled={refundMutation.isPending}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs hover:bg-black disabled:opacity-60"
                  >
                    Refund to Wallet
                  </button>
                  <button
                    onClick={() => initiateRefund("ORIGINAL")}
                    disabled={refundMutation.isPending}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    Refund to Original
                  </button>
                  {order.returnType === "REPLACEMENT" && order.returnStatus === "RECEIVED" && !order.replacementOrderId && (
                    <button
                      onClick={() => replacementMutation.mutate()}
                      disabled={replacementMutation.isPending}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                    >
                      Create Replacement Order
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
