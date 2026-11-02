import React from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/outline";
import StatusPill from "../ui/StatusPill";
import { isExpired } from "./couponUtils";

// Active / Expired / Inactive pill plus the "Public" tag. Clicking toggles active when allowed.
export default function CouponStatus({ coupon: c, canWrite, onToggle }) {
  const live = c.isActive && !isExpired(c.validTo);
  const pills = (
    <>
      {live ? (
        <StatusPill tone="ok" icon={CheckCircleIcon}>
          Active
        </StatusPill>
      ) : (
        <StatusPill tone="off" icon={XCircleIcon}>
          {isExpired(c.validTo) ? "Expired" : "Inactive"}
        </StatusPill>
      )}
      {c.isPublic && <StatusPill tone="info">Public</StatusPill>}
    </>
  );
  if (!canWrite) return <div className="inline-flex items-center gap-1">{pills}</div>;
  return (
    <button
      type="button"
      onClick={() => onToggle(c)}
      className="inline-flex items-center gap-1"
      title={c.isActive ? "Deactivate" : "Activate"}
    >
      {pills}
    </button>
  );
}
