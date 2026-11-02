import React, { useState } from "react";
import axios from "../axiosInstance";
import OrderModal, { reasonInputClass } from "./OrderModal";
import RefundOptions from "./RefundOptions";

export default function ReturnModal({ orderId, onClose }) {
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("ORIGINAL");
  const [returnType, setReturnType] = useState("REFUND");

  const submit = async () => {
    setBusy(true);
    try {
      await axios.post(`/api/orders/${orderId}/return`, { reason, returnType, refundMethod });
      window.location.reload();
    } catch {
      alert("Return request failed.");
    } finally {
      setBusy(false);
      onClose();
    }
  };

  return (
    <OrderModal title="Request Return / Replacement" onClose={onClose}>
      <div>
        <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
          Reason for Return
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain the issue with the item..."
          className={reasonInputClass}
          rows={3}
        />
      </div>
      <div>
        <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">
          Return Type
        </label>
        <div className="flex items-center gap-4 text-xs">
          {[
            ["REFUND", "Refund"],
            ["REPLACEMENT", "Replacement"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="radio"
                checked={returnType === key}
                onChange={() => setReturnType(key)}
                className="text-accent"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {returnType === "REFUND" && <RefundOptions value={refundMethod} onChange={setRefundMethod} />}

      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-xl border border-line-strong text-xs font-bold text-ink-soft hover:bg-sand"
        >
          Cancel
        </button>
        <button
          disabled={busy || reason.trim().length < 3}
          onClick={submit}
          className="px-4 py-1.5 rounded-xl bg-ink text-white text-xs font-bold hover:bg-black transition disabled:opacity-50"
        >
          {busy ? "Submitting..." : "Submit Return"}
        </button>
      </div>
    </OrderModal>
  );
}
