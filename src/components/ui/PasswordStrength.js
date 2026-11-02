import React from "react";
import { motion } from "framer-motion";
import { CircleCheck } from "lucide-react";
import { cx } from "../../utils/cx";

// Five-point password checklist with a strength bar (register and reset-password forms).
export default function PasswordStrength({ password, compact = false }) {
  if (!password) return null;

  const checks = [
    { label: "8+ chars", test: password.length >= 8 },
    { label: "Uppercase", test: /[A-Z]/.test(password) },
    { label: "Lowercase", test: /[a-z]/.test(password) },
    { label: "Number", test: /[0-9]/.test(password) },
    { label: "Special", test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  const passed = checks.filter((c) => c.test).length;
  const strengthColor =
    passed === 5 ? "bg-emerald-500" : passed >= 3 ? "bg-amber-500" : "bg-red-500";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className={compact ? "mt-2 space-y-1.5" : "mt-3 space-y-2"}
    >
      <div
        className={cx(
          "flex w-full overflow-hidden rounded-full bg-gray-100",
          compact ? "h-1" : "h-1.5"
        )}
      >
        <div
          className={`h-full transition-all duration-500 ${strengthColor}`}
          style={{ width: `${(passed / 5) * 100}%` }}
        />
      </div>
      <div className={cx("flex flex-wrap", compact ? "gap-1.5" : "gap-2")}>
        {checks.map((check) => (
          <div
            key={check.label}
            className={cx(
              "flex items-center gap-1 border rounded font-medium",
              compact ? "text-[9px] px-1 py-0.5" : "text-[10px] px-1.5 py-0.5",
              check.test
                ? "text-emerald-700 border-emerald-200 bg-emerald-50"
                : "text-gray-400 border-gray-100 bg-gray-50"
            )}
          >
            {check.test && <CircleCheck className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />}
            {check.label}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
