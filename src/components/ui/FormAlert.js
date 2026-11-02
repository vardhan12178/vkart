import React from "react";
import { motion } from "framer-motion";
import { CircleAlert, CircleCheck } from "lucide-react";
import { cx } from "../../utils/cx";

// Inline success/error banner shown above the auth forms. `compact` is the smaller variant
// used where space is tight (the register form).
export default function FormAlert({ show, kind = "error", compact = false, children }) {
  if (!show) return null;
  const isSuccess = kind === "success";
  const Icon = isSuccess ? CircleCheck : CircleAlert;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className={cx(
        "flex items-start gap-3 shadow-sm backdrop-blur-md border",
        compact ? "mb-4 rounded-xl p-3 text-xs" : "mb-6 rounded-2xl p-4 text-sm",
        isSuccess
          ? "bg-emerald-50/80 border-emerald-100 text-emerald-800"
          : "bg-red-50/80 border-red-100 text-red-800"
      )}
      role="status"
    >
      <Icon
        className={cx(
          "shrink-0",
          compact ? "h-4 w-4" : "h-5 w-5",
          isSuccess ? "text-emerald-600" : "text-red-600"
        )}
      />
      <div className="pt-0.5 font-medium">{children}</div>
    </motion.div>
  );
}
