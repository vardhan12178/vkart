import React from "react";
import { motion } from "framer-motion";
import { CircleAlert } from "lucide-react";
import { cx } from "../../utils/cx";

// Validation message under a form field. Pass the same `id` you reference in aria-describedby.
export default function FieldError({ id, message, compact = false }) {
  if (!message) return null;
  return (
    <motion.p
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      id={id}
      className={cx(
        "flex items-center font-medium text-red-500",
        compact ? "mt-1 gap-1 text-[10px]" : "mt-1.5 gap-1.5 text-xs"
      )}
    >
      <CircleAlert className={cx("shrink-0", compact ? "h-3 w-3" : "h-4 w-4")} /> {message}
    </motion.p>
  );
}
