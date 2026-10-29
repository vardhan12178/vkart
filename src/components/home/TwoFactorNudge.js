import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, X } from "lucide-react";
import axios from "../axiosInstance";
import { qk } from "../../query/queryKeys";

// "Protect your account" reminder for signed-in users without 2FA (same behaviour as the one in Home.js).
export default function TwoFactorNudge() {
  const profile = useSelector((state) => state.auth.user);
  const queryClient = useQueryClient();
  const [hidden, setHidden] = useState(false);

  const dismissMutation = useMutation({
    mutationFn: async () => axios.post("/api/2fa/suppress", {}, { withCredentials: true, __skipAuthRedirect: true }),
    onSuccess: () => {
      queryClient.setQueryData(qk.profile.root, (previous) => (previous ? { ...previous, suppress2faPrompt: true } : previous));
    },
  });

  const show = profile && !profile.twoFactorEnabled && !profile.suppress2faPrompt && !hidden;

  const dismiss = async () => {
    setHidden(true);
    const persist = process.env.NODE_ENV === "production" || process.env.REACT_APP_PERSIST_2FA_NUDGE === "true";
    if (!persist || !profile?._id) return;
    try {
      await dismissMutation.mutateAsync();
    } catch {
      // Non-blocking; the nudge stays dismissed locally.
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 flex gap-3 rounded-[1.15rem] border border-black/10 bg-[#fffdf8]/95 p-4 shadow-[0_20px_55px_rgba(29,28,25,.18)] backdrop-blur-xl sm:left-6 sm:right-auto sm:w-[min(26rem,calc(100vw-3rem))] sm:gap-4 sm:p-5"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1d1c19] text-white sm:h-11 sm:w-11">
            <ShieldCheck size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="pr-5 text-sm font-bold leading-5 text-[#1d1c19]">Protect your account</h3>
            <p className="mt-1 text-xs leading-5 text-[#706c63]">Enable two-factor authentication for a safer account.</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link to="/profile" className="text-xs font-bold text-[#925033] underline decoration-[#925033]/30 underline-offset-4">Enable 2FA</Link>
              <button type="button" onClick={dismiss} className="text-xs font-semibold text-[#858177]">Maybe later</button>
            </div>
          </div>
          <button type="button" onClick={dismiss} aria-label="Dismiss security suggestion"
            className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full text-[#858177] transition-colors hover:bg-black/[0.05] hover:text-black">
            <X size={17} />
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
