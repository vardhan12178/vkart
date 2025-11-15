import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "./axiosInstance";
import {
  ArrowLeftIcon,
  LocationMarkerIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  ClockIcon,
  RefreshIcon,
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

const stageBadges = {
  PLACED: "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  PACKED: "bg-amber-100 text-amber-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-sky-100 text-sky-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const stageDotColors = {
  PLACED: "bg-gray-400",
  CONFIRMED: "bg-blue-500",
  PROCESSING: "bg-indigo-500",
  PACKED: "bg-amber-500",
  SHIPPED: "bg-purple-500",
  OUT_FOR_DELIVERY: "bg-sky-500",
  DELIVERED: "bg-green-500",
  CANCELLED: "bg-red-500",
};

const stageLineColors = {
  PLACED: "border-gray-300",
  CONFIRMED: "border-blue-400",
  PROCESSING: "border-indigo-400",
  PACKED: "border-amber-400",
  SHIPPED: "border-purple-400",
  OUT_FOR_DELIVERY: "border-sky-400",
  DELIVERED: "border-green-400",
  CANCELLED: "border-red-400",
};

function formatDateTime(isoStr) {
  if (!isoStr) return "-";
  const d = new Date(isoStr);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [toast, setToast] = useState({ type: "", message: "" });

  const showToast = (type, message, ms = 2200) => {
    setToast({ type, message });
    if (ms > 0) {
      setTimeout(() => setToast({ type: "", message: "" }), ms);
    }
  };

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      });
      setOrder(res.data);
    } catch (err) {
      console.error("Order load error:", err);
      showToast("error", "Failed to load order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStage = async (stage) => {
    if (!order) return;

    // Guard on client also – DELIVERED/CANCELLED should not move
    if (["DELIVERED", "CANCELLED"].includes(order.stage)) {
      showToast("error", "Order is already completed or cancelled.");
      return;
    }

    if (stage === order.stage) return;

    try {
      setUpdating(true);
      const res = await axios.patch(
        `/api/admin/orders/${id}/stage`,
        { stage },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
        }
      );

      if (res.data?.order) {
        setOrder(res.data.order);
        showToast("success", "Order status updated.");
      } else {
        // fallback
        setOrder((prev) => (prev ? { ...prev, stage } : prev));
        showToast("success", "Order status updated.");
      }
    } catch (err) {
      console.error("Stage update error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.msg ||
        "Failed to update status.";
      showToast("error", msg);
    } finally {
      setUpdating(false);
    }
  };

  const stageIndex = useMemo(() => {
    if (!order?.stage) return 0;
    const idx = STAGES.indexOf(order.stage);
    return idx === -1 ? 0 : idx;
  }, [order?.stage]);

  const timeline = useMemo(() => {
    if (!order) return [];
    const history = Array.isArray(order.statusHistory)
      ? order.statusHistory
      : [];

    if (history.length === 0 && order.stage) {
      return [
        {
          stage: order.stage,
          date: order.updatedAt || order.createdAt || new Date().toISOString(),
          note: "",
        },
      ];
    }

    const cleaned = history
      .filter((h) => h && h.stage)
      .map((h) => ({
        stage: h.stage,
        date: h.date || order.createdAt,
        note: h.note || "",
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return cleaned;
  }, [order]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading order…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-gray-500">
        Order not found.
      </div>
    );
  }

  const customer = order.customer || {};
  const orderLabel = order.orderId || `#${order._id}`;
  const terminal = ["DELIVERED", "CANCELLED"].includes(order.stage);

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      {toast.message && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-2 text-sm shadow-lg border
          ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate("/admin/orders")}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-600"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Orders
        </button>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <ClockIcon className="h-4 w-4" />
          <span>Created: {formatDateTime(order.createdAt)}</span>
          <span className="mx-1">•</span>
          <span>Last updated: {formatDateTime(order.updatedAt)}</span>
          <button
            onClick={loadOrder}
            className="ml-3 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 hover:bg-gray-50 text-xs"
          >
            <RefreshIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order{" "}
            <span className="text-orange-600">
              {orderLabel}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage status, review items and track this order’s journey.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
              stageBadges[order.stage] || "bg-gray-100 text-gray-700"
            }`}
          >
            {order.stage.replace(/_/g, " ")}
          </span>
          <span className="text-xs text-gray-500 border rounded-full px-3 py-1 bg-white">
            Total: <span className="font-semibold text-gray-800">₹{order.totalPrice}</span>
          </span>
        </div>
      </div>

      {/* Stage Stepper + Timeline + Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT: Stepper + Timeline */}
        <div className="xl:col-span-2 space-y-6">
          {/* Stepper */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800">
                Order Progress
              </h2>
              {terminal && (
                <span className="text-xs text-gray-500">
                  This order is now{" "}
                  <span className="font-semibold text-gray-800">
                    {order.stage.replace(/_/g, " ").toLowerCase()}
                  </span>
                  .
                </span>
              )}
            </div>

            <div className="relative flex items-center justify-between">
              <div className="absolute left-4 right-4 top-1/2 h-px bg-gray-200 -z-10" />

              {STAGES.map((stage, index) => {
                const activeIndex = stageIndex;
                const isCompleted = index < activeIndex;
                const isCurrent = index === activeIndex;
                const isCancelled = order.stage === "CANCELLED";

                // For cancelled, color all up to CANCELLED in red line
                const lineClass = isCancelled
                  ? stageLineColors.CANCELLED
                  : stageLineColors[order.stage] || "border-gray-300";

                return (
                  <div key={stage} className="relative flex-1 flex flex-col items-center">
                    {/* Connection line left (except first) */}
                    {index > 0 && (
                      <div
                        className={`absolute left-0 right-1/2 top-1/2 border-t ${
                          isCompleted || isCurrent
                            ? lineClass
                            : "border-gray-200"
                        }`}
                      />
                    )}

                    {/* Dot */}
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white
                      ${
                        isCurrent
                          ? "border-orange-500"
                          : isCompleted
                          ? "border-transparent"
                          : "border-gray-300"
                      }`}
                    >
                      <span
                        className={`h-3 w-3 rounded-full ${
                          isCompleted || isCurrent
                            ? stageDotColors[isCancelled ? "CANCELLED" : stage] ||
                              "bg-orange-500"
                            : "bg-gray-300"
                        }`}
                      />
                    </div>

                    {/* Label */}
                    <div className="mt-2 text-[10px] text-center uppercase tracking-wide text-gray-600">
                      {stage.replace(/_/g, " ")}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stage Buttons */}
            <div className="mt-6 flex flex-wrap gap-2">
              {STAGES.filter((s) => s !== "CANCELLED").map((s) => (
                <button
                  key={s}
                  disabled={updating || terminal}
                  onClick={() => updateStage(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border
                    ${
                      s === order.stage
                        ? "bg-orange-500 text-white border-orange-600"
                        : "bg-white text-gray-700 hover:bg-orange-50 border-gray-200"
                    }
                    ${terminal ? "opacity-60 cursor-not-allowed" : ""}
                  `}
                >
                  {s.replace(/_/g, " ")}
                </button>
              ))}

              {/* Cancel button */}
              <button
                disabled={updating || terminal}
                onClick={() => updateStage("CANCELLED")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border
                  ${
                    order.stage === "CANCELLED"
                      ? "bg-red-500 text-white border-red-600"
                      : "bg-white text-red-600 hover:bg-red-50 border-red-300"
                  }
                  ${terminal && order.stage !== "CANCELLED" ? "opacity-60 cursor-not-allowed" : ""}
                `}
              >
                Cancel Order
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">
              Activity Timeline
            </h2>

            {timeline.length === 0 ? (
              <p className="text-xs text-gray-500">No status history available.</p>
            ) : (
              <ol className="relative border-l border-gray-200 pl-4 space-y-4">
                {timeline.map((entry, idx) => {
                  const isLast = idx === timeline.length - 1;
                  const clr =
                    stageDotColors[entry.stage] || "bg-gray-400";

                  return (
                    <li key={idx} className="relative pl-4">
                      <span
                        className={`absolute -left-2 top-1.5 h-3 w-3 rounded-full ${clr} border-2 border-white shadow`}
                      />
                      {!isLast && (
                        <span className="absolute -left-[1px] top-4 bottom-0 w-px bg-gray-200" />
                      )}
                      <div className="text-xs font-semibold text-gray-800">
                        {entry.stage.replace(/_/g, " ")}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {formatDateTime(entry.date)}
                      </div>
                      {entry.note && (
                        <p className="text-xs text-gray-600 mt-1">{entry.note}</p>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>

        {/* RIGHT: Summary + Customer + Address */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">
              Payment & Summary
            </h2>

            <div className="flex justify-between text-xs text-gray-600">
              <span>Payment Status</span>
              <span className="font-semibold text-gray-800">
                {order.paymentStatus || "PENDING"}
              </span>
            </div>

            <div className="flex justify-between text-xs text-gray-600">
              <span>Payment Method</span>
              <span className="font-semibold text-gray-800">
                {order.paymentMethod || "COD"}
              </span>
            </div>

            <div className="border-t border-dashed my-2" />

            <div className="flex justify-between text-xs text-gray-600">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Tax (GST)</span>
              <span>₹{order.tax}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Shipping</span>
              <span>₹{order.shipping}</span>
            </div>

            {order.promo && (
              <div className="flex justify-between text-xs text-gray-600">
                <span>Promo</span>
                <span className="font-mono uppercase">{order.promo}</span>
              </div>
            )}

            <div className="border-t border-dashed my-2" />

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-700">
                Total ({order.currency || "INR"})
              </span>
              <span className="text-lg font-bold text-gray-900">
                ₹{order.totalPrice}
              </span>
            </div>
          </div>

          {/* Customer Card */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">
              Customer
            </h2>

            <div className="flex items-center gap-2 text-xs text-gray-700">
              <UserIcon className="h-4 w-4 text-gray-500" />
              <span>{customer.name || "Unknown Customer"}</span>
            </div>

            {customer.email && (
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <MailIcon className="h-4 w-4 text-gray-500" />
                <span>{customer.email}</span>
              </div>
            )}

            {customer.phone && (
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <PhoneIcon className="h-4 w-4 text-gray-500" />
                <span>{customer.phone}</span>
              </div>
            )}
          </div>

          {/* Address Card */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <LocationMarkerIcon className="h-4 w-4 text-gray-600" />
              Shipping Address
            </h2>
            <p className="text-xs text-gray-700 whitespace-pre-line">
              {order.shippingAddress || "-"}
            </p>
          </div>

          {/* Items Summary Card (compact) */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">
              Items ({order.products?.length || 0})
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {order.products?.map((p, idx) => {
                const lineTotal = p.lineTotal ?? (p.price || 0) * (p.quantity || 0);
                return (
                  <div key={idx} className="flex items-center gap-3">
                    {p.image && (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-12 w-12 rounded-md border object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-800 line-clamp-2">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Qty: {p.quantity} • ₹{p.price}
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-gray-800">
                      ₹{lineTotal}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
