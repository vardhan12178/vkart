import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import FieldError from "../ui/FieldError";
import { cx } from "../../utils/cx";
import { fadeInUp } from "./authMotion";

// A labelled input with a leading icon, inline validation and an optional trailing control.
// `compact` is the smaller register-form sizing. `below` renders under the input (hints, strength).
export default function AuthField({
  id,
  label,
  icon: Icon,
  error,
  touched,
  errorId,
  compact = false,
  trailing = null,
  below = null,
  inputRef,
  ...inputProps
}) {
  const invalid = Boolean(error && touched);
  const padRight = trailing ? (compact ? "pr-10 sm:pr-12" : "pr-12 sm:pr-14") : "pr-4";

  return (
    <motion.div variants={fadeInUp}>
      <label
        htmlFor={id}
        className={cx(
          "block text-gray-700 ml-1",
          compact ? "text-xs font-bold mb-1" : "text-sm font-semibold mb-1.5"
        )}
      >
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
          <Icon
            className={cx(
              "transition-colors",
              compact ? "h-4 w-4" : "h-5 w-5",
              invalid ? "text-red-400" : "text-gray-400 group-focus-within:text-orange-500"
            )}
          />
        </div>
        <input
          id={id}
          ref={inputRef}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId || `${id}-error` : undefined}
          {...inputProps}
          className={cx(
            "block w-full rounded-xl border bg-gray-50/50 text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none",
            compact
              ? "py-2.5 pl-9 sm:pl-10 text-sm"
              : "py-3 sm:py-3.5 pl-10 sm:pl-11 text-sm sm:text-base",
            padRight,
            invalid
              ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
              : "border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white"
          )}
        />
        {trailing}
      </div>
      {below}
      {touched && <FieldError compact={compact} id={errorId || `${id}-error`} message={error} />}
    </motion.div>
  );
}

// Password input with a show/hide toggle.
export function PasswordField({ compact = false, icon, ...props }) {
  const [shown, setShown] = useState(false);
  const Glyph = shown ? EyeOff : Eye;

  return (
    <AuthField
      {...props}
      icon={icon}
      compact={compact}
      type={shown ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setShown(!shown)}
          className={cx(
            "absolute inset-y-0 right-0 flex items-center justify-center text-gray-400 hover:text-gray-600 focus:outline-none min-w-[44px] min-h-[44px]",
            compact ? "pr-3" : "pr-3 sm:pr-4"
          )}
          aria-label={shown ? "Hide password" : "Show password"}
        >
          <Glyph className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </button>
      }
    />
  );
}
