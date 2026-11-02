import React, { useState } from "react";
import axios from "./axiosInstance";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail as MailIcon,
  ArrowLeft as ArrowLeftIcon,
  ShoppingCart as ShoppingCartIcon,
} from "lucide-react";
import { Dots } from "./ui/Skeleton";
import FormAlert from "./ui/FormAlert";
const currentYear = new Date().getFullYear();

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setOkMsg("");
    setErrMsg("");
    const v = value.trim();
    if (!v) {
      setErrMsg("Please enter your email or username.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post("/api/forgot", { emailOrUsername: v });
      setOkMsg(data?.message || "If an account exists, a reset link was sent.");
    } catch (err) {
      const msg = err?.response?.data?.message || "Something went wrong. Try again.";
      setErrMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password — VKart</title>
        <meta name="description" content="Recover your VKart account access." />
      </Helmet>

      {/* BACKGROUND */}
      <div className="premium-page premium-auth premium-auth-compact min-h-screen w-full flex items-center justify-center p-4 bg-[#f6f3ed] relative overflow-hidden">
        {/* Abstract Orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-orange-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-amber-100/40 rounded-full blur-3xl" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="relative w-full max-w-[480px] bg-white rounded-[32px] shadow-2xl border border-white/50 overflow-hidden"
        >
          <div className="px-8 py-12 sm:px-10">
            {/* Header with Logo */}
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
                Forgot password?
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="mt-2 text-sm text-gray-500 leading-relaxed px-4"
              >
                Enter your email or username and we'll send you a link to reset your password.
              </motion.p>
            </div>

            {/* Toast Notifications */}
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
              <motion.div variants={fadeInUp}>
                <label
                  htmlFor="emailOrUsername"
                  className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1"
                >
                  Email or Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MailIcon className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    id="emailOrUsername"
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="you@example.com"
                    className="block w-full rounded-xl border bg-gray-50/50 py-3.5 pl-11 pr-4 text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white"
                    autoComplete="username email"
                    required
                  />
                </div>
              </motion.div>

              <motion.button
                variants={fadeInUp}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-2"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading && <Dots />}
                  {loading ? "Sending Link..." : "Send Reset Link"}
                </span>
              </motion.button>
            </motion.form>

            {/* Footer Actions */}
            <motion.div
              variants={fadeInUp}
              className="mt-8 flex flex-col items-center gap-4 text-sm"
            >
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Sign In
              </button>

              <div className="w-full h-px bg-gray-100" />

              <p className="text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="font-bold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  Create Account
                </button>
              </p>
            </motion.div>

            <div className="mt-8 text-center">
              <p className="text-[10px] text-gray-400">© {currentYear} VKart Inc.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
