import React, { useState } from "react";
import axios from "../axiosInstance";
import OrderModal, { reasonInputClass } from "./OrderModal";
import RefundOptions from "./RefundOptions";

export default function CancelModal({ orderId, onClose }) {
  const [reason, setReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("ORIGINAL");

  const confirm = async () => {
    try {
      await axios.post(`/api/orders/${orderId}/cancel`, { reason, refundMethod });
      window.location.reload();
    } catch {
      alert("Cancellation failed.");
    } finally {
      onClose();
    }
  };

  return (
    <OrderModal title="Cancel Order" onClose={onClose}>
      <div>
        <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
          Reason for Cancellation
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why do you wish to cancel this order?"
          className={reasonInputClass}
          rows={3}
        />
      </div>
      <RefundOptions value={refundMethod} onChange={setRefundMethod} />
      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-xl border border-line-strong text-xs font-bold text-ink-soft hover:bg-sand"
        >
          Close
        </button>
        <button
          disabled={reason.trim().length < 3}
          onClick={confirm}
          className="px-4 py-1.5 rounded-xl bg-alert text-white text-xs font-bold hover:bg-alert transition disabled:opacity-50"
        >
          Confirm Cancel
        </button>
      </div>
    </OrderModal>
  );
}
