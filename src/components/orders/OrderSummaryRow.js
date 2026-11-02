import React from "react";
import { ChevronDownIcon, PackageIcon, ShoppingBagIcon } from "../ui/icons";
import { formatINR } from "../../utils/format";
import OrderStatusBadge from "./OrderStatusBadge";

export default function OrderSummaryRow({ order, open, onToggle }) {
  const firstProduct = order.products?.[0] || {};
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return (
    <div className="p-3.5 sm:p-5 cursor-pointer select-none" onClick={() => onToggle()}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Thumbnail + Name + Date + Status */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 max-w-[56px] max-h-[56px] sm:max-w-[64px] sm:max-h-[64px] rounded-xl bg-sand border border-line p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
            {firstProduct.image || firstProduct.thumbnail ? (
              <img
                src={firstProduct.image || firstProduct.thumbnail}
                alt={firstProduct.name || "Product"}
                className="w-full h-full max-w-full max-h-full object-contain mix-blend-multiply"
              />
            ) : (
              <PackageIcon className="text-2xl text-muted-light" aria-label="No image" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h3 className="text-xs sm:text-sm font-bold text-ink tracking-tight truncate">
                {(() => {
                  const products = order.products || [];
                  if (products.length === 0) return "Order";
                  const names = products
                    .slice(0, 2)
                    .map((p) => p.name)
                    .join(", ");
                  const more = products.length > 2 ? ` +${products.length - 2} more` : "";
                  return names + more;
                })()}
              </h3>

              <OrderStatusBadge order={order} />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted-light font-medium">
              <span>{orderDate}</span>
              {order._id && (
                <span className="hidden sm:inline font-mono text-[10px] text-muted-faint">
                  #{order._id.substring(order._id.length - 8)}
                </span>
              )}
            </div>

            {/* Status Badge on Mobile */}
            <div className="sm:hidden mt-1.5">
              <OrderStatusBadge order={order} mobile />
            </div>
          </div>
        </div>

        {/* Right: Total + Items + Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 border-t sm:border-t-0 border-line pt-2 sm:pt-0">
          <div className="flex items-center gap-4 sm:gap-6">
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold text-muted-light uppercase tracking-wider">
                Total
              </p>
              <p className="text-xs sm:text-sm font-bold text-ink">{formatINR(order.totalPrice)}</p>
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold text-muted-light uppercase tracking-wider">
                Items
              </p>
              <p className="text-xs sm:text-sm font-bold text-ink flex items-center gap-1">
                <ShoppingBagIcon size={10} className="text-accent" />
                <span>{order.products?.length || 0}</span>
              </p>
            </div>
          </div>

          <button
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
              open ? "bg-ink text-white rotate-180 shadow-2xs" : "bg-tint text-muted hover:bg-line"
            }`}
            title={open ? "Collapse" : "Expand"}
          >
            <ChevronDownIcon size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}
