import React, { useState, useEffect } from "react";
import CancelModal from "./orders/CancelModal";
import OrderDetails from "./orders/OrderDetails";
import OrderSummaryRow from "./orders/OrderSummaryRow";
import ReturnModal from "./orders/ReturnModal";

export default function OrderCard({ order, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [showReturn, setShowReturn] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  return (
    <div
      className={`group relative rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden ${
        open
          ? "bg-white border-line-strong shadow-sm"
          : "bg-white border-line-strong/80 shadow-2xs hover:border-line-strong hover:shadow-xs"
      }`}
    >
      <OrderSummaryRow order={order} open={open} onToggle={() => setOpen(!open)} />
      {open && (
        <OrderDetails
          order={order}
          onReturn={() => setShowReturn(true)}
          onCancel={() => setShowCancel(true)}
        />
      )}
      {showReturn && <ReturnModal orderId={order._id} onClose={() => setShowReturn(false)} />}
      {showCancel && <CancelModal orderId={order._id} onClose={() => setShowCancel(false)} />}
    </div>
  );
}
