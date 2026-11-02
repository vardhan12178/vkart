import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "./axiosInstance";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock as LockClosedIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowLeft as ArrowLeftIcon,
} from "lucide-react";
import { Dots } from "./ui/Skeleton";
import FormAlert from "./ui/FormAlert";
import FieldError from "./ui/FieldError";
import PasswordStrength from "./ui/PasswordStrength";
import { cx } from "../utils/cx";
const currentYear = new Date().getFullYear();

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const redirectTimer = useRef(null);
  useEffect(() => () => clearTimeout(redirectTimer.current), []);
  const { search } = useLocation();
  const token = useMemo(() => new URLSearchParams(search).get("token") || "", [search]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [errors, setErrors] = useState({ password: "", confirm: "" });

  const validate = () => {
    const e = { password: "", confirm: "" };
    if (!password || password.length < 8) e.password = "Use at least 8 characters.";
    if (!confirm) e.confirm = "Please confirm your password.";
    if (!e.password && !e.confirm && password !== confirm) e.confirm = "Passwords do not match.";
    setErrors(e);
    return !e.password && !e.confirm;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setOkMsg("");
    setErrMsg("");
    if (!token) {
      setErrMsg("Missing or invalid reset link.");
      return;
    }
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/reset", {
        token,
        password,
        confirmPassword: confirm,
      });
      setOkMsg(data?.message || "Password reset successful.");
      redirectTimer.current = setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const msg = err?.response?.data?.message || "Reset failed. Try again or request a new link.";
      setErrMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password — VKart</title>
        <meta name="description" content="Reset your VKart account password." />
      </Helmet>

      {/* BACKGROUND */}
      <div className="premium-page premium-auth premium-auth-compact min-h-screen w-full flex items-center justify-center p-4 bg-[#f6f3ed] relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-orange-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-amber-100/40 rounded-full blur-3xl" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="relative w-full max-w-[480px] bg-white rounded-[32px] shadow-2xl border border-white/50 overflow-hidden"
        >
          <div className="px-8 py-12 sm:px-10">
            {/* Logo & Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="h-12 w-12 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
                  <ShoppingCartIcon className="h-7 w-7" />
                </div>
              </div>
              <motion.h1
                variants={fadeInUp}
                className="text-2xl font-extrabold text-gray-900 tracking-tight"
              >
                Reset Password
              </motion.h1>
              <motion.p variants={fadeInUp} className="mt-2 text-sm text-gray-500">
                Enter your new password below.
              </motion.p>
            </div>

            {/* Notifications */}
            <AnimatePresence>
              {(okMsg || errMsg) && (
                <FormAlert show={true} kind={okMsg ? "success" : "error"}>
                  {okMsg || errMsg}
                </FormAlert>
              )}
            </AnimatePresence>

            <motion.form
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              onSubmit={onSubmit}
              className="space-y-5"
              noValidate
            >
              {/* New Password */}
              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className={cx(
                      "block w-full rounded-xl border bg-gray-50/50 py-3.5 pl-11 pr-12 text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none",
                      errors.password
                        ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                        : "border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPwd ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
                <FieldError id="password-error" message={errors.password} />
              </motion.div>

              {/* Confirm Password */}
              <motion.div variants={fadeInUp}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    className={cx(
                      "block w-full rounded-xl border bg-gray-50/50 py-3.5 pl-11 pr-12 text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none",
                      errors.confirm
                        ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                        : "border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirm ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <FieldError id="confirm-error" message={errors.confirm} />
              </motion.div>

              {/* Submit Button */}
              <motion.button
                variants={fadeInUp}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-4"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading && <Dots />}
                  {loading ? "Updating Password..." : "Update Password"}
                </span>
              </motion.button>
            </motion.form>

            {/* Footer */}
            <motion.div variants={fadeInUp} className="mt-8 text-center">
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Sign In
              </button>
            </motion.div>

            <div className="mt-8 text-center">
              <p className="text-[10px] text-gray-400">
                © {currentYear} VKart Inc. Secure System.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
