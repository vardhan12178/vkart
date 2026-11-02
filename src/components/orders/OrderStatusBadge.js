import React from "react";
import { stageStyles } from "./orderStyles";

// Refund / return / stage pill. `mobile` is the compact variant shown under the title on phones.
export default function OrderStatusBadge({ order, mobile }) {
  const stage = order.stage || "PLACED";
  const style = stageStyles[stage] || stageStyles.PLACED;
  const hasReturn = order.returnStatus && order.returnStatus !== "NONE";
  const hasRefund = order.refundStatus && order.refundStatus !== "NONE";
  const size = mobile ? "px-2 py-0.5 text-[9px]" : "hidden sm:inline-flex px-2 py-0.5 text-[10px]";
  const base = `inline-flex items-center rounded-full font-bold uppercase tracking-wider ${size}`;
  if (hasRefund) {
    return (
      <span className={`${base} bg-ok/10 text-ok border border-ok/30`}>
        Refund {order.refundStatus}
      </span>
    );
  }
  if (hasReturn) {
    return (
      <span className={`${base} bg-accent/10 text-accent border border-accent/30`}>
        Return {order.returnStatus}
      </span>
    );
  }
  return (
    <span
      className={`${base} ${mobile ? "gap-1" : "gap-1.5 px-2.5"} border ${style.border} ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {stage.replace(/_/g, " ")}
    </span>
  );
}
