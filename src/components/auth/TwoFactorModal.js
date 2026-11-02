import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleAlert, Lock, X } from "lucide-react";

// Six-digit authenticator prompt shown when a login needs two-factor verification.
export default function TwoFactorModal({
  open,
  code,
  error,
  verifying,
  onChange,
  onSubmit,
  onClose,
}) {
  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="twofa-title"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-sm rounded-2xl sm:rounded-3xl bg-white shadow-2xl p-6 sm:p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

            <button
              onClick={onClose}
              className="absolute right-4 sm:right-5 top-4 sm:top-5 text-gray-400 hover:text-gray-600 transition-colors z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
            </button>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
                <Lock className="h-7 w-7 text-orange-600" aria-hidden="true" />
              </div>
              <h2 id="twofa-title" className="text-lg sm:text-xl font-bold text-gray-900">
                Two-Step Verification
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-2 px-2">
                We sent a secure code to your authenticator app. Please enter it below.
              </p>

              <div className="w-full mt-6">
                <input
                  autoFocus
                  value={code}
                  onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={onKeyDown}
                  placeholder="000 000"
                  inputMode="numeric"
                  aria-label="Six-digit verification code"
                  className="w-full text-center text-2xl sm:text-3xl font-bold tracking-[0.3em] sm:tracking-[0.5em] text-gray-800 border-b-2 border-gray-200 py-3 sm:py-4 focus:border-orange-500 focus:outline-none bg-transparent transition-colors placeholder:text-gray-200"
                />

                {error && (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-center justify-center gap-1.5 text-xs text-red-500 font-medium"
                  >
                    <CircleAlert className="h-4 w-4" /> {error}
                  </motion.div>
                )}

                <div className="mt-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  Code refreshes every 30s
                </div>
              </div>

              <button
                onClick={onSubmit}
                disabled={verifying}
                className="w-full mt-6 sm:mt-8 rounded-xl bg-gray-900 py-3 sm:py-3.5 text-sm font-bold text-white shadow-lg hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {verifying ? "Verifying..." : "Verify Code"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
