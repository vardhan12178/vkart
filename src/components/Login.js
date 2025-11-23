// src/pages/Login.jsx
import React, { useRef, useState } from "react";
import axios from "./axiosInstance";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";

import {
  EyeIcon,
  EyeOffIcon,
  UserIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ShoppingCartIcon,
} from "@heroicons/react/outline";

const currentYear = new Date().getFullYear();
const cx = (...c) => c.filter(Boolean).join(" ");

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// --- Helper Components ---

const FieldError = ({ id, message }) =>
  !message ? null : (
    <motion.p
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      id={id}
      className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-500"
    >
      <ExclamationCircleIcon className="h-4 w-4 shrink-0" /> {message}
    </motion.p>
  );

const Toast = ({ show, kind = "error", children }) => {
  if (!show) return null;
  const isSuccess = kind === "success";
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className={cx(
        "mb-6 flex items-start gap-3 rounded-2xl p-4 text-sm shadow-sm backdrop-blur-md border",
        isSuccess
          ? "bg-emerald-50/80 border-emerald-100 text-emerald-800"
          : "bg-red-50/80 border-red-100 text-red-800"
      )}
      role="status"
    >
      {isSuccess ? (
        <CheckCircleIcon className="h-5 w-5 shrink-0 text-emerald-600" />
      ) : (
        <ExclamationCircleIcon className="h-5 w-5 shrink-0 text-red-600" />
      )}
      <div className="pt-0.5 font-medium">{children}</div>
    </motion.div>
  );
};

export default function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get("redirect") || "/";

  // base login state
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState({ userId: "", password: "" });
  const passRef = useRef(null);

  // 2FA modal state
  const [show2fa, setShow2fa] = useState(false);
  const [twofaCode, setTwofaCode] = useState("");
  const [twofaError, setTwofaError] = useState("");
  const [verifying2fa, setVerifying2fa] = useState(false);
  const [pendingLogin, setPendingLogin] = useState(null);

  const validate = () => {
    const e = { userId: "", password: "" };
    if (!userId.trim()) e.userId = "Please enter your email address.";
    if (!password) e.password = "Please enter your password.";
    setErrors(e);
    return !e.userId && !e.password;
  };

  const onKeyEventCheckCaps = (ev) => {
    if (typeof ev.getModifierState === "function") {
      setCapsOn(!!ev.getModifierState("CapsLock"));
    }
  };

  // ------------ base submit ------------
  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    setLoading(true);
    const start = performance.now();
    try {
      const payload = {
        username: userId.trim(),
        password,
        remember,
      };
      const res = await axios.post("/api/login", payload, {
        withCredentials: true,
      });

      // 2FA required -> open modal
      if (res.data?.require2FA) {
        setPendingLogin(payload);
        setShow2fa(true);
        setTwofaCode("");
        setTwofaError("");
        setLoading(false);
        return;
      }

      // normal login
      if (res.data?.token) localStorage.setItem("auth_token", res.data.token);
      setIsLoggedIn?.(true);
      navigate(redirect);
    } catch (err) {
      const apiMsg = err?.response?.data?.message;
      setFormError(apiMsg || "Invalid credentials. Please try again.");
      const took = performance.now() - start;
      if (took > 15000 && !apiMsg)
        setFormError("Server is waking up. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  // ------------ 2FA verify submit ------------
  const submit2FA = async () => {
    if (!pendingLogin) return;
    const code = twofaCode.trim();
    if (!code || code.length < 6) {
      setTwofaError("Enter the 6-digit code");
      return;
    }
    setVerifying2fa(true);
    setTwofaError("");
    try {
      const verify = await axios.post(
        "/api/login",
        {
          ...pendingLogin,
          token2fa: code,
        },
        { withCredentials: true }
      );
      if (verify.data?.token) localStorage.setItem("auth_token", verify.data.token);
      setIsLoggedIn?.(true);
      setShow2fa(false);
      setPendingLogin(null);
      navigate(redirect);
    } catch (err) {
      const apiMsg = err?.response?.data?.message;
      setTwofaError(apiMsg || "Invalid or expired code. Try again.");
    } finally {
      setVerifying2fa(false);
    }
  };

  // allow Enter inside 2FA input
  const on2faKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit2FA();
    }
  };

  const handleGoogleSuccess = async (cred) => {
    setFormError("");
    setGoogleLoading(true);
    try {
      const res = await axios.post(
        "/auth/google",
        { idToken: cred?.credential, remember },
        { withCredentials: true }
      );
      if (res?.data?.token) localStorage.setItem("auth_token", res.data.token);
      setIsLoggedIn?.(true);
      navigate(redirect);
    } catch (err) {
      const apiMsg = err?.response?.data?.message;
      setFormError(apiMsg || "Google sign-in failed. Try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () =>
    setFormError("Google sign-in was cancelled or failed.");

  return (
    <>
      <Helmet>
        <title>Sign in — VKart</title>
        <meta
          name="description"
          content="Sign in to VKart to shop curated products, track orders, and enjoy fast delivery."
        />
      </Helmet>

      {/* BACKGROUND: Subtle Premium Gradient */}
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F8F9FA] relative overflow-hidden">
        {/* Abstract Background Orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-orange-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-amber-100/40 rounded-full blur-3xl" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="relative w-full max-w-[1100px] h-[650px] lg:h-[750px] bg-white rounded-[32px] shadow-2xl flex overflow-hidden border border-white/50"
        >
          {/* --- LEFT PANEL (Visual) --- */}
          <div className="hidden lg:flex w-1/2 relative flex-col justify-between bg-gradient-to-br from-orange-50 via-white to-amber-50 p-12 overflow-hidden">
            {/* Decorative Patterns */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
                  <ShoppingCartIcon className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold text-gray-900 tracking-tight">VKart.</span>
              </div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-extrabold text-gray-900 leading-[1.15]"
              >
                Experience the <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                  future of shopping.
                </span>
              </motion.h2>
            </div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.4, duration: 0.8 }}
               className="relative z-10 flex-1 flex items-center justify-center"
            >
              <img
                src="/login.webp"
                alt="Shopping Illustration"
                className="max-h-[350px] w-auto object-contain drop-shadow-2xl"
              />
            </motion.div>

            <div className="relative z-10 backdrop-blur-md bg-white/30 p-4 rounded-2xl border border-white/50 shadow-sm">
                {/* <p className="text-sm font-medium text-gray-800">"The best shopping experience I've had in years. Fast, reliable, and premium."</p>
                <div className="flex items-center gap-2 mt-2">
                    <div className="h-6 w-6 rounded-full bg-gray-900 flex items-center justify-center text-[10px] text-white font-bold">A</div>
                    <span className="text-xs text-gray-500">Alex M. — Verified Buyer</span>
                </div> */}
            </div>
          </div>

          {/* --- RIGHT PANEL (Form) --- */}
          <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 relative">
             {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
                <div className="h-10 w-10 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg text-white">
                  <ShoppingCartIcon className="h-6 w-6" />
                </div>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="w-full max-w-sm mx-auto"
            >
              <motion.div variants={fadeInUp} className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
                <p className="mt-2 text-gray-500">Please enter your details to sign in.</p>
              </motion.div>

              {/* Toast / Error Area */}
              <AnimatePresence>
                {formError && <Toast show={!!formError}>{formError}</Toast>}
              </AnimatePresence>

              {/* Google Button */}
              <motion.div variants={fadeInUp} className="mb-6 flex justify-center">
                 <div className="w-full flex justify-center transform transition-transform hover:scale-[1.01]">
                   {googleLoading && (
                      <div className="absolute inset-0 z-10 grid place-items-center bg-white/60 backdrop-blur-[2px] rounded-lg">
                         <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"/>
                      </div>
                   )}
                   <GoogleLogin
                     onSuccess={handleGoogleSuccess}
                     onError={handleGoogleError}
                     ux_mode="popup"
                     theme="outline"
                     size="large"
                     width="380" // Forces full width feel
                     shape="rectangular"
                     text="continue_with"
                   />
                 </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="relative flex items-center gap-4 mb-6">
                 <div className="h-px bg-gray-200 flex-1" />
                 <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">or sign in with email</span>
                 <div className="h-px bg-gray-200 flex-1" />
              </motion.div>

              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                {/* Email Field */}
                <motion.div variants={fadeInUp}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <UserIcon className={cx("h-5 w-5 transition-colors", errors.userId ? "text-red-400" : "text-gray-400 group-focus-within:text-orange-500")} />
                    </div>
                    <input
                      id="userId"
                      type="email"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      onBlur={validate}
                      placeholder="Enter your email"
                      className={cx(
                        "block w-full rounded-xl border bg-gray-50/50 py-3.5 pl-11 pr-4 text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none",
                        errors.userId
                          ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-50/30"
                          : "border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white"
                      )}
                    />
                  </div>
                  <FieldError id="userId-error" message={errors.userId} />
                </motion.div>

                {/* Password Field */}
                <motion.div variants={fadeInUp}>
                  <div className="flex items-center justify-between mb-1.5 ml-1">
                    <label className="text-sm font-semibold text-gray-700">Password</label>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LockClosedIcon className={cx("h-5 w-5 transition-colors", errors.password ? "text-red-400" : "text-gray-400 group-focus-within:text-orange-500")} />
                    </div>
                    <input
                      ref={passRef}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyUp={onKeyEventCheckCaps}
                      onKeyDown={onKeyEventCheckCaps}
                      onBlur={validate}
                      placeholder="••••••••"
                      className={cx(
                        "block w-full rounded-xl border bg-gray-50/50 py-3.5 pl-11 pr-12 text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none",
                        errors.password
                          ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-50/30"
                          : "border-gray-200 hover:border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {capsOn && (
                     <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:"auto"}} className="mt-2 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block">
                        ⚠️ Caps Lock is ON
                     </motion.div>
                  )}
                  <FieldError id="password-error" message={errors.password} />
                </motion.div>

                {/* Remember & Forgot */}
                <motion.div variants={fadeInUp} className="flex items-center justify-between">
                   <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                         type="checkbox" 
                         checked={remember} 
                         onChange={(e)=>setRemember(e.target.checked)}
                         className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Remember for 30 days</span>
                   </label>
                   <button 
                      type="button" 
                      onClick={() => navigate("/forgot-password")}
                      className="text-sm font-semibold text-orange-600 hover:text-orange-500 hover:underline decoration-2 underline-offset-2 transition-all"
                   >
                     Forgot password?
                   </button>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  variants={fadeInUp}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                     {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                     {loading ? "Signing in..." : "Sign In"}
                  </span>
                </motion.button>
              </form>

              <motion.div variants={fadeInUp} className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className="font-bold text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    Create account
                  </button>
                </p>
              </motion.div>
            </motion.div>

            {/* Footer Links */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 text-xs text-gray-400">
               {/* <a href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
               <a href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</a> */}
            </div>
          </div>
        </motion.div>
      </div>

      {/* 2FA MODAL (Enhanced) */}
      <AnimatePresence>
        {show2fa && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm rounded-3xl bg-white shadow-2xl p-8 relative overflow-hidden"
            >
               {/* Decorative background blur inside modal */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

              <button
                onClick={() => {
                  setShow2fa(false);
                  setTwofaCode("");
                  setTwofaError("");
                }}
                className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 text-3xl">
                  🔐
                </div>
                <h2 className="text-xl font-bold text-gray-900">Two-Step Verification</h2>
                <p className="text-sm text-gray-500 mt-2 px-2">
                  We sent a secure code to your authenticator app. Please enter it below.
                </p>

                <div className="w-full mt-6">
                  <input
                    autoFocus
                    value={twofaCode}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setTwofaCode(v);
                      setTwofaError("");
                    }}
                    onKeyDown={on2faKeyDown}
                    placeholder="000 000"
                    inputMode="numeric"
                    className="w-full text-center text-3xl font-bold tracking-[0.5em] text-gray-800 border-b-2 border-gray-200 py-4 focus:border-orange-500 focus:outline-none bg-transparent transition-colors placeholder:text-gray-200"
                  />
                  
                  {twofaError && (
                    <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="mt-3 flex items-center justify-center gap-1.5 text-xs text-red-500 font-medium">
                      <ExclamationCircleIcon className="h-4 w-4" /> {twofaError}
                    </motion.div>
                  )}
                  
                  <div className="mt-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                     Code refreshes every 30s
                  </div>
                </div>

                <button
                  onClick={submit2FA}
                  disabled={verifying2fa}
                  className="w-full mt-8 rounded-xl bg-gray-900 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {verifying2fa ? "Verifying..." : "Verify Code"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}