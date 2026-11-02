import React from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/outline";
import StatusPill from "../ui/StatusPill";
import { isLive } from "./saleUtils";

const AMBER = "text-amber-700 bg-amber-50 border border-amber-100";

export default function SaleStatus({ sale }) {
  if (isLive(sale)) {
    return (
      <StatusPill tone="ok" icon={CheckCircleIcon}>
        Live
      </StatusPill>
    );
  }
  if (sale.isActive) {
    return (
      <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${AMBER}`}>
        Scheduled
      </span>
    );
  }
  return (
    <StatusPill tone="off" icon={XCircleIcon}>
      Inactive
    </StatusPill>
  );
}
