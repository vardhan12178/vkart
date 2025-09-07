import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import OrderStages from "./OrderStages";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(n) || 0));

const statusMeta = {
  Delivered: { cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  "Out for Delivery": { cls: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" },
  Shipped: { cls: "bg-blue-50 text-blue-700 ring-blue-200", dot: "bg-blue-500" },
  Shipping: { cls: "bg-orange-50 text-orange-700 ring-orange-200", dot: "bg-orange-500" },
  Pending: { cls: "bg-gray-50 text-gray-700 ring-gray-200", dot: "bg-gray-500" },
};

export default function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("Pending");

  useEffect(() => {
    const createdAt = moment(order.createdAt);
    const hours = moment().diff(createdAt, "hours");
    const days = moment().diff(createdAt, "days");
    if (hours >= 72) setCurrentStatus("Delivered");
    else if (days >= 2) setCurrentStatus("Out for Delivery");
    else if (days >= 1) setCurrentStatus("Shipped");
    else if (hours >= 4) setCurrentStatus("Shipping");
    else setCurrentStatus("Pending");
  }, [order.createdAt]);

  const first = order.products?.[0] || {};
  const meta = statusMeta[currentStatus] || statusMeta.Pending;
  const orderDate = useMemo(() => moment(order.createdAt).format("MMM D, YYYY • h:mm A"), [order.createdAt]);

  return (
    <div className="rounded-3xl bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 ring-1 ring-gray-200 shadow-xl hover:shadow-2xl transition overflow-hidden">
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <div className="p-[1px] rounded-2xl bg-gradient-to-br from-orange-200 via-amber-200 to-white">
            <div className="size-16 grid place-items-center bg-white rounded-[14px] overflow-hidden">
              <img
                src={first.image}
                alt="Order thumbnail"
                className="object-contain w-full h-full"
                loading="lazy"
                onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/80?text=Item")}
              />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900 truncate">Order #{order._id}</h3>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${meta.cls}`}>
                <span className={`size-1.5 rounded-full ${meta.dot}`} />
                {currentStatus}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{orderDate}</p>
          </div>
        </div>

        <div className="sm:ml-auto flex flex-wrap items-center gap-2">
          <InfoPill label="Items" value={order.products?.length || 0} />
          <InfoPill label="Total" value={INR(order.totalPrice)} />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-white text-sm font-semibold shadow hover:opacity-95 active:scale-[0.98] transition"
            aria-expanded={open}
          >
            {open ? "Hide Details" : "View Details"}
          </button>
        </div>
      </div>

      <div className={`px-5 pb-5 ${open ? "block" : "hidden"}`}>
        <div className="mt-5 rounded-2xl ring-1 ring-gray-200 p-5 bg-white">
          <h4 className="text-lg font-extrabold text-gray-900">Order Details</h4>
          <p className="mt-2 text-sm text-gray-700 leading-relaxed">{order.shippingAddress}</p>
          <h5 className="mt-5 text-sm font-semibold text-gray-900">Products</h5>
          <div className="mt-3 grid gap-3">
            {order.products.map((p, i) => (
              <div key={i} className="flex items-start gap-4 rounded-xl ring-1 ring-gray-100 p-3">
                <div className="size-16 grid place-items-center rounded-lg bg-white ring-1 ring-gray-100 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="object-contain w-full h-full"
                    loading="lazy"
                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/64?text=Img")}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                  <div className="mt-0.5 text-xs text-gray-600">Qty: {p.quantity}</div>
                </div>
                <div className="text-sm font-bold text-gray-900">{INR(p.price)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <OrderStages currentStage={currentStatus} />
        </div>
      </div>
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-white/60 backdrop-blur ring-1 ring-gray-200 text-gray-800 shadow-sm">
      <span className="text-[11px] uppercase tracking-wide text-gray-500">{label}</span>
      <span className="text-sm font-extrabold">{value}</span>
    </div>
  );
}
