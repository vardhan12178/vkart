import React from "react";
import OrderStages from "../OrderStages";
import {
  CircleCheckIcon,
  FileDownIcon,
  MapPinIcon,
  PackageIcon,
  ReceiptIcon,
  Undo2Icon,
  XIcon,
} from "../ui/icons";
import { formatINR } from "../../utils/format";
import { apiBase } from "./orderStyles";

export default function OrderDetails({ order, onReturn, onCancel }) {
  const stage = order.stage || "PLACED";
  return (
    <div className="border-t border-line bg-sand/60 p-3.5 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-5">
        {/* Column 1: Delivery & Payment Details */}
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-line shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-light uppercase tracking-wider mb-2">
              <MapPinIcon className="text-accent" />
              <span>Delivery Address</span>
            </div>
            <p className="text-xs font-medium text-ink-soft leading-relaxed whitespace-pre-line">
              {order.shippingAddress || "No shipping address specified"}
            </p>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-line shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-light uppercase tracking-wider mb-2">
              <ReceiptIcon className="text-ok" />
              <span>Payment Summary</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Payment Method</span>
                <span className="font-bold text-ink">Online (Prepaid)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Payment Status</span>
                <span className="font-bold text-ok inline-flex items-center gap-1">
                  <CircleCheckIcon size={10} /> Paid
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Items Ordered List */}
        <div>
          <div className="bg-white rounded-xl border border-line shadow-2xs overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-line bg-sand/50">
              <h4 className="text-[11px] font-bold text-muted-light uppercase tracking-wider">
                Items Ordered ({order.products?.length || 0})
              </h4>
            </div>
            <div className="divide-y divide-line max-h-56 overflow-y-auto">
              {(order.products || []).map((p, i) => (
                <div
                  key={i}
                  className="p-2.5 sm:p-3 flex items-center gap-3 hover:bg-sand/80 transition"
                >
                  <div className="w-10 h-10 max-w-[40px] max-h-[40px] rounded-lg bg-sand border border-line p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    {p.image || p.thumbnail ? (
                      <img
                        src={p.image || p.thumbnail}
                        alt={p.name}
                        className="w-full h-full max-w-full max-h-full object-contain mix-blend-multiply"
                      />
                    ) : (
                      <PackageIcon className="text-xl text-muted-light" aria-label="No image" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-ink truncate">{p.name}</p>
                    <p className="text-[11px] text-muted-light">Qty: {p.quantity}</p>
                  </div>
                  <div className="text-xs font-bold text-ink shrink-0">
                    {formatINR(p.lineTotal ?? p.price * p.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-line shadow-2xs">
        <h4 className="text-xs font-bold text-ink mb-3 sm:mb-4 flex items-center gap-1.5">
          <PackageIcon className="text-accent" />
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
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-line-strong text-xs font-bold text-ink-soft hover:bg-tint transition shadow-2xs"
        >
          <FileDownIcon size={11} className="text-muted" />
          <span>Download Invoice</span>
        </button>

        {stage === "DELIVERED" && (
          <>
            {order.returnStatus && order.returnStatus !== "NONE" ? (
              <span className="text-xs font-bold text-accent px-3 py-1.5 bg-accent/10 rounded-xl border border-accent/30">
                Return: {order.returnStatus}
              </span>
            ) : (
              <button
                onClick={onReturn}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-ink text-white text-xs font-bold shadow-2xs hover:bg-black transition disabled:opacity-60"
              >
                <Undo2Icon size={10} />
                <span>Request Return</span>
              </button>
            )}
          </>
        )}

        {["PLACED", "CONFIRMED", "PROCESSING", "PACKED"].includes(stage) && (
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-alert/30 bg-alert/10 text-xs font-bold text-alert hover:bg-alert/10 transition shadow-2xs"
          >
            <XIcon size={10} />
            <span>Cancel Order</span>
          </button>
        )}
      </div>
    </div>
  );
}
